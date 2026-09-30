chrome.runtime.onInstalled.addListener(() =>
  chrome.contextMenus.create({ id: 'jrh', title: 'Break down Japanese', contexts: ['selection'] }));

chrome.contextMenus.onClicked.addListener((_, tab) => tab?.id && run(tab.id, 'selection'));
chrome.runtime.onMessage.addListener(m => { if (m.tabId) run(m.tabId, m.mode).catch(console.warn); }); // fails on chrome:// pages

async function run(tabId, mode) {
  const target = { tabId };
  // content.js guards against double init, so re-injecting is harmless.
  await chrome.scripting.insertCSS({ target, files: ['content.css'] });
  await chrome.scripting.executeScript({ target, files: ['lib/kuromoji.js', 'content.js'] });
  await chrome.scripting.executeScript({ target, func: m => window.__jrh.run(m), args: [mode] });
}
