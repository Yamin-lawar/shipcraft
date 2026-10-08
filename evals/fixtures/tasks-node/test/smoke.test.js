const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');
const { runDigest } = require('../src/jobs/digest');

async function start() {
  const { app, db } = createApp();
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const api = async (path, { method = 'GET', body, token, raw } = {}) => {
    const res = await fetch(base + path, { method, headers: { ...(raw ? {} : { 'content-type': 'application/json' }), ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: raw ? raw : body ? JSON.stringify(body) : undefined });
    return { status: res.status, json: await res.json().catch(() => null) };
  };
  return { db, api, close: () => server.close() };
}
const login = async (api, email) => (await api('/login', { method: 'POST', body: { email, password: 'password1' } })).json.token;

test('login, list projects and create a task', async () => {
  const { api, close } = await start();
  const token = await login(api, 'alice@example.com');
  assert.equal((await api('/projects', { token })).json.length, 1);
  const made = await api('/projects/1/tasks', { method: 'POST', token, body: { title: 'Plan sprint' } });
  assert.equal(made.status, 201);
  assert.equal((await api('/projects/1/tasks', { token })).json.length, 2);
  close();
});

test('a non-member cannot list or create tasks', async () => {
  const { api, close } = await start();
  const bob = await login(api, 'bob@example.com');
  assert.equal((await api('/projects/1/tasks', { token: bob })).status, 404);
  assert.equal((await api('/projects/1/tasks', { method: 'POST', token: bob, body: { title: 'x' } })).status, 404);
  close();
});

test('invites validate the email', async () => {
  const { api, close } = await start();
  const token = await login(api, 'alice@example.com');
  assert.equal((await api('/projects/1/invites', { method: 'POST', token, body: { email: 'nope' } })).status, 400);
  assert.equal((await api('/projects/1/invites', { method: 'POST', token, body: { email: 'new@example.com' } })).status, 201);
  close();
});

test('CSV import creates tasks', async () => {
  const { api, close } = await start();
  const token = await login(api, 'alice@example.com');
  const out = await api('/projects/1/import', { method: 'POST', token, raw: 'title,due\nA,2026-10-20\nB,2026-10-21' });
  assert.equal(out.json.imported, 2);
  close();
});

test('the digest job records a run', async () => {
  const { db, close } = await start();
  assert.equal(runDigest(db), 2);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM digest_runs').get().n, 1);
  close();
});
