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
Problem: members re-create weekly tasks by hand. Design: recurring_rules table + minute-tick node-cron job (also run at startup). Each due rule creates one copy via createTask and advances next_run_at in one SQLite transaction, guarded by WHERE next_run_at=old for idempotency. Next occurrence computed in projects.timezone with Intl, month-end clamped. Routes reuse isMember (404 for non-members). Not done: per-user timezone, end dates, schedule editing, notifications, every-missed catch-up.
Gates (hard): 1 schema+migration+recurrence.js; 2 rule routes (create/stop, member-only); 3 jobs/recurring.js + startup catch-up + wiring in server.js behind env flag.

## Decisions
| ID | Decision | Chosen | Alternatives | Why |
|---|---|---|---|---|
| D-1 | Catch-up after downtime | One copy (latest missed) | every missed; capped | avoids duplicate floods |
| D-2 | Timezone | Project timezone (projects.timezone) | UTC; per-user | column exists |
| D-3 | Scale | <=1,000 rules, copy within 1 min | 50k; 1M | fits SQLite + cron |
| D-4 | Rule storage | Separate recurring_rules table (task_id template, freq, project_id, next_run_at UTC, active); copies carry tasks.recurring_rule_id | columns on tasks; JSON | queryable by next_run_at |
| D-5 | Copy fields | title, description, assignee (cleared if no longer member), due date shifted by template gap, status open | title only; exact due date | useful without rework |
| D-6 | Month end | Clamp to last day, anchored on original day | skip month; forbid 29-31 | predictable |
| D-7 | Access | Any member creates/stops; non-member 404; stop via DELETE or active=0 | owner only; creator or owner | matches createTask |
| D-8 | Trigger | Minute-tick polling job + run at startup; per-rule transactional advance guarded by WHERE next_run_at=old (idempotent) | per-rule cron; lazy on list | catch-up for free |

## Reuse
src/jobs/digest.js (node-cron pattern), src/auth.js isMember, src/modules/tasks/task.service.js createTask, src/db.js projects.timezone, test/smoke.test.js helpers.

## Constraints
Only project members; one copy on catch-up; no duplicates on restart or two processes; project timezone; no new infrastructure.

## Hard parts and failure handling
Double-copy: transaction + guarded UPDATE. Bad rule: try/catch per rule, log, continue. Migration: db.js has none; ALTER TABLE ADD COLUMN guarded by PRAGMA table_info check. DST/month-end: unit tests (assumption to verify). Assignee no longer a member: clear. Rollback: env flag disables job; copies remain plain tasks.

## Numbers
<=1,000 rules; tick every 1 minute; index on next_run_at; UNIQUE(task_id).

## Files held back
none

## Open questions
Rule input shape (freq plus weekday/day-of-month) to be settled in the Plan; node-cron timezone support unverified (design does not depend on it).
