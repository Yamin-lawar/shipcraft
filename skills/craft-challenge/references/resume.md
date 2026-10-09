# Progress, resume and continuing in a new chat

Chats end: the context fills up, the Developer switches between hosts, or comes back the next day. Never depend on chat history. Everything needed to continue lives in files, and every skill can pick up from them.

## `.craft/state.md`
The bookmark. Create it on the first run and update it whenever a skill finishes or stops. It is local, like everything in `.craft/`. If it is missing, rebuild it from the artifacts: which files exist, the gate statuses in `plan.md`, and the item statuses in the reports. Only the step inside a gate is lost.

```markdown
---
craft_format: 1
active: recurring-tasks
---
## recurring-tasks
- depth: full
- branch: feature/recurring-tasks
- stages: explore done · prd done · challenge skipped (small scope) · plan done · build in progress
- next: Gate 3, step 2
- gate: 3 of 5 · last completed step: 3.1
- waiting on you: nothing
- last session (2026-10-08): finished Gate 2. Digest job now creates tasks once per occurrence. Gate 3 starts with the notification step.
```

Write the "last session" note in two or three lines, in plain words, whenever a skill finishes or stops.

## What each stage saves, and when
| Stage | Saved continuously to |
|---|---|
| explore | `brief.md`, every few exchanges and at each checkpoint |
| PRD | a running decisions log in the draft `prd.md`, appended after every answer under `## Conversation progress` (topic, decision, source), plus topics covered, topics pending and questions used. The full PRD is written at the end, and the section is replaced then |
| plan conversation | `.craft/handoff/<slug>.md` as a running log of decisions, in normal mode |
| build | gate status in `plan.md` frontmatter, plus the current gate and last step in `state.md`. Steps in `plan.md` are checkboxes, ticked as they finish |
| secure, test, fix | their reports, updated per item |
| every skill | the next step and the "last session" note in `state.md` |

## The resume question
A skill started without conversation context reads `state.md` first. If a Feature has work in progress, show the resume card (`ux.md`) and ask one question through the question prompt.
- Choosing to continue counts as a continuous flow, so no scope question follows.
- If the Developer started a specific skill (for example the test skill in a new chat), tailor the options: "Test recurring-tasks (Recommended)".
- With nothing in progress, ask the skill's scope question instead.
- Conversations resume from what is saved: the brief's thin areas, or the PRD's pending topics. Never ask a question the files already answer.

## Trust, but verify
Before resuming a build, check the recorded progress against reality: run the current gate's tests and confirm the step's files exist. If they disagree, say so in one line and resume from what is actually done.
- If the current git branch differs from the Feature's recorded branch, say so first.
- If the PRD's `updated` date is newer than the Plan's `prd_updated`, say once: "The PRD changed since the Plan was written. Review the Plan?" Then carry on; it is a notice, never a block.

## Load only what the step needs
Keep the new chat small. A resumed skill reads the minimum:

| Resuming | Reads |
|---|---|
| explore or PRD | the brief (or the draft PRD) and its progress section |
| plan conversation | the PRD, the brief and the hand-off log |
| a build gate | the Plan's guardrails and invariants, **the current gate's section only**, and the files that gate touches. Not the whole Plan, PRD or brief |
| test or fix | the in-scope ACs and the open report items |
| docs | the code in scope, plus the artifacts the docs skill names |

## Break points
At the end of each stage and each Gate, say once: "Everything is saved. This is a good point to start a fresh chat. Say 'continue' there." Say it once, mid-stage, only when a conversation has become genuinely long, at a checkpoint.

## How to continue
In any new chat: run `/craft-flow`, say "continue", or start any `craft-` skill. All three reach the same resume card.
