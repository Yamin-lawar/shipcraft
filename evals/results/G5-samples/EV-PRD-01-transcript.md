**Assistant:** ▶ recurring tasks · PRD · I'll ask short questions, one at a time (about 10). Say "you decide", "skip", "back" or "enough" anytime.

*(wrote .craft/features/recurring-tasks)*

**Assistant asked:** How deep should we go on recurring-tasks? (This only decides what I suggest after the PRD.)
**Developer chose:** {"How deep should we go on recurring-tasks? (This only decides what I suggest after the PRD.)":"Standard (Recommended)"}

**Assistant asked:** What problem are End users hitting today that makes recurring tasks worth building now? Who asked for it, and what did they say or do instead?
**Developer chose:** {"What problem are End users hitting today that makes recurring tasks worth building now? Who asked for it, and what did they say or do instead?":"Users re-create the same tasks by hand"}

**Assistant:** Saving the draft first.

*(wrote .craft/features/recurring-tasks/prd.md)*

*(wrote .craft/state.md)*

**Assistant:** Got it: users retype the same tasks by hand. I need the evidence behind that, kept separate from the question of why now, so I can record the source.

**Assistant asked:** What's the evidence for this (tickets, requests, quotes, who asked, how often)? Anything you give me goes into the PRD with its source.
**Developer chose:** {"What's the evidence for this (tickets, requests, quotes, who asked, how often)? Anything you give me goes into the PRD with its source.":"Three teams asked for it on the feedback board. There is no usage data, so we have no counts. Two teams missed their weekly report last month because nobody created the task."}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant:** Good evidence, and the missed reports show the cost is forgotten work, not just retyping. I've noted that there's no usage data. Next is why now, since that decides how much to build.

**Assistant asked:** Why now? What makes this the right thing to build this cycle rather than later?
**Developer chose:** {"Why now? What makes this the right thing to build this cycle rather than later?":"Missed reports hurt real teams (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant:** Now the users. In the code, project members are `owner` or `member`, and tasks have one assignee.

**Assistant asked:** Who sets up a recurring task, and who does it land on?
**Developer chose:** {"Who sets up a recurring task, and who does it land on?":"Any project member sets it up; it keeps the same assignee (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant asked:** When should the next task appear, and which schedules are in scope for the first version? Project timezones exist (e.g. Europe/Berlin), so dates would follow the project's timezone.
**Developer chose:** {"When should the next task appear, and which schedules are in scope for the first version? Project timezones exist (e.g. Europe/Berlin), so dates would follow the project's timezone.":"Daily, weekly, monthly; the next task is created when the previous one is completed (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant asked:** If the current occurrence is still open when the next one would be due, what should happen?
**Developer chose:** {"If the current occurrence is still open when the next one would be due, what should happen?":"Create the next one on schedule anyway, and flag the old one as overdue (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant asked:** When someone changes or ends a recurring task, what applies?
**Developer chose:** {"When someone changes or ends a recurring task, what applies?":"Edits apply to future occurrences only; 'stop repeating' ends the series, and existing tasks are untouched (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant:** Now edge cases. A monthly task on the 31st is the classic trap, and a project's timezone or the assignee's membership can change too.

**Assistant asked:** A monthly task is set for the 31st, and some months have fewer days. What happens in those months?
**Developer chose:** {"A monthly task is set for the 31st, and some months have fewer days. What happens in those months?":"Use the last day of that month (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant:** Another edge case, on membership: the assignee may leave the project, and the series would otherwise keep creating tasks for someone who is gone.

**Assistant asked:** If a recurring task's assignee is removed from the project, what should new occurrences do?
**Developer chose:** {"If a recurring task's assignee is removed from the project, what should new occurrences do?":"Create them unassigned and tell the project owner (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant asked:** Out of scope for v1, and how do we measure success? I propose out of scope: custom schedules, rotating assignees, editing the whole series including open tasks, and templates. Success: missed recurring tasks drop to zero. The baseline is unknown (two teams missed one last month), so we'd measure first.
**Developer chose:** {"Out of scope for v1, and how do we measure success? I propose out of scope: custom schedules, rotating assignees, editing the whole series including open tasks, and templates. Success: missed recurring tasks drop to zero. The baseline is unknown (two teams missed one last month), so we'd measure first.":"Agree; 'repeats' marker goes to later (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant asked:** How should generated occurrences show up in the daily digest (src/jobs/digest.js)?
**Developer chose:** {"How should generated occurrences show up in the daily digest (src/jobs/digest.js)?":"Like any other task, nothing special (Recommended)"}

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant asked:** Does this flow match what you want?
**Developer chose:** {"Does this flow match what you want?":"Yes, it matches (Recommended)"}

*(wrote .craft/features/recurring-tasks)*

*(wrote .craft/features/recurring-tasks/prd.md)*

**Assistant:** Finished PRD is written. Fixing the history filename and state, then I'll confirm the assumptions.

*(wrote .craft/state.md)*

**Assistant asked:** Are these assumptions fine, or do you want to change one?
**Developer chose:** {"Are these assumptions fine, or do you want to change one?":"All fine (Recommended)"}

**Assistant:** Still open:
- How many existing tasks are repeats. There is no usage data, so the baseline is unknown and needs measuring first.
- How the project owner is told when a series loses its assignee (AC-7.2).

Two limits on how I produced this. I didn't confirm the history copy's filename (`.history/prd.md.<timestamp>.md` instead of `prd.<timestamp>.md`), because a rename command was blocked. And I wrote the PRD without checking `assets/example-prd.md` as the quality bar.

✔ Saved .craft/features/recurring-tasks/prd.md · Next: /craft-plan (or /craft-challenge to stress-test the PRD first) · Say "continue" in any new chat to pick this up. This is a good place to start a fresh chat.