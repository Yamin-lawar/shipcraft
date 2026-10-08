// @ts-check
/* LLM judge. Scores an artifact against a rubric. The judge reads the artifact only.
   Median of N runs; evidence quotes required. Usage:
   node evals/judge.cjs <rubric> <artifact.md> [--release] [--gate G5] */
const fs = require('node:fs');
const path = require('node:path');
const { oneShot } = require('./lib/sdk.cjs');
const { loadBudget, addSpend, assertWithinBudget } = require('./lib/budget.cjs');

const SYSTEM = `You are a strict, fair reviewer scoring a document against a rubric. Score each criterion as an integer 1 to 5 using the rubric's anchors. For every criterion give "evidence": a short quote (under 25 words) taken from the document, or the words "absent" if the document lacks it. Do not be generous: a 5 must clearly match the 5 anchor. Return ONLY JSON, no prose, in exactly this shape:
{"criteria": {"<criterion_name>": {"score": 4, "evidence": "<quote>"}, ...}}`;

/** @param {number[]} xs */
function median(xs) { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

/** @param {string} text @returns {Record<string,{score:number,evidence:string}>} */
function parseJudge(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('judge returned no JSON');
  const obj = JSON.parse(m[0]);
  const c = obj.criteria;
  if (!c || typeof c !== 'object') throw new Error('judge JSON has no criteria');
  for (const [k, v] of Object.entries(c)) {
    const e = /** @type {any} */ (v);
    if (!Number.isInteger(e.score) || e.score < 1 || e.score > 5) throw new Error(`criterion ${k}: score must be an integer 1-5`);
    if (!e.evidence || typeof e.evidence !== 'string') throw new Error(`criterion ${k}: evidence is required`);
  }
  return c;
}

/** @param {Array<Record<string,{score:number,evidence:string}>>} runs */
function combine(runs) {
  /** @type {Record<string,{score:number,evidence:string}>} */ const out = {};
  for (const name of Object.keys(runs[0])) {
    out[name] = { score: median(runs.map((r) => r[name] ? r[name].score : 1)), evidence: runs[0][name].evidence };
  }
  const scores = Object.values(out).map((x) => x.score);
  return { criteria: out, average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100, min: Math.min(...scores) };
}

/**
 * @param {{ rubric: string, artifact: string, release?: boolean, gate?: string }} o
 */
async function judge(o) {
  const budget = loadBudget();
  const gate = o.gate || 'adhoc';
  const rubric = fs.readFileSync(path.resolve(o.rubric), 'utf8');
  const model = o.release ? budget.models.judgeRelease : budget.models.judgeBuilding;
  const n = o.release ? budget.judgeRuns.release : budget.judgeRuns.building;
  /** @type {Array<Record<string,{score:number,evidence:string}>>} */ const runs = [];
  let cost = 0;
  for (let i = 0; i < n; i++) {
    assertWithinBudget(gate, budget);
    const r = await oneShot({ model, system: SYSTEM, maxBudgetUsd: budget.perJudgeRunUsd, prompt: `RUBRIC:\n${rubric}\n\nDOCUMENT:\n${o.artifact}` });
    cost += r.costUsd; addSpend(gate, r.costUsd);
    runs.push(parseJudge(r.text));
  }
  return { ...combine(runs), model, runs: n, costUsd: cost };
}

module.exports = { judge, parseJudge, combine, median };

if (require.main === module) {
  const [rubric, artifact] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const gi = process.argv.indexOf('--gate');
  judge({ rubric, artifact: fs.readFileSync(artifact, 'utf8'), release: process.argv.includes('--release'), gate: gi > -1 ? process.argv[gi + 1] : undefined })
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => { console.error(e.message); process.exit(1); });
}
