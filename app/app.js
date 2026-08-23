(function () {
  var D = window.LESKO, aud = "member";
  var thread = document.getElementById("thread");
  var chipBox = document.getElementById("chips");
  var form = document.getElementById("form");
  var input = document.getElementById("q");

  var SUGGEST = {
    member: ["How do I cancel my subscription?", "Where do I start?",
             "What classes are on this week?", "Where are the quick guides?"],
    public: ["How do I cancel my subscription?", "I can't log in",
             "How do I get a refund?", "Which site do I log into?"]
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function norm(s) { return " " + String(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ") + " "; }
  var STOP = " the a an i my me is are do how to what where can you your for of in on it and or that this with ".split(" ");
  function words(s) { return norm(s).trim().split(" ").filter(function (w) { return w.length > 2 && STOP.indexOf(w) === -1; }); }

  /* ---------- matching ---------- */
  function scoreTopic(t, q) {
    var hay = norm(t.title + " " + t.short + " " + t.asked.join(" ") + " " + t.steps.join(" "));
    var s = 0;
    words(q).forEach(function (w) { if (hay.indexOf(" " + w) !== -1) s += 2; });
    t.asked.forEach(function (a) { if (norm(a).indexOf(norm(q).trim()) !== -1) s += 6; });
    if (norm(t.title).indexOf(norm(q).trim()) !== -1) s += 5;
    if (aud === "public" && t.audience === "inside") s -= 100;
    s += (18 - t.rank) * 0.12;                       // volume tiebreak
    return s;
  }
  function findGuides(q) {
    var out = [];
    Object.keys(D.library).forEach(function (cat) {
      D.library[cat].forEach(function (g) {
        var hay = norm(cat + " " + g.title + " " + g.resources.map(function (r) { return r.n; }).join(" "));
        var s = 0;
        words(q).forEach(function (w) { if (hay.indexOf(" " + w) !== -1) s += 2; });
        if (s > 0) out.push({ cat: cat, g: g, s: s });
      });
    });
    return out.sort(function (a, b) { return b.s - a.s; }).slice(0, 3);
  }
  function wantsEvents(q) { return /class|classes|event|call|live|zoom|webinar|workshop|coaching|schedule|week|today|meetup|q&a|qa\b/i.test(q); }
  function wantsStart(q) { return /start|begin|new here|just joined|first step|next step|roadmap|what do i do|onboard/i.test(q); }

  /* ---------- rendering ---------- */
  function bubble(role, inner) {
    var d = document.createElement("div");
    d.className = "msg " + (role === "me" ? "me" : "bot");
    d.innerHTML = '<div class="who">' + (role === "me" ? "You" : "?") + "</div>" +
                  '<div class="bubble">' + inner + "</div>";
    thread.appendChild(d);
    d.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function linkRow(links) {
    if (!links.length) return "";
    return '<div class="linkrow">' + links.map(function (l) {
      return '<a href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.n) + " →</a>";
    }).join("") + "</div>";
  }
  function guideBlock(hits) {
    return hits.map(function (h) {
      var rs = h.g.resources.filter(function (r) { return r.n; }).slice(0, 4).map(function (r) {
        var u = /^https?:/.test(r.u) ? r.u : "https://" + r.u.replace(/^www\./, "www.");
        return "<li>" + esc(r.n) + ' — <a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(r.u) + "</a></li>";
      }).join("");
      var sp = D.spaces[h.cat] || null;
      return '<div class="sub"><h4>Quick guide · ' + esc(h.cat) + "</h4>" +
             "<p><b>" + esc(h.g.title) + "</b></p><ul class='res'>" + rs + "</ul>" +
             (h.g.tip ? "<p style='font-size:15px;color:var(--ink-mid);margin-top:8px'><b>Tip.</b> " + esc(h.g.tip) + "</p>" : "") +
             (sp ? linkRow([{ n: "Open " + h.cat + " in the community", u: sp }]) : "") + "</div>";
    }).join("");
  }
  function eventBlock(filterDay) {
    var evs = D.events.filter(function (e) { return !filterDay || e.day === filterDay; });
    return '<div class="sub"><h4>Live this week — all times ET</h4>' +
      evs.map(function (e) {
        return '<div class="ev"><b>' + esc(e.day) + '</b><span class="t">' + esc(e.time) + "</span>" +
               '<span><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.name) + "</a> — " +
               esc(e.about) + "</span></div>";
      }).join("") + "</div>";
  }

  /* ---------- answers ---------- */
  function answerStart() {
    var s = "<h3>Start with the roadmap</h3><p>Three quick setup steps, then seven steps that take you from arriving to applying.</p>" +
      "<p><b>First, set up your account:</b></p><ol>" + D.onboarding.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" +
      "<p><b>Then work through the roadmap:</b></p><ol>" + D.roadmap.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" +
      "<p>Finish every step and you earn your first badge.</p>" +
      linkRow([{ n: "Explore the Roadmap", u: "https://lesko-help-2.mn.co/spaces/24365840" },
               { n: "Join today's Welcome Tour", u: "https://lesko-help-2.mn.co/spaces/24366161/events" }]) +
      '<div class="sub"><h4>Three ways to build your call sheet — do all three</h4><ul class="res">' +
      '<li><b>Call Sheet Class</b> with Tony — the basics of building one. He notes your call sheet and posts it in Personalized Class Answers. <a href="https://lesko-help-2.mn.co/spaces/24440881/events" target="_blank" rel="noopener">Fridays 19:00 ET</a></li>' +
      '<li><b>AI Grant Researcher</b> — build it yourself in minutes. <a href="https://lesko-help-2.mn.co/spaces/24461105" target="_blank" rel="noopener">Open the tool</a></li>' +
      '<li><b>Questions Channel</b> — ask and the team replies under your post. <a href="https://lesko-help-2.mn.co/spaces/11054387" target="_blank" rel="noopener">Post a question</a></li>' +
      "</ul></div>";
    bubble("bot", s);
  }
  function answerTopic(t, q) {
    var steps = (aud === "public" && t.variant) ? t.variant : t.steps;
    var h = "<h3>" + esc(t.title) + (t.status === "needs_check" ? '<span class="tag">draft</span>' : "") + "</h3>";
    if (t.short) h += "<p>" + esc(t.short) + "</p>";
    if (t.important) h += '<div class="warn"><b>Watch out.</b> ' + esc(t.important) + "</div>";
    if (steps && steps.length) h += "<ol>" + steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>";
    if (/class|call|event|coach/i.test(t.title + " " + t.short)) h += eventBlock(null);
    var gh = findGuides(q);
    if (gh.length) h += guideBlock(gh);
    bubble("bot", h);
  }
  function answer(q) {
    if (wantsStart(q)) return answerStart();
    var best = D.topics.map(function (t) { return { t: t, s: scoreTopic(t, q) }; })
                       .sort(function (a, b) { return b.s - a.s; })[0];
    var gh = findGuides(q);
    if (wantsEvents(q) && (!best || best.s < 4)) {
      return bubble("bot", "<h3>Here's what's live this week</h3><p>Everything runs on Zoom inside the community. Open the event, then click the pink <b>Zoom Meeting</b> link — or <b>Join Zoom from Browser</b> if you don't have Zoom installed.</p>" + eventBlock(null));
    }
    if (gh.length && (!best || best.s < 4)) {
      return bubble("bot", "<h3>Here's where to find that</h3><p>These quick guides cover it. Each one lists the organisations to contact and what to ask for.</p>" + guideBlock(gh));
    }
    if (best && best.s > 1.5) return answerTopic(best.t, q);
    bubble("bot", "<h3>I'm not sure yet</h3><p>I can help with your account, finding classes and events, and finding the right quick guide or lesson. Try naming what you need — for example <i>car repair</i>, <i>rent</i>, <i>start a business</i>, or <i>cancel</i>.</p>" +
      linkRow([{ n: "Ask the team in the Questions Channel", u: "https://lesko-help-2.mn.co/spaces/11054387" }]));
  }

  /* ---------- wiring ---------- */
  function renderChips() {
    chipBox.innerHTML = SUGGEST[aud].map(function (s) {
      return '<button class="chip" type="button">' + esc(s) + "</button>";
    }).join("");
    [].forEach.call(chipBox.querySelectorAll(".chip"), function (b) {
      b.addEventListener("click", function () { ask(b.textContent); });
    });
  }
  function ask(q) {
    q = String(q || "").trim();
    if (!q) return;
    bubble("me", "<p>" + esc(q) + "</p>");
    answer(q);
    input.value = "";
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
  [].forEach.call(document.querySelectorAll(".aud button"), function (b) {
    b.addEventListener("click", function () {
      aud = b.dataset.aud;
      [].forEach.call(document.querySelectorAll(".aud button"), function (x) {
        x.setAttribute("aria-pressed", String(x.dataset.aud === aud));
      });
      document.getElementById("blurb").textContent = aud === "public"
        ? "Locked out, or sorting out a payment? Ask me about cancelling, refunds, logging back in, or which Lesko site to use. I'll give you the exact steps."
        : "Ask me anything about the community — where to find a class, a quick guide, or a PDF, how to get started, or anything about your account. I'll point you to the exact place and show you what's in it.";
      renderChips();
      thread.innerHTML = "";
    });
  });
  renderChips();
})();
