// @ts-check
/* Eval runner. Reads evals/<skill>/evals.json (official format, multi-turn fields under `extra`),
   runs each case with and/or without the skill against a copy of a fixture, with a simulated Developer
   answering, then runs the free transcript checks and (optionally) the judge.

   node evals/run.cjs --skill <name> [--case <id>] [--variant with|without|both] [--gate G5]
                      [--judge] [--release] [--dry] [--replay <variant-dir>]
   Output: evals/runs/<skill>-workspace/iteration-N/eval-<id>/<variant>_skill/{events.json,transcript.md,
           craft-files.json,git-status.txt,timing.json,grading.json} */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { sdk, oneShot } = require('./lib/sdk.cjs');
const { makeChannel, bashAllowed, bashWritePath, insideWorkdir, parseChoice, promptFor } = require('./lib/sim.cjs');
const { loadBudget, addSpend, assertWithinBudget } = require('./lib/budget.cjs');
const { runChecks } = require('./checks.cjs');
const { judge } = require('./judge.cjs');

const ROOT = path.resolve(__dirname, '..');
const RUNS = path.join(__dirname, 'runs');
const GIT = ['-c', 'user.name=eval', '-c', 'user.email=eval@example.com'];

/** @param {string} dir @param {string[]} args */
const git = (dir, args) => execFileSync('git', [...GIT, ...args], { cwd: dir, encoding: 'utf8' });

/** Copy a fixture (without node_modules) to a temp work dir and commit it as the baseline. @param {string} fixture @param {string} dest */
function prepareWorkdir(fixture, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(path.resolve(__dirname, fixture), dest, { recursive: true, filter: (s) => !/node_modules|\.venv|__pycache__/.test(s) });
  git(dest, ['init', '-q', '-b', 'main']);
  git(dest, ['add', '-A']);
  git(dest, ['commit', '-q', '--allow-empty', '-m', 'baseline']);
}

/** @param {string} dir @param {string} base @returns {Record<string,string>} */
function readTree(dir, base = dir) {
  /** @type {Record<string,string>} */ const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) Object.assign(out, readTree(full, base));
    else if (fs.statSync(full).size < 200000) out[path.relative(base, full)] = fs.readFileSync(full, 'utf8');
  }
  return out;
}

/** @param {any[]} events @param {number} n */
function tail(events, n = 8) {
  return events.slice(-n).map((e) => e.t === 'assistant_text' ? `ASSISTANT: ${e.text}` : e.t === 'developer' ? `DEVELOPER: ${e.text}` : e.t === 'question_prompt' ? `ASSISTANT ASKED: ${JSON.stringify(e.questions.map((/** @type {any} */ q) => ({ q: q.question, options: q.options.map((/** @type {any} */ o) => o.label) })))} DEVELOPER ANSWERED: ${JSON.stringify(e.answers)}` : '').filter(Boolean).join('\n');
}

/** @param {any[]} events */
function transcriptMd(events) {
  return events.map((e) => e.t === 'assistant_text' ? `**Assistant:** ${e.text}` : e.t === 'developer' ? `**Developer:** ${e.text}` : e.t === 'question_prompt' ? `**Assistant asked:** ${e.questions.map((/** @type {any} */ q) => q.question).join(' / ')}\n**Developer chose:** ${JSON.stringify(e.answers)}` : e.t === 'write' ? `*(wrote ${e.path})*` : '').filter(Boolean).join('\n\n');
}

/** Run one conversation. @param {{ c: any, variant: 'with'|'without', workdir: string, gate: string }} o */
async function runConversation(o) {
  const budget = loadBudget();
  const extra = o.c.extra || {};
  const persona = fs.readFileSync(path.resolve(ROOT, extra.developer), 'utf8');
  const { query } = await sdk();
  /** @type {any[]} */ const events = [];
  let cost = 0; let turns = 0;
  const simModel = budget.models.developer;
  const simSystem = `You are the Developer in a conversation with an AI skill. Stay in character.\n\n${persona}\n\nRules: reply in one to three sentences, like a busy engineer. Never say you are simulated. If asked to choose from options, pick what this persona would.`;

  const channel = makeChannel();
  const send = (/** @type {string} */ text) => channel.push({ type: 'user', message: { role: 'user', content: text }, parent_tool_use_id: null, session_id: '' });
  send(promptFor(o.c.prompt, o.variant));

  const q = query({
    prompt: channel,
    options: {
      cwd: o.workdir, model: extra.model || budget.models.skillUnderTest, maxBudgetUsd: budget.perConversationUsd, settingSources: [],
      permissionMode: extra.permissionMode || 'default',
      plugins: o.variant === 'with' ? [{ type: 'local', path: ROOT }] : [],
      canUseTool: async (/** @type {string} */ tool, /** @type {any} */ input) => {
        if (tool === 'AskUserQuestion') {
          const answers = /** @type {Record<string,string>} */ ({});
          for (const qq of input.questions) {
            assertWithinBudget(o.gate, budget);
            const r = await oneShot({ model: simModel, system: simSystem, maxBudgetUsd: 0.05, cwd: o.workdir, prompt: `CONVERSATION SO FAR:\n${tail(events)}\n\nThe assistant asks: ${qq.question}\nOptions: ${JSON.stringify(qq.options)}\nAnswer with JSON only: {"choice":"<exact option label>"} or {"other":"<your own words>"}` });
            cost += r.costUsd; addSpend(o.gate, r.costUsd);
            answers[qq.question] = parseChoice(r.text, qq);
          }
          events.push({ t: 'question_prompt', questions: input.questions, answers });
          return { behavior: 'allow', updatedInput: { ...input, answers } };
        }
        if (tool === 'ExitPlanMode') {
          events.push({ t: 'plan', text: String(input.plan || '') });
          channel.close();
          return { behavior: 'deny', message: 'The plan has been captured. Stop here.' };
        }
        if (['Read', 'Glob', 'Grep', 'Skill', 'TodoWrite'].includes(tool)) { events.push({ t: 'tool', name: tool, target: String(input.file_path || input.skill || input.pattern || '').slice(0, 120) }); return { behavior: 'allow', updatedInput: input }; }
        if (['Write', 'Edit', 'MultiEdit'].includes(tool)) {
          const p = input.file_path || '';
          if (!insideWorkdir(p, o.workdir)) return { behavior: 'deny', message: 'Writes are limited to the project folder.' };
          events.push({ t: 'write', path: path.relative(o.workdir, path.resolve(o.workdir, p)) });
          return { behavior: 'allow', updatedInput: input };
        }
        if (tool === 'Bash') {
          if (!bashAllowed(input.command || '')) return { behavior: 'deny', message: 'That command is not allowed in this test.' };
          const wp = bashWritePath(input.command || '');
          if (wp) events.push({ t: 'write', path: wp, via: 'bash' });
          events.push({ t: 'tool', name: 'Bash', command: String(input.command || '').slice(0, 200) });
          return { behavior: 'allow', updatedInput: input };
        }
        return { behavior: 'deny', message: `${tool} is not available in this test.` };
      },
    },
  });

  const start = Date.now();
  let lastText = '';
  for await (const m of q) {
    if (m.type === 'assistant') {
      for (const b of m.message.content) if (b.type === 'text' && b.text.trim()) { events.push({ t: 'assistant_text', text: b.text.trim() }); lastText = b.text.trim(); }
    } else if (m.type === 'result') {
      turns += 1; cost += 0; // the conversation's own cost is read once, below
      events.push({ t: 'result', costUsd: m.total_cost_usd || 0 });
      const spent = m.total_cost_usd || 0;
      const done = turns >= (extra.turn_cap || 30) || spent >= budget.perConversationUsd || /^✔ /m.test(lastText);
      if (done) { channel.close(); continue; }
      assertWithinBudget(o.gate, budget);
      const r = await oneShot({ model: simModel, system: simSystem, maxBudgetUsd: 0.05, cwd: o.workdir, prompt: `CONVERSATION SO FAR:\n${tail(events)}\n\nReply as the Developer. If the assistant has finished and there is nothing left to do, reply exactly <<DONE>>.` });
      cost += r.costUsd; addSpend(o.gate, r.costUsd);
      if (/<<DONE>>/.test(r.text)) { channel.close(); continue; }
      events.push({ t: 'developer', text: r.text });
      send(r.text);
    }
  }
  const convoCost = events.filter((e) => e.t === 'result').map((e) => e.costUsd).pop() || 0;
  addSpend(o.gate, convoCost);
  return { events, durationMs: Date.now() - start, costUsd: cost + convoCost, turns };
}

/** Free checks, then the judge. @param {any} c @param {string} variantDir @param {{ judge?: boolean, release?: boolean, gate: string }} opts */
async function grade(c, variantDir, opts) {
  const extra = c.extra || {};
  const events = JSON.parse(fs.readFileSync(path.join(variantDir, 'events.json'), 'utf8'));
  const craftFiles = JSON.parse(fs.readFileSync(path.join(variantDir, 'craft-files.json'), 'utf8'));
  const gitStatus = fs.readFileSync(path.join(variantDir, 'git-status.txt'), 'utf8');
  const checks = runChecks({ events, craftFiles, gitStatus }, extra.checks || [], extra.checkParams || {});
  /** @type {any} */ let judged = null;
  if (opts.judge && extra.rubric) {
    const artifactKey = Object.keys(craftFiles).find((f) => extra.artifact && new RegExp(extra.artifact).test(f));
    const artifact = extra.rubric === 'conversation' ? fs.readFileSync(path.join(variantDir, 'transcript.md'), 'utf8') : artifactKey ? craftFiles[artifactKey] : null;
    if (artifact) judged = await judge({ rubric: path.join(__dirname, 'rubrics', `${extra.rubric}.md`), artifact, release: opts.release, gate: opts.gate });
    else judged = { error: 'artifact not found', pattern: extra.artifact };
  }
  const checksOk = checks.every((x) => x.ok);
  const threshold = extra.threshold || 4;
  const judgeOk = !judged ? null : judged.error ? false : judged.average >= threshold && judged.min >= 3;
  const grading = { checks, judge: judged, passed: checksOk && judgeOk !== false };
  fs.writeFileSync(path.join(variantDir, 'grading.json'), JSON.stringify(grading, null, 2));
  return grading;
}

/** @param {string} skill */
function nextIteration(skill) {
  const base = path.join(RUNS, `${skill}-workspace`);
  const n = fs.existsSync(base) ? fs.readdirSync(base).filter((d) => d.startsWith('iteration-')).length + 1 : 1;
  return path.join(base, `iteration-${n}`);
}

async function main() {
  const args = process.argv.slice(2);
  const val = (/** @type {string} */ f) => { const i = args.indexOf(f); return i > -1 ? args[i + 1] : undefined; };
  const skill = val('--skill');
  const gate = val('--gate') || 'adhoc';
  const opts = { judge: args.includes('--judge'), release: args.includes('--release'), gate };
  if (val('--replay')) {
    const dir = path.resolve(/** @type {string} */ (val('--replay')));
    const evalsFile = path.join(__dirname, val('--skill') || '', 'evals.json');
    const c = JSON.parse(fs.readFileSync(evalsFile, 'utf8')).evals.find((/** @type {any} */ e) => String(e.id) === String(val('--case')));
    console.log(JSON.stringify(await grade(c, dir, opts), null, 2));
    return;
  }
  if (!skill) { console.error('usage: node evals/run.cjs --skill <name> [--case id] [--variant with|without|both] [--gate G5] [--judge] [--release] [--dry]'); process.exit(2); }
  const file = path.join(__dirname, skill, 'evals.json');
  const cases = JSON.parse(fs.readFileSync(file, 'utf8')).evals.filter((/** @type {any} */ e) => !val('--case') || String(e.id) === val('--case'));
  const variantArg = val('--variant') || 'both';
  const variants = /** @type {Array<'with'|'without'>} */ (variantArg === 'both' ? ['with', 'without'] : [variantArg]);
  const budget = loadBudget();
  if (args.includes('--dry')) { console.log(`Would run ${cases.length} case(s) × ${variants.length} variant(s). Cap: $${budget.perConversationUsd} per conversation, so at most $${(cases.length * variants.length * budget.perConversationUsd).toFixed(2)} before judging.`); return; }
  const iter = nextIteration(skill);
  let allPassed = true;
  for (const c of cases) {
    for (const variant of variants) {
      assertWithinBudget(gate, budget);
      const dir = path.join(iter, `eval-${c.id}`, `${variant}_skill`);
      const workdir = path.join(dir, 'work');
      fs.mkdirSync(dir, { recursive: true });
      prepareWorkdir(c.files && c.files[0] ? path.resolve(ROOT, c.files[0]) : path.join(__dirname, 'fixtures', 'empty'), workdir);
      console.log(`running ${skill} case ${c.id} (${variant} skill)...`);
      const r = await runConversation({ c, variant, workdir, gate });
      fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify(r.events, null, 2));
      fs.writeFileSync(path.join(dir, 'transcript.md'), transcriptMd(r.events));
      fs.writeFileSync(path.join(dir, 'git-status.txt'), git(workdir, ['status', '--porcelain']));
      const craftFiles = readTree(path.join(workdir, '.craft'), workdir);
      const planEvent = r.events.find((e) => e.t === 'plan');
      if (planEvent) craftFiles['.craft/features/baseline/plan.md'] = planEvent.text;
      fs.writeFileSync(path.join(dir, 'craft-files.json'), JSON.stringify(craftFiles, null, 2));
      fs.writeFileSync(path.join(dir, 'timing.json'), JSON.stringify({ durationMs: r.durationMs, costUsd: Math.round(r.costUsd * 10000) / 10000, turns: r.turns }, null, 2));
      const g = await grade(c, dir, opts);
      allPassed = allPassed && g.passed;
      console.log(`  ${g.passed ? 'PASS' : 'FAIL'}  $${r.costUsd.toFixed(3)}  ${g.checks.map((x) => `${x.id}:${x.ok ? 'ok' : 'FAIL'}`).join(' ')}${g.judge && !g.judge.error ? `  judge avg ${g.judge.average} min ${g.judge.min}` : ''}`);
      for (const x of g.checks.filter((y) => !y.ok)) console.log('    ' + x.details.join('\n    '));
    }
  }
  console.log(`Workspace: ${iter}`);
  process.exit(allPassed ? 0 : 1);
}

module.exports = { prepareWorkdir, readTree, transcriptMd, grade };

if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
