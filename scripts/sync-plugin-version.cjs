// @ts-check
/* Keeps every skill's metadata.version equal to .claude-plugin/plugin.json's version. */
const fs = require('node:fs');
const path = require('node:path');
const { listSkillDirs, hasSkillFile } = require('./lib/common.cjs');

/**
 * @param {string} root
 * @param {{ check?: boolean }} [opts]
 * @returns {{ ok: boolean, drift: string[] }}
 */
function syncVersions(root, opts = {}) {
  const plugin = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
  const version = plugin.version;
  /** @type {string[]} */ const drift = [];
  for (const skill of listSkillDirs(root).filter((s) => hasSkillFile(root, s))) {
    const file = path.join(root, 'skills', skill, 'SKILL.md');
    const text = fs.readFileSync(file, 'utf8');
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) { drift.push(`skills/${skill}/SKILL.md: no frontmatter`); continue; }
    let block = fm[1];
    const current = (block.match(/^\s+version:\s*"?([^"\s]+)"?\s*$/m) || [])[1];
    if (current === version) continue;
    drift.push(`skills/${skill}/SKILL.md: version ${current || 'missing'} should be ${version}`);
    if (opts.check) continue;
    if (/^\s+version:/m.test(block)) block = block.replace(/^(\s+version:).*$/m, `$1 "${version}"`);
    else if (/^metadata:\s*$/m.test(block)) block = block.replace(/^metadata:\s*$/m, `metadata:\n  version: "${version}"`);
    else block += `\nmetadata:\n  version: "${version}"`;
    fs.writeFileSync(file, text.replace(fm[1], block));
  }
  return { ok: opts.check ? drift.length === 0 : true, drift };
}

module.exports = { syncVersions };

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const check = process.argv.includes('--check');
  const r = syncVersions(root, { check });
  if (!r.ok) { console.error('Versions out of sync:\n' + r.drift.map((d) => '  ' + d).join('\n')); process.exit(1); }
  console.log(check ? 'Versions are in sync.' : r.drift.length ? `Updated ${r.drift.length} skill(s).` : 'Versions already in sync.');
}
