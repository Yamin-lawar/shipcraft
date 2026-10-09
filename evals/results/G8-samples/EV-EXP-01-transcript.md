**Assistant:** ▶ recurring-tasks · explore · Let's think it through together, at your pace. Say "show map", "go deeper", "move on", "save" or "wrap up" anytime.

*(wrote .craft/features)*

*(wrote .craft/features/recurring-tasks/.history)*

**Assistant:** So the pain is concrete: every week someone opens the app, finds last week's task, and retypes or duplicates it. I saved a first-pass brief of what we have so far.

Here's what I see in the code. Tasks are plain rows (`src/db.js:9-12`) with no notion of "again". The only scheduled thing is the digest job (`src/jobs/digest.js:12`), which fires at 08:00 server time. Projects each carry their own `timezone` (`src/db.js:7`), and the seed data has one in Berlin and one in New York. So "every Monday" immediately raises the question of whose Monday, and a server-time cron would silently get it wrong for one of those teams.

There's also a design fork. One option is a template that spawns a fresh task each week. The other is a single task that reopens itself when someone completes it. They behave very differently when a week gets skipped. With spawning, an unfinished task piles up next to the new one. With reopening, history vanishes.

The thing that decides this is what the team actually does with last week's copy. Do they finish it and leave it as a record, or does it get abandoned half-done?

**Developer:** Honestly, I don't know for sure. From the feedback board it sounds like people copy last week's task, do it or forget it, and then duplicate it again, so I'd guess a lot of them end up half-done. I'd rather not design around a guess, so let's assume both can happen.

*(wrote .craft/features/recurring-tasks/brief.md)*

**Assistant:** Designing for both cases is the safer choice. I've added it to the brief as your leaning. I also marked the "half-done" share as unverified, since it comes from the feedback board and nobody has measured it.

Supporting both has a consequence. When the next occurrence is due and last week's task is still open, the system has to do something with it. I see three options:

- **Always spawn a new task.** This is simple, but a team that stalls for a month ends up with four identical open tasks.
- **Skip the new one while an old one is open.** This keeps the list clean, but the team never learns that they fell behind.
- **Spawn it and mark the old one as missed or overdue.** This is the most honest option, and it needs a status the app doesn't have yet. Today a task is either `open` or something else (`src/db.js:11`), and the digest counts only `open` tasks (`src/jobs/digest.js:5`).

Each option also changes the digest. Four stacked copies would inflate everyone's "open tasks" count each morning.

Picture a Monday where a team's "Write weekly report" from last Monday is still open. Would you want the app to quietly pile up a second copy, or to nudge them that the first one is still waiting?

**Developer:** I'd want the nudge, not a second copy. Four identical "Write weekly report" tasks stacked up would just annoy people, and the digest count would be wrong every morning. Mark the old one as overdue and leave it as the only copy, so the team can see they fell behind.

*(wrote .craft/features/recurring-tasks/brief.md)*

*(wrote .craft/state.md)*

**Assistant:** That's clear, and I've saved it as two Invariants. I-1: a recurring series never has more than one open task. I-2: a task that's still open when its recurrence comes due is shown as overdue.

I also noticed that "overdue" doesn't exist in the code today. A task is just `open` or not (`src/db.js:11`), and it already has a `due_date`. So overdue could be a new status, or it could be computed on the fly (open and past due). The computed version can't drift out of sync with reality. A stored status would let the digest count it separately. I'm not choosing between them yet, so I've parked it as an open question.

This design also leaves a gap. Say the team finishes the late report on Thursday. The next one is normally due next Monday, but a team that is a week behind might want it right away. If the app waits for Monday, the cadence never catches up. If it spawns immediately, the "weekly" rhythm drifts to wherever people happened to finish.

Staying on the Thursday scene: should the next report appear on Thursday when the late one is completed, or only on the next scheduled Monday?

**Developer:** I'd keep it on the Monday schedule. If Thursday's completion spawns the next one, the weekly rhythm drifts to whenever people happen to finish, and then it's hard to tell a real missed run from an early one. The late task can still be shown as overdue until its replacement is due.

**Assistant:** Agreed. I saved it as I-3: occurrences follow the calendar, never the completion time of the previous one. That also keeps a real missed run distinguishable from an early finish.

I've noted one thing in the brief to confirm later. The late task is overdue from the moment its due date passes and stays that way until someone completes it. If it's still open when Monday's run comes due, I-1 means no new copy appears. I've written it that way, but say so if you meant something different.

Because the schedule is the anchor, "which Monday?" now matters a lot. The projects here are in Berlin and New York (`src/db.js:22`), and the digest fires at 08:00 server time (`src/jobs/digest.js:12`). A server in UTC would create Berlin's Monday task around 10:00 local time, which is fine. New York's would land at 04:00 on Monday, or on Sunday evening in some seasons, depending on how the schedule is defined. Daylight-saving changes also shift the gap between runs. I haven't verified how `node-cron` handles timezones, so treat that as unchecked.

Do you picture the schedule following each project's own timezone, so a New York team's Monday really starts on New York's Monday?

**Developer:** Yes, I'd want each project's schedule to follow its own timezone, so a New York Monday starts on New York Monday. I haven't checked how `node-cron` handles that, so I'd want to see it tested before we rely on it.

*(wrote .craft/features/recurring-tasks/brief.md)*

*(wrote .craft/features/recurring-tasks/brief.md)*

**Assistant:** I saved that as I-4: each project's schedule follows its own timezone. I also logged the `node-cron` behavior as unverified, with your request that it be tested before we rely on it. I checked whether I could answer it now, but `node_modules` isn't installed here, so I haven't seen anything. When we get to planning, that test should be one of the first steps. Two cases are worth testing: a run that lands inside a daylight-saving gap, and a run in an hour that happens twice when the clocks fall back.

Next I'd like to look at who could misuse this, since we haven't covered it. A recurring task is a small machine that creates data on its own, with no person present. Two things in the code stand out:

- `createTask` checks that the acting user is a member (`src/modules/tasks/task.service.js:9`). A background run has no acting user, so that check can't protect it. Instead, the permission to create or edit a schedule has to be enforced when the schedule is saved.
- Anyone who can set a schedule can generate tasks forever, assigned to anyone. A member who sets a one-minute recurrence, or assigns tasks to a colleague on a loop, turns the digest into spam. Also, if a member is removed from a project, their recurring tasks keep running with their name on them.

Which of those worries you more: a member abusing schedules while they're still on the team, or schedules that outlive the person who created them?

**Developer:** wrap up

*(wrote .craft/features/recurring-tasks/brief.md)*

*(wrote .craft/features/recurring-tasks/brief.md)*

*(wrote .craft/state.md)*

**Assistant:** Two areas are still thin. Security and abuse got only a quick pass, and the domain is covered only by timezone and daylight-saving. I can spend two minutes on either, but I'll treat the brief as final unless you want that.

Here is the brief in short. It's saved at `.craft/features/recurring-tasks/brief.md`, and the previous version is in `.history`.

**The feature:** Tasks that recur on a fixed schedule, with no duplicates stacking up. A task that falls behind shows as overdue so the team can see it.

**Invariants (all from you):**
- **I-1:** A series never has more than one open task at a time.
- **I-2:** If a recurrence is due and the previous task is still open, that task shows as overdue.
- **I-3:** The schedule follows the calendar, not when the previous task was completed.
- **I-4:** Each project's schedule follows that project's own timezone.

**Use cases:**
- **U-1:** Monday, with last week's report still open.
- **U-2:** Finishing the late report on Thursday.
- **U-3:** A New York team's Monday.

**Claims I couldn't verify and need you to confirm or correct, in one reply:**
1. The feedback board suggests many copies end up half-done. That's a pattern from the board, not a measurement.
2. A late task stays overdue until someone completes it. If it's still open on the next run day, no new copy appears.
3. `node-cron` handles timezones and daylight-saving changes correctly. Nothing is checked yet, and you asked for it to be tested first.
4. The abuse ideas in section 6: a background run bypasses the membership check, a member could set a very frequent schedule, and a schedule could outlive the person who created it.
5. Overdue is currently undecided: it could be a stored status or computed from `due_date`.

I can also add reusable terms to `.craft/glossary.md`, such as "series", "occurrence" and "overdue". Say so if you want that.

This is a good place to start a fresh chat.

✔ Saved .craft/features/recurring-tasks/brief.md · Next: /craft-prd (or /craft-plan if the PRD exists) · Say "continue" in any new chat to pick this up.