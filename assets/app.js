// Small helpers for the notes site. No libraries needed.
(function () {
  // ---- Copy buttons on code blocks ----
  document.querySelectorAll(".codebox").forEach(function (box) {
    var pre = box.querySelector("pre");
    if (!pre) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      var text = pre.innerText;
      var done = function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = "Copy"; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { btn.textContent = "Press Ctrl+C"; });
      } else {
        btn.textContent = "Select and copy";
      }
    });
    box.appendChild(btn);
  });

  // ---- Highlight current section in the side list ----
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (l) { l.classList.remove("active"); });
          map[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll("main h2[id]").forEach(function (h) { io.observe(h); });
  }

  // ---- Next-word guesser demo (numbers are made up, for illustration) ----
  var demo = document.getElementById("guesser");
  if (demo) {
    var EXAMPLES = [
      { start: "Good morning, how are", guesses: [["you", 88], ["things", 5], ["we", 3], ["the", 2], ["your", 1]] },
      { start: "I would like a cup of", guesses: [["tea", 46], ["coffee", 41], ["water", 7], ["milk", 3], ["rice", 1]] },
      { start: "The capital of Kenya is", guesses: [["Nairobi", 97], ["Mombasa", 1], ["a", 1], ["located", 1]] }
    ];
    var tabs = demo.querySelector(".tabs");
    var sentence = demo.querySelector(".sentence");
    var bars = demo.querySelector(".bars");
    var show = demo.querySelector("#show-guesses");
    var current = 0;
    function render(reveal) {
      var ex = EXAMPLES[current];
      sentence.innerHTML = "";
      sentence.appendChild(document.createTextNode(ex.start + " "));
      var blank = document.createElement("span");
      blank.className = "blank";
      blank.textContent = reveal ? ex.guesses[0][0] : "____";
      sentence.appendChild(blank);
      bars.innerHTML = "";
      if (!reveal) return;
      ex.guesses.forEach(function (g) {
        var row = document.createElement("div");
        row.className = "bar";
        var lab = document.createElement("span"); lab.textContent = g[0];
        var track = document.createElement("div"); track.className = "track";
        var fill = document.createElement("div"); fill.className = "fill";
        track.appendChild(fill);
        var pct = document.createElement("span"); pct.textContent = g[1] + "%";
        row.appendChild(lab); row.appendChild(track); row.appendChild(pct);
        bars.appendChild(row);
        requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = g[1] + "%"; }); });
      });
    }
    EXAMPLES.forEach(function (ex, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = ex.start;
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        current = i;
        tabs.querySelectorAll("button").forEach(function (x, j) { x.setAttribute("aria-pressed", j === i ? "true" : "false"); });
        render(false);
      });
      tabs.appendChild(b);
    });
    show.addEventListener("click", function () { render(true); });
    render(false);
  }

  // ---- JSON checker ----
  var jbox = document.getElementById("json-input");
  if (jbox) {
    var out = document.getElementById("json-result");
    var samples = [
      '{\n  "name": "Wanjiru",\n  "drink": "tea",\n  "sugar": true\n}',
      '{\n  name: "Wanjiru",\n  "drink": "tea"\n}',
      '{\n  "name": "Wanjiru",\n  "drink": "tea",\n}',
      "{\n  'name': 'Wanjiru'\n}",
      '{\n  "sugar": True\n}'
    ];
    var hints = {
      0: "A correct example to start with.",
      1: "Try fixing it: what is missing around the word name?",
      2: "Try fixing it: look at the end of the last line.",
      3: "Try fixing it: which kind of quotes does JSON want?",
      4: "Try fixing it: how should true be written?"
    };
    var hintEl = document.getElementById("json-hint");
    document.querySelectorAll("[data-sample]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.getAttribute("data-sample"));
        jbox.value = samples[i];
        out.className = "result";
        out.textContent = "";
        hintEl.textContent = hints[i];
      });
    });
    document.getElementById("json-check").addEventListener("click", function () {
      try {
        JSON.parse(jbox.value);
        out.className = "result ok";
        out.textContent = "Valid JSON. The computer can read this.";
      } catch (e) {
        out.className = "result err";
        out.textContent = "Not valid yet. The computer says: " + e.message;
      }
    });
    jbox.value = samples[1];
    hintEl.textContent = hints[1];
  }

  // ---- Exercise table: remember what you type (in this browser only) ----
  var fields = document.querySelectorAll(".fill-table input");
  fields.forEach(function (inp) {
    var key = "fill:" + location.pathname.split("/").pop() + ":" + inp.name;
    try { var v = localStorage.getItem(key); if (v) inp.value = v; } catch (e) {}
    inp.addEventListener("input", function () {
      try { localStorage.setItem(key, inp.value); } catch (e) {}
    });
  });

  // ---- Quiz ----
  var quiz = document.getElementById("quiz-box");
  if (quiz) {
    var total = quiz.querySelectorAll(".q").length;
    var right = 0, answered = 0;
    var scoreEl = document.getElementById("score");
    quiz.querySelectorAll(".q").forEach(function (q) {
      q.querySelectorAll(".opt").forEach(function (o) {
        o.addEventListener("click", function () {
          if (q.classList.contains("done")) return;
          q.classList.add("done");
          answered++;
          var correct = o.hasAttribute("data-correct");
          if (correct) { right++; o.classList.add("right"); }
          else {
            o.classList.add("wrong");
            var good = q.querySelector("[data-correct]");
            if (good) good.classList.add("right");
          }
          scoreEl.textContent = "Score: " + right + " of " + total + (answered === total ? " (all answered)" : "");
        });
      });
    });
    scoreEl.textContent = "Score: 0 of " + total;
    document.getElementById("quiz-reset").addEventListener("click", function () {
      right = 0; answered = 0;
      quiz.querySelectorAll(".q").forEach(function (q) {
        q.classList.remove("done");
        q.querySelectorAll(".opt").forEach(function (o) { o.classList.remove("right", "wrong"); });
      });
      scoreEl.textContent = "Score: 0 of " + total;
    });
  }
})();
