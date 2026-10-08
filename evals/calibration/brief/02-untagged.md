---
craft_format: 1
feature: recurring-tasks
updated: 2026-10-08
---
# Brief: Recurring tasks

<!-- Golden example: a fictional task app, used as the quality bar for briefs. It is a distilled record, with every claim tagged by its source. Names, paths and numbers are made up. -->

## The feature in one paragraph
Teams in the task app re-create the same task every week or month by hand. We want a task to repeat on a schedule and appear on its own. It should never be missed and never doubled, even if the server restarts.

## Context map
Domain ●●●● · End users ●●●○ · Use cases ●●●○ · Feature ●●●○ · Risks and security ●●●○

## 1. Domain
### How it works in the real world
A schedule is a rule ("every Monday at 09:00") plus a timezone. Each time the rule comes due it produces one **occurrence**. The hard part is not the rule, it is making sure each occurrence produces exactly one task.

### Key concepts
- **Schedule**: the repeat rule and the template fields (title, description, assignee, labels).
- **Occurrence**: one due time of a schedule. It becomes one task, or is skipped.
- **Catch-up**: creating an occurrence late because the app was down at its time.

### Rules and regulations
- Daylight-saving changes move the hour: "09:00 local" must stay 09:00 local.
- Month length varies: a rule on the 31st needs a defined fallback.

### How others do it
Task tools commonly offer "repeat" rules. Whether they repeat from the due date or from completion varies by product.

## 2. End users
| Who | Goal | Today (workaround, pain) | Context | Source |
|---|---|---|---|---|
| Team lead | The weekly report task is always there | Copies last week's task by hand and edits it. Forgets | Desktop, weekly | developer |
| Office manager | A month-end checklist on the 1st | A calendar reminder outside the app | Desktop, monthly | developer |
| Project member | Does routine work without being reminded | Waits for someone to create the task | Mobile and desktop, daily | developer |

## 3. Use cases
### U-1 Priya's weekly report reappears every Monday at 09:00
- The scene: Priya leads a six-person team. Every Monday morning she copies last week's report task, changes the date and reassigns it. Last week she forgot, and the report went out a day late. With a schedule the task would already be waiting at 09:00.
- Who: team lead · how often: weekly · how critical: high
- What could go wrong: the server is down at 09:00; last week's task is still open; her team works in another timezone; a daylight-saving change shifts the hour.

### U-2 Marcus needs a "check invoices" task on the 1st of every month
- The scene: Marcus sets the task for the 1st. In February there is no 31st, and he asks what happens to a rule on the 31st in a 30-day month.
- Who: office manager · how often: monthly · how critical: medium
- What could go wrong: a rule on the 31st is skipped in short months; two tasks appear for the same month.

### U-3 Dana skips the holiday week
- The scene: the team is away next Monday. Dana wants this one occurrence not to appear, without deleting the schedule.
- Who: project member · how often: a few times a year · how critical: low
- What could go wrong: she skips an occurrence that already exists.

## 4. The feature
### Boundaries
Not a calendar, not reminders, and not a full recurrence language. Four frequencies only.

### Ideas raised
- Suggest a schedule after a task has been copied by hand three times. The Developer leaned toward later.
- Rotate the assignee. Later.

### Success looks like
Teams stop copying tasks by hand, and no occurrence is missed or doubled.

## 5. Invariants
| ID | Rule that must always hold | Source |
|---|---|---|
| I-1 | A schedule never creates more than one task for the same occurrence | developer |
| I-2 | A missed occurrence is created late, once, never skipped and never doubled | developer |
| I-3 | Only members of a project can create schedules in it | llm (unverified) |

## 6. Security and abuse
A member could create many schedules to flood a project, so a per-project limit is needed. Schedules must stop when a project is archived or the creator leaves.

## 7. Risks and failure modes
Pre-mortem: "six months after launch, tasks appear twice". Top reasons the Developer and the LLM found:
1. The job creates the task, then crashes before recording that it ran, so the restart creates it again.
2. The server's clock and the project's timezone disagree after a daylight-saving change.
3. A very long outage makes catch-up flood the project with old occurrences.

## 8. What the code shows
- `src/jobs/digest.ts`: a daily cron job on `node-cron`, the only scheduler today. It records its last run after the work, not before.
- `src/modules/tasks/task.service.ts`: task creation validates project membership. A schedule should reuse it.
- There is no queue and no job table.

## 9. Leanings
- Reuse the existing cron runner rather than add infrastructure. *(Developer leaned this way; a decision for planning.)*
- Make occurrence creation idempotent with a key per schedule and occurrence. *(Developer leaned this way.)*

## 10. Open questions
- What should happen to catch-up after a very long outage?
- Should a created-late task notify the assignee differently?

## Sources
- Feedback board threads (three teams), provided by the Developer.
- `src/jobs/digest.ts`, `src/modules/tasks/task.service.ts`.
