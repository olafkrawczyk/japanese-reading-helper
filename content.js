(() => {
const KANJI = /[\u3400-\u9fff々〆ヵヶ]/;
const toHira = s => s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 文節 rule: content words start a chunk; particles, auxiliaries, suffixes, punctuation attach.
function startsChunk(t, prev) {
  if (!prev) return true;
  if (prev.pos === '接頭詞' || prev.pos_detail_1 === '括弧開') return false;
  if (t.pos_detail_1 === '括弧開') return true;
  if (['助詞', '助動詞', '記号'].includes(t.pos)) return false;
  if (t.pos_detail_1 === '非自立' || t.pos_detail_1 === '接尾') return false;
  if (t.pos === '名詞' && prev.pos === '名詞') return false; // compound nouns: 東京都知事
  if (t.basic_form === 'する' && prev.pos_detail_1 === 'サ変接続') return false; // 勉強する
  return true;
}

// Align reading onto kanji runs only: 食べる/たべる → [['食','た'],['べる',null]]
function furigana(surface, reading) {
  if (!KANJI.test(surface) || !reading || reading === '*') return [[surface, null]];
  const parts = surface.match(/[\u3400-\u9fff々〆ヵヶ]+|[^\u3400-\u9fff々〆ヵヶ]+/g);
  const re = new RegExp('^' + parts.map(p => KANJI.test(p) ? '(.+?)' : `(${esc(toHira(p))})`).join('') + '$');
  const m = toHira(reading).match(re);
  if (!m) return [[surface, toHira(reading)]];
  return parts.map((p, i) => [p, KANJI.test(p) ? m[i + 1] : null]);
}

if (typeof module === 'object') { module.exports = { startsChunk, furigana, toHira }; return; }
if (window.__jrh) return;

let tokenizerP, io;
const tokenizer = () => tokenizerP ||= new Promise((res, rej) =>
  kuromoji.builder({ dicPath: chrome.runtime.getURL('dict/') }).build((e, t) => e ? rej(e) : res(t)));

const SKIP = 'script,style,noscript,textarea,input,select,button,[role=button],rt,rp,code,pre,svg,[contenteditable],jrh-s';
const blockOf = el => {
  while (el.parentElement && ['inline', 'ruby', 'ruby-base', 'contents'].includes(getComputedStyle(el).display)) el = el.parentElement;
  return el;
};
function isDark(el) {
  for (; el; el = el.parentElement) {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (m && (m[3] === undefined || +m[3] > 0.5)) return 0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2] < 128;
  }
  return false;
}

// Group Japanese text nodes by their block element so sentences split across <a>/<span>/<ruby> stay whole.
function collect(root, filter) {
  const groups = new Map();
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    if (!n.data.trim() || n.parentElement.closest(SKIP) || (filter && !filter(n))) continue;
    const b = blockOf(n.parentElement);
    groups.get(b)?.push(n) ?? groups.set(b, [n]);
  }
  for (const [b, nodes] of groups) if (!/[\u3040-\u30ff\u3400-\u9fff]/.test(nodes.map(n => n.data).join(''))) groups.delete(b);
  return groups;
}

function processGroup(block, nodes, tk) {
  nodes = nodes.filter(n => n.isConnected);
  const tokens = tk.tokenize(nodes.map(n => n.data).join(''));
  let pos = 0;
  tokens.forEach((t, i) => { t.start = pos; t.end = pos += t.surface_form.length; t.gap = i > 0 && startsChunk(t, tokens[i - 1]); });
  const dark = isDark(block);
  let ti = 0, ns = 0;
  for (const node of nodes) {
    const ne = ns + node.data.length, inRuby = !!node.parentElement.closest('ruby');
    const wrap = document.createElement('jrh-s');
    if (dark) wrap.dataset.dark = '';
    wrap._jrhOrig = node;
    while (ti < tokens.length && tokens[ti].start < ne) {
      const t = tokens[ti], s = Math.max(t.start, ns), e = Math.min(t.end, ne);
      const w = document.createElement('jrh-w');
      w.className = (t.gap && s === t.start ? 'jrh-gap ' : '') + (t.pos === '助詞' ? 'jrh-p' : '');
      w.dataset.b = t.basic_form !== '*' ? t.basic_form : t.surface_form;
      // ponytail: tokens crossing element boundaries get no generated furigana; rare, would need cross-node ruby.
      if (!inRuby && s === t.start && e === t.end) {
        for (const [txt, rt] of furigana(t.surface_form, t.reading)) {
          if (!rt) { w.append(txt); continue; }
          const r = document.createElement('ruby'), rtEl = document.createElement('rt');
          rtEl.textContent = rt;
          r.append(txt, rtEl);
          w.append(r);
        }
      } else w.textContent = node.data.slice(s - ns, e - ns);
      wrap.append(w);
      if (t.end > ne) break; // token continues in next node
      ti++;
    }
    node.replaceWith(wrap);
    ns = ne;
  }
}

async function start(root, filter) {
  document.documentElement.classList.add('jrh-on');
  const { color } = await chrome.storage.sync.get('color');
  color ? document.documentElement.style.setProperty('--jrh-user', color) : document.documentElement.style.removeProperty('--jrh-user');
  const groups = collect(root, filter);
  io ||= new IntersectionObserver(async entries => {
    const visible = entries.filter(e => e.isIntersecting).map(e => e.target);
    if (!visible.length) return;
    visible.forEach(b => io.unobserve(b));
    document.documentElement.style.cursor = 'progress';
    try {
      const tk = await tokenizer();
      for (const b of visible) processGroup(b, io.groups.get(b) || [], tk), io.groups.delete(b);
    } finally { document.documentElement.style.cursor = ''; }
  }, { rootMargin: '300px' });
  io.groups = new Map([...(io.groups || []), ...groups]);
  groups.forEach((_, b) => io.observe(b));
}

function stop() {
  io?.disconnect(); io = null;
  document.querySelectorAll('jrh-s').forEach(s => s.replaceWith(s._jrhOrig));
  document.documentElement.classList.remove('jrh-on');
}

const pick = () => new Promise(res => {
  let cur;
  const over = e => { cur?.classList.remove('jrh-pick'); (cur = e.target).classList.add('jrh-pick'); };
  const done = e => {
    if (e.type === 'keydown' && e.key !== 'Escape') return;
    e.preventDefault(); e.stopPropagation();
    cur?.classList.remove('jrh-pick');
    removeEventListener('mouseover', over, true); removeEventListener('click', done, true); removeEventListener('keydown', done, true);
    res(e.type === 'click' ? e.target : null);
  };
  addEventListener('mouseover', over, true); addEventListener('click', done, true); addEventListener('keydown', done, true);
});

async function run(mode) {
  if (mode === 'off') return stop();
  if (mode === 'page') return start(document.body);
  if (mode === 'pick') { const el = await pick(); return el && start(el); }
  const sel = getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0), c = range.commonAncestorContainer;
  // ponytail: partially selected text nodes are processed whole; splitting them isn't worth it.
  start(c.nodeType === 3 ? c.parentElement : c, n => range.intersectsNode(n));
}

document.addEventListener('click', e => {
  const w = e.target.closest?.('jrh-w');
  if (!w || e.target.closest('a') || !getSelection().isCollapsed) return;
  open('https://jisho.org/search/' + encodeURIComponent(w.dataset.b), '_blank', 'noopener');
});

window.__jrh = { run };
})();
