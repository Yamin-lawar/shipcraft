# Reference journey: recurring tasks

The script for the smoothness run, for dogfooding, and for the examples in the README. It follows one Feature from idea to docs in a fictional task app (Node, SQLite, a daily digest job on `node-cron`, no queue). Answers below are what the simulated Developer says. The skill's questions and recommendations are expected to be close to these, not word for word.

**Setup.** Fixture `tasks-node`. Host: Claude Code, switching to Cursor at the Plan. Run once as an **added Feature** (the fixture) and once as a **new product** (the `empty` fixture, with the same idea).

## 1. `/craft-explore` (about 20 minutes, free conversation)
- Opens with the Developer's idea: "recurring tasks. Teams copy the same task every week."
- The LLM raises, unprompted: double-firing after a crash, missed runs, timezones and daylight saving, month-end dates. It cites `src/jobs/digest.ts:31` (records last run after the work).
- Techniques expected in a typical session: a story walk-through ("the job created the task, then crashed. What does Priya see on Monday?"), a pre-mortem, a comparison of "repeat from due date" versus "from completion", a code tour of the digest job.
- Developer says "wrap up". The LLM shows the brief, asks to confirm the unverified claims (the 31st fallback), offers glossary terms (Schedule, Occurrence) and suggests `/craft-prd`.
- **Expect:** `brief.md` with 3 use cases as concrete scenes, invariants I-1 to I-3, every claim tagged with its source, no question prompts.

## 2. `/craft-prd` (about 12 minutes, one question at a time)
1. Frequency? Recommended: monthly and weekly. Developer: "Other: weekly, every two weeks, monthly, daily."
2. Repeat from due date or completion? Recommended: due date. Developer: due date.
3. In a 30-day month, a rule on the 31st? Recommended: last day of the month. Developer: yes.
4. A smart idea is offered inside a question (suggest recurrence after three hand copies). Developer: later.
5. Missed runs? Recommended: create late, once. Developer: yes.
6. Timezone? Recommended: the project's. Developer: yes.
7. Who can create schedules? Recommended: project members. Developer: yes.
8. Limit per project? Recommended: 50. Developer: yes.
- A Mermaid flow for the weekly use case is shown, "does this match?" Developer corrects one branch.
- **Expect:** about 9 to 11 questions, one per prompt, a PRD in the standard format with testable ACs, assumptions shown once, a closing line.

## 3. `/craft-challenge` (optional, about 5 minutes)
- Concern 1: AC says "the member is notified" with no channel or timing, so it cannot be tested. Developer takes the recommended fix.
- Concern 2: a "rotate assignee" requirement marked P0 is a whole Feature. Recommended: move it to Ideas for later.
- Change list shown, "Apply all", edits applied with a `.history` copy of each file.

## 4. `/craft-plan` (about 25 minutes)
- Intake finds the PRD and does not ask for one.
- Groundwork: detects Node and SQLite, finds the digest job, finds no queue.
- Readout: feasible with no new infrastructure. Reuse the cron runner and task creation. The hard parts are exactly-once occurrences and timezones.
- Options: a job table claimed by the cron runner (recommended), delayed jobs on a new queue, a message log. Developer proposes the message log "because we may need events". The LLM argues for the simpler option with reasons. Developer keeps the job table.
- Decisions, one per prompt: timezone source, catch-up limit (7 days), retry behaviour, what happens in a crash mid-run.
- Size: large (a migration). Gating question: Hard gates (recommended).
- Host switch: the **Your turn** block explains how to switch to Plan mode in Cursor. The Plan is written, the Developer accepts it, and Step 0 saves it.
- **Expect:** `plan.md` with the required anchors, 4 to 5 gates each with Delivers, Tests and an Exit checklist, invariants, threats `T-n`, and a test matrix covering every AC.

## 5. Build, across chats
- A new chat per gate. "continue" shows the resume card and resumes at the recorded step, loading only that gate's section.
- After Gate 2, the Developer edits the PRD. The next resume says once: "The PRD changed since the Plan was written. Review the Plan?"

## 6. v0.2 stages (outline, detailed after v0.1)
- `/craft-secure`: finds the seeded task readable across teams (IDOR) and the CSV import with no row limit.
- `/craft-test`: one browser test per AC; a seeded bug and a spec gap appear in the report.
- `/craft-fix`: fixes findings together after one confirmation, then bugs test-first; asks about the spec gap ("a monthly rule on the 31st"), and adds the answer to the PRD under Later changes.
- `/craft-docs-eng` and `/craft-docs-product`: documents written from the code and the verified tests.

## What a person watches for in the smoothness run
Any moment of confusion, a repeated question, lost context, a missing "what's next", an unexplained manual step, or a message that does not match `ux.md`.
