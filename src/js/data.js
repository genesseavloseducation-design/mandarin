/* Little Dragon Mandarin — lesson data.
 * Everything the game teaches lives here, so you can add content without touching game code.
 * Pictures are emoji so the project has no image files and works fully offline.
 */
(function (root) {
  'use strict';
  var MD = root.MD = root.MD || {};

  /* ---------- Level 1: pinyin sounds ---------- */
  // id = the letter(s); syl = traditional "name" syllable; say = a character spoken aloud for that sound;
  // word = example word whose pinyin starts with / contains the sound; tl = toneless pinyin (used by quizzes).
  MD.INITIALS = [
    { id: 'b',  syl: 'bo',  say: '波', hint: 'Like the “p” in “spy”: lips pop open, no puff of air.', word: { hz: '八', py: 'bā', tl: 'ba', en: 'eight', pic: '8️⃣' } },
    { id: 'p',  syl: 'po',  say: '坡', hint: 'Like the “p” in “pie”: lips pop open WITH a puff of air. A tissue in front of your mouth should flutter!', word: { hz: '苹果', py: 'píng guǒ', tl: 'pingguo', en: 'apple', pic: '🍎' } },
    { id: 'm',  syl: 'mo',  say: '摸', hint: 'Like the “m” in “mom”. Lips together, hum.', word: { hz: '猫', py: 'māo', tl: 'mao', en: 'cat', pic: '🐱' } },
    { id: 'f',  syl: 'fo',  say: '佛', hint: 'Like the “f” in “fun”. Top teeth on bottom lip.', word: { hz: '飞机', py: 'fēi jī', tl: 'feiji', en: 'airplane', pic: '✈️' } },
    { id: 'd',  syl: 'de',  say: '得', hint: 'Like the “t” in “sty”: tongue taps behind top teeth, no puff.', word: { hz: '大象', py: 'dà xiàng', tl: 'daxiang', en: 'elephant', pic: '🐘' } },
    { id: 't',  syl: 'te',  say: '特', hint: 'Like the “t” in “top”, with a puff of air.', word: { hz: '兔子', py: 'tù zi', tl: 'tuzi', en: 'rabbit', pic: '🐰' } },
    { id: 'n',  syl: 'ne',  say: '讷', hint: 'Like the “n” in “no”.', word: { hz: '牛', py: 'niú', tl: 'niu', en: 'cow', pic: '🐮' } },
    { id: 'l',  syl: 'le',  say: '勒', hint: 'Like the “l” in “look”.', word: { hz: '龙', py: 'lóng', tl: 'long', en: 'dragon', pic: '🐉' } },
    { id: 'g',  syl: 'ge',  say: '哥', hint: 'Like the “k” in “sky”: back of the tongue lifts, no puff.', word: { hz: '狗', py: 'gǒu', tl: 'gou', en: 'dog', pic: '🐶' } },
    { id: 'k',  syl: 'ke',  say: '科', hint: 'Like the “k” in “kite”, with a puff of air.', word: { hz: '咖啡', py: 'kā fēi', tl: 'kafei', en: 'coffee', pic: '☕' } },
    { id: 'h',  syl: 'he',  say: '喝', hint: 'Like “h” in “hat”, but a little more scratchy from the back of the throat.', word: { hz: '花', py: 'huā', tl: 'hua', en: 'flower', pic: '🌸' } },
    { id: 'j',  syl: 'ji',  say: '基', hint: 'Like the “j” in “jeep”, with lips spread wide in a smile.', word: { hz: '鸡', py: 'jī', tl: 'ji', en: 'chicken', pic: '🐔' } },
    { id: 'q',  syl: 'qi',  say: '欺', hint: 'Like the “ch” in “cheese”, smiling lips, with a puff of air.', word: { hz: '球', py: 'qiú', tl: 'qiu', en: 'ball', pic: '⚽' } },
    { id: 'x',  syl: 'xi',  say: '希', hint: 'A soft “sh” made with a smile, tongue tip down behind your bottom teeth.', word: { hz: '西瓜', py: 'xī guā', tl: 'xigua', en: 'watermelon', pic: '🍉' } },
    { id: 'zh', syl: 'zhi', say: '知', hint: 'Like the “j” in “judge”. Curl the tongue tip back. No puff.', word: { hz: '猪', py: 'zhū', tl: 'zhu', en: 'pig', pic: '🐷' } },
    { id: 'ch', syl: 'chi', say: '吃', hint: 'Like the “ch” in “church”. Curl the tongue back and add a puff of air.', word: { hz: '茶', py: 'chá', tl: 'cha', en: 'tea', pic: '🍵' } },
    { id: 'sh', syl: 'shi', say: '诗', hint: 'Like the “sh” in “shirt”. Tongue tip curled back.', word: { hz: '书', py: 'shū', tl: 'shu', en: 'book', pic: '📖' } },
    { id: 'r',  syl: 'ri',  say: '日', hint: 'Like the “r” in “run” but with the tongue curled back. It sounds a bit like the “s” in “measure”.', word: { hz: '日', py: 'rì', tl: 'ri', en: 'sun / day', pic: '☀️' } },
    { id: 'z',  syl: 'zi',  say: '资', hint: 'Like the “ds” in “kids”. Tongue tip behind the top teeth, no puff.', word: { hz: '嘴', py: 'zuǐ', tl: 'zui', en: 'mouth', pic: '👄' } },
    { id: 'c',  syl: 'ci',  say: '雌', hint: 'Like the “ts” in “cats”, with a puff of air.', word: { hz: '草', py: 'cǎo', tl: 'cao', en: 'grass', pic: '🌿' } },
    { id: 's',  syl: 'si',  say: '思', hint: 'Like the “s” in “sun”.', word: { hz: '伞', py: 'sǎn', tl: 'san', en: 'umbrella', pic: '☂️' } },
    { id: 'y',  syl: 'yi',  say: '衣', hint: 'Like the “y” in “yes”.', word: { hz: '鸭子', py: 'yā zi', tl: 'yazi', en: 'duck', pic: '🦆' } },
    { id: 'w',  syl: 'wu',  say: '乌', hint: 'Like the “w” in “water”.', word: { hz: '袜子', py: 'wà zi', tl: 'wazi', en: 'socks', pic: '🧦' } }
  ];

  // match = substrings of toneless pinyin that count as "containing" this final (used to avoid unfair quiz choices).
  MD.FINALS = [
    { id: 'a',   hint: 'Open your mouth wide: “ah”, like at the doctor.', word: { hz: '马', py: 'mǎ', tl: 'ma', en: 'horse', pic: '🐴' } },
    { id: 'o',   hint: 'Round lips: “aw”, like in “law”.', word: { hz: '菠萝', py: 'bō luó', tl: 'boluo', en: 'pineapple', pic: '🍍' } },
    { id: 'e',   hint: 'Pull your tongue back and say “uh”, like in “duh”.', word: { hz: '车', py: 'chē', tl: 'che', en: 'car', pic: '🚗' } },
    { id: 'i',   hint: 'Smile and say “ee”, like in “see”. (After zh, ch, sh, r, z, c, s it becomes a buzzing sound.)', word: { hz: '衣服', py: 'yī fu', tl: 'yifu', en: 'clothes', pic: '👕' } },
    { id: 'u',   hint: 'Round your lips tightly: “oo”, like in “moon”.', word: { hz: '乌龟', py: 'wū guī', tl: 'wugui', en: 'turtle', pic: '🐢' } },
    { id: 'ü',   match: ['ü', 'u'], hint: 'Say “ee”, then round your lips like “oo” without moving your tongue. (Written “u” after j, q, x, y.)', word: { hz: '鱼', py: 'yú', tl: 'yu', en: 'fish', pic: '🐟' } },
    { id: 'ai',  hint: 'Like the word “eye”.', word: { hz: '爱', py: 'ài', tl: 'ai', en: 'love', pic: '❤️' } },
    { id: 'ei',  hint: 'Like “ay” in “say”.', word: { hz: '黑', py: 'hēi', tl: 'hei', en: 'black', pic: '⬛' } },
    { id: 'ao',  hint: 'Like “ow” in “cow”.', word: { hz: '帽子', py: 'mào zi', tl: 'maozi', en: 'hat', pic: '🧢' } },
    { id: 'ou',  hint: 'Like “oh” in “go”.', word: { hz: '手', py: 'shǒu', tl: 'shou', en: 'hand', pic: '✋' } },
    { id: 'an',  hint: 'Like “ahn”, as in “Don”.', word: { hz: '山', py: 'shān', tl: 'shan', en: 'mountain', pic: '⛰️' } },
    { id: 'en',  hint: 'Like “un” in “run”.', word: { hz: '门', py: 'mén', tl: 'men', en: 'door', pic: '🚪' } },
    { id: 'ang', hint: 'Like “ahng”, with the sound ringing at the back of the nose.', word: { hz: '糖', py: 'táng', tl: 'tang', en: 'candy', pic: '🍬' } },
    { id: 'eng', hint: 'Like “ung” in “lung”.', word: { hz: '灯', py: 'dēng', tl: 'deng', en: 'lamp', pic: '💡' } },
    { id: 'ong', hint: 'Like “oong”, round lips and ring at the back of the nose.', word: { hz: '虫', py: 'chóng', tl: 'chong', en: 'bug', pic: '🐛' } }
  ];
  MD.INITIALS.forEach(function (x) { x.kind = 'initial'; });
  MD.FINALS.forEach(function (x) { x.kind = 'final'; x.say = x.word.hz; });

  /* ---------- Level 2: tones ---------- */
  MD.TONES = [
    { t: 1, zh: '一声', name: 'First tone', mark: 'ā', hint: 'High and flat, like holding one steady note when you sing.' },
    { t: 2, zh: '二声', name: 'Second tone', mark: 'á', hint: 'Rising, like saying “What?” in surprise.' },
    { t: 3, zh: '三声', name: 'Third tone', mark: 'ǎ', hint: 'Dip down low, then come back up, like “Hmm… really?”' },
    { t: 4, zh: '四声', name: 'Fourth tone', mark: 'à', hint: 'A sharp fall, like a firm “No!” or “Stop!”' },
    { t: 5, zh: '轻声', name: 'Neutral tone', mark: 'a', hint: 'Light and short, hardly any tone at all, like the second “ma” in māma.' }
  ];
  MD.TONE_SETS = [
    { syl: 'ma', items: [
      { t: 1, py: 'mā', ch: '妈', en: 'mom' }, { t: 2, py: 'má', ch: '麻', en: 'hemp' },
      { t: 3, py: 'mǎ', ch: '马', en: 'horse' }, { t: 4, py: 'mà', ch: '骂', en: 'to scold' } ] },
    { syl: 'ba', items: [
      { t: 1, py: 'bā', ch: '八', en: 'eight' }, { t: 2, py: 'bá', ch: '拔', en: 'to pull' },
      { t: 3, py: 'bǎ', ch: '把', en: 'to hold' }, { t: 4, py: 'bà', ch: '爸', en: 'dad' } ] },
    { syl: 'shu', items: [
      { t: 1, py: 'shū', ch: '书', en: 'book' }, { t: 2, py: 'shú', ch: '熟', en: 'ripe' },
      { t: 3, py: 'shǔ', ch: '鼠', en: 'mouse' }, { t: 4, py: 'shù', ch: '树', en: 'tree' } ] },
    { syl: 'yi', items: [
      { t: 1, py: 'yī', ch: '衣', en: 'clothes' }, { t: 2, py: 'yí', ch: '姨', en: 'aunt' },
      { t: 3, py: 'yǐ', ch: '椅', en: 'chair' }, { t: 4, py: 'yì', ch: '意', en: 'meaning' } ] }
  ];

  /* ---------- Level 3: strokes (writing gestures) ---------- */
  // Coordinates are on a 100 x 100 grid, y grows downward. dirs use 8 compass-style names.
  // corner = index of the point where a two-direction stroke turns.
  MD.STROKE_TYPES = [
    { id: 'heng',    zh: '横',   py: 'héng',    en: 'horizontal',    dirs: ['right'],            pts: [[12, 50], [88, 50]],                eg: '一' },
    { id: 'shu',     zh: '竖',   py: 'shù',     en: 'vertical',      dirs: ['down'],             pts: [[50, 10], [50, 90]],                eg: '十' },
    { id: 'pie',     zh: '撇',   py: 'piě',     en: 'left-falling',  dirs: ['downleft'],         pts: [[72, 12], [50, 50], [22, 88]],      eg: '人' },
    { id: 'na',      zh: '捺',   py: 'nà',      en: 'right-falling', dirs: ['downright'],        pts: [[28, 12], [50, 58], [84, 88]],      eg: '人' },
    { id: 'dian',    zh: '点',   py: 'diǎn',    en: 'dot',           dirs: ['downright'],        pts: [[40, 30], [52, 50], [62, 68]],      eg: '小' },
    { id: 'hengzhe', zh: '横折', py: 'héngzhé', en: 'horizontal, then turn down', dirs: ['right', 'down'], pts: [[20, 22], [80, 22], [80, 86]], corner: 1, eg: '口' },
    { id: 'shuzhe',  zh: '竖折', py: 'shùzhé',  en: 'vertical, then turn right',  dirs: ['down', 'right'], pts: [[20, 18], [20, 82], [80, 82]], corner: 1, eg: '山' }
  ];
  MD.STROKE_HOW = {
    heng: 'Start on the left and draw straight across to the right →',
    shu: 'Start at the top and draw straight down ↓',
    pie: 'Start at the top and sweep down to the left ↙, lighter at the end',
    na: 'Start at the top left and press down to the right ↘, finishing with a flat “foot”',
    dian: 'A short press down to the right ↘ (a left-hand dot goes ↙)',
    hengzhe: 'Go right →, then turn the corner and go down ↓, all in one stroke without lifting!',
    shuzhe: 'Go down ↓, then turn the corner and go right →, all in one stroke without lifting!'
  };

  var TBY = {};
  MD.STROKE_TYPES.forEach(function (t) { TBY[t.id] = t; });
  function s(id, pts, over) {
    var t = TBY[id];
    var r = { id: id, zh: t.zh, py: t.py, en: t.en, dirs: t.dirs.slice(), pts: pts, corner: t.corner };
    if (over) { for (var k in over) { r[k] = over[k]; } }
    return r;
  }

  // Stroke order follows the standard rules: top to bottom, left to right, horizontals before verticals,
  // middle before the sides, enclose first then close the box.
  MD.CHARS = [
    { ch: '一', py: 'yī',    en: 'one',      pic: '1️⃣', strokes: [ s('heng', [[15, 50], [85, 50]]) ] },
    { ch: '二', py: 'èr',    en: 'two',      pic: '2️⃣', strokes: [ s('heng', [[28, 34], [72, 34]]), s('heng', [[14, 68], [86, 68]]) ] },
    { ch: '三', py: 'sān',   en: 'three',    pic: '3️⃣', strokes: [ s('heng', [[30, 24], [70, 24]]), s('heng', [[22, 50], [78, 50]]), s('heng', [[12, 76], [88, 76]]) ] },
    { ch: '十', py: 'shí',   en: 'ten',      pic: '🔟', strokes: [ s('heng', [[15, 50], [85, 50]]), s('shu', [[50, 15], [50, 88]]) ] },
    { ch: '八', py: 'bā',    en: 'eight',    pic: '8️⃣', strokes: [ s('pie', [[46, 26], [36, 52], [22, 80]]), s('na', [[56, 40], [68, 62], [82, 80]]) ] },
    { ch: '人', py: 'rén',   en: 'person',   pic: '🧑', strokes: [ s('pie', [[54, 16], [38, 52], [16, 86]]), s('na', [[42, 46], [62, 66], [86, 86]]) ] },
    { ch: '大', py: 'dà',    en: 'big',      pic: '🐘', strokes: [ s('heng', [[14, 40], [86, 40]]), s('pie', [[52, 14], [34, 56], [14, 88]]), s('na', [[44, 44], [66, 66], [88, 88]]) ] },
    { ch: '小', py: 'xiǎo',  en: 'small',    pic: '🐭', strokes: [ s('shu', [[50, 14], [50, 88]], { zh: '竖钩', py: 'shùgōu' }), s('dian', [[34, 40], [26, 58], [18, 76]], { dirs: ['downleft'] }), s('dian', [[66, 40], [74, 58], [82, 76]]) ] },
    { ch: '口', py: 'kǒu',   en: 'mouth',    pic: '👄', strokes: [ s('shu', [[26, 26], [26, 76]]), s('hengzhe', [[26, 26], [74, 26], [74, 76]]), s('heng', [[26, 76], [74, 76]]) ] },
    { ch: '日', py: 'rì',    en: 'sun / day', pic: '☀️', strokes: [ s('shu', [[28, 14], [28, 86]]), s('hengzhe', [[28, 14], [72, 14], [72, 86]]), s('heng', [[28, 50], [72, 50]]), s('heng', [[28, 86], [72, 86]]) ] },
    { ch: '山', py: 'shān',  en: 'mountain', pic: '⛰️', strokes: [ s('shu', [[50, 16], [50, 80]]), s('shuzhe', [[20, 44], [20, 82], [82, 82]]), s('shu', [[82, 44], [82, 82]]) ] },
    { ch: '木', py: 'mù',    en: 'tree / wood', pic: '🪵', strokes: [ s('heng', [[14, 36], [86, 36]]), s('shu', [[50, 12], [50, 88]]), s('pie', [[46, 44], [32, 64], [14, 84]]), s('na', [[54, 44], [70, 64], [88, 84]]) ] },
    { ch: '中', py: 'zhōng', en: 'middle',   pic: '🎯', strokes: [ s('shu', [[26, 34], [26, 68]]), s('hengzhe', [[26, 34], [74, 34], [74, 68]]), s('heng', [[26, 68], [74, 68]]), s('shu', [[50, 12], [50, 90]]) ] }
  ];
  MD.CHARS_BY = {};
  MD.CHARS.forEach(function (c) { MD.CHARS_BY[c.ch] = c; });

  /* ---------- Level 4: picture words ---------- */
  MD.WORDS = [
    { hz: '猫', py: 'māo', en: 'cat', pic: '🐱' },
    { hz: '狗', py: 'gǒu', en: 'dog', pic: '🐶' },
    { hz: '鱼', py: 'yú', en: 'fish', pic: '🐟' },
    { hz: '鸟', py: 'niǎo', en: 'bird', pic: '🐦' },
    { hz: '马', py: 'mǎ', en: 'horse', pic: '🐴' },
    { hz: '牛', py: 'niú', en: 'cow', pic: '🐮' },
    { hz: '羊', py: 'yáng', en: 'sheep', pic: '🐑' },
    { hz: '猪', py: 'zhū', en: 'pig', pic: '🐷' },
    { hz: '鸡', py: 'jī', en: 'chicken', pic: '🐔' },
    { hz: '鸭子', py: 'yā zi', en: 'duck', pic: '🦆' },
    { hz: '兔子', py: 'tù zi', en: 'rabbit', pic: '🐰' },
    { hz: '龙', py: 'lóng', en: 'dragon', pic: '🐉' },
    { hz: '水', py: 'shuǐ', en: 'water', pic: '💧' },
    { hz: '火', py: 'huǒ', en: 'fire', pic: '🔥' },
    { hz: '花', py: 'huā', en: 'flower', pic: '🌸' },
    { hz: '树', py: 'shù', en: 'tree', pic: '🌳' },
    { hz: '月亮', py: 'yuè liang', en: 'moon', pic: '🌙' },
    { hz: '星星', py: 'xīng xing', en: 'star', pic: '⭐' },
    { hz: '书', py: 'shū', en: 'book', pic: '📖' },
    { hz: '汽车', py: 'qì chē', en: 'car', pic: '🚗' },
    { hz: '苹果', py: 'píng guǒ', en: 'apple', pic: '🍎' },
    { hz: '牛奶', py: 'niú nǎi', en: 'milk', pic: '🥛' },
    { hz: '米饭', py: 'mǐ fàn', en: 'rice', pic: '🍚' },
    { hz: '山', py: 'shān', en: 'mountain', pic: '⛰️' },
    { hz: '日', py: 'rì', en: 'sun', pic: '☀️' },
    { hz: '口', py: 'kǒu', en: 'mouth', pic: '👄' },
    { hz: '人', py: 'rén', en: 'person', pic: '🧑' }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
