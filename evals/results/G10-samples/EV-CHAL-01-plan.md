---
craft_format: 1
feature: recurring-tasks
prd_updated: 2026-10-09
mode: existing
size: large
gating: hard
gates:
  - { gate: 1, name: "Schedules and job", status: pending }
  - { gate: 2, name: "Routes, screen and permissions", status: pending }
  - { gate: 3, name: "Notifications", status: pending }
---
## Step 0: save
- [ ] Plan saved.

## Rollback
Tables are additive. Turning the feature flag off stops the job from creating tasks; nothing else needs undoing.

## Gate 1 — Schedules and job
**Delivers** tables, the job and the feature flag. Covers AC-1.2, AC-1.3, AC-1.4, AC-4.1.
- [ ] 1.1 add tables `schedules` and `occurrences`, with a unique key on (schedule, due time)
- [ ] 1.2 add a job that runs every minute and creates one task per due occurrence; after downtime it creates one task for the missed occurrence only; monthly on the 31st falls to the last day; due times use the team timezone
- [ ] 1.3 add the feature flag that stops the job
**Tests**
- T-01 (AC-1.2) a due schedule creates one task; running the job twice, or two at once, still creates one
- T-02 (AC-1.3) after simulated downtime, one task is created, not a backlog
- T-03 (AC-1.4) a monthly schedule on the 31st is due on the last day of a 30-day month; times follow the team timezone
- T-04 (AC-4.1) the task exists within 1 minute of its due time
**Exit checklist** - [ ] T-01 to T-04 pass - [ ] flag off creates no tasks

## Gate 2 — Routes, screen and permissions
**Delivers** the API and screen to set, edit and stop a repeat. Covers AC-1.1 and the access rules.
- [ ] 2.1 add routes to create, edit and stop a schedule
- [ ] 2.2 enforce: only creator, assignee or team lead; maximum 50 active schedules per team
- [ ] 2.3 add the screen, showing the next due date
**Tests**
- T-05 (AC-1.1) setting daily, weekly or monthly saves a schedule and shows the next due date
- T-06 (access) another member is refused; a lead is allowed
- T-07 (cap) the 51st active schedule is refused
**Exit checklist** - [ ] T-05 to T-07 pass

## Gate 3 — Notifications
**Delivers** the in-app badge and email for each new occurrence. Covers AC-2.1.
- [ ] 3.1 add the in-app badge
- [ ] 3.2 add the email, with retries if sending fails
**Tests**
- T-08 (AC-2.1) a new occurrence gives the assignee a badge and an email within 5 minutes
- T-09 an email failure is retried and does not block task creation
**Exit checklist** - [ ] T-08 and T-09 pass

## Change log
- 2026-10-09 Challenge: Gate 1 split into three Gates; rotation (R-3) moved to Ideas for later; ACs made testable; job failure rules, access rules and rollback added.
