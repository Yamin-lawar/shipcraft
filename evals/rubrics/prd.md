# Rubric: PRD

Score each criterion from 1 to 5. Anchors: **1** clearly fails, **3** acceptable with gaps, **5** a model PRD. Judge the document only.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **problem_clarity** | Describes a missing feature, or is vague | A real problem, thin evidence | A crisp problem for named people, with evidence and why now, understandable without background |
| **testable_acs** | Few or untestable ACs | Most are Given/When/Then, some vague | Every requirement has Given/When/Then ACs an End user or caller could observe, none need knowledge of the implementation |
| **edge_case_coverage** | Happy path only | Some edge cases | Lifecycle covered (first use, editing, many items, errors, deleting), existing behaviour and permissions addressed, each settled case is an AC |
| **scope_discipline** | No out of scope, or scope creep | Out of scope present but thin | Clear out of scope with reasons, sensible P0/P1/P2, at most 3 phases |
| **no_invented_evidence** | Invented numbers or quotes | A few unsourced claims | Every number sourced or marked "unknown, measure first", open questions listed |
| **format_and_flow** | Does not follow the template | Mostly follows it | Follows the template, with a flow diagram for each P0 use case that branches |

Return JSON only, in the shape in `judge.cjs`.
