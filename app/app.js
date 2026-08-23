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
  var STOP = (" the a an i my me is are do does how to what where when can could you your for of in on it and or that this with " +
              "need needs help please want wants would like looking look find get getting got have has any some there here about ").split(" ");
  function words(s) { return norm(s).trim().split(" ").filter(function (w) { return w.length > 2 && STOP.indexOf(w) === -1; }); }

  /* ---------- matching ---------- */
  function scoreTopic(t, q) {
    /* Score on the question itself (title + the ways members phrase it).
       Step text is prose full of generic words and must NOT drive matching. */
    var hay = norm(t.title + " " + t.asked.join(" "));
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
        var title = norm(cat + " " + g.title);
        var body = norm(g.resources.map(function (r) { return r.n; }).join(" "));
        var s = 0;
        words(q).forEach(function (w) {
          if (title.indexOf(" " + w) !== -1) s += 4;      // title/category match counts
          else if (body.indexOf(" " + w) !== -1) s += 1;  // a resource name barely counts
        });
        if (s > 0) out.push({ cat: cat, g: g, s: s });
      });
    });
    return out.sort(function (a, b) { return b.s - a.s; }).slice(0, 3);
  }

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
  function eventBlock() {
    var evs = D.events;
    return '<div class="sub"><h4>Live this week — all times ET</h4>' +
      evs.map(function (e) {
        return '<div class="ev"><b>' + esc(e.day) + '</b><span class="t">' + esc(e.time) + "</span>" +
               '<span><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.name) + "</a> — " +
               esc(e.about) + "</span></div>";
      }).join("") + "</div>";
  }

  /* ---------- answers ---------- */
  /* One question -> exactly ONE answer. Nothing is ever appended "just in case".
     Explicit intents are checked first and win outright. */

  var INTENTS = [
    { id: "call_sheet",
      test: /call ?sheet|callsheet/i,
      render: function () {
        return "<h3>There are three ways to create your call sheet</h3>" +
          "<p>We recommend doing all three.</p><ol>" +
          '<li><b>Go to a Call Sheet Class</b> — and read the instruction sheet in that space first. ' +
          '<a href="https://lesko-help-2.mn.co/spaces/24440881" target="_blank" rel="noopener">Call Sheet Classes</a></li>' +
          '<li><b>Use the AI Researcher.</b> ' +
          '<a href="https://lesko-help-2.mn.co/spaces/24461105" target="_blank" rel="noopener">AI Grant Researcher</a></li>' +
          '<li><b>Ask a question in the Questions Channel.</b> ' +
          '<a href="https://lesko-help-2.mn.co/spaces/11054387" target="_blank" rel="noopener">Questions Channel</a></li>' +
          "</ol><p>Keep to one call sheet.</p>";
      } },
    { id: "roadmap",
      test: /roadmap|where do i start|where to start|just joined|i'?m new|new here|get started|getting started|first step|what do i do (next|now|first)|next step/i,
      render: function () {
        return "<h3>Start with the roadmap</h3>" +
          "<p><b>First, three setup steps:</b></p><ol>" +
          D.onboarding.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" +
          "<p><b>Then the roadmap:</b></p><ol>" +
          D.roadmap.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" +
          "<p>Finish every step to earn your first badge.</p>" +
          linkRow([{ n: "Explore the Roadmap", u: "https://lesko-help-2.mn.co/spaces/24365840" }]);
      } },
    { id: "schedule",
      test: /what.*(class|event|call|live).*(week|today|on|schedule)|when is|what time|schedule|classes this week|events this week|upcoming/i,
      render: function () {
        return "<h3>Live this week</h3>" +
          "<p>Open the event, then click the pink <b>Zoom Meeting</b> link — or <b>Join Zoom from Browser</b> if you don't have Zoom.</p>" +
          eventBlock();
      } }
  ];

  function answerTopic(t) {
    var steps = (aud === "public" && t.variant) ? t.variant : t.steps;
    var h = "<h3>" + esc(t.title) + (t.status === "needs_check" ? '<span class="tag">draft</span>' : "") + "</h3>";
    if (t.short) h += "<p>" + esc(t.short) + "</p>";
    if (t.important) h += '<div class="warn"><b>Watch out.</b> ' + esc(t.important) + "</div>";
    if (steps && steps.length) h += "<ol>" + steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>";
    return h;
  }

  function answer(q) {
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i].test.test(q)) return bubble("bot", INTENTS[i].render());
    }
    /* Account/how-to topics and subject guides compete on score; the stronger wins. */
    var best = D.topics.map(function (t) { return { t: t, s: scoreTopic(t, q) }; })
                       .sort(function (a, b) { return b.s - a.s; })[0];
    var gh = findGuides(q);
    var topScore = best ? best.s : 0;
    var guideScore = gh.length ? gh[0].s : 0;

    if (guideScore >= 4 && guideScore >= topScore) {
      return bubble("bot", "<h3>Here's where to find that</h3>" + guideBlock(gh.slice(0, 2)));
    }
    if (best && topScore >= 4) return bubble("bot", answerTopic(best.t));
    bubble("bot", "<h3>I'm not sure what you need yet</h3>" +
      "<p>I can help you find your way around the community. Try naming the thing you're after — for example <i>call sheet</i>, <i>rent help</i>, <i>car repair</i>, <i>this week's classes</i>, or <i>cancel my subscription</i>.</p>" +
      linkRow([{ n: "Or ask the team in the Questions Channel", u: "https://lesko-help-2.mn.co/spaces/11054387" }]));
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
