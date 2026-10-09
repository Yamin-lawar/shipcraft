// @ts-check
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runChecks } = require('../evals/checks.cjs');
const { loadBudget, addSpend, assertWithinBudget, readLedger } = require('../evals/lib/budget.cjs');

const say = (/** @type {string} */ text) => ({ t: 'assistant_text', text });
const ask = (/** @type {number} */ n) => ({ t: 'question_prompt', questions: Array.from({ length: n }, (_, i) => ({ question: 'Q' + i })), answers: {} });
const run = (/** @type {any} */ ctx, /** @type {string} */ id, /** @type {any} */ p) => runChecks(ctx, [id], p ? { [id]: p } : {})[0];

test('UT-CHECKS-01 TC-ONEQ flags batched prompts and multi-question turns', () => {
  assert.equal(run({ events: [ask(1), say('one question?')] }, 'TC-ONEQ').ok, true);
  assert.equal(run({ events: [ask(2)] }, 'TC-ONEQ').ok, false);
  assert.equal(run({ events: [say('What? And why? And when?')] }, 'TC-ONEQ').ok, false);
});
test('UT-CHECKS-02 TC-GIT flags Shipcraft files in git status', () => {
  assert.equal(run({ events: [], gitStatus: ' M src/app.js\n?? src/new.js\n' }, 'TC-GIT').ok, true);
  assert.equal(run({ events: [], gitStatus: '?? .craft/\n' }, 'TC-GIT').ok, false);
  assert.equal(run({ events: [], gitStatus: '?? skills-lock.json\n' }, 'TC-GIT').ok, false);
});
test('UT-CHECKS-03 TC-HIST needs a history copy once a file is rewritten', () => {
  const p = '.craft/features/x/prd.md';
  const w = { t: 'write', path: p };
  assert.equal(run({ events: [w], craftFiles: {} }, 'TC-HIST').ok, true);
  assert.equal(run({ events: [w, w], craftFiles: {} }, 'TC-HIST').ok, false);
  assert.equal(run({ events: [w, w], craftFiles: { '.craft/features/x/.history/prd.20261008-1.md': 'a' } }, 'TC-HIST').ok, true);
});
test('UT-CHECKS-04 TC-SECRET finds secret-looking strings', () => {
  assert.equal(run({ events: [], craftFiles: { 'a.md': 'nothing here' } }, 'TC-SECRET').ok, true);
  assert.equal(run({ events: [], craftFiles: { 'a.md': 'API_KEY=abcdef0123456789abcdef' } }, 'TC-SECRET').ok, false);
  assert.equal(run({ events: [], craftFiles: { 'a.md': '-----BEGIN RSA PRIVATE KEY-----' } }, 'TC-SECRET').ok, false);
});
test('UT-CHECKS-05 TC-CEIL counts prompts and plain questions', () => {
  assert.equal(run({ events: [ask(1), ask(1)] }, 'TC-CEIL', { ceiling: 2 }).ok, true);
  assert.equal(run({ events: [ask(1), ask(1), say('Anything else?')] }, 'TC-CEIL', { ceiling: 2 }).ok, false);
});
test('UT-CHECKS-06 TC-NOWRITE needs the summary shown and answered before plan.md', () => {
  const w = { t: 'write', path: '.craft/features/x/plan.md' };
  assert.equal(run({ events: [say('Here is the design summary.'), { t: 'developer', text: 'yes' }, w] }, 'TC-NOWRITE').ok, true);
  assert.equal(run({ events: [w, say('design summary'), { t: 'developer', text: 'yes' }] }, 'TC-NOWRITE').ok, false);
  assert.equal(run({ events: [say('design summary'), w] }, 'TC-NOWRITE').ok, false);
});
test('UT-CHECKS-07 TC-STEP0 needs Step 0 before the first gate', () => {
  const good = { events: [], craftFiles: { '.craft/features/x/plan.md': '## Step 0: save\n...\n### Gate 1' } };
  const late = { events: [], craftFiles: { '.craft/features/x/plan.md': '### Gate 1\n...\nStep 0' } };
  assert.equal(run(good, 'TC-STEP0').ok, true);
  assert.equal(run(late, 'TC-STEP0').ok, false);
  assert.equal(run({ events: [], craftFiles: {} }, 'TC-STEP0').ok, false);
});
test('UT-CHECKS-08 TC-NOPROMPT forbids question prompts', () => {
  assert.equal(run({ events: [say('chat')] }, 'TC-NOPROMPT').ok, true);
  assert.equal(run({ events: [ask(1)] }, 'TC-NOPROMPT').ok, false);
});
test('UT-CHECKS-10 TC-PROGRESS needs an early draft save', () => {
  const w = { t: 'write', path: '.craft/features/x/prd.md' };
  assert.equal(run({ events: [ask(1), ask(1), w, ask(1), ask(1)] }, 'TC-PROGRESS').ok, true);
  assert.equal(run({ events: [ask(1), ask(1), ask(1), ask(1), w] }, 'TC-PROGRESS').ok, false);
  assert.equal(run({ events: [ask(1), ask(1)] }, 'TC-PROGRESS').ok, true);
});
test('UT-CHECKS-09 TC-UX needs the opening and closing lines', () => {
  const ok = { events: [say('▶ recurring-tasks · PRD · I will ask short questions'), say('hi'), say('✔ Saved prd.md · Next: /craft-plan · Say "continue"')] };
  assert.equal(run(ok, 'TC-UX').ok, true);
  assert.equal(run({ events: [say('hello'), say('bye')] }, 'TC-UX').ok, false);
});
test('UT-BUDGET-01 the ledger accumulates and stops a spent gate', () => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'craft-ledger-')), 'ledger.json');
  const b = { ...loadBudget(), perGateUsd: 1 };
  assertWithinBudget('G5', b, f);
  addSpend('G5', 0.6, f); addSpend('G5', 0.5, f);
  assert.equal(readLedger(f).G5, 1.1);
  assert.throws(() => assertWithinBudget('G5', b, f), /spent/);
});

const { parseJudge, combine, median } = require('../evals/judge.cjs');
test('UT-JUDGE-01 parseJudge validates scores and requires evidence', () => {
  const ok = parseJudge('noise {"criteria":{"a":{"score":4,"evidence":"quote"}}} trailing');
  assert.equal(ok.a.score, 4);
  assert.throws(() => parseJudge('{"criteria":{"a":{"score":9,"evidence":"x"}}}'), /1-5/);
  assert.throws(() => parseJudge('{"criteria":{"a":{"score":3,"evidence":""}}}'), /evidence/);
  assert.throws(() => parseJudge('no json'), /JSON/);
});
test('UT-JUDGE-02 combine takes the median per criterion and reports average and minimum', () => {
  const r = combine([{ a: { score: 5, evidence: 'x' } }, { a: { score: 2, evidence: 'y' } }, { a: { score: 4, evidence: 'z' } }]);
  assert.equal(r.criteria.a.score, 4);
  assert.equal(median([1, 3]), 2);
  assert.equal(r.min, 4);
});

test('EV-HARNESS-01 a known-bad conversation fails every check it should', () => {
  const bad = {
    events: [
      { t: 'assistant_text', text: 'Hello there. What do you want? And when?' },
      { t: 'question_prompt', questions: [{ question: 'a' }, { question: 'b' }], answers: {} },
      { t: 'write', path: '.craft/features/x/plan.md' },
      { t: 'write', path: '.craft/features/x/plan.md' },
      { t: 'assistant_text', text: 'Done.' },
    ],
    gitStatus: '?? .craft/\n?? CLAUDE.local.md\n',
    craftFiles: { '.craft/features/x/plan.md': 'API_KEY=abcdef0123456789abcdef\n### Gate 1' },
  };
  const failed = runChecks(bad, ['TC-ONEQ', 'TC-GIT', 'TC-HIST', 'TC-SECRET', 'TC-NOWRITE', 'TC-STEP0', 'TC-NOPROMPT', 'TC-UX']).filter((r) => !r.ok).map((r) => r.id);
  assert.deepEqual(failed.sort(), ['TC-GIT', 'TC-HIST', 'TC-NOPROMPT', 'TC-NOWRITE', 'TC-ONEQ', 'TC-SECRET', 'TC-STEP0', 'TC-UX']);
});
