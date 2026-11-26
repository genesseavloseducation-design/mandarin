/* Everyday phrases and grammar for Little Dragon Mandarin.
 * py = pinyin as written (tone marks, syllables separated by spaces; one syllable per character).
 */
(function (root) {
  'use strict';
  var MD = root.MD = root.MD || {};

  MD.PHRASES = [
    { theme: 'Hello & goodbye', hz: '你好', py: 'nǐ hǎo', en: 'Hello', pic: '🙋', note: 'Two third tones in a row? Say the first one as a second tone: it sounds like “ní hǎo”. Everyone does this.' },
    { theme: 'Hello & goodbye', hz: '早上好', py: 'zǎo shang hǎo', en: 'Good morning', pic: '🌅', note: '“shang” is a light, short neutral tone.' },
    { theme: 'Hello & goodbye', hz: '晚安', py: 'wǎn ān', en: 'Good night', pic: '🌙' },
    { theme: 'Hello & goodbye', hz: '再见', py: 'zài jiàn', en: 'Goodbye', pic: '👋', note: 'Literally “see you again”. Two falling tones, both sharp.' },

    { theme: 'Being polite', hz: '谢谢', py: 'xiè xie', en: 'Thank you', pic: '🙏', note: 'The second “xie” is neutral: light and short.' },
    { theme: 'Being polite', hz: '不客气', py: 'bú kè qi', en: 'You are welcome', pic: '😊', note: '不 is normally “bù”, but before a fourth tone it changes to “bú”.' },
    { theme: 'Being polite', hz: '对不起', py: 'duì bu qǐ', en: 'Sorry', pic: '😔' },
    { theme: 'Being polite', hz: '没关系', py: 'méi guān xi', en: 'It is okay', pic: '👌' },
    { theme: 'Being polite', hz: '请', py: 'qǐng', en: 'Please', pic: '🤲' },

    { theme: 'About me', hz: '我叫小龙', py: 'wǒ jiào xiǎo lóng', en: 'My name is Little Dragon', pic: '🏷️', note: 'Put your own name after 我叫 (wǒ jiào).' },
    { theme: 'About me', hz: '你好吗', py: 'nǐ hǎo ma', en: 'How are you?', pic: '💬', note: '吗 (ma) turns a sentence into a yes/no question.' },
    { theme: 'About me', hz: '我很好', py: 'wǒ hěn hǎo', en: 'I am fine', pic: '😀' },
    { theme: 'About me', hz: '我是学生', py: 'wǒ shì xué sheng', en: 'I am a student', pic: '🎒' },
    { theme: 'About me', hz: '我爱你', py: 'wǒ ài nǐ', en: 'I love you', pic: '❤️' },

    { theme: 'Food & needs', hz: '我要水', py: 'wǒ yào shuǐ', en: 'I want water', pic: '💧' },
    { theme: 'Food & needs', hz: '我饿了', py: 'wǒ è le', en: 'I am hungry', pic: '🍽️', note: '了 (le) here means “this has become true”: now I am hungry.' },
    { theme: 'Food & needs', hz: '我渴了', py: 'wǒ kě le', en: 'I am thirsty', pic: '🥤' },
    { theme: 'Food & needs', hz: '好吃', py: 'hǎo chī', en: 'Delicious', pic: '😋', note: 'Literally “good to eat”.' },
    { theme: 'Food & needs', hz: '多少钱', py: 'duō shao qián', en: 'How much is it?', pic: '💰' },

    { theme: 'Getting help', hz: '厕所在哪里', py: 'cè suǒ zài nǎ li', en: 'Where is the toilet?', pic: '🚻' },
    { theme: 'Getting help', hz: '我不知道', py: 'wǒ bù zhī dào', en: 'I do not know', pic: '🤷' },
    { theme: 'Getting help', hz: '听不懂', py: 'tīng bu dǒng', en: 'I cannot understand', pic: '👂', note: 'Literally “listen, cannot get it”.' },
    { theme: 'Getting help', hz: '请再说一遍', py: 'qǐng zài shuō yí biàn', en: 'Please say it again', pic: '🔁', note: '一 is normally “yī”, but before a fourth tone it changes to “yí”.' },
    { theme: 'Getting help', hz: '好', py: 'hǎo', en: 'Okay / good', pic: '👍' }
  ];

  MD.GRAMMAR = [
    { title: 'Verbs never change', pic: '🍎', rule: 'English: I eat, she eats, we ate. Mandarin keeps the verb exactly the same: 吃 (chī). No endings for who is doing it. (他 and 她 both sound “tā”.)',
      rows: [ { hz: '我吃', py: 'wǒ chī', en: 'I eat', hl: '吃' }, { hz: '你吃', py: 'nǐ chī', en: 'You eat', hl: '吃' },
              { hz: '她吃', py: 'tā chī', en: 'She eats', hl: '吃' }, { hz: '我们吃', py: 'wǒ men chī', en: 'We eat', hl: '吃' } ] },
    { title: 'A time word shows when', pic: '📅', rule: 'To say past, present or future, add a time word. The verb 喝 (hē) never changes.',
      rows: [ { hz: '我昨天喝水', py: 'wǒ zuó tiān hē shuǐ', en: 'I drank water yesterday', hl: '昨天' },
              { hz: '我今天喝水', py: 'wǒ jīn tiān hē shuǐ', en: 'I drink water today', hl: '今天' },
              { hz: '我明天喝水', py: 'wǒ míng tiān hē shuǐ', en: 'I will drink water tomorrow', hl: '明天' } ] },
    { title: 'Who, does, what', pic: '🧩', rule: 'Word order is the same as English: subject, then verb, then object.',
      rows: [ { hz: '我吃苹果', py: 'wǒ chī píng guǒ', en: 'I eat apples' }, { hz: '他喝水', py: 'tā hē shuǐ', en: 'He drinks water' },
              { hz: '你爱妈妈', py: 'nǐ ài mā ma', en: 'You love mom' } ] },
    { title: '吗 makes a question', pic: '❓', rule: 'Put 吗 (ma) at the end. Nothing else moves and nothing else changes.',
      rows: [ { hz: '你饿', py: 'nǐ è', en: 'You are hungry' }, { hz: '你饿吗', py: 'nǐ è ma', en: 'Are you hungry?', hl: '吗' },
              { hz: '你好吗', py: 'nǐ hǎo ma', en: 'How are you?', hl: '吗' } ] },
    { title: '不 says no', pic: '🚫', rule: 'Put 不 (bù) right before the verb. (Before a fourth tone it turns into “bú”.)',
      rows: [ { hz: '我吃', py: 'wǒ chī', en: 'I eat' }, { hz: '我不吃', py: 'wǒ bù chī', en: 'I do not eat', hl: '不' },
              { hz: '他不是老师', py: 'tā bú shì lǎo shī', en: 'He is not a teacher', hl: '不' } ] },
    { title: '了 means it happened', pic: '✅', rule: 'Put 了 (le) after the verb when something is done. The verb itself still stays the same.',
      rows: [ { hz: '我吃苹果', py: 'wǒ chī píng guǒ', en: 'I eat apples' }, { hz: '我吃了苹果', py: 'wǒ chī le píng guǒ', en: 'I ate apples', hl: '了' },
              { hz: '我饿了', py: 'wǒ è le', en: 'I have become hungry', hl: '了' } ] },
    { title: '是 means am, is, are', pic: '🟰', rule: 'One small word does the job of “am”, “is” and “are”: 是 (shì).',
      rows: [ { hz: '我是学生', py: 'wǒ shì xué sheng', en: 'I am a student', hl: '是' }, { hz: '他是老师', py: 'tā shì lǎo shī', en: 'He is a teacher', hl: '是' },
              { hz: '我们是朋友', py: 'wǒ men shì péng you', en: 'We are friends', hl: '是' } ] },
    { title: 'No “a”, “the” or plural -s', pic: '🧺', rule: 'The word 苹果 (píng guǒ) can mean an apple, the apple, or apples. Context tells you which.',
      rows: [ { hz: '我吃苹果', py: 'wǒ chī píng guǒ', en: 'I eat an apple / the apple / apples' } ] }
  ];

  // Tap the words in the right order.
  MD.BUILD = [
    { en: 'I eat apples', pic: '🍎', note: 'Who, does, what.', words: [ { hz: '我', py: 'wǒ' }, { hz: '吃', py: 'chī' }, { hz: '苹果', py: 'píng guǒ' } ] },
    { en: 'I drink water', pic: '💧', note: 'Who, does, what.', words: [ { hz: '我', py: 'wǒ' }, { hz: '喝', py: 'hē' }, { hz: '水', py: 'shuǐ' } ] },
    { en: 'How are you?', pic: '💬', note: '吗 goes at the end to make a question.', words: [ { hz: '你', py: 'nǐ' }, { hz: '好', py: 'hǎo' }, { hz: '吗', py: 'ma' } ] },
    { en: 'I do not eat meat', pic: '🥩', note: '不 goes right before the verb.', words: [ { hz: '我', py: 'wǒ' }, { hz: '不', py: 'bù' }, { hz: '吃', py: 'chī' }, { hz: '肉', py: 'ròu' } ] },
    { en: 'He is a teacher', pic: '🧑‍🏫', note: '是 links the two parts, like “is”.', words: [ { hz: '他', py: 'tā' }, { hz: '是', py: 'shì' }, { hz: '老师', py: 'lǎo shī' } ] },
    { en: 'I go to school tomorrow', pic: '🏫', note: 'The time word comes before the verb.', words: [ { hz: '我', py: 'wǒ' }, { hz: '明天', py: 'míng tiān' }, { hz: '去', py: 'qù' }, { hz: '学校', py: 'xué xiào' } ] },
    { en: 'I ate rice', pic: '🍚', note: '了 goes right after the verb.', words: [ { hz: '我', py: 'wǒ' }, { hz: '吃', py: 'chī' }, { hz: '了', py: 'le' }, { hz: '米饭', py: 'mǐ fàn' } ] },
    { en: 'We are friends', pic: '🤝', note: '是 works for am, is and are.', words: [ { hz: '我们', py: 'wǒ men' }, { hz: '是', py: 'shì' }, { hz: '朋友', py: 'péng you' } ] },
    { en: 'Are you going to school?', pic: '🚌', note: '吗 goes at the end.', words: [ { hz: '你', py: 'nǐ' }, { hz: '去', py: 'qù' }, { hz: '学校', py: 'xué xiào' }, { hz: '吗', py: 'ma' } ] }
  ];

  // Which sentence means this? options[0] is always the right one (shuffled when played).
  MD.PICKS = [
    { en: 'I will eat tomorrow', pic: '📅', note: '明天 (míng tiān) means tomorrow. The verb does not change.',
      options: [ { hz: '我明天吃', py: 'wǒ míng tiān chī' }, { hz: '我吃了', py: 'wǒ chī le' }, { hz: '我不吃', py: 'wǒ bù chī' }, { hz: '你吃吗', py: 'nǐ chī ma' } ] },
    { en: 'Are you hungry?', pic: '❓', note: '吗 at the end makes it a question.',
      options: [ { hz: '你饿吗', py: 'nǐ è ma' }, { hz: '你饿', py: 'nǐ è' }, { hz: '我饿了', py: 'wǒ è le' }, { hz: '你不饿', py: 'nǐ bú è' } ] },
    { en: 'I ate', pic: '✅', note: '了 after the verb shows it is finished.',
      options: [ { hz: '我吃了', py: 'wǒ chī le' }, { hz: '我明天吃', py: 'wǒ míng tiān chī' }, { hz: '我不吃', py: 'wǒ bù chī' }, { hz: '你吃吗', py: 'nǐ chī ma' } ] },
    { en: 'He is a teacher', pic: '🧑‍🏫', note: '他 is “he”, 是 is “is”.',
      options: [ { hz: '他是老师', py: 'tā shì lǎo shī' }, { hz: '他不是老师', py: 'tā bú shì lǎo shī' }, { hz: '你是老师', py: 'nǐ shì lǎo shī' }, { hz: '他是学生', py: 'tā shì xué sheng' } ] },
    { en: 'We eat', pic: '🍽️', note: 'Add 们 (men) for “we”. 吃 stays 吃.',
      options: [ { hz: '我们吃', py: 'wǒ men chī' }, { hz: '我吃', py: 'wǒ chī' }, { hz: '你吃', py: 'nǐ chī' }, { hz: '他们吃', py: 'tā men chī' } ] },
    { en: 'Yesterday I drank water', pic: '🥛', note: '昨天 (zuó tiān) means yesterday.',
      options: [ { hz: '我昨天喝水', py: 'wǒ zuó tiān hē shuǐ' }, { hz: '我今天喝水', py: 'wǒ jīn tiān hē shuǐ' }, { hz: '我明天喝水', py: 'wǒ míng tiān hē shuǐ' }, { hz: '我不喝水', py: 'wǒ bù hē shuǐ' } ] }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
