// @ts-check
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { lintLanguage, avoidTerms } = require('../scripts/lint-language.cjs');

const glossary = `# G
**Developer**:
The person.
_Avoid_: user

**End user**:
Someone.
_Avoid_: user, customer

**Brief**:
A record.
_Avoid_: notes

**Spec**:
The PRD.
_Avoid_: spec.md

**Fixture**:
Sample app.
_Avoid_: demo app, brief (unrelated)
`;
/** @param {Record<string,string>} files */
function repo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-lang-'));
  for (const [p, c] of Object.entries({ 'GLOSSARY.md': glossary, ...files })) {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), c);
  }
  return root;
}

test('LN-LANG-01 avoid terms are read from the glossary, minus defined terms and parentheticals', () => {
  const t = avoidTerms(glossary);
  assert.ok(t.includes('user') && t.includes('customer') && t.includes('spec.md') && t.includes('demo app'));
  assert.ok(!t.includes('brief'), 'a defined term is never an avoid term');
});
test('LN-LANG-02 flags a bare avoided term but not the preferred phrase', () => {
  const r = lintLanguage(repo({ 'skills/a/SKILL.md': 'Ask the user a question.\nThe End user waits.' }));
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /"user"/);
});
test('LN-LANG-03 code blocks, inline code and HTML comments are skipped', () => {
  const r = lintLanguage(repo({ 'skills/a/SKILL.md': '```\nuser\n```\n`user`\n<!-- user\nuser -->\nclean' }));
  assert.deepEqual(r.errors, []);
});
test('LN-LANG-04 the allow file can exempt a term for a file', () => {
  const files = { 'skills/a/SKILL.md': 'the user', 'scripts/lint-language.allow': 'skills/a/SKILL.md :: user\n' };
  assert.deepEqual(lintLanguage(repo(files)).errors, []);
  const files2 = { 'skills/a/SKILL.md': 'the user', 'scripts/lint-language.allow': 'ignore-term: user\n' };
  assert.deepEqual(lintLanguage(repo(files2)).errors, []);
});
