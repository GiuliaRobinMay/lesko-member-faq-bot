/* Inline data.js + app.js into the single publishable file.
   Run from this directory:  node build.js  */
var fs = require("fs");
var html = fs.readFileSync("index.html", "utf8");
var data = fs.readFileSync("data.js", "utf8");
var app  = fs.readFileSync("app.js", "utf8");
var out = html
  .replace('<script src="data.js"></script>', "<script>\n" + data + "\n</script>")
  .replace('<script src="app.js"></script>',  "<script>\n" + app  + "\n</script>");
if (out.indexOf('src="data.js"') !== -1 || out.indexOf('src="app.js"') !== -1) {
  throw new Error("script tags not replaced — check index.html");
}
fs.writeFileSync("lesko-navigator.html", out);
console.log("built lesko-navigator.html  " + out.length + " bytes");
