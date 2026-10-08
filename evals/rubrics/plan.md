# Rubric: Plan

Score each criterion from 1 to 5. Judge the Plan only. **1** clearly fails, **3** acceptable with gaps, **5** an engineer could build from it gate by gate without improvising.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **inputs_and_scope** | Inputs ignored, no scope list | Some inputs accounted for | Every input accounted for, scope checklist with Must/Should and an explicit not-built list |
| **decisions** | Choices without reasons | Reasons for the main ones | Every decision has alternatives and a reason, contradictions and assumptions resolved |
| **reuse_and_fit** | Ignores existing code | Mentions existing code | Reuses what exists with real paths, justifies every new component, challenges over-engineering |
| **invariants_and_state** | None | Listed without enforcement | Invariants table naming code and database enforcement plus a test, transition tables, races named |
| **failure_modes** | Happy path only | Some failures | A row for every external call and async step: what fails, what happens, how it recovers, failing closed |
| **security_and_numbers** | Vague | Some threats, some numbers | Threats `T-n` with mitigations and tests, authorisation boundary, concrete timeouts, limits and budgets |
| **tests_traceability** | Few tests | A test list | Matrix with priorities covering every AC and invariant, traceable AC to test to gate |
| **gates_buildable** | No gates or vague | Gates with goals | Each gate has Delivers, files, steps, test IDs, an exit checklist and unblocks; sequence in dependency order; each gate self-sufficient |

Return JSON only, in the shape in `judge.cjs`.
