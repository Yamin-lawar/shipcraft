---
craft_format: 1
feature: recurring-tasks
updated: 2026-10-09
---
# Brief: Recurring tasks

## The feature in one paragraph
Teams using the task app copy the same task by hand every week. The Developer wants tasks that recur automatically on a fixed schedule, without ever stacking duplicates, so teams can see when they have fallen behind. (developer) Success criteria were not discussed.

## Context map
Domain ●○○○ · End users ●●○○ · Use cases ●●○○ · Feature ●●○○ · Risks and security ●○○○

## 1. Domain
### How it works in the real world
Teams run weekly routines such as a weekly report. Each project has its own timezone, so "Monday" means a different moment per team. (developer; code (src/db.js:7,22))
### Key concepts
- Series: one recurring task definition. Occurrence: one task created from it.
- Overdue: an open task past its due date (how it is stored is undecided).
### Rules and regulations
None identified. Daylight-saving behaviour is a technical risk, not a legal one.
### How others do it
Not researched.

## 2. End users
| Who | Goal | Today (workaround, pain) | Context | Source |
|---|---|---|---|---|
| Teams (project members) | Same task every week without retyping | Copy last week's task, do it or forget it, duplicate again; many copies likely end up half-done (inferred from the feedback board, not measured) | weekly cadence | developer |

## 3. Use cases
### U-1 Monday with last week's report still open
- The scene: "Write weekly report" recurs every Monday. Last week's copy is still open. On Monday the app creates no new task. The old one shows as overdue and stays the only copy. (developer)
- Likely the most common case (feedback board, unverified). Critical, because the digest's open count must stay correct.
- What could go wrong: overdue is stored differently from how the digest counts it; the run fires twice.
### U-2 Finishing the late report on Thursday
- The scene: the team completes the overdue report on Thursday. Nothing new appears until the next scheduled Monday. (developer)
- What could go wrong: a team a week behind may find the gap confusing. Not discussed further.
### U-3 New York team's Monday
- The scene: a New York project's series runs on New York Monday, not the server's Monday. (developer)
- What could go wrong: daylight-saving gaps or repeated hours cause a skipped or doubled run (unverified).

## 4. The feature
### Boundaries
Not discussed in depth. Leaning: no creation on completion, no stacking.
### Ideas raised
Overdue as a stored status versus computed from `due_date` (open and past due). Not chosen.
### Success looks like
Not discussed.

## 5. Invariants
| ID | Rule that must always hold | Source |
|---|---|---|
| I-1 | A recurring series never has more than one open task at a time; a due recurrence never stacks a second copy. | developer |
| I-2 | When a recurrence is due and the previous task is still open, that task is shown as overdue so the team sees they fell behind. | developer |
| I-3 | Occurrences follow the fixed schedule (e.g. every Monday), never the completion time of the previous one. | developer |
| I-4 | Each project's schedule follows that project's own timezone: a New York Monday starts on New York Monday. | developer |

## 6. Security and abuse
All of this is `llm (unverified)` and was raised, not discussed:
- A background run has no acting user, so the membership check in `createTask` cannot protect it (code (src/modules/tasks/task.service.js:9)); permission must be checked when the schedule is saved.
- A member could set a very frequent schedule or assign tasks to colleagues in a loop, flooding the digest.
- A schedule could outlive the member who created it, or a member removed from the project.

## 7. Risks and failure modes
- Stacked duplicates annoy people and distort the digest's open count (developer; code (src/jobs/digest.js:5)).
- The digest job has no guard against running twice (code (src/jobs/digest.js:4-8)); a recurrence run would need one so I-1 holds.
- `node-cron` timezone and daylight-saving behaviour is unverified. The Developer wants it tested before relying on it; `node_modules` is not installed, so nothing was checked.

## 8. What the code shows
- Tasks have no recurrence concept: columns are title, description, assignee_id, status, due_date, created_at (code (src/db.js:9-12)).
- No overdue concept exists today; status defaults to 'open' (code (src/db.js:11)).
- Projects carry a `timezone` (default UTC) (code (src/db.js:7)); the only scheduler is a daily digest at "08:00 server time", not project time (code (src/jobs/digest.js:3,12)).
- `createTask` checks membership and requires a title (code (src/modules/tasks/task.service.js:8-15)).

## 9. Leanings
- Assume a past occurrence may be done or left unfinished when the next is due; do not design around a guess. (developer)
- No stacking: skip the new copy, flag the old one overdue, keep it as the only copy. (developer)
- Anchor to the calendar: finishing a late task early does not spawn the next one. Reason: a real missed run stays distinguishable from an early one. (developer)
- Per-project timezone for schedules. (developer)

## 10. Open questions
- Is the unfinished-copy share real? Only the feedback board suggests it (llm (unverified)).
- Overdue: stored status or computed from `due_date`?
- Wording check: the late task stays overdue until completed; if still open on the next run day, I-1 means no new copy. Confirm this reading.
- What changes week to week, if anything (due date, assignee)?
- Who may create, edit or stop a schedule, and what happens when its creator leaves the project?
- Limits on schedule frequency.

## Sources
- Developer conversation, 2026-10-09; feedback board mentioned by the Developer (not seen).
- Code: src/db.js, src/jobs/digest.js, src/modules/tasks/task.service.js.
