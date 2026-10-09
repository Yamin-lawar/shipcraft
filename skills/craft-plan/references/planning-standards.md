# Planning standards

You are writing the Plan a Developer, or a coding agent, will build from **gate by gate without improvising**. Every decision, constraint, failure mode and test is settled on the page before any code exists. This file sets the bar, not the layout: organise the Plan however reads best for this Feature, and make sure everything below is in it.

**Plan only.** Produce the document, then stop for the Developer's review. No code, files, migrations or installs until the Plan is approved.

## Step 0: save (the first step of every Plan)

Once the Developer approves the Plan in the host's plan mode, it is executed outside plan mode, so its first step makes the planning durable before any build work:

1. Write this Plan verbatim to `.craft/features/<slug>/plan.md`, under the wrapper frontmatter from the hand-off (`prd_updated`, `size`, `gating`, `mode`, and gate entries when gated).
2. Write the Plan's guardrails to the local-only agent rules file (see Guardrails).
3. Write every file that planning held back because plan mode can't write files. The hand-off file, or the conversation, lists them: for example `.craft/project.md`, an imported or short `prd.md`, an ADR.
4. Delete `.craft/handoff/<slug>.md` if it exists.
5. Begin the first gate, or the first step when there are no gates.

## Inputs to read first

- The hand-off: `.craft/handoff/<slug>.md`, if it exists (this file is `.craft/planning-standards.md`; the hand-off names it). It holds the agreed design summary, size, gating choice and any held files. When it exists, it's the authoritative summary of the planning conversation.
- The Spec: `.craft/features/<slug>/prd.md`. It defines what must be true. Its `AC-n.m` IDs are the units every test traces back to.
- The brief: `brief.md`, if present. Its Invariants (`I-n`), use cases (`U-n`) and security challenges carry straight into the Plan.
- The design summary agreed in the `craft-plan` conversation. These decisions are settled; carry them over as decided.
- `.craft/project.md`, `.craft/adr/`, the project's own ADRs and agent rules (`CLAUDE.md` / `AGENTS.md`) if it has them, and the code itself.

## Size and gating

**Size** sets how much the Plan covers:
- **Small**: a single coherent change with no migration, no new infrastructure, and no change to auth or money. Cover every *always* item below, in a few pages.
- **Large**: anything else. Cover every *always* and *large* item.

**Gating** was chosen by the Developer before planning. Follow that choice:
- **Hard gates**: the work is split into gates (see Gates). Each one is a hard stop: the Developer says continue before the next begins.
- **Checkpoints**: the same gate structure and exit checklists. The builder continues automatically once a checklist is green, and reports each one as it passes.
- **None**: one implementation sequence with no gates. Each step still lists its tests, and the Plan still ends with an exit checklist.

Proportion is part of quality. A small Plan that answers every *always* item in a few tight pages beats a long one. Where an item genuinely doesn't apply, say so in one line with the reason, rather than dropping it silently.

## What the Plan contains

### Always

1. **Inputs accounted for.** A table with one row per input: what it says, and where it lands in the Plan. Where the Plan departs from an input, the row says so and why. *No input is silently overridden.*
2. **Scope checklist.** A flat checklist of everything this Plan builds, each item tagged Must or Should. Then an explicit "not built" list. Anything not on the checklist is out of scope.
3. **Decisions.** A table with an ID (`D-n`) and columns for the decision, the choice, the alternatives considered, and the reason. Mark each one *agreed* (from the design conversation) or *needs the Developer's decision*.
   - Contradictions between inputs get an ID (`X-n`) and a stated resolution.
   - Assumptions and missing information get a chosen default.
4. **How it works.** For each main use case, the end-to-end flow, as a diagram plus numbered steps.
   - **Files touched**: real paths from the codebase. Existing files are listed separately from new ones, and new files are marked as *additions*.
   - Data model changes and migrations.
   - API contracts with exact request and response shapes.
   - Error cases, each with a code, HTTP status and a message shown to the End user. Messages name the business reason specifically, and never expose internals.
5. **Invariants.** A table with columns `ID | rule | enforced in code by | enforced in the database by | test`.
   - Every confirmed Invariant from the brief appears here.
   - Wherever the database can enforce a rule, it does, and the code is the fast path.
6. **State and consistency.**
   - Every stateful object gets a transition table: from → to, trigger, side effects in the same transaction. Forbidden transitions are listed too.
   - State where database transactions are required and where they aren't. External calls always run outside transactions.
   - Name the race behind every concurrency control (lock, compare-and-set, unique constraint) it prevents.
7. **Failure modes.** For every external call, async step and multi-step write, a table: *what fails → what happens → how it recovers*. Ambiguous outcomes **fail closed**: the system takes the safer, more restrictive state, and never guesses.
8. **Security.**
   - Threats listed with IDs (`T-n`), each with its mitigation and the test that proves it. `craft-secure` later checks every mitigation against the code.
   - The authorisation boundary, and how one tenant's data stays unreachable from another.
   - Validation at every input boundary.
   - Where secrets live, and what is never logged.
9. **Concrete numbers.** Timeouts, retries and backoff, limits, budgets, page sizes, rate limits. Write the value itself, never "a reasonable timeout".
10. **Observability.** The log events (by name) and audit events this Feature emits, and the fields that let one request be followed end to end.
11. **Test plan.** A matrix with columns `ID | priority | type | scenario → expected | ACs covered`.
    - Priority **Critical** covers money or data loss, a security breach, or wrong persisted state. Then High, Medium and Low.
    - **Every AC in the Spec is covered by at least one test**, and every Invariant by at least one test.
    - Unit tests cover pure logic. Integration tests cover database, concurrency and webhooks. End-to-end tests cover the real End-user journeys, with no mocks in the path.
12. **Implementation sequence.** Numbered steps in dependency order, each listing the tests it turns green. With hard gates or checkpoints, the sequence carries `→ GATE n` markers (see Gates).
13. **Risks.** A table: risk, impact, mitigation.
14. **Definition of done.** A checkable list.
15. **Readiness.** Blocking decisions the Developer must make before building, kept separate from non-blocking assumptions that will be documented instead.

### Large plans add

16. **Guardrails.** Compressed NEVER / ALWAYS rules by area (data and money, security, database, external providers, testing), each paired with the positive rule to follow. Step 0 writes them to the Developer's **local-only** agent rules file (`CLAUDE.local.md` or `.cursor/rules/craft.mdc`, both git-excluded), scoped to this Feature, so every build thread follows them. They're never written to a committed file such as `CLAUDE.md`; promoting them is the Developer's own choice.
17. **Release flows.** 2–4 named end-to-end journeys (happy path plus the main failure path) that run through the real stack before the Feature counts as done. They come *in addition to* the test matrix, never instead of it.
18. **Scope tiers.**
    - A "never reduced" list: correctness, security, isolation, and Critical tests.
    - Should-tier work shown *off* the critical path.
    - The exact order to cut Should-tier items if time runs short.

## Gates

*Applies when the Developer chose hard gates or checkpoints.*

With **hard gates**, each gate is a hard stop: work on the next gate starts only after the current gate's exit checklist is fully green and the Developer says continue. With **checkpoints**, the exit checklist must be green before moving on, but no pause is needed. Either way, each gate states:

- **Goal**: one sentence.
- **Delivers**: concrete, observable outcomes. "A transfer moves from Pending to Completed when the provider confirms", not "transfer logic".
- **Files**: created and changed.
- **Steps**: in order.
- **Tests**: the test IDs from the matrix that this gate writes and turns green. For money, state or security logic, write the tests first.
- **Exit checklist**: checkable items only, such as named test IDs passing, a command's expected output, or an observable behaviour. Not "works well".
- **Unblocks**: what may now start.

**Progress is recorded, so the build can continue in a new thread:**
- Number the steps inside each gate, and write them as checkboxes, so the Plan itself shows progress.
- After each step, record the last completed step in `.craft/state.md`.
- At each gate's exit, record its status in `plan.md` frontmatter (`pending`, `in-progress` or `passed`).
- Each gate's section must be self-sufficient: someone building it in a fresh thread reads only the guardrails, the invariants and that gate.

Order the gates foundations-first:

1. Configuration and the data layer.
2. Core domain logic and invariants.
3. Each external integration.
4. The UI, which starts only after the logic it renders has passed its gate.
5. End-to-end release flows.
6. Deployment.

Each gate builds only on gates already passed.

## Required anchors

The layout is yours, but these labels must appear exactly, so later skills and the evals can find them:

- Each gate is headed `Gate n — <name>`, and contains the labels **Delivers**, **Tests** and **Exit checklist** (bold).
- The invariants table has the header `ID | rule | enforced in code by | enforced in the database by | test`.
- Threats are listed as `T-n`, each with a mitigation and a test.
- The test matrix lists `ACs covered` for every test, so every Spec `AC-n.m` appears at least once.

## Writing rules

- **Settle, don't defer.** Every item is a decision with its reason. Something genuinely unknown goes in Readiness, with who decides and when it's needed by.
- **Traceable.** Spec AC → design section → test ID → gate → done. A reader can follow any AC through the whole chain.
- **Real names.** Use real paths, functions, tables and commands from the codebase, plus exact commands per environment (local, CI, deploy) wherever the Plan depends on them.
- **One line of why** next to every non-obvious choice.
- **Visible history.** On revision, add a short revision summary at the top. A reversed decision is struck through with its reason, never silently rewritten.
- **Plain language.** Write for a capable engineer new to this codebase.

## Done when

Check each item before presenting the Plan:

- [ ] Step 0 is the first step, and lists every held file.
- [ ] Every input has a row, and every departure from an input is stated.
- [ ] Every Spec AC appears in the test matrix.
- [ ] Every brief Invariant appears in the invariants table, with a test.
- [ ] Every external call and async step has a failure-mode row.
- [ ] Every decision has a reason. Contradictions are resolved and assumptions stated.
- [ ] Every number is concrete.
- [ ] The Plan follows the Developer's gating choice. With gates, every gate has delivers, tests, an exit checklist and unblocks, and the sequence shows `→ GATE n` markers in dependency order. Without gates, every step lists its tests.
- [ ] Readiness lists every blocking decision, or states there are none.
