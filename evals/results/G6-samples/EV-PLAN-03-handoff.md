---
craft_format: 1
feature: recurring-tasks
prd: .craft/features/recurring-tasks/prd.md
brief: none
mode: existing
size: small
gating: none
updated: 2026-10-09
---
# Hand-off: Recurring tasks

## Design summary
- Problem: members re-create the same task by hand every period.
- Design: `recurrences` table plus an hourly node-cron job. For each due row, one transaction inserts the task (or records a skip) and advances `next_run_date`. API: create, list, stop at `/projects/:id/recurrences`.
- Flow: member creates recurrence -> hourly job finds due rows -> checks previous occurrence is done -> inserts task or records skip -> advances date (month-end clamped).
- Not done: editing, custom rules, end dates, backfill, UI, a task-status endpoint.

## Decisions
| ID | Decision | Chosen | Alternatives | Why |
|---|---|---|---|---|
| D-1 | Trigger and dedupe | `recurrences.next_run_date` + hourly node-cron job; task insert and date advance in one transaction | cron expression per recurrence; external queue | Reuses node-cron and SQLite; state in the row survives restarts; double run is harmless |
| D-2 | Catch-up after downtime | Create one task for the latest missed date, then move next_run_date past today | skip all missed; create every missed | No flood after an outage; matches PRD no-backfill |
| D-3 | Time zones and dates | Built-in Intl for "today" in `projects.timezone`; dates as YYYY-MM-DD text; one helper for next date and month-end clamp | date library; server time | No new dependency; matches tasks.due_date text |
| D-4 | "Previous occurrence is done" | Previous task status other than 'open' counts as done | explicit done status + endpoint; drop skip rule | Matches digest's meaning of open; no new status values |
| D-5 | Link tasks to recurrences | New `recurrence_occurrences` table, UNIQUE(recurrence_id, occurrence_date), task_id, outcome (created/skipped); tasks table unchanged | ALTER tasks add recurrence_id; migration runner | No migration needed; second dedupe guard; records skips |

## Reuse
`src/jobs/digest.js` (node-cron pattern), `src/server.js` (job start), `src/db.js` (schema, `projects.timezone`), `src/auth.js` `isMember`, `src/modules/tasks/task.service.js` `createTask`, `digest_runs` as run-log pattern, `test/smoke.test.js` HTTP test helpers.

New: `src/modules/recurrences/` (routes, service), `src/jobs/recurrences.js`, a date helper, two tables in `src/db.js`, route mounting in `src/app.js`, job start in `src/server.js`, tests.

## Constraints
- PRD choices: daily/weekly/monthly; due on occurrence date; skip when previous is open (record the skip); runs until stopped; create, list, stop endpoints only.
- Non-members get 404 (same as tasks). Stop must check the recurrence belongs to the project in the URL.
- No new dependency, no change to the `tasks` table.

## Hard parts and failure handling
- Exactly once: one transaction per occurrence; next_run_date advanced in it; UNIQUE(recurrence_id, occurrence_date) as second guard. A crash leaves the date unchanged, so the next tick retries.
- Downtime: one task for the latest missed date, then jump past today (D-2).
- Time zones: "today" computed per project via Intl; month-end clamp in one helper. Assumption to check: Intl behaves as expected on the installed Node (test DST dates).
- Skips: stored as outcome 'skipped' (AC-5.1) and logged.
- Concurrency: the job must not overlap with itself; guard against a long tick.

## Numbers
- Assumed: a few hundred recurrences; one indexed query per hourly tick. Developer has not confirmed; correct in plan if far larger.
- Job interval: hourly (occurrence can appear up to an hour after local midnight).

## Files held back
none

## Open questions
- Confirm scale assumption (a few hundred recurrences).
