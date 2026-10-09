---
craft_format: 1
feature: recurring-tasks
prd: .craft/features/recurring-tasks/prd.md
brief: none
mode: existing
size: large
gating: hard
updated: 2026-10-09
---
# Hand-off: Recurring tasks

## Design summary
Problem: routine tasks are re-created by hand and forgotten.
Design: new `schedules`, `occurrences` and `events` tables. A one-minute node-cron tick (`src/jobs/recurrence.js`) claims schedules with `next_run_at <= now`. Per occurrence, one transaction inserts the occurrence (UNIQUE schedule_id + occurrence_date), creates the task via `createTask`, and advances `next_run_at`. Missed occurrences loop (cap 100 per schedule per run) and are marked late. `next_run_at` is UTC, computed from the project's timezone by one tested Intl-based function.
Flow: member sets Repeat -> next_run_at computed -> tick finds it due -> occurrence + task -> schedule advances.
Not done: labels, archive handling, custom rules, subtasks, new notifications.

## Decisions
| ID | Decision | Chosen | Alternatives | Why |
|---|---|---|---|---|
| D-1 | Trigger | One-minute node-cron tick claims due rows | Pre-generate ahead; per-schedule cron | Reuses node-cron (src/jobs/digest.js), survives restarts, fits the 5-minute target |
| D-2 | Labels | Deferred; repeat title, description, assignee | Add labels first; labels on schedule only | tasks has no labels column. Amend PRD R-1 |
| D-3 | Events (R-7) | SQLite events table, same transaction as the change | Log lines; external analytics | Few thousand events/day; no new dependency |
| D-4 | Archive/delete (AC-6.3) | Job skips schedules whose project row is gone; no flag | Add archived_at; drop AC-6.3 | No archive feature exists. Archive half waits |
| D-5 | Time maths | Built-in Intl in one tested function | Date library; compare local time each tick | No new dependency. Assumption to verify: Node 22 Intl behaviour for DST gaps and overlaps |
| D-6 | Catch-up | Create all, cap 100 per schedule per run | No cap; latest only | Honors AC-2.2, stops runaway floods |
| D-7 | Skip (safe default) | occurrences row with status 'skipped' on the same unique key | n/a | AC-5.1 and AC-5.2 follow from the row |
| D-8 | Limits (safe default) | 50-schedule limit checked inside the creating transaction; list paged 25, newest first | n/a | AC-6.2, AC-6.4 |

## Reuse
`node-cron` (src/jobs/digest.js, wired in src/server.js), `isMember` (src/auth.js), `createTask` (src/modules/tasks/task.service.js), `projects.timezone` (src/db.js), module layout src/modules/<name>/{routes,service}.js, test helpers in test/smoke.test.js.

## Constraints
- Exactly one task per occurrence, enforced by a unique key (AC-1.3).
- No missed occurrence is lost or doubled (R-2).
- Only project members manage schedules; non-members get 404 (R-6).
- Created tasks follow the original task's visibility.
- A config flag can disable the tick (rollout and rollback).

## Hard parts and failure handling
- Crash mid-run: one transaction per occurrence, so either task and advanced next_run_at, or neither.
- Double run or two instances: the unique key makes the retry a no-op.
- DST, short months and timezone change: isolated function with tests for gaps, overlaps, the 31st (AC-1.4, 4.1, 4.2).
- Long outage: loop with the 100 cap; remaining occurrences continue on later ticks.

## Numbers
Tick every 1 minute. Target: 99% of occurrences created within 5 minutes. Limit 50 schedules per project. List page size 25. Catch-up cap 100 per schedule per run. About a few thousand events per day.

## Files held back
`.craft/project.md` and `.craft/state.md`: a shell write was blocked. Content to write: stack (Node 22, Express 4, node:sqlite, node-cron 3, node:test), conventions (services take db first and return null for non-members, throw for validation), infrastructure (node-cron only; no queue, events, flags or migrations).

## Gate suggestion
Gate 1: tables, time function with tests. Gate 2: tick job, claiming, catch-up, idempotency. Gate 3: routes, permissions, limits, skip, pause, events, PRD amendment (labels).

## Open questions
- PRD says "Created late" keeps the original due date; the open question on a different late notification is still with Product.
