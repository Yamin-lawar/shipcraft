// @ts-check
/* LN-PLUGIN: plugin.json lists every skill, versions agree, marketplace names the plugin. */
const fs = require('node:fs');
const path = require('node:path');
const { listSkillDirs, hasSkillFile, parseFrontmatter } = require('./lib/common.cjs');

/** @param {string} root @returns {{ errors: string[] }} */
function lintPlugin(root) {
  /** @type {string[]} */ const errors = [];
  const read = (/** @type {string} */ f) => JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', f), 'utf8'));
  let plugin, market;
  try { plugin = read('plugin.json'); } catch (e) { return { errors: ['.claude-plugin/plugin.json is missing or invalid'] }; }
  try { market = read('marketplace.json'); } catch (e) { errors.push('.claude-plugin/marketplace.json is missing or invalid'); }
  if (!/^\d+\.\d+\.\d+/.test(String(plugin.version || ''))) errors.push('plugin.json: version must be semver');
  const listed = new Set((plugin.skills || []).map((/** @type {string} */ s) => s.replace(/^\.\/skills\//, '')));
  const real = listSkillDirs(root).filter((s) => hasSkillFile(root, s));
  for (const s of real) if (!listed.has(s)) errors.push(`plugin.json: skill "${s}" is not listed`);
  for (const s of listed) {
    if (!hasSkillFile(root, /** @type {string} */ (s))) errors.push(`plugin.json: listed skill "${s}" has no skills/${s}/SKILL.md`);
    else {
      const v = (parseFrontmatter(fs.readFileSync(path.join(root, 'skills', /** @type {string} */ (s), 'SKILL.md'), 'utf8')).data.metadata || {}).version;
      if (v !== plugin.version) errors.push(`skill "${s}": metadata.version ${v} differs from plugin version ${plugin.version}`);
    }
  }
  if (market) {
    const entry = (market.plugins || []).find((/** @type {any} */ p) => p.name === plugin.name);
    if (!entry) errors.push(`marketplace.json: no plugin entry named "${plugin.name}"`);
    else if (entry.source !== './') errors.push('marketplace.json: plugin source should be "./"');
  }
  return { errors };
}

module.exports = { lintPlugin };

if (require.main === module) {
  const { errors } = lintPlugin(path.resolve(__dirname, '..'));
  if (errors.length) { console.error(errors.map((e) => 'error: ' + e).join('\n')); process.exit(1); }
  console.log('lint-plugin: ok');
}
