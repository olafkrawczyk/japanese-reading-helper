chrome.runtime.onInstalled.addListener(() =>
  chrome.contextMenus.create({ id: 'jrh', title: 'Break down Japanese', contexts: ['selection'] }));

chrome.contextMenus.onClicked.addListener((_, tab) => tab?.id && run(tab.id, 'selection'));
chrome.runtime.onMessage.addListener((m, _, reply) => {
  if (m.tabId) run(m.tabId, m.mode).catch(console.warn); // fails on chrome:// pages
  if (m.lookup) { lookup(m.lookup).then(reply, () => reply(null)); return true; }
});

// ponytail: cache lives only while the service worker is alive; fine for repeated hovers in one session.
const cache = new Map();
function lookup(word) {
  if (!cache.has(word)) cache.set(word, fetch('https://jisho.org/api/v1/search/words?keyword=' + encodeURIComponent(word))
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(({ data: [d] }) => d && {
      word: d.japanese[0].word || d.japanese[0].reading,
      reading: d.japanese[0].reading,
      senses: d.senses.slice(0, 3).map(s => s.english_definitions.join('; ')),
    })
    .catch(e => { cache.delete(word); throw e; }));
  return cache.get(word);
}

async function run(tabId, mode) {
  const target = { tabId };
  // content.js guards against double init, so re-injecting is harmless.
  await chrome.scripting.insertCSS({ target, files: ['content.css'] });
  await chrome.scripting.executeScript({ target, files: ['lib/kuromoji.js', 'content.js'] });
  await chrome.scripting.executeScript({ target, func: m => window.__jrh.run(m), args: [mode] });
}
