const cron = require('node-cron');

// Sends each member a count of their open tasks. Runs daily at 08:00 server time.
function runDigest(db, send = () => {}) {
  const rows = db.prepare("SELECT u.email, COUNT(t.id) AS open FROM users u LEFT JOIN tasks t ON t.assignee_id = u.id AND t.status = 'open' GROUP BY u.id").all();
  for (const row of rows) send(row.email, row.open);
  db.prepare('INSERT INTO digest_runs (ran_at, sent_to) VALUES (?, ?)').run(new Date().toISOString(), rows.length);
  return rows.length;
}

function scheduleDigest(db, send) {
  return cron.schedule('0 8 * * *', () => runDigest(db, send));
}

module.exports = { runDigest, scheduleDigest };
