/* Little Dragon Mandarin — game UI.
 * Four levels, each with LEARN (look, listen, see how it's written) and PLAY (quiz with corrections):
 *   1 Sounds (pinyin letters)  2 Tones  3 Strokes (writing gestures)  4 Pictures (first words)
 */
(function () {
  'use strict';
  var MD = window.MD, SK = MD.Strokes;
  var app = document.getElementById('app');

  /* ---------------- helpers ---------------- */
  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function sample(a, n) { return shuffle(a).slice(0, n); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function stars(n) { return '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n); }
  function dayKey(d) { function p(n) { return (n < 10 ? '0' : '') + n; } return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function toneOf(s) {
    if (/[āēīōūǖ]/.test(s)) { return 1; }
    if (/[áéíóúǘ]/.test(s)) { return 2; }
    if (/[ǎěǐǒǔǚ]/.test(s)) { return 3; }
    if (/[àèìòùǜ]/.test(s)) { return 4; }
    return 5;
  }
  function colorPy(py) { return py.split(' ').map(function (s) { return '<span class="t' + toneOf(s) + '">' + esc(s) + '</span>'; }).join(' '); }
  function ribbon(py) {
    return '<div class="ribbon">' + py.split(' ').map(function (s) {
      var t = toneOf(s); return '<div class="syl t' + t + '">' + contourSvg(t, 'mini') + '<span>' + esc(s) + '</span></div>';
    }).join('') + '</div>';
  }

  var toastTimer;
  function toast(msg, ms) {
    var el = document.getElementById('toast');
    el.textContent = msg; el.className = 'show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = ''; }, ms || 3500);
  }

  /* ---------------- sound ----------------
   * 1) the device's own Mandarin voice (works offline once a voice is installed)
   * 2) if there is none, or it stays silent, an online voice as a backup
   */
  var synthOK = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  var soundInfo = { path: 'none', voice: '' };
  var currentAudio = null, speakId = 0;

  function listVoices(cb) {
    if (!synthOK) { return cb([]); }
    var synth = window.speechSynthesis, done = false;
    var vs = synth.getVoices() || [];
    if (vs.length) { return cb(vs); }
    function finish() { if (!done) { done = true; cb(synth.getVoices() || []); } }
    try { synth.addEventListener('voiceschanged', function () { if ((synth.getVoices() || []).length) { finish(); } }); } catch (e) { /* old browser */ }
    setTimeout(finish, 1500);
  }
  function chooseVoice(vs) {
    var best = null, bestScore = -1, i, v, lang, s;
    for (i = 0; i < vs.length; i++) {
      v = vs[i]; lang = String(v.lang || '').replace('_', '-').toLowerCase();
      if (!(lang.indexOf('zh') === 0 || lang.indexOf('cmn') === 0)) { continue; }
      if (/hk|yue|cantonese/i.test(lang + ' ' + v.name)) { continue; }   // Cantonese is a different language
      s = 1;
      if (lang === 'zh-cn' || lang === 'cmn-cn' || lang === 'zh-hans-cn') { s += 10; }
      if (/natural|neural|online|google/i.test(v.name)) { s += 2; }
      if (s > bestScore) { best = v; bestScore = s; }
    }
    return best;
  }
  function stopSound() {
    speakId++;
    try { if (synthOK) { window.speechSynthesis.cancel(); } } catch (e) { /* ignore */ }
    try { if (currentAudio) { currentAudio.pause(); currentAudio = null; } } catch (e2) { /* ignore */ }
  }
  function playOnline(text, rate) {
    return new Promise(function (resolve, reject) {
      try {
        var a = new Audio('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-CN&q=' + encodeURIComponent(text));
        a.playbackRate = rate < 0.55 ? 0.7 : 0.9;
        currentAudio = a;
        a.onended = function () { resolve(); };
        a.onerror = function () { reject(new Error('online audio failed')); };
        var p = a.play();
        if (p && p.catch) { p.catch(reject); }
      } catch (e) { reject(e); }
    });
  }
  function speak(text, rate) {
    rate = rate || 0.7;
    var id = ++speakId;
    try { if (synthOK) { window.speechSynthesis.cancel(); } } catch (e) { /* ignore */ }
    try { if (currentAudio) { currentAudio.pause(); currentAudio = null; } } catch (e2) { /* ignore */ }
    return new Promise(function (resolve) {
      function online(why) {
        playOnline(text, rate).then(function () { soundInfo = { path: 'online', voice: 'online voice' }; resolve(); }, function () {
          soundInfo = { path: 'none', voice: '' };
          if (id === speakId) { toast(why + ' Tap “Test sound” on the home page for help.', 6000); }
          resolve();
        });
      }
      if (!synthOK) { return online('This browser has no built-in voice.'); }
      listVoices(function (vs) {
        var v = chooseVoice(vs);
        if (!v) { return online('No Mandarin voice is installed on this device.'); }
        var synth = window.speechSynthesis, started = false, ended = false;
        setTimeout(function () {   // a short pause after cancel() avoids a Chrome bug that swallows the next voice
          if (id !== speakId) { return resolve(); }
          var u = new SpeechSynthesisUtterance(text);
          u.voice = v; u.lang = v.lang || 'zh-CN'; u.rate = rate; u.pitch = 1; u.volume = 1;
          u.onstart = function () { started = true; soundInfo = { path: 'device', voice: v.name }; };
          u.onend = function () { ended = true; resolve(); };
          u.onerror = function (e) {
            if (!started && e && e.error !== 'canceled' && e.error !== 'interrupted') { online('The built-in voice failed.'); } else { resolve(); }
          };
          try { synth.resume(); } catch (e3) { /* ignore */ }
          synth.speak(u);
          setTimeout(function () {
            if (!started && !ended && id === speakId) { try { synth.cancel(); } catch (e4) { /* ignore */ } online('The built-in voice stayed silent.'); }
          }, 2200);
        }, 80);
      });
    });
  }
  function speakSeq(list) {
    return list.reduce(function (p, t) { return p.then(function () { return speak(t, 0.6); }).then(function () { return new Promise(function (r) { setTimeout(r, 250); }); }); }, Promise.resolve());
  }
  if (synthOK) { try { window.speechSynthesis.getVoices(); } catch (e) { /* ignore */ } }

  function soundReport() {
    var haveMic = MD.Speech.supported();
    var line = soundInfo.path === 'device' ? '✅ Sound works. Using your device voice: ' + soundInfo.voice + '.'
      : soundInfo.path === 'online' ? '✅ Sound works through an online voice (your device has no Mandarin voice installed).'
      : '⚠️ I could not make any sound.';
    var help = soundInfo.path === 'none'
      ? '<ul class="helpList"><li>Turn the volume up, and check the device is not on silent.</li>' +
        '<li><b>Windows:</b> Settings → Time &amp; language → Language &amp; region → add <i>Chinese (Simplified)</i>, then Options → install Speech.</li>' +
        '<li><b>iPad / iPhone:</b> Settings → Accessibility → Spoken Content → Voices → Chinese → download a voice.</li>' +
        '<li><b>Android:</b> Settings → Text-to-speech output → install <i>Chinese</i> voice data.</li>' +
        '<li>Try Chrome, Edge or Safari, and check you are online.</li></ul>' : '';
    return '<p>' + line + '</p>' + help + '<p class="note">Speaking practice: ' +
      (haveMic ? 'this browser can listen to you. 🎤' : 'this browser cannot score your voice, but you can still record and compare.') + '</p>';
  }

  /* ---------------- progress (saved only in this browser) ---------------- */
  var store = (function () {
    var KEY = 'littleDragonMandarin.v1', d = { stars: {}, written: {}, days: {} };
    try { var raw = JSON.parse(localStorage.getItem(KEY)); if (raw) { d = raw; d.stars = d.stars || {}; d.written = d.written || {}; d.days = d.days || {}; } } catch (e) { /* private mode */ }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* ignore */ } }
    return {
      stars: function (id) { return d.stars[id] || 0; },
      setStars: function (id, n) { if (n > (d.stars[id] || 0)) { d.stars[id] = n; save(); } },
      written: function (ch) { return !!d.written[ch]; },
      setWritten: function (ch) { d.written[ch] = true; save(); },
      total: function () { var t = 0; for (var k in d.stars) { t += d.stars[k]; } return t; },
      markDay: function () { d.days[dayKey(new Date())] = true; save(); },
      hasDay: function (k) { return !!d.days[k]; },
      streak: function () {
        var n = 0, t = new Date();
        if (!d.days[dayKey(t)]) { t.setDate(t.getDate() - 1); }
        while (d.days[dayKey(t)]) { n++; t.setDate(t.getDate() - 1); }
        return n;
      },
      reset: function () { d = { stars: {}, written: {}, days: {} }; save(); }
    };
  })();

  /* ---------------- SVG pieces ---------------- */
  function contourSvg(t, cls) {
    var lines = '', i;
    for (i = 0; i < 5; i++) { lines += '<line class="pl" x1="4" x2="56" y1="' + (10 + i * 10) + '" y2="' + (10 + i * 10) + '"/>'; }
    var paths = { 1: 'M8 10 L52 10', 2: 'M8 30 L52 10', 3: 'M8 40 Q24 62 52 20', 4: 'M8 10 L52 50' };
    var ends = { 1: [52, 10], 2: [52, 10], 3: [52, 20], 4: [52, 50] };
    var body = t === 5 ? '<circle class="td" cx="30" cy="46" r="4"/>'
      : '<path class="tp" d="' + paths[t] + '"/><circle class="td" cx="' + ends[t][0] + '" cy="' + ends[t][1] + '" r="3.5"/>';
    return '<svg class="contour ' + (cls || '') + '" viewBox="0 0 60 60" role="img" aria-label="tone ' + t + ' shape">' + lines + body + '</svg>';
  }

  function strokeAnimSvg(pts) {
    var d = 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L');
    return '<svg class="strokeAnim" viewBox="0 0 100 100" role="img" aria-label="stroke animation">' +
      '<rect x="2" y="2" width="96" height="96" class="gbox"/><line x1="2" y1="50" x2="98" y2="50" class="gl"/><line x1="50" y1="2" x2="50" y2="98" class="gl"/>' +
      '<path d="' + d + '" class="guide"/><path d="' + d + '" pathLength="1" class="draw"/>' +
      '<circle cx="' + pts[0][0] + '" cy="' + pts[0][1] + '" r="4.5" class="start"/></svg>';
  }

  // Four-line, three-space handwriting guide, like Chinese children use for pinyin practice.
  function fourLineSvg(text) {
    var ys = [8, 22, 36, 50], i, lines = '';
    for (i = 0; i < 4; i++) { lines += '<line x1="2" x2="118" y1="' + ys[i] + '" y2="' + ys[i] + '" class="' + (i === 2 ? 'base' : 'fl') + '"/>'; }
    var n = text.length, size = n <= 2 ? 27 : n <= 6 ? 20 : n <= 12 ? 13 : 8.2;
    return '<svg class="fourline" viewBox="0 0 120 58" role="img" aria-label="letters on a four-line guide">' + lines +
      '<text x="60" y="36" text-anchor="middle" font-size="' + size + '">' + esc(text) + '</text></svg>';
  }

  function speakBtn(text, label, cls) {
    return '<button class="speak ' + (cls || '') + '" data-say="' + esc(text) + '" aria-label="Hear ' + esc(text) + '">' + (label || '🔊') + '</button>';
  }
  function chipsFor(ch) {
    return '<ol class="chips">' + ch.strokes.map(function (s, i) {
      var arr = (s.dirs || []).map(function (d) { return SK.ARROW[d]; }).join('');
      return '<li><b>' + (i + 1) + '</b> ' + (s.zh ? s.zh + ' <small>' + s.py + '</small>' : '<small>' + arr + '</small>') + '</li>'; }).join('') + '</ol>';
  }
  function miniWriter(chStr, label) {
    return '<div class="writeBox"><canvas class="mini" width="400" height="400" data-char="' + chStr + '" aria-label="stroke order of ' + chStr + '"></canvas>' +
      '<p class="cap">✍️ ' + (label || 'How ' + chStr + ' is written') + '</p>' + (MD.CHARS_BY[chStr] ? chipsFor(MD.CHARS_BY[chStr]) : '') + '</div>';
  }

  /* ---------------- the stroke-by-stroke writing canvas ---------------- */
  var K = 4; // canvas px per grid unit
  var DUR = 700, GAP = 250;
  function Writer(canvas, ch, opts) {
    opts = opts || {};
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.ch = ch;
    this.mode = opts.mode || 'watch'; this.repeat = !!opts.repeat;
    this.onFeedback = opts.onFeedback || function () {};
    this.onComplete = opts.onComplete || function () {};
    this.reset();
    this.bind();
  }
  Writer.prototype.reset = function () {
    this.idx = 0; this.done = []; this.cur = null; this.bad = null; this.demo = null;
    this.fails = 0; this.mistakes = 0; this.anim = null; this.free = [];
    this.draw();
  };
  Writer.prototype.setMode = function (m) {
    this.mode = m; this.reset();
    if (m === 'watch') { this.play(); }
  };
  Writer.prototype.pt = function (e) {
    var r = this.canvas.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100];
  };
  Writer.prototype.bind = function () {
    var self = this, c = this.canvas;
    c.style.touchAction = 'none';
    c.addEventListener('pointerdown', function (e) {
      if (e.isPrimary === false || self.mode === 'watch' || (self.mode !== 'free' && self.idx >= self.ch.strokes.length)) { return; }
      e.preventDefault();
      try { c.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      self.demo = null; self.cur = [self.pt(e)]; self.draw();
    });
    c.addEventListener('pointermove', function (e) { if (self.cur) { self.cur.push(self.pt(e)); self.draw(); } });
    function end() { if (self.cur) { self.finish(); } }
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', function () { self.cur = null; self.draw(); });
  };
  Writer.prototype.finish = function () {
    var self = this, drawn = this.cur; this.cur = null;
    var strokes = this.ch.strokes;
    if (this.mode === 'free') { if (drawn.length > 1) { this.free.push(drawn); } this.draw(); return; }
    var res = SK.evaluate(strokes, this.idx, drawn, this.mode === 'trace' ? 26 : 32);
    if (res.code === 'short') { this.draw(); this.onFeedback(res); return; }
    if (res.ok) {
      this.done.push(this.idx); this.idx++; this.fails = 0; this.draw();
      this.onFeedback(res);
      if (this.idx >= strokes.length) { this.onComplete({ mistakes: this.mistakes }); }
    } else {
      this.fails++; this.mistakes++; this.bad = drawn; this.draw();
      this.onFeedback(res);
      setTimeout(function () { self.bad = null; self.draw(); }, 600);
      if (this.fails >= 2 || res.code === 'dir' || res.code === 'order') {
        setTimeout(function () { self.hint(); }, 700);
      }
    }
  };
  Writer.prototype.hint = function () {
    if (this.idx >= this.ch.strokes.length) { return; }
    this.demo = { i: this.idx, start: performance.now() }; this.loop();
  };
  Writer.prototype.play = function () {
    this.anim = { start: performance.now() }; this.loop();
  };
  Writer.prototype.total = function () { return this.ch.strokes.length * (DUR + GAP); };
  Writer.prototype.animating = function () {
    var now = performance.now();
    if (this.mode === 'watch' && this.anim) {
      if (this.repeat && now - this.anim.start > this.total() + 1400) { this.anim.start = now; }
      return this.repeat || now - this.anim.start < this.total();
    }
    return !!(this.demo && now - this.demo.start < DUR + 100);
  };
  Writer.prototype.loop = function () {
    var self = this;
    if (this._raf) { cancelAnimationFrame(this._raf); }
    (function step() {
      if (!self.canvas.isConnected) { return; }
      self.draw();
      if (self.animating()) { self._raf = requestAnimationFrame(step); }
    })();
  };
  Writer.prototype.line = function (pts, frac, color, width) {
    var p = SK.partial(pts, frac), ctx = this.ctx, i;
    ctx.beginPath(); ctx.moveTo(p[0][0] * K, p[0][1] * K);
    for (i = 1; i < p.length; i++) { ctx.lineTo(p[i][0] * K, p[i][1] * K); }
    if (p.length === 1) { ctx.lineTo(p[0][0] * K + 0.1, p[0][1] * K); }
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  };
  Writer.prototype.badge = function (p, n, fill) {
    var ctx = this.ctx;
    ctx.beginPath(); ctx.arc(p[0] * K, p[1] * K, 15, 0, 6.2832); ctx.fillStyle = fill; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(n), p[0] * K, p[1] * K + 1);
  };
  Writer.prototype.grid = function () {
    var ctx = this.ctx, W = 400;
    ctx.fillStyle = '#fffdf6'; ctx.fillRect(0, 0, W, W);
    ctx.strokeStyle = '#f0a8a8'; ctx.lineWidth = 3; ctx.setLineDash([]); ctx.strokeRect(4, 4, W - 8, W - 8);
    ctx.lineWidth = 1.5; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(W / 2, 4); ctx.lineTo(W / 2, W - 4); ctx.moveTo(4, W / 2); ctx.lineTo(W - 4, W / 2);
    ctx.moveTo(4, 4); ctx.lineTo(W - 4, W - 4); ctx.moveTo(W - 4, 4); ctx.lineTo(4, W - 4); ctx.stroke();
    ctx.setLineDash([]);
  };
  Writer.prototype.draw = function () {
    var ctx = this.ctx, S = this.ch.strokes, i, now = performance.now();
    ctx.clearRect(0, 0, 400, 400);
    this.grid();
    if (this.mode === 'watch') {
      var t = this.anim ? now - this.anim.start : 1e9;
      if (this.repeat && this.anim) { t = Math.min(t, this.total() + 1e3); }
      for (i = 0; i < S.length; i++) {
        var p = Math.max(0, Math.min(1, (t - i * (DUR + GAP)) / DUR));
        if (p > 0) {
          if (p >= 1) { this.paintStroke(S[i], '#073b4c'); } else { this.line(S[i].pts, p, '#e63946', 13); }
          this.badge(S[i].pts[0], i + 1, p < 1 ? '#e63946' : '#118ab2');
        }
      }
      return;
    }
    if (this.mode === 'trace' || this.mode === 'free') {
      for (i = (this.mode === 'free' ? 0 : this.idx); i < S.length; i++) { this.paintStroke(S[i], '#e8e1cf', true); }
    }
    for (i = 0; i < this.done.length; i++) { this.paintStroke(S[this.done[i]], '#073b4c'); }
    for (i = 0; i < this.free.length; i++) { this.raw(this.free[i], '#073b4c'); }
    if (this.demo) {
      this.line(S[this.demo.i].pts, Math.min(1, (now - this.demo.start) / DUR), '#118ab2', 13);
      this.badge(S[this.demo.i].pts[0], this.demo.i + 1, '#118ab2');
    }
    if (this.mode === 'trace' && this.idx < S.length && !this.cur && !this.demo) {
      this.badge(S[this.idx].pts[0], this.idx + 1, '#f4a261');
    }
    if (this.bad) { this.raw(this.bad, '#e63946'); }
    if (this.cur) { this.raw(this.cur, '#e76f51'); }
  };
  Writer.prototype.paintStroke = function (st, color, ghost) {
    if (!st.path) { this.line(st.pts, 1, color, ghost ? 17 : 13); return; }
    var ctx = this.ctx, k = 400 / 1024;
    if (!st.p2d) { st.p2d = new Path2D(st.path); }
    ctx.save(); ctx.setTransform(k, 0, 0, -k, 0, 900 * k); ctx.fillStyle = color; ctx.fill(st.p2d); ctx.restore();
  };
  Writer.prototype.raw = function (pts, color) {
    var ctx = this.ctx, i;
    ctx.beginPath(); ctx.moveTo(pts[0][0] * K, pts[0][1] * K);
    for (i = 1; i < pts.length; i++) { ctx.lineTo(pts[i][0] * K, pts[i][1] * K); }
    ctx.strokeStyle = color; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  };

  /* ---------------- levels ---------------- */
  var LEVELS = [
    { id: 'sounds',  n: 1, icon: '🔤', title: 'Sounds',     zh: '拼音',   sub: 'The pinyin alphabet: letters, mouth shapes and a first word for each' },
    { id: 'tones',   n: 2, icon: '🎵', title: 'Tones',      zh: '声调',   sub: 'Four melodies that change what a word means' },
    { id: 'phrases', n: 3, icon: '💬', title: 'Phrases',    zh: '常用语', sub: 'Numbers, family, colours, food and everyday things to say' },
    { id: 'speak',   n: 4, icon: '🎤', title: 'Say it',     zh: '说',     sub: 'Say phrases out loud and see how close you sounded' },
    { id: 'talk',    n: 5, icon: '🗣️', title: 'Talk',       zh: '对话',   sub: 'Hold short conversations: listen, reply, then say it' },
    { id: 'grammar', n: 6, icon: '🧩', title: 'Grammar',    zh: '语法',   sub: 'Why Mandarin is easier than it looks: verbs never change' },
    { id: 'strokes', n: 7, icon: '✏️', title: 'Stroke basics', zh: '笔画', sub: 'The strokes, stroke order and your first characters' },
    { id: 'write',   n: 8, icon: '✍️', title: 'Handwriting', zh: '写字',  sub: 'Write the words from the Phrases level on a tablet or phone' }
  ];
  var LEVEL_BY = {}; LEVELS.forEach(function (l) { LEVEL_BY[l.id] = l; });
  LEVEL_BY.daily = { id: 'daily', icon: '☀️', title: 'Daily 5', zh: '每日' };
  LEVEL_BY.manners = { id: 'manners', icon: '🚫', title: 'Words to avoid', zh: '小心' };

  /* ---------------- LEARN cards ---------------- */
  function soundCard(it) {
    var w = it.word;
    return '<div class="card sound">' +
      '<div class="tag">' + (it.kind === 'initial' ? 'Starting sound · 声母' : 'Ending sound · 韵母') + '</div>' +
      '<div class="letterRow"><div class="letterBig">' + it.id + '</div>' +
        speakBtn(it.say, it.kind === 'initial' ? '🔊 Hear “' + it.syl + '”' : '🔊 Hear a word with it', 'pill') + '</div>' +
      fourLineSvg(it.id) +
      '<p class="hint">👄 ' + esc(it.hint) + '</p>' +
      '<div class="wordCard"><div class="pic">' + w.pic + '</div><div class="hz">' + w.hz + '</div>' +
        '<div class="py">' + w.py + '</div><div class="en">' + w.en + '</div>' + speakBtn(w.hz, '🔊 Hear it', 'pill') + '</div>' +
      (MD.CHARS_BY[w.hz] ? miniWriter(w.hz) : '') + '</div>';
  }
  function toneCard(t) {
    var info = MD.TONES[t - 1], ex, exTxt;
    if (t <= 4) { var e = MD.TONE_SETS[0].items[t - 1]; ex = { py: e.py, ch: e.ch, en: e.en }; }
    else { ex = { py: 'mā ma', ch: '妈妈', en: 'mommy' }; }
    exTxt = '<div class="wordCard"><div class="hz">' + ex.ch + '</div><div class="py">' + ex.py + '</div><div class="en">' + ex.en + '</div>' + speakBtn(ex.ch, '🔊 Hear it', 'pill') + '</div>';
    return '<div class="card tone"><div class="tag">' + info.name + ' · ' + info.zh + '</div>' +
      '<div class="letterRow"><div class="letterBig mark">' + info.mark + '</div></div>' + contourSvg(t, 'big') +
      '<p class="hint">🎵 ' + esc(info.hint) + '</p>' + exTxt +
      (t <= 4 ? '<button class="btn alt" data-act="hearall">🔊 Hear all four: mā má mǎ mà</button>' : '') +
      '<p class="note">Tone marks sit on the main vowel: <b>ā á ǎ à</b>.</p></div>';
  }
  function strokeTypeCard(t) {
    return '<div class="card strokeT"><div class="tag">Stroke · 笔画</div>' +
      '<div class="letterRow"><div class="letterBig zh">' + t.zh + '</div></div>' +
      '<div class="py big">' + t.py + ' <small>(' + t.en + ')</small></div>' + strokeAnimSvg(t.pts) +
      '<p class="hint">✋ ' + esc(MD.STROKE_HOW[t.id]) + '</p>' +
      '<p class="note">Found in <b class="zhs">' + t.eg + '</b></p></div>';
  }
  function charCard(c) {
    return '<div class="card charC"><div class="tag">Character · 汉字</div>' +
      '<div class="wordCard"><div class="pic">' + c.pic + '</div><div class="hz">' + c.ch + '</div><div class="py">' + c.py + '</div><div class="en">' + c.en + '</div>' +
      speakBtn(c.ch, '🔊 Hear it', 'pill') + '</div>' + miniWriter(c.ch, c.strokes.length + ' strokes, watch the order') +
      '<button class="btn" data-act="write" data-ch="' + c.ch + '">✍️ Try writing it</button></div>';
  }
  function wordCard(w) {
    return '<div class="card word"><div class="tag">Picture word · 图画</div>' +
      '<div class="wordCard solo"><div class="pic huge">' + w.pic + '</div><div class="hz">' + w.hz + '</div><div class="py">' + w.py + '</div><div class="en">' + w.en + '</div>' +
      speakBtn(w.hz, '🔊 Hear it', 'pill') + '</div>' +
      (MD.CHARS_BY[w.hz] ? miniWriter(w.hz) : '') + '</div>';
  }

  function phraseCard(p) {
    return '<div class="card phrase"><div class="tag">' + esc(p.theme) + '</div>' +
      '<div class="pic huge">' + p.pic + '</div><div class="en big">' + esc(p.en) + '</div>' +
      '<div class="py phr">' + colorPy(p.py) + '</div>' + ribbon(p.py) +
      '<div class="btns center">' + speakBtn(p.hz, '🔊 Hear it', 'pill') +
      '<button class="speak pill" data-say="' + esc(p.hz) + '" data-rate="0.4">🐢 Slowly</button></div>' +
      '<p class="cap">Your turn: say it</p>' + sayPanel(p.hz, p.py) +
      (p.note ? '<p class="hint">💡 ' + esc(p.note) + '</p>' : '') +
      '<p class="cap">How the pinyin is written</p>' + fourLineSvg(p.py) +
      '<p class="peek">In characters: <span class="hz">' + p.hz + '</span> <small>(just look for now)</small></p></div>';
  }
  function sentenceCard(o, en, pic) {
    return '<div class="card sentence">' + (pic ? '<div class="pic">' + pic + '</div>' : '') +
      '<div class="py phr">' + colorPy(o.py) + '</div><div class="hz">' + o.hz + '</div>' +
      (en ? '<div class="en">' + esc(en) + '</div>' : '') + speakBtn(o.hz, '🔊 Hear it', 'pill') + '</div>';
  }
  function gramCard(g) {
    var rows = g.rows.map(function (r) {
      var h = r.hl ? esc(r.hz).split(r.hl).join('<mark>' + r.hl + '</mark>') : esc(r.hz);
      return '<div class="gRow"><div><div class="hz">' + h + '</div><div class="py">' + colorPy(r.py) + '</div><div class="en">' + esc(r.en) + '</div></div>' + speakBtn(r.hz, '🔊') + '</div>';
    }).join('');
    return '<div class="card gram"><div class="tag">Grammar</div><div class="pic">' + g.pic + '</div><h3>' + esc(g.title) + '</h3>' +
      '<p class="hint">' + esc(g.rule) + '</p>' + rows + '</div>';
  }
  function sandhiCard() {
    function row(hz, py, en) { return '<div class="gRow"><div><div class="hz">' + hz + '</div><div class="py">' + colorPy(py) + '</div><div class="en">' + en + '</div></div>' + speakBtn(hz, '🔊') + '</div>'; }
    return '<div class="card gram"><div class="tag">Tones shift a little · 变调</div><h3>Three small tone tricks</h3>' +
      '<p class="hint">Real speech bends the tones a little. Learn these three and you will sound natural.</p>' +
      row('你好', 'ní hǎo', 'Two third tones in a row: the first rises, like a second tone.') +
      row('不是', 'bú shì', '不 (bù) turns into “bú” before a fourth tone.') +
      row('一遍', 'yí biàn', '一 (yī) turns into “yí” before a fourth tone.') + '</div>';
  }

  function learnCards(level) {
    var out = [], i;
    if (level === 'sounds') {
      MD.INITIALS.forEach(function (x) { out.push({ group: 'Starting sounds', html: soundCard(x) }); });
      MD.FINALS.forEach(function (x) { out.push({ group: 'Ending sounds', html: soundCard(x) }); });
    } else if (level === 'tones') {
      for (i = 1; i <= 5; i++) { out.push({ group: 'Tones', html: toneCard(i) }); }
      out.push({ group: 'Tones', html: sandhiCard() });
    } else if (level === 'strokes') {
      MD.STROKE_TYPES.forEach(function (t) { out.push({ group: 'Stroke types', html: strokeTypeCard(t) }); });
      MD.CHARS.forEach(function (c) { out.push({ group: 'Characters', html: charCard(c) }); });
    } else if (level === 'manners') {
      out.push({ group: 'Read first', html: mannersIntro() });
      MD.MANNERS.forEach(function (m) { out.push({ group: MD.SEVERITY[m.sev].short, html: mannersCard(m) }); });
    } else if (level === 'phrases') {
      MD.PHRASES.forEach(function (p) { out.push({ group: p.theme, html: phraseCard(p) }); });
    } else {
      MD.GRAMMAR.forEach(function (g) { out.push({ group: 'Rules', html: gramCard(g) }); });
    }
    return out;
  }

  /* ---------------- QUIZ question builders ---------------- */
  function optBtn(i, inner, cls) { return '<button class="opt ' + (cls || '') + '" data-act="ans" data-i="' + i + '">' + inner + '</button>'; }

  function distractors(pool, target, ok, n) {
    var good = shuffle(pool.filter(function (x) { return x !== target && ok(x); }));
    var rest = shuffle(pool.filter(function (x) { return x !== target && good.indexOf(x) < 0; }));
    return good.concat(rest).slice(0, n);
  }
  function assemble(correctItem, others, keyFn, htmlFn) {
    var all = shuffle([correctItem].concat(others));
    return { options: all.map(function (x) { return { key: keyFn(x), html: htmlFn(x) }; }), correct: keyFn(correctItem) };
  }

  function soundQ(it) {
    var pool = it.kind === 'initial' ? MD.INITIALS : MD.FINALS, w = it.word, isI = it.kind === 'initial';
    var type = rand(isI ? ['hear', 'l2p', 'p2l'] : ['l2p', 'p2l']), q = {}, o;
    var match = it.match || [it.id];
    function hasMatch(x) { return match.some(function (m) { return x.word.tl.indexOf(m) >= 0; }); }
    if (type === 'hear') {
      o = assemble(it, distractors(pool, it, function () { return true; }, 3), function (x) { return x.id; }, function (x) { return '<span class="optL">' + x.id + '</span>'; });
      q.prompt = '<div class="qMain">' + speakBtn(it.say, '🔊', 'bigspeak') + '</div><p class="ask">Which letter do you hear?</p>';
      q.auto = it.say;
    } else if (type === 'l2p') {
      o = assemble(it, distractors(pool, it, function (x) { return !hasMatch(x); }, 3), function (x) { return x.id; }, function (x) { return '<span class="optPic">' + x.word.pic + '</span>'; });
      q.prompt = '<div class="qMain"><div class="letterBig">' + it.id + '</div>' + (isI ? speakBtn(it.say, '🔊', 'speak') : '') + '</div><p class="ask">' +
        (isI ? 'Which picture starts with this sound?' : 'Which picture has this sound inside?') + '</p>';
      // the answer key for this type is the picture's letter, so options map back to the correct item
    } else {
      o = assemble(it, distractors(pool, it, function (x) { return w.tl.indexOf(x.id) < 0; }, 3), function (x) { return x.id; }, function (x) { return '<span class="optL">' + x.id + '</span>'; });
      q.prompt = '<div class="qMain"><div class="wordCard solo"><div class="pic">' + w.pic + '</div><div class="hz">' + w.hz + '</div><div class="py">' + w.py + '</div></div>' + speakBtn(w.hz, '🔊', 'speak') + '</div><p class="ask">' +
        (isI ? 'Which letter does this word start with?' : 'Which ending sound is inside this word?') + '</p>';
      q.auto = w.hz;
    }
    q.options = o.options; q.correct = o.correct; q.cls = type === 'l2p' ? 'pics' : 'letters';
    q.explain = function () { return soundCard(it); };
    return q;
  }

  function toneItems() {
    var all = [];
    MD.TONE_SETS.forEach(function (s) { s.items.forEach(function (i) { all.push({ t: i.t, py: i.py, ch: i.ch, en: i.en, syl: s.syl, set: s }); }); });
    return all;
  }
  function toneQ(it) {
    var type = rand(['hear', 'py2shape', 'shape2py']), q = {};
    if (type === 'shape2py') {
      q.prompt = '<div class="qMain">' + contourSvg(it.t, 'big') + '</div><p class="ask">Which word has this tone? <b>' + it.syl + '</b></p>';
      q.options = shuffle(it.set.items).map(function (x) { return { key: x.t, html: '<span class="optL">' + x.py + '</span>' }; });
      q.cls = 'letters';
    } else {
      q.prompt = (type === 'hear'
        ? '<div class="qMain">' + speakBtn(it.ch, '🔊', 'bigspeak') + '</div><p class="ask">Listen. Which tone is it?</p>'
        : '<div class="qMain"><div class="py huge">' + it.py + '</div>' + speakBtn(it.ch, '🔊', 'speak') + '</div><p class="ask">Which tone shape matches?</p>');
      if (type === 'hear') { q.auto = it.ch; }
      q.options = [1, 2, 3, 4].map(function (t) { return { key: t, html: contourSvg(t, 'optShape') }; });
      q.cls = 'shapes';
    }
    q.correct = it.t;
    q.explain = function () {
      return '<div class="card tone"><div class="wordCard"><div class="hz">' + it.ch + '</div><div class="py">' + it.py + '</div><div class="en">' + it.en + '</div>' +
        speakBtn(it.ch, '🔊 Hear it', 'pill') + '</div>' + contourSvg(it.t, 'big') + '<p class="hint">🎵 ' + esc(MD.TONES[it.t - 1].hint) + '</p></div>';
    };
    return q;
  }

  function strokeQ(it) {
    var q = {};
    if (it.pts) { // a stroke type: name it
      q.prompt = '<div class="qMain">' + strokeAnimSvg(it.pts) + '</div><p class="ask">What is this stroke called?</p>';
      var o = assemble(it, distractors(MD.STROKE_TYPES, it, function () { return true; }, 3), function (x) { return x.id; },
        function (x) { return '<span class="optZh">' + x.zh + '</span><small>' + x.py + '</small>'; });
      q.options = o.options; q.correct = o.correct; q.cls = 'letters';
      q.explain = function () { return strokeTypeCard(it); };
      return q;
    }
    if (Math.random() < 0.5) { // count the strokes
      var n = it.strokes.length, nums = shuffle([1, 2, 3, 4, 5, 6].filter(function (x) { return x !== n; })).slice(0, 3).concat([n]);
      q.prompt = '<div class="qMain"><div class="hz huge">' + it.ch + '</div>' + speakBtn(it.ch, '🔊', 'speak') + '</div><p class="ask">How many strokes does it have?</p>';
      q.options = shuffle(nums).map(function (x) { return { key: x, html: '<span class="optL">' + x + '</span>' }; });
      q.correct = n; q.cls = 'letters';
    } else { // match the picture to its character
      var o2 = assemble(it, distractors(MD.CHARS, it, function () { return true; }, 3), function (x) { return x.ch; }, function (x) { return '<span class="optZh">' + x.ch + '</span>'; });
      q.prompt = '<div class="qMain"><div class="pic huge">' + it.pic + '</div></div><p class="ask">' + it.py + ' (' + it.en + '). Which character is it?</p>';
      q.options = o2.options; q.correct = o2.correct; q.cls = 'letters'; q.auto = it.ch;
    }
    q.explain = function () { return charCard(it); };
    return q;
  }

  function wordQ(w) {
    var type = rand(['pic2py', 'hear2pic', 'hz2pic', 'pic2hz']), q = {}, o;
    var others = distractors(MD.WORDS, w, function (x) { return x.pic !== w.pic && x.hz !== w.hz; }, 3);
    if (type === 'pic2py') {
      o = assemble(w, others, function (x) { return x.hz; }, function (x) { return '<span class="optPy">' + x.py + '</span>'; });
      q.prompt = '<div class="qMain"><div class="pic huge">' + w.pic + '</div></div><p class="ask">How do you say it?</p>'; q.cls = 'letters';
    } else if (type === 'pic2hz') {
      o = assemble(w, others, function (x) { return x.hz; }, function (x) { return '<span class="optZh">' + x.hz + '</span>'; });
      q.prompt = '<div class="qMain"><div class="pic huge">' + w.pic + '</div></div><p class="ask">Which characters mean this?</p>'; q.cls = 'letters';
    } else {
      o = assemble(w, others, function (x) { return x.hz; }, function (x) { return '<span class="optPic">' + x.pic + '</span>'; });
      q.cls = 'pics';
      if (type === 'hear2pic') { q.prompt = '<div class="qMain">' + speakBtn(w.hz, '🔊', 'bigspeak') + '</div><p class="ask">Listen. Which picture is it?</p>'; q.auto = w.hz; }
      else { q.prompt = '<div class="qMain"><div class="hz huge">' + w.hz + '</div>' + speakBtn(w.hz, '🔊', 'speak') + '</div><p class="ask">Which picture is it?</p>'; }
    }
    q.options = o.options; q.correct = o.correct;
    q.explain = function () { return wordCard(w); };
    return q;
  }

  function phraseQ(p) {
    var type = rand(['hear2pic', 'py2en', 'en2py']), q = {}, o;
    var others = distractors(MD.PHRASES, p, function (x) { return x.pic !== p.pic && x.hz !== p.hz; }, 3);
    function key(x) { return x.hz; }
    if (type === 'hear2pic') {
      o = assemble(p, others, key, function (x) { return '<span class="optPic">' + x.pic + '</span>'; });
      q.prompt = '<div class="qMain">' + speakBtn(p.hz, '🔊', 'bigspeak') + '<button class="speak" data-say="' + esc(p.hz) + '" data-rate="0.4" aria-label="Hear it slowly">🐢</button></div><p class="ask">Listen. Which picture is it?</p>';
      q.auto = p.hz; q.cls = 'pics';
    } else if (type === 'py2en') {
      o = assemble(p, others, key, function (x) { return '<span class="optEn">' + esc(x.en) + '</span>'; });
      q.prompt = '<div class="qMain"><div class="py phr">' + colorPy(p.py) + '</div>' + speakBtn(p.hz, '🔊', 'speak') + '</div>' + ribbon(p.py) + '<p class="ask">What does it mean?</p>';
      q.cls = 'texts'; q.auto = p.hz;
    } else {
      o = assemble(p, others, key, function (x) { return '<span class="optPy">' + esc(x.py) + '</span>'; });
      q.prompt = '<div class="qMain"><div class="pic huge">' + p.pic + '</div></div><p class="ask">How do you say <b>' + esc(p.en) + '</b>?</p>';
      q.cls = 'texts';
    }
    q.options = o.options; q.correct = o.correct;
    q.explain = function () { return phraseCard(p); };
    return q;
  }

  function byTile(B, id) { return B.tiles.filter(function (t) { return t.id === id; })[0]; }
  function tileHtml(t, cls, act) { return '<button class="tile ' + cls + '" data-act="' + act + '" data-id="' + t.id + '"><b>' + esc(t.py) + '</b><span>' + t.hz + '</span></button>'; }
  function buildInner(q, pick, done) {
    var B = q.build, slots = '', bank = '', i;
    for (i = 0; i < B.tiles.length; i++) {
      if (pick[i] !== undefined) {
        var t = byTile(B, pick[i]);
        slots += tileHtml(t, done ? (t.hz === B.answer[i] ? 'right' : 'wrong') : 'placed', done ? 'none' : 'untile');
      } else { slots += '<span class="slot"></span>'; }
    }
    if (!done) {
      bank = B.tiles.filter(function (t) { return pick.indexOf(t.id) < 0; }).map(function (t) { return tileHtml(t, '', 'tile'); }).join('');
    }
    return '<div class="slots">' + slots + '</div><div class="bank">' + bank + '</div>' +
      (done ? '' : '<button class="btn" data-act="check"' + (pick.length === B.tiles.length ? '' : ' disabled') + '>Check</button>');
  }
  function buildHtml(q) { return '<div id="bwrap">' + buildInner(q, [], false) + '</div>'; }

  function buildQ(b) {
    var tiles = b.words.map(function (w, i) { return { id: i, hz: w.hz, py: w.py }; }), sh, tries = 0;
    do { sh = shuffle(tiles); tries++; } while (tries < 8 && sh.map(function (t) { return t.id; }).join() === tiles.map(function (t) { return t.id; }).join());
    var whole = { hz: b.words.map(function (w) { return w.hz; }).join(''), py: b.words.map(function (w) { return w.py; }).join(' ') };
    return {
      build: { tiles: sh, answer: b.words.map(function (w) { return w.hz; }) },
      prompt: '<div class="qMain"><div class="pic huge">' + b.pic + '</div></div><p class="ask">Build the sentence:<br><b>' + esc(b.en) + '</b></p><p class="note">Tap the words in order.</p>',
      say: whole.hz,
      explain: function () { return sentenceCard(whole, b.en, b.pic) + '<p class="hint">💡 ' + esc(b.note) + '</p>'; }
    };
  }
  function pickQ(d) {
    var sh = shuffle(d.options.map(function (o, i) { return { i: i, o: o }; }));
    return {
      prompt: '<div class="qMain"><div class="pic huge">' + d.pic + '</div></div><p class="ask">Which sentence means<br><b>' + esc(d.en) + '</b>?</p>',
      options: sh.map(function (x) { return { key: x.i, html: '<span class="optPy">' + esc(x.o.py) + '</span><small class="hzs">' + x.o.hz + '</small>' }; }),
      correct: 0, cls: 'texts', say: d.options[0].hz,
      explain: function () { return sentenceCard(d.options[0], d.en, d.pic) + '<p class="hint">💡 ' + esc(d.note) + '</p>'; }
    };
  }
  function grammarQ(it) { return it.kind === 'build' ? buildQ(it.d) : pickQ(it.d); }

  /* ---------------- words to avoid ---------------- */
  function altRow(a) {
    return '<div class="gRow"><div><div class="hz">' + a.hz + '</div><div class="py">' + colorPy(a.py) + '</div><div class="en">' + esc(a.en) + '</div></div>' + speakBtn(a.hz, '🔊') + '</div>';
  }
  function mannersIntro() {
    return '<div class="card"><div class="tag">Read this first</div><h3>Why learn rude words?</h3>' +
      '<p class="hint">Every language has them. Knowing them helps you <b>understand what you hear</b> in a film, game or playground, and helps you <b>not say them by accident</b>.</p>' +
      '<p class="hint">Words come in four kinds: <b>fine</b> (only sounds scary), <b>a bit rude</b>, <b>rude</b>, and <b>swear words</b>. When you are not sure, do not say it. Kind words win.</p>' +
      '<p class="note">Grown-ups: this section names real insults and swear words so children can recognise them. Preview it first if you like.</p></div>';
  }
  function mannersCard(m) {
    var sv = MD.SEVERITY[m.sev], alt = m.alt ? MD.ALTS[m.alt] : null;
    return '<div class="card manners"><div class="tag sev' + m.sev + '">' + esc(sv.name) + '</div>' +
      '<div class="hz huge">' + m.hz + '</div><div class="py big">' + colorPy(m.py) + '</div><div class="en big">' + esc(m.en) + '</div>' +
      speakBtn(m.hz, '🔊 Hear it so you recognise it', 'pill') + '<p class="hint">' + esc(m.note) + '</p>' +
      (alt ? '<div class="altBox"><b>Say this instead</b>' + altRow(alt) + '</div>' : '') + '</div>';
  }
  function mannersQ(m) {
    var q = {}, type = m.sev === 0 ? 'sev' : rand(['sev', 'polite']);
    if (type === 'sev') {
      q.prompt = '<div class="qMain"><div class="hz huge">' + m.hz + '</div>' + speakBtn(m.hz, '🔊', 'speak') + '</div><div class="py big">' + colorPy(m.py) + '</div><p class="ask">How rude is this word?</p>';
      q.options = MD.SEVERITY.map(function (s) { return { key: s.sev, html: '<span class="optEn">' + esc(s.short) + '</span>' }; });
      q.correct = m.sev; q.cls = 'texts';
      q.explain = function () { return mannersCard(m); };
      return q;
    }
    var polite = rand(MD.PHRASES.filter(function (p) { return ['谢谢', '你好', '请', '对不起', '早上好', '再见', '不客气', '没关系'].indexOf(p.hz) >= 0; }));
    var rude = sample(MD.MANNERS.filter(function (x) { return x.sev >= 1; }), 3);
    var all = shuffle([{ hz: polite.hz, py: polite.py, good: true }].concat(rude.map(function (x) { return { hz: x.hz, py: x.py, good: false }; })));
    q.prompt = '<div class="qMain"><div class="pic huge">🧑‍🏫</div></div><p class="ask">Which one is okay to say to your teacher?</p>';
    q.options = all.map(function (x) { return { key: x.hz, html: '<span class="optPy">' + esc(x.py) + '</span><small class="hzs">' + x.hz + '</small>' }; });
    q.correct = polite.hz; q.cls = 'texts';
    q.explain = function () { return phraseCard(polite) + '<p class="hint">💡 The other three are rude. Polite words keep everyone happy.</p>'; };
    return q;
  }

  function poolFor(level) {
    if (level === 'sounds') { return MD.INITIALS.concat(MD.FINALS); }
    if (level === 'tones') { return toneItems(); }
    if (level === 'strokes') { return MD.STROKE_TYPES.concat(MD.CHARS); }
    if (level === 'phrases') { return MD.PHRASES; }
    if (level === 'manners') { return MD.MANNERS; }
    return MD.BUILD.map(function (d) { return { kind: 'build', d: d }; }).concat(MD.PICKS.map(function (d) { return { kind: 'pick', d: d }; }));
  }
  function makeQ(level, it) {
    return { sounds: soundQ, tones: toneQ, strokes: strokeQ, phrases: phraseQ, grammar: grammarQ, manners: mannersQ }[level](it);
  }

  /* ---------------- views ---------------- */
  var S = { view: 'home', cards: [], ci: 0, level: null, quiz: null, writer: null, wch: null };
  var minis = [];

  function paint(html) {
    stopSound();
    app.innerHTML = html;
    window.scrollTo(0, 0);
    var t = document.getElementById('starTotal'); if (t) { t.textContent = '⭐ ' + store.total(); }
    minis = [];
    var cvs = app.querySelectorAll('canvas.mini');
    for (var i = 0; i < cvs.length; i++) {
      var ch = MD.CHARS_BY[cvs[i].getAttribute('data-char')];
      if (ch) { var w = new Writer(cvs[i], ch, { mode: 'watch', repeat: true }); w.play(); minis.push(w); }
    }
  }

  /* ---------------- say it out loud ---------------- */
  function sayPanel(hz, py) {
    return '<div class="sayBox" data-hz="' + esc(hz) + '" data-py="' + esc(py) + '"><div class="btns center">' +
      '<button class="btn play" data-act="mic">🎤 Say it</button><button class="btn alt" data-act="rec">⏺ Record &amp; compare</button></div>' +
      '<div class="sayOut" aria-live="polite"></div></div>';
  }
  function scoreHtml(hz, py, b) {
    var r = b.res, v = MD.Speech.verdict(r.pct), syl = py.split(' '), i, tip = '';
    var heardPy = r.heard.map(function (c) { return MD.LEX[c] || '?'; }).join(' ');
    var cells = r.expected.map(function (c, k) {
      return '<div class="sc ' + (r.hit[k] ? 'hit' : 'miss') + '"><span class="hz">' + c + '</span><b>' + esc(syl[k] || '') + '</b></div>';
    }).join('');
    i = r.hit.indexOf(false);
    if (i >= 0 && syl[i]) {
      tip = '<p class="hint">💡 Listen again for “' + esc(syl[i]) + '”. ' + esc(MD.TONES[toneOf(syl[i]) - 1].hint) + '</p>';
    }
    return '<div class="score ' + v.cls + '"><div class="pct">' + r.pct + '%</div><div class="verdict">' + v.text + '</div><div class="scRow">' + cells + '</div>' +
      '<p class="heard">I heard: <b>' + (esc(b.alt) || '…') + '</b>' + (r.heard.length ? ' <small>(' + esc(heardPy) + ')</small>' : '') + '</p>' + tip +
      '<div class="btns center"><button class="speak pill" data-say="' + esc(hz) + '">🔊 Model</button><button class="speak pill" data-say="' + esc(hz) + '" data-rate="0.4">🐢 Slowly</button></div></div>';
  }
  function micAct(btn) {
    var box = btn.closest('.sayBox'); if (!box) { return; }
    var hz = box.getAttribute('data-hz'), py = box.getAttribute('data-py'), out = box.querySelector('.sayOut');
    if (!MD.Speech.supported()) {
      out.innerHTML = '<p class="sayMsg warn">This browser cannot score your speaking. Try Chrome, Edge or Safari, or use “Record &amp; compare” and listen to yourself.</p>';
      return;
    }
    if (btn.disabled) { return; }
    btn.disabled = true; stopSound();
    out.innerHTML = '<p class="sayMsg listening">🎤 Listening… say it now</p>';
    MD.Speech.listen('zh-CN').then(function (alts) {
      var b = MD.Speech.best(hz, alts);
      out.innerHTML = scoreHtml(hz, py, b);
      if (S.onScore) { S.onScore(hz, b.res.pct); }
    }, function (err) {
      out.innerHTML = '<p class="sayMsg bad">' + esc(err.message) + '</p>';
    }).then(function () { btn.disabled = false; });
  }
  var rec = { mr: null, timer: null };
  function recAct(btn) {
    var box = btn.closest('.sayBox'); if (!box) { return; }
    var hz = box.getAttribute('data-hz'), out = box.querySelector('.sayOut');
    if (rec.mr && rec.mr.state === 'recording') { rec.mr.stop(); return; }
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)) {
      out.innerHTML = '<p class="sayMsg warn">This browser cannot record. Try Chrome, Edge or Safari.</p>'; return;
    }
    stopSound();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var chunks = [], mr = new MediaRecorder(stream);
      rec.mr = mr; btn.textContent = '⏹ Stop';
      out.innerHTML = '<p class="sayMsg listening">⏺ Recording… say it, then tap Stop</p>';
      mr.ondataavailable = function (e) { if (e.data && e.data.size) { chunks.push(e.data); } };
      mr.onstop = function () {
        clearTimeout(rec.timer); rec.mr = null;
        stream.getTracks().forEach(function (t) { t.stop(); });
        btn.textContent = '⏺ Record & compare';
        var url = URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || 'audio/webm' }));
        out.innerHTML = '<div class="compare"><p class="sayMsg">Listen: first you, then the model. Do the tones match?</p>' +
          '<audio controls src="' + url + '"></audio><div class="btns center"><button class="speak pill" data-say="' + esc(hz) + '">🔊 Model</button>' +
          '<button class="speak pill" data-say="' + esc(hz) + '" data-rate="0.4">🐢 Slowly</button></div></div>';
        var a = new Audio(url);
        a.onended = function () { speak(hz, 0.7); };
        var p = a.play(); if (p && p.catch) { p.catch(function () { /* the audio bar is there to press */ }); }
      };
      mr.start();
      rec.timer = setTimeout(function () { if (mr.state === 'recording') { mr.stop(); } }, 6000);
    }, function () {
      out.innerHTML = '<p class="sayMsg bad">The microphone is blocked. Allow the microphone for this page (tap the lock icon near the address) and try again.</p>';
    });
  }

  function viewSay(start) {
    if (start) { S.say = { items: sample(MD.PHRASES, 6), i: 0, got: {} }; }
    var Y = S.say, p = Y.items[Y.i], last = Y.i === Y.items.length - 1;
    S.view = 'say';
    S.onScore = function (hz, pct) { if (pct >= 70 && Y.items[Y.i].hz === hz) { Y.got[Y.i] = true; var g = document.getElementById('gotMark'); if (g) { g.textContent = '✓ Got it!'; } } };
    paint('<div class="bar"><button class="back" data-act="home">← Home</button><div class="title">🎤 Say it</div><div class="count">' + (Y.i + 1) + '/' + Y.items.length + '</div></div>' +
      '<div class="prog"><i style="width:' + (Y.i / Y.items.length * 100) + '%"></i></div>' +
      '<div class="card phrase"><p class="note">1. Tap 🔊 and listen. 2. Tap 🎤 and say it. 3. See how close you were.</p>' +
      '<div class="pic huge">' + p.pic + '</div><div class="en big">' + esc(p.en) + '</div><div class="py phr">' + colorPy(p.py) + '</div>' + ribbon(p.py) +
      '<div class="btns center">' + speakBtn(p.hz, '🔊 Hear it', 'pill') + '<button class="speak pill" data-say="' + esc(p.hz) + '" data-rate="0.4">🐢 Slowly</button></div>' +
      sayPanel(p.hz, p.py) + '<p id="gotMark" class="gotMark">' + (Y.got[Y.i] ? '✓ Got it!' : '') + '</p></div>' +
      '<div class="nav"><button class="btn alt" data-act="saygot">✓ I said it</button><button class="btn" data-act="saynext">' + (last ? 'Finish ⭐' : 'Next →') + '</button></div>');
    setTimeout(function () { speak(p.hz); }, 300);
  }
  function finishSay() {
    var Y = S.say, got = Object.keys(Y.got).length, ratio = got / Y.items.length, n = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
    store.setStars('speak', n); S.view = 'result'; S.onScore = null;
    paint('<section class="result"><div class="big">' + (n === 3 ? '🏆' : n === 2 ? '🎉' : '👍') + '</div><h2>' + stars(n) + '</h2><p>You said ' + got + ' of ' + Y.items.length + ' phrases well.</p>' +
      '<p class="note">' + (n === 3 ? '说得好! (shuō de hǎo: well said!)' : '加油! (jiā yóu: keep going!)') + '</p>' +
      '<div class="btns"><button class="btn play" data-act="say">🔁 More phrases</button><button class="btn alt" data-act="home">🏠 Home</button></div></section>');
  }

  /* ---------------- conversations ---------------- */
  function viewTalkMenu() {
    S.view = 'talkmenu'; S.onScore = null;
    var rows = MD.CONVOS.map(function (d) {
      return '<li class="lvl"><div class="num">' + d.pic + '</div><div class="lvlBody"><h2>' + esc(d.title) + ' <span class="zhs">' + d.zh + '</span></h2>' +
        '<p>' + d.turns.length + ' lines to answer</p><div class="stars">' + stars(store.stars('talk_' + d.id)) + '</div>' +
        '<div class="btns"><button class="btn play" data-act="talk" data-id="' + d.id + '">💬 Talk</button></div></div></li>';
    }).join('');
    paint('<div class="bar"><button class="back" data-act="home">← Home</button><div class="title">💬 Talk</div><div class="count"></div></div>' +
      '<p class="lead">Chat with a friend. Listen, pick the right reply, then say it out loud.</p><ol class="path">' + rows + '</ol>');
  }
  function bubble(who, line, avatar) {
    return '<div class="bubble ' + who + '"><span class="av">' + avatar + '</span><div class="bt"><div class="py">' + colorPy(line.py) + '</div><div class="hz">' + line.hz + '</div><div class="en">' + esc(line.en) + '</div></div>' +
      (who === 'friend' ? speakBtn(line.hz, '🔊') : '') + '</div>';
  }
  function viewTalk(id, fresh) {
    var d = MD.CONVOS.filter(function (x) { return x.id === id; })[0];
    if (fresh) { S.talk = { d: d, t: 0, mistakes: 0, log: [], order: null, wrong: {}, solved: false }; }
    var T = S.talk, turn = T.d.turns[T.t], i;
    S.view = 'talk'; S.onScore = null;
    if (!T.order) { T.order = shuffle(turn.replies.map(function (r, k) { return k; })); }
    var chat = T.log.map(function (m) { return bubble(m.who, m.line, m.who === 'friend' ? T.d.who : '🙂'); }).join('');
    var cur = bubble('friend', turn.say, T.d.who);
    var replies = '';
    if (!T.solved) {
      replies = '<p class="ask">Your reply:</p><div class="options texts">' + T.order.map(function (k) {
        var r = turn.replies[k], bad = T.wrong[k];
        return '<button class="opt' + (bad ? ' wrong' : '') + '"' + (bad ? ' disabled' : '') + ' data-act="reply" data-i="' + k + '"><span class="optPy">' + esc(r.py) + '</span><small class="hzs">' + r.hz + '</small><small>' + esc(r.en) + '</small></button>';
      }).join('') + '</div>';
    }
    var fb = '<div id="fb">' + (T.fb || '') + '</div>';
    paint('<div class="bar"><button class="back" data-act="talkmenu">← Talks</button><div class="title">' + T.d.pic + ' ' + esc(T.d.title) + '</div><div class="count">' + (T.t + 1) + '/' + T.d.turns.length + '</div></div>' +
      '<div class="prog"><i style="width:' + (T.t / T.d.turns.length * 100) + '%"></i></div><div class="chat">' + chat + (T.solved ? '' : cur) + '</div>' + replies + fb);
    if (T.fb) { var fbEl = document.getElementById('fb'); if (fbEl && fbEl.scrollIntoView) { fbEl.scrollIntoView({ block: 'center' }); } }
    if (!T.solved && !T.spoken) { T.spoken = true; setTimeout(function () { speak(turn.say.hz); }, 350); }
  }
  function talkReply(k) {
    var T = S.talk, turn = T.d.turns[T.t], r = turn.replies[k];
    if (T.solved) { return; }
    if (r.ok) {
      T.solved = true; T.log.push({ who: 'friend', line: turn.say }); T.log.push({ who: 'me', line: r });
      var last = T.t === T.d.turns.length - 1;
      T.fb = '<div class="fb good"><div class="verdict">🎉 Great reply!</div><p>Now say it out loud:</p>' + sayPanel(r.hz, r.py) +
        '<button class="btn" data-act="talknext">' + (last ? 'Finish ⭐' : 'Next →') + '</button></div>';
      viewTalk(T.d.id, false);
      speak(r.hz);
    } else {
      T.wrong[k] = true; T.mistakes++;
      T.fb = '<div class="fb bad"><div class="verdict">🤔 Not that one.</div><p>' + esc(r.why || 'That means “' + r.en + '”. It does not fit here.') + ' Try another!</p></div>';
      viewTalk(T.d.id, false);
    }
  }
  function talkNext() {
    var T = S.talk;
    if (T.t < T.d.turns.length - 1) { T.t++; T.order = null; T.wrong = {}; T.solved = false; T.fb = ''; T.spoken = false; viewTalk(T.d.id, false); return; }
    var n = T.mistakes === 0 ? 3 : T.mistakes <= 2 ? 2 : 1;
    store.setStars('talk_' + T.d.id, n);
    var best = 0; MD.CONVOS.forEach(function (d) { best = Math.max(best, store.stars('talk_' + d.id)); }); store.setStars('talk', best);
    S.view = 'result';
    var chat = T.log.map(function (m) { return bubble(m.who, m.line, m.who === 'friend' ? T.d.who : '🙂'); }).join('');
    paint('<section class="result"><div class="big">' + (n === 3 ? '🏆' : '🎉') + '</div><h2>' + stars(n) + '</h2><p>You finished the conversation' + (T.mistakes ? ' with ' + T.mistakes + ' wrong ' + (T.mistakes > 1 ? 'tries' : 'try') : ' without a single mistake') + '.</p></section>' +
      '<div class="chat">' + chat + '</div><div class="btns center"><button class="btn play" data-act="talk" data-id="' + T.d.id + '">🔁 Again</button><button class="btn alt" data-act="talkmenu">More talks</button></div>');
  }

  /* ---------------- handwriting ---------------- */
  function hwTabs() {
    var themes = [], seen = {};
    MD.PHRASES.forEach(function (p) { if (!seen[p.theme]) { seen[p.theme] = 1; themes.push(p.theme); } });
    var tabs = [{ name: 'Starter characters', items: MD.CHARS.map(function (c) { return { hz: c.ch, py: c.py, en: c.en, pic: c.pic }; }) }];
    themes.forEach(function (t) { tabs.push({ name: t, items: MD.PHRASES.filter(function (p) { return p.theme === t; }) }); });
    return tabs;
  }
  function charOK(c) { return !!(SK.hzChar(c) || MD.CHARS_BY[c]); }
  function itemDone(it) { return Array.from(it.hz).every(function (c) { return store.written(c); }); }
  function viewHW(tab) {
    S.view = 'hw'; S.onScore = null;
    var tabs = hwTabs(); tab = tab || 0; S.hwTab = tab;
    var tb = '<div class="tabs">' + tabs.map(function (t, i) { return '<button class="tab' + (i === tab ? ' on' : '') + '" data-act="hwtab" data-i="' + i + '">' + esc(t.name) + '</button>'; }).join('') + '</div>';
    var cells = tabs[tab].items.map(function (it) {
      var d = itemDone(it);
      return '<button class="cell' + (d ? ' done' : '') + '" data-act="hwopen" data-hz="' + esc(it.hz) + '"><span class="cpic">' + it.pic + '</span><span class="hz">' + it.hz + '</span><small>' + esc(it.py) + '</small>' + (d ? '<i>✓</i>' : '') + '</button>';
    }).join('');
    paint('<div class="bar"><button class="back" data-act="home">← Home</button><div class="title">✍️ Handwriting</div><div class="count">' + writtenCount() + ' ✓</div></div>' +
      '<p class="lead">Pick a word, then write each character one stroke at a time. Works with a finger or a stylus.</p>' + tb + '<div class="cells wide">' + cells + '</div>');
  }
  function writtenCount() { var n = 0; Object.keys(MD.HZ || {}).forEach(function (c) { if (store.written(c)) { n++; } }); return n; }
  function hwFind(hz) {
    var all = hwTabs(), i, j;
    for (i = 0; i < all.length; i++) { for (j = 0; j < all[i].items.length; j++) { if (all[i].items[j].hz === hz) { return { it: all[i].items[j], tab: i, idx: j, list: all[i].items }; } } }
    return null;
  }
  function viewHWWrite(hz, ci, mode) {
    var f = hwFind(hz); if (!f) { return viewHW(0); }
    var it = f.it, chars = Array.from(it.hz); ci = Math.max(0, Math.min(chars.length - 1, ci || 0));
    var c = chars[ci], ch = SK.hzChar(c) || MD.CHARS_BY[c];
    S.view = 'hwwrite'; S.onScore = null; S.hwNow = { hz: hz, ci: ci };
    mode = mode || 'watch';
    var nextWord = f.list[(f.idx + 1) % f.list.length];
    var charTabs = chars.length > 1 ? '<div class="tabs chars">' + chars.map(function (x, i) {
      return '<button class="tab' + (i === ci ? ' on' : '') + '" data-act="hwchar" data-i="' + i + '"><span class="hz">' + x + '</span>' + (store.written(x) ? ' ✓' : '') + '</button>'; }).join('') + '</div>' : '';
    paint('<div class="bar"><button class="back" data-act="hw" data-i="' + f.tab + '">← Words</button><div class="title">✍️ ' + it.hz + ' ' + esc(it.py) + '</div><div class="count">' + ch.strokes.length + ' strokes</div></div>' +
      '<div class="wordCard row"><div class="pic">' + it.pic + '</div><div class="hz">' + it.hz + '</div><div class="py">' + colorPy(it.py) + '</div><div class="en">' + esc(it.en) + '</div>' + speakBtn(it.hz, '🔊', 'speak') + '</div>' +
      charTabs +
      '<div class="tabs modes"><button class="tab" data-act="mode" data-m="watch">👀 Watch</button><button class="tab" data-act="mode" data-m="trace">✍️ Trace</button><button class="tab" data-act="mode" data-m="memory">🧠 Memory</button><button class="tab" data-act="mode" data-m="free">🖍️ Free</button></div>' +
      '<div class="writeWrap"><canvas id="wc" width="400" height="400" aria-label="writing pad for ' + c + '"></canvas></div>' +
      '<div id="wfb" class="wfb">Choose Watch, Trace or Memory.</div>' +
      chipsFor(ch) +
      '<div class="nav"><button class="btn alt" data-act="again">↺ Again</button><button class="btn alt" data-act="hint">💡 Show me</button><button class="btn alt" data-act="clear">🧽 Clear</button>' +
      (ci < chars.length - 1 ? '<button class="btn" data-act="hwchar" data-i="' + (ci + 1) + '">Next character →</button>' : '<button class="btn" data-act="hwopen" data-hz="' + esc(nextWord.hz) + '">Next word →</button>') + '</div>');
    S.writer = new Writer(document.getElementById('wc'), ch, {
      mode: 'watch',
      onFeedback: function (r) { setW(r.msg, r.ok ? 'ok' : 'bad'); },
      onComplete: function (r) {
        store.setWritten(c);
        var all = chars.every(function (x) { return store.written(x); });
        setW(all && chars.length > 1 ? '🌟 You wrote the whole word ' + it.hz + '! 太棒了!'
          : (r.mistakes === 0 ? '🌟 Perfect! You wrote ' + c + ' with no mistakes.' : '🎉 You wrote ' + c + '! You fixed ' + r.mistakes + ' stroke' + (r.mistakes > 1 ? 's' : '') + '. Try again for a perfect one.'), 'ok');
        var t = document.getElementById('starTotal'); if (t) { t.textContent = '⭐ ' + store.total(); }
        speak(all ? it.hz : c);
      }
    });
    setMode(mode);
  }

  /* ---------------- home ---------------- */
  function weekDots() {
    var out = '', i, t, names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (i = 6; i >= 0; i--) {
      t = new Date(); t.setDate(t.getDate() - i);
      out += '<div class="dayDot' + (store.hasDay(dayKey(t)) ? ' on' : '') + (i === 0 ? ' today' : '') + '"><i></i><span>' + names[t.getDay()] + '</span></div>';
    }
    return out;
  }
  function levelButtons(l) {
    var b = function (act, label, cls, extra) { return '<button class="btn ' + (cls || '') + '" data-act="' + act + '"' + (extra || '') + '>' + label + '</button>'; };
    var lv = ' data-l="' + l.id + '"';
    if (l.id === 'speak') { return b('say', '🎤 Practise', 'play'); }
    if (l.id === 'talk') { return b('talkmenu', '💬 Start talking', 'play'); }
    if (l.id === 'write') { return b('hw', '✍️ Practise writing', 'play'); }
    return b('learn', '👀 Learn', '', lv) + b('play', '🎮 Play', 'play', lv) + (l.id === 'strokes' ? b('write', '✏️ Write', 'alt') : '');
  }
  function viewHome() {
    S.view = 'home'; S.resetArmed = false; S.onScore = null;
    var done = store.hasDay(dayKey(new Date())), n = store.streak(), wc = writtenCount();
    var items = LEVELS.map(function (l) {
      var st = l.id === 'write' ? (wc >= 40 ? 3 : wc >= 15 ? 2 : wc >= 4 ? 1 : 0) : store.stars(l.id);
      var sub = l.id === 'write' ? l.sub + ' (' + wc + ' characters written)' : l.sub;
      return '<li class="lvl"><div class="num">' + l.n + '</div><div class="lvlBody"><h2>' + l.icon + ' ' + l.title + ' <span class="zhs">' + l.zh + '</span></h2>' +
        '<p>' + sub + '</p><div class="stars" aria-label="' + st + ' of 3 stars">' + stars(st) + '</div><div class="btns">' + levelButtons(l) + '</div></div></li>';
    }).join('');
    var manners = S.mannersOk
      ? '<div class="btns"><button class="btn" data-act="learn" data-l="manners">👀 Learn</button><button class="btn play" data-act="play" data-l="manners">🎮 Play</button></div>'
      : '<div class="btns"><button class="btn alt" data-act="mannersopen">I understand. Show me</button></div>';
    paint('<section class="hero"><div class="dragon">🐉</div><h1>小龙学中文</h1><p>Learn Mandarin the way children do: <b>sounds</b>, then <b>tones</b>, then <b>everyday phrases</b>. Then talk, write and keep the habit.</p></section>' +
      '<section class="daily"><div class="dTop"><div><h2>Today’s 5 minutes</h2><p>Five quick questions from everything you are learning. A little every day beats a lot once a week.</p></div>' +
      '<div class="streak"><b>' + n + '</b><span>day streak</span></div></div>' +
      '<div class="week" aria-label="Last seven days">' + weekDots() + '</div>' +
      '<button class="btn play wide" data-act="play" data-l="daily">' + (done ? '✓ Done today. Practice again' : '☀️ Start today’s 5') + '</button></section>' +
      '<ol class="path">' + items + '</ol>' +
      '<section class="lvl goodToKnow"><div class="num">🚫</div><div class="lvlBody"><h2>Words to avoid <span class="zhs">小心</span></h2><p>Rude words and swear words: how to recognise them, why not to say them, and what to say instead.</p>' + manners + '</div></section>' +
      '<section class="soundBox"><button class="btn alt" data-act="soundtest">🔊 Test sound</button><div id="soundStatus" aria-live="polite"></div></section>' +
      '<p class="foot">Sound not working? Tap “Test sound” for help.<br><button class="link" data-act="reset">Reset progress</button></p>');
  }

  function viewLearn(level, startIdx) {
    S.view = 'learn'; S.level = level;
    if (!S.cards.length || S.cardsLevel !== level) { S.cards = learnCards(level); S.cardsLevel = level; }
    S.ci = Math.max(0, Math.min(S.cards.length - 1, startIdx || 0));
    var c = S.cards[S.ci], L = LEVEL_BY[level], last = S.ci === S.cards.length - 1;
    var groups = [];
    S.cards.forEach(function (x, i) { if (!groups.length || groups[groups.length - 1].g !== x.group) { groups.push({ g: x.group, i: i }); } });
    var tabs = groups.length > 1 ? '<div class="tabs">' + groups.map(function (g) {
      return '<button class="tab' + (g.g === c.group ? ' on' : '') + '" data-act="jump" data-i="' + g.i + '">' + g.g + '</button>'; }).join('') + '</div>' : '';
    paint('<div class="bar"><button class="back" data-act="home">← Home</button><div class="title">' + L.icon + ' ' + L.title + ' · Learn</div><div class="count">' + (S.ci + 1) + '/' + S.cards.length + '</div></div>' +
      '<div class="prog"><i style="width:' + ((S.ci + 1) / S.cards.length * 100) + '%"></i></div>' + tabs + c.html +
      '<div class="nav"><button class="btn alt" data-act="prev"' + (S.ci === 0 ? ' disabled' : '') + '>← Back</button>' +
      (last ? '<button class="btn play" data-act="play" data-l="' + level + '">🎮 Play!</button>' : '<button class="btn" data-act="next">Next →</button>') + '</div>');
  }

  function startQuiz(level) {
    var items;
    if (level === 'daily') {
      items = shuffle(['sounds', 'tones', 'phrases', 'phrases', 'grammar']).map(function (l) { return { target: rand(poolFor(l)), retry: false, lvl: l }; });
    } else {
      items = sample(poolFor(level), 8).map(function (t) { return { target: t, retry: false }; });
    }
    S.quiz = { level: level, queue: items, total: items.length, correct: 0, cur: null };
    nextQuestion();
  }
  function nextQuestion() {
    var Q = S.quiz;
    if (!Q.queue.length) { return finishQuiz(); }
    S.view = 'play';
    var item = Q.queue[0], q = makeQ(item.lvl || Q.level, item.target), L = LEVEL_BY[Q.level];
    Q.cur = { q: q, item: item, answered: false, pick: [] };
    var remaining = Q.queue.filter(function (x) { return !x.retry; }).length, doneN = Q.total - remaining;
    var opts = q.build ? '' : q.options.map(function (o, i) { return optBtn(i, o.html); }).join('');
    paint('<div class="bar"><button class="back" data-act="home">← Home</button><div class="title">' + L.icon + ' ' + L.title + ' · Play</div><div class="count">' + (item.retry ? '🔁' : (doneN + 1) + '/' + Q.total) + '</div></div>' +
      '<div class="prog"><i style="width:' + (doneN / Q.total * 100) + '%"></i></div>' +
      (item.retry ? '<p class="retry">Let’s try that one again! 💪</p>' : '') +
      '<div class="quiz">' + q.prompt + (q.build ? buildHtml(q) : '<div class="options ' + q.cls + '">' + opts + '</div>') + '<div id="fb"></div></div>');
    if (q.auto) { setTimeout(function () { speak(q.auto); }, 350); }
  }
  function answer(i) {
    var Q = S.quiz, C = Q.cur;
    if (!C || C.answered) { return; }
    C.answered = true;
    var q = C.q, ok = q.options[i].key === q.correct;
    var btns = app.querySelectorAll('button.opt');
    for (var k = 0; k < btns.length; k++) {
      btns[k].disabled = true;
      if (q.options[k].key === q.correct) { btns[k].classList.add('right'); }
    }
    if (!ok) { btns[i].classList.add('wrong'); }
    Q.queue.shift();
    if (ok) { if (!C.item.retry) { Q.correct++; } }
    else if (!C.item.retry) { Q.queue.push({ target: C.item.target, retry: true, lvl: C.item.lvl }); }
    var fb = document.getElementById('fb');
    fb.innerHTML = '<div class="fb ' + (ok ? 'good' : 'bad') + '"><div class="verdict">' + (ok ? '🎉 Yes! Great job!' : '🤔 Not quite. Here is the right one:') + '</div>' +
      (ok ? '' : q.explain()) + '<button class="btn" data-act="nextq">' + (Q.queue.length ? 'Next →' : 'See my stars ⭐') + '</button></div>';
    var cvs = fb.querySelectorAll('canvas.mini');
    for (var m = 0; m < cvs.length; m++) {
      var ch = MD.CHARS_BY[cvs[m].getAttribute('data-char')];
      if (ch) { var w = new Writer(cvs[m], ch, { mode: 'watch', repeat: true }); w.play(); minis.push(w); }
    }
    fb.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (ok && (q.say || q.auto)) { speak(q.say || q.auto); }
  }
  function tapTile(id, add) {
    var C = S.quiz && S.quiz.cur;
    if (!C || C.answered || !C.q.build) { return; }
    var i = C.pick.indexOf(id);
    if (add && i < 0) { C.pick.push(id); } else if (!add && i >= 0) { C.pick.splice(i, 1); }
    document.getElementById('bwrap').innerHTML = buildInner(C.q, C.pick, false);
  }
  function checkBuild() {
    var Q = S.quiz, C = Q.cur;
    if (!C || C.answered || C.pick.length !== C.q.build.tiles.length) { return; }
    C.answered = true;
    var B = C.q.build, q = C.q;
    var ok = C.pick.every(function (id, i) { return byTile(B, id).hz === B.answer[i]; });
    document.getElementById('bwrap').innerHTML = buildInner(q, C.pick, true);
    Q.queue.shift();
    if (ok) { if (!C.item.retry) { Q.correct++; } }
    else if (!C.item.retry) { Q.queue.push({ target: C.item.target, retry: true, lvl: C.item.lvl }); }
    var fb = document.getElementById('fb');
    fb.innerHTML = '<div class="fb ' + (ok ? 'good' : 'bad') + '"><div class="verdict">' + (ok ? '🎉 Yes! Great job!' : '🤔 Not quite. The words go in this order:') + '</div>' +
      (ok ? '' : q.explain()) + '<button class="btn" data-act="nextq">' + (Q.queue.length ? 'Next →' : 'See my stars ⭐') + '</button></div>';
    fb.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (ok) { speak(q.say); }
  }

  function finishQuiz() {
    var Q = S.quiz, L = LEVEL_BY[Q.level], ratio = Q.correct / Q.total;
    var n = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
    if (Q.level === 'daily') { store.markDay(); } else { store.setStars(Q.level, n); }
    S.view = 'result';
    paint('<section class="result"><div class="big">' + (n === 3 ? '🏆' : n === 2 ? '🎉' : '👍') + '</div><h2>' + stars(n) + '</h2>' +
      '<p>' + Q.correct + ' of ' + Q.total + ' right the first time.</p>' + (Q.level === 'daily' ? '<p class="streakMsg">Day ' + store.streak() + ' in a row. Come back tomorrow to keep it going.</p>' : '') +
      '<p class="note">' + (n === 3 ? '好极了! (hǎo jí le: excellent!)' : n === 2 ? '很好! (hěn hǎo: very good!)' : '加油! (jiā yóu: keep going!)') + '</p>' +
      '<div class="btns"><button class="btn play" data-act="play" data-l="' + Q.level + '">🔁 Play again</button>' + (Q.level === 'daily' ? '' : '<button class="btn" data-act="learn" data-l="' + Q.level + '">👀 Review</button>') +
      '<button class="btn alt" data-act="home">🏠 Home</button></div></section>');
  }

  /* ---- writing practice ---- */
  function viewWriteMenu() {
    S.view = 'writemenu';
    var cells = MD.CHARS.map(function (c) {
      return '<button class="cell' + (store.written(c.ch) ? ' done' : '') + '" data-act="write" data-ch="' + c.ch + '"><span class="hz">' + c.ch + '</span><small>' + c.py + '</small>' + (store.written(c.ch) ? '<i>✓</i>' : '') + '</button>';
    }).join('');
    paint('<div class="bar"><button class="back" data-act="home">← Home</button><div class="title">✏️ Write</div><div class="count"></div></div>' +
      '<p class="lead">Pick a character to watch, trace and write from memory.</p><div class="cells">' + cells + '</div>');
  }
  function viewWrite(chStr, mode) {
    var c = MD.CHARS_BY[chStr]; if (!c) { return viewWriteMenu(); }
    S.view = 'write'; S.wch = c;
    var idx = MD.CHARS.indexOf(c), nextCh = MD.CHARS[(idx + 1) % MD.CHARS.length].ch;
    mode = mode || 'watch';
    paint('<div class="bar"><button class="back" data-act="writemenu">← Characters</button><div class="title">✏️ ' + c.ch + ' ' + c.py + '</div><div class="count">' + c.strokes.length + ' strokes</div></div>' +
      '<div class="tabs modes"><button class="tab" data-act="mode" data-m="watch">👀 Watch</button><button class="tab" data-act="mode" data-m="trace">✍️ Trace</button><button class="tab" data-act="mode" data-m="memory">🧠 Memory</button></div>' +
      '<div class="writeWrap"><canvas id="wc" width="400" height="400" aria-label="writing pad for ' + c.ch + '"></canvas></div>' +
      '<div id="wfb" class="wfb">Choose Watch, Trace or Memory.</div>' +
      '<div class="wordCard row"><div class="pic">' + c.pic + '</div><div class="hz">' + c.ch + '</div><div class="py">' + c.py + '</div><div class="en">' + c.en + '</div>' + speakBtn(c.ch, '🔊', 'speak') + '</div>' +
      chipsFor(c) +
      '<div class="nav"><button class="btn alt" data-act="again">↺ Again</button><button class="btn alt" data-act="hint">💡 Show me</button><button class="btn" data-act="write" data-ch="' + nextCh + '">Next ' + nextCh + ' →</button></div>');
    S.writer = new Writer(document.getElementById('wc'), c, {
      mode: 'watch',
      onFeedback: function (r) { setW(r.msg, r.ok ? 'ok' : 'bad'); },
      onComplete: function (r) {
        store.setWritten(c.ch);
        setW(r.mistakes === 0 ? '🌟 Perfect! 好极了! You wrote ' + c.ch + ' with no mistakes.' : '🎉 You wrote ' + c.ch + '! You fixed ' + r.mistakes + ' stroke' + (r.mistakes > 1 ? 's' : '') + '. Try again for a perfect one.', 'ok');
        var t = document.getElementById('starTotal'); if (t) { t.textContent = '⭐ ' + store.total(); }
        speak(c.ch);
      }
    });
    setMode(mode);
  }
  function setW(msg, cls) { var el = document.getElementById('wfb'); if (el) { el.className = 'wfb ' + (cls || ''); el.textContent = msg; } }
  function setMode(m) {
    var tabs = app.querySelectorAll('.modes .tab');
    for (var i = 0; i < tabs.length; i++) { tabs[i].classList.toggle('on', tabs[i].getAttribute('data-m') === m); }
    S.mode = m; S.writer.setMode(m);
    setW(m === 'watch' ? 'Watch how it is written. Red is the stroke being drawn; the numbers show the order.' :
         m === 'trace' ? 'Trace over the grey guide. Start at the orange number, one stroke at a time.' :
         m === 'free' ? 'Free writing: draw anything you like over the faint guide. I will not correct you here. Tap Clear to start again.' :
         'No guide now. Write it from memory. I will tell you if a stroke needs fixing.', '');
  }

  /* ---------------- events ---------------- */
  document.body.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act],[data-say]');
    if (!el) { return; }
    if (el.hasAttribute('data-say')) { speak(el.getAttribute('data-say'), parseFloat(el.getAttribute('data-rate')) || 0.7); return; }
    var a = el.getAttribute('data-act');
    switch (a) {
      case 'home': viewHome(); break;
      case 'learn': S.cards = []; viewLearn(el.getAttribute('data-l'), 0); break;
      case 'play': startQuiz(el.getAttribute('data-l')); break;
      case 'next': viewLearn(S.level, S.ci + 1); break;
      case 'prev': viewLearn(S.level, S.ci - 1); break;
      case 'jump': viewLearn(S.level, +el.getAttribute('data-i')); break;
      case 'ans': answer(+el.getAttribute('data-i')); break;
      case 'nextq': nextQuestion(); break;
      case 'write': viewWrite(el.getAttribute('data-ch'), 'watch'); break;
      case 'writemenu': viewWriteMenu(); break;
      case 'mode': setMode(el.getAttribute('data-m')); break;
      case 'again': setMode(S.mode); break;
      case 'hint': if (S.mode === 'watch') { S.writer.play(); } else { S.writer.hint(); } break;
      case 'hearall': speakSeq(MD.TONE_SETS[0].items.map(function (x) { return x.ch; })); break;
      case 'mic': micAct(el); break;
      case 'rec': recAct(el); break;
      case 'soundtest':
        document.getElementById('soundStatus').innerHTML = '<p class="sayMsg listening">🔊 Listen… I will say 你好 (hello).</p>';
        speak('你好，欢迎来到小龙学中文', 0.7).then(function () { var st = document.getElementById('soundStatus'); if (st) { st.innerHTML = soundReport(); } });
        break;
      case 'say': viewSay(true); break;
      case 'saygot': S.say.got[S.say.i] = true; var gm = document.getElementById('gotMark'); if (gm) { gm.textContent = '✓ Got it!'; } break;
      case 'saynext': if (S.say.i >= S.say.items.length - 1) { finishSay(); } else { S.say.i++; viewSay(false); } break;
      case 'talkmenu': viewTalkMenu(); break;
      case 'talk': viewTalk(el.getAttribute('data-id'), true); break;
      case 'reply': talkReply(+el.getAttribute('data-i')); break;
      case 'talknext': talkNext(); break;
      case 'hw': viewHW(+el.getAttribute('data-i') || 0); break;
      case 'hwtab': viewHW(+el.getAttribute('data-i')); break;
      case 'hwopen': viewHWWrite(el.getAttribute('data-hz'), 0, 'watch'); break;
      case 'hwchar': viewHWWrite(S.hwNow.hz, +el.getAttribute('data-i'), 'watch'); break;
      case 'clear': S.writer.reset(); if (S.mode === 'watch') { setMode('trace'); } break;
      case 'mannersopen': S.mannersOk = true; viewHome(); break;
      case 'reset':
        if (S.resetArmed) { S.resetArmed = false; store.reset(); viewHome(); }
        else { S.resetArmed = true; el.textContent = 'Tap again to erase all progress'; }
        break;
      case 'peek': S.peek = true; viewHome(); break;
      case 'tile': tapTile(+el.getAttribute('data-id'), true); break;
      case 'untile': tapTile(+el.getAttribute('data-id'), false); break;
      case 'check': checkBuild(); break;
    }
  });
  document.getElementById('homeBtn').addEventListener('click', viewHome);

  viewHome();
})();
