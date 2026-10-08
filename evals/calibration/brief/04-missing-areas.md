---
craft_format: 1
feature: recurring-tasks
updated: 2026-10-08
---
# Brief: Recurring tasks

<!-- Golden example: a fictional task app, used as the quality bar for briefs. It is a distilled record, with every claim tagged by its source. Names, paths and numbers are made up. -->

## The feature in one paragraph
Teams in the task app re-create the same task every week or month by hand. We want a task to repeat on a schedule and appear on its own. It should never be missed and never doubled, even if the server restarts. *(developer)*

## Context map
Domain ●●●● · End users ●●●○ · Use cases ●●●○ · Feature ●●●○ · Risks and security ●●●○

## 1. Domain
### How it works in the real world
A schedule is a rule ("every Monday at 09:00") plus a timezone. Each time the rule comes due it produces one **occurrence**. The hard part is not the rule, it is making sure each occurrence produces exactly one task. *(developer)*

### Key concepts
- **Schedule**: the repeat rule and the template fields (title, description, assignee, labels). *(developer)*
- **Occurrence**: one due time of a schedule. It becomes one task, or is skipped. *(developer)*
- **Catch-up**: creating an occurrence late because the app was down at its time. *(developer)*

### Rules and regulations
- Daylight-saving changes move the hour: "09:00 local" must stay 09:00 local. *(llm (confirmed): the Developer confirmed this is the wanted behaviour)*
- Month length varies: a rule on the 31st needs a defined fallback. *(llm (unverified))*

### How others do it
Task tools commonly offer "repeat" rules. Whether they repeat from the due date or from completion varies by product. *(llm (unverified): check a primary source before relying on it)*

## 2. End users

## 4. The feature
### Boundaries
Not a calendar, not reminders, and not a full recurrence language. Four frequencies only. *(developer)*

### Ideas raised
- Suggest a schedule after a task has been copied by hand three times. The Developer leaned toward later.
- Rotate the assignee. Later.

### Success looks like
Teams stop copying tasks by hand, and no occurrence is missed or doubled. *(developer)*

## 5. Invariants
| ID | Rule that must always hold | Source |
|---|---|---|
| I-1 | A schedule never creates more than one task for the same occurrence | developer |
| I-2 | A missed occurrence is created late, once, never skipped and never doubled | developer |
| I-3 | Only members of a project can create schedules in it | llm (unverified) |

## 6. Security and abuse

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
