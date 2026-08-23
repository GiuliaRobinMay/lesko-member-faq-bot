(function () {
  var D = window.LESKO, aud = "member";
  var thread = document.getElementById("thread");
  var catBox = document.getElementById("cats");
  var form = document.getElementById("form");
  var input = document.getElementById("q");


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

  /* An intent = one subject + one SITUATION. "Create my call sheet",
     "where is my call sheet" and "problem with my call sheet" are three
     different intents, because they need three different answers. */
  var SITU = {
    make:    /\b(create|creating|make|making|build|building|start|starting|set ?up|new)\b/i,
    locate:  /\b(where|find|finding|locate|get to|access|see|receive|received|sent|copy)\b/i,
    trouble: /\b(problem|problems|issue|issues|wrong|not work|doesn'?t work|won'?t|can'?t|cannot|stuck|help with|trouble|error|missing|lost|didn'?t get|never got)\b/i
  };

  function L(n, u) { return { n: n, u: u }; }
  var SPACE = {
    callSheetClasses: "https://lesko-help-2.mn.co/spaces/24440881",
    aiResearcher:     "https://lesko-help-2.mn.co/spaces/24461105",
    questions:        "https://lesko-help-2.mn.co/spaces/11054387",
    personalAnswers:  "https://lesko-help-2.mn.co/spaces/22542848",
    groupCoaching:    "https://lesko-help-2.mn.co/spaces/7159013/events",
    applicationClass: "https://lesko-help-2.mn.co/spaces/24366189/events",
    roadmap:          "https://lesko-help-2.mn.co/spaces/24365840",
    welcomeTour:      "https://lesko-help-2.mn.co/spaces/24366161/events",
    askMatthew:       "https://lesko-help-2.mn.co/spaces/21948411/events",
    replays:          "https://lesko-help-2.mn.co/spaces/24487516",
    /* instruction sheets (your Netlify apps, per each repo's EMBED.md) */
    callSheetGuide:   "https://lesko-callsheet.netlify.app/",
    afterYouApply:    "https://lesko-help-application-follow-up.netlify.app/"
  };

  var INTENTS = [
    /* ---- call sheet: three situations ---- */
    { id: "call_sheet_locate",
      test: function (q) { return /call ?sheet|callsheet/i.test(q) && SITU.locate.test(q) && !SITU.make.test(q); },
      render: function () {
        return "<h3>Your call sheet is in Personalized Class Answers</h3>" +
          "<p>When the team builds a call sheet for you, they post it there under your name. Check your notification bell too — you get a notice when it's posted.</p>" +
          linkRow([L("Personalized Class Answers", SPACE.personalAnswers)]);
      } },
    { id: "call_sheet_trouble",
      test: function (q) { return /call ?sheet|callsheet/i.test(q) && SITU.trouble.test(q); },
      render: function () {
        return "<h3>Let's get your call sheet sorted</h3><p>Three ways to get help with it:</p><ol>" +
          '<li><b>Ask a question in the Questions Channel</b> — the team replies under your post. <a href="' + SPACE.questions + '" target="_blank" rel="noopener">Questions Channel</a></li>' +
          '<li><b>Join a Q&A session</b> — ask a coach live. <a href="' + SPACE.groupCoaching + '" target="_blank" rel="noopener">See Q&A times</a></li>' +
          '<li><b>Join a Call Sheet Class</b> — go through it together. <a href="' + SPACE.callSheetClasses + '" target="_blank" rel="noopener">Call Sheet Classes</a></li>' +
          "</ol>" + linkRow([L("Read the call sheet guide", SPACE.callSheetGuide)]);
      } },
    { id: "call_sheet_make",
      test: function (q) { return /call ?sheet|callsheet/i.test(q); },
      render: function () {
        return "<h3>There are three ways to create your call sheet</h3><p>We recommend doing all three.</p><ol>" +
          '<li><b>Go to a Call Sheet Class</b> — and read the instruction sheet in that space first. <a href="' + SPACE.callSheetClasses + '" target="_blank" rel="noopener">Call Sheet Classes</a></li>' +
          '<li><b>Use the AI Researcher.</b> <a href="' + SPACE.aiResearcher + '" target="_blank" rel="noopener">AI Grant Researcher</a></li>' +
          '<li><b>Ask a question in the Questions Channel.</b> <a href="' + SPACE.questions + '" target="_blank" rel="noopener">Questions Channel</a></li>' +
          "</ol>" +
          '<div class="sub"><h4>Before you ask, from the call sheet guide</h4>' +
          "<p>Your call sheet is built from <b>two things</b>: where you live (your ZIP code, state or city) and <b>one</b> problem you need help with.</p>" +
          "<p><b>One problem = one call sheet.</b> Keep them separate — \"help paying rent\", \"car repair help\", \"help with medical bills\". Combining problems gives you a thin, general list. More than one problem is fine — just ask for more than one sheet.</p>" +
          linkRow([L("Read the full call sheet guide", SPACE.callSheetGuide)]) + "</div>";
      } },

    /* ---- applying ---- */
    { id: "apply",
      test: function (q) { return /appl(y|ying|ication)/i.test(q) && !/call ?sheet/i.test(q); },
      render: function () {
        return "<h3>Once your call sheet is ready, go to an Application Class</h3>" +
          "<p>Read the instructions in that space first, then join a class. After that you can keep going with Group Coaching or a Meetup with Matthew.</p>" +
          linkRow([L("Application Classes", SPACE.applicationClass), L("Group Coaching", SPACE.groupCoaching), L("Ask Matthew Live", SPACE.askMatthew)]) +
          '<div class="sub"><h4>After you send it</h4><p>Keep one folder per application and follow up at the right moment — that is what separates the members who get the money.</p>' +
          linkRow([L("After You Apply guide", SPACE.afterYouApply)]) + "</div>";
      } },

    { id: "after_apply",
      test: function (q) { return /follow ?up|after (i )?appl|applied|heard back|no answer|waiting|how long|still nothing|rejected|turned down|denied/i.test(q); },
      render: function () {
        return "<h3>You've applied — here's what wins</h3>" +
          "<ul>" +
          "<li><b>Stay calm, this part is slow.</b> Most decisions take 30–60 days. Silence in week two means nothing.</li>" +
          "<li><b>Keep one folder per application</b>, named for the organization — your application as sent, every document, proof you sent it, and their replies.</li>" +
          "<li><b>Never send your only copy.</b> Photograph or scan every page first.</li>" +
          "<li><b>Write down every date and name</b>, and check your messages every single day.</li>" +
          "<li><b>If they ask for more — drop everything</b> and send it.</li>" +
          "<li><b>Keep hunting while you wait.</b></li>" +
          "</ul>" +
          "<p>A \"no\" is usually about their budget, not about you — and most refusals come from missing paperwork, which you can control.</p>" +
          linkRow([L("Read the full follow-up guide", SPACE.afterYouApply), L("Bring it to Group Coaching", SPACE.groupCoaching)]);
      } },

    /* ---- roadmap / getting started ---- */
    { id: "roadmap",
      test: function (q) { return /roadmap|where do i start|where to start|just joined|i'?m new|new here|get started|getting started|first step|what do i do (next|now|first)|next step/i.test(q); },
      render: function () {
        return "<h3>Start with the roadmap</h3><p><b>First, three setup steps:</b></p><ol>" +
          D.onboarding.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" +
          "<p><b>Then the roadmap:</b></p><ol>" +
          D.roadmap.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>" +
          "<p>Finish every step to earn your first badge.</p>" +
          linkRow([L("Explore the Roadmap", SPACE.roadmap), L("Join today's Welcome Tour", SPACE.welcomeTour)]);
      } },

    /* ---- schedule / replays ---- */
    { id: "replays",
      test: function (q) { return /replay|recording|missed|catch up|watch again/i.test(q); },
      render: function () {
        return "<h3>Replays are in Class Replays</h3><p>Every class is recorded and posted there.</p>" +
          linkRow([L("Class Replays", SPACE.replays)]);
      } },
    { id: "schedule",
      test: function (q) { return /what.*(class|event|call|live).*(week|today|on|schedule)|when is|what time|schedule|classes this week|events this week|upcoming|whats on/i.test(q); },
      render: function () {
        return "<h3>Live this week</h3><p>Open the event, then click the pink <b>Zoom Meeting</b> link — or <b>Join Zoom from Browser</b> if you don't have Zoom.</p>" + eventBlock();
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
      var t = INTENTS[i].test;
      var hit = (typeof t === "function") ? t(q) : t.test(q);
      if (hit) return bubble("bot", INTENTS[i].render());
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
/* Four categories, account questions last. Sub-items are the questions the
     research showed members actually ask. */
  var CATS = {
    member: [
      { name: "Getting started", colour: "var(--green)", qs: [
        "Where do I start?",
        "What are the roadmap steps?",
        "When is the Welcome Tour?",
        "How do I find my way around the site?" ] },
      { name: "Your call sheet & applying", colour: "var(--blue)", qs: [
        "How do I create my call sheet?",
        "Where do I find my call sheet?",
        "I have a problem with my call sheet",
        "How do I apply for a grant?" ] },
      { name: "Classes & live help", colour: "var(--yellow-warm)", qs: [
        "What classes are on this week?",
        "Where do I find the replays?",
        "How do I join the Zoom?",
        "Can I talk to a real person?" ] },
      { name: "Find help by topic", colour: "var(--red)", qs: [
        "Help with rent",
        "Help with car repair",
        "Help with medical bills",
        "How do I start a business?" ] },
      { name: "Your account", colour: "var(--ink-mid)", qs: [
        "How do I cancel my subscription?",
        "How do I get a refund?",
        "I can't log in",
        "How do I stop the emails?" ] }
    ],
    public: [
      { name: "Getting back in", colour: "var(--blue)", qs: [
        "I can't log in",
        "Which Lesko site do I log into?",
        "I paid but I have no account",
        "Am I still a member?" ] },
      { name: "Payments & cancelling", colour: "var(--red)", qs: [
        "How do I cancel my subscription?",
        "How do I get a refund?",
        "I was charged and I don't know why",
        "How do I change my card?" ] },
      { name: "Getting help", colour: "var(--green)", qs: [
        "How do I contact support?",
        "How do I stop the emails?",
        "What does the membership cost?" ] }
    ]
  };

  function renderCats() {
    catBox.innerHTML = CATS[aud].map(function (c, i) {
      return '<div class="cat" open-state="' + (i === 0 ? "1" : "0") + '">' +
        '<button type="button" aria-expanded="' + (i === 0) + '">' +
        '<span class="dot" style="background:' + c.colour + '"></span>' + esc(c.name) +
        '<span class="arrow">&#9656;</span></button><ul>' +
        c.qs.map(function (q) { return "<li><button type='button'>" + esc(q) + "</button></li>"; }).join("") +
        "</ul></div>";
    }).join("");
    [].forEach.call(catBox.querySelectorAll(".cat"), function (cat) {
      var head = cat.querySelector("button");
      head.addEventListener("click", function () {
        var open = cat.getAttribute("open-state") === "1";
        cat.setAttribute("open-state", open ? "0" : "1");
        head.setAttribute("aria-expanded", String(!open));
      });
      [].forEach.call(cat.querySelectorAll("ul button"), function (b) {
        b.addEventListener("click", function () { ask(b.textContent); });
      });
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
      renderCats();
      thread.innerHTML = "";
    });
  });
  renderCats();
})();
