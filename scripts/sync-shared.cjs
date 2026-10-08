// @ts-check
/* Copies shared/ files into each skill's references/ per shared/manifest.json.
   --check exits 1 if any copy differs. */
const fs = require('node:fs');
const path = require('node:path');
const { listSkillDirs } = require('./lib/common.cjs');

/** @param {string} root */
function loadManifest(root) {
  const file = path.join(root, 'shared', 'manifest.json');
  if (!fs.existsSync(file)) throw new Error('shared/manifest.json not found');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * @param {string} root
 * @param {{ check?: boolean }} [opts]
 * @returns {{ ok: boolean, drift: string[], written: string[] }}
 */
function syncShared(root, opts = {}) {
  const manifest = loadManifest(root);
  const skills = listSkillDirs(root);
  /** @type {string[]} */ const drift = [];
  /** @type {string[]} */ const written = [];
  for (const [file, target] of Object.entries(manifest.shared || {})) {
    const src = path.join(root, 'shared', file);
    if (!fs.existsSync(src)) { drift.push(`${file}: missing in shared/`); continue; }
    const content = fs.readFileSync(src, 'utf8');
    const targets = target === '*' ? skills : /** @type {string[]} */ (target);
    for (const skill of targets) {
      if (!skills.includes(skill)) { drift.push(`${file}: target skill "${skill}" does not exist`); continue; }
      const dest = path.join(root, 'skills', skill, 'references', file);
      const current = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
      if (current === content) continue;
      if (opts.check) { drift.push(`${path.relative(root, dest)}: ${current === null ? 'missing' : 'differs from shared/' + file}`); continue; }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, content);
      written.push(path.relative(root, dest));
    }
  }
  return { ok: drift.length === 0, drift, written };
}

module.exports = { syncShared };

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const check = process.argv.includes('--check');
  const r = syncShared(root, { check });
  if (!r.ok) { console.error((check ? 'Shared copies out of sync:\n' : 'Sync problems:\n') + r.drift.map((d) => '  ' + d).join('\n')); process.exit(1); }
  console.log(check ? 'Shared copies are in sync.' : `Synced ${r.written.length} file(s).`);
}
