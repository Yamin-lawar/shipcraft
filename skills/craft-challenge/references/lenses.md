# Challenge lenses

Run these silently over each document, then raise only what matters. Blocking problems first; skip nitpicks.

## PRD
- **Value:** is the problem real, for whom, and how do we know? Evidence, or an honest "unknown".
- **Scope creep:** a requirement that is a whole Feature of its own, a P0 that is not needed for adoption, more than three phases.
- **Contradictions:** requirements or rules that cannot both hold; an AC that conflicts with out of scope.
- **Testable ACs:** every AC is Given/When/Then and observable. Words like "quickly", "works", "notified" with no channel, time or number are not testable.
- **Missed edge cases:** first use, editing, many items, errors, deleting; permissions; time and timezones; concurrency.
- **Existing behaviour:** what keeps working, old data, other Features that depend on this.
- **Abuse and access:** who could misuse it, and whether the access rules are specific.
- **Invented evidence:** numbers or quotes with no source.

## Plan
- **Feasibility:** can it be built as described, and is the reuse real (do the named files exist)?
- **Simpler alternative:** is there a smaller design that meets the PRD?
- **Gate size and order:** a Gate that delivers several independent things, tests that do not match what the Gate delivers, a Gate that depends on a later one.
- **Failure handling:** every external call and background step: what fails, what happens, how it recovers.
- **Threats and invariants:** each Invariant enforced in code and the database, with a test.
- **Rollout and rollback:** how it ships, how it is switched off or undone, migrations that cannot be reversed.
- **Concrete numbers:** timeouts, limits and budgets are values, not words.
- **Traceability:** every AC is covered by a test.

## Between the two
Every AC maps to a Gate and a test; nothing in the Plan builds what the PRD marks out of scope.
