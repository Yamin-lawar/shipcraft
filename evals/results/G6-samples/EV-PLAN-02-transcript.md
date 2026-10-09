**Assistant:** ▶ recurring-tasks · plan · I'll read the code, then design it with you, one decision at a time. Say "you decide", "skip", "back" or "enough" anytime.

**Assistant:** No `.craft/` yet. Reading the code and the architect guide.

*(wrote .craft/features/recurring-tasks)*

**Assistant asked:** I imported your wiki spec as a PRD (.craft/features/recurring-tasks/prd.md, slug `recurring-tasks`). It has gaps: timezone, catch-up behaviour, "fast". Which depth for this Feature?
**Developer chose:** {"I imported your wiki spec as a PRD (.craft/features/recurring-tasks/prd.md, slug `recurring-tasks`). It has gaps: timezone, catch-up behaviour, \"fast\". Which depth for this Feature?":"Standard (Recommended)"}

**Assistant:** Mode: existing (Node 22 + Express + `node:sqlite`, one `node-cron` job at `src/jobs/digest.js`, `projects.timezone` column already exists).

**Assistant asked:** PRD gap 1 of 3: if the server was down for 3 days and a daily task missed 3 occurrences, what should catch-up create on restart?
**Developer chose:** {"PRD gap 1 of 3: if the server was down for 3 days and a daily task missed 3 occurrences, what should catch-up create on restart?":"One copy (Recommended)"}

**Assistant asked:** PRD gap 2 of 3: "maybe timezone stuff". Projects already have a `timezone` (Website = Europe/Berlin, Operations = America/New_York). In which timezone does "every day" roll over?
**Developer chose:** {"PRD gap 2 of 3: \"maybe timezone stuff\". Projects already have a `timezone` (Website = Europe/Berlin, Operations = America/New_York). In which timezone does \"every day\" roll over?":"Project timezone (Recommended)"}

**Assistant asked:** PRD gap 3 of 3: "should be fast" has no number. What scale should I design for?
**Developer chose:** {"PRD gap 3 of 3: \"should be fast\" has no number. What scale should I design for?":"Small: ≤1,000 rules, copy within a minute (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant:** **Readout**

It can be built as described, and the existing stack covers most of it.

- **Hard parts:**
  - Making catch-up safe. A restart or a second process must never create two copies of the same occurrence.
  - Computing "next occurrence" correctly in a project timezone, including DST and monthly on the 29th–31st.
- **Reuse:**
  - `node-cron` in `src/jobs/digest.js`, with the same `schedule(db, ...)` shape, started from `src/server.js`.
  - `isMember` in `src/auth.js`, and the 404-for-non-members convention in `task.routes.js`.
  - `projects.timezone` in `src/db.js`.
  - `createTask` in `task.service.js` for making the copy.
  - `digest_runs` as a pattern for run records.
- **New:** a repeat-rule store, a `recurrence.js` next-date function, a recurring job, a few columns or a table, and routes to set and stop a rule.
- **Not needed:** a queue, Redis or a new database. At ≤1,000 rules, one SQLite query per minute is cheap.
- **Gap to check:** `node-cron` is not catch-up aware, and its timezone behaviour is an assumption I have not verified. I would not rely on it for correctness.

**Proposed design (recommended): a polling "due rules" job**

The `recurring_rules` table holds `task_id` (the template), `freq`, `project_id`, `next_run_at` (UTC) and `active`. A cron job ticks every minute and runs one idempotent step per due rule.

1. The tick selects rules with `active=1 AND next_run_at <= now`, using an index on `next_run_at`.
2. For each rule, one transaction creates the copy via `createTask` and advances `next_run_at`.
3. The new `next_run_at` is the next occurrence after now, computed in the project timezone. This is what gives "one copy" catch-up.
4. The same tick runs once at startup, so downtime is recovered without any special code.
5. Idempotency: the advance is `UPDATE ... WHERE id=? AND next_run_at=?old`. If it changes 0 rows, another run already did it and no copy is made.

**Alternative A:** schedule one cron job per rule. Rejected: the jobs are lost on restart, there is no catch-up, and nothing is queryable.
**Alternative B:** generate copies lazily when a project's tasks are listed. It is simple, but copies would not exist until someone looks, and the "automatically" part of the spec would be missing.

Trade-off: the polling job runs every minute even when nothing is due. That is one indexed query.

**Assistant asked:** Decision 4: where does the repeat rule live?
**Developer chose:** {"Decision 4: where does the repeat rule live?":"Separate recurring_rules table (Recommended)"}

**Assistant asked:** Decision 5: what does a new copy inherit from the template task? Whichever you pick sets the due-date logic and what members see.
**Developer chose:** {"Decision 5: what does a new copy inherit from the template task? Whichever you pick sets the due-date logic and what members see.":"Title, description, assignee; due date shifted (Recommended)"}

**Assistant asked:** Decision 6: monthly rules on the 29th, 30th or 31st. What happens in a month that lacks that day?
**Developer chose:** {"Decision 6: monthly rules on the 29th, 30th or 31st. What happens in a month that lacks that day?":"Clamp to the last day (Recommended)"}

**Assistant asked:** Decision 7: who may create, change or stop a rule, and how is a rule ended? Spec says only project members.
**Developer chose:** {"Decision 7: who may create, change or stop a rule, and how is a rule ended? Spec says only project members.":"Any member; stop via DELETE or pause flag (Recommended)"}

**Assistant:** **Cross-cutting checks**

- **Failure:** a crash mid-tick is safe because the copy and the `next_run_at` advance happen in one SQLite transaction. A second process, or a rerun, is blocked by the `WHERE next_run_at = old` guard. One bad rule must not stop the others, so each rule is wrapped in try/catch and the error is logged.
- **Data:** `CREATE TABLE IF NOT EXISTS` covers the new table. `tasks.recurring_rule_id` needs `ALTER TABLE ADD COLUMN`, and `db.js` has no migration mechanism today. That is the one real schema change. The change is additive and nullable, so rollback means ignoring the column.
- **Security:** rule routes reuse `isMember` and the 404 convention. The tick never trusts a request, and the copy's project comes from the rule. I would add `UNIQUE(task_id)` so a task has at most one rule.
- **Observability:** log each tick's created, skipped and failed counts. A `recurring_runs` table like `digest_runs` is optional.
- **Rollout:** ship behind an env flag that disables the job; copies already made stay as plain tasks.
- **Timezones:** I'd compute occurrences with `Intl.DateTimeFormat` and the project timezone, with no new library. DST edge behaviour is an assumption to verify with tests.

**Design summary**

- **Problem:** members re-create weekly tasks by hand.
- **Design:** a `recurring_rules` table plus a minute-tick job, also run once at startup. Each due rule creates one copy and advances `next_run_at` in one transaction, guarded for idempotency. Next occurrences are computed in the project timezone.
- **Flow:** a member POSTs a rule on a task → `next_run_at` is computed → the tick finds it due → a copy is created via `createTask` → the next run is scheduled.
- **Decisions, with the alternative that lost:**
  - D-1 catch-up creates one copy (vs every missed one)
  - D-2 project timezone (vs UTC)
  - D-3 scale ≤1,000 rules, within 1 minute (vs a queue)
  - D-4 separate table (vs columns on `tasks`)
  - D-5 copies inherit title, description, assignee, shifted due date
  - D-6 clamp to the last day of the month (vs skip)
  - D-7 any member may create or stop a rule (vs owner only)
  - D-8 polling job (vs per-rule cron)
- **Hard parts:** double-copy prevention, timezone and DST math, month-end clamping, and the first migration in this codebase.
- **Reused:** `node-cron`, `digest.js` patterns, `isMember`, `createTask`, `projects.timezone`.
- **New:** the rules table, `recurrence.js`, `jobs/recurring.js`, rule routes, and the `recurring_rule_id` column.
- **Not done:** per-user timezones, end dates, editing a rule's schedule beyond stop and recreate, notifications, and every-missed-copy catch-up.

**Assistant asked:** Does this design summary match what you want? Say yes, or tell me what to change.
**Developer chose:** {"Does this design summary match what you want? Say yes, or tell me what to change.":"Yes, go ahead (Recommended)"}

**Assistant:** **Size: large.** It includes a schema migration (a new table and an `ALTER`) and more than one shippable piece: the rule API, then the scheduler job. That is about 8–10 files including tests.

**Assistant asked:** How should the build be gated?
**Developer chose:** {"How should the build be gated?":"Hard gates (Recommended)"}

**Assistant:** ▶ Your turn: switch to Plan mode
  How: press Shift+Tab until the mode shows "plan mode", or run `/plan`
  Then send: `plan recurring-tasks from .craft/handoff/recurring-tasks.md`
  Everything is saved, so nothing is lost if you do this in a new chat.

✔ Saved .craft/handoff/recurring-tasks.md and .craft/features/recurring-tasks/prd.md · Next: plan mode writes the Plan · Say "continue" in any new chat to pick this up. This is a good place for a fresh chat.