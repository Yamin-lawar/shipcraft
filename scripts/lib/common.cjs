// @ts-check
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} root @returns {string[]} skill folder names under skills/ */
function listSkillDirs(root) {
  const dir = path.join(root, 'skills');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

/** @param {string} root @param {string} skill */
function hasSkillFile(root, skill) {
  return fs.existsSync(path.join(root, 'skills', skill, 'SKILL.md'));
}

/**
 * Minimal frontmatter reader for the simple, flat shape the skills use:
 * single-line scalars, plus a `metadata:` block of single-line scalars.
 * @param {string} text
 * @returns {{ data: Record<string, any>, body: string, error?: string }}
 */
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text, error: 'missing frontmatter' };
  /** @type {Record<string, any>} */
  const data = {};
  let block = null;
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indented = /^\s+/.test(raw);
    const kv = raw.trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const value = kv[2].replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '');
    if (indented && block) data[block][kv[1]] = value;
    else if (kv[2] === '') { data[kv[1]] = {}; block = kv[1]; }
    else { data[kv[1]] = value; block = null; }
  }
  return { data, body: m[2] };
}

/** @param {string} dir @returns {string[]} all files under dir, relative paths */
function walk(dir, base = dir) {
  /** @type {string[]} */
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(full, base));
    else out.push(path.relative(base, full));
  }
  return out.sort();
}

module.exports = { listSkillDirs, hasSkillFile, parseFrontmatter, walk };
