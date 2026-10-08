const express = require('express');
const { requireAuth, isMember } = require('../../auth');

module.exports = function projectRoutes(db) {
  const r = express.Router();
  r.get('/projects', requireAuth, (req, res) => {
    res.json(db.prepare('SELECT p.* FROM projects p JOIN members m ON m.project_id = p.id WHERE m.user_id = ?').all(req.userId));
  });
  r.post('/projects/:id/invites', requireAuth, (req, res) => {
    const projectId = Number(req.params.id);
    if (!isMember(db, projectId, req.userId)) return res.status(404).json({ error: 'Project not found' });
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' });
    const info = db.prepare('INSERT INTO invites (project_id, email) VALUES (?, ?)').run(projectId, email);
    res.status(201).json({ id: Number(info.lastInsertRowid), email });
  });
  return r;
};
