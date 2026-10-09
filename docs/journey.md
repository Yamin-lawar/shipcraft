# A full journey: recurring tasks

This is the flow from idea to a build-ready Plan, with what you say and what Shipcraft does. Every step is optional.

| Step | You run | It takes | You end up with |
|---|---|---|---|
| 1. Explore | `/craft-explore recurring tasks for my task app` | a conversation, at your pace | a [brief](examples/recurring-tasks/brief.md) |
| 2. PRD | `/craft-prd` | about 10 to 13 questions | a [PRD](examples/recurring-tasks/prd.md) |
| 3. Challenge (optional) | `/craft-challenge` | up to 10 concerns, one confirmation | sharper PRD and Plan |
| 4. Plan | `/craft-plan` | 5 to 10 design decisions | a [hand-off](examples/recurring-tasks/handoff.md), then a [Plan](examples/recurring-tasks/plan.md) |
| 5. Build | you, or your agent, gate by gate | | the feature |
| Any new chat | `continue` | seconds | exactly where you left off |

## Step by step

**1. Explore.** You describe the idea. Shipcraft reads your code, then talks it through: how double-firing happens, what a missed run should do, month ends, timezones, who could abuse it. It ends with a brief you confirm.

**2. PRD.** One question at a time, recommended answer first. Edge cases you settle become acceptance criteria. It saves after every answer.

**3. Challenge.** It reads the PRD and the Plan and raises the biggest problems: an untestable criterion, a requirement that is a Feature of its own, one Gate that delivers everything. You agree to the fixes once, and both documents are edited, with the old versions kept.

**4. Plan.** It reads the code, tells you what exists and what is hard, proposes a design, and goes through the decisions with you. It asks how strict you want the build to be (hard gates, checkpoints or none), then hands plan mode a brief. Plan mode writes the Plan, starting with a "save" step.

**5. Build.** In a new chat, say `continue`. Shipcraft shows where you are and resumes at the next step, reading only the current Gate.

## What is next
Security review, browser tests, a fix loop, and engineering and product docs arrive in v0.2.
