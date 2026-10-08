const express = require('express');
const { requireAuth } = require('../../auth');
const tasks = require('./task.service');

module.exports = function taskRoutes(db) {
  const r = express.Router();
  r.get('/projects/:id/tasks', requireAuth, (req, res) => {
    const list = tasks.listTasks(db, Number(req.params.id), req.userId);
    if (!list) return res.status(404).json({ error: 'Project not found' });
    res.json(list);
  });
  r.post('/projects/:id/tasks', requireAuth, (req, res) => {
    try {
      const task = tasks.createTask(db, Number(req.params.id), req.userId, req.body);
      if (!task) return res.status(404).json({ error: 'Project not found' });
      res.status(201).json(task);
    } catch (e) { res.status(400).json({ error: e.message }); }
  });
  r.get('/tasks/:id', requireAuth, (req, res) => {
    const task = tasks.getTask(db, Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });
  r.post('/projects/:id/import', requireAuth, express.text({ type: '*/*', limit: '50mb' }), (req, res) => {
    const out = tasks.importCsv(db, Number(req.params.id), req.userId, req.body || '');
    if (!out) return res.status(404).json({ error: 'Project not found' });
    res.json(out);
  });
  return r;
};
