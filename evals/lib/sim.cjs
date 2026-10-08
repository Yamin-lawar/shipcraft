// @ts-check
/* Pure helpers for the runner: the input channel, tool guards, and answer parsing. */
const path = require('node:path');

/** An async-iterable queue used as the streaming prompt. */
function makeChannel() {
  /** @type {any[]} */ const q = [];
  /** @type {null | ((r: any) => void)} */ let waiting = null;
  let closed = false;
  return {
    push(/** @type {any} */ m) { if (waiting) { const w = waiting; waiting = null; w({ value: m, done: false }); } else q.push(m); },
    close() { closed = true; if (waiting) { const w = waiting; waiting = null; w({ value: undefined, done: true }); } },
    [Symbol.asyncIterator]() {
      return { next: () => q.length ? Promise.resolve({ value: q.shift(), done: false }) : closed ? Promise.resolve({ value: undefined, done: true }) : new Promise((r) => { waiting = r; }) };
    },
  };
}

const BASH_DENY = /\b(rm|sudo|curl|wget|chmod|chown|kill|dd|mkfs|shutdown|reboot)\b|>\s*\/|\.\.\/|~\/|\bgit\s+(push|remote|config)\b|\bnpm\s+(publish|login)\b/;
/** Deny obviously dangerous shell commands. The runner also confines the working directory. @param {string} cmd */
function bashAllowed(cmd) { return !BASH_DENY.test(cmd); }

/** True when a file path is inside the work directory. @param {string} file @param {string} workdir */
function insideWorkdir(file, workdir) {
  const resolved = path.resolve(workdir, file);
  return resolved === workdir || resolved.startsWith(workdir + path.sep);
}

/**
 * Turn the simulated Developer's raw text into an answer for one question.
 * Accepts JSON {"choice": "<label>"} or {"other": "<text>"}; falls back to the first option.
 * @param {string} text @param {{ options: Array<{label:string}> }} q
 */
function parseChoice(text, q) {
  const m = text.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const o = JSON.parse(m[0]);
      if (o.other) return String(o.other);
      const hit = q.options.find((x) => x.label === o.choice) || q.options.find((x) => x.label.toLowerCase().startsWith(String(o.choice || '').toLowerCase()));
      if (hit) return hit.label;
    } catch (e) { /* fall through */ }
  }
  return q.options[0].label;
}

/** Map a skill command to its plugin-namespaced form, or strip it for the without-skill run.
 * @param {string} prompt @param {'with'|'without'} variant */
function promptFor(prompt, variant) {
  if (variant === 'with') return prompt.replace(/^\/(craft-[a-z-]+)/, '/shipcraft:$1');
  return prompt.replace(/^\/craft-[a-z-]+\s*/, '');
}

module.exports = { makeChannel, bashAllowed, insideWorkdir, parseChoice, promptFor };
