global.window = {};
require(process.cwd() + '/data.js');
var out = [];
global.document = {
  getElementById: function(){ return {innerHTML:'', appendChild:function(){}, addEventListener:function(){}, textContent:'', value:'', querySelectorAll:function(){return[]}}; },
  querySelectorAll: function(){ return []; },
  addEventListener: function(){},
  body: { classList: { toggle:function(){}, contains:function(){return false} } },
  documentElement: { setAttribute:function(){}, getAttribute:function(){return null} },
  createElement: function(){ return {className:'', scrollIntoView:function(){}, querySelectorAll:function(){return[]}, querySelector:function(){return{appendChild:function(){}}}, appendChild:function(){}, set innerHTML(v){ this._h=v; out.push(v); }, get innerHTML(){return this._h||''} }; }
};
var src = require('fs').readFileSync(process.cwd() + '/app.js','utf8')
          .replace('})();', 'window.__answer = answer; })();');
eval(src);
var Qs = [
 ["How do I create my call sheet?","three ways"],
 ["Where do I find my call sheet?","Personalized Class Answers"],
 ["I have a problem with my call sheet","get your call sheet sorted"],
 ["my call sheet is missing","get your call sheet sorted"],
 ["How do I apply for a grant?","Application Class"],
 ["Where do I start?","roadmap"],
 ["What classes are on this week?","Live this week"],
 ["Where do I find the replays?","Class Replays"],
 ["I need help with car repair","Here is everything we have on this"],
 ["How do I cancel my subscription?","cancel"],
 ["banana","Bring it to Matthew"]
];
var pass = 0;
Qs.forEach(function(p){
  out.length = 0;
  window.__answer(p[0]);
  var html = out.join(' ');
  var h3 = (html.match(/<h3>(.*?)<\/h3>/)||[,'(none)'])[1].replace(/<[^>]+>/g,'');
  var ok = p[1] === '' ? /not sure/i.test(h3) : new RegExp(p[1],'i').test(html);
  if (ok) pass++;
  console.log((ok?'PASS':'FAIL'), '|', p[0].padEnd(36), '=>', h3.slice(0,46));
});
console.log('\n' + pass + '/' + Qs.length + ' passing');

// stage-awareness regressions
console.log('\n--- stage awareness ---');
[["I created all my call sheets. What do I do next?","Application Class"],
 ["I've done my call sheet, what now?","Application Class"],
 ["How do I create my call sheet?","Three ways"],
 ["I finished the welcome tour, what next?","call sheet"],
 ["I applied already, what now?","stay organised"]].forEach(function(p){
  out.length=0; window.__answer(p[0]);
  var html=out.join(' ');
  var h3=(html.match(/<h3>(.*?)<\/h3>/)||[,'(none)'])[1].replace(/<[^>]+>/g,'');
  var ok=new RegExp(p[1],'i').test(html);
  console.log((ok?'PASS':'FAIL'),'|',p[0].padEnd(44),'=>',h3.slice(0,44));
});

// no exit-route suggestions
console.log('\n--- related-topic safety ---');
var EXIT=/cancel|refund|unsubscrib/i, bad=0;
["Where do I find the replays?","How do I join the Zoom?","What classes are on this week?",
 "Can I talk to a real person?","I can't log in","How do I stop the emails?",
 "How do I create my call sheet?","Where do I start?","help with rent"].forEach(function(q){
  out.length=0; window.__answer(q);
  var html=out.join(' ');
  var rel=(html.match(/<div class="rel">[\s\S]*?<\/div>\s*<\/div>/)||[''])[0];
  var hit=EXIT.test(rel);
  if(hit) bad++;
  console.log((hit?'FAIL':'PASS'),'|',q);
});
console.log(bad===0 ? '\nNo exit routes suggested anywhere.' : '\n'+bad+' leaks!');

console.log('\n--- cancel answer ---');
out.length=0; window.__answer("How do I cancel my subscription?");
var c=out.join(' ');
[["plain heading",/How to cancel/],["recurly link",/href="https:\/\/leskohelp\.recurly\.com"/],
 ["paypal link",/href="https:\/\/www\.paypal\.com"/],["clickbank link",/clkbank\.com/],
 ["mailto",/href="mailto:leskohelp@gmail\.com"/],
 ["no 'last resort'",/last resort/i],["no trial line",/5 days|19\.95/],
 ["no login in related",/log ?in|which .{0,12}site/i],["no call sheet in related",/call sheet/i]
].forEach(function(p){
  var found=p[1].test(c);
  var want=p[0].indexOf('no ')===0 ? !found : found;
  console.log((want?'PASS':'FAIL'),'|',p[0]);
});

console.log('\n--- from the welcome tour transcripts ---');
[["What is the difference between a call sheet and a quick guide?","local and federal"],
 ["I can only get in on my phone, how do I log in on my computer?","computer"],
 ["How do I keep track of my questions?","track of your questions"],
 ["How do I ask a good question?","good answer"],
 ["I keep calling and getting no results","20 phone call"],
 ["I have so many problems I am overwhelmed","needs fixing at once"]].forEach(function(p){
  out.length=0; window.__answer(p[0]);
  var html=out.join(' ');
  var h3=(html.match(/<h3>(.*?)<\/h3>/)||[,'(none)'])[1].replace(/<[^>]+>/g,'');
  var ok=new RegExp(p[1],'i').test(html);
  console.log((ok?'PASS':'FAIL'),'|',p[0].slice(0,46).padEnd(48),'=>',h3.slice(0,40));
});

console.log('\n--- login (current onboarding) ---');
[["I can't log in","email address you used when you bought"],
 ["I forgot my password","Forgot password"],
 ["It says no account found","paid with"],
 ["How do I sign in on my computer?","computer"]].forEach(function(p){
  out.length=0; window.__answer(p[0]);
  var html=out.join(' ');
  var h3=(html.match(/<h3>(.*?)<\/h3>/)||[,'(none)'])[1].replace(/<[^>]+>/g,'');
  var ok=new RegExp(p[1],'i').test(html);
  console.log((ok?'PASS':'FAIL'),'|',p[0].padEnd(34),'=>',h3.slice(0,34));
});
var all=out.join(' ');
console.log((/google|facebook/i.test(all)?'FAIL':'PASS'),'| no Google/Facebook sign-in claim');

console.log('\n--- one event only ---');
[["When is the Welcome Tour?","Welcome Tour","Every day"],
 ["what time is the matthew meetup","Matthew Meetup","Tuesday"],
 ["when is the drop-in clinic","Drop-In Clinic","Thursday"],
 ["when is the AI workshop","AI Workshop","Friday"],
 ["when is open office","Open Office","Monday"]].forEach(function(p){
  out.length=0; window.__answer(p[0]);
  var html=out.join(' ');
  var h3=(html.match(/<h3>(.*?)<\/h3>/)||[,'?'])[1].replace(/<[^>]+>/g,'');
  var rows=(html.match(/<tr>/g)||[]).length;
  var ok=new RegExp(p[1],'i').test(h3) && new RegExp(p[2],'i').test(html) && rows<=2;
  console.log((ok?'PASS':'FAIL'),'|',p[0].padEnd(32),'=>',h3.slice(0,30),'| rows:',rows);
});
out.length=0; window.__answer("What classes are on this week?");
var wk=(out.join(' ').match(/<tr>/g)||[]).length;
console.log((wk>10?'PASS':'FAIL'),'| full week still lists everything (rows:',wk+')');

console.log('\n--- related must actually relate ---');
var UNRELATED = {
  "Where do I find the replays?": /call sheet|log ?in|refund|cancel|email/i,
  "When is the Welcome Tour?":    /call sheet|refund|cancel|real person/i,
  "I can't log in":               /call sheet|classes this week|replay/i,
  "How do I get a refund?":       /call sheet|classes this week|replay/i
};
Object.keys(UNRELATED).forEach(function(q){
  out.length=0; window.__answer(q);
  var html=out.join(' ');
  var rel=(html.match(/<div class="rel">[\s\S]*$/)||[''])[0];
  var bad=UNRELATED[q].test(rel);
  var n=(rel.match(/<button/g)||[]).length;
  console.log((bad?'FAIL':'PASS'),'|',q.padEnd(30),'related:',n);
});

console.log('\n--- talking to Matthew ---');
[["Can I talk to Matthew?","ask Matthew directly"],
 ["can I speak to matthew lesko","Tuesday"],
 ["how do I ask Matthew a question","chat"],
 ["when is the matthew meetup","Matthew Meetup"]].forEach(function(p){
  out.length=0; window.__answer(p[0]);
  var html=out.join(' ');
  var h3=(html.match(/<h3>(.*?)<\/h3>/)||[,'?'])[1].replace(/<[^>]+>/g,'');
  console.log((new RegExp(p[1],'i').test(html)?'PASS':'FAIL'),'|',p[0].padEnd(32),'=>',h3.slice(0,32));
});

/* ---------------------------------------------------------------
   We are not the results AI. A subject question must never come
   back with an outside agency, phone number, email or website.
   Answer it by naming the class and the place in the community. */
console.log('\n--- no outside contacts on subject questions ---');
var SUBJECT_QS = [
  "how do I start a business", "where do I start a nonprofit",
  "I need help with car repair", "help with rent", "help with medical bills",
  "I need help paying my debt", "help with food", "help for seniors",
  "I have a question about my grant", "how do I get free money",
  "I have a question about AI", "help with childcare", "help with utilities",
  "I am a veteran and need help", "help with school fees", "help with my pet"
];
var OUTSIDE = /\b2-?1-?1\b|\b1[-.\s]?8\d\d[-.\s]?\d{3}[-.\s]?\d{4}\b|\(\d{3}\)\s?\d{3}-\d{4}|\.gov\b|\.org\b|grants\.gov|mailto:/i;
var leaks = 0;
SUBJECT_QS.forEach(function (q) {
  out.length = 0; window.__answer(q);
  var html = out.join(' ');
  var bad = OUTSIDE.test(html);
  if (bad) leaks++;
  console.log((bad ? 'FAIL' : 'PASS'), '|', q.padEnd(34), bad ? (html.match(OUTSIDE) || [''])[0] : 'community only');
});
console.log(leaks === 0 ? 'PASS | no outside contacts anywhere' : 'FAIL | ' + leaks + ' answers leaked outside contacts');

console.log('\n--- signposting routes ---');
[["where can I ask a question","Questions Channel"],
 ["can I talk to someone","Go to a Q&amp;A"],
 ["who can help me","Go to a Q&amp;A"],
 ["how do I orient myself in the community","Welcome Tour or an Open Office"],
 ["how do I find my way around","Welcome Tour or an Open Office"],
 ["where do I talk about my subscription problems","Bring subscription questions here"],
 ["I have a problem with my membership","Bring subscription questions here"],
 ["I have a question about my grant","Take your grant question to a coach"],
 ["I have a question about AI","Roger teaches the AI side"],
 ["how do I use chatgpt for this","Roger teaches the AI side"],
 ["how do I start a business","three business classes"],
 ["I want to be self employed","three business classes"],
 ["how do I start a nonprofit","Nonprofit"]
].forEach(function (p) {
  out.length = 0; window.__answer(p[0]);
  var html = out.join(' ');
  console.log((html.indexOf(p[1]) !== -1 ? 'PASS' : 'FAIL'), '|', p[0].padEnd(40), '=>', p[1]);
});

console.log('\n--- routes must not steal answered questions ---');
[["How do I cancel my subscription?","How to cancel"],
 ["How do I get a refund?","Refunds"],
 ["I can't log in","Signing in"],
 ["How do I create my call sheet?","Three ways"],
 ["when is the AI workshop","AI Workshop"],
 ["when is start a nonprofit","Start a Nonprofit with Megan"],
 ["What classes are on this week?","Live this week"]
].forEach(function (p) {
  out.length = 0; window.__answer(p[0]);
  var html = out.join(' ');
  console.log((html.indexOf(p[1]) !== -1 ? 'PASS' : 'FAIL'), '|', p[0].padEnd(34), '=>', p[1]);
});

/* ---------------------------------------------------------------
   Every subject answer names all three: classes, lessons, guides. */
console.log('\n--- three kinds of resource on every subject answer ---');
[["Start a business", true], ["how do I start a nonprofit", true],
 ["I need to find things for dental care", false], ["help with rent", false],
 ["I need help with car repair", false], ["help with medical bills", false],
 ["I have a question about AI", true]
].forEach(function (p) {
  out.length = 0; window.__answer(p[0]);
  var h = out.join(' ');
  var lessons = h.indexOf('Lessons to read') !== -1;
  var guides  = h.indexOf('Quick guides to download') !== -1;
  var classes = h.indexOf('<table') !== -1;
  var calllist = h.indexOf('Build your call list') !== -1;
  var ok = lessons && guides && (p[1] ? classes : calllist);
  console.log((ok ? 'PASS' : 'FAIL'), '|', p[0].padEnd(36),
    'lessons:' + (lessons ? 'y' : 'n'), 'guides:' + (guides ? 'y' : 'n'),
    'classes:' + (classes ? 'y' : 'n'), 'calllist:' + (calllist ? 'y' : 'n'));
});

console.log('\n--- every link points inside the community ---');
var ALLOWED = /^(lesko-help-2\.mn\.co|[a-z0-9-]*\.?mightynetworks\.com|lesko[a-z-]*\.netlify\.app)$/;
var ALLQ = SUBJECT_QS.concat(["Start a business", "how do I start a nonprofit",
  "where can I ask a question", "how do I orient myself in the community",
  "what classes are on this week", "banana"]);
var badlinks = [];
ALLQ.forEach(function (q) {
  out.length = 0; window.__answer(q);
  (out.join(' ').match(/href="([^"]+)"/g) || []).forEach(function (h) {
    var u = h.slice(6, -1);
    var m = u.match(/^https?:\/\/([^\/]+)/);
    if (!m || !ALLOWED.test(m[1])) badlinks.push(q + ' -> ' + u);
  });
});
badlinks.forEach(function (b) { console.log('FAIL |', b); });
console.log(badlinks.length === 0 ? 'PASS | every link is a community link'
                                  : 'FAIL | ' + badlinks.length + ' links point outside');
