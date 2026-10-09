# /craft-challenge: poke holes before you build

**What it does.** A fair, sharp reviewer reads your PRD and Plan, raises the biggest concerns one at a time with a recommended fix, then edits both documents after one confirmation.

**Use it when** you are about to build something big or risky. **Skip it when** the work is small.

**Why it helps**
- It catches untestable criteria, scope that is a whole Feature, missing rollback, oversized Gates and vague access rules while fixing them is cheap.
- You confirm once, not once per fix.

## How to use it
```text
/craft-challenge the PRD and the Plan for recurring-tasks
```
At most 10 concerns, important ones first. If little needs changing, it says so and stops.

## Example
```text
AC-4.1 says the task appears "quickly". That can't be tested. What should it say?
❯ 1. Within 2 minutes of the due time (Recommended)
  2. Within 1 minute
  3. Drop R-4
  4. Leave as it is
```
Then it lists every change, numbered, per document, and asks once: **Apply all** (recommended), **Choose which**, or **None**.

## What you get
Edits to `prd.md` and `plan.md`, with a copy of each old version in `.history/`. IDs never change: a moved requirement keeps its ID. The Plan gets a dated line in its change log. It writes no file of its own.

## Works alone?
Yes. With neither document, it challenges anything you paste.

## Tips
- Answer the questions it asks; they are the facts it cannot know.
- "Undo" restores the version before the last change.
