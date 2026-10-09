**Assistant:** ▶ recurring-tasks · challenge · I'll raise the biggest concerns one at a time (up to 10), then change both documents once you agree. Say "you decide", "skip", "back" or "enough" anytime.

**Assistant asked:** Plan, Gate 1 "Everything" delivers tables, job, API, screen, notifications and rotation in one Gate, with one test: "T-01 recurring tasks work". Nothing can be checked until it all exists. How should it be split?
**Developer chose:** {"Plan, Gate 1 \"Everything\" delivers tables, job, API, screen, notifications and rotation in one Gate, with one test: \"T-01 recurring tasks work\". Nothing can be checked until it all exists. How should it be split?":"Split into 3 Gates (Recommended)"}

**Assistant asked:** R-3 (rotating assignees between members) is marked P0, but the problem and U-1 only need a task to reappear on schedule. It also raises unanswered questions: who is in the rotation, and what happens when a member leaves? What should happen to it?
**Developer chose:** {"R-3 (rotating assignees between members) is marked P0, but the problem and U-1 only need a task to reappear on schedule. It also raises unanswered questions: who is in the rotation, and what happens when a member leaves? What should happen to it?":"Move to Ideas for later (Recommended)"}

**Assistant asked:** AC-4.1 says the task appears "quickly", and AC-2.1 says the assignee is "notified", with no number or channel. Neither can be tested. What should they say?
**Developer chose:** {"AC-4.1 says the task appears \"quickly\", and AC-2.1 says the assignee is \"notified\", with no number or channel. Neither can be tested. What should they say?":"AC-4.1: a due task appears within 1 minute of its due time. AC-2.1: the assignee gets an in-app badge plus an email within 5 minutes of creation."}

**Assistant asked:** The job runs every minute (step 1.2), but nothing says what happens if it is down for an hour, runs twice at once, or a schedule is due on the 31st in a short month. Duplicate or missing tasks are the main risk. What should the rules be?
**Developer chose:** {"The job runs every minute (step 1.2), but nothing says what happens if it is down for an hour, runs twice at once, or a schedule is due on the 31st in a short month. Duplicate or missing tasks are the main risk. What should the rules be?":"Catch up once, never duplicate (Recommended)"}

**Assistant asked:** "Only members can use it" is the whole access rule, and the Plan has no rollback. Who may set, change or stop a repeat, and how is the feature switched off if the job misbehaves?
**Developer chose:** {"\"Only members can use it\" is the whole access rule, and the Plan has no rollback. Who may set, change or stop a repeat, and how is the feature switched off if the job misbehaves?":"Creator/assignee/leads + flag (Recommended)"}

**Assistant asked:** Apply these 14 changes to the PRD and the Plan? Old versions are saved in .history first.
**Developer chose:** {"Apply these 14 changes to the PRD and the Plan? Old versions are saved in .history first.":"Apply all (Recommended)"}

*(wrote .craft/features/recurring-tasks/.history/prd.20261009-150000.md)*

*(wrote .craft/features/recurring-tasks/.history/plan.20261009-150000.md)*

*(wrote .craft/features/recurring-tasks/prd.md)*

*(wrote .craft/features/recurring-tasks/plan.md)*

*(wrote .craft/state.md)*

**Assistant:** I applied all 14 changes.

- **PRD:**
  - Rotation (R-3) is now in Ideas for later.
  - The vague ACs now have numbers: 1 minute for tasks to appear, and an in-app badge plus an email within 5 minutes for notifications.
  - AC-1.3 and AC-1.4 are new, covering downtime catch-up, month-end dates and the team timezone.
  - The access rules, the 50-schedule cap and the feature flag are written in.
- **Plan:** It now has three Gates, each with its own tests (T-01 to T-09) and exit checklist. I removed the rotation step and added a rollback note.
- **Old versions:** I couldn't copy the files with the shell here, so I wrote the old versions into `.history` by hand. They are in `.history/prd.20261009-150000.md` and `.history/plan.20261009-150000.md`.
- **Plan check:** The email retry step in Gate 3 is new work, so look at it when you review the Plan.

✔ Saved .craft/features/recurring-tasks/prd.md and plan.md (old versions in .history) · Next: /craft-plan to re-plan if the Plan changed a lot, otherwise build · Say "continue" in any new chat to pick this up.