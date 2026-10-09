**Assistant:** ▶ recurring tasks · plan · I'll read the code, then design it with you, one decision at a time. Say "you decide", "skip", "back" or "enough" anytime.

*(wrote .craft/features/recurring-tasks)*

*(wrote .craft/state.md)*

**Assistant asked:** I'll file this as `recurring-tasks` (.craft/features/recurring-tasks/). How deep should this Feature go?
**Developer chose:** {"I'll file this as `recurring-tasks` (.craft/features/recurring-tasks/). How deep should this Feature go?":"Express"}

**Assistant asked:** Express it is. Do you have a PRD or spec for recurring tasks to paste or attach?
**Developer chose:** {"Express it is. Do you have a PRD or spec for recurring tasks to paste or attach?":"No PRD, capture a short one (Recommended)"}

**Assistant asked:** PRD check 1 of 5: which repeat patterns should v1 support? Month-end handling (a 31st rule in a 30-day month) and the project's time zone (projects.timezone, e.g. Europe/Berlin) both depend on this.
**Developer chose:** {"PRD check 1 of 5: which repeat patterns should v1 support? Month-end handling (a 31st rule in a 30-day month) and the project's time zone (projects.timezone, e.g. Europe/Berlin) both depend on this.":"Daily, weekly, monthly (Recommended)"}

**Assistant asked:** PRD check 2 of 5: what happens to the due date on each new occurrence?
**Developer chose:** {"PRD check 2 of 5: what happens to the due date on each new occurrence?":"Due on the occurrence date (Recommended)"}

**Assistant asked:** PRD check 3 of 5: if the previous occurrence is still open when the next one is due, what happens?
**Developer chose:** {"PRD check 3 of 5: if the previous occurrence is still open when the next one is due, what happens?":"Skip until the previous is done"}

**Assistant asked:** PRD check 4 of 5: noted, skipped occurrences it is (I'll make sure a skip is recorded so it isn't silent). How does a recurrence end?
**Developer chose:** {"PRD check 4 of 5: noted, skipped occurrences it is (I'll make sure a skip is recorded so it isn't silent). How does a recurrence end?":"Runs until stopped (Recommended)"}

**Assistant asked:** PRD check 5 of 5: the app is an HTTP API only (no UI in src/). Which endpoints should v1 expose?
**Developer chose:** {"PRD check 5 of 5: the app is an HTTP API only (no UI in src/). Which endpoints should v1 expose?":"Create, list, stop (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

*(wrote .craft/project.md)*

**Assistant:** ✔ PRD saved to `.craft/features/recurring-tasks/prd.md`. Now the design.

## Readout

This can be built as the PRD describes, and no new infrastructure is needed.

**Hard parts**
1. Creating each occurrence exactly once. The scheduler is in-process, so restarts and double runs are the risk.
2. Dates in each project's own time zone (`projects.timezone`), including the month-end clamp.
3. The skip-if-previous-open rule, with the skip recorded.

**Reuse**
- `node-cron` is already started in `src/server.js` and used in `src/jobs/digest.js`.
- `src/db.js` already has SQLite and a `projects.timezone` column.
- `isMember` in `src/auth.js` handles access.
- `createTask` in `src/modules/tasks/task.service.js` can create each occurrence.
- `digest_runs` shows how a job records its runs.

**New**
- A `recurrences` table.
- A `src/modules/recurrences/` module (routes and service).
- A `src/jobs/recurrences.js` job.

**Gaps**
- `db.js` has no migrations, only `CREATE TABLE IF NOT EXISTS`, which is fine for a new table.
- There is no "done" status in the code yet. Tasks default to `open`.

## Proposed design

**Recommended: a due-date table, run by an hourly cron job.**
- `recurrences` holds `project_id, title, description, assignee_id, pattern, anchor_date, next_run_date, active, last_skipped_on`.
- An hourly `node-cron` job selects active rows where `next_run_date <= today` in the project's time zone.
- For each row, one SQLite transaction creates the task (or records a skip) and advances `next_run_date`.

Flow:
1. A member POSTs `/projects/:id/recurrences`, and the row is saved with `next_run_date`.
2. The hourly job finds the rows that are due.
3. It checks whether the previous occurrence is still open.
4. In a transaction, it inserts the task (due on the occurrence date) or records the skip.
5. It advances `next_run_date` to the next valid date, clamped for month-end.

**Alternative A: a cron expression per recurrence.** It is flexible, but it needs dynamic cron jobs, loses state on restart, and misses the clamp rules. Not recommended.

**Alternative B: an external queue or scheduler (BullMQ, cloud scheduler).** It adds infrastructure to run for what is likely a few hundred rows. Not recommended.

**Trade-off:** the hourly tick means an occurrence can appear up to an hour after local midnight. A restart makes it catch up, but the PRD says nothing is backfilled, so downtime must not create many tasks.

**Assistant asked:** Decision 1: how is 'due' tracked and how do we avoid duplicates? A stored next_run_date advanced in the same transaction as the insert is crash-safe. It also makes a double run harmless.
**Developer chose:** {"Decision 1: how is 'due' tracked and how do we avoid duplicates? A stored next_run_date advanced in the same transaction as the insert is crash-safe. It also makes a double run harmless.":"next_run_date + hourly job (Recommended)"}

*(wrote .craft/handoff/recurring-tasks.md)*

*(wrote .craft/state.md)*

**Assistant asked:** Decision 2: after downtime, a task may be several occurrences overdue. The PRD says no backfill, so what should the job do?
**Developer chose:** {"Decision 2: after downtime, a task may be several occurrences overdue. The PRD says no backfill, so what should the job do?":"Create one, then jump ahead (Recommended)"}

*(wrote .craft/handoff/recurring-tasks.md)*

**Assistant asked:** Decision 3: how do we work out 'today' in each project's time zone (Berlin, New York) and do month-end maths? Built-in Intl.DateTimeFormat handles zones and DST. I have not verified this against your Node version; the plan will test it.
**Developer chose:** {"Decision 3: how do we work out 'today' in each project's time zone (Berlin, New York) and do month-end maths? Built-in Intl.DateTimeFormat handles zones and DST. I have not verified this against your Node version; the plan will test it.":"Built-in Intl, dates as YYYY-MM-DD text (Recommended)"}

*(wrote .craft/handoff/recurring-tasks.md)*

**Assistant asked:** Decision 4: tasks have no 'done' status in the code, only the default 'open'. For the skip rule, how do we know the previous occurrence is finished? Note there is also no endpoint to change a task's status yet.
**Developer chose:** {"Decision 4: tasks have no 'done' status in the code, only the default 'open'. For the skip rule, how do we know the previous occurrence is finished? Note there is also no endpoint to change a task's status yet.":"Open means status = 'open', anything else is done (Recommended)"}

*(wrote .craft/handoff/recurring-tasks.md)*

**Assistant asked:** Decision 5: each task must link to its recurrence. `db.js` only uses CREATE TABLE IF NOT EXISTS, so adding a column to `tasks` will not apply to an existing database file. How do we store the link?
**Developer chose:** {"Decision 5: each task must link to its recurrence. `db.js` only uses CREATE TABLE IF NOT EXISTS, so adding a column to `tasks` will not apply to an existing database file. How do we store the link?":"New occurrences table, tasks untouched (Recommended)"}

*(wrote .craft/handoff/recurring-tasks.md)*

**Assistant:** **Cross-cutting checks**
- **Failure:** each occurrence runs in one transaction. A crash leaves `next_run_date` unchanged, so the next tick retries. The UNIQUE key makes a double run harmless.
- **Data:** only new tables, so there is no change to existing data. `CREATE TABLE IF NOT EXISTS` is enough.
- **Security:** `isMember` on every endpoint, 404 for non-members. A stop checks that the recurrence belongs to the project in the URL. Title length is capped like tasks.
- **Observability:** each tick logs how many occurrences were created and skipped. The skip is also stored in `recurrence_occurrences`.
- **Scale:** I assumed a few hundred recurrences, so one indexed query per hour is trivial. Tell me if it is far more.
- **Rollback:** stop starting the job and no tasks are created. The tables are inert.

## Design summary

- **Problem:** members re-create the same task by hand every period.
- **Design:** a `recurrences` table plus an hourly `node-cron` job. For each due row, one transaction inserts the task (or records a skip) and advances `next_run_date`. API: create, list and stop at `/projects/:id/recurrences`.
- **Flow:** member creates a recurrence → the hourly job finds due rows → it checks that the previous occurrence is done → insert the task or record the skip → advance the date.
- **Decisions (the alternative that lost):**
  - D-1 `next_run_date` plus hourly job (cron per recurrence, external queue).
  - D-2 create one task after downtime, then jump ahead (skip all, backfill all).
  - D-3 built-in Intl with date text (date library, server time).
  - D-4 open means `status='open'` (new done status, no skip rule).
  - D-5 new `recurrence_occurrences` table, `tasks` untouched (ALTER `tasks`, migration runner).
- **Hard parts:** once-only creation, project time zones with the month-end clamp, and recording skips.
- **Reuse:** `node-cron` and `src/jobs/digest.js`, `src/db.js`, `isMember`, `createTask`.
- **New:** `src/modules/recurrences/` (routes and service), `src/jobs/recurrences.js`, a date helper, two tables, tests.
- **Not done:** editing, custom rules, end dates, backfill, UI, a task-status endpoint.

**Assistant asked:** Does this design summary match what you want? Say yes, or tell me what to change.
**Developer chose:** {"Does this design summary match what you want? Say yes, or tell me what to change.":"Yes, go ahead (Recommended)"}

**Assistant:** Size: **small**. It touches about 8 files, adds only new tables, adds no dependency or infrastructure, and has one shippable piece.

**Assistant asked:** How should the build be gated?
**Developer chose:** {"How should the build be gated?":"No gates (Recommended)"}

*(wrote .craft/handoff/recurring-tasks.md)*

*(wrote .craft/state.md)*

**Assistant:** ▶ Your turn: switch to Plan mode
  How:  Claude Code: press Shift+Tab until the mode shows "plan mode", and approve the switch if asked.
  Then send:  plan recurring-tasks from .craft/handoff/recurring-tasks.md
  Everything is saved, so nothing is lost if you do this in a new chat.

✔ Saved .craft/handoff/recurring-tasks.md · Next: plan mode writes the Plan · Say "continue" in any new chat to pick this up. A fresh chat is a good place to start the plan.