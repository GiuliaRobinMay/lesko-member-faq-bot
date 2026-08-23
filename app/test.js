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
 ["I need help with car repair","where to find"],
 ["How do I cancel my subscription?","cancel"],
 ["banana",""]
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
