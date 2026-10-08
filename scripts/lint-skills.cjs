// @ts-check
/* Lints every skill against the Agent Skills spec and this repo's rules (I-4, I-5, I-7, I-8). */
const fs = require('node:fs');
const path = require('node:path');
const { listSkillDirs, parseFrontmatter, walk } = require('./lib/common.cjs');

const HOST_TOOLS = /\b(AskUserQuestion|EnterPlanMode|ExitPlanMode|TodoWrite)\b/;

/**
 * @param {string} root
 * @param {{ strict?: boolean }} [opts]
 * @returns {{ errors: string[], warnings: string[] }}
 */
function lintSkills(root, opts = {}) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  for (const skill of listSkillDirs(root)) {
    const dir = path.join(root, 'skills', skill);
    const rel = (/** @type {string} */ f) => path.join('skills', skill, f);
    // LN-SHIP: only Markdown ships
    for (const f of walk(dir)) {
      if (!f.endsWith('.md')) errors.push(`${rel(f)}: only Markdown files may ship inside a skill (no scripts or binaries)`);
    }
    // links and references (I-5)
    for (const f of walk(dir).filter((x) => x.endsWith('.md'))) {
      const text = fs.readFileSync(path.join(dir, f), 'utf8');
      if (f !== path.join('references', 'host.md') && HOST_TOOLS.test(text)) {
        errors.push(`${rel(f)}: host tool name "${(text.match(HOST_TOOLS) || [])[1]}" outside references/host.md`);
      }
      for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
        const target = m[1].split('#')[0];
        if (!target || /^(https?:|mailto:)/.test(target)) continue;
        const resolved = path.resolve(dir, path.dirname(f), target);
        if (!resolved.startsWith(dir + path.sep)) { errors.push(`${rel(f)}: link "${target}" points outside the skill folder`); continue; }
        if (!fs.existsSync(resolved)) errors.push(`${rel(f)}: link "${target}" does not exist`);
      }
    }
    const skillFile = path.join(dir, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      (opts.strict ? errors : warnings).push(`skills/${skill}: no SKILL.md (in progress)`);
      continue;
    }
    const text = fs.readFileSync(skillFile, 'utf8');
    const { data, error } = parseFrontmatter(text);
    if (error) { errors.push(`${rel('SKILL.md')}: ${error}`); continue; }
    if (data.name !== skill) errors.push(`${rel('SKILL.md')}: name "${data.name}" must equal the folder name "${skill}"`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(data.name || '')) || String(data.name || '').length > 64) errors.push(`${rel('SKILL.md')}: invalid name`);
    const desc = String(data.description || '');
    if (!desc) errors.push(`${rel('SKILL.md')}: description is required`);
    if (desc.length > 1024) errors.push(`${rel('SKILL.md')}: description exceeds 1024 characters`);
    if (desc.split(/\s+/).filter(Boolean).length > 100) errors.push(`${rel('SKILL.md')}: description exceeds 100 words`);
    if (!data.license) errors.push(`${rel('SKILL.md')}: license is required`);
    if (!data.metadata || !data.metadata.version) errors.push(`${rel('SKILL.md')}: metadata.version is required`);
    if (text.split(/\r?\n/).length - (text.endsWith('\n') ? 1 : 0) > 150) errors.push(`${rel('SKILL.md')}: exceeds 150 lines`);
  }
  return { errors, warnings };
}

module.exports = { lintSkills };

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const { errors, warnings } = lintSkills(root, { strict: process.argv.includes('--strict') });
  warnings.forEach((w) => console.warn('warn: ' + w));
  if (errors.length) { console.error(errors.map((e) => 'error: ' + e).join('\n')); process.exit(1); }
  console.log('lint-skills: ok');
}
