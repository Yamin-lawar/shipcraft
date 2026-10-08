<!-- Baseline: the plan plain plan mode wrote for 'recurring tasks' on tasks-node, with no Shipcraft skills. Kept so later head-to-heads compare against the same text. -->

# Plan: Recurring tasks (daily / weekly / every 2 weeks / monthly)

## Context
Tasks are currently one-off rows. Users want a task to repeat on a fixed cadence, with new occurrences created automatically. The codebase is a small Express + `node:sqlite` + `node-cron` app (no ORM, CommonJS, tests in `test/smoke.test.js` using `node:test`).

Findings that shape the design:
- **There is no "complete task" or "update task" endpoint.** `tasks.status` is always `'open'`. So "create the next one when this is completed" is not possible without building a new feature. Occurrences are therefore generated **on a schedule by a cron job**, driven by due dates. This matches the existing `src/jobs/digest.js` pattern (`runX(db, ...)` + `scheduleX(db)`).
- `projects.timezone` exists but the digest ignores it. "Is this occurrence due yet?" should be evaluated in the **project's timezone**.
- `db.js` uses `CREATE TABLE IF NOT EXISTS` and the server runs on `:memory:` by default; there is no migration framework.

## Design

### Data model (`src/db.js`)
New table, one row per recurring series:
```sql
CREATE TABLE IF NOT EXISTS recurrences (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assignee_id INTEGER,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily','weekly','biweekly','monthly')),
  anchor_date TEXT NOT NULL,      -- YYYY-MM-DD, due date of occurrence #0
  occurrences INTEGER NOT NULL DEFAULT 1,  -- how many have been generated (next index = this value)
  active INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```
Add to `tasks`: `recurrence_id INTEGER` (nullable), plus
`CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_recurrence_due ON tasks(recurrence_id, due_date) WHERE recurrence_id IS NOT NULL;`
→ the unique index makes generation **idempotent** (double cron fire, restart, two instances can't create duplicates).
For already-existing DB files, add a guarded `ALTER TABLE tasks ADD COLUMN recurrence_id` (check `PRAGMA table_info(tasks)` first).

Why store `anchor_date` + a counter instead of "next_due": next due = `addInterval(anchor, frequency, occurrences)`. Computing from the anchor avoids **monthly drift** (Jan 31 → Feb 28 → Mar 31, not Mar 28).

### Date logic (new `src/modules/tasks/recurrence.js`)
Pure functions, no DB, easy to unit test. Use UTC date math on `YYYY-MM-DD` strings only (never local `Date` parsing).
- `FREQUENCIES = ['daily','weekly','biweekly','monthly']`
- `occurrenceDate(anchor, frequency, n)` → daily `+n` days, weekly `+7n`, biweekly `+14n`, monthly `+n` months with day clamped to the month's last day.
- `todayIn(timezone, now = new Date())` → `YYYY-MM-DD` via `Intl.DateTimeFormat('en-CA', { timeZone })`. Injectable `now` for tests.
- `isValidDate(str)` (strict round-trip check).

### Service (`src/modules/tasks/task.service.js`)
- Extend `createTask(db, projectId, userId, input)`: if `input.recurrence` is present,
  - validate `frequency` is in `FREQUENCIES` and `due_date` is a valid date (required for recurring tasks → throw `Error` caught by existing 400 handler),
  - in one transaction (`BEGIN/COMMIT`): insert the `recurrences` row (`occurrences = 1`) and insert the first task with `recurrence_id` set; return the task (include `recurrence_id`).
- `listRecurrences(db, projectId, userId)` and `stopRecurrence(db, recurrenceId, userId)` (membership check via existing `isMember`; sets `active = 0`; already-created tasks are kept).
- `generateDueOccurrences(db, now = new Date())` (in a new `src/jobs/recurrence.js`, below).

### Job (`src/jobs/recurrence.js`, mirrors `digest.js`)
```
runRecurrence(db, now = new Date()) -> number of tasks created
scheduleRecurrence(db) -> cron.schedule('5 0 * * *', ...)   // shortly after midnight server time
```
Algorithm per active series (join `projects` for `timezone`):
1. `today = todayIn(project.timezone, now)`.
2. Loop: `next = occurrenceDate(anchor, frequency, occurrences)`; while `next <= today` (catch-up after downtime), `INSERT OR IGNORE` a task copying title/description/assignee with `due_date = next`, `recurrence_id`; `occurrences += 1`. Cap at e.g. 366 iterations per series per run as a safety net.
3. Wrap each series in a transaction so counter and inserts stay consistent.

Because cron is server-time but series are per project timezone, run the job **hourly** (`'5 * * * *'`) instead of daily. It's idempotent, so extra runs are harmless, and each project gets its occurrence shortly after its own midnight. (Decision: hourly.)

Register in `src/server.js` next to `scheduleDigest`.

### API (`src/modules/tasks/task.routes.js`)
- `POST /projects/:id/tasks` — now accepts `{ title, due_date, recurrence: { frequency: 'daily'|'weekly'|'biweekly'|'monthly' } }`. Response is the first task (201).
- `GET /projects/:id/recurrences` — list series (404 for non-members, same convention as the rest).
- `DELETE /recurrences/:id` — stop a series (404 if not found / not a member; 204 on success).
- Task JSON includes `recurrence_id` automatically via `SELECT *`.

## Files to change
| File | Change |
|---|---|
| `src/db.js` | `recurrences` table, `tasks.recurrence_id`, unique index, guarded ALTER |
| `src/modules/tasks/recurrence.js` (new) | pure date helpers |
| `src/modules/tasks/task.service.js` | recurring branch in `createTask`, list/stop functions |
| `src/modules/tasks/task.routes.js` | new routes |
| `src/jobs/recurrence.js` (new) | `runRecurrence`, `scheduleRecurrence` |
| `src/server.js` | schedule the job |
| `test/recurrence.test.js` (new) | tests below |
| `README.md` | document the feature / API |

Reuse: `isMember` (`src/auth.js`), the `runX` / `scheduleX` split from `src/jobs/digest.js`, the test harness (`start`, `login`) from `test/smoke.test.js` (copy or extract into `test/helpers.js`).

## Implementation order
1. `recurrence.js` helpers + unit tests (fastest feedback; the date math is the riskiest part).
2. Schema changes in `db.js`.
3. `createTask` recurring branch + validation + tests.
4. `runRecurrence` job + tests with injected `now`.
5. Routes (list/stop) + server wiring.
6. README.

## Edge cases to cover
- Monthly from the 29th/30th/31st (clamping, and no drift after February); leap years.
- Catch-up: server down for 3 days → 3 daily occurrences created on next run, no duplicates on a second run.
- Running the job twice at the same instant → no duplicates (unique index).
- Stopped series generate nothing; existing tasks remain.
- Timezone: with `now = 2026-10-08T23:30Z`, Europe/Berlin is already `2026-10-09`, America/New_York is still `2026-10-08`.
- Non-member cannot create/list/stop (404). Invalid frequency or missing/invalid `due_date` → 400.
- Non-recurring task creation and CSV import behave exactly as before.

## Verification
- `npm test` — existing 5 smoke tests still pass, plus the new `test/recurrence.test.js`:
  - unit: `occurrenceDate` for all four frequencies, month-end clamping, `todayIn` timezones;
  - integration: POST recurring task → 201 with `recurrence_id`; `runRecurrence(db, fixedNow)` creates the expected rows and `due_date`s; second run creates none; DELETE stops further generation.
- Manual: `npm start`, log in as alice (`password1`), `POST /projects/1/tasks` with a daily recurrence and a due date in the past, trigger `runRecurrence` from a node REPL (or temporarily lower the cron interval), then `GET /projects/1/tasks`.

## Assumptions / out of scope (say so if you want any of these changed)
- Occurrences are created on a schedule regardless of whether the previous one is finished (no completion flow exists). No "skip if previous still open" rule.
- Editing a series (changing frequency/title) is not included; stop and recreate.
- No end date / max count and no weekday-specific rules ("every Mon and Wed").
- No UI exists in this repo; API only.
