/* Stroke geometry + the "did you draw it right?" checker.
 * Pure functions with no DOM access, so they are easy to test with `node tests/check.js`.
 */
(function (root) {
  'use strict';
  var MD = root.MD = root.MD || {};

  var DIRS = ['right', 'downright', 'down', 'downleft', 'left', 'upleft', 'up', 'upright'];
  var ARROW = { right: '→', downright: '↘', down: '↓', downleft: '↙', left: '←', upleft: '↖', up: '↑', upright: '↗' };
  var HOW = {
    right: 'from left to right →', downright: 'down to the right ↘', down: 'from top to bottom ↓',
    downleft: 'down to the left ↙', left: 'from right to left ←', upleft: 'up to the left ↖',
    up: 'upwards ↑', upright: 'up to the right ↗'
  };

  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function pathLen(pts) {
    var s = 0;
    for (var i = 1; i < pts.length; i++) { s += dist(pts[i - 1], pts[i]); }
    return s;
  }
  function lenUpTo(pts, idx) { return pathLen(pts.slice(0, idx + 1)); }

  // Point at a fraction (0..1) of the way along a polyline.
  function pointAt(pts, frac) {
    var target = pathLen(pts) * frac, acc = 0;
    for (var i = 1; i < pts.length; i++) {
      var seg = dist(pts[i - 1], pts[i]);
      if (acc + seg >= target && seg > 0) {
        var t = (target - acc) / seg;
        return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
      }
      acc += seg;
    }
    return pts[pts.length - 1];
  }

  // The first `frac` of a polyline (used for the draw-on animation).
  function partial(pts, frac) {
    if (frac >= 1) { return pts; }
    var target = pathLen(pts) * frac, acc = 0, out = [pts[0]];
    for (var i = 1; i < pts.length; i++) {
      var seg = dist(pts[i - 1], pts[i]);
      if (acc + seg >= target) {
        var t = seg ? (target - acc) / seg : 0;
        out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]);
        return out;
      }
      out.push(pts[i]);
      acc += seg;
    }
    return out;
  }

  function dirIndex(dx, dy) {
    var a = Math.atan2(dy, dx) * 180 / Math.PI;
    var i = Math.round(a / 45);
    return ((i % 8) + 8) % 8;
  }
  function dirOf(a, b) { return dirIndex(b[0] - a[0], b[1] - a[1]); }
  function sectorDiff(a, b) { var d = Math.abs(a - b) % 8; return Math.min(d, 8 - d); }

  function drawnDirs(exp, drawn) {
    var s = drawn[0], e = drawn[drawn.length - 1];
    if (exp.dirs.length === 1) { return [dirOf(s, e)]; }
    var frac = lenUpTo(exp.pts, exp.corner) / pathLen(exp.pts);
    var c = pointAt(drawn, frac);
    return [dirOf(s, c), dirOf(c, e)];
  }

  function match(exp, drawn, tol) {
    var dd = drawnDirs(exp, drawn), dirOk = true, i;
    for (i = 0; i < exp.dirs.length; i++) {
      if (sectorDiff(dd[i], DIRS.indexOf(exp.dirs[i])) > 1) { dirOk = false; }
    }
    // A stroke with a corner must actually turn the corner.
    if (dirOk && exp.dirs.length === 2 && sectorDiff(dd[0], dd[1]) < 2) { dirOk = false; }
    var posOk = dist(drawn[0], exp.pts[0]) <= tol &&
                dist(drawn[drawn.length - 1], exp.pts[exp.pts.length - 1]) <= tol;
    return { dirOk: dirOk, posOk: posOk, dirs: dd };
  }

  function howText(dirs) { return dirs.map(function (d) { return HOW[d]; }).join(', then '); }

  /* evaluate(strokes, i, drawn, tol)
   *   strokes: the character's expected strokes, i: which one the child should draw now,
   *   drawn: array of [x, y] on the 100x100 grid, tol: how far from the guide is acceptable.
   * returns { ok, code: 'ok'|'short'|'order'|'dir'|'pos', msg, later? }
   */
  function evaluate(strokes, i, drawn, tol) {
    if (strokes[i].generic) { return evalGeneric(strokes, i, drawn, tol); }
    tol = tol || 26;
    var exp = strokes[i];
    if (!drawn || drawn.length < 2 || pathLen(drawn) < Math.max(8, pathLen(exp.pts) * 0.4)) {
      return { ok: false, code: 'short', msg: 'Make the stroke a little longer.' };
    }
    var m = match(exp, drawn, tol);
    if (m.dirOk && m.posOk) {
      return { ok: true, code: 'ok', msg: '✓ ' + exp.zh + ' ' + exp.py + ': well done!' };
    }
    for (var k = i + 1; k < strokes.length; k++) {
      var mk = match(strokes[k], drawn, 14);
      if (mk.dirOk && mk.posOk) {
        return { ok: false, code: 'order', later: k,
          msg: 'Careful with the order! That looks like stroke ' + (k + 1) + ' (' + strokes[k].zh + ' ' + strokes[k].py +
               '). Stroke ' + (i + 1) + ' comes first: ' + exp.zh + ' ' + exp.py + '. Rule: top before bottom, left before right.' };
      }
    }
    if (!m.dirOk) {
      var went = m.dirs.map(function (d) { return ARROW[DIRS[d]]; }).join(' then ');
      return { ok: false, code: 'dir',
        msg: 'Not quite: that went ' + went + '. Stroke ' + (i + 1) + ' is ' + exp.zh + ' (' + exp.py + '): draw it ' + howText(exp.dirs) + '.' };
    }
    return { ok: false, code: 'pos',
      msg: 'Right shape, wrong place! Start closer to the guide for stroke ' + (i + 1) + ' (' + exp.zh + ' ' + exp.py + ').' };
  }


  /* ---------- real-character strokes (from the Make Me a Hanzi data) ----------
   * Each stroke has a centre line `pts` on the same 100 x 100 grid. A drawn stroke is resampled and compared
   * point by point with that line, then direction and order are checked to explain what went wrong.
   */
  function resample(pts, n) {
    var out = [], i;
    if (pathLen(pts) === 0) { for (i = 0; i < n; i++) { out.push(pts[0]); } return out; }
    for (i = 0; i < n; i++) { out.push(pointAt(pts, i / (n - 1))); }
    return out;
  }
  function avgDist(a, b) { var s = 0, i; for (i = 0; i < a.length; i++) { s += dist(a[i], b[i]); } return s / a.length; }
  function angleOf(pts) {
    var a = pts[0], b = pts[pts.length - 1];
    return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  }
  function angleGap(a, b) { var d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }

  // Douglas-Peucker, then merge into at most three compass directions, e.g. ['right', 'down'].
  function rdp(pts, eps) {
    if (pts.length < 3) { return pts.slice(); }
    var a = pts[0], b = pts[pts.length - 1], best = -1, bi = 0, i, d, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    for (i = 1; i < pts.length - 1; i++) {
      d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / L;
      if (d > best) { best = d; bi = i; }
    }
    if (best <= eps) { return [a, b]; }
    return rdp(pts.slice(0, bi + 1), eps).slice(0, -1).concat(rdp(pts.slice(bi), eps));
  }
  function simplifyDirs(pts) {
    var s = rdp(pts, 7), out = [], i, d;
    for (i = 1; i < s.length; i++) {
      if (dist(s[i - 1], s[i]) < 9 && s.length > 2) { continue; }
      d = DIRS[dirIndex(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1])];
      if (out[out.length - 1] !== d) { out.push(d); }
    }
    if (!out.length) { out.push(DIRS[dirIndex(pts[pts.length - 1][0] - pts[0][0], pts[pts.length - 1][1] - pts[0][1])]); }
    return out.slice(0, 3);
  }
  var NAMES = {
    'right': ['横', 'héng'], 'down': ['竖', 'shù'], 'downleft': ['撇', 'piě'], 'downright': ['捺', 'nà'],
    'upright': ['提', 'tí'], 'right-down': ['横折', 'héngzhé'], 'down-right': ['竖折', 'shùzhé'],
    'right-downleft': ['横撇', 'héngpiě'], 'down-upright': ['竖提', 'shùtí'], 'right-down-upleft': ['横折钩', 'héngzhégōu'],
    'down-left': ['竖钩', 'shùgōu'], 'down-upleft': ['竖钩', 'shùgōu'], 'right-upleft': ['横钩', 'hénggōu']
  };
  function nameOf(dirs) { var n = NAMES[dirs.join('-')]; return n ? { zh: n[0], py: n[1] } : null; }
  function label(exp, i) {
    var n = exp.zh ? ' (' + exp.zh + ' ' + exp.py + ')' : '';
    return 'stroke ' + (i + 1) + n;
  }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function arrows(dirs) { return dirs.map(function (d) { return ARROW[d]; }).join(' then '); }

  function evalGeneric(strokes, i, drawn, tolArg) {
    var exp = strokes[i], tol = tolArg ? tolArg * 0.58 : 15, N = 16, elen = pathLen(exp.pts), k;
    if (drawn && drawn.length === 1 && elen < 16) { drawn = [drawn[0], [drawn[0][0] + 0.5, drawn[0][1]]]; }
    if (!drawn || drawn.length < 2 || pathLen(drawn) < Math.max(5, elen * 0.45)) {
      return { ok: false, code: 'short', msg: 'Make the stroke a little longer.' };
    }
    var D = resample(drawn, N), E = resample(exp.pts, N);
    var d = avgDist(D, E);
    var gap = (elen < 14 || pathLen(drawn) < 6) ? 0 : angleGap(angleOf(drawn), angleOf(exp.pts));
    if (d <= tol && gap <= 75) { return { ok: true, code: 'ok', msg: '✓ ' + (exp.zh ? exp.zh + ' ' + exp.py + ': ' : '') + 'well done!' }; }
    for (k = i + 1; k < strokes.length; k++) {
      var dk = avgDist(D, resample(strokes[k].pts, N));
      if (dk <= tol * 0.7 && dk < d - 4) {
        return { ok: false, code: 'order', later: k,
          msg: 'Careful with the order! That looks like ' + label(strokes[k], k) + '. ' + cap(label(exp, i)) + ' comes first. Rule: top before bottom, left before right.' };
      }
    }
    var rev = avgDist(D, E.slice().reverse());
    if (rev <= tol && rev < d) {
      return { ok: false, code: 'dir', msg: 'Right place, but backwards! Start at the numbered dot and go ' + arrows(exp.dirs) + '.' };
    }
    if (gap > 75) {
      return { ok: false, code: 'dir', msg: 'Not quite: that went ' + arrows(simplifyDirs(drawn)) + '. ' + cap(label(exp, i)) + ' goes ' + arrows(exp.dirs) + '.' };
    }
    return { ok: false, code: 'pos', msg: 'Nearly! Follow the grey guide a little more closely for ' + label(exp, i) + '.' };
  }

  // Turn the packed data for one character into stroke objects the writing pad understands.
  function hzChar(c) {
    var d = MD.HZ && MD.HZ[c];
    if (!d) { return null; }
    if (d._c) { return d._c; }
    var strokes = d.m.map(function (m, i) {
      var dirs = simplifyDirs(m), nm = nameOf(dirs) || {};
      return { generic: true, pts: m, path: d.s[i], dirs: dirs, zh: nm.zh || '', py: nm.py || '' };
    });
    d._c = { ch: c, strokes: strokes };
    return d._c;
  }

  MD.Strokes = {
    DIRS: DIRS, ARROW: ARROW, HOW: HOW,
    dist: dist, pathLen: pathLen, pointAt: pointAt, partial: partial,
    dirIndex: dirIndex, evaluate: evaluate, howText: howText, simplifyDirs: simplifyDirs, hzChar: hzChar, resample: resample, avgDist: avgDist
  };
})(typeof window !== 'undefined' ? window : globalThis);
