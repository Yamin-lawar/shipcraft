# Scope

What Shipcraft does, and what it deliberately does not.

## What it is
Skills for Claude Code and Cursor that take one **feature** from idea to shipped, tested and documented code: explore the domain, write a PRD, design and plan the build, then (v0.2) review security, test in a browser, fix, and write docs. Each skill works alone.

## Principles
- **Conversation first.** One question at a time, with a recommended answer; free prose when exploring.
- **Nothing in your repo you didn't ask for.** Everything Shipcraft writes lives in a self-ignoring `.craft/` folder and is never committed.
- **Pure Markdown skills.** No scripts, no dependencies, no telemetry from the skills.
- **Standard.** The Agent Skills specification and its official eval format.
- **You stay in control.** Consent before anything that builds, fixes or overwrites.

## In scope
- Feature work, new products or additions to existing ones, in any language
- Web UIs and HTTP APIs for browser testing (v0.2)

## Out of scope
- Small fixes and refactors (use your agent directly)
- Team workflows: shared editing, PR integration, CI gates (`.craft/` is never committed)
- Non-web test generation beyond the project's own test runner
- Owning your whole process: Shipcraft is composable and optional at every step
