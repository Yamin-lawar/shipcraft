**Assistant:** ▶ habit tracker · PRD · I'll ask short questions, one at a time (about 10). Say "you decide", "skip", "back" or "enough" anytime.

*(wrote .craft/features/habit-tracker)*

**Assistant asked:** How deep should we go on habit-tracker? This only decides what I suggest after the PRD.
**Developer chose:** {"How deep should we go on habit-tracker? This only decides what I suggest after the PRD.":"Standard (Recommended)"}

**Assistant:** Standard it is. Question 1 is the problem, and I need to hear it from you.

**Assistant asked:** What's the problem a habit tracker solves, and what's your evidence that it's real (your own experience, people who asked, data)?
**Developer chose:** {"What's the problem a habit tracker solves, and what's your evidence that it's real (your own experience, people who asked, data)?":"My own experience"}

**Assistant:** Saving the draft first, then the next question.

*(wrote .craft/features/habit-tracker/prd.md)*

**Assistant asked:** Your own experience is a fine source. What went wrong when you tried to keep a habit with the tools you've used (apps, notes, spreadsheets)?
**Developer chose:** {"Your own experience is a fine source. What went wrong when you tried to keep a habit with the tools you've used (apps, notes, spreadsheets)?":"Too heavy or cluttered"}

*(wrote .craft/features/habit-tracker/prd.md)*

*(wrote .craft/features/habit-tracker/prd.md)*

**Assistant:** Clutter is a clear pain, and it points to a minimal product. Next is why now, which I always ask, even for a side project.

**Assistant asked:** Why build this now? Is there a trigger, or is it just the right time?
**Developer chose:** {"Why build this now? Is there a trigger, or is it just the right time?":"Why now: I start a new job next month with irregular hours, and I want a routine I can hold onto before that starts."}

*(wrote .craft/features/habit-tracker/prd.md)*

*(wrote .craft/features/habit-tracker/prd.md)*

**Assistant:** Irregular hours matter a lot here. A "once every day at a set time" model would fail you in week one, so the schedule model needs care. Next is who uses this.

**Assistant asked:** Who is the app for?
**Developer chose:** {"Who is the app for?":"Me now, others later"}

*(wrote .craft/features/habit-tracker/prd.md)*

*(wrote .craft/features/habit-tracker/prd.md)*

**Assistant asked:** With irregular hours, how should a habit's target work?
**Developer chose:** {"With irregular hours, how should a habit's target work?":"Times per week (Recommended)"}

*(wrote .craft/features/habit-tracker/prd.md)*

*(wrote .craft/features/habit-tracker/prd.md)*

**Assistant:** Weekly targets mean a "streak" should count weeks that hit the target, not consecutive days. Next is a smart suggestion, since it affects how the main flow works.

**Assistant asked:** Suggestion: let you log a past day in one tap (e.g. after a late shift), and show 'this week: 2 of 4 done, 3 days left' on the main screen. It helps because you rarely log at the same time each day. Add it now?
**Developer chose:** {"Suggestion: let you log a past day in one tap (e.g. after a late shift), and show 'this week: 2 of 4 done, 3 days left' on the main screen. It helps because you rarely log at the same time each day. Add it now?":"Later"}

*(wrote .craft/features/habit-tracker)*

**Assistant asked:** Which of these stay OUT of v1? Pick all that apply, and the rest I'll treat as in scope.
**Developer chose:** {"Which of these stay OUT of v1? Pick all that apply, and the rest I'll treat as in scope.":"Accounts and sync across devices"}

**Assistant:** Accounts and sync are out. That leaves reminders, social features and analytics unexcluded, which would cut against your "too heavy" pain. I'll check once.

**Assistant asked:** Do you want any of reminders, social features or charts in v1, or should they all wait?
**Developer chose:** {"Do you want any of reminders, social features or charts in v1, or should they all wait?":"Simple history view only"}

**Assistant:** Scope is now small and clear. Next is success: how will you know it's working?

**Assistant asked:** How will you know the tracker works for you? There's no baseline today, so I'll record it as 'unknown, measure first'.
**Developer chose:** {"How will you know the tracker works for you? There's no baseline today, so I'll record it as 'unknown, measure first'.":"Hit weekly targets for 4 weeks (Recommended)"}

**Assistant:** Now the edge case I flagged. With irregular hours, "which day does this count for?" decides whether the weekly counts feel fair.

**Assistant asked:** If you mark a habit done at 1am after a late shift, which day should it count toward?
**Developer chose:** {"If you mark a habit done at 1am after a late shift, which day should it count toward?":"Day starts at 4am (Recommended)"}

**Assistant asked:** With no accounts, your habit data would live only in this browser. Clearing site data or switching browsers would lose it. Is that acceptable for v1?
**Developer chose:** {"With no accounts, your habit data would live only in this browser. Clearing site data or switching browsers would lose it. Is that acceptable for v1?":"Yes, plus an export button (Recommended)"}

**Assistant:** I'm writing the finished PRD now, replacing the draft. A copy of the draft is saved in `.history`.

*(wrote .craft/features/habit-tracker/prd.md)*

*(wrote .craft/state.md)*

**Assistant asked:** Are these assumptions all fine, or do you want to change one?
**Developer chose:** {"Are these assumptions all fine, or do you want to change one?":"All fine (Recommended)"}

**Assistant:** Assumptions stay as written.

Still open:
- Which existing trackers you tried, and which steps hurt most.
- What counts as "most habits" for the success measure.
- Whether 4am is the right day rollover for your new shifts.

✔ Saved .craft/features/habit-tracker/prd.md · Next: `/craft-plan` (run `/craft-challenge` first if you want the PRD stress-tested) · Say "continue" in any new chat to pick this up. Everything is saved, so this is a good point to start a fresh chat.