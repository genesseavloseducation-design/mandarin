# 🐉 Little Dragon Mandarin · 小龙学中文

A free game that teaches beginners Mandarin the way a child learns it: sounds first, then tones, then everyday phrases, then speaking, conversation and handwriting. It is one web page, with no accounts, no tracking and nothing to install.

**Play:** open `index.html`, or the GitHub Pages link for this repo.

## Levels

| # | Level | What you do |
|---|---|---|
| 1 | Sounds 拼音 | Pinyin letters with a four-line handwriting guide, mouth hints, a picture word and sound |
| 2 | Tones 声调 | The four tones as pitch lines, plus the tone changes in real speech (你好 → ní hǎo) |
| 3 | Phrases 常用语 | 65 phrases: greetings, polite words, about me, **numbers, family, colours, food**, getting help. Pinyin is coloured by tone |
| 4 | Say it 说 | Say a phrase out loud and get a score, character by character, with a tone tip. Or record yourself and compare with the model voice |
| 5 | Talk 对话 | Five short conversations. Listen, choose the right reply (wrong ones are explained), then say it out loud |
| 6 | Grammar 语法 | Why Mandarin is easier than it looks: verbs never change. Tap word tiles into the right order |
| 7 | Stroke basics 笔画 | The basic strokes and a first set of characters |
| 8 | Handwriting 写字 | Write every character in the phrases on a tablet or phone: watch, trace, memory or free writing. Each stroke is checked for direction, order and position |
| ☀️ | Today's 5 minutes | Five mixed questions a day with a streak counter |
| 🚫 | Words to avoid 小心 | Rude words and swear words, how rude each one is, and what to say instead. It also explains that 那个 (nà ge) is only a filler word |

## Sound and speaking

- **Hearing:** the game uses your device's own Mandarin voice. If none is installed, or it stays silent, it falls back to an online voice. Tap **Test sound** on the home page to see which one is used and how to install a voice.
- **Speaking score:** uses the browser's speech recognition (Chrome, Edge, Safari). The browser sends your voice to its vendor's service to turn it into text, so it needs internet and microphone permission. Nothing is stored by this game.
- **Record & compare** works in any browser that can record. You hear yourself, then the model voice.

## Change or add content

Sources are in `src/`. After any change, run `python3 build.py` to rebuild the single `index.html`, then `node tests/check.js`.

- Phrases: `src/js/phrases.js` and `src/js/phrases2.js`
- Conversations and words to avoid: `src/js/phrases2.js`
- Handwriting data for the characters in the phrases: `node tools/build_hanzi.js <path to hanzi-writer-data/data>` regenerates `src/js/hanzi-data.js`

## Credits and licences

- Game code: MIT (`LICENSE`).
- Stroke outlines and order: [Make Me a Hanzi](https://github.com/skishore/makemeahanzi) via [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data), under the Arphic Public License (`licenses/ARPHICPL.TXT`).

Pinyin hints compare Mandarin sounds with English ones, which is approximate. A native speaker or teacher is the best guide for tones.
