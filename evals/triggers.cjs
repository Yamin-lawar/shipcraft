// @ts-check
/* Trigger tests: does the model load the skill for phrases that should, and not for near misses?
   node evals/triggers.cjs <skill> [--gate G5]
   Passes at 9 of 10 correct. Each phrase is one short model call with the plugin loaded. */
const fs = require('node:fs');
const path = require('node:path');
const { sdk } = require('./lib/sdk.cjs');
const { loadBudget, addSpend, assertWithinBudget } = require('./lib/budget.cjs');

const ROOT = path.resolve(__dirname, '..');

/** @param {string} phrase @param {string} model @param {string} cwd */
async function loaded(phrase, model, cwd) {
  const { query } = await sdk();
  /** @type {string[]} */ const skills = [];
  let commands = /** @type {string[]} */ ([]);
  const q = query({
    prompt: phrase,
    options: {
      cwd, model, maxTurns: 2, maxBudgetUsd: 0.25, settingSources: [], permissionMode: 'default',
      plugins: [{ type: 'local', path: ROOT }],
      canUseTool: async (/** @type {string} */ tool, /** @type {any} */ input) => {
        if (tool === 'Skill') skills.push(String(input.skill || input.name || ''));
        return { behavior: 'deny', message: 'Stop here; this is a trigger test.' };
      },
    },
  });
  let cost = 0;
  try {
    for await (const m of q) {
      if (m.type === 'system' && m.subtype === 'init') commands = [...(m.slash_commands || []), ...(m.skills || [])].map(String);
      if (m.type === 'assistant') for (const b of m.message.content) if (b.type === 'tool_use' && b.name === 'Skill') skills.push(String(b.input.skill || b.input.name || ''));
      if (m.type === 'result') cost = m.total_cost_usd || 0;
    }
  } catch (e) {
    if (!/maximum number of turns/i.test(String(e && /** @type {any} */ (e).message))) throw e;
  }
  return { skills, cost, commands };
}

async function main() {
  const skill = process.argv[2];
  const gi = process.argv.indexOf('--gate');
  const gate = gi > -1 ? process.argv[gi + 1] : 'adhoc';
  const budget = loadBudget();
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, skill, 'triggers.json'), 'utf8'));
  const cwd = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'craft-trig-'));
  let correct = 0; const total = cfg.should_load.length + cfg.should_not_load.length;
  for (const [list, expect] of [[cfg.should_load, true], [cfg.should_not_load, false]]) {
    for (const phrase of list) {
      assertWithinBudget(gate, budget);
      const asked = phrase.replace(/^\/(craft-[a-z-]+)/, '/shipcraft:$1');
      const r = await loaded(asked, budget.models.skillUnderTest, cwd);
      addSpend(gate, r.cost);
      // A slash command loads the skill by definition when the host lists it; otherwise the model must choose to call it.
      const hit = r.skills.some((s) => s.includes(skill)) || (phrase.startsWith('/') && r.commands.some((c) => c.includes(skill)));
      const ok = hit === expect;
      if (ok) correct += 1;
      console.log(`${ok ? 'ok  ' : 'MISS'} ${expect ? 'should load    ' : 'should not load'} ${hit ? '(loaded)' : '(not loaded)'}  ${phrase}`);
    }
  }
  console.log(`${skill}: ${correct}/${total} correct. Needs ${Math.ceil(total * 0.9)}.`);
  process.exit(correct >= Math.ceil(total * 0.9) ? 0 : 1);
}
if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
