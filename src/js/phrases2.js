/* More phrases (numbers, family, colours, food), conversations, and the "words to avoid" list. */
(function (root) {
  'use strict';
  var MD = root.MD = root.MD || {};

  function add(theme, rows) {
    rows.forEach(function (r) { MD.PHRASES.push({ theme: theme, hz: r[0], py: r[1], en: r[2], pic: r[3], note: r[4] }); });
  }

  add('Numbers', [
    ['一', 'yī', 'One', '1️⃣', 'Before a fourth tone, 一 changes to “yí”, as in 一遍 yí biàn.'],
    ['二', 'èr', 'Two', '2️⃣', 'For “two things”, people say 两 (liǎng). 二 is for counting: one, two, three.'],
    ['三', 'sān', 'Three', '3️⃣'],
    ['四', 'sì', 'Four', '4️⃣', 'Sounds almost like 死 (sǐ, “die”), so some people avoid the number four. Mind the falling tone!'],
    ['五', 'wǔ', 'Five', '5️⃣'],
    ['六', 'liù', 'Six', '6️⃣', 'Six is a lucky number: it sounds like “smooth”.'],
    ['七', 'qī', 'Seven', '7️⃣'],
    ['八', 'bā', 'Eight', '8️⃣', 'Eight is the luckiest number: it sounds like “getting rich”.'],
    ['九', 'jiǔ', 'Nine', '9️⃣'],
    ['十', 'shí', 'Ten', '🔟', 'Eleven is “ten-one” (十一), twelve is “ten-two” (十二), and so on.']
  ]);

  add('Family', [
    ['妈妈', 'mā ma', 'Mom', '👩', 'Baby’s first words in every language sound alike: mā ma, bà ba.'],
    ['爸爸', 'bà ba', 'Dad', '👨'],
    ['哥哥', 'gē ge', 'Older brother', '🧑'],
    ['姐姐', 'jiě jie', 'Older sister', '👧'],
    ['弟弟', 'dì di', 'Younger brother', '👦'],
    ['妹妹', 'mèi mei', 'Younger sister', '👶'],
    ['奶奶', 'nǎi nai', 'Grandma (dad’s mom)', '👵'],
    ['爷爷', 'yé ye', 'Grandpa (dad’s dad)', '👴'],
    ['家', 'jiā', 'Home / family', '🏠', 'The character shows a pig under a roof, which was once a sign of a prosperous home.']
  ]);

  add('Colours', [
    ['红色', 'hóng sè', 'Red', '🔴', 'Red is lucky in China. It means joy and good fortune.'],
    ['蓝色', 'lán sè', 'Blue', '🔵'],
    ['黄色', 'huáng sè', 'Yellow', '🟡'],
    ['绿色', 'lǜ sè', 'Green', '🟢', 'ü is “ee” with round lips.'],
    ['白色', 'bái sè', 'White', '⚪'],
    ['黑色', 'hēi sè', 'Black', '⚫'],
    ['紫色', 'zǐ sè', 'Purple', '🟣'],
    ['橙色', 'chéng sè', 'Orange', '🟠']
  ]);

  add('Food & drink', [
    ['米饭', 'mǐ fàn', 'Rice', '🍚', 'Rice is so important that “have you eaten?” is a common way to say hello.'],
    ['面条', 'miàn tiáo', 'Noodles', '🍜'],
    ['面包', 'miàn bāo', 'Bread', '🍞'],
    ['鸡蛋', 'jī dàn', 'Egg', '🥚'],
    ['牛奶', 'niú nǎi', 'Milk', '🥛'],
    ['苹果', 'píng guǒ', 'Apple', '🍎'],
    ['香蕉', 'xiāng jiāo', 'Banana', '🍌'],
    ['水果', 'shuǐ guǒ', 'Fruit', '🍇'],
    ['鱼', 'yú', 'Fish', '🐟'],
    ['肉', 'ròu', 'Meat', '🥩'],
    ['蔬菜', 'shū cài', 'Vegetables', '🥦'],
    ['汤', 'tāng', 'Soup', '🍲'],
    ['茶', 'chá', 'Tea', '🍵'],
    ['饺子', 'jiǎo zi', 'Dumplings', '🥟']
  ]);

  /* ---------- conversations ----------
   * Each turn: the friend says something; the child picks (and can then say aloud) a good reply.
   * ok:true marks every acceptable reply. A wrong reply is explained (why, or its meaning).
   */
  function R(hz, py, en, ok, why) { return { hz: hz, py: py, en: en, ok: !!ok, why: why }; }
  MD.CONVOS = [
    { id: 'meet', title: 'Meeting a new friend', zh: '新朋友', pic: '🤝', who: '🧒',
      turns: [
        { say: { hz: '你好！', py: 'nǐ hǎo', en: 'Hello!' },
          replies: [ R('你好！', 'nǐ hǎo', 'Hello!', 1), R('再见！', 'zài jiàn', 'Goodbye!', 0, 'That means goodbye. Save it for when you leave.'), R('对不起', 'duì bu qǐ', 'Sorry', 0) ] },
        { say: { hz: '你叫什么名字？', py: 'nǐ jiào shén me míng zi', en: 'What is your name?' },
          replies: [ R('我叫小龙', 'wǒ jiào xiǎo lóng', 'My name is Little Dragon', 1), R('我很好', 'wǒ hěn hǎo', 'I am fine', 0, 'That answers “how are you?”. They asked your name.'), R('我要水', 'wǒ yào shuǐ', 'I want water', 0) ] },
        { say: { hz: '你好吗？', py: 'nǐ hǎo ma', en: 'How are you?' },
          replies: [ R('我很好', 'wǒ hěn hǎo', 'I am fine', 1), R('不客气', 'bú kè qi', 'You are welcome', 0, 'You say that after someone thanks you.'), R('好吃', 'hǎo chī', 'Delicious', 0) ] },
        { say: { hz: '很高兴认识你！', py: 'hěn gāo xìng rèn shi nǐ', en: 'Nice to meet you!' },
          replies: [ R('我也是', 'wǒ yě shì', 'Me too', 1), R('晚安', 'wǎn ān', 'Good night', 0), R('我不知道', 'wǒ bù zhī dào', 'I do not know', 0, 'They said something kind. “I do not know” does not answer it.') ] },
        { say: { hz: '再见！', py: 'zài jiàn', en: 'Goodbye!' },
          replies: [ R('再见！', 'zài jiàn', 'Goodbye!', 1), R('早上好', 'zǎo shang hǎo', 'Good morning', 0), R('我饿了', 'wǒ è le', 'I am hungry', 0) ] }
      ] },
    { id: 'food', title: 'At the restaurant', zh: '点餐', pic: '🍜', who: '🧑‍🍳',
      turns: [
        { say: { hz: '你想吃什么？', py: 'nǐ xiǎng chī shén me', en: 'What would you like to eat?' },
          replies: [ R('我要米饭', 'wǒ yào mǐ fàn', 'I want rice', 1), R('我是学生', 'wǒ shì xué sheng', 'I am a student', 0), R('再见', 'zài jiàn', 'Goodbye', 0) ] },
        { say: { hz: '你想喝什么？', py: 'nǐ xiǎng hē shén me', en: 'What would you like to drink?' },
          replies: [ R('我要水', 'wǒ yào shuǐ', 'I want water', 1), R('我要茶', 'wǒ yào chá', 'I want tea', 1), R('我要米饭', 'wǒ yào mǐ fàn', 'I want rice', 0, 'Rice is food. They asked what you want to drink.') ] },
        { say: { hz: '好吃吗？', py: 'hǎo chī ma', en: 'Is it tasty?' },
          replies: [ R('好吃！', 'hǎo chī', 'Delicious!', 1), R('不好吃', 'bù hǎo chī', 'Not tasty', 1), R('晚安', 'wǎn ān', 'Good night', 0) ] },
        { say: { hz: '给你。', py: 'gěi nǐ', en: 'Here you are.' },
          replies: [ R('谢谢！', 'xiè xie', 'Thank you!', 1), R('不客气', 'bú kè qi', 'You are welcome', 0, 'That is for after someone thanks you. Here, you are the one to say thanks.'), R('我饿了', 'wǒ è le', 'I am hungry', 0) ] }
      ] },
    { id: 'family', title: 'Talking about family', zh: '家人', pic: '👨‍👩‍👧', who: '🧒',
      turns: [
        { say: { hz: '这是我妈妈。', py: 'zhè shì wǒ mā ma', en: 'This is my mom.' },
          replies: [ R('你好！', 'nǐ hǎo', 'Hello!', 1), R('再见！', 'zài jiàn', 'Goodbye!', 0, 'You just met her. Say hello first!'), R('我不知道', 'wǒ bù zhī dào', 'I do not know', 0) ] },
        { say: { hz: '你有哥哥吗？', py: 'nǐ yǒu gē ge ma', en: 'Do you have an older brother?' },
          replies: [ R('我有哥哥', 'wǒ yǒu gē ge', 'I have an older brother', 1), R('我没有哥哥', 'wǒ méi yǒu gē ge', 'I do not have an older brother', 1), R('我要水', 'wǒ yào shuǐ', 'I want water', 0) ] },
        { say: { hz: '你爱你的妈妈吗？', py: 'nǐ ài nǐ de mā ma ma', en: 'Do you love your mom?' },
          replies: [ R('我爱我的妈妈', 'wǒ ài wǒ de mā ma', 'I love my mom', 1), R('对不起', 'duì bu qǐ', 'Sorry', 0), R('晚安', 'wǎn ān', 'Good night', 0) ] },
        { say: { hz: '你几岁？', py: 'nǐ jǐ suì', en: 'How old are you?' },
          replies: [ R('我五岁', 'wǒ wǔ suì', 'I am five', 1), R('我六岁', 'wǒ liù suì', 'I am six', 1), R('我是学生', 'wǒ shì xué sheng', 'I am a student', 0, 'True, but they asked your age. Say your number plus 岁 (suì).') ] }
      ] },
    { id: 'help', title: 'Asking for help', zh: '问路', pic: '🚻', who: '🧑',
      turns: [
        { say: { hz: '你好，需要帮忙吗？', py: 'nǐ hǎo xū yào bāng máng ma', en: 'Hello, do you need help?' },
          replies: [ R('请问，厕所在哪里？', 'qǐng wèn cè suǒ zài nǎ li', 'Excuse me, where is the toilet?', 1), R('晚安', 'wǎn ān', 'Good night', 0), R('我爱你', 'wǒ ài nǐ', 'I love you', 0, 'That is very sweet, but not what we need right now!') ] },
        { say: { hz: '在那里。', py: 'zài nà li', en: 'It is over there.' },
          replies: [ R('谢谢！', 'xiè xie', 'Thank you!', 1), R('对不起', 'duì bu qǐ', 'Sorry', 0), R('我不知道', 'wǒ bù zhī dào', 'I do not know', 0) ] },
        { say: { hz: '不客气！', py: 'bú kè qi', en: 'You are welcome!' },
          replies: [ R('再见！', 'zài jiàn', 'Goodbye!', 1), R('好吃', 'hǎo chī', 'Delicious', 0), R('我饿了', 'wǒ è le', 'I am hungry', 0) ] }
      ] },
    { id: 'day', title: 'A day at school', zh: '上学', pic: '🏫', who: '🧑‍🏫',
      turns: [
        { say: { hz: '早上好！', py: 'zǎo shang hǎo', en: 'Good morning!' },
          replies: [ R('早上好！', 'zǎo shang hǎo', 'Good morning!', 1), R('晚安', 'wǎn ān', 'Good night', 0, 'Good night is for bedtime.'), R('再见', 'zài jiàn', 'Goodbye', 0) ] },
        { say: { hz: '你饿吗？', py: 'nǐ è ma', en: 'Are you hungry?' },
          replies: [ R('我饿了', 'wǒ è le', 'I am hungry', 1), R('我不饿', 'wǒ bú è', 'I am not hungry', 1), R('谢谢', 'xiè xie', 'Thank you', 0) ] },
        { say: { hz: '今天你去学校吗？', py: 'jīn tiān nǐ qù xué xiào ma', en: 'Are you going to school today?' },
          replies: [ R('我去学校', 'wǒ qù xué xiào', 'I am going to school', 1), R('我不去', 'wǒ bú qù', 'I am not going', 1), R('不客气', 'bú kè qi', 'You are welcome', 0) ] },
        { say: { hz: '明天见！', py: 'míng tiān jiàn', en: 'See you tomorrow!' },
          replies: [ R('明天见！', 'míng tiān jiàn', 'See you tomorrow!', 1), R('对不起', 'duì bu qǐ', 'Sorry', 0), R('我要水', 'wǒ yào shuǐ', 'I want water', 0) ] }
      ] }
  ];

  /* ---------- words to avoid ----------
   * sev 0 = looks scary but is fine, 1 = a bit rude, 2 = rude, 3 = swear word.
   * alt = something polite to say instead.
   */
  MD.SEVERITY = [
    { sev: 0, name: 'Fine to say', short: 'Fine to say', color: 'good' },
    { sev: 1, name: 'A bit rude', short: 'A bit rude', color: 'warn' },
    { sev: 2, name: 'Rude. Do not say it to people', short: 'Rude', color: 'bad' },
    { sev: 3, name: 'Swear word. Never say it', short: 'Swear word', color: 'bad' }
  ];
  MD.ALTS = {
    stop: { hz: '请你别这样', py: 'qǐng nǐ bié zhè yàng', en: 'Please do not do that' },
    quiet: { hz: '请你安静', py: 'qǐng nǐ ān jìng', en: 'Please be quiet' },
    away: { hz: '请你走开', py: 'qǐng nǐ zǒu kāi', en: 'Please go away' },
    dislike: { hz: '我不喜欢这样', py: 'wǒ bù xǐ huan zhè yàng', en: 'I do not like that' },
    angry: { hz: '我很生气', py: 'wǒ hěn shēng qì', en: 'I am angry' }
  };
  MD.MANNERS = [
    { hz: '那个', py: 'nà ge', en: 'that one / um…', sev: 0,
      note: 'A very common filler word, like “um” or “you know”. It is also said “nèi ge”. To English ears it can sound like a very bad word. It is not! Chinese speakers say it all day, so do not be shocked and do not laugh.' },
    { hz: '傻瓜', py: 'shǎ guā', en: 'silly / fool', sev: 1, alt: 'stop',
      note: 'Family and friends may say it to tease a small child. Said to a stranger or in anger it is an insult.' },
    { hz: '笨蛋', py: 'bèn dàn', en: 'dummy', sev: 1, alt: 'stop',
      note: 'Calling someone dumb. Friends tease each other with it, but it hurts feelings.' },
    { hz: '讨厌', py: 'tǎo yàn', en: 'annoying / I hate it', sev: 1, alt: 'dislike',
      note: 'Often used lightly (“so annoying!”), but about a person it is unkind.' },
    { hz: '闭嘴', py: 'bì zuǐ', en: 'shut up', sev: 2, alt: 'quiet',
      note: 'Rude in any language. Never say it to a teacher, parent or elder.' },
    { hz: '滚', py: 'gǔn', en: 'get lost / scram', sev: 2, alt: 'away',
      note: 'A harsh way to tell someone to leave.' },
    { hz: '白痴', py: 'bái chī', en: 'idiot', sev: 2, alt: 'stop',
      note: 'A strong insult that also mocks people with disabilities.' },
    { hz: '混蛋', py: 'hún dàn', en: 'jerk / bastard', sev: 2, alt: 'angry',
      note: 'A strong insult for someone who did something bad.' },
    { hz: '去死', py: 'qù sǐ', en: 'go die', sev: 3, alt: 'angry',
      note: 'Wishes harm on someone. Never say it, even as a joke.' },
    { hz: '他妈的', py: 'tā mā de', en: 'damn / f***', sev: 3, alt: 'angry',
      note: 'One of the most common Chinese swear words. It insults someone’s mother, which is a serious matter in Chinese culture. Said as an exclamation, it is like a strong English swear word.' },
    { hz: '操', py: 'cào', en: 'the f-word', sev: 3, alt: 'angry',
      note: 'The strongest everyday swear word. It is a very vulgar word, and you will hear it in films and online. Never say it.' },
    { hz: '傻逼', py: 'shǎ bī', en: 'a vulgar insult', sev: 3, alt: 'angry',
      note: 'A very vulgar insult, said to call someone stupid. Never say it. It can get you into real trouble.' }
  ];

  /* char -> pinyin for the words we teach, used to show what the speech recogniser heard */
  MD.LEX = {};
  function lex(hz, py) {
    var chars = Array.from(hz.replace(/[，。？！、\s]/g, '')), syl = py.split(' ');
    if (chars.length !== syl.length) { return; }
    chars.forEach(function (c, i) { if (!MD.LEX[c]) { MD.LEX[c] = syl[i]; } });
  }
  MD.PHRASES.forEach(function (p) { lex(p.hz, p.py); });
  MD.CONVOS.forEach(function (d) { d.turns.forEach(function (t) { lex(t.say.hz, t.say.py); t.replies.forEach(function (r) { lex(r.hz, r.py); }); }); });
  Object.keys(MD.ALTS).forEach(function (k) { lex(MD.ALTS[k].hz, MD.ALTS[k].py); });
  MD.BUILD.forEach(function (b) { b.words.forEach(function (w) { lex(w.hz, w.py); }); });
})(typeof window !== 'undefined' ? window : globalThis);
