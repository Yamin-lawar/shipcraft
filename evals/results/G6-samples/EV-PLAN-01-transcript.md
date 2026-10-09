**Assistant:** ▶ recurring tasks · plan · I'll read the code, then design it with you, one decision at a time. Say "you decide", "skip", "back" or "enough" anytime.

*(wrote .craft/handoff/recurring-tasks.md)*

**Assistant:** I've read the PRD and the code, and the hand-off file now exists. Next is the readout and proposed design, then the first decision.

**Found:** existing mode. Node 22 with Express, `node:sqlite` and `node-cron`, tests on `node:test`. The PRD is `.craft/features/recurring-tasks/prd.md`. I wrote the hand-off file, but `project.md` and `state.md` are not written yet because a shell write was blocked.

## Readout

It can be built as the PRD describes, and it needs no new infrastructure. You already run `node-cron` in `src/jobs/digest.js`, and `projects.timezone` already exists in `src/db.js`.

**Hard parts**
- **Time:** the monthly rule on the 31st, DST in the project's timezone, and missed occurrences after downtime (AC-1.4, 4.1, 2.1).
- **Once per occurrence:** this must hold even if the job runs twice (AC-1.3).
- **Gaps between the PRD and the code:**
  - `tasks` has no `labels` column, though R-1 repeats labels.
  - There is no events or metrics store for R-7.
  - There are no project archive or delete flags for AC-6.3.
  - There is no schema migration tool, only `CREATE TABLE IF NOT EXISTS`.

**Reuse**
- `isMember` in `src/auth.js` for permissions.
- `createTask` in `src/modules/tasks/task.service.js` for creating each occurrence.
- The route and service layout under `src/modules/<name>/`.
- `node-cron` for the tick.

**New**
- A `schedules` table and an `occurrences` table, with a unique key on (schedule, due date).
- A `src/modules/schedules/` module.
- A `src/jobs/recurrence.js` job.

## Proposed design

**Recommended: a one-minute tick that claims due rows.**
1. Each schedule stores `next_run_at` in UTC. It is computed from the project's timezone, rule and time.
2. Every minute, `node-cron` runs a job that selects schedules where `next_run_at <= now` and active.
3. For each due occurrence, one transaction does three things:
   - inserts an `occurrences` row, with `UNIQUE(schedule_id, occurrence_date)`;
   - creates the task;
   - advances `next_run_at`.
4. A duplicate hits the unique key and does nothing.
5. After downtime, the job loops until `next_run_at` is in the future. That creates every missed occurrence once, marked late.

**Alternative A:** one cron entry per schedule. It is rejected: timers vanish on restart, and DST and recovery get harder.

**Alternative B:** generate occurrences ahead of time, for example 30 days. It makes skip simple. It also puts many future tasks on the board, and edits then have to rewrite them.

**Trade-off:** a tick gives up to one minute of lateness, which is fine against the PRD's 5-minute target. The database enforces the "no duplicates" rule rather than the code.

**Assistant asked:** How should occurrences be triggered? A one-minute node-cron tick that claims due schedules fits your PRD's 99% within 5 minutes and survives restarts. The cost of being wrong is a rewrite of the recovery logic.
**Developer chose:** {"How should occurrences be triggered? A one-minute node-cron tick that claims due schedules fits your PRD's 99% within 5 minutes and survives restarts. The cost of being wrong is a rewrite of the recovery logic.":"Minute tick, claim due rows (Recommended)"}

*(wrote .craft/handoff/recurring-tasks.md)*

**Assistant:** Saved as D-1. The next decision is about the PRD's gaps, starting with labels.

**Assistant asked:** The PRD repeats labels (R-1), but the tasks table in src/db.js has no labels and no label feature exists. How should we handle that? Being wrong costs a schema change later, or a promise the product cannot keep.
**Developer chose:** {"The PRD repeats labels (R-1), but the tasks table in src/db.js has no labels and no label feature exists. How should we handle that? Being wrong costs a schema change later, or a promise the product cannot keep.":"Defer labels (Recommended)"}

**Assistant:** Labels are deferred, and I'll note that as a change to the PRD. Next is R-7, the adoption and reliability events. No events store exists in the code.

**Assistant asked:** Where should the R-7 events (schedule_created, occurrence_created, occurrence_late, skipped) go? There is no analytics system in the repo. At a few thousand events a day, a table you can query answers the PRD's two metrics.
**Developer chose:** {"Where should the R-7 events (schedule_created, occurrence_created, occurrence_late, skipped) go? There is no analytics system in the repo. At a few thousand events a day, a table you can query answers the PRD's two metrics.":"A SQLite events table (Recommended)"}

**Assistant asked:** AC-6.3 says no occurrences for archived or deleted projects, but projects has no such state, and there is no delete or archive endpoint in project.routes.js. What should we do now?
**Developer chose:** {"AC-6.3 says no occurrences for archived or deleted projects, but projects has no such state, and there is no delete or archive endpoint in project.routes.js. What should we do now?":"Join on project existence, add no flag (Recommended)"}

*(wrote .craft/handoff/recurring-tasks.md)*

**Assistant:** Decisions D-2 to D-4 are saved. The next decision is how to compute times across timezones and DST, which is the hardest part of this Feature.

**Assistant asked:** How do we compute 'Monday 09:00 Europe/Berlin' as a UTC next_run_at, including DST and the 31st-of-month rule? package.json has no date library. Built-in Intl can do it, but it is easy to get subtly wrong, so the date maths would be isolated in one tested function.
**Developer chose:** {"How do we compute 'Monday 09:00 Europe/Berlin' as a UTC next_run_at, including DST and the 31st-of-month rule? package.json has no date library. Built-in Intl can do it, but it is easy to get subtly wrong, so the date maths would be isolated in one tested function.":"Built-in Intl, one tested function (Recommended)"}

**Assistant asked:** After a long outage the PRD says every missed occurrence is created once (AC-2.2). A daily schedule down for a year would create 365 tasks in one go. Should we cap catch-up?
**Developer chose:** {"After a long outage the PRD says every missed occurrence is created once (AC-2.2). A daily schedule down for a year would create 365 tasks in one go. Should we cap catch-up?":"Create all, cap at 100 per schedule per run (Recommended)"}

**Assistant:** Those two are saved: D-5 for the time maths and D-6 for the catch-up cap. Two smaller points I'm settling as safe defaults, which you can change:
- **Skip:** it inserts an `occurrences` row with status `skipped` on the same unique key. The tick then passes over that date, and AC-5.2 follows from the row already existing.
- **Limit and listing:** the 50-schedule limit is checked inside the creating transaction, and the list is paged 25 at a time.

**Cross-cutting**
- **Failure:** each occurrence is one transaction, so a crash leaves either the task and its advanced `next_run_at`, or neither. The tick runs synchronously and is not re-entered while a run is in progress.
- **Data:** only new tables are added, so rollback means ignoring them. A timezone change recomputes `next_run_at` from now (AC-4.2).
- **Security:** every route calls `isMember` and answers 404 for non-members, as the tasks routes do. The job creates tasks directly from stored fields, with no request input.
- **Scale:** one server and one process are assumed. With two instances, the unique key still prevents duplicates. The cost is wasted work, not wrong data.
- **Rollout:** a config flag to disable the tick is cheap, and I recommend it.

## Design summary
**Problem:** routine tasks are re-created by hand and forgotten.

**Design:** `schedules` and `occurrences` tables, plus an `events` table. A one-minute `node-cron` tick in `src/jobs/recurrence.js` claims due schedules. In one transaction per occurrence it inserts the occurrence (unique on schedule and date), creates the task through `createTask`, and advances `next_run_at`.

**Flow:** member sets Repeat → `next_run_at` computed in the project's timezone → tick finds it due → one occurrence and one task → the schedule advances, and missed ones loop (up to 100 per run).

**Decisions (the option that lost is in brackets):**
- D-1 minute tick (per-schedule cron, pre-generation)
- D-2 labels deferred (add labels first)
- D-3 SQLite events table (log lines, external analytics)
- D-4 skip projects that no longer exist, no archive flag (add `archived_at`)
- D-5 built-in Intl in one tested function (date library)
- D-6 catch-up capped at 100 per run (no cap)

**Hard parts:** DST and short months in one tested function; once-only creation via the unique key plus the transaction.

**Reused:** `node-cron`, `isMember`, `createTask`, `projects.timezone`, the module layout.

**New:** the three tables, the `src/modules/schedules/` module, the recurrence job, and the time function.

**Not done:** labels, archive handling, custom rules, subtasks, and new notifications.

**Assistant asked:** Is this design right? Reply yes to lock it in, or say what to change. I'd then size it as large (new tables, a new job, timezone maths, about 10 or more files) and ask how to gate it.
**Developer chose:** {"Is this design right? Reply yes to lock it in, or say what to change. I'd then size it as large (new tables, a new job, timezone maths, about 10 or more files) and ask how to gate it.":"Yes, lock it in (Recommended)"}

**Assistant:** **Size: large.** It adds new tables and a new background job, the time maths is risky, and it touches about 10 or more files.

**Assistant asked:** How should the build be gated?
**Developer chose:** {"How should the build be gated?":"Hard gates (Recommended)"}

*(wrote .craft/handoff/recurring-tasks.md)*

**Assistant:** ▶ Your turn: switch to Plan mode
  How: press Shift+Tab until the mode shows "plan mode", or approve the switch if the host asks.
  Then send: `plan recurring-tasks from .craft/handoff/recurring-tasks.md`
  Everything is saved, so nothing is lost if you do this in a new chat.

I couldn't write `.craft/project.md` or `.craft/state.md` because a shell write was blocked. The content for both is in the hand-off file under "Files held back".

✔ Saved .craft/handoff/recurring-tasks.md · Next: plan mode writes the Plan · Say "continue" in any new chat to pick this up. Everything is saved, so a fresh chat is a good place for the next step.