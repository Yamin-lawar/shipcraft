// @ts-check
/* Transcript checks (TC-*): free, deterministic rules run on every eval.
   Context shape:
   { events: Array<{t:string,...}>, gitStatus: string, craftFiles: Record<string,string> }
   Events: assistant_text {text} · question_prompt {questions:[...]} · developer {text}
           write {path} (a Write or Edit of a file) · result {costUsd} */

const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9]{20,}/, /AKIA[0-9A-Z]{16}/, /ghp_[A-Za-z0-9]{30,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /(api[_-]?key|secret|token|password)\s*[:=]\s*['"]?[A-Za-z0-9/+_-]{16,}/i,
];
const SHIPCRAFT_PATHS = [/(^|\s|\/)\.craft(\/|$)/, /CLAUDE\.local\.md/, /\.claude\/skills/, /skills-lock\.json/, /\.cursor\/rules\/craft/];

/** @typedef {{ events: any[], gitStatus?: string, craftFiles?: Record<string,string> }} Ctx */
/** @typedef {{ id: string, ok: boolean, details: string[] }} Result */

/** @param {string} id @param {string[]} details @returns {Result} */
const result = (id, details) => ({ id, ok: details.length === 0, details });
/** @param {string} text */
const questionCount = (text) => (text.match(/\?/g) || []).length;

/** TC-ONEQ: one question per prompt, and at most one question mark per plain-text turn. @param {Ctx} ctx */
function tcOneQ(ctx) {
  /** @type {string[]} */ const d = [];
  ctx.events.forEach((e, i) => {
    if (e.t === 'question_prompt' && (e.questions || []).length !== 1) d.push(`event ${i}: question prompt carries ${(e.questions || []).length} questions`);
    if (e.t === 'assistant_text' && questionCount(e.text) > 1) d.push(`event ${i}: assistant turn contains ${questionCount(e.text)} questions`);
  });
  return result('TC-ONEQ', d);
}

/** TC-GIT: nothing Shipcraft writes may show up in git status. @param {Ctx} ctx */
function tcGit(ctx) {
  /** @type {string[]} */ const d = [];
  for (const line of (ctx.gitStatus || '').split('\n').filter(Boolean)) {
    if (SHIPCRAFT_PATHS.some((re) => re.test(line))) d.push(`git status shows a Shipcraft file: ${line.trim()}`);
  }
  return result('TC-GIT', d);
}

/** TC-HIST: a file written more than once has at least one .history copy (the version before it was replaced). Small appends to a draft log do not each need one. @param {Ctx} ctx */
function tcHist(ctx) {
  /** @type {string[]} */ const d = [];
  /** @type {Record<string, number>} */ const writes = {};
  for (const e of ctx.events) if (e.t === 'write' && /\.craft\/features\/.*\.md$/.test(e.path) && !/\/\.history\//.test(e.path)) writes[e.path] = (writes[e.path] || 0) + 1;
  const files = Object.keys(ctx.craftFiles || {});
  for (const [p, n] of Object.entries(writes)) {
    const needed = n >= 2 ? 1 : 0;
    if (needed <= 0) continue;
    const dir = p.slice(0, p.lastIndexOf('/'));
    const base = p.slice(p.lastIndexOf('/') + 1).replace(/\.md$/, '');
    const have = files.filter((f) => f.startsWith(`${dir}/.history/${base}.`)).length;
    if (have < needed) d.push(`${p}: written ${n} times but no .history copy of an earlier version`);
  }
  return result('TC-HIST', d);
}

/** TC-SECRET: no secret-looking strings in .craft. @param {Ctx} ctx */
function tcSecret(ctx) {
  /** @type {string[]} */ const d = [];
  for (const [f, text] of Object.entries(ctx.craftFiles || {})) {
    for (const re of SECRET_PATTERNS) if (re.test(text)) { d.push(`${f}: matches secret pattern ${re}`); break; }
  }
  return result('TC-SECRET', d);
}

/** TC-CEIL: questions stay under the ceiling. @param {Ctx} ctx @param {{ ceiling: number }} p */
function tcCeil(ctx, p) {
  let n = 0;
  for (const e of ctx.events) {
    if (e.t === 'question_prompt') n += (e.questions || []).length;
    else if (e.t === 'assistant_text' && /\?\s*$/.test(e.text.trim())) n += 1;
  }
  return result('TC-CEIL', n > p.ceiling ? [`${n} questions asked, ceiling is ${p.ceiling}`] : []);
}

/** TC-NOWRITE: no plan written before the design summary was shown and answered. @param {Ctx} ctx @param {{ marker?: RegExp }} [p] */
function tcNoWrite(ctx, p = {}) {
  const marker = p.marker || /design summary/i;
  /** @type {number} */ let confirmedAt = Infinity;
  ctx.events.forEach((e, i) => {
    if (confirmedAt !== Infinity) return;
    const shown = (e.t === 'assistant_text' && marker.test(e.text)) || (e.t === 'question_prompt' && marker.test(JSON.stringify(e.questions)));
    if (shown) { const next = ctx.events.findIndex((x, j) => j > i && (x.t === 'developer' || (x.t === 'question_prompt' && x.answers))); confirmedAt = next === -1 ? Infinity : next; }
  });
  const early = ctx.events.findIndex((e, i) => e.t === 'write' && /plan\.md$/.test(e.path) && i < confirmedAt);
  return result('TC-NOWRITE', early === -1 ? [] : [`plan.md written at event ${early}, before the design summary was confirmed`]);
}

/** TC-STEP0: the saved Plan starts with Step 0. @param {Ctx} ctx */
function tcStep0(ctx) {
  const plan = Object.entries(ctx.craftFiles || {}).find(([f]) => /plan\.md$/.test(f) && !/\.history/.test(f));
  if (!plan) return result('TC-STEP0', ['no plan.md found']);
  const s0 = plan[1].search(/Step 0/i);
  const g1 = plan[1].search(/Gate 1|^\s*1\.\s/im);
  return result('TC-STEP0', s0 === -1 ? ['plan.md has no Step 0'] : g1 !== -1 && g1 < s0 ? ['Step 0 comes after the first gate or step'] : []);
}

/** TC-PROGRESS: the draft is saved early, not only at the end. @param {Ctx} ctx @param {{ file?: RegExp, within?: number }} [p] */
function tcProgress(ctx, p = {}) {
  const file = p.file || /prd\.md$/;
  const within = p.within || 3;
  let prompts = 0;
  for (const e of ctx.events) {
    if (e.t === 'write' && file.test(e.path)) return result('TC-PROGRESS', []);
    if (e.t === 'question_prompt') prompts += 1;
    if (prompts > within) return result('TC-PROGRESS', [`${prompts} questions were asked before the draft was first saved (limit ${within})`]);
  }
  return result('TC-PROGRESS', prompts > within ? [`draft never saved after ${prompts} questions`] : []);
}

/** TC-NOPROMPT: no question prompts at all (exploration). @param {Ctx} ctx */
function tcNoPrompt(ctx) {
  const n = ctx.events.filter((e) => e.t === 'question_prompt').length;
  return result('TC-NOPROMPT', n ? [`${n} question prompt(s) in an exploration`] : []);
}

/** TC-UX: opens with the opening line and ends with the closing line. @param {Ctx} ctx */
function tcUx(ctx) {
  /** @type {string[]} */ const d = [];
  const texts = ctx.events.filter((e) => e.t === 'assistant_text').map((e) => e.text);
  if (!texts.length) return result('TC-UX', ['no assistant text']);
  if (!/^▶ .+ · .+ · .+/m.test(texts[0].trim().split('\n')[0])) d.push('first message does not start with the opening line (▶ feature · stage · what happens now)');
  if (!/^✔ .+/m.test(texts[texts.length - 1])) d.push('last message has no closing line (✔ saved · next · how to come back)');
  return result('TC-UX', d);
}

const ALL = { 'TC-ONEQ': tcOneQ, 'TC-GIT': tcGit, 'TC-HIST': tcHist, 'TC-SECRET': tcSecret, 'TC-CEIL': tcCeil, 'TC-NOWRITE': tcNoWrite, 'TC-STEP0': tcStep0, 'TC-NOPROMPT': tcNoPrompt, 'TC-PROGRESS': tcProgress, 'TC-UX': tcUx };

/**
 * @param {Ctx} ctx @param {string[]} ids @param {Record<string, any>} [params]
 * @returns {Result[]}
 */
function runChecks(ctx, ids, params = {}) {
  return ids.map((id) => {
    const fn = /** @type {any} */ (ALL)[id];
    if (!fn) return { id, ok: false, details: ['unknown check'] };
    return fn(ctx, params[id]);
  });
}

module.exports = { runChecks, ALL };
