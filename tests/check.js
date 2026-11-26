/* Sanity checks for lesson data and the stroke checker.  Run:  node tests/check.js */
'use strict';
require('../src/js/data.js');
require('../src/js/phrases.js');
require('../src/js/phrases2.js');
require('../src/js/hanzi-data.js');
require('../src/js/strokes.js');
require('../src/js/speech.js');
var MD = globalThis.MD, SK = MD.Strokes;
var failures = 0;
function check(cond, msg) { if (!cond) { failures++; console.error('FAIL: ' + msg); } }

// --- sound data ---
MD.INITIALS.concat(MD.FINALS).forEach(function (x) {
  check(x.id && x.hint && x.say && x.word && x.word.hz && x.word.py && x.word.tl && x.word.en && x.word.pic, 'incomplete sound item: ' + x.id);
});
MD.INITIALS.forEach(function (x) {
  check(x.word.tl.indexOf(x.id) === 0, 'example word for initial "' + x.id + '" should start with it (' + x.word.tl + ')');
});
MD.FINALS.forEach(function (x) {
  var m = x.match || [x.id];
  check(m.some(function (s) { return x.word.tl.indexOf(s) >= 0; }), 'example word for final "' + x.id + '" should contain it (' + x.word.tl + ')');
});

// --- tones ---
MD.TONE_SETS.forEach(function (set) {
  check(set.items.length === 4, 'tone set ' + set.syl + ' needs 4 items');
  set.items.forEach(function (it, i) { check(it.t === i + 1, 'tone order in ' + set.syl); });
});

// --- strokes: each expected stroke, traced exactly, must pass; reversed must fail ---
MD.CHARS.forEach(function (c) {
  c.strokes.forEach(function (s, i) {
    var r = SK.evaluate(c.strokes, i, s.pts.map(function (p) { return p.slice(); }), 26);
    check(r.ok, c.ch + ' stroke ' + (i + 1) + ' should pass when traced exactly: ' + r.msg);
    var rev = SK.evaluate(c.strokes, i, s.pts.slice().reverse(), 26);
    check(!rev.ok, c.ch + ' stroke ' + (i + 1) + ' should FAIL when drawn backwards');
    // a bit of wobble should still pass
    var wob = s.pts.map(function (p, k) { return [p[0] + (k % 2 ? 4 : -3), p[1] + (k % 2 ? -3 : 4)]; });
    check(SK.evaluate(c.strokes, i, wob, 26).ok, c.ch + ' stroke ' + (i + 1) + ' should tolerate wobble');
  });
});
// order mistake: drawing stroke 2 of 二 first
var er = MD.CHARS_BY['二'];
var o = SK.evaluate(er.strokes, 0, er.strokes[1].pts, 26);
check(!o.ok && o.code === 'order', '二: drawing stroke 2 first should be reported as an order mistake');
// a corner stroke drawn as a straight diagonal must fail
var ri = MD.CHARS_BY['口'];
var diag = SK.evaluate(ri.strokes, 1, [[26, 26], [50, 50], [74, 76]], 32);
check(!diag.ok, '口 stroke 2 drawn as a diagonal should fail');
// a tiny scribble is "short"
check(SK.evaluate(er.strokes, 0, [[10, 10], [11, 10]], 26).code === 'short', 'tiny scribble should be too short');

// --- picture words ---
var seen = {};
MD.WORDS.forEach(function (w) { check(!seen[w.pic], 'duplicate picture ' + w.pic); seen[w.pic] = 1; check(w.hz && w.py && w.en, 'incomplete word'); });

// --- phrases: one pinyin syllable per character, unique pictures, grammar data complete ---
var pseen = {};
MD.PHRASES.forEach(function (p) {
  check(p.py.split(' ').length === Array.from(p.hz).length, 'phrase "' + p.hz + '" needs one pinyin syllable per character: ' + p.py);
  check(!pseen[p.pic], 'duplicate phrase picture ' + p.pic); pseen[p.pic] = 1;
  check(p.en && p.theme, 'incomplete phrase ' + p.hz);
});
MD.BUILD.forEach(function (b) {
  b.words.forEach(function (w) { check(w.py.split(' ').length === Array.from(w.hz).length, 'build word syllables: ' + w.hz); });
  check(b.words.length >= 3 && b.en && b.note, 'incomplete build item ' + b.en);
});
MD.PICKS.forEach(function (d) {
  check(d.options.length === 4, 'pick "' + d.en + '" needs 4 options');
  d.options.forEach(function (o) { check(o.py.split(' ').length === Array.from(o.hz).length, 'pick option syllables: ' + o.hz); });
});
MD.GRAMMAR.forEach(function (g) {
  g.rows.forEach(function (r) {
    check(r.py.split(' ').length === Array.from(r.hz).length, 'grammar row syllables: ' + r.hz);
    if (r.hl) { check(r.hz.indexOf(r.hl) >= 0, 'highlight "' + r.hl + '" must appear in ' + r.hz); }
  });
});

// --- conversations ---
function strip(h) { return Array.from(h.replace(/[，。？！、\s]/g, '')); }
MD.CONVOS.forEach(function (d) {
  check(d.turns.length >= 3, 'conversation too short: ' + d.id);
  d.turns.forEach(function (t, i) {
    var lines = [t.say].concat(t.replies);
    lines.forEach(function (l) { check(strip(l.hz).length === l.py.split(' ').length, d.id + ' turn ' + i + ': syllables for ' + l.hz); check(l.en, 'missing meaning ' + l.hz); });
    check(t.replies.length === 3, d.id + ' turn ' + i + ' needs 3 replies');
    check(t.replies.some(function (r) { return r.ok; }), d.id + ' turn ' + i + ' needs a good reply');
    check(t.replies.some(function (r) { return !r.ok; }), d.id + ' turn ' + i + ' needs a wrong reply');
  });
});
// --- words to avoid ---
MD.MANNERS.forEach(function (m) {
  check(m.hz && m.py && m.en && m.note && m.sev >= 0 && m.sev <= 3, 'incomplete manners item ' + m.hz);
  check(strip(m.hz).length === m.py.split(' ').length, 'manners syllables ' + m.hz);
  if (m.sev > 0) { check(m.alt && MD.ALTS[m.alt], 'needs a polite alternative: ' + m.hz); }
});
Object.keys(MD.ALTS).forEach(function (k) { check(strip(MD.ALTS[k].hz).length === MD.ALTS[k].py.split(' ').length, 'alt syllables ' + k); });

// --- real handwriting data: every stroke of every character ---
var SKs = MD.Strokes, nStrokes = 0;
Object.keys(MD.HZ).forEach(function (c) {
  var ch = SKs.hzChar(c);
  check(ch && ch.strokes.length === MD.HZ[c].s.length && ch.strokes.length === MD.HZ[c].m.length, 'stroke data mismatch for ' + c);
  ch.strokes.forEach(function (st, i) {
    nStrokes++;
    var exact = st.pts.map(function (p) { return p.slice(); });
    var r = SKs.evaluate(ch.strokes, i, exact, 26);
    check(r.ok, c + ' stroke ' + (i + 1) + ' should pass when traced exactly: ' + r.msg);
    var wob = st.pts.map(function (p, k) { return [p[0] + (k % 2 ? 3 : -2), p[1] + (k % 2 ? -2 : 3)]; });
    check(SKs.evaluate(ch.strokes, i, wob, 26).ok, c + ' stroke ' + (i + 1) + ' should tolerate wobble');
    if (SKs.pathLen ? true : true) {
      var len = 0, k2; for (k2 = 1; k2 < st.pts.length; k2++) { len += Math.hypot(st.pts[k2][0] - st.pts[k2 - 1][0], st.pts[k2][1] - st.pts[k2 - 1][1]); }
      if (len > 30) { check(!SKs.evaluate(ch.strokes, i, st.pts.slice().reverse(), 26).ok, c + ' stroke ' + (i + 1) + ' drawn backwards should fail'); }
    }
  });
});
MD.PHRASES.forEach(function (p) { Array.from(p.hz).forEach(function (c) { check(MD.HZ[c] || MD.CHARS_BY[c], 'no handwriting data for ' + c + ' in ' + p.hz); }); });
// order mistake with real data: 十 is 横 then 竖; drawing the vertical first should be an order error
var shi = SKs.hzChar('十'), ord = SKs.evaluate(shi.strokes, 0, shi.strokes[1].pts.map(function (p) { return p.slice(); }), 26);
check(!ord.ok && ord.code === 'order', '十: vertical first should be reported as an order mistake, got ' + ord.code);
console.log('handwriting strokes checked:', nStrokes);

// --- speech scoring ---
var Sp = MD.Speech;
check(Sp.score('你好', '你好').pct === 100 && Sp.score('你好', '你好').perfect, 'perfect speech score');
check(Sp.score('你好', '你号').pct === 50, 'half-right speech score');
check(Sp.score('你好吗', '你好').pct === 67, 'missing a word lowers score: ' + Sp.score('你好吗', '你好').pct);
check(Sp.score('我六岁', '我6岁').perfect, 'digits are read as characters');
check(Sp.score('谢谢', 'xie xie').pct === 0, 'latin text scores zero');
check(Sp.best('你好', ['尼好', '你好']).res.perfect, 'exact match among alternatives wins');
var al = Sp.align('你好吗', '你吗'); check(al.hit.join() === 'true,false,true', 'alignment marks the missing character');
check(MD.LEX['好'] === 'hǎo', 'lexicon has 好');

console.log(failures ? failures + ' check(s) failed' : 'All checks passed');
process.exit(failures ? 1 : 0);
