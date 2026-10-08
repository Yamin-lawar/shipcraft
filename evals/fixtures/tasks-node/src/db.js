const { DatabaseSync } = require('node:sqlite');

function createDb(file = ':memory:') {
  const db = new DatabaseSync(file);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, name TEXT NOT NULL, timezone TEXT NOT NULL DEFAULT 'UTC');
    CREATE TABLE IF NOT EXISTS members (project_id INTEGER NOT NULL, user_id INTEGER NOT NULL, role TEXT NOT NULL DEFAULT 'member', PRIMARY KEY (project_id, user_id));
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '',
      assignee_id INTEGER, status TEXT NOT NULL DEFAULT 'open', due_date TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS invites (id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL, email TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS digest_runs (id INTEGER PRIMARY KEY, ran_at TEXT NOT NULL, sent_to INTEGER NOT NULL);
  `);
  return db;
}

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS n FROM users').get().n > 0) return;
  db.prepare("INSERT INTO users (id, email, password) VALUES (1, 'alice@example.com', 'password1'), (2, 'bob@example.com', 'password1')").run();
  db.prepare("INSERT INTO projects (id, name, timezone) VALUES (1, 'Website', 'Europe/Berlin'), (2, 'Operations', 'America/New_York')").run();
  db.prepare("INSERT INTO members (project_id, user_id, role) VALUES (1, 1, 'owner'), (2, 2, 'owner')").run();
  db.prepare("INSERT INTO tasks (project_id, title, assignee_id, due_date) VALUES (1, 'Write weekly report', 1, '2026-10-12'), (2, 'Check invoices', 2, '2026-10-01')").run();
}

module.exports = { createDb, seed };
