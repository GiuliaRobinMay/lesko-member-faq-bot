global.window = {};
require(process.cwd() + '/data.js');
var out = [];
global.document = {
  getElementById: function(){ return {innerHTML:'', appendChild:function(){}, addEventListener:function(){}, textContent:'', value:'', querySelectorAll:function(){return[]}}; },
  querySelectorAll: function(){ return []; },
  createElement: function(){ return {className:'', scrollIntoView:function(){}, set innerHTML(v){ this._h=v; out.push(v); }, get innerHTML(){return this._h||''} }; }
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
