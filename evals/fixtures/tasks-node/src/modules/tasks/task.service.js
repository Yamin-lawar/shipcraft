const { isMember } = require('../../auth');

function listTasks(db, projectId, userId) {
  if (!isMember(db, projectId, userId)) return null;
  return db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY id').all(projectId);
}

function createTask(db, projectId, userId, input) {
  if (!isMember(db, projectId, userId)) return null;
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Title is required');
  const info = db.prepare('INSERT INTO tasks (project_id, title, description, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)')
    .run(projectId, title, input.description || '', input.assignee_id || null, input.due_date || null);
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
}

function getTask(db, taskId) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
}

function importCsv(db, projectId, userId, csv) {
  if (!isMember(db, projectId, userId)) return null;
  const rows = csv.split('\n').map((l) => l.trim()).filter(Boolean).slice(1);
  const insert = db.prepare('INSERT INTO tasks (project_id, title, due_date) VALUES (?, ?, ?)');
  for (const row of rows) {
    const [title, due] = row.split(',');
    insert.run(projectId, title, due || null);
  }
  return { imported: rows.length };
}

module.exports = { listTasks, createTask, getTask, importCsv };
