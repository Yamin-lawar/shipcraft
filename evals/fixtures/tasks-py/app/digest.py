from datetime import datetime, timezone


def run_digest(db, send=lambda email, open_count: None):
    """Sends each member a count of their open tasks. Meant to run daily at 08:00."""
    rows = db.execute(
        "SELECT u.email AS email, COUNT(t.id) AS open_count FROM users u "
        "LEFT JOIN tasks t ON t.assignee_id = u.id AND t.status = 'open' GROUP BY u.id"
    ).fetchall()
    for row in rows:
        send(row["email"], row["open_count"])
    db.execute("INSERT INTO digest_runs (ran_at, sent_to) VALUES (?, ?)", (datetime.now(timezone.utc).isoformat(), len(rows)))
    db.commit()
    return len(rows)
