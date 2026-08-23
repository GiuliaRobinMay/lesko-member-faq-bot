global.window = {};
require(process.cwd()+'/data.js');
// minimal DOM stubs
var out = [];
global.document = {
  getElementById: function(){ return {innerHTML:'', appendChild:function(){}, addEventListener:function(){}, textContent:'', value:'', querySelectorAll:function(){return[]}}; },
  querySelectorAll: function(){ return []; },
  createElement: function(){ return {className:'', innerHTML:'', scrollIntoView:function(){}, set innerHTML(v){ this._h=v; out.push(v); }, get innerHTML(){return this._h||''} }; }
};
var src = require('fs').readFileSync(process.cwd()+'/app.js','utf8');
src = src.replace('})();', 'window.__ask = ask; window.__answer = answer; })();');
eval(src);
var Qs = ["How do I create my call sheet?","how do i make a callsheet","Where do I start?",
          "What classes are on this week?","I need help with car repair","How do I cancel my subscription?",
          "help with rent","banana"];
Qs.forEach(function(q){
  out.length = 0;
  window.__answer(q);
  var html = out.join(' ');
  var h3 = (html.match(/<h3>(.*?)<\/h3>/)||[,'(none)'])[1].replace(/<[^>]+>/g,'');
  var blocks = (html.match(/<div class="sub">/g)||[]).length;
  console.log(('Q: '+q).padEnd(38), '=>', h3.slice(0,52).padEnd(54), 'extra-blocks:', blocks);
});
