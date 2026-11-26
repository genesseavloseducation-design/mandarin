/* "Say it out loud": compare what the child said with what they meant to say.
 * Scoring is pure (testable in Node). Listening uses the browser's speech recogniser (Chrome, Edge, Safari).
 */
(function (root) {
  'use strict';
  var MD = root.MD = root.MD || {};

  var DIGITS = '零一二三四五六七八九';
  function normalize(s) {
    return Array.from(String(s || '').replace(/[0-9]/g, function (d) { return DIGITS.charAt(+d); }))
      .filter(function (c) { return /[㐀-鿿]/.test(c); });
  }

  // Which of the expected characters appear, in order, in what was heard (longest common subsequence).
  function align(expected, heard) {
    var a = normalize(expected), b = normalize(heard), n = a.length, m = b.length, i, j;
    var L = [];
    for (i = 0; i <= n; i++) { L.push(new Array(m + 1).fill(0)); }
    for (i = 1; i <= n; i++) {
      for (j = 1; j <= m; j++) { L[i][j] = a[i - 1] === b[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]); }
    }
    var hit = new Array(n).fill(false);
    i = n; j = m;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) { hit[i - 1] = true; i--; j--; }
      else if (L[i - 1][j] >= L[i][j - 1]) { i--; } else { j--; }
    }
    return { expected: a, heard: b, hit: hit, common: L[n][m] };
  }

  function score(expected, heard) {
    var r = align(expected, heard), n = Math.max(r.expected.length, r.heard.length, 1);
    r.pct = r.expected.length ? Math.round(100 * r.common / n) : 0;
    r.perfect = r.expected.length > 0 && r.pct === 100;
    return r;
  }

  // Pick the best of several recogniser guesses: an exact match wins, otherwise trust the first guess.
  function best(expected, alts) {
    var i, first = score(expected, alts[0] || '');
    for (i = 0; i < alts.length; i++) { if (score(expected, alts[i]).perfect) { return { alt: alts[i], res: score(expected, alts[i]) }; } }
    return { alt: alts[0] || '', res: first };
  }

  function verdict(pct) {
    if (pct === 100) { return { cls: 'good', text: '🌟 Perfect! 太棒了! (tài bàng le: awesome!)' }; }
    if (pct >= 70) { return { cls: 'good', text: '👏 Very close! 很好 (hěn hǎo)' }; }
    if (pct >= 40) { return { cls: 'warn', text: '🙂 Getting there. Listen once more and try again.' }; }
    return { cls: 'bad', text: '🔁 Let’s try again. Listen first, then say it slowly.' };
  }

  function SR() { return root.SpeechRecognition || root.webkitSpeechRecognition || null; }
  function supported() { return !!SR(); }

  /* listen() -> Promise<string[]> of guesses, best first. Rejects with {code, message}. */
  function listen(lang) {
    return new Promise(function (resolve, reject) {
      var Ctor = SR();
      if (!Ctor) { return reject({ code: 'unsupported', message: 'This browser cannot listen. Try Chrome, Edge or Safari.' }); }
      var rec = new Ctor(), got = false, finished = false;
      rec.lang = lang || 'zh-CN'; rec.interimResults = false; rec.maxAlternatives = 5; rec.continuous = false;
      function done(fn, v) { if (!finished) { finished = true; fn(v); } }
      rec.onresult = function (e) {
        var alts = [], r = e.results[0], i;
        for (i = 0; r && i < r.length; i++) { alts.push(r[i].transcript); }
        got = true; done(resolve, alts);
      };
      rec.onerror = function (e) {
        var c = e && e.error;
        var msg = c === 'not-allowed' || c === 'service-not-allowed' ? 'The microphone is blocked. Allow the microphone for this page (tap the lock icon near the address) and try again.'
          : c === 'no-speech' ? 'I did not hear anything. Tap the microphone and speak after it says “Listening”.'
          : c === 'network' ? 'Listening needs an internet connection.'
          : 'Sorry, I could not listen (' + (c || 'unknown') + ').';
        done(reject, { code: c || 'error', message: msg });
      };
      rec.onend = function () { if (!got) { done(reject, { code: 'no-speech', message: 'I did not hear anything. Tap the microphone and speak after it says “Listening”.' }); } };
      try { rec.start(); } catch (err) { done(reject, { code: 'start', message: 'Could not start the microphone. Please try again.' }); }
      setTimeout(function () { try { rec.stop(); } catch (e) { /* already stopped */ } }, 7000);
    });
  }

  MD.Speech = { normalize: normalize, align: align, score: score, best: best, verdict: verdict, supported: supported, listen: listen };
})(typeof window !== 'undefined' ? window : globalThis);
