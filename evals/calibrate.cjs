// @ts-check
/* Checks the judge against samples of known quality. Passes when at least 80% of samples
   score within 1 of the expected average, and every `expect_low` criterion scores 2 or below.
   node evals/calibrate.cjs <prd|brief|plan> [--gate G4] */
const fs = require('node:fs');
const path = require('node:path');
const { judge } = require('./judge.cjs');

async function main() {
  const rubric = process.argv[2];
  const gi = process.argv.indexOf('--gate');
  const gate = gi > -1 ? process.argv[gi + 1] : 'calibration';
  const dir = path.join(__dirname, 'calibration', rubric);
  const { samples } = JSON.parse(fs.readFileSync(path.join(dir, 'scores.json'), 'utf8'));
  let ok = 0;
  for (const s of samples) {
    const r = await judge({ rubric: path.join(__dirname, 'rubrics', `${rubric}.md`), artifact: fs.readFileSync(path.join(dir, s.file), 'utf8'), gate });
    const near = Math.abs(r.average - s.expected_average) <= 1;
    const lowOk = (s.expect_low || []).every((/** @type {string} */ k) => r.criteria[k] && r.criteria[k].score <= 2);
    const pass = near && lowOk;
    if (pass) ok += 1;
    console.log(`${pass ? 'ok  ' : 'MISS'} ${s.file}  judged ${r.average} (expected ${s.expected_average})${s.expect_low ? '  low: ' + s.expect_low.map((/** @type {string} */ k) => `${k}=${r.criteria[k] ? r.criteria[k].score : '?'}`).join(',') : ''}  $${r.costUsd.toFixed(3)}`);
  }
  const pct = Math.round((ok / samples.length) * 100);
  console.log(`${rubric}: ${ok}/${samples.length} agree (${pct}%). Needs 80%.`);
  process.exit(pct >= 80 ? 0 : 1);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
