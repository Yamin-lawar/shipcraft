**Assistant:** ▶ craft-flow · resume · Checking where the work stands.

*(wrote .craft/state.md)*

**Assistant:** `.craft/state.md` was missing, so I rebuilt it from the Plan. Only the step inside Gate 2 may be uncertain. Here is where things stand.

**Assistant asked:** Continue ─────────────────────────────────────────
recurring-tasks · PRD saved 2026-10-10 · Plan saved (hard gates)
Built: Gate 1 ✓   Now: Gate 2 (Occurrence engine), step 3 of 5
Waiting on you: nothing
The PRD changed since the Plan was written (PRD updated 2026-10-10, Plan based on 2026-10-08). Review the Plan?
No branch was recorded for this Feature; you are on main.

What next?
**Developer chose:** {"Continue ─────────────────────────────────────────\nrecurring-tasks · PRD saved 2026-10-10 · Plan saved (hard gates)\nBuilt: Gate 1 ✓   Now: Gate 2 (Occurrence engine), step 3 of 5\nWaiting on you: nothing\nThe PRD changed since the Plan was written (PRD updated 2026-10-10, Plan based on 2026-10-08). Review the Plan?\nNo branch was recorded for this Feature; you are on main.\n\nWhat next?":"Continue Gate 2 of recurring-tasks, from step 2.3 (Recommended)"}

*(wrote src/jobs/recurrence.js)*

*(wrote src/jobs/recurrence.js)*

*(wrote src/jobs/recurrence.js)*

*(wrote src/jobs/recurrence.js)*

*(wrote .craft/features/recurring-tasks/plan.md)*

*(wrote .craft/state.md)*

**Assistant:** Step 2.3 is written and ticked, but I haven't run any tests. This sandbox blocked the Python and node commands I tried, so I couldn't even check that the module loads.

**Where you are:** recurring-tasks, Gate 2 of 3 (Occurrence engine). Gate 1 passed, and steps 2.1, 2.2 and 2.3 are done. Steps 2.4 (catch-up after downtime) and 2.5 (logging) are still open.

**What I did:**
- **State file:** `.craft/state.md` was missing, so I rebuilt it from the Plan.
- **Step 2.3:** `claimDue` in `src/jobs/recurrence.js` now creates the task inside the same transaction that claims the schedule. It inserts the occurrence row, then calls `createTask`, then stores the `task_id` on the occurrence.
- **No double tasks:** the unique key on schedule and date means a repeat claim creates nothing.
- **Task owner:** schedules have no owner column, so the task is created as the project's owner.
- **Bookkeeping:** I ticked 2.3 in `plan.md` and updated `state.md`.

**Two notices:**
- The PRD was updated on 2026-10-10, after the Plan's `prd_updated` of 2026-10-08. Do you want to review the Plan?
- No branch was recorded for this feature, and you're on `main`.

I'm stopping here. Say "next" to continue with step 2.4. When Gate 2 finishes, a fresh chat is a good place to continue.

Everything is saved. Say "continue" in any chat to pick this up.

**Developer:** Carry on, I'll look at the PRD and branch notices later.

*(wrote src/jobs/recurrence.js)*

*(wrote src/jobs/recurrence.js)*

*(wrote src/jobs/recurrence.js)*

*(wrote .craft/features/recurring-tasks/plan.md)*

*(wrote .craft/state.md)*

*(wrote src/jobs/recurrence.js)*

*(wrote src/jobs/recurrence.js)*

*(wrote src/jobs/recurrence.js)*

*(wrote .craft/features/recurring-tasks/plan.md)*

*(wrote .craft/state.md)*

*(wrote .craft/state.md)*

**Assistant:** Steps 2.4 and 2.5 are written and ticked in the Plan, but Gate 2 is not passed. The tests for Gate 2 don't exist yet, so I couldn't run its exit checklist. I've left the PRD and branch notices alone, as you asked.

**What I did, in `src/jobs/recurrence.js`:**
- **2.4, catch-up after downtime:** a due schedule now creates one task for each occurrence it missed in the last 7 days. Older ones are skipped, and the schedule jumps ahead to its next future date. The unique key still stops a repeat run from creating duplicates.
- **2.5, logging:** `claimDue(db, now, log = console.log)` now logs `occurrence_created` for on-time tasks and `occurrence_late` when the occurrence is more than 2 minutes old. It logs only after the transaction commits, so a rolled-back run never reports tasks that don't exist.

**Gate 2 exit:**
- **Missing tests:** `test/schedules.test.js` only has T-01 and T-02, and both pass. T-03 to T-06 haven't been written yet, so the exit checklist can't be satisfied.
- **`npm test` fails:** `test/smoke.test.js` can't load `node-cron`, which isn't installed. This was already the case before my changes. `npm install` should fix it.
- **Not run:** the new code has never been run. It is untested beyond the module loading in that failed suite.

**Next:** I'd write T-03 to T-06, run them with `npm test`, and set Gate 2 to `passed` only if they pass. `state.md` is updated to say so. A fresh chat is a good place to start that. Say "continue" there.

Everything is saved. Say "continue" in any chat to pick this up.