# /craft-flow: pick up where you left off

**What it does.** In a new chat it reads what is saved and shows exactly where the feature stands, then continues at the next step, including the next step of a build.

**Use it when** you open a new chat mid-feature, come back the next day, or switch between Claude Code and Cursor. **Skip it when** you are in one chat start to finish.

**Why it helps**
- Nothing depends on chat history. Context windows fill; the files do not.
- It checks the saved progress against your actual files before trusting it.

## How to use it
```text
continue
```
or `/craft-flow`, or just start any Shipcraft skill.

## Example
```text
Continue ─────────────────────────────────────────
recurring-tasks · PRD saved 10 Oct · Plan saved (hard gates)
Built: Gate 1 ✓   Now: Gate 2 (Occurrence engine), step 3 of 5
Waiting on you: nothing
You are on branch main; this Feature was recorded on feature/recurring-tasks.
The PRD changed since the Plan was written. Review the Plan?

❯ 1. Continue Gate 2 of recurring-tasks, from step 2.3 (Recommended)
  2. Another Feature
  3. Something else
```
Notices are statements, never obstacles.

## What you get
The right next step. For a build it reads only the current Gate, ticks steps in the Plan as they finish, and pauses at each hard gate: "Gate 2 done. Continue?".

## Works alone?
Yes. If its bookmark (`.craft/state.md`) is missing, it rebuilds it from your documents and tells you only the step inside a Gate may be uncertain.

## Tips
- Say "skip <stage> because <reason>" to move on, and "undo" to restore the previous version of a document.
