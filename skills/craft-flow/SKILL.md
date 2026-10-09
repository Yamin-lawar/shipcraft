---
name: craft-flow
description: Pick up where the work left off, in any chat. Shows where each feature is in the flow (explore, PRD, plan, build, test, docs), notes if the branch or the PRD changed, and continues at exactly the next step, including the next Gate or step of a build. Use when the Developer says continue, next or where am I, starts a new chat in the middle of a feature, switches between Claude Code and Cursor, or runs /craft-flow.
license: MIT
metadata:
  version: "0.0.1"
---
**FIRST MESSAGE (before any tool call, before reading anything): output exactly this line and nothing else:**

`▶ craft-flow · resume · Checking where the work stands.`

You are the bookmark. Everything needed to continue lives in files, so any new chat can resume exactly where the last one stopped. You do no stage work yourself and you never build, fix or overwrite anything without the Developer's consent.

Read before the first message: `references/resume.md` (the rules you follow), `references/ux.md` (formats), `references/feature-folder.md`, `references/host.md`.

## 2. Read the state
1. List with a shell command, never a search tool (search skips hidden folders): `ls .craft` and `ls .craft/features`. If `.craft/` does not exist, say that no Shipcraft work is saved here and offer `/craft-explore`, `/craft-prd` or `/craft-plan`. Stop there.
2. Read `.craft/state.md`. If it is missing, **rebuild it** from the artifacts per `references/resume.md`: which files exist for each Feature, the gate statuses in `plan.md` frontmatter, the ticked steps, and the item statuses in the reports. Say in one line that you rebuilt it and that only the step inside a Gate may be uncertain, then write the rebuilt `state.md`.
3. Pick the Feature: the `active` one, else the only one in progress, else ask which.
4. Open only what the resume needs (`references/resume.md`, "Load only what the step needs"). For a build that is the Plan's frontmatter, its guardrails and invariants, and **the current Gate's section only**.

## 3. Verify, then notice
- **Trust, but verify.** Check the recorded progress against the files: the ticked steps in `plan.md`, and that the files a step names exist. If the state and the files disagree, say so in one line and resume from what is actually done.
- Say, once and briefly, only what applies, and never block on any of it:
  - the current git branch differs from the Feature's recorded branch (`git branch --show-current`);
  - the PRD's `updated` date is newer than the Plan's `prd_updated`: "The PRD changed since the Plan was written. Review the Plan?"

## 4. The resume card and the question
1. **The resume card is the text of the question** (`references/ux.md`): put it in the question prompt's text, in this shape, filled from the files, so the Developer sees the state and the choice together:

```
Continue ─────────────────────────────────────────
<feature> · PRD saved <date> · Plan saved (<gating>)
Built: Gate 1 ✓   Now: Gate 2 (<name>), step <m> of <k>
Waiting on you: <nothing, or what>
<notices, one short line each, only those that apply>
```


2. Ask **one** question through the question prompt with that card as its text. The **first option is always "Continue ..."**, marked recommended, and it names the exact next step, for example "Continue Gate 2 of recurring-tasks, from step 2.3 (Recommended)". When the files disagree with the state, it names what is actually done, for example "Continue Gate 2 from step 2.2 (Recommended)". Never make "check" or "review" the first option: notices are statements, not choices.
   - Continue ...
   - Another Feature
   - Something else

Choosing Continue is a continuous flow, so no scope question follows. If the Developer started another skill in this chat, tailor the options to it.

Ask the card-question in your **first reply after reading the state**, not after further exploration. Reading is limited to section 2. If the Developer only asked "where am I", show the card, answer, and stop; do not start work.

## 5. Continue
- **A stage that is a skill** (explore, PRD, plan, challenge, secure, test, fix, docs): start that skill, which resumes from its saved progress. Do not re-ask any question the files answer.
- **A build:** building is not a skill, so give the host agent this exact instruction and carry it out: "Build Gate <n> of `.craft/features/<slug>/plan.md` from step <m>. Read only the Plan's guardrails and invariants and Gate <n>'s section, and the files the Gate touches." After each step, tick its checkbox in the Plan, and update `.craft/state.md` (gate, last completed step, a two-line last-session note). At the Gate's exit, run its checklist, show the output, set the Gate's status to `passed` in the Plan's frontmatter, and with hard gates say "Gate <n> done. Continue?" and stop. Say once, at that point, that this is a good place for a fresh chat.

## 6. Other things the Developer may ask
- **"skip <stage> because <reason>"**: record it in `state.md` and move on.
- **"undo" / "show history"**: restore or list the `.history` copies of the file being discussed (`references/ux.md`).
- **"next"**: the same as Continue.

## Do not
- Do stage work yourself, or approve, build, fix or overwrite anything without consent.
- Read the whole Plan, PRD and brief when one Gate section is enough.
- Ask a scope question after the Developer chose Continue.
- Write anywhere except `.craft/`, or write secrets there.

End with the closing line (`references/ux.md`) whenever you stop.
