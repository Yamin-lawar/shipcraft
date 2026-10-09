// Gate 2: the occurrence engine (steps 2.1 and 2.2 done; 2.3 to 2.5 still to do)

const DAY_MS = 24 * 60 * 60 * 1000;

// 2.1: next occurrence date for daily, weekly, biweekly and monthly schedules.
// A monthly rule on the 29th to 31st clamps to the last day of shorter months.
function nextOccurrence(schedule, fromDate) {
  const d = new Date(fromDate);
  if (schedule.frequency === 'daily') return new Date(d.getTime() + DAY_MS);
  if (schedule.frequency === 'weekly') return new Date(d.getTime() + 7 * DAY_MS);
  if (schedule.frequency === 'biweekly') return new Date(d.getTime() + 14 * DAY_MS);
  if (schedule.frequency === 'monthly') {
    const day = schedule.day_of_month;
    const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    return new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, last)));
  }
  throw new Error(`Unknown frequency: ${schedule.frequency}`);
}

// 2.2: claim the schedules that are due, inside one transaction, and move each one forward.
function claimDue(db, now) {
  db.exec('BEGIN');
  try {
    const due = db.prepare('SELECT * FROM schedules WHERE active = 1 AND next_run_at <= ?').all(now.toISOString());
    for (const s of due) {
      const next = nextOccurrence(s, s.next_run_at);
      db.prepare('UPDATE schedules SET next_run_at = ? WHERE id = ? AND next_run_at = ?').run(next.toISOString(), s.id, s.next_run_at);
    }
    db.exec('COMMIT');
    return due;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

module.exports = { nextOccurrence, claimDue };
