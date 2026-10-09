# /craft-prd: turn an idea into a clear PRD

**What it does.** A short conversation with a product manager who has read your code. One question at a time, each with a recommended answer, ending in a PRD an engineer can build from.

**Use it when** you want requirements you can test. **Skip it when** the change is tiny, or you already have a PRD (paste it into `/craft-plan` instead).

**Why it helps**
- Requirements come out as **Given/When/Then** acceptance criteria that can be tested.
- Edge cases (missed runs, month ends, permissions, limits) become criteria, not surprises.
- It never invents evidence: if there is no baseline, the PRD says "unknown, measure first".

## How to use it
```text
/craft-prd recurring tasks for my task app
```
You will be asked one question at a time. Reply with a click, or type your own answer. Anytime say **"you decide"** (take the recommendation), **"skip"**, **"back"** (change an earlier answer) or **"enough"** (draft it now).

## Example
```text
How deep should we go?
❯ 1. Standard: PRD, then plan (Recommended)
  2. Full: explore first
  3. Express: straight to a plan

A monthly task is set for the 31st. What should happen in months with fewer days?
❯ 1. Use the last day of that month (Recommended)
  2. Skip those months
  3. Move to the 1st of next month
```
It also offers ideas as options ("show the next three dates before saving?: now / later / no"). Ideas you defer are filed under *Ideas for later*, not added to scope.

## What you get
`.craft/features/<name>/prd.md` in a standard format: problem, users, use cases, out of scope, measurable outcomes, requirements with priorities and flow diagrams, access rules, assumptions. [See one](examples/recurring-tasks/prd.md). It is saved after every answer, so you can stop and come back.

## Works alone?
Yes. With a brief from `/craft-explore` it asks fewer questions. At most 20 questions; a simple idea usually takes 8 to 13.

## Tips
- Answer in your own words when none of the options fit.
- Say "enough" early. Anything not covered becomes an assumption or an open question.
