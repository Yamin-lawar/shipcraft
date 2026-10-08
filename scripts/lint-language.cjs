// @ts-check
/* Fails if skill text uses a term from the Avoid lists in GLOSSARY.md.
   Defined terms are never avoided. scripts/lint-language.allow holds exemptions:
     ignore-term: <term>        never enforce this term
     <path-substring> :: <term> allow this term in matching files */
const fs = require('node:fs');
const path = require('node:path');
const { walk } = require('./lib/common.cjs');

/** @param {string} glossary @returns {string[]} */
function avoidTerms(glossary) {
  const defined = new Set([...glossary.matchAll(/^\*\*([^*]+)\*\*:/gm)].map((m) => m[1].trim().toLowerCase()));
  /** @type {Set<string>} */ const terms = new Set();
  for (const m of glossary.matchAll(/^_Avoid_:\s*(.+)$/gm)) {
    for (const raw of m[1].split(/,(?![^(]*\))/)) {
      const t = raw.replace(/\([^)]*\)/g, '').trim().toLowerCase();
      if (t && !defined.has(t)) terms.add(t);
    }
  }
  return [...terms].sort();
}

/** @param {string} text */
function strip(text) {
  return text.replace(/```[\s\S]*?```/g, (b) => b.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, (b) => b.replace(/[^\n]/g, ' '))
    .replace(/`[^`\n]*`/g, (b) => ' '.repeat(b.length));
}

/** @param {string} root @returns {{ errors: string[] }} */
function lintLanguage(root) {
  /** @type {string[]} */ const errors = [];
  const gfile = path.join(root, 'GLOSSARY.md');
  if (!fs.existsSync(gfile)) return { errors: ['GLOSSARY.md not found'] };
  const allowFile = path.join(root, 'scripts', 'lint-language.allow');
  /** @type {Set<string>} */ const ignore = new Set();
  /** @type {Array<[string,string]>} */ const fileAllow = [];
  if (fs.existsSync(allowFile)) {
    for (const line of fs.readFileSync(allowFile, 'utf8').split(/\r?\n/)) {
      const l = line.trim();
      if (!l || l.startsWith('#')) continue;
      if (l.startsWith('ignore-term:')) ignore.add(l.slice(12).trim().toLowerCase());
      else if (l.includes('::')) { const [f, t] = l.split('::'); fileAllow.push([f.trim(), t.trim().toLowerCase()]); }
    }
  }
  const terms = avoidTerms(fs.readFileSync(gfile, 'utf8')).filter((t) => !ignore.has(t));
  for (const f of walk(path.join(root, 'skills')).filter((x) => x.endsWith('.md'))) {
    const rel = path.join('skills', f);
    const lines = strip(fs.readFileSync(path.join(root, rel), 'utf8')).split('\n');
    for (const term of terms) {
      if (fileAllow.some(([p, t]) => t === term && rel.includes(p))) continue;
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const lookbehind = term === 'user' ? '(?<!end )' : '';
      const re = new RegExp(`${lookbehind}(?<![\\w-])${esc}(?![\\w])`, 'i');
      lines.forEach((l, i) => { if (re.test(l)) errors.push(`${rel}:${i + 1}: avoid "${term}" (see GLOSSARY.md)`); });
    }
  }
  return { errors };
}

module.exports = { lintLanguage, avoidTerms };

if (require.main === module) {
  const { errors } = lintLanguage(path.resolve(__dirname, '..'));
  if (errors.length) { console.error(errors.map((e) => 'error: ' + e).join('\n')); process.exit(1); }
  console.log('lint-language: ok');
}
