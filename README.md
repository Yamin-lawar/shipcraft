# Shipcraft

**Plan it. Build it. Prove it. Ship it.**

Skills for Claude Code and Cursor that take a feature from a rough idea to a clear PRD and a Plan an engineer can build from, one short conversation at a time.

> **Status: v0.1 preview, planning half.** Explore, PRD, plan, challenge and continue work today, tested in Claude Code. Cursor support is still being confirmed. Security review, browser testing, fixing and docs generation arrive in v0.2.

## Why use it

| The problem | What Shipcraft does |
|---|---|
| AI builds from a vague idea and misses the edge cases | `/craft-prd` turns the idea into testable requirements, asking one question at a time with a recommended answer |
| Plans skip failure handling, security and "what already exists" | `/craft-plan` reads your code, designs with you like an experienced architect, then hands plan mode a brief that sets a high bar |
| You lose context between chats | Everything is saved to files. Say **continue** in any new chat |
| A plan nobody can build from | Plans are split into Gates, each with what it delivers, its tests and an exit checklist |
| Clutter in your repo | Everything lives in a hidden `.craft/` folder that ignores itself. **Nothing is ever committed** |

## See it work

*Condensed from a real run on a small sample app; the last reply is shortened.*

```text
You:    /craft-plan recurring tasks for my task app

Shipcraft:  ▶ recurring-tasks · plan · I'll read the code, then design it with you...

            Readout: this can be built as described. You already run a cron job
            (src/jobs/digest.js) and SQLite, so no new infrastructure is needed.
            The hard parts: never creating a task twice, and catching up after downtime.

            Which design?
            ❯ 1. A per-minute job that claims due rows from SQLite (Recommended)
              2. One cron job per schedule
              3. An external queue

You:    Kafka, we'll need events later.

Shipcraft:  A schedule firing a few thousand times a day doesn't need an ordered log
            for many consumers. We need "wake up at a time, create one row, exactly once"...
```

More in [docs/journey.md](docs/journey.md), and real outputs in [docs/examples](docs/examples/recurring-tasks/README.md).

## Install

Use whichever you prefer. Install **globally** so nothing is added to your project.

<details>
<summary><strong>Claude Code</strong> (plugin, updates itself)</summary>

```bash
/plugin marketplace add OWNER/shipcraft
/plugin install shipcraft@shipcraft
```
Commands then read `/shipcraft:craft-prd`, `/shipcraft:craft-plan` and so on.
</details>

<details>
<summary><strong>Claude Code, Cursor and other agents</strong> (<code>npx</code>)</summary>

```bash
npx skills@latest add OWNER/shipcraft -g -a claude-code    # or: -a cursor
```
Commands read `/craft-prd`, `/craft-plan` and so on. Always pass `-g`: without it the installer writes into your project. Update with `npx skills@latest update`.

Cursor is not yet confirmed. If a skill does not appear, copy a folder from `skills/` into your Cursor skills directory by hand.
</details>

Check it worked: type `/craft-flow` (or `/shipcraft:craft-flow` for the plugin). In a project with no saved work it says "No Shipcraft work is saved here" and suggests where to start.

## Quickstart

Pick how much of the flow you want. Every skill also works on its own.

| Path | Run | Good for |
|---|---|---|
| **Express** | `/craft-plan add CSV export to reports` | small, well-understood features |
| **Standard** | `/craft-prd ...` then `/craft-plan` | a familiar domain and a clear idea |
| **Full** | `/craft-explore ...`, then `/craft-prd`, then `/craft-plan` | an unfamiliar domain, money, auth, anything big |

Then build as you normally do. Between chats, say **continue**.

## The skills

| Skill | Use it when | You get |
|---|---|---|
| [`/craft-explore`](docs/craft-explore.md) | you want to think an idea through first | a brief: domain, users, use cases, risks |
| [`/craft-prd`](docs/craft-prd.md) | you want clear requirements | a PRD with testable acceptance criteria |
| [`/craft-challenge`](docs/craft-challenge.md) | you want holes poked before building | sharper PRD and Plan, edited after one confirmation |
| [`/craft-plan`](docs/craft-plan.md) | you want to design how to build it | a design conversation, then a gated Plan |
| [`/craft-flow`](docs/craft-flow.md) | you are back in a new chat | the exact next step, resumed |

Coming in v0.2: `/craft-secure`, `/craft-test`, `/craft-fix`, `/craft-docs-eng`, `/craft-docs-product`.

## How it works

- **Where are my files?** In `.craft/` at your project root. It contains its own `.gitignore` (`*`), so git never sees it. To share a document, copy it out.
- **Can I skip steps?** Yes. Each skill says what is missing, offers the earlier step once, and carries on.
- **New chat?** Say "continue" or run `/craft-flow`. State is in files, not in the chat.
- **Undo?** Every change keeps the previous version in `.craft/features/<name>/.history/`. Say "undo".
- **Which stacks?** Any language. Planning reads your code whatever it is. Browser testing (v0.2) covers web UIs and HTTP APIs.

## How good is it?

We measure it, and say where the measuring is weak. In our own checks, an AI judge scored against a written rubric:

- Plans written with Shipcraft's hand-off scored **4.1 out of 5**, against **2.6** for plain plan mode on the same feature. One feature, one run, an AI judge, and the Shipcraft plan was about three times longer, so treat it as a promising signal, not proof.
- PRDs and design conversations scored between 3.8 and 4.7, with some below our bar of 4.0.

Details, failures and open questions: [evals/results](evals/results/).

## FAQ

**Do I need every step?** No. **Does it change my repo?** Only `.craft/`, which is never committed, and your own code when you ask to build. **Can I use my own PRD?** Yes: paste or attach it to `/craft-plan` and it is imported. **Does it send data anywhere?** The skills have no telemetry. (The installer reports installs; see its docs.)

## Credits

Built in the spirit of [mattpocock/skills](https://github.com/mattpocock/skills) (small composable skills, questions that come with a recommended answer, a shared glossary), [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) (short skills with on-demand references) and [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design). The PRD structure is adapted from Carlin Yuen's [Writing PRDs and product requirements](https://carlinyuen.medium.com/writing-prds-and-product-requirements-2effdb9c6def). The skills follow the [Agent Skills specification](https://github.com/agentskills/agentskills). No text or code is copied.

MIT licensed. See [SCOPE.md](SCOPE.md) for what Shipcraft does and does not do, and [CONTRIBUTING.md](CONTRIBUTING.md) to help.
