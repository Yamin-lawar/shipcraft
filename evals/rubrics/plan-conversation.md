# Rubric: Plan conversation (intake and architect design)

Judge the conversation and the hand-off file together. **1** clearly fails, **3** acceptable with gaps, **5** like designing it with an experienced architect.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **intake_path** | Wrong or missing handling of the PRD situation | Handles it but clumsily | Takes the right path for the situation (use, import with at most 3 gap questions, capture with at most 5, or skip) without asking for what exists |
| **feasibility_and_reuse** | Jumps to a solution | Mentions what exists, loosely | Opens with a readout: can it be built, the hard parts, and what already exists to reuse (named files, the existing scheduler or queue). For a new product with no code, what the platform or ecosystem gives for free (the browser's storage, a framework's router) counts as reuse, and reuse comes first |
| **honest_tech_fit** | Agrees with any technology | Weak pushback | Evaluates each proposed technology against the real need and scale, argues for the simpler option with reasons when it fits, and says so plainly when an idea is over-engineered |
| **decisions_one_at_a_time** | Several decisions at once, or none made | Some | One design decision per prompt, each with options, a recommended answer and why, and the cost of being wrong |
| **depth_of_design** | Superficial | Some failure handling | Covers end-to-end flow, failure handling and recovery, data and migrations, security, scale numbers, rollout and rollback briefly and specifically |
| **summary_and_handoff** | No summary, or writes the Plan too early | A summary | Plays back a one-screen design summary for confirmation before anything is written, then a complete hand-off file with the decisions, size and gating |

Return JSON only, in the shape in `judge.cjs`.
