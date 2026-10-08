const crypto = require('node:crypto');

const sessions = new Map();

function login(db, email, password) {
  const user = db.prepare('SELECT id, email FROM users WHERE email = ? AND password = ?').get(email, password);
  if (!user) return null;
  const token = crypto.randomUUID();
  sessions.set(token, user.id);
  return { token, userId: user.id };
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const userId = sessions.get(header.replace('Bearer ', ''));
  if (!userId) return res.status(401).json({ error: 'Login required' });
  req.userId = userId;
  next();
}

function isMember(db, projectId, userId) {
  return !!db.prepare('SELECT 1 FROM members WHERE project_id = ? AND user_id = ?').get(projectId, userId);
}

module.exports = { login, requireAuth, isMember };
