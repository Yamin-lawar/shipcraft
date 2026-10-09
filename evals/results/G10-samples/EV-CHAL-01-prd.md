---
craft_format: 1
feature: recurring-tasks
title: Recurring tasks
origin: craft-prd
touches_existing: yes
author: Developer
updated: 2026-10-09
---
# Recurring tasks

> Let members repeat a task on a schedule so routine work appears on its own.

## 1. The problem
Teams re-create routine tasks by hand.

## 2. Target users and use cases
- **U-1** As a team lead, I want a weekly report task to appear every Monday, so that nobody forgets it.

## 7. Out of scope
- Custom repeat rules.
- Assignee rotation (see Ideas for later).

## 9. Requirements
#### R-1 [P0] A member can make a task repeat daily, weekly or monthly
- **AC-1.1** Given a task, when a member sets a daily, weekly or monthly repeat, then a schedule is saved and the next due date is shown.
- **AC-1.2** Given a schedule that is due, when the job runs, then exactly one task is created for that occurrence. A repeated or concurrent run does not create a second one.
- **AC-1.3** Given the job was down past a due time, when it runs again, then one task is created for the missed occurrence, not a backlog.
- **AC-1.4** Given a monthly schedule on the 31st, when the month is shorter, then the task is due on the month's last day. Due times use the team's timezone.
#### R-2 [P0] Members are notified of new occurrences
- **AC-2.1** Given a new occurrence, when it is created, then the assignee gets an in-app badge and an email within 5 minutes.
#### R-4 [P1] Occurrences appear on time
- **AC-4.1** Given a due schedule, when its due time passes, then its task appears within 1 minute.

## 10. Access, privacy and security rules
- Only members can use it.
- Only the task's creator, its assignee or a team lead can set, edit or stop a repeat.
- Each team can have at most 50 active schedules.
- A feature flag switches the feature off (the job stops creating tasks).

## 15. Open questions
| Question | Why it matters | Owner | Needed by |
|---|---|---|---|

## Ideas for later
#### R-3 [P0 → later] Assignees rotate automatically between members each occurrence
- **AC-3.1** Given a rotation, when an occurrence is created, then the next member is assigned.
- Open before building: who is in the rotation, and what happens when a member leaves?
