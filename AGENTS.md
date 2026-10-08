# Contributor guardrails

Rules for anyone (human or agent) working on this repo.

## Skills
- Keep each `SKILL.md` at most 150 lines. Put detail in `references/`. Never paste design text in wholesale.
- Use the `ux.md` message formats and `GLOSSARY.md` terms. Host tool names appear only in `host.md`.
- Edit shared files in `shared/`, then run sync. Never edit a synced copy.
- Write the evals, rubric and trigger phrases before the skill text.
- Skills stay pure Markdown. Never ship an executable inside `skills/`.
- Follow the Agent Skills spec: `name` equals the folder name, `description` is at most 1,024 characters and says "Use when ...", docs go in `references/`, templates and examples in `assets/`, and `skills-ref validate` passes.
- List every skill in `.claude-plugin/plugin.json`. Change versions only through `sync-plugin-version`.

## User repos
- Skills write only inside `.craft/` or to git-excluded local files.
- Save a `.history` copy before any overwrite.
- Never write secrets.

## Repo tooling
- Zero dependencies, `// @ts-check`, test first.

## Gates
- Show the exit-checklist output before marking a gate passed.
- Do not start the next gate until the Developer says continue.

The full plan is `docs/design/build-plan.md`.
