// @ts-check
const test = require('node:test');
const assert = require('node:assert');
const { makeChannel, bashAllowed, insideWorkdir, parseChoice, promptFor } = require('../evals/lib/sim.cjs');

test('UT-SIM-01 the channel delivers pushed messages in order and ends when closed', async () => {
  const ch = makeChannel();
  const it = ch[Symbol.asyncIterator]();
  ch.push('a');
  assert.deepEqual(await it.next(), { value: 'a', done: false });
  const pending = it.next();
  ch.push('b');
  assert.deepEqual(await pending, { value: 'b', done: false });
  ch.close();
  assert.equal((await it.next()).done, true);
});
test('UT-SIM-02 dangerous shell commands are denied, ordinary ones allowed', () => {
  for (const bad of ['rm -rf x', 'sudo ls', 'curl http://x', 'cat ../secret', 'git push origin main', 'echo hi > /etc/x']) assert.equal(bashAllowed(bad), false, bad);
  for (const ok of ['git status --porcelain', 'ls -la', 'node --test', 'cat src/app.js', 'mkdir -p .craft']) assert.equal(bashAllowed(ok), true, ok);
});
test('UT-SIM-03 paths outside the work directory are rejected', () => {
  assert.equal(insideWorkdir('src/a.js', '/w'), true);
  assert.equal(insideWorkdir('/w/.craft/x.md', '/w'), true);
  assert.equal(insideWorkdir('../x', '/w'), false);
  assert.equal(insideWorkdir('/etc/passwd', '/w'), false);
});
test('UT-SIM-04 parseChoice maps JSON, free text and garbage to an answer', () => {
  const q = { options: [{ label: 'Weekly (Recommended)' }, { label: 'Daily' }] };
  assert.equal(parseChoice('{"choice":"Daily"}', q), 'Daily');
  assert.equal(parseChoice('{"other":"every two weeks"}', q), 'every two weeks');
  assert.equal(parseChoice('{"choice":"Weekly"}', q), 'Weekly (Recommended)');
  assert.equal(parseChoice('hmm', q), 'Weekly (Recommended)');
});
test('UT-SIM-05 promptFor namespaces the skill command, or strips it without the skill', () => {
  assert.equal(promptFor('/craft-prd recurring tasks', 'with'), '/shipcraft:craft-prd recurring tasks');
  assert.equal(promptFor('/craft-prd recurring tasks', 'without'), 'recurring tasks');
  assert.equal(promptFor('plain text', 'with'), 'plain text');
});
