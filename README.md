# Japanese Reading Helper

A Chrome extension for learners reading Japanese on the web (e.g. [NHK News Web Easy](https://news.web.nhk/news/easy/)).

- **Phrase breaks:** sentences are split into phrases (文節) the way a native reads them: 私は　学校に　行きました。
- **Particles highlighted:** は が を に で… are colored with a dotted underline. Hover one for a short meaning based on context (に as *time* vs *location*, が as *subject* vs *but*).
- **Clause dividers:** a thin line after から, ので, けど, て where a new clause starts.
- **Furigana on hover:** kanji readings stay hidden until you hover, so you still practise reading kanji. Works with the site's own furigana (NHK) and adds it where there is none.
- **Meanings:** hold the mouse on a word to see the first [jisho.org](https://jisho.org) result. Click a word to open jisho.
- Adapts to light and dark pages. Particle color can be changed.

## Install

**From the zip (classmates):**
1. Download `japanese-reading-helper.zip` and unzip it.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the unzipped folder.
4. Pin the extension (puzzle icon → pin) so the は icon is in the toolbar.

Don't delete the folder afterwards; Chrome loads the extension from it.

**Updating:** replace the folder with the new version, then click ↻ on the extension in `chrome://extensions`.

## Use

- **A sentence or paragraph:** select the text → right-click → **Break down Japanese**.
- **An article:** click the toolbar icon → **Pick area** → click the article. Esc cancels.
- **Everything:** toolbar icon → **Whole page**.
- **Undo:** toolbar icon → **Turn off**, or reload the page.

The first use in a tab takes about a second while the dictionary loads.

## Privacy

Text is analysed locally in your browser. The only network request is to `jisho.org` with the single word you hold the mouse on. Nothing else is sent anywhere, and nothing is collected.

The extension only runs when you use it, on the tab you use it on. It cannot read other pages.

## Limitations

- Readings come from a dictionary and are sometimes wrong for names, numbers + counters and words with several readings (一日). Furigana written by the site (like NHK's) is always used when present.
- Doesn't work on `chrome://` pages, the Chrome Web Store, PDFs or text inside images.
- Chrome desktop only (no Android; Firefox not tested).

## Development

```sh
npm install
npm run vendor   # copies kuromoji + dictionary into lib/ and dict/
npm test
npm run pack     # builds japanese-reading-helper.zip
```

## Credits and licenses

- Word analysis: [kuromoji.js](https://github.com/takuyaa/kuromoji.js), Apache 2.0 (`lib/LICENSE-kuromoji.txt`), with the IPADIC dictionary (`lib/NOTICE-kuromoji.md`).
- Meanings: [jisho.org](https://jisho.org), using [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html) by the Electronic Dictionary Research and Development Group, CC BY-SA 4.0.
