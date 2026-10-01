# Chrome Web Store listing (copy-paste)

## Store listing
**Category:** Education · **Language:** English

**Summary (≤132 chars):**
Read Japanese more easily: phrase breaks, highlighted particles, furigana and word meanings on hover.

**Description:**
Made for Japanese learners who can read kana and some kanji but get lost in long sentences, e.g. on NHK News Web Easy.

• Phrase breaks: sentences are split into phrases the way a native reads them.
• Particles highlighted: は が を に で… are colored. Hover one for a short meaning (に as time vs. location, が as subject vs. but).
• Clause dividers after から, ので, けど and て.
• Furigana on hover: readings stay hidden until you need them, so you keep practising kanji. Uses the site's own furigana when present.
• Meanings: hold the mouse on a word to see the first jisho.org result; click to open jisho.
• Works on light and dark pages; particle color is adjustable.

How to use: select text → right-click → "Break down Japanese", or click the toolbar icon → "Pick area" / "Whole page".

Runs only when you use it, only on that tab. Text is analysed locally; only the single word you hover is looked up on jisho.org.

**Graphics:** icon `icons/128.png`, screenshot `store/screenshot-1280x800.png`, small promo tile `store/promo-440x280.png`.

## Privacy practices tab
**Single purpose:** Helps Japanese learners read web pages by marking phrase boundaries, highlighting particles and showing readings and meanings on hover.

**Permission justifications:**
- activeTab: process the page only after the user clicks the extension or its context menu item.
- scripting: inject the text-analysis script into that tab on demand.
- contextMenus: the "Break down Japanese" right-click item for selected text.
- storage: remember the user's chosen particle color.
- Host permission (https://jisho.org/api/*): look up the meaning of the word the user hovers.
- Remote code: No. All code is in the package.

**Data usage:** tick nothing in the data-type list. Certify all three statements (no selling, no unrelated use, no creditworthiness).
The hovered word is sent to jisho.org to fetch its meaning. It is not linked to the user and not stored by the extension.

**Privacy policy URL:** https://github.com/olafkrawczyk/japanese-reading-helper#privacy

> Japanese Reading Helper does not collect, store or share personal data. Page text is analysed locally in your browser. When you hold the mouse on a word, that word alone is sent to jisho.org to retrieve its dictionary entry. Your color setting is saved in Chrome sync storage. Nothing else leaves your browser.

## Distribution
Visibility: **Unlisted** to share by link with classmates only, or **Public**.
