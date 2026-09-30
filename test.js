const assert = require('assert');
const { startsChunk, furigana, particleGloss } = require('./content.js');

assert.deepStrictEqual(furigana('食べる', 'タベル'), [['食', 'た'], ['べる', null]]);
assert.deepStrictEqual(furigana('お茶', 'オチャ'), [['お', null], ['茶', 'ちゃ']]);
assert.deepStrictEqual(furigana('は', 'ハ'), [['は', null]]);
assert.notStrictEqual(particleGloss({ surface_form: 'が', pos_detail_1: '接続助詞' }), particleGloss({ surface_form: 'が', pos_detail_1: '格助詞' }));
assert.strictEqual(particleGloss({ surface_form: 'で', pos_detail_1: '接続助詞' }), 'and then (te-form)');
assert.strictEqual(particleGloss({ surface_form: 'ぞ', pos_detail_1: '終助詞' }), null);

require('kuromoji').builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err, tk) => {
  if (err) throw err;
  const chunks = s => {
    const out = [];
    tk.tokenize(s).forEach((t, i, a) => startsChunk(t, a[i - 1]) ? out.push(t.surface_form) : out[out.length - 1] += t.surface_form);
    return out.join('/');
  };
  assert.strictEqual(chunks('私は学校に行きました。'), '私は/学校に/行きました。');
  assert.strictEqual(chunks('東京都知事が勉強しています'), '東京都知事が/勉強しています');
  assert.strictEqual(chunks('「日本」でご飯を食べた'), '「日本」で/ご飯を/食べた');
  const a = tk.tokenize('雨が降ったので、家にいた'), i = a.findIndex(t => t.surface_form === 'ので');
  assert.strictEqual(a[i].pos_detail_1, '接続助詞');
  assert.strictEqual(startsChunk(a[i + 1], a[i]), false); // 、 attaches, so no jrh-clause here
  console.log('ok');
});
