const test = require('node:test');
const assert = require('node:assert');
const { createDb } = require('../src/db');

test('T-01 schedules and occurrences tables exist', () => {
  const db = createDb();
  assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE name = 'schedules'").get());
  assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE name = 'occurrences'").get());
});

test('T-02 the same occurrence cannot be stored twice', () => {
  const db = createDb();
  db.prepare("INSERT INTO occurrences (schedule_id, occurrence_date) VALUES (1, '2026-10-12')").run();
  assert.throws(() => db.prepare("INSERT INTO occurrences (schedule_id, occurrence_date) VALUES (1, '2026-10-12')").run());
});
