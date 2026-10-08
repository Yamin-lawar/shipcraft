const express = require('express');
const { createDb, seed } = require('./db');
const { login } = require('./auth');
const projectRoutes = require('./modules/projects/project.routes');
const taskRoutes = require('./modules/tasks/task.routes');

function createApp(db = createDb()) {
  seed(db);
  const app = express();
  app.use(express.json());
  app.post('/login', (req, res) => {
    const session = login(db, req.body.email, req.body.password);
    if (!session) return res.status(401).json({ error: 'Wrong email or password' });
    res.json(session);
  });
  app.use(projectRoutes(db));
  app.use(taskRoutes(db));
  app.get('/health', (req, res) => res.json({ ok: true }));
  return { app, db };
}

module.exports = { createApp };
