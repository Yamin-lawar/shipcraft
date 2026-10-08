// @ts-check
/* Spend ledger and caps for evals. Stops a run when a budget is spent. */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const LEDGER = path.join(ROOT, 'runs', 'ledger.json');

/** @returns {{ perConversationUsd:number, perJudgeRunUsd:number, smokeRunUsd:number, perGateUsd:number, models:Record<string,string>, judgeRuns:Record<string,number> }} */
function loadBudget() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'budget.json'), 'utf8'));
}

/** @param {string} [file] @returns {Record<string, number>} */
function readLedger(file = LEDGER) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return {}; }
}

/** @param {string} gate @param {number} usd @param {string} [file] */
function addSpend(gate, usd, file = LEDGER) {
  const l = readLedger(file);
  l[gate] = Math.round(((l[gate] || 0) + usd) * 10000) / 10000;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(l, null, 2));
  return l[gate];
}

/**
 * Throws when the gate's budget is already spent.
 * @param {string} gate @param {{ perGateUsd:number }} budget @param {string} [file]
 */
function assertWithinBudget(gate, budget, file = LEDGER) {
  const spent = readLedger(file)[gate] || 0;
  if (spent >= budget.perGateUsd) throw new Error(`Eval budget for ${gate} is spent ($${spent.toFixed(2)} of $${budget.perGateUsd.toFixed(2)}). Raise perGateUsd in evals/budget.json to continue.`);
  return spent;
}

module.exports = { loadBudget, readLedger, addSpend, assertWithinBudget };
