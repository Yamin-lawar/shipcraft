# Seeds

Prepared `.craft/` states copied into a fixture before an eval runs, so a skill can be tested mid-flow.

- `prd-midway`: a PRD half-written, with its progress section and `state.md`. For resume evals.
- `brief-ready`: a finished brief for the recurring-tasks Feature. For testing that the PRD skill asks fewer questions after an exploration.
- `prd-ready`: a finished PRD for recurring tasks (the golden example). For the plan skill's evals on `tasks-node`.
- `build-midway`: a finished PRD (newer than the Plan), a three-Gate Plan with Gate 2 half done, and a `state.md` recorded on branch `feature/recurring-tasks`. For resume evals.
- `build-nostate`: the same, with `state.md` deleted, to test rebuilding the bookmark from the artifacts.
- `weak-docs`: a deliberately weak PRD (an untestable notification AC, a P0 rotation requirement that is a whole Feature, "fast" with no number, a vague access rule) and a Plan with one huge Gate and no rollback. For the challenge skill's evals.
