# /craft-plan: design how to build it, then get a Plan you can build from

**What it does.** An experienced architect reads your code and designs the feature with you: what to reuse, which technology fits, how it fails and recovers. Then it hands the host's plan mode a brief that sets a high bar for the written Plan.

**Use it when** you want to decide how to build something before coding. **Skip it when** the change is small and obvious.

**Why it helps**
- It reuses what you already have (your scheduler, your tables) and says plainly when an idea is over-engineered, including yours.
- Plans are split into **Gates**, each with what it delivers, its tests and an exit checklist, so you can build gate by gate.

## How to use it
```text
/craft-plan recurring tasks for my task app
```
1. **The PRD.** It uses the one you have, imports one you paste, or writes a short one with you.
2. **The design.** A readout (can it be built, what exists, the hard parts), a proposed design with alternatives, then one decision per prompt, each with a recommendation and the cost of being wrong.
3. **Your choices.** It asks whether you want hard gates, checkpoints or no gates.
4. **The hand-off.** It saves your decisions and shows how to switch to plan mode, which writes the Plan.

## Example
> **You:** Kafka, we'll need events later.
>
> **Shipcraft:** What we need is "wake up at a time, create one row, exactly once". Kafka is an ordered log for many consumers, replay and very high volume. A schedule firing a few thousand times a day does not need that. Write an event from the same transaction later when something needs it.

## What you get
A hand-off file with the agreed design, then a Plan from plan mode, saved as `.craft/features/<name>/plan.md`. [See one](examples/recurring-tasks/plan.md). In one comparison, plans written this way scored 4.1/5 against 2.6/5 for plain plan mode.

## Works alone?
Yes. No PRD, no problem. In plan mode already? It still works; files it cannot write yet are held until you approve the Plan.

## Tips
- Tell it your real scale ("about 2,000 a day, one server"). It designs for that.
- "you decide" takes the recommendation; "enough" moves on to the summary.
