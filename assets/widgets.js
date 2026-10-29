// Extra interactive pieces used by lessons 2 to 20. Plain JavaScript, no libraries.
(function () {
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) {}
    return null;
  }
  var page = location.pathname.split("/").pop() || "index.html";
  var W = {};

  // ---------- rough token counter ----------
  W.tokens = function (root) {
    var ta = h("textarea", { "class": "jsonbox", rows: "4", spellcheck: "false", "aria-label": "Text to count" });
    ta.value = "Habari! I would like to order two cups of tea and one mandazi, please.";
    var price = h("input", { type: "number", min: "0", step: "0.1", value: "1", style: "width:6rem", "aria-label": "Price per million tokens in dollars" });
    var out = h("div", { "class": "stats" });
    function update() {
      var t = ta.value, chars = t.length;
      var words = t.trim() ? t.trim().split(/\s+/).length : 0;
      var tokens = Math.ceil(chars / 4);
      var p = Number(price.value) || 0;
      var cost = tokens / 1e6 * p;
      out.innerHTML = "";
      [["Characters", chars], ["Words", words], ["Tokens (rough)", tokens],
       ["Cost of this text", "$" + cost.toFixed(6)], ["Cost of 10,000 like it", "$" + (cost * 10000).toFixed(2)]]
        .forEach(function (s) { out.appendChild(h("div", { "class": "stat" }, [h("span", { "class": "n", text: String(s[1]) }), h("span", { "class": "l", text: s[0] })])); });
    }
    root.appendChild(h("strong", { text: "Try it: a rough token counter" }));
    root.appendChild(h("p", { "class": "note", text: "This uses the four-characters-per-token rule, so it is only an estimate. Real tokenizers give different numbers, especially for code and other languages." }));
    root.appendChild(ta);
    root.appendChild(h("p", {}, [document.createTextNode("Price per million input tokens, in dollars: "), price]));
    root.appendChild(out);
    ta.addEventListener("input", update); price.addEventListener("input", update); update();
  };

  // ---------- temperature dial ----------
  W.temperature = function (root) {
    var words = ["tea", "coffee", "water", "milk", "juice"];
    var logits = [2.2, 2.0, 1.0, 0.2, -0.5];
    var slider = h("input", { type: "range", min: "0.1", max: "2", step: "0.1", value: "1", "aria-label": "Temperature" });
    var label = h("strong", { text: "1.0" });
    var bars = h("div", { "class": "bars" });
    var draws = h("p", { "class": "draws", "aria-live": "polite" });
    var probs = [];
    function calc() {
      var t = Number(slider.value);
      var m = Math.max.apply(null, logits);
      var ex = logits.map(function (l) { return Math.exp((l - m) / t); });
      var s = ex.reduce(function (a, b) { return a + b; }, 0);
      probs = ex.map(function (e) { return e / s; });
      label.textContent = t.toFixed(1);
      bars.innerHTML = "";
      probs.forEach(function (p, i) {
        var fill = h("div", { "class": "fill" });
        fill.style.width = (p * 100).toFixed(1) + "%";
        bars.appendChild(h("div", { "class": "bar" }, [h("span", { text: words[i] }), h("div", { "class": "track" }, [fill]), h("span", { text: (p * 100).toFixed(0) + "%" })]));
      });
      draws.textContent = "";
    }
    function draw() {
      var out = [];
      for (var k = 0; k < 10; k++) {
        var r = Math.random(), c = 0, pick = words.length - 1;
        for (var i = 0; i < probs.length; i++) { c += probs[i]; if (r < c) { pick = i; break; } }
        out.push(words[pick]);
      }
      draws.textContent = "Ten draws: " + out.join(", ");
    }
    var btn = h("button", { type: "button", text: "Draw 10 words" });
    btn.addEventListener("click", draw);
    slider.addEventListener("input", calc);
    root.appendChild(h("strong", { text: "Try it: the temperature dial" }));
    root.appendChild(h("p", { "class": "sentence", html: "I would like a cup of <span class=\"blank\">____</span>" }));
    root.appendChild(h("p", {}, [document.createTextNode("Temperature: "), label, document.createTextNode("  (low = predictable, high = adventurous)")]));
    root.appendChild(slider);
    root.appendChild(bars);
    root.appendChild(h("p", {}, [btn]));
    root.appendChild(draws);
    root.appendChild(h("p", { "class": "note", text: "The scores behind these bars are made up to show the idea. Real models do the same sum across tens of thousands of possible tokens." }));
    calc();
  };

  // ---------- agent loop stepper ----------
  W.loop = function (root) {
    var steps = [
      ["You", "You ask: “What is 1234 × 5678?”"],
      ["Model", "The model decides. It does not do sums in its head, so it asks for a tool: calculator(\"1234 * 5678\")."],
      ["App", "Your app runs the calculator. Result: 7006652."],
      ["App", "Your app sends the result back to the model."],
      ["Model", "The model writes the final answer: “1234 times 5678 is 7,006,652.”"]
    ];
    var i = 0;
    var list = h("ol", { "class": "loop-steps" });
    var note = h("p", { "class": "note", text: "If the model needed another tool, it would go back to step 2. Good apps cap how many rounds this can repeat." });
    var back = h("button", { type: "button", "class": "secondary", text: "Back" });
    var next = h("button", { type: "button", text: "Next step" });
    var reset = h("button", { type: "button", "class": "secondary", text: "Start over" });
    function render() {
      list.innerHTML = "";
      steps.forEach(function (s, k) {
        if (k > i) return;
        var li = h("li", { "class": k === i ? "now" : "" });
        li.appendChild(h("span", { "class": "who who-" + s[0].toLowerCase(), text: s[0] }));
        li.appendChild(document.createTextNode(" " + s[1]));
        list.appendChild(li);
      });
      back.disabled = i === 0; next.disabled = i === steps.length - 1;
    }
    back.addEventListener("click", function () { if (i > 0) { i--; render(); } });
    next.addEventListener("click", function () { if (i < steps.length - 1) { i++; render(); } });
    reset.addEventListener("click", function () { i = 0; render(); });
    root.appendChild(h("strong", { text: "Try it: walk through one tool call" }));
    root.appendChild(list);
    root.appendChild(h("div", { "class": "row" }, [back, next, reset]));
    root.appendChild(note);
    render();
  };

  // ---------- JSON path / n8n expression explorer ----------
  W.jsonpath = function (root) {
    var data = h("textarea", { "class": "jsonbox", rows: "11", spellcheck: "false", "aria-label": "Sample data" });
    data.value = JSON.stringify({ name: "Wanjiru", city: "Nyeri", orders: [{ item: "tea", qty: 2 }, { item: "mandazi", qty: 5 }] }, null, 2);
    var expr = h("input", { type: "text", value: "{{ $json.name }}", "class": "wide", spellcheck: "false", "aria-label": "Expression" });
    var out = h("div", { "class": "result", role: "status", "aria-live": "polite" });
    function path(src, json) {
      src = src.trim();
      if (src.indexOf("$json") !== 0) throw new Error("Start with $json");
      var rest = src.slice(5), cur = json, re = /^(?:\.([A-Za-z_]\w*)|\[(\d+)\]|\["([^"]+)"\])/, m;
      while (rest.length) {
        m = re.exec(rest);
        if (!m) throw new Error("Cannot read: " + rest);
        var key = m[1] !== undefined ? m[1] : (m[2] !== undefined ? Number(m[2]) : m[3]);
        cur = (cur === null || cur === undefined) ? undefined : cur[key];
        rest = rest.slice(m[0].length);
      }
      return cur;
    }
    function run() {
      var json, txt = expr.value.trim();
      try { json = JSON.parse(data.value); } catch (e) { out.className = "result err"; out.textContent = "The sample data is not valid JSON yet: " + e.message; return; }
      var m = /^\{\{\s*([\s\S]*?)\s*\}\}$/.exec(txt);
      if (!m) { out.className = "result err"; out.textContent = "An expression goes inside double curly braces, like {{ $json.name }}"; return; }
      var inner = m[1], val;
      try {
        var sm = /^JSON\.stringify\(([\s\S]*)\)$/.exec(inner);
        val = sm ? JSON.stringify(path(sm[1], json)) : path(inner, json);
      } catch (e) { out.className = "result err"; out.textContent = e.message; return; }
      if (val === undefined) { out.className = "result err"; out.textContent = "undefined: nothing found there. Check the spelling and capital letters."; return; }
      out.className = "result ok";
      out.textContent = "Result: " + (typeof val === "object" ? JSON.stringify(val) : String(val));
    }
    var quick = ["{{ $json.name }}", "{{ $json.orders[0].item }}", "{{ $json.orders[1].qty }}", "{{ JSON.stringify($json.orders) }}", "{{ $json.Name }}"];
    var row = h("div", { "class": "row" });
    quick.forEach(function (q) { var b = h("button", { type: "button", "class": "secondary", text: q }); b.addEventListener("click", function () { expr.value = q; run(); }); row.appendChild(b); });
    root.appendChild(h("strong", { text: "Try it: pull a value out of data" }));
    root.appendChild(h("p", { "class": "note", text: "n8n reads data with expressions. Edit the data or the expression, or press an example. The last example has a deliberate spelling mistake." }));
    root.appendChild(data);
    root.appendChild(h("p", {}, [document.createTextNode("Expression: "), expr]));
    root.appendChild(row);
    root.appendChild(out);
    expr.addEventListener("input", run); data.addEventListener("input", run); run();
  };

  // ---------- meaning search vs keyword search ----------
  W.similarity = function (root) {
    var docs = [
      ["How to reset your password", 1.5, 8.2], ["Change the email on your account", 2.6, 7.2],
      ["Refund policy for returned items", 8.0, 1.8], ["Why your card payment was declined", 8.8, 2.8],
      ["Track your delivery", 1.8, 2.0], ["Change your delivery address", 2.8, 1.2],
      ["Opening hours on Saturday", 8.4, 8.3], ["Where to find our shop", 7.4, 7.4]
    ];
    var qs = [
      ["I forgot my login and can't get in", 1.8, 7.8], ["Can I get my money back?", 7.7, 2.0],
      ["When are you open on weekends?", 8.0, 8.0], ["Where is my parcel?", 2.0, 1.8], ["Reset my password", 1.6, 8.4]
    ];
    var stop = ["i", "my", "can", "the", "to", "a", "an", "of", "on", "in", "and", "you", "your", "are", "is", "how", "for", "when", "our"];
    function toks(s) { return s.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(function (w) { return w && stop.indexOf(w) < 0; }); }
    var sel = h("select", { "aria-label": "Pick a question" });
    qs.forEach(function (q, i) { sel.appendChild(h("option", { value: String(i), text: q[0] })); });
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 300 300"); svg.setAttribute("class", "map"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "A pretend meaning map: documents on similar topics sit close together");
    var out = h("div", { "class": "cols2" });
    var legend = h("ol", { "class": "legend" });
    docs.forEach(function (d) { legend.appendChild(h("li", { text: d[0] })); });
    function pt(v) { return 20 + v * 26; }
    function circle(x, y, r, cls) { var c = document.createElementNS(svgNS, "circle"); c.setAttribute("cx", pt(x)); c.setAttribute("cy", 300 - pt(y)); c.setAttribute("r", r); c.setAttribute("class", cls); svg.appendChild(c); }
    function label(x, y, t, cls) { var e = document.createElementNS(svgNS, "text"); e.setAttribute("x", pt(x)); e.setAttribute("y", 300 - pt(y) + 4); e.setAttribute("text-anchor", "middle"); e.setAttribute("class", cls); e.textContent = t; svg.appendChild(e); }
    function render() {
      var q = qs[Number(sel.value)];
      svg.innerHTML = "";
      var ranked = docs.map(function (d, i) { return { i: i, d: Math.hypot(d[1] - q[1], d[2] - q[2]) }; }).sort(function (a, b) { return a.d - b.d; });
      docs.forEach(function (d, i) { circle(d[1], d[2], 10, "dot doc" + (i === ranked[0].i ? " best" : "")); label(d[1], d[2], String(i + 1), "dl"); });
      circle(q[1], q[2], 8, "dot q"); label(q[1], q[2], "?", "ql");
      var qt = toks(q[0]);
      var kw = docs.map(function (d, i) { var dt = toks(d[0]); return { i: i, s: qt.filter(function (w) { return dt.indexOf(w) >= 0; }).length }; }).sort(function (a, b) { return b.s - a.s; });
      out.innerHTML = "";
      var left = h("div", { "class": "card" }, [h("h3", { text: "Meaning search" }), h("p", { text: "Closest on the map:" }),
        h("ol", {}, ranked.slice(0, 3).map(function (r) { return h("li", { text: docs[r.i][0] }); }))]);
      var right = h("div", { "class": "card" }, [h("h3", { text: "Keyword search" }),
        kw[0].s === 0 ? h("p", { text: "No document shares a word with the question. No result." }) :
        h("div", {}, [h("p", { text: "Best word match (" + kw[0].s + " shared word" + (kw[0].s > 1 ? "s" : "") + "):" }), h("p", { "class": "kwhit", text: docs[kw[0].i][0] })])]);
      out.appendChild(left); out.appendChild(right);
    }
    sel.addEventListener("change", render);
    root.appendChild(h("strong", { text: "Try it: meaning search or keyword search?" }));
    root.appendChild(h("p", { "class": "note", text: "A pretend 2D map. Real embeddings use hundreds or thousands of numbers per text, but the idea is the same: similar meaning sits close together." }));
    root.appendChild(h("p", {}, [document.createTextNode("Ask: "), sel]));
    root.appendChild(h("div", { "class": "mapwrap" }, [svg, legend]));
    root.appendChild(out);
    render();
  };

  // ---------- lethal trifecta checker ----------
  W.trifecta = function (root) {
    var items = [
      ["private", "It can see private data (customer files, emails, internal documents)"],
      ["untrusted", "It reads content from people you do not control (web pages, incoming emails, uploaded files)"],
      ["outbound", "It can send things out (send email, post to a web address, write to a public place)"]
    ];
    var out = h("div", { "class": "result", role: "status", "aria-live": "polite" });
    var boxes = [];
    function update() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      if (n === 3) { out.className = "result err"; out.textContent = "All three together: dangerous. Someone could hide an instruction in the content you read and trick the agent into sending your private data out. Remove at least one of the three."; }
      else if (n === 2) { out.className = "result ok"; out.textContent = "Two of three: manageable, but be careful. Never add the third without a safeguard such as human approval."; }
      else { out.className = "result ok"; out.textContent = n === 1 ? "One of three: low risk from this particular danger." : "Tick what your agent can do."; }
    }
    root.appendChild(h("strong", { text: "Try it: does your agent have all three?" }));
    items.forEach(function (it) {
      var cb = h("input", { type: "checkbox" }); boxes.push(cb); cb.addEventListener("change", update);
      root.appendChild(h("label", { "class": "check" }, [cb, document.createTextNode(" " + it[1])]));
    });
    root.appendChild(out); update();
  };

  document.querySelectorAll("[data-widget]").forEach(function (n) { var f = W[n.getAttribute("data-widget")]; if (f) f(n); });

  // ---------- saved checklists ----------
  document.querySelectorAll("input[data-check]").forEach(function (cb) {
    var key = "chk:" + page + ":" + cb.getAttribute("data-check");
    if (store(key) === "1") cb.checked = true;
    cb.addEventListener("change", function () { store(key, cb.checked ? "1" : "0"); });
  });

  // ---------- mark lesson done + progress on the home page ----------
  document.querySelectorAll("[data-done]").forEach(function (b) {
    var n = b.getAttribute("data-done"), key = "done:" + n;
    function paint() { var d = store(key) === "1"; b.textContent = d ? "Marked as done (click to undo)" : "Mark this lesson as done"; b.setAttribute("aria-pressed", d ? "true" : "false"); }
    b.addEventListener("click", function () { store(key, store(key) === "1" ? "0" : "1"); paint(); });
    paint();
  });
  var cards = document.querySelectorAll("[data-lesson]");
  if (cards.length) {
    var done = 0;
    cards.forEach(function (c) { if (store("done:" + c.getAttribute("data-lesson")) === "1") { c.classList.add("is-done"); done++; } });
    var p = document.getElementById("progress");
    if (p) p.textContent = done + " of " + cards.length + " lessons marked as done in this browser";
  }
})();
