---
craft_format: 1
feature: recurring-tasks
title: Recurring tasks
origin: craft-prd
touches_existing: yes
author: Developer
updated: 2026-10-08
---

<!-- Golden example. A fictional task app, used as the quality bar for PRDs: problem not solution, testable ACs, honest about what is unknown. Every name and number is made up for illustration. -->

# Recurring tasks

> Let a team member set a task to repeat on a schedule, so routine work like the weekly report appears on its own instead of being re-created by hand.

| | |
|---|---|
| **Author** | Developer |
| **Updated** | 2026-10-08 |
| **Related** | Brief (`brief.md`) · Plan (`plan.md`) · support requests (see Appendix) |

---

## 1. The problem

Teams re-create the same tasks every week or month by hand. They copy last week's task, change the date and reassign it. People forget, copy the wrong version, or stop doing the routine work at all.

- Three teams asked for this on the feedback board (linked in the Appendix). There is no usage data yet, so the size of the problem is not measured.
- Today a missed routine task is invisible: nothing exists to be overdue.

## 2. Target users and use cases

### Target users

| Who | What they're trying to do | Notes |
|---|---|---|
| Team lead | Make sure routine work is always on the board | Creates the task once, expects it to keep appearing |
| Project member | Do routine work without being reminded | Sees the new task in their list |
| Office manager | Run month-end checks | Needs a date-based rule ("the 1st"), not "every 30 days" |

### Use cases

- **U-1** As a team lead, I want my weekly report task to appear every Monday at 09:00, so that nobody has to remember to create it. *(primary)*
- **U-2** As an office manager, I want a "check invoices" task on the 1st of every month, even in months with fewer days, so that month-end work is never skipped.
- **U-3** As a project member, I want to skip one occurrence when the team is on holiday, so that an unwanted task does not appear.

## 3. Current journey

1. The team lead opens last week's report task. → 2. Copies it. → 3. Edits the date and the assignee. → 4. Saves. *(This is where it gets forgotten: it depends on someone remembering.)*

## 4. Landscape

Not needed for this Feature.

## 5. Proposed solution

A task can repeat daily, weekly, every two weeks or monthly. The app creates each new occurrence automatically at the scheduled time, as its own task with its own status.

**Top value for members**
1. Routine work appears on time without anyone remembering.
2. Each occurrence is its own task, so one late week does not hide the next.
3. Missed occurrences are never lost and never doubled.

**Conceptual model**

```mermaid
flowchart LR
  Project -- has many --> Schedule
  Schedule -- creates --> Task
  Schedule -- may skip --> Occurrence
  Occurrence -- becomes --> Task
```

## 6. Goals

- Routine tasks appear on schedule without manual work.
- A team can trust that no occurrence is missed or duplicated.

## 7. Out of scope

- Custom repeat rules such as "the second Tuesday". Revisit if the four frequencies prove too limiting.
- Repeating from the completion date ("two weeks after done"). It drifts the schedule; see the Appendix.
- Copying subtasks and attachments into each occurrence. Only title, description, assignee and labels repeat.
- New notification channels. Existing task notifications apply to each new task.

## 8. Measurable outcomes

| Outcome | Metric | Baseline | Target | How it is measured |
|---|---|---|---|---|
| Teams adopt recurring tasks | Projects with at least one schedule, 30 days after launch | unknown, measure first | to set after two weeks of data | event `schedule_created` |
| Occurrences are created reliably | Occurrences created within 5 minutes of their time | not applicable | 99% | events `occurrence_created` and `occurrence_late` |

## 9. Requirements

**Priorities:** **P0** = needed for members to adopt (MVP) · **P1** = makes it good, not just usable · **P2** = nice to have

### U-1 · Weekly report

A team lead sets a task to repeat once, and each Monday the new task is just there.

```mermaid
flowchart TD
  A[Member opens a task] --> B[Chooses Repeat and a frequency]
  B --> C{Member of this project?}
  C -- no --> D[Message: only members can set a schedule]
  C -- yes --> E[Schedule saved, next occurrence date shown]
  E --> F[Scheduled time arrives]
  F --> G{Occurrence already created?}
  G -- yes --> H[Do nothing]
  G -- no --> I[New task created from the template fields]
```

#### R-1 [P0] A member can make a task repeat daily, weekly, every two weeks or monthly

*Why:* removes the manual copy that causes forgotten routine work.

- **AC-1.1** The feature works as expected.
- **AC-1.2** The feature works as expected.
- **AC-1.3** The feature works as expected.
- **AC-1.4** The feature works as expected.

#### R-2 [P0] Missed occurrences are created once when the app recovers

*Why:* routine work must not vanish because of an outage.

- **AC-2.1** The feature works as expected.
- **AC-2.2** The feature works as expected.

#### R-3 [P1] A member can see and manage a schedule

*Why:* people need to change course without deleting history.

- **AC-3.1** The feature works as expected.
- **AC-3.2** The feature works as expected.
- **AC-3.3** The feature works as expected.

### U-2 · Month-end checks

#### R-4 [P0] A schedule runs in the project's timezone

*Why:* "09:00" must mean the same local hour all year.

- **AC-4.1** The feature works as expected.
- **AC-4.2** The feature works as expected.

### U-3 · Holiday week

#### R-5 [P1] A member can skip one occurrence

*Why:* a real team's calendar is not a pure rule.

- **AC-5.1** The feature works as expected.
- **AC-5.2** The feature works as expected.

### Lifecycle and edge cases

#### R-6 [P0] Schedules respect permissions and limits

- **AC-6.1** The feature works as expected.
- **AC-6.2** The feature works as expected.
- **AC-6.3** The feature works as expected.
- **AC-6.4** The feature works as expected.

### Measurement

#### R-7 [P0] The product team can see adoption and reliability

- **AC-7.1** The feature works as expected.

## 10. Access, privacy and security rules

| Rule | Covered by |
|---|---|
| Only members of a project can create, edit, pause, skip or delete its schedules | AC-6.1 |
| A schedule never creates tasks in a project the schedule's creator no longer belongs to | AC-6.3 |
| Created tasks follow the same visibility as the original task | AC-1.2 |

## 11. Constraints

None known.

## 12. Phases

A single phase: all P0 and P1 requirements.

## 13. Ideas for later

- Suggest making a task recurring after it has been copied by hand three times. *Why interesting:* turns an existing habit into a schedule. *Worth doing when:* adoption data shows people still copy tasks.
- Rotate the assignee among members each occurrence.

## 14. Assumptions

- Four frequencies are enough for the first version.
- "Created late" tasks keep their original due date, so they show as overdue.

## 15. Open questions

| Question | Why it matters | Owner | Needed by |
|---|---|---|---|
| What is the baseline number of hand-copied routine tasks? | Sets the adoption target | Product | before launch |
| Should a late occurrence notify the assignee differently? | Affects the notification rules | Product | before plan |

## 16. Appendix

### Alternatives considered
- **Repeat after completion** ("two weeks after done"): rejected because the schedule drifts and a late week moves every later week.

### Decisions
- Each occurrence is its own task, not a reopened one, so history and status are never overwritten.

---

## Later changes

| Date | Change | IDs | Reason |
|---|---|---|---|
