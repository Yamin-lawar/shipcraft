# Handing off to plan mode

The conversation decided *what* to build and *how*. The host's plan mode writes the detailed Plan from your hand-off, to the standards in `planning-standards.md`. You never write the Plan yourself.

## Before the hand-off
1. Copy `references/planning-standards.md` to `.craft/planning-standards.md` (refresh it each run), so plan mode can read it at a stable path.
2. Make sure `.craft/handoff/<slug>.md` is complete and its frontmatter has `standards: .craft/planning-standards.md`, plus the PRD, brief, mode, size and gating.
3. Offer, once and with a one-line notice, to add a pointer for plain plan mode to the Developer's **local-only** rules file (`CLAUDE.local.md`; `.cursor/rules/craft.mdc` in Cursor), added to `.git/info/exclude`: "When planning a Feature, read `.craft/planning-standards.md` and the Feature's folder under `.craft/features/` first." This makes plan mode meet the bar even when the Developer skips this skill. Never write it to a committed file.

## Which mode are you in?
- **Normal mode** (files can be written): write the hand-off and standards file, then show the **Your turn** block (`references/ux.md`, steps from `references/host.md`) to switch to plan mode and send: `plan <slug> from .craft/handoff/<slug>.md`. Where the host lets a skill request plan mode itself, request it and the Developer consents.
- **Plan mode already active** (writes are blocked): do not stop. Hold every file you would have written and list them in the conversation under "Files held back". Plan mode can read the PRD and code, so write the Plan straight from the conversation, following the standards. The held files are saved by Step 0.
- **The Developer declines plan mode:** write the Plan in normal mode under the same standards, present it, and wait for an explicit go-ahead before any code. Then save it as `plan.md` and stop.

## What plan mode must do
Read the hand-off, the PRD, the brief if any, `.craft/planning-standards.md` and the code. Write the Plan to the standards, with **Step 0: save** as its first step. The Developer accepting the Plan in the host's plan approval is the consent to build.

## Step 0: save (runs after approval, outside plan mode)
1. Write the Plan verbatim to `.craft/features/<slug>/plan.md` under the wrapper in `assets/plan-wrapper-template.md` (`prd_updated`, mode, size, gating, gates). Save a `.history` copy first if the file exists.
2. Write the Plan's guardrails to the local-only rules file, scoped to this Feature.
3. Write every held file.
4. Delete `.craft/handoff/<slug>.md`.
5. Update `.craft/state.md`, then begin the first Gate or step. With hard gates, stop at each Gate's exit checklist and say "Gate n done. Continue?".

## If the PRD changes later
The Plan records `prd_updated`. If the PRD's `updated` date is newer, say once: "The PRD changed since the Plan was written. Review the Plan?" It is a notice, never a block.
