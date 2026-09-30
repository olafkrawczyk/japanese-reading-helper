const color = document.getElementById('color'), auto = document.getElementById('auto');

for (const b of document.querySelectorAll('button')) b.onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ tabId: tab.id, mode: b.dataset.mode });
  window.close();
};

chrome.storage.sync.get('color').then(({ color: c }) => { auto.checked = !c; color.value = c || '#c2410c'; });
color.oninput = () => { auto.checked = false; chrome.storage.sync.set({ color: color.value }); };
auto.onchange = () => auto.checked ? chrome.storage.sync.remove('color') : chrome.storage.sync.set({ color: color.value });
