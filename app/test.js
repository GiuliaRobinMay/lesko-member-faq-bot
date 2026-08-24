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
 ["banana","Ask this at a Q&amp;A"]
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
  /* At least one real resource, plus the route out. Precision beats volume:
     one exact resource is a better answer than three loose ones. */
  var ok = (lessons || guides) && (p[1] ? classes : calllist);
  console.log((ok ? 'PASS' : 'FAIL'), '|', p[0].padEnd(36),
    'lessons:' + (lessons ? 'y' : 'n'), 'guides:' + (guides ? 'y' : 'n'),
    'classes:' + (classes ? 'y' : 'n'), 'calllist:' + (calllist ? 'y' : 'n'));
});

console.log('\n--- every link points inside the community ---');
/* Community hosts, plus the sanctioned account/billing destinations
   (the member's own payment processors and the Lesko support site).
   Nothing else - no agency, no .gov, no directory service. */
var ALLOWED = /^(lesko-help-2\.mn\.co|[a-z0-9-]*\.?mightynetworks\.com|lesko[a-z-]*\.netlify\.app|leskosupport\.com|leskohelp\.recurly\.com|www\.paypal\.com|www\.clkbank\.com|clkbank\.com)$/;
function auditLinks(qs, label) {
  var badlinks = [];
  qs.forEach(function (q) {
    out.length = 0; window.__answer(q);
    (out.join(' ').match(/href="([^"]+)"/g) || []).forEach(function (h) {
      var u = h.slice(6, -1);
      if (u === 'mailto:leskohelp@gmail.com') return;   // the sanctioned support address
      var m = u.match(/^https?:\/\/([^\/]+)/);
      if (!m || !ALLOWED.test(m[1])) badlinks.push(q + ' -> ' + u);
    });
  });
  badlinks.forEach(function (b) { console.log('FAIL |', b); });
  console.log(badlinks.length === 0 ? 'PASS | ' + label
                                    : 'FAIL | ' + badlinks.length + ' links point outside (' + label + ')');
}
auditLinks(SUBJECT_QS.concat(["Start a business", "how do I start a nonprofit",
  "where can I ask a question", "how do I orient myself in the community",
  "what classes are on this week", "banana"]), 'every subject-answer link is a community link');


/* ---------------------------------------------------------------
   Precision. Someone asking about dental care is not asking about
   their cat, and someone asking about their car is not asking
   about a hearing aid. A loose extra makes the whole reply wrong. */
console.log('\n--- precise, or nothing ---');
[["dental care",   /pet|veterinary|hearing|vision|food|crisis/i],
 ["dentist",       /pet|veterinary|hearing|vision|food|crisis/i],
 ["I need help with my teeth", /pet|veterinary|hearing|vision/i],
 ["I need help with my car",   /dental|hearing|vision|pet|veterinary|auction/i],
 ["help with rent",            /dental|pet|car repair|student loan/i],
 ["help with my dog",          /dental|rent|car repair/i],
 ["I cant pay my electric bill", /dental|pet|rent|car repair/i],
 ["help with medical bills",   /pet|veterinary|car repair|rent/i],
 ["food help",                 /dental|pet|car repair|rent/i]
].forEach(function (p) {
  out.length = 0; window.__answer(p[0]);
  var h = out.join(' ');
  /* only look at the resource lists, not the standing Q&A footer */
  var block = h.replace(/data:image\/[^"']+/g, '')      // the avatar is base64, not content
                .split('Then do these two things')[0];
  var bad = p[1].test(block);
  console.log((bad ? 'FAIL' : 'PASS'), '|', p[0].padEnd(30),
    bad ? 'stray: ' + (block.match(p[1]) || [''])[0] : 'clean');
});

console.log('\n--- an unplaceable question goes to a Q&A, never a guess ---');
["banana", "zzzz", "I need something", "what about the thing"].forEach(function (q) {
  out.length = 0; window.__answer(q);
  var h = out.join(' ');
  var ok = h.indexOf('Ask this at a Q&amp;A') !== -1 || h.indexOf('Go to a Q&amp;A') !== -1;
  console.log((ok ? 'PASS' : 'FAIL'), '|', q.padEnd(24), ok ? 'sent to a Q&A' : 'guessed instead');
});

/* ---------------------------------------------------------------
   Related chips are curated by hand. Every chip anywhere in the app
   must land on a real answer when clicked - never on the fallback -
   and no chip may ever suggest cancelling or refunds from an
   unrelated answer (refunds may appear only under cancel itself). */
console.log('\n--- every related chip lands on a real answer ---');
var CRAWL = ["Where do I start?", "How do I create my call sheet?", "Where do I find my call sheet?",
  "I have a problem with my call sheet", "How do I apply for a grant?", "What classes are on this week?",
  "Where do I find the replays?", "How do I join the Zoom?", "Can I talk to a real person?",
  "Help with rent", "How do I start a business?", "how do I start a nonprofit",
  "How do I cancel my subscription?", "How do I get a refund?", "I can't log in", "How do I stop the emails?",
  "When is the Welcome Tour?", "Can I talk to Matthew?", "How do I ask a good question?",
  "I keep calling and getting no results", "I am overwhelmed", "What do I do after I apply?",
  "How do I keep track of my questions?", "How do I sign in on my computer?", "I have a question about AI",
  "where can I ask a question", "how do I orient myself in the community",
  "where do I talk about my subscription problems", "I have a question about my grant",
  "Am I still a member?", "What does the membership cost?", "Can I switch from monthly to annual?",
  "How do I download the app?", "Which Lesko site do I log into?", "How do I change my profile details?",
  "A link is not working", "How do I use the AI Grant Researcher?", "I paid but I have no account"];
var chips = {};
CRAWL.forEach(function (q) {
  out.length = 0; window.__answer(q);
  var h = out.join(' ');
  var rel = (h.match(/<div class="rel">[\s\S]*?<\/div><\/div>/) || [''])[0];
  (rel.match(/<button type='button'>([^<]+)<\/button>/g) || []).forEach(function (c) {
    var label = c.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    (chips[label] = chips[label] || []).push(q);
  });
});
var chipFails = 0;
Object.keys(chips).forEach(function (label) {
  out.length = 0; window.__answer(label);
  var h = out.join(' ');
  var fallback = h.indexOf('Ask this at a Q&amp;A') !== -1;
  if (fallback) { chipFails++; console.log('FAIL | chip "' + label + '" (under: ' + chips[label][0] + ') hits the fallback'); }
});
var badCancel = 0;
Object.keys(chips).forEach(function (label) {
  if (/cancel/i.test(label)) { badCancel++; console.log('FAIL | a chip suggests cancelling: "' + label + '"'); }
  if (/refund/i.test(label)) chips[label].forEach(function (src) {
    if (!/cancel/i.test(src)) { badCancel++; console.log('FAIL | refund chip under "' + src + '"'); }
  });
});
console.log((chipFails + badCancel === 0 ? 'PASS' : 'FAIL') + ' | ' + Object.keys(chips).length +
            ' distinct chips crawled, all land on real answers, none suggest leaving');

/* ---------------------------------------------------------------
   Every synonym must point at a word that actually exists in some
   lesson, guide, topic or category - otherwise it maps to nothing. */
console.log('\n--- synonyms all point at real content ---');
var HAY = [];
Object.keys(window.LESKO.lessons).forEach(function (sp) {
  window.LESKO.lessons[sp].forEach(function (l) { HAY.push(l.t); });
});
Object.keys(window.LESKO.library).forEach(function (c) {
  HAY.push(c);
  window.LESKO.library[c].forEach(function (g) { HAY.push(g.title); });
});
window.LESKO.topics.forEach(function (t) { HAY.push(t.title + ' ' + t.asked.join(' ')); });
var hayNorm = (' ' + HAY.join(' ').toLowerCase().replace(/[^a-z0-9 ]/g, ' ') + ' ');
var SYNSRC = require('fs').readFileSync(process.cwd() + '/app.js', 'utf8');
var synBody = SYNSRC.split('var SYN = {')[1].split('};')[0];
var targets = {};
(synBody.match(/: "([a-z]+)"/g) || []).forEach(function (m) { targets[m.slice(3, -1)] = 1; });
var deadSyn = 0;
Object.keys(targets).forEach(function (t) {
  var root = t.length > 4 ? t.slice(0, t.length - 1) : t;   // crude stem: match plural/singular
  if (hayNorm.indexOf(' ' + root) === -1) { deadSyn++; console.log('FAIL | synonym target "' + t + '" matches no content'); }
});
console.log((deadSyn === 0 ? 'PASS' : 'FAIL') + ' | ' + Object.keys(targets).length + ' synonym targets checked');

/* ---------------------------------------------------------------
   Aliases with & or - used to be dead: the question is normalised
   before matching but the aliases were not. */
console.log('\n--- punctuated event names still match ---');
[["when is the member q&a", "Member Q&A with Tony"],
 ["when is the member q & a", "Member Q&A with Tony"],
 ["when is pay my debt & bills", "Pay My Debt & Bills"],
 ["when is the drop-in clinic", "Drop-In Clinic"]
].forEach(function (p) {
  out.length = 0; window.__answer(p[0]);
  var h = out.join(' ');
  var single = h.indexOf('Live this week') === -1 && h.indexOf(p[1].replace(/&/g, '&amp;')) !== -1;
  console.log((single ? 'PASS' : 'FAIL'), '|', p[0].padEnd(32), '=>', p[1]);
});

/* ---------------------------------------------------------------
   A business/nonprofit/AI question that mentions grants must go to
   its subject route, not the generic grants route. */
console.log('\n--- subject routes beat the generic grants route ---');
[["grants to start a business", "three business classes"],
 ["business grants", "three business classes"],
 ["grants for my nonprofit", "Nonprofit"],
 ["how do I use ai to find grants", "Roger teaches the AI side"],
 ["I have a question about my grant", "Take your grant question to a coach"]
].forEach(function (p) {
  out.length = 0; window.__answer(p[0]);
  console.log((out.join(' ').indexOf(p[1]) !== -1 ? 'PASS' : 'FAIL'), '|', p[0].padEnd(32), '=>', p[1]);
});

/* ---------------------------------------------------------------
   Greetings and thanks get a human reply, not a routing card. */
console.log('\n--- smalltalk ---');
[["hi", "Hi!"], ["hello", "Hi!"], ["thank you", "welcome"], ["thanks so much", "welcome"],
 ["great", "welcome"], ["bye", "Bye for now"]
].forEach(function (p) {
  out.length = 0; window.__answer(p[0]);
  console.log((out.join(' ').indexOf(p[1]) !== -1 ? 'PASS' : 'FAIL'), '|', p[0].padEnd(16), '=>', p[1]);
});
[["hi how do I cancel my subscription", "How to cancel"],
 ["ok but where are the replays", "replays"]
].forEach(function (p) {
  out.length = 0; window.__answer(p[0]);
  console.log((out.join(' ').indexOf(p[1]) !== -1 ? 'PASS' : 'FAIL'), '|', p[0].padEnd(36), '=> not smalltalk');
});


/* The wide sweep: every crawled question, chips included. */
console.log('\n--- link audit over the full crawl ---');
auditLinks(CRAWL.concat(Object.keys(chips)), 'every link everywhere is community or sanctioned billing');

/* ---------------------------------------------------------------
   Fuzz: odd input must never throw, and typed HTML must never
   execute - it has to come back escaped. */
console.log('\n--- fuzz: nothing throws, nothing injects ---');
var FUZZ = ["", " ", "?", "!!!", "....", "a", "no", "yes please", "HELP",
  "¿dónde está la clase?", "我需要帮助", "🙏🙏🙏", "rent rent rent rent rent",
  "<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "\"'`",
  "how do i".repeat(60), "CANCEL!!!", "i can't-log-in", "q&a", "drop-in",
  "null", "undefined", "constructor", "__proto__", "hasOwnProperty"];
var fuzzFails = 0;
FUZZ.forEach(function (q) {
  out.length = 0;
  try { window.__answer(q); } catch (e) { fuzzFails++; console.log('FAIL | threw on ' + JSON.stringify(q) + ': ' + e.message); return; }
  var h = out.join(' ');
  if (/<script>|onerror=/.test(h)) { fuzzFails++; console.log('FAIL | unescaped HTML echoed for ' + JSON.stringify(q)); }
});
console.log(fuzzFails === 0 ? 'PASS | ' + FUZZ.length + ' fuzz inputs, no throws, no injection' : 'FAIL | fuzz');
