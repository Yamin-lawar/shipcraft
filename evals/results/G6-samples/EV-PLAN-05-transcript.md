**Assistant:** ▶ recurring tasks · plan · I'll read the code, then design it with you, one decision at a time. Say "you decide", "skip", "back" or "enough" anytime.

*(wrote .craft/features)*

*(wrote .craft/project.md)*

**Assistant:** Existing mode: Node 22, Express, `node:sqlite` and `node-cron`. I found the PRD at `.craft/features/recurring-tasks/prd.md` and read it. There is no brief.

## Readout

**Can it be built as the PRD describes?** Yes. Nothing in it forces new infrastructure.

**Hard parts**
- **Exactly once (AC-1.3).** A restart or a double trigger must not create two tasks for one occurrence.
- **Catch-up (AC-2.1, AC-2.2).** After an outage, each missed occurrence is created once and marked late.
- **Time rules (AC-1.4, AC-4.1, AC-4.2).** Monthly on the 31st clamps to the last day of the month. 09:00 stays local time across DST. A project timezone change must not skip or double an occurrence.

**What already exists**
- `projects.timezone` (`src/db.js`) holds the project timezone.
- `isMember` (`src/auth.js`) covers the permission rule.
- `createTask` (`src/modules/tasks/task.service.js`) creates the task.
- `src/jobs/digest.js` is the pattern for a `node-cron` job, started from `src/server.js`.
- `node:sqlite` gives us transactions and unique constraints.

**What is new**
- A `schedules` table.
- An `occurrences` table with a unique key on `(schedule_id, occurrence_date)`.
- A schedule service and its routes.
- A job that runs every minute.

**Gap in the PRD:** the `tasks` table has no labels column, but R-1 says labels repeat. Labels do not exist yet in this codebase, so I'll raise it as an open question. This is not a design blocker.

## Proposed design

**Recommended: a per-minute `node-cron` job that claims due rows from SQLite. No Kafka.**

1. A member creates a schedule. The service stores the template fields, the frequency and the timezone, and computes `next_run_at` in UTC.
2. Every minute the job runs one transaction:
   - Select schedules where `next_run_at <= now` and they are not paused.
   - For each due occurrence, insert an `occurrences` row. The unique key `(schedule_id, occurrence_date)` makes a second attempt a no-op.
   - Create the task through the `createTask` logic.
   - Advance `next_run_at` to the next occurrence.
3. After downtime, the same loop walks forward one occurrence at a time until `next_run_at` is in the future. Anything past its time is marked `created_late`.
4. Skip is an `occurrences` row with status `skipped`, written before the time arrives. The job then finds the occurrence already present and does nothing.

**Alternative A: Kafka.** This is your proposal, and I'd advise against it for now (see below).
**Alternative B: a job table plus a queue (BullMQ or similar).** This adds Redis to run, and it still needs the same unique key.

**Why not Kafka now.** What we need is "wake up at a time, create one row, exactly once".
- Kafka is an ordered log for many independent consumers, replay and very high volume. A schedule firing a few thousand times a day does not need any of that.
- It would not give us exactly-once. That comes from the unique key in the database, which we need either way.
- It would add a broker to run, a producer and consumer to build, and a second place to keep the schedule state (SQLite stays the source of truth).
- Kafka does not know when a schedule is due. Something still has to watch the clock and publish events, which is the job I'm proposing anyway.
- It is not a one-way door. If other teams later need to react to `occurrence_created`, we publish that event from the same transaction (an outbox) and add Kafka then, with no rework.

I'm assuming the scale is modest, since the PRD caps a project at 50 schedules. I'll ask you for the real numbers next, because they decide this.

**Assistant asked:** Decision 1: What drives the creation of occurrences? (Kafka is your idea, so tell me if there's a need I haven't seen, such as other services consuming these events.)
**Developer chose:** {"Decision 1: What drives the creation of occurrences? (Kafka is your idea, so tell me if there's a need I haven't seen, such as other services consuming these events.)":"Per-minute cron claiming due rows (Recommended)"}

*(wrote .craft/handoff)*

**Assistant asked:** Decision 2: How do we guarantee one task per occurrence, even after a restart or two overlapping runs?
**Developer chose:** {"Decision 2: How do we guarantee one task per occurrence, even after a restart or two overlapping runs?":"Unique key + one transaction (Recommended)"}

**Assistant asked:** Decision 3: How do we store and compute occurrence times across timezones, DST, short months and project timezone changes?
**Developer chose:** {"Decision 3: How do we store and compute occurrence times across timezones, DST, short months and project timezone changes?":"Store local rule + compute next_run_at in UTC with Intl (Recommended)"}

**Assistant:** D-3 is saved.

Decision 4 is what happens after an outage, and when a single task fails to create. It covers R-2 and the failure handling.

**Assistant asked:** Decision 4: After downtime, how does the job catch up, and what happens if creating one occurrence throws?
**Developer chose:** {"Decision 4: After downtime, how does the job catch up, and what happens if creating one occurrence throws?":"Walk forward per schedule, one transaction per occurrence (Recommended)"}

**Assistant:** D-4 is saved. I have what I need for the design summary.

## Design summary

**Problem:** teams re-create routine tasks by hand. They need tasks that appear on schedule, with none missed and none doubled.

**Design:** a `schedules` table and an `occurrences` table in the existing SQLite database. A per-minute `node-cron` job, started next to the digest in `src/server.js`, claims due schedules and creates the tasks.

**Main flow**
1. A member creates a schedule through the routes, checked with `isMember`. The service stores the local rule and the project timezone, and computes `next_run_at` in UTC.
2. Each tick, for each due schedule, one transaction per occurrence: insert the occurrence row (unique on `schedule_id, occurrence_date`), create the task, advance `next_run_at`.
3. The loop repeats until `next_run_at` is in the future. Occurrences that were already overdue are marked `created_late`.

**Decisions and the alternative that lost**
- **D-1 Trigger:** per-minute cron claiming rows. Kafka lost, and an outbox can add it later.
- **D-2 Exactly-once:** unique key plus one transaction. Check-then-insert in code lost.
- **D-3 Time:** local rule plus IANA timezone, computed with built-in `Intl`. A date library lost.
- **D-4 Catch-up:** one occurrence per transaction, with auto-pause after repeated failures. Creating only the latest missed occurrence lost, because it breaks AC-2.2.

**Cross-cutting checks**
- **Failure and recovery:** a failed occurrence rolls back alone and retries on the next tick. After N failures the schedule pauses. If the process is down, catch-up covers it on restart.
- **Data and migrations:** two new tables with `CREATE TABLE IF NOT EXISTS`, the same style as `src/db.js`. Nothing is backfilled. The labels column doesn't exist, so it's an open question.
- **Security:**
  - Every route checks `isMember`.
  - The job skips deleted or archived projects (AC-6.3).
  - The limit of 50 schedules per project is enforced on create.
  - Created tasks reuse existing visibility.
- **Observability:** events `schedule_created`, `occurrence_created`, `occurrence_late` and `occurrence_skipped`, each with project id and frequency (R-7). These are written to a log, or to an events table if you have one. The job also logs its failure counts.
- **Scale:** at most 50 schedules per project. A minute scan with an index on `next_run_at` is trivial in SQLite. This is an assumption until you give real project counts.
- **Cost:** no new service and no new dependency.
- **Rollout and rollback:** I'd put the job behind an environment-variable switch so you can turn it off without a deploy. Dropping the two tables undoes the schema, and tasks already created stay.

**Reused:** `digest.js` pattern, `projects.timezone`, `isMember`, `createTask`, `node:sqlite`.
**New:** two tables, a schedule service and routes, a due-schedule job, and a small recurrence calculator.
**Not done:** Kafka and any broker, custom repeat rules, repeat-after-completion, copying subtasks and attachments.

Size: **large**. It adds a schema migration, covers more than one shippable piece (the calculator, the job, the routes), and will touch about 10 or more files.

**Assistant asked:** Is this design summary right? Say yes, or tell me what to correct. Also, how should the work be gated? I recommend hard gates since it's large.
**Developer chose:** {"Is this design summary right? Say yes, or tell me what to correct. Also, how should the work be gated? I recommend hard gates since it's large.":"Yes, hard gates (Recommended)"}

*(wrote .craft/handoff/recurring-tasks.md)*

**Assistant:** **Your turn**
Switch to plan mode (Shift+Tab, or `/plan`), then send:

`plan recurring-tasks from .craft/handoff/recurring-tasks.md`

Plan mode writes the Plan. I don't.

This is a good place to start a fresh chat. The hand-off file has everything.

✔ Saved .craft/handoff/recurring-tasks.md · Next: plan mode writes the Plan · Say "continue" in any new chat to pick this up.