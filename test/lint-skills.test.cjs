// @ts-check
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { lintSkills } = require('../scripts/lint-skills.cjs');

const goodSkill = `---
name: demo
description: Does a demo thing. Use when the Developer says demo.
license: MIT
metadata:
  version: "0.0.1"
---
Read [the note](references/note.md).
`;
/** @param {Record<string,string>} files */
function repo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-lint-'));
  for (const [p, c] of Object.entries({ 'skills/demo/SKILL.md': goodSkill, 'skills/demo/references/note.md': 'note', ...files })) {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), c);
  }
  return root;
}

test('LN-SKILL-00 a valid skill passes', () => {
  assert.deepEqual(lintSkills(repo({})).errors, []);
});
test('LN-SKILL-SIZE rejects long SKILL.md and long descriptions', () => {
  const long = goodSkill + 'line\n'.repeat(160);
  assert.match(lintSkills(repo({ 'skills/demo/SKILL.md': long })).errors.join('\n'), /150 lines/);
  const words = Array(101).fill('word').join(' ');
  const r = lintSkills(repo({ 'skills/demo/SKILL.md': goodSkill.replace('Does a demo thing. Use when the Developer says demo.', words) }));
  assert.match(r.errors.join('\n'), /100 words/);
});
test('LN-SKILL-SPEC name must match the folder and metadata is required', () => {
  assert.match(lintSkills(repo({ 'skills/demo/SKILL.md': goodSkill.replace('name: demo', 'name: other') })).errors.join('\n'), /name/);
  assert.match(lintSkills(repo({ 'skills/demo/SKILL.md': goodSkill.replace('license: MIT\n', '') })).errors.join('\n'), /license/);
  assert.match(lintSkills(repo({ 'skills/demo/SKILL.md': goodSkill.replace(/metadata:\n  version: "0.0.1"\n/, '') })).errors.join('\n'), /metadata.version/);
});
test('LN-SKILL-REF broken or escaping references fail', () => {
  assert.match(lintSkills(repo({ 'skills/demo/SKILL.md': goodSkill + '[x](references/missing.md)\n' })).errors.join('\n'), /missing.md/);
  assert.match(lintSkills(repo({ 'skills/demo/SKILL.md': goodSkill + '[x](../other/x.md)\n', 'skills/other/x.md': 'y' })).errors.join('\n'), /outside/);
});
test('LN-SKILL-HOST host tool names only allowed in host.md', () => {
  assert.match(lintSkills(repo({ 'skills/demo/references/note.md': 'use AskUserQuestion' })).errors.join('\n'), /AskUserQuestion/);
  assert.deepEqual(lintSkills(repo({ 'skills/demo/references/host.md': 'AskUserQuestion is named here' })).errors, []);
});
test('LN-SHIP only Markdown ships inside skills', () => {
  assert.match(lintSkills(repo({ 'skills/demo/scripts/run.sh': 'echo' })).errors.join('\n'), /run.sh/);
});
test('LN-SKILL-STRICT a skill folder without SKILL.md warns, and fails in strict mode', () => {
  const root = repo({ 'skills/planned/references/x.md': 'x' });
  assert.equal(lintSkills(root).errors.length, 0);
  assert.equal(lintSkills(root).warnings.length, 1);
  assert.match(lintSkills(root, { strict: true }).errors.join('\n'), /planned/);
});
