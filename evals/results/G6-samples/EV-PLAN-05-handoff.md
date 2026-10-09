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
Problem: teams hand-copy routine tasks; need tasks that appear on schedule, none missed, none doubled.
Design: `schedules` + `occurrences` tables in existing SQLite; per-minute node-cron job (started in src/server.js next to the digest) claims due schedules; per occurrence one transaction: insert occurrence (UNIQUE schedule_id, occurrence_date), create task, advance next_run_at. Catch-up walks forward until next_run_at is in the future, late ones marked created_late. Skip = occurrence row with status skipped written ahead.
Not done: Kafka/any broker (add later via outbox if other consumers appear), custom repeat rules, repeat-after-completion, subtasks/attachments.
Confirmed by Developer: yes. Size: large (migration, 10+ files, several shippable pieces). Gating: hard.
Suggested Gates: 1 recurrence calculator + tests; 2 tables + job + idempotency/catch-up; 3 routes, permissions, limits, skip/pause; 4 events/measurement.

## Decisions
| ID | Decision | Chosen | Alternatives | Why |
|---|---|---|---|---|
| D-1 | Trigger | Per-minute node-cron job claiming due rows from SQLite | Kafka (Developer's idea); outbox now + Kafka later; BullMQ | Scale is a few thousand/day, no other consumers; exactly-once comes from a unique key, not the transport; no new infra. Kafka can be added later via an outbox. |
| D-2 | Exactly-once | occurrences table with UNIQUE(schedule_id, occurrence_date); insert occurrence + create task + advance next_run_at in one transaction | check-then-insert in code; claimed_at lock column | DB enforces it even if code is wrong; no stuck-claim recovery |
| D-3 | Time rules | Store local rule + project IANA tz; compute next_run_at in UTC with built-in Intl; occurrence key = local date; month-end clamps; tz change recomputes from now | Luxon/date-fns-tz; UTC only | No new dependency; keeps 09:00 local across DST. DST gap (nonexistent local time) needs explicit tests. |
| D-4 | Catch-up and failures | Per schedule, walk forward one occurrence per transaction until next_run_at is in the future; late ones marked created_late; a throw rolls back that occurrence only; failure counter, auto-pause after N (assumed 5, to confirm) | latest-only (contradicts AC-2.2); one transaction per tick | One bad schedule never blocks others; satisfies AC-2.1/2.2 |

## Reuse
src/jobs/digest.js (cron pattern), src/server.js, src/db.js (projects.timezone, schema), src/auth.js isMember, task.service.js createTask

## Constraints
No brief. Non-negotiables: no new infrastructure or dependency; unique key is the exactly-once backstop; Kafka deliberately deferred.

## Hard parts and failure handling
Failed occurrence rolls back alone and retries next tick; failure counter auto-pauses a schedule after N (assumed 5, confirm). Downtime handled by catch-up. DST gap (nonexistent local time) and month-end clamp need explicit tests.

## Security and trust boundaries
Every route checks isMember (src/auth.js). Job skips deleted/archived projects (AC-6.3). Limit 50 schedules per project. Created tasks reuse existing visibility.

## Data and migrations
Two new tables via CREATE TABLE IF NOT EXISTS in src/db.js style. No backfill. Labels column missing from tasks (PRD says labels repeat): open question.

## Rollout and rollback
Env-var switch for the job to turn it off without a deploy. Rollback: disable job, drop the two tables; already-created tasks stay.

## Numbers
Max 50 schedules/project; job every minute; index on next_run_at; auto-pause after 5 failures (assumed). Real project counts unknown (assumption to check).

## Observability
Events schedule_created, occurrence_created, occurrence_late, occurrence_skipped with project id and frequency (R-7); job logs failure counts.

## Files held back
none

## Open questions
- Late-occurrence notification difference is a PRD open question for Product.
- PRD says labels repeat, but tasks has no labels column.
