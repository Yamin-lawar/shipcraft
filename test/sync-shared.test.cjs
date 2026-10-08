// @ts-check
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { syncShared } = require('../scripts/sync-shared.cjs');

/** @param {Record<string,string>} files */
function repo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-sync-'));
  for (const [p, c] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), c);
  }
  return root;
}
const base = {
  'shared/manifest.json': JSON.stringify({ shared: { 'host.md': '*' } }),
  'shared/host.md': 'HOST v1',
  'skills/a/SKILL.md': 'x',
  'skills/b/SKILL.md': 'x',
};

test('UT-SYNC-01 writes the shared file into every skill', () => {
  const root = repo(base);
  const r = syncShared(root);
  assert.equal(r.ok, true);
  assert.equal(fs.readFileSync(path.join(root, 'skills/a/references/host.md'), 'utf8'), 'HOST v1');
  assert.equal(fs.readFileSync(path.join(root, 'skills/b/references/host.md'), 'utf8'), 'HOST v1');
});

test('UT-SYNC-02 --check detects drift and missing copies', () => {
  const root = repo(base);
  assert.equal(syncShared(root, { check: true }).ok, false);
  syncShared(root);
  assert.equal(syncShared(root, { check: true }).ok, true);
  fs.writeFileSync(path.join(root, 'skills/a/references/host.md'), 'tampered');
  const r = syncShared(root, { check: true });
  assert.equal(r.ok, false);
  assert.match(r.drift[0], /skills\/a\/references\/host.md/);
});

test('UT-SYNC-03 honours explicit targets and flags unknown skills', () => {
  const root = repo({ ...base, 'shared/manifest.json': JSON.stringify({ shared: { 'host.md': ['a', 'ghost'] } }) });
  const r = syncShared(root);
  assert.equal(r.ok, false);
  assert.ok(fs.existsSync(path.join(root, 'skills/a/references/host.md')));
  assert.ok(!fs.existsSync(path.join(root, 'skills/b/references/host.md')));
  assert.match(r.drift.join('\n'), /ghost/);
});
