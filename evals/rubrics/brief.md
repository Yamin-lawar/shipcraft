# Rubric: Brief

Score each criterion from 1 to 5. Judge the brief only. **1** clearly fails, **3** acceptable with gaps, **5** a model brief.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **claims_sourced** | Claims untagged | Some tagged | Every claim tagged `developer`, `code`, `doc` or `llm (unverified)`, and regulatory items flagged for a primary source |
| **context_coverage** | One or two areas | Most areas | Domain, End users, use cases, the Feature, and risks and security all covered |
| **use_cases_concrete** | Abstract | Some concrete | At least two concrete scenes with who, how often, how critical and what could go wrong |
| **raises_the_unmentioned** | Only repeats the Developer | Some extras | Raises things the Developer did not mention (failure cases, abuse, edge cases) and cites related code |
| **distilled** | A transcript or a dump | Mixed | Rules, challenges and leanings only, short enough to read in five minutes, in the template |
| **invariants** | None | Vague | Clear rules that must always hold, each with a source |

Return JSON only, in the shape in `judge.cjs`.
