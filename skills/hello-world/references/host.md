# Host differences

The only file that names host tools. Skills refer to capabilities by name. *Assumed* means not yet confirmed (see `evals/spikes.md`).

| Capability | Claude Code | Cursor | Fallback |
|---|---|---|---|
| Question prompt | the question tool: 1 question, 2–4 options, "Other" is automatic, recommended option first with "(Recommended)" | *assumed*: a similar prompt may exist | one plain-text question with lettered options, recommended first |
| Enter plan mode | the skill requests it and the Developer consents | *assumed*: the Developer switches manually | write the Plan in normal mode, then wait for the Developer's go-ahead |
| Plan file and approval | the plan is written to `~/.claude/plans/<name>.md`, and the plan-approval step reads it | *assumed*: `.cursor/plans/` | the Developer's explicit "go ahead" in chat |
| Question prompt inside plan mode | works | *assumed* | plain-text question |
| Sub-agents | available | *assumed* | single pass |
| Browser for research | when enabled | *assumed* | answer from knowledge, tagged unverified |
| Local agent-rules file | `CLAUDE.local.md` | `.cursor/rules/craft.mdc` (*assumed*) | none; the skill reads its own references |
| Background process | the shell tool's background mode | *assumed* | ask the Developer to start the app and give its URL |
| Search skips `.craft/` | yes (hidden and gitignored): always open by explicit path | *assumed* | — |
| Manual steps (for "Your turn") | approving the switch to plan mode; approving the plan | *assumed*: switching to Plan mode in the mode picker | — |
| Install | plugin (`/plugin`), or `npx skills@latest add <repo> -g -a claude-code` | `npx skills@latest add <repo> -g -a cursor` | copy the skill folders manually |
