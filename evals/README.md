# Evals

For maintainers. Nothing here ships inside a skill. Evals run a skill against a sample app with a simulated Developer, check the transcript with free scripts, and score the result against a rubric.

## Layout
- `fixtures/`: sample apps (`tasks-node`, `tasks-py`) and `empty`.
- `<skill>/evals.json`: cases in the Agent Skills eval format. Multi-turn fields sit under `extra`.
- `rubrics/`: scoring criteria. `calibration/`: samples of known quality that the judge is checked against.
- `seeds/`: prepared `.craft/` states. `results/`: recorded outcomes per gate. `runs/`: working files (not committed).
- `budget.json`: spending caps. The runner stops when a gate's budget is spent.

## Commands
```bash
npm run eval:smoke                                   # the cheap self-test, about half a cent
node evals/run.cjs --skill craft-prd --dry           # show the maximum cost, run nothing
node evals/run.cjs --skill craft-prd --gate G5       # run with and without the skill, free checks only
node evals/run.cjs --skill craft-prd --gate G5 --judge          # also score with the judge (one run)
node evals/run.cjs --skill craft-prd --gate G5 --judge --release  # release scoring: strongest model, median of 3
node evals/calibrate.cjs prd --gate G4               # check the judge against known samples
npm run fixtures:test                                # the Node fixture's own tests
```

## Keeping it cheap
Free checks (`checks.cjs`) run on every eval. Models: the simulated Developer uses the cheapest, the judge a mid-tier model while building, the strongest only at release. Conversations are saved, so re-checking or re-scoring a saved run never starts a new conversation (`--replay <dir> --skill <name> --case <id>`).
