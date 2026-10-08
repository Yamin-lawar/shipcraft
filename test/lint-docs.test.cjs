// @ts-check
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { lintDocs } = require('../scripts/lint-docs.cjs');

/** @param {Record<string,string>} files */
function repo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-docs-'));
  for (const [p, c] of Object.entries({ 'shared/manifest.json': JSON.stringify({ shared: {}, released: [] }), ...files })) {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), c);
  }
  return root;
}
const rel = JSON.stringify({ shared: {}, released: ['craft-demo'] });

test('LN-DOCS-01 no released skills and no broken links passes', () => {
  assert.deepEqual(lintDocs(repo({ 'README.md': '[ok](docs/a.md)', 'docs/a.md': 'x' })).errors, []);
});
test('LN-DOCS-02 broken links and images are reported', () => {
  const r = lintDocs(repo({ 'README.md': '[x](docs/missing.md) ![i](img/none.png)' }));
  assert.match(r.errors.join('\n'), /missing.md/);
  assert.match(r.errors.join('\n'), /none.png/);
});
test('LN-DOCS-03 external links, anchors and code spans are ignored', () => {
  assert.deepEqual(lintDocs(repo({ 'README.md': '[w](https://example.com) [a](#top) `[c](nope.md)`\n```\n[d](nope2.md)\n```' })).errors, []);
});
test('LN-DOCS-04 a released skill needs a docs page and a README mention', () => {
  const r = lintDocs(repo({ 'shared/manifest.json': rel, 'README.md': 'no skill here' }));
  assert.match(r.errors.join('\n'), /docs\/craft-demo.md/);
  assert.match(r.errors.join('\n'), /README/);
  assert.deepEqual(lintDocs(repo({ 'shared/manifest.json': rel, 'README.md': '| `/craft-demo` |', 'docs/craft-demo.md': '# demo' })).errors, []);
});
