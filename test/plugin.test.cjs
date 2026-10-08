// @ts-check
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { lintPlugin } = require('../scripts/lint-plugin.cjs');
const { syncVersions } = require('../scripts/sync-plugin-version.cjs');

const skill = (/** @type {string} */ v) => `---\nname: demo\ndescription: A demo. Use when demo.\nlicense: MIT\nmetadata:\n  version: "${v}"\n---\nBody\n`;
/** @param {Record<string,string>} over */
function repo(over = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-plug-'));
  const files = {
    '.claude-plugin/plugin.json': JSON.stringify({ name: 'shipcraft', version: '1.2.3', skills: ['./skills/demo'] }),
    '.claude-plugin/marketplace.json': JSON.stringify({ name: 'shipcraft', plugins: [{ name: 'shipcraft', source: './' }] }),
    'skills/demo/SKILL.md': skill('1.2.3'),
    ...over,
  };
  for (const [p, c] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), c);
  }
  return root;
}

test('LN-PLUGIN-01 a consistent plugin passes', () => assert.deepEqual(lintPlugin(repo()).errors, []));
test('LN-PLUGIN-02 every skill must be listed, and listed skills must exist', () => {
  assert.match(lintPlugin(repo({ '.claude-plugin/plugin.json': JSON.stringify({ name: 'shipcraft', version: '1.2.3', skills: [] }) })).errors.join('\n'), /demo/);
  assert.match(lintPlugin(repo({ '.claude-plugin/plugin.json': JSON.stringify({ name: 'shipcraft', version: '1.2.3', skills: ['./skills/demo', './skills/ghost'] }) })).errors.join('\n'), /ghost/);
});
test('LN-PLUGIN-03 versions must match and the marketplace must name the plugin', () => {
  assert.match(lintPlugin(repo({ 'skills/demo/SKILL.md': skill('9.9.9') })).errors.join('\n'), /9.9.9/);
  assert.match(lintPlugin(repo({ '.claude-plugin/marketplace.json': JSON.stringify({ name: 'm', plugins: [{ name: 'wrong', source: './' }] }) })).errors.join('\n'), /marketplace/);
});
test('UT-VER-01 sync rewrites skill versions to the plugin version, --check reports drift', () => {
  const root = repo({ 'skills/demo/SKILL.md': skill('0.0.1') });
  assert.equal(syncVersions(root, { check: true }).ok, false);
  assert.equal(syncVersions(root).ok, true);
  assert.match(fs.readFileSync(path.join(root, 'skills/demo/SKILL.md'), 'utf8'), /version: "1.2.3"/);
  assert.equal(syncVersions(root, { check: true }).ok, true);
});
