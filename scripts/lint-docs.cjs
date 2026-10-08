// @ts-check
/* Released skills need a docs page and a README mention; every relative link and image must resolve. */
const fs = require('node:fs');
const path = require('node:path');
const { walk } = require('./lib/common.cjs');

/** @param {string} text */
function stripCode(text) {
  return text.replace(/```[\s\S]*?```/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/`[^`\n]*`/g, '');
}

/** @param {string} root @returns {{ errors: string[] }} */
function lintDocs(root) {
  /** @type {string[]} */ const errors = [];
  let released = [];
  try { released = JSON.parse(fs.readFileSync(path.join(root, 'shared', 'manifest.json'), 'utf8')).released || []; } catch (e) { /* no manifest */ }
  const readme = path.join(root, 'README.md');
  const readmeText = fs.existsSync(readme) ? fs.readFileSync(readme, 'utf8') : '';
  for (const skill of released) {
    if (!fs.existsSync(path.join(root, 'docs', `${skill}.md`))) errors.push(`docs/${skill}.md: missing page for released skill`);
    if (!readmeText.includes(`/${skill}`)) errors.push(`README.md: no row or mention for released skill /${skill}`);
  }
  const files = [
    ...fs.readdirSync(root).filter((f) => f.endsWith('.md')),
    ...walk(path.join(root, 'docs')).filter((f) => f.endsWith('.md')).map((f) => path.join('docs', f)),
  ];
  for (const f of files) {
    const text = stripCode(fs.readFileSync(path.join(root, f), 'utf8'));
    for (const m of text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const target = m[1].split('#')[0];
      if (!target || /^(https?:|mailto:)/.test(target)) continue;
      if (!fs.existsSync(path.resolve(root, path.dirname(f), target))) errors.push(`${f}: link "${target}" does not exist`);
    }
  }
  return { errors };
}

module.exports = { lintDocs };

if (require.main === module) {
  const { errors } = lintDocs(path.resolve(__dirname, '..'));
  if (errors.length) { console.error(errors.map((e) => 'error: ' + e).join('\n')); process.exit(1); }
  console.log('lint-docs: ok');
}
