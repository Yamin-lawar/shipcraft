# Rubric: Challenge

Judge the conversation and the documents after the changes. **1** clearly fails, **3** acceptable with gaps, **5** a sharp reviewer who improves the work without friction.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **finds_real_weaknesses** | Misses the obvious problems | Finds some | Finds the real problems: untestable acceptance criteria, scope that is a Feature of its own, vague performance or access rules, an oversized Gate, missing rollback, invented or missing evidence |
| **blocking_first** | Random order or nitpicks first | Roughly ordered | Raises blocking problems first, one concern per prompt, each with a recommended fix, and stops early when little is left |
| **actionable_fixes** | Complaints only | Some fixes | Every concern ships with a concrete proposed edit in the Developer's terms, not generic advice |
| **one_confirmation** | Asks repeatedly or edits without consent | Two confirmations | Shows the full numbered change list per document and applies it after one confirmation (apply all, choose, or none) |
| **preserves_work** | Overwrites without history, renumbers IDs, or writes extra files | Mostly careful | Keeps a history copy before editing, keeps IDs stable, edits both documents consistently, and writes no file of its own |
| **restraint** | Rewrites everything, or invents requirements | Some over-reach | Changes only what the findings justify, never invents evidence, and says plainly if little needed changing |

Return JSON only, in the shape in `judge.cjs`.
