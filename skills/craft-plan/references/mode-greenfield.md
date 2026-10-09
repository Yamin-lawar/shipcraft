# New product (no codebase)

The questions are the same as for an existing codebase. The answers come from the Developer, so ask only what you need.

## What to learn, briefly
- Who builds and runs it, and what they already know (languages, tools).
- Where it will run first, and later (laptop, a small host, a cloud account).
- Budget and how much operating effort is acceptable.
- Expected scale at the start and in a year. Say plainly when the answer is "just me".
- The smallest first slice that proves the idea within days.

## The readout and proposed design still come first
With no code there is nothing to reuse, but the first two plain-text messages are required all the same (`SKILL.md` section 4). Headed "Readout": can it be built, the hard parts, what the platform or ecosystem gives for free (the browser's storage, a framework's router), and what must be new. Headed "Proposed design": the recommended stack and shape, one or two alternatives, the main flow, the trade-offs. Only then ask the first decision.

## Offer stack options
Give two or three realistic options with trade-offs, the simplest first and recommended when it fits:
- the language and framework the Developer already knows beats the "best" one
- storage that needs no separate server for a first version (SQLite) beats a hosted database, until multiple writers or hosting demand otherwise
- one deployable unit beats several services

State what each choice costs later (a migration, a rewrite, a bill) and which decisions are hard to undo.

## Decide
One decision per prompt: language and framework, storage, how it is structured (folders and layers, kept small), how data is modelled for the main use case, how it is deployed, how it is tested, and the first slices in order. Keep the structure modest; resist adding layers for a hypothetical future.

## Record
Write the choices to the hand-off as decisions with the alternatives that lost. Suggest, but do not write, the project profile: there is no code yet, so create `.craft/project.md` only after the Developer confirms the stack.
