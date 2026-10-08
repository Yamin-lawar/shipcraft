# Contributing

Thanks for helping. Shipcraft is a set of Markdown skills for Claude Code and Cursor, plus a little repo tooling.

## Setup
```bash
npm install
npm run check      # typecheck, tests, sync checks and lints
```

## Rules of the road
Read [AGENTS.md](AGENTS.md): the guardrails apply to people as much as agents.
- Skills are **pure Markdown** and follow the [Agent Skills specification](https://github.com/agentskills/agentskills).
- Edit shared text in `shared/`, then run `npm run sync`. Never edit a synced copy.
- Use the terms in [GLOSSARY.md](GLOSSARY.md). `npm run lint` checks this.
- Changing a skill? Add or update its eval cases first.

## Pull requests
Keep them focused, link the issue, and say which skill and host you tested in. See [SCOPE.md](SCOPE.md) for what Shipcraft deliberately does not do.
