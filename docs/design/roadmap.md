# Shipcraft — Roadmap

**Plan it. Build it. Prove it. Ship it.**

| | |
|---|---|
| Repo | `shipcraft` (brand: Shipcraft) |
| Skill prefix | `craft-` |
| Hosts | Claude Code and Cursor, installed with `npx skills add <user>/shipcraft` |
| Status | v3, 2026-10-08. v2 plus a full design review (§11): about 30 gaps found and resolved inline |
| Vocabulary | [GLOSSARY.md](../../GLOSSARY.md). Capitalised terms below (Feature, Spec, PRD, Plan, Consent, Challenge, Issue, Bug, Spec gap, Finding, Developer, End user) are defined there |

---

## 1. What we are building

A suite of ten small, independent skills that takes one **Feature** from idea to shipped, security-reviewed, tested and documented code. Each skill can run alone. They connect only through files in the Feature's folder.

The suite is for **Feature work only**. Small changes and bug fixes don't use it, and that is the Developer's call. There is no automatic size triage.

### Pipeline

```
 idea
  │
  ▼
 craft-explore (optional, Developer-led domain conversation → brief.md; can run again before craft-plan)
  │
  ▼
 craft-prd ─────► [PRD = Spec] ─────► craft-plan ─────► [Plan, via the host's plan mode]
              (or: upload your own PRD, or skip;      PRD intake → architect design
               craft-plan handles both)                 conversation → Plan
                                                                    │
                       craft-challenge (optional, PRD + Plan) ◄──────┤
                       edits applied after one confirmation        │
                                                                    ▼
                                                   build (Claude / Cursor as normal)
                                                                    │
                                                                    ▼
                               craft-secure ──► craft-test ──► craft-fix ──┐
                                                  ▲                  │
                                                  └──── retest ◄─────┘
                                                                    │
                                                                    ▼
                                             craft-docs-eng  +  craft-docs-product

 craft-flow: "where am I" and "continue". Resumes any stage or gate from files, in any thread.
```

### Skills

| Skill | Stage | Writes (in the Feature folder) |
|---|---|---|
| `craft-explore` | **Most important.** Interactive, Developer-led exploration of the domain, End users, use cases, the Feature, and risks and security, before planning | `brief.md`, plus terms in the project glossary |
| `craft-prd` | Product conversation, edge cases become ACs | `prd.md` |
| `craft-plan` | PRD intake (existing, uploaded or none), then a design conversation with an experienced architect (feasibility, reuse, technology choices, how it all works), then a hand-off to the host's plan mode, which writes the Plan under `planning-standards.md` (hard-stop gates, each with deliverables and unit tests) | `plan.md`, `.craft/project.md`, and a short `prd.md` when there was none |
| `craft-challenge` | Optional adversarial conversation on the PRD and Plan | edits `prd.md` / `plan.md`, no file of its own |
| `craft-secure` | Per-change security review | `security.md` |
| `craft-test` | Playwright end-to-end tests from the ACs, run, failures listed | `test-report.md`, plus test files |
| `craft-fix` | Fix Issues: Findings, then Bugs and Spec gaps, then retest | updates the code, `security.md`, `test-report.md`, `prd.md`, `plan.md` |
| `craft-docs-eng` | Technical document for engineers, with diagrams | `engineering.md` |
| `craft-docs-product` | Plain-language document for product and non-engineers | `product.md` |
| `craft-flow` | Router, and the "continue" entry for new threads (resumes stages and gates from files) | `.craft/state.md` |

---

## 2. Decision log

### 2.1 Packaging and scope

| Decision | Choice |
|---|---|
| Packaging | One public repo containing all skills, in the style of `mattpocock/skills` |
| Distribution | `npx skills add`, which covers both Claude Code and Cursor. Skill text is host-neutral. **Installed at user level by default**, so no skill files land in the project. A project-level install adds the installed skill folders to `.git/info/exclude`. A `.claude-plugin/` manifest is optional later |
| Orchestration | Independent skills. `craft-flow` is the optional router and the "continue" entry for new threads, built in Phase 4 |
| Scope | Feature work only, no triage |
| Implementation language | Skills, references and templates are **Markdown**: **no executable file ships inside a skill**. Code exists only for the repo's own tooling (sync, lints, the eval harness): plain JavaScript (CommonJS) with `// @ts-check` and JSDoc types, `tsc --noEmit`, `node:test`, zero dependencies, no build step |
| Language and stack support | The suite works for **any language**: the skills are about Features, not languages.
- `craft-explore`, `craft-prd`, `craft-challenge`, `craft-plan`, building, `craft-fix` and the docs skills are language-agnostic. Unit and regression tests use the project's own runner (pytest, `go test`, JUnit, RSpec, `cargo test`…).
- `craft-secure` reviews any language, with a checklist weighted toward web and API risks.
- `craft-test` covers **any web UI or HTTP API**, whatever the backend language, because Playwright drives the running app from outside.
- For CLIs, libraries, mobile and desktop apps, v1 writes integration tests with the project's own runner where possible, and says plainly when a project type isn't covered.

This is proven by evals in two stacks, not assumed (§8) |
| Reference repos | Nothing copied. Skills are original work in a similar style, credited in the README. `diagram-design` and Cloudflare's `security-audit` are used if installed, never required |

### 2.2 Domain

| Decision | Choice |
|---|---|
| Spec | **The PRD.** No `spec.md`. The PRD is simply the latest PRD |
| Plan | `plan.md` only. Kept up to date whenever a change touches it (Challenge, fixes). The code wins where they disagree |
| People | The skills talk only to the **Developer**. "End user" means the person using the Feature. Skill text never says a bare "user" |
| Edge cases | Every edge case settled in conversation becomes an **Acceptance criterion** (AC) under its Requirement. There is no separate edge-case artifact or ID |
| Mode | `existing` or `greenfield` is a property of the **Plan**. The PRD only records `touches_existing: yes/no`, which sets how deep the edge-case probing goes |
| Consent | **There is no document approval flow: no statuses, hashes, re-approval or cascade.** Consent exists only to *act*: the host's own plan-mode approval; the pause between gates in a gated build ("Gate 2 done. Continue?"); confirming edits in `craft-challenge`; confirming security fixes in `craft-fix`; and the Developer's answer to a Spec gap |
| Staleness | The Plan records `prd_updated`, the PRD's `updated` date. If the PRD is newer, `craft-flow`, `craft-plan` and gate resume say once: "The PRD changed since the Plan was written. Review the Plan?" |

### 2.3 Stages

| Decision | Choice |
|---|---|
| Challenge | Optional. It challenges the PRD and the Plan (whichever exist). At the end it lists every proposed change for each document. The Developer confirms once ("apply all" or "skip #2"), then it edits both documents. The edits are applied once confirmed, with a `.history` copy of each. It writes no file of its own |
| `craft-check` | **Removed.** Comparing the build to the Spec is now done by the per-AC end-to-end tests (`craft-test`) and by the product doc's verified/unverified split |
| Order after build | secure → test → fix → docs |
| Issues `craft-fix` handles | Findings (from `craft-secure`), Bugs and Spec gaps (from `craft-test`) |
| Order inside `craft-fix` | Findings first, all fixes shown together and applied only when the Developer confirms. Then Bugs and Spec gaps in a loop with a checkpoint after each cycle. Finish with a full test re-run |
| Spec gap | `craft-fix` asks the Developer, fixes it, and adds the new AC to the Spec under `## Later changes` |
| Downstream sources | Downstream skills read the Spec, the Plan (as context) and the code. Where they disagree, the code wins |
| Product doc evidence | An AC is "shipped" only if its test passed in the latest `test-report.md`. Everything else goes under "Not yet verified" |
| Exploration | `craft-explore` is the most important skill, run before `craft-prd` and optionally again before `craft-plan`. Developer-led, with no question ceiling. It covers five areas tracked on a context map: domain, End users, use cases, the Feature, and risks and security. It's a free conversation between two engineers: plain prose with no question prompts or menus, kept alive by natural nudges toward thin areas and varied techniques: stories, role-play, comparisons, pre-mortems, code tours, research. It keeps distilling the talk into `brief.md`, which every later skill reads first. Reusable domain terms go to the project glossary |
| Conversation style | One question per turn, asked through the host's native question prompt (clickable options, the LLM's recommended answer first, free-text "Other" always available). Never a batch of numbered questions in one message. Each turn reacts to the last answer (confirm, challenge or suggest) before asking. Ceilings: PRD 20, Challenge 10. They are maximums, not targets. The Plan has no ceiling (see below) |
| Plan intake | `craft-plan` starts by finding a PRD. It uses the existing `prd.md`, or imports one the Developer uploads or pastes (normalised to IDs, with up to 3 gap questions, then confirmed). If there is none, it encourages `craft-prd`. If the Developer declines, it captures a short PRD during the conversation, kept alongside the Plan |
| Plan conversation | Before writing anything, an experienced architect discusses feasibility, reuse of existing code and infrastructure, and technology and pattern choices (queues, Kafka and event-driven design, cron, realtime, caching, storage). It covers end-to-end flows, failure handling, scale, security, observability, cost and rollout. One decision per turn, each with a recommendation. It challenges over-engineering, including the Developer's own ideas. The Plan is written only after a design summary is confirmed. Hard-to-reverse choices are offered as ADRs |
| Suggestions | Offered throughout the conversation, not only as questions: smart behaviour, UX and AI where it clearly helps. The Developer answers now, later or no. Deferred and ignored ones go to `## Ideas for later` |
| Browser tests | Playwright only in v1 |
| Host plan mode | `craft-plan` runs the conversation itself, then **hands off to the host's plan mode** (Claude Code or Cursor) to write the Plan. Plan mode gets the Spec, the brief, the agreed design summary and `planning-standards.md`, which sets a quality bar, not a template. The flow is **mode-aware** and works the same whether the Developer started in normal mode or already in plan mode. The hand-off lives on disk (`.craft/handoff/<slug>.md`) or in the conversation, never in the mode. Files plan mode can't write are held until **Step 0: save**, the first step of every Plan. Plan mode's own approval is the consent to build. If plan mode is declined, the agent writes the Plan directly under the same standards |
| Gating | **The Developer chooses before planning**, through one question with a recommendation based on size:
- **Hard gates**: each gate is a hard stop; the Developer says continue.
- **Checkpoints**: same gates and exit checklists, continuing automatically when green.
- **None**: one sequence, tests listed per step.

With gates, each gate states what it delivers, its files, steps, the test IDs it turns green, an exit checklist and what it unblocks |

### 2.4 Files

| Decision | Choice |
|---|---|
| Where files live | **Everything Shipcraft creates lives in one hidden folder, `.craft/`, at the project root**, the way `.claude/` or `.cursor/` keep tool files out of the codebase. One Feature folder per Feature: `.craft/features/<slug>/` |
| Git | **Nothing Shipcraft creates is ever committed.** `.craft/` contains its own `.gitignore` with a single `*`, so the folder ignores itself. The project's `.gitignore` is never touched, so there's nothing to commit even for the ignore rule. The few files outside `.craft/` (local agent-rule pointers, §4.3) go into `.git/info/exclude`, git's local-only ignore list |
| What is committed | Only the product the Developer builds: feature code, unit tests written during the build, and fixes with their regression tests. This is ordinary code, committed by the Developer as usual |
| Sharing | Briefs, PRDs, Plans, reports and docs stay local by default. To share one, the Developer asks explicitly: export a copy to a path they choose (for example `docs/`), or publish the docs to Notion when a connector is available. A shared copy is the Developer's own file from then on |
| Project profile refresh | Explicit only (`/craft-plan refresh profile`). Its date is shown at the start of every `craft-plan` run |
| Gate enforcement | Instruction-level: the build pauses at each hard gate until the Developer says continue. No script and no hook; CI can't see `.craft/`, which is never committed |

---

## 3. Shared conventions

### 3.1 Project layout (in the Developer's project)

```
<project>/
├── src/ …                          # the product: built and committed as usual
└── .craft/                           # everything Shipcraft creates. Never committed
    ├── .gitignore                  # contains "*", so the whole folder ignores itself
    ├── features/
    │   └── bulk-invite/
    │       ├── brief.md            # craft-explore (optional)
    │       ├── prd.md              # craft-prd (the PRD is the Spec)
    │       ├── plan.md             # craft-plan
    │       ├── security.md         # craft-secure
    │       ├── test-report.md      # craft-test, updated by craft-fix
    │       ├── engineering.md      # craft-docs-eng
    │       ├── product.md          # craft-docs-product
    │       ├── e2e/                # generated Playwright specs, plus a config that extends the project's
    │       └── assets/             # screenshots from test runs, exported diagrams
    ├── adr/                        # ADRs offered by craft-plan
    ├── handoff/<slug>.md           # the conversation → plan mode hand-off (deleted in Step 0)
    ├── project.md                  # project profile
    ├── glossary.md                 # project domain terms from craft-explore
    ├── planning-standards.md       # copied by craft-plan so plain plan mode can find it (refreshed each run)
    ├── config.md                   # optional: base_url, docs_target (markdown|notion)
    └── state.md                    # the bookmark for continuing in a new thread (§3.11)
```

**Why in the project, not in the home directory** (where Claude Code keeps its own plans): both hosts' agents can always read and write inside the workspace. Cursor's agent can't reliably reach files outside it. The Developer can also open the files in the editor. The self-ignoring `.gitignore` gives the same "never committed" guarantee.

**First-run setup** (any skill, once): create `.craft/` with its `.gitignore` before writing anything else. If the project already tracks a `.craft/` path, stop and ask rather than overwrite.

**Rules that follow from `.craft/` being gitignored:**
- Hosts' search tools skip gitignored files, so skills always open `.craft/` files **by explicit path**, never through search.
- `.craft/` lives at the **git root**. In a monorepo, the project profile has one section per package, and a Feature may span packages.
- `.craft/` is untracked, so it **survives branch switches**. Each Feature records the branch it's built on, and the resume card warns when the current branch differs.
- Each git worktree has its own `.craft/`. Building a Feature in its own worktree works naturally, but state isn't shared across worktrees. This is a known limitation.
- **Nothing secret is ever written to `.craft/`.** Test credentials come from environment variables, and API keys are never echoed into briefs or reports. `.craft/` isn't committed, but it's still exported, shared and published sometimes.
- **Every change is recoverable.** `.craft/` isn't in git, so before any skill overwrites an artifact, it saves the previous version to `.craft/features/<slug>/.history/<file>.<timestamp>.md`. It keeps the last 10 per file. The Developer can say **"undo"** to restore the version before the last change, or **"show history"** to pick one. Nothing a skill writes is ever lost.

### 3.2 Feature folder creation (every skill's first step)

1. Find the active Feature. If the Developer named one, or exactly one folder in `.craft/features/` is in progress, use it. Otherwise ask.
2. For a new Feature, propose a kebab-case slug from its name, confirm it, and create `.craft/features/<slug>/` before writing anything else.
3. A skill that produces an artifact still creates a Feature folder on unplanned work (for example `craft-secure` on a PR), so its output has a home. `craft-fix` and `craft-flow` never create one (§3.9).

### 3.3 File formats

Every artifact starts with YAML frontmatter including `craft_format: 1`, so formats can be migrated later.

**`brief.md`** (no status; it's input to planning, not a contract)

```markdown
---
craft_format: 1
feature: recurring-tasks
updated: 2026-10-07
---
# Brief: Recurring tasks

## The feature in one paragraph      # in the Developer's words: what, for whom, why now, what success looks like

## Context map                       # updated on every save
Domain ●●●○ · End users ●●○○ · Use cases ●○○○ · Feature ●●○○ · Risks and security ●○○○

## 1. Domain
### How it works in the real world
### Key concepts                     # term → plain definition. Reusable ones also go to the project glossary
### Rules and regulations            # each with a source. Regulatory items are flagged "check primary source"
### How others do it                 # comparable products or approaches, with sources

## 2. End users
| Who | Goal | Today (workaround, pain) | Context (device, skill, how often) | Source |
|-----|------|--------------------------|------------------------------------|--------|

## 3. Use cases
### U-1 Priya's weekly report task should reappear every Monday at 09:00
- Story: 3–6 lines, concrete, in the End user's world
- Who · How often · How critical
- What could go wrong: the server is down at 09:00, a task is still open from last week, her team is in another timezone, a daylight-saving change shifts the hour

## 4. The feature
### Boundaries                       # what it is not
### Ideas raised                     # Suggestions, and where the Developer leaned
### Success looks like

## 5. Invariants
| ID | Rule that must always hold | Source |
|----|----------------------------|--------|
| I-1 | A schedule never creates more than one task for the same occurrence | developer |
| I-2 | A missed run is created late, once, never skipped and never doubled | developer |
| I-3 | Members can only create schedules in projects they belong to | llm (unverified) |

## 6. Security and abuse             # who might misuse it, and how
## 7. Risks and failure modes        # including pre-mortem results
## 8. What the code shows            # related existing code, with paths
## 9. Leanings                       # product and technical directions the Developer leaned toward. Not decisions yet
## 10. Open questions
## Sources                           # docs, links and files referenced
```

Every claim in the brief has a source:
- `developer`
- `code (<path>)`
- `doc (<url>)`
- `llm (unverified)`, which becomes `llm (confirmed)` only when the Developer confirms it

Downstream skills treat unverified claims as questions, not facts. The brief is distilled, never a transcript.

**`prd.md`**

**The standard format is [`skills/craft-prd/assets/prd-template.md`](../../skills/craft-prd/assets/prd-template.md).** Every PRD the suite produces uses it, whether written by `craft-prd`, imported by `craft-plan`, or captured during planning (a short PRD fills sections 1, 2, 5, 7 and 9 at minimum). The structure is adapted from Carlin Yuen's *Writing PRDs and product requirements*, extended for Shipcraft.

| # | Section | Holds |
|---|---|---|
| — | Frontmatter + header | `origin`, `touches_existing`, `updated`; an elevator pitch and links |
| 1 | The problem | The problem for whom, with evidence and why now. A problem, never a missing solution |
| 2 | Target users and use cases | User table, plus prioritised `U-n` use cases ("As a…, I want…, so that…") |
| 3 | Current journey | Today's steps and where they hurt. Diagram optional |
| 4 | Landscape *(optional)* | How others handle it, and what we take from that |
| 5 | Proposed solution | A 1–2 sentence description, up to 3 user values, and an optional conceptual model diagram |
| 6 | Goals | 2–3 bullets |
| 7 | Out of scope | Never empty |
| 8 | Measurable outcomes | Metric, baseline, target and how it's measured |
| 9 | Requirements | Grouped by use case. A **Mermaid flow** for every P0 use case with a branch or more than 3 steps. `R-n [P0/P1/P2] <User> can …`, each with Given/When/Then `AC-n.m`. Then lifecycle and edge cases, then measurement |
| 10 | Access, privacy and security rules | Product rules, each mapped to an AC |
| 11 | Constraints *(optional)* | Only with evidence: legal, contracts, proven performance needs |
| 12 | Phases *(optional)* | At most 3 |
| 13 | Ideas for later | Deferred Suggestions |
| 14 | Assumptions | Shown to the Developer once when the PRD is drafted |
| 15 | Open questions | Question, impact, owner, needed by |
| 16 | Appendix *(optional)* | Alternatives considered, decisions, mini-PRDs |
| — | Later changes | ACs added later by `craft-fix`, dated |

**Key rules** (the full list is in the template's header comment):
- Functionality, not design or technology.
- P0 means true MVP.
- Cover the whole lifecycle: first-time use, editing, many items, errors, deleting, exporting.
- Every edge case becomes an AC.
- No performance targets without evidence.
- About 6 pages, or split into mini-PRDs.
- IDs are never renumbered or reused once assigned.

**`plan.md`**

**There is no Plan template.** The host's own plan mode (Claude Code or Cursor) writes the Plan, following [`skills/craft-plan/references/planning-standards.md`](../../skills/craft-plan/references/planning-standards.md). That file sets a quality bar, not a layout. It's distilled from an exemplary real-world plan: every input accounted for, decisions with reasons, invariants enforced in both code and database with tests, transition tables, failure-mode tables, concrete numbers, a test matrix with IDs and priorities, hard-stop gates with deliverables and unit tests, guardrails, and a readiness section.

The Plan's **Step 0**, which runs after the Developer approves it in plan mode, saves it as `plan.md`, adding only this wrapper:

```markdown
---
craft_format: 1
feature: bulk-invite
prd_updated: 2026-10-08    # the PRD's `updated` date when this Plan was written; a newer PRD triggers a notice
mode: existing             # existing | greenfield
size: large                # small | large  (sets how much the plan covers)
gating: hard               # hard | checkpoints | none  (the Developer's choice)
gates:                     # when gating is hard or checkpoints
  - { gate: 1, name: "Data layer", status: passed }
  - { gate: 2, name: "Invite sending", status: in-progress }   # status: pending | in-progress | passed
---
<the plan, as written by plan mode>

## Change log                # appended after the Plan is saved (craft-fix, Challenge), with dates
```

Downstream skills rely on only three anchors from the plan body, all required by the standards:
- Spec `AC-n.m` IDs appear in the test matrix.
- Gates are headed `Gate n — <name>`.
- An invariants table and a security section exist.

**`security.md`**: a disclaimer ("per-change review, not an audit"), the scope reviewed (diff range and files), then Findings `F-n`. Each has a severity, a verdict (`confirmed | needs-validation | rejected`), location, threat ref (`T-n` or `new`), description, suggested fix and a status (`open | fixed | accepted-risk`).

**`test-report.md`**: run summary (command, date, base URL, pass/fail per AC), then failures. Each is one of:
- `B-n` **Bug**: the code is wrong
- `G-n` **Spec gap**: the Spec doesn't say what should happen
- test error (the generated test is wrong)
- environment (the app didn't start, or there's no test data)

Each entry records the AC, test file, repro steps, expected, actual, evidence (trace or screenshot path) and status (`open | fixed | escalated`).

**`.craft/state.md`**: the bookmark that lets any new thread continue (§3.11).
- The active Feature.
- Per Feature:
  - its depth (§3.9) and git branch
  - a stage table (`done | skipped: <reason> | in progress | pending`)
  - the next step
  - the current gate and last completed step, while building
  - open items waiting on the Developer
  - a 2–3 line "last session" note, written whenever a skill finishes or stops

It's local, like everything in `.craft/`. If it's missing, it's rebuilt from the artifacts (frontmatter statuses, gate statuses in `plan.md`, report item statuses); only the mid-gate step detail is lost.

### 3.4 Traceability

`U-n` use cases (Brief) → the main flow, ACs and journey tests. `I-n` Invariants (Brief) → `AC-n.m` and Plan constraints. `R-n` → `AC-n.m` → Plan test IDs (each listing the ACs it covers) and `Gate n` → e2e test titled with `AC-n.m` → `B-n` / `G-n` (test report). The Plan's `T-n` → `F-n` (security).

Every artifact cites the IDs upstream of it. This lets the product doc decide per AC whether it shipped, and lets `craft-fix` tell code problems from Spec gaps.

### 3.5 Consent and gate rules (written into each skill that needs them)

1. **No document approval flow.** PRDs and Plans have no status. The consent that matters is consent to *act*.
2. `craft-plan` asks the Developer how to proceed on the PRD (use it, import one, capture a short one, or skip, §4.3), then writes the Plan through the host's plan mode. **The host's plan-mode approval is the consent to build.** Without plan mode, the agent presents the Plan and waits for an explicit go-ahead before any code.
3. With `gating: hard`, each gate is a hard stop: the agent stops when a gate's exit checklist is green and says "Gate n done. Continue?". The next gate starts only on the Developer's word. With `gating: checkpoints`, it moves on as soon as the checklist is green and reports it. With `gating: none`, the Plan's final exit checklist is the only check.
4. `craft-challenge` applies its changes only after one confirmation. `craft-fix` applies security fixes only after one confirmation, and asks about every Spec gap.
5. **Staleness is a notice, never a block.** If the PRD's `updated` date is newer than the Plan's `prd_updated`, skills say so once and carry on. Nothing is refused or reset.
6. Any skill that changes an existing artifact saves a `.history` copy first (§3.1).

### 3.6 Conversation protocol: one turn at a time

Used by `craft-prd`, `craft-plan` and `craft-challenge`. The canonical copy is in `shared/`, and a copy goes into each of those skills (see §3.8). The goal is to feel like talking with a sharp product manager or senior engineer, not filling in a form. `craft-explore` doesn't use this protocol: the Developer leads there (§4.1).

If a `brief.md` exists, it's read in "context first", and any topic it already covers counts as covered on the checklist.

**Ceilings** (maximums, not targets; every question and follow-up counts toward them):

| Skill | Ceiling | Typical |
|---|---|---|
| `craft-prd` | 20 | 8–12 |
| `craft-plan` | none (design discussion) | 5–10 decision turns, plus up to 3 import gap questions |
| `craft-challenge` | 10 | 3–6 |

**Before the first question:**
1. **Context first.** Read `.craft/project.md`, the existing documents and, when relevant, the code. If the Developer's request already describes the idea, don't ask for it again.
2. **Coverage checklist.** Each skill has a fixed list of topics its document needs (see `craft-prd`'s list in §4.2). Fill in silently whatever the context already answers.
3. **Inner panel, silently.** Each persona lists concerns, ideas and proposed answers.
   - PRD panel: product manager, End user, engineer (feasibility), QA (edge cases), security/abuse, support/ops, UX designer.
   - Plan panel, led by a very experienced architect: senior engineer who knows this codebase, platform/infrastructure engineer, QA/test, security, SRE (operations and failure), and a "simplest thing that works" skeptic.
   - Challenge panel: the PRD lenses (value, scope creep, contradictions, testability of ACs, missed edge cases, existing-system impact, abuse) and the Plan lenses (feasibility, simpler alternative, scale, threat coverage, migration and rollback, gate size and order).
   - Sub-agents run the personas in parallel when the host has them **and** the Feature is large; otherwise one pass. Never depend on sub-agents.
   - The panel runs once at the start and re-runs only on what changed after a substantive answer, not every turn. This keeps cost and latency down.
4. **Sort every item into one of three buckets:**
   - *Resolved by context*: cite the file it came from.
   - *Safe default*: low impact and reversible. Log it under Assumptions.
   - *Needs the Developer*: anything that changes scope, End-user-visible behaviour, permissions, data retention or deletion, cost, irreversible actions or external commitments.

**Each turn has two parts:**

1. **React to the last answer, in one or two lines,** with one of:
   - *Confirm*: play back what was understood, only when it's worth checking.
   - *Challenge*: only when the answer is vague, contradicts an earlier one, or adds risk. At most one follow-up per topic.
   - *Suggest*: a concrete idea that makes the Feature smarter, the UX better, or uses AI where it clearly helps. At most one Suggestion per turn.
2. **Ask exactly one question, through the host's native question prompt.** Pick the most important open topic: where a wrong guess would cost the most. Then stop and wait for the answer.

**This is deliberately not a batch interview.** The suite never puts several numbered questions with recommended answers into one message (the `mattpocock/skills` grilling style). Batches make the Developer read and answer a wall of text, and later questions can't adapt to earlier answers. One question at a time lets every answer shape the next question.

**How a question is asked:**
- **Use the host's interactive question prompt**: the clickable choice UI that Claude Code and Cursor show the Developer. Each host's prompt is named in `shared/host.md`; skill text only says "the question prompt".
- **Exactly one question per prompt.** The question prompt may accept several questions at once; the suite never does that.
- **The LLM's best judgment comes first:**
  - The recommended option is listed first, marked "(Recommended)".
  - Its description says why in one line, grounded in what the LLM knows (the brief, the code, earlier answers).
- **2–4 concrete options.** Each has a short label and a one-line description of what choosing it means. No vague options like "it depends".
- **The Developer's own answer is always possible**, through the prompt's free-text "Other" option. Picking the recommendation is always one click.
- **Short header and context.** The prompt's short header shows the topic (for example "Scope"). The one or two lines of reaction (confirm, challenge or suggest) and "why it matters" go in the question text, or just before the prompt.
- **Fallback** for hosts or modes without a question prompt: a single question as plain text with lettered options, the recommended one first. The Developer can reply with a letter or their own words.

Example, as rendered by a question prompt:

```
 Scope ───────────────────────────────────────────────────────────────
 Earlier you said admins invite people. Should invites expire?
 Unused invites that never expire become a security risk.

 ❯ 1. Expire after 7 days (Recommended)
      Matches your password-reset links (src/auth/reset.ts); safe default
   2. Expire after 30 days
      Friendlier for slow teams, longer exposure window
   3. Never expire
      Simplest, but stale invites stay valid forever
   4. Other…
```

- Progress ("~6 left") goes in the text before the prompt, every few questions, not on every question.

**Suggestions (how the conversation helps the Developer, not just questions them):**
- Suggestions can come up in any turn, wherever they're relevant: in the reaction part, or as one of the options in a question.
- Each Suggestion is specific to this Feature and names its End-user benefit in one line. It is one of:
  - *Smart behaviour*: the Feature does work so the End user doesn't have to, such as auto-detection, deduplication or sensible defaults.
  - *UX*: fewer steps, previews before irreversible actions, undo instead of confirmation, good empty and error states.
  - *AI*: only where it clearly beats plain rules. Every AI Suggestion states its cost, what happens when it's wrong, and the fallback. If the codebase already uses an AI provider, build on it.
- The Developer answers **now** (it becomes Requirements and ACs), **later** (it goes into the PRD's `## Ideas for later`), or **no**. A Suggestion the Developer ignores is filed under "later", so nothing is lost and v1's scope doesn't grow.
- No Suggestions that only add complexity. A simple Feature may get only one or two.
- The coverage checklist includes "smart, UX and AI considered". It's satisfied once at least one Suggestion has been offered and answered.

**Developer controls, available at any point:**
- **"you decide"**: take the recommended option.
- **"skip"**: leave the topic as an Assumption or open question.
- **"back"**: change an earlier answer. Anything that depended on it is re-checked.
- **"enough, draft it"**: stop now. Anything not covered becomes an Assumption or open question.

**Rhythm and ending:**
- Every 5 questions, give a three-line "here's what I have so far" summary.
- Stop as soon as the coverage checklist is complete, or when the ceiling is reached. Never ask past the ceiling; remaining gaps become open questions in the document.
- Write the draft, show the Assumptions once for "all fine / change #2", then say the PRD is saved and offer the next step.

**Edge-case depth:** when `touches_existing: yes`, check every affected existing behaviour for backward compatibility, existing data and migrations, End users who are mid-flow, API consumers, permissions, concurrency, and limits or empty states. Each settled case becomes an AC.

### 3.7 Host-portability rules

- Instructions are tool-neutral ("search the codebase", "if you can run sub-agents"). Host tool names, and every other host difference, live only in `shared/host.md` (§3.10). Skills refer to capabilities by name.
- Each `SKILL.md` stays under about 150 lines. Detail goes in reference files loaded only when needed.
- **Plan mode awareness:** plan mode blocks file writes.
  - `craft-plan` works in either mode (§4.3, mode-aware flow).
  - Skills that save as they talk (`craft-explore`, `craft-prd`) show a **Your turn** block to leave plan mode first, because held writes are lost if the thread ends. Only if the Developer declines do they continue with writes held until the end.
  - Build-stage skills (`craft-secure`, `craft-test`, `craft-fix`, docs) ask the Developer to leave plan mode first.
- Scripts are optional zero-dependency Node `.cjs`. Every skill works without them.
- Optional companions (`diagram-design`, Cloudflare `security-audit`, a Notion connector) are detected and offered, never required.

### 3.8 Self-containment

`npx skills add` installs each skill folder on its own, so **no skill references files outside its folder**.
- Templates live in the skill that produces the artifact. Other skills read only the artifacts.
- Shared reference files (`conversation-protocol.md`, `feature-folder.md`, `resume.md`) live in `shared/` and are copied into each skill that needs them by `scripts/sync-shared.cjs`. CI fails if the copies drift.

---

### 3.9 Starting anywhere: entry points and standalone use

Every skill works on its own. The full pipeline gives the best result, but skipping steps degrades gracefully and never breaks anything.

**Where the Developer says what they want to build.** At whichever entry skill they start with (`craft-explore`, `craft-prd` or `craft-plan`):
- in the command itself (`/craft-prd recurring tasks for my task app`)
- or, if not given, asked once in their own words

What's said first is written to the Feature folder (the brief or the PRD) and carried forward. Later skills read it, and never ask again.

**Depth, chosen once per new Feature.** When an entry skill creates a new Feature folder, it asks one question (the Developer's choice, not automatic triage). The answer is recorded in `.craft/state.md`, and `craft-flow` follows it:

| Option | Path | Suits |
|---|---|---|
| **Full** *(Recommended for new domains or large Features)* | explore → PRD → plan | Unfamiliar domains, money, auth, multi-week work |
| **Standard** | PRD → plan | Familiar domain, clear idea |
| **Express** | plan, with a captured PRD | Small, well-understood Features. About 15 minutes to a Plan ready to build |

Any stage can still be run later. Depth only sets what `craft-flow` recommends next.

**Bring what you have.** At any entry skill, the Developer can attach or paste existing material: docs, tickets, designs and screenshots, data, Slack threads.
- These are listed as Sources in the brief and as Related links in the PRD.
- They appear in the Plan's "Inputs accounted for".
- Design files become the visual source of truth for UI work.

**Fallback ladder.** Each skill uses the best input available, in this order: Spec → brief → Plan → code plus the Developer. When an earlier artifact is missing, the skill:
- says in one line what's missing and what that costs ("No PRD, so tests can only check behaviour you confirm now")
- offers the earlier skill once
- otherwise carries on

It never refuses to run because a step was skipped, and it never presents a guess as fact.

**Scope question: what to work on, when not in a continuous flow.** `craft-challenge`, `craft-secure`, `craft-test`, `craft-fix`, `craft-docs-eng` and `craft-docs-product` first ask what to cover, unless the skill is in a continuous flow.
- **In a continuous flow** means one of:
  - it was started by `craft-flow`
  - it was started right after the previous stage for the same Feature in this session
  - the command names a Feature whose upstream artifact exists (for example `/craft-fix bulk-invite`, with a test report present)
  - in a new thread, the Developer chose "continue" at the resume question (§3.11)

  In flow, it states its scope in one line ("Testing bulk-invite: 15 ACs") and starts.
- **Otherwise**, it asks **one question through the native prompt**. The options are built from what the skill can actually see (Feature folders, reports, the current branch or PR), with the most likely one first and marked Recommended, and "Other" for the Developer's own words:

| Skill | Question | Typical options |
|---|---|---|
| `craft-challenge` | What should I challenge? | The PRD · The Plan · Both · A document you paste or upload |
| `craft-secure` | What should I review? | Changes on this branch · A PR or commit range · A Feature · Specific paths |
| `craft-test` | What should I test? | A Feature (all its ACs) · One flow you describe · Changes on this branch · Other |
| `craft-fix` | What should I fix? | Open Issues in a Feature's reports · A bug you describe · Failing tests from the last run · Other |
| `craft-docs-eng` | What should the engineering doc cover? | A Feature · Changes in this branch or PR · A part of the system (paths or module) · Other |
| `craft-docs-product` | What should the product doc cover? | A Feature · What shipped in this branch or PR · A user flow you describe · Other |

- One follow-up is allowed, only when the answer is open-ended ("One flow you describe" → "Describe the flow in a sentence"). Then the skill works on exactly that scope and says so at the top of its output.

**Captured PRD.** Used when a skill needs acceptance criteria and there's no PRD: `craft-plan` when the Developer declines one, `craft-test`, and `craft-docs-product` if the Developer wants verified claims.
1. Propose the behaviours inferable from the code and from the Developer's description, as draft `R-n` / `AC-n.m`.
2. Confirm or correct them with at most 5 questions through the native prompt.
3. Write `prd.md` with `origin: captured` and `captured_by: <skill>`, after one "this is right" confirmation from the Developer.

Behaviours come from the Developer's confirmation, never copied from the code as truth. Otherwise the tests would just bless whatever the code does today.

**Standalone matrix:**

| Run alone | Usually missing | What it does |
|---|---|---|
| `craft-explore` | — | Always standalone |
| `craft-prd` | brief | Asks for the idea, then covers the topics a brief would have, so it asks more questions (still at most 20) |
| `craft-challenge` | PRD and Plan | Challenges whatever document the Developer pastes or uploads (a spec, ticket or design doc). With nothing to challenge, it suggests `craft-explore` or `craft-prd` |
| `craft-plan` | PRD, brief | PRD intake: existing, imported, or captured (§4.3). The architect conversation covers the domain lightly. For a domain-heavy Feature with no brief, it offers `craft-explore` once |
| `craft-secure` | Plan, PRD, brief | Asks for the scope only if it's ambiguous: a branch diff against main, a PR number, a commit range, or named paths. Builds the threat list from the diff and the code's existing auth patterns. Notes in `security.md` which inputs were missing |
| `craft-test` | PRD | Runs a captured PRD first, then generates tests from it |
| `craft-fix` | reports | **A described bug** ("the export button crashes on empty lists"):<br>1. Recorded as `B-n` in the Feature's `test-report.md`, when it belongs to a Feature.<br>2. A failing regression test first.<br>3. The fix.<br>4. Test green.<br><br>With no reports and no described bug, it offers `craft-secure` or `craft-test`. It never creates a Feature folder: a bug outside any Feature gets a regression test, a fix and a chat summary only |
| `craft-docs-eng` | everything but code | Documents from the code, git history, and the Developer's pointer to the Feature's scope (paths, routes, PR). Notes which sources were absent |
| `craft-docs-product` | PRD, test report | Takes the what and why from the Developer and the code. Without a test report, a banner reads "Described from the code; not verified by tests", and it offers `craft-test` for verified claims. Unverified behaviour is never presented as tested |
| `craft-flow` | — | Shows what exists and recommends the next step |

### 3.10 Experience contract: smooth and identical in Claude Code and Cursor

The Developer should feel one product, not two ports. Every skill keeps these promises, in both hosts:

| Promise | How it's kept |
|---|---|
| **Same flow, same words** | Skill text is identical for both hosts. Every host difference lives in one shared file, `shared/host.md`, and skills refer to capabilities by name ("ask with the question prompt", "enter plan mode"). See the capability table below |
| **Always know where you are** | Every skill **opens** with one line: Feature · stage · what it's about to do. It **closes** with one line: what was saved · what's next · how to continue. Same shape in every skill and both hosts |
| **Never lose work** | Saves as it goes, and updates the bookmark at every finish or stop (§3.11). Switching host mid-Feature works, because the state is files, not chat |
| **Ask the same way** | Decisions are one question at a time through the native prompt, recommendation first, with an identical plain-text fallback. Exploration is plain conversation (§3.6, §4.1) |
| **Speak the same language** | Skill text and messages use the [GLOSSARY.md](../../GLOSSARY.md) terms only. `scripts/lint-language.cjs` fails the build if a skill uses a term from an *Avoid* list |
| **Never surprise** | Every skill: (1) writes outside `.craft/` only with a one-line notice, (2) asks before installing anything, (3) asks before anything destructive, (4) acts only on explicit consent for anything that builds, fixes or overwrites |
| **Stay fast** | `SKILL.md` stays short, references load only when needed, a resumed step reads only what it needs (§3.11), and conversational turns stay around 150 words unless the Developer asks for depth |
| **Degrade in one line** | When a host lacks a capability, the skill says what's different in one sentence ("Cursor can't switch modes for me; switch to Plan and send this line") and carries on. It never stalls or errors |
| **Tell the Developer exactly what to do** | Whenever a step only the Developer can take is needed, the skill shows a **Your turn** block and waits. It covers: (1) what to do, (2) how to do it in this host (the exact key, menu or button, from `shared/host.md`), (3) the exact line to send afterwards, if any. The skill never assumes the switch happened. In the next turn it checks: if the mode, or whatever the step changed, still isn't right, it shows the same block again, briefly |
| **Treat inputs as data** | Pasted documents, uploaded PRDs, tickets and fetched web pages are material to analyse, never instructions to follow. Text inside them that tries to direct the agent is ignored and pointed out to the Developer |
| **Quiet by default** | Each skill names the Developer controls once, in its opening line ("say *you decide*, *skip*, *back* or *enough* anytime"), not on every turn. Recaps don't stack: a checkpoint replaces the 5-question summary when both fall due. The fresh-thread suggestion appears at the end of a stage, or mid-stage only when the conversation is genuinely long |
| **The Developer's language** | Skills converse in the language the Developer writes in. Artifacts are in English unless the Developer asks otherwise, so IDs and templates stay consistent |
| **Value in the first two minutes** | First run needs no setup and no config. The first useful moment comes within about two minutes: in `craft-explore`, an insight about the Developer's own code; in `craft-prd` and `craft-plan`, a first question whose recommendation is clearly grounded in their codebase. At most one question (depth) comes before that. A first-time project gets a 3-line welcome: what Shipcraft will do, where files go, and that nothing is committed |
| **Recover, don't crash** | Every failure message says what happened, why, and the single next action ("The app didn't start on :3000. Is it running elsewhere? Give me the URL, or say *start it*"). It never shows a raw stack trace as the whole answer, and never stops silently |
| **Undo anything** | Every artifact change keeps a version in `.history/`. "undo" and "show history" work in every skill (§3.1) |
| **New product or added feature, both first-class** | Greenfield work gets stack, structure and first-slice guidance. A Feature added to an existing product gets code-grounded questions, reuse of what's there, and impact on existing users, data and APIs. Every journey eval runs in both situations (§8) |
| **One version everywhere** | One repo, one version, installed to both hosts by the same `npx skills add`. Every artifact carries `craft_format`. A skill that meets a newer or older `.craft/` format says so, and migrates it after asking |

**The "Your turn" block.** It looks the same everywhere and is used for every manual step:

```
 ▶ Your turn: switch to Plan mode
   How:  Cursor → mode picker below the chat box → Plan   (exact steps from shared/host.md)
   Then send:  plan recurring-tasks from .craft/handoff/recurring-tasks.md
   Everything is saved, so nothing is lost if you do this in a new chat.
```

Manual steps that use it, wherever the host needs them:
- switch to plan mode
- approve or build the Plan in the host's plan UI
- leave plan mode before build-stage skills
- start a fresh thread at a break point (§3.11)
- continue after each hard gate
- install a dependency the skill proposed

**`shared/host.md`, the capability table.** It's filled in from the Phase 0 spikes and copied into every skill like the other shared files:

| Capability | Claude Code | Cursor | Fallback |
|---|---|---|---|
| Question prompt | the question tool (options, Recommended, Other) | *from spike* | one plain-text question, lettered options |
| Enter plan mode | the skill requests it, and the Developer approves | *from spike* (assumed: Developer switches manually) | write the Plan in normal mode, then wait for the Developer's go-ahead |
| Plan approval and file | the plan approval step reads the host's plan file | *from spike* | an explicit go-ahead in chat |
| Sub-agents for the panel | available | *from spike* | single pass |
| Browser for research | when enabled | *from spike* | answer from knowledge, tagged `llm (unverified)` |
| Local agent-rules file | `CLAUDE.local.md` | `.cursor/rules/craft.mdc` | none; the skill reads `.craft/planning-standards.md` directly |
| Background process (start the app for tests) | background shell command | *from spike* | ask the Developer to start the app and give its URL |
| Gitignored files | readable and writable by explicit path; skipped by search | *from spike* | — |
| Manual steps (for the "Your turn" block) | how to approve the plan-mode switch, approve the plan, and leave plan mode | *from spike*: how to switch to Plan, how to build or approve the plan, how to leave Plan | — |

### 3.11 Continuing in a new thread

Threads end: the context window fills up, the Developer switches between Claude Code and Cursor, or they come back the next day. The suite never depends on chat history. **Everything needed to continue lives in files, and every skill can pick up from them.** A typical rhythm is one thread for explore and PRD, another for planning, and one per gate or two for building. It works the same as staying in one thread.

**Nothing lives only in a thread.** Each stage saves as it goes:

| Stage | Saved continuously to |
|---|---|
| `craft-explore` | `brief.md`, every few exchanges and at each checkpoint |
| `craft-prd` | The draft `prd.md`, after every answer, with a `## Conversation progress` section (topics covered, topics pending, questions used). The section is removed when the PRD is finished |
| `craft-plan` conversation | `.craft/handoff/<slug>.md` as a running log of decisions made so far, in normal mode. Plan mode blocks writes, so a conversation held inside plan mode should reach the design summary before the thread ends |
| Building | Gate status in `plan.md` frontmatter, plus the current gate and last completed step in `.craft/state.md` |
| `craft-secure`, `craft-test`, `craft-fix` | Their reports, updated per item |
| Every skill | The next step and a "last session" note in `.craft/state.md` when it finishes or stops |

**The resume question.** Any skill started without conversation context reads `.craft/state.md` first. If a Feature has work in progress, it shows a short resume card and asks one question through the native prompt:

```
 Continue ────────────────────────────────────────────────────
 recurring-tasks · PRD saved 8 Oct · Plan saved (hard gates)
 Built: Gate 1 ✓  Gate 2 ✓   Now: Gate 3 (notifications), step 2 of 6
 Waiting on you: nothing

 ❯ 1. Continue Gate 3 of recurring-tasks (Recommended)
   2. Another feature
   3. Something else
```

- Choosing to continue counts as a continuous flow, so no scope question follows.
- **Trust, but verify.** Before resuming a build, the skill confirms the recorded progress against reality: it runs the current gate's tests and checks that the step's files exist. If they disagree, it says so in one line and resumes from what's actually done. Gate steps are also checkboxes in `plan.md`, ticked as each step completes, so progress is visible in the Plan itself.
- If the current git branch differs from the Feature's recorded branch, the card says so first.
- If the Developer started a specific skill (`/craft-test` in a new thread), the options are tailored to it, for example "Test recurring-tasks (Recommended)".
- With no work in progress, the scope question (§3.9) is asked instead.
- Explore and PRD conversations resume from the brief's thin areas or the PRD's pending topics. No question already answered is asked again.

**Load only what the step needs.** A resumed skill reads the minimum, which keeps the new thread's context small:

| Resuming | Reads |
|---|---|
| Explore or PRD | The brief (or draft PRD) and its progress section |
| Plan conversation | The PRD, the brief and the hand-off decisions log |
| Building a gate | The project's agent rules, the Plan's guardrails and invariants, **the current gate's section only**, and the files that gate touches. Not the whole Plan, PRD or brief |
| Test or fix | The in-scope ACs and the open report items |
| Docs | The code in scope, plus the artifacts listed in their specs |

**Natural break points.** At the end of each stage and each gate, the skill says once: *"Everything's saved. This is a good point to start a fresh thread. Run `/craft-flow`, or just say 'continue', there."* It says the same once during an unusually long explore or design conversation, at a checkpoint.

**How to continue:** in any new thread, run `/craft-flow`, say "continue", or start any `craft-` skill. All three reach the same resume card.

## 4. Skill specifications

### 4.1 `craft-explore`: interactive exploration before planning

**The most important skill in the suite.** Everything later skills know about the domain, the End users, the use cases and the Feature comes from here. A good exploration makes the PRD conversation short and the Plan right the first time.

- **Description:** "Explore a Feature before planning through a lively, Developer-led conversation covering the domain (how it works, key concepts, rules), the End users, concrete use cases, the Feature itself, and its risks and security. Uses stories, role-play, comparisons, pre-mortems and code tours, and keeps a brief so every later skill has the full context. Use when the Developer wants to talk through, explore or understand an idea or domain before planning, for example 'let's talk about how recurring tasks should behave'."

**What "full context" means: the context map.** The LLM tracks five areas and what makes each one covered:

| Area | Covered when the brief has… |
|---|---|
| Domain | how it works in the real world, the key concepts, the rules and regulations that apply, how others do it |
| End users | who they are, their goals, what they do today and what hurts, their context (device, skill, frequency) |
| Use cases | at least 2–3 concrete stories, including the most common and the most critical, each with what could go wrong |
| Feature | what it is and isn't, why now, what success looks like, ideas raised |
| Risks and security | Invariants, abuse cases, failure modes, pre-mortem results, what the existing code means for all of these |

The Developer goes wherever they want. The map just makes sure nothing important is silently skipped.

**It's a conversation between two engineers, not a questionnaire.**
- No clickable question prompts, no option lists, no menus. Those belong to `craft-prd` and `craft-plan`, where decisions are being made. Here nothing is being decided yet; the two of you are thinking out loud.
- Plain prose, the way a sharp colleague talks at a whiteboard.

**Shape of every LLM turn:**

1. **Substance.** Answer, explain, react, agree or disagree, grounded in the code where relevant. Keep it short (about 150 words) unless the Developer asked for a deep explanation.
2. **Keep it flowing, naturally.** End with what a colleague would say next: a single question, an observation that invites a reply ("that's going to bite us on retries…"), or a casual nudge toward something not yet covered ("we haven't talked about who'd abuse this; want to go there?"). Use one of these per turn, never a list of questions.

The context map steers these nudges silently, toward the weakest area. The Developer never sees a form, only a colleague who keeps bringing up the right things.

```
Developer: we want recurring tasks, and I'm worried about the cron job double-firing

LLM: You should be. The classic failure: the job runs, creates the task, then
crashes before recording that it ran. On restart it runs again and the same task
shows up twice. The usual fix is a unique key per schedule and occurrence, so a
second attempt is a no-op. Your digest job (src/jobs/digest.ts:31) records "last
run" after sending, so it has exactly that gap today, not a theoretical one.

What I'm less sure about is a missed run. If the server is down at 09:00, do we
create the task late when it comes back, or skip that occurrence? That choice
shapes a lot.
```

**Techniques.** The LLM varies these to keep the conversation alive, and picks whichever fits the moment:

| Technique | What happens |
|---|---|
| Explain with examples | Concepts are explained with concrete cases and small ASCII diagrams, never textbook definitions |
| Story walk-through | Narrates a use case step by step and pauses at each decision point: "the job created the task, then crashed. What does Priya see on Monday?" |
| Role-play | Speaks as an End user, a support agent, a fraudster, a regulator or the on-call engineer. The Developer reacts |
| Compare | Puts approaches, or how other products do it, side by side, with trade-offs and sources |
| Pre-mortem | "It's six months after launch and this failed. What are the top three reasons?" |
| What-if rapid fire | Three short edge scenarios the Developer answers in a word each |
| Check my understanding | Plays back the LLM's mental model in a few lines, and the Developer corrects it |
| Code tour | Shows related existing code and what it implies for the Feature |
| Research | If the host can browse, looks up domain facts and cites them (`doc (<url>)`) instead of relying on memory |
| Suggest | Smart, UX or AI ideas, raised in prose the way a colleague would ("what if it auto-detected the column?"). They're recorded in the brief under Ideas raised. Deciding now, later or no happens in `craft-prd` |

**Developer controls:** "go deeper", "move on", "quick" (cover every area lightly in about 10 minutes), "save", "show map", "wrap up". A long or short session is the Developer's choice.

- **Steps:**
  1. Create or find the Feature folder (§3.2). If `brief.md` exists, read it, show the context map, and continue from the weakest area. A session can be resumed any time, in any host.
  2. Read `.craft/project.md`, the project glossary and related code.
  3. Open by asking for the idea in the Developer's own words (unless it was already given), then play back the LLM's understanding in prose and pick up the most interesting thread.
  4. Converse, using the turn shape and techniques above.
  5. **Keep distilling.** Update `brief.md` every few exchanges, at every checkpoint, and on "save", so nothing is lost if the session ends. Tag every claim with its source (§3.3).
  6. **Checkpoint** about every 8 exchanges, or when a thread ends: a two-line "where we are" summary in prose, mentioning in passing which areas are still thin. The full map is shown only on "show map".
  7. **Wrap up** when the Developer says "wrap up" or "let's plan":
     - Name any thin areas on the map and offer two minutes on them. The Developer may decline.
     - Show the brief.
     - Ask the Developer to confirm or correct each `llm (unverified)` claim and Invariant, in one pass.
     - Offer to add reusable domain terms to the project glossary.
     - Recommend `craft-prd`, or `craft-plan` if the PRD is already written.
- **Before `craft-plan`:** run again after the PRD is written, it's for *understanding* technical ground the Developer wants to learn or think through openly, such as "explain event sourcing" or "how do schedulers avoid running a job twice". It appends to the brief. *Deciding* the solution happens in `craft-plan`'s design conversation, not here.
- **Guardrails:**
  - Plain conversation only: no question prompts, option lists or menus. At most one question per turn.
  - Never presents an `llm (unverified)` claim as fact.
  - Flags anything that depends on jurisdiction or regulation for checking against a primary source.
  - Doesn't write a PRD or Plan. Nothing in the brief is a decision until a later skill asks the Developer.
- **Folder:**
  - `SKILL.md`: role, turn shape, steps
  - `feature-folder.md`
  - `brief-template.md`
  - `context-map.md`: what "covered" means per area
  - `techniques.md`: each technique with a worked example
  - `exploration-guide.md`: how to be a good peer, with good and bad turn examples

### 4.2 `craft-prd`: product conversation

- **Description:** "Turn a Feature idea into a PRD through an interactive, product-manager-style conversation: one question at a time (at most 20), with challenges and suggestions for making the Feature smarter, easier to use, or AI-assisted where it helps. Turns edge cases and impact on existing behaviour into acceptance criteria and writes `.craft/features/<slug>/prd.md`. Use when the Developer wants to spec, scope or define requirements for a new Feature."
- **Coverage checklist** (mirrors the template sections in [`prd-template.md`](../../skills/craft-prd/assets/prd-template.md)):
  1. The problem, with evidence and why now (§1)
  2. Target users, and the prioritised use cases (§2)
  3. What users do today and where it hurts (§3)
  4. How others solve it, only if it helps the story (§4)
  5. The proposed solution and its top values (§5)
  6. Goals (§6)
  7. Out of scope (§7)
  8. How success is measured, with baselines (§8)
  9. The main flow per primary use case, and the requirements with priorities (§9)
  10. The lifecycle: first-time use, editing, many items, errors, deleting, exporting (§9)
  11. Impact on existing features, deeper when `touches_existing: yes` (§9)
  12. Access, privacy, security and abuse (§10)
  13. Constraints with evidence (§11)
  14. Smart, UX and AI considered (§9 or §13)
- **Suggested order:** problem → users and use cases → today → solution and goals → main flow → scope → *(Suggestions start here, once the flow is clear)* → requirements and priorities → lifecycle and edge cases → existing impact → access and security → success measures. The order bends: one good answer often covers several topics, and those questions are skipped.
- **Diagrams:** `craft-prd` draws the Mermaid flow for each P0 use case from the conversation, and shows it to the Developer during the requirements part ("here's the flow as I understand it"). That's often faster to correct than prose.
- **Steps:**
  1. Create or find the Feature folder (§3.2).
  2. Read `brief.md`, `.craft/project.md` and the project glossary if present. Without a project profile, do a light scan for product context: what the app is, who uses it, and whether it already uses AI. Topics the brief covers are skipped. Its use cases seed the main flow and ACs, every confirmed Invariant becomes at least one AC, and unconfirmed claims are asked about rather than assumed.
  3. Decide `touches_existing` and state it, so the Developer can correct it.
  4. Run the conversation protocol (§3.6) with the PRD panel, one turn at a time.
  5. Save the draft `prd.md` after every answer, with its `## Conversation progress` section, so a new thread can resume (§3.11). At the end, show the Assumptions, then say the PRD is saved. Mention that `craft-challenge` is available.
- **Guardrails:**
  - No technical design beyond feasibility flags.
  - Every Requirement has at least one AC, and each AC is given/when/then and testable.
  - Out of scope is never empty.
  - Suggestions marked "later" or ignored go to `## Ideas for later`, never into the Requirements.
- **Folder:** `SKILL.md`, `conversation-protocol.md`, `feature-folder.md`, `prd-template.md`, `edge-case-checklist.md`.

### 4.3 `craft-plan`: technical design conversation, then the gated Plan

**Talk first, plan second.** The LLM acts as a very experienced architect. It works out how the Feature should be built together with the Developer, and only then writes the Plan.

- **Description:** "Design how to build a Feature through a conversation with an experienced architect: technical feasibility, what existing code and infrastructure to reuse, which technologies and patterns fit (sync or async, queues, Kafka and event-driven design, cron and schedulers, realtime, caching, storage), how everything works end to end, failure handling, scale and security. Then hand off to plan mode to write a codebase-grounded, gated Plan with deliverables and unit tests per gate. Starts from an existing PRD, an uploaded one, or none. Use when the Developer wants to plan or design how to build a Feature."

**Stage A: PRD intake (the first thing the skill does)**

1. Find the Feature folder. Then follow the first path that applies:

   | Situation | What happens |
   |---|---|
   | A `prd.md` exists | Use it (offer `craft-prd` first if it's clearly unfinished) |
   | No `prd.md` | Ask: "Do you already have a PRD or spec somewhere? You can upload or paste it (file, doc, ticket, Notion page)." |
   | The Developer provides one | **Import it**: convert it to the `prd.md` format with `R-n`/`AC-n.m` IDs and `origin: imported`, keeping the original wording where possible. List what was missing (for example "no ACs for errors" or "no out of scope"), and ask up to 3 questions to fill the most important gaps. Then ask for Approval |
   | The Developer has none | Encourage `craft-prd` in one line: it takes about 10–15 minutes and makes the Plan and tests much better. If they agree, hand over to it and return afterwards |
   | The Developer declines | Run a **captured PRD** (§3.9): draft Requirements and ACs from the idea and the code, at most 5 confirming questions, then `origin: captured`. Then the technical conversation. It's kept alongside the Plan, so tests and docs still have a Spec to work from |

2. Read `brief.md` if it exists. Its use cases, Invariants and security challenges carry straight into the design.

**Stage B: silent groundwork (before saying anything technical)**

3. **Mode:** look for manifest files from any ecosystem, and state what was found (stack, language, test runner):
   - `package.json`
   - `pyproject.toml`, `requirements.txt`
   - `go.mod`
   - `Cargo.toml`
   - `pom.xml`, `build.gradle(.kts)`
   - `Gemfile`
   - `composer.json`
   - `*.csproj`, `*.sln`
   - `mix.exs`, `pubspec.yaml`, `Package.swift`
   - plus source folders and git history

   A monorepo can have several. The Developer can force a mode ("plan as greenfield", for example a new service inside an old repo). The mode can be switched mid-plan.
4. **Project profile:** create `.craft/project.md` if it's missing (stack and versions, folder map, conventions, run and test commands, where auth and data access live, existing infrastructure such as queues, schedulers, caches and event buses, and the date), or read it. `refresh profile` regenerates it.
5. **Explore the code** (existing mode):
   - how similar features are built
   - reusable services, modules, libraries and UI components
   - existing infrastructure (Kafka/queues, cron/job runners, websockets, caches, feature flags)
   - validation and error-handling patterns, test setup, auth and middleware

   Accept folder hints for large repos.

**Stage C: the design conversation**

The architect leads with proposals and the Developer reacts. It uses the one-turn-at-a-time shape from §3.6 (substance, then one way forward), with one design decision per turn.

6. **Feasibility and reuse readout.** The architect opens with what it found:
   - Can this be built as described? The hard parts, the unknowns, anything risky or expensive.
   - What can be **reused**, and what must be new. Reuse is always the first option considered.
   - What the existing stack already gives (for example "you already run BullMQ and a cron worker, so no new infrastructure is needed").
7. **Proposed architecture.** One recommended solution and 1–2 alternatives, side by side:
   - how it works end to end, as a short ASCII flow or sequence per main use case
   - trade-offs: complexity, cost, operational burden, team familiarity, scale headroom
8. **Key decisions, one per turn.** For example: sync API or background job; a plain queue or Kafka and event-driven design; cron or event-triggered; polling, SSE or websockets for live updates; where state lives; a cache or not; how idempotency and retries work.
   - Each decision gets options, a recommendation and the reason, plus the cost of being wrong.
   - When the Developer proposes a technology ("let's use Kafka"), the architect evaluates it honestly against the actual need. It agrees, or it argues for something simpler, with reasons.
9. **Cross-cutting checks.** Briefly cover each of these, skipping what's obviously not relevant:
   - failure handling: timeouts, retries, dead letters, partial failure, compensation
   - data model and migrations
   - security and trust boundaries
   - observability: logs, metrics, alerts
   - scale numbers
   - cost
   - rollout and rollback, and feature flags
10. **Design summary.** A one-screen playback of the agreed design for a final "yes" or corrections, before anything is written.

**Stage D: hand off to the host's plan mode, which writes the Plan**

The conversation decides *what* to build and *how*. The host's plan mode, Claude Code's or Cursor's, writes the detailed Plan. `craft-plan` doesn't impose a template. It gives plan mode a precise brief and a quality bar, so the result reaches the level of a carefully hand-built plan.

11. **Size:** `small` or `large`. Large if any of these apply: about 10 or more files, more than one independently shippable piece of work, a schema migration, a new external dependency or infrastructure component, or a change to auth or payments.
11b. **Ask the Developer about gating**, as one question through the native prompt (§3.6):

    | Option | Means |
    |---|---|
    | **Hard gates** *(Recommended for large)* | Work split into gates. Each gate stops once its exit checklist is green, and the Developer says continue |
    | **Checkpoints** | Same gates and checklists, but the builder continues automatically when a checklist is green, and reports each one |
    | **No gates** *(Recommended for small)* | One implementation sequence, with tests listed per step and a final exit checklist |

    The answer is recorded as `gating:` in `plan.md`.
12. **Hand off, from whichever mode the skill is in.** The hand-off lives on disk and in the conversation, never in the mode. So the same result comes out whether the Developer started in normal mode or was already in plan mode. See **Mode-aware flow** below.
13. **Plan mode writes the Plan** from the hand-off and **[`planning-standards.md`](../../skills/craft-plan/references/planning-standards.md)**: what every Plan must contain (inputs accounted for, scope checklist, decisions with reasons, flows and real files, invariants enforced in code and database with tests, transition tables, failure-mode tables, security, concrete numbers, a test matrix covering every AC, risks, done, readiness). With gates, it also includes deliverables, files, steps, test IDs, an exit checklist and unblocks per gate. Large Plans add guardrails, release flows and scope tiers. **Its first step is always Step 0: save.**
14. **Check before presenting.** Plan mode runs the standards' "Done when" checklist.
15. **Consent to build.** The Developer approves through the host's own plan approval (Claude Code's plan approval, Cursor's equivalent). Execution then starts with **Step 0**:
    - write the Plan verbatim to `plan.md` with the wrapper frontmatter (§3.3)
    - write the Plan's guardrails to the local-only agent rules file, so every build thread follows them
    - write any held files
    - delete the hand-off file
    - start Gate 1, or the first step

    With hard gates, the agent stops at each gate's exit checklist and waits for the Developer to continue. Step 0 also records `prd_updated` in the Plan's frontmatter.
16. For hard-to-reverse decisions (for example adopting Kafka, or a new datastore), the Plan includes an ADR among Step 0's files, in `.craft/adr/`. The Developer can export it to the project's own ADR folder if they keep one.

**Mode-aware flow.** At the start, `craft-plan` notes whether plan mode is active: the host says so, or file edits are blocked. It then follows one of these paths:

```
 A. Started in NORMAL mode                        B. Started INSIDE plan mode
 ─────────────────────────                        ───────────────────────────
 Stages A–C: conversation; writes as it goes      Stages A–C: same conversation (reading code
   (project profile, imported/short PRD)            and asking questions both work in plan mode)
 Write hand-off: .craft/handoff/<slug>.md           Writes are blocked → every file it would
   (design summary, size, gating,                   have written is HELD, listed for Step 0
    PRD/brief paths, held files: none)            No hand-off file needed: everything is
            │                                       already in this conversation
            ▼                                                 │
 Switch to plan mode:                                         │
   Claude Code → the skill requests it itself                 │
                 (EnterPlanMode), Developer approves          │
   Cursor      → "Your turn" block (§3.10): how to switch     │
                 to Plan, then the line to send: "plan        │
                 bulk-invite from .craft/handoff/…"; waits      │
            │                                                 │
            └────────────────────────┬────────────────────────┘
                                     ▼
            Plan mode reads the hand-off (or the conversation)
            plus planning-standards.md, explores code, writes the Plan
            into the host's plan file, Step 0 first
                                     ▼
            Developer approves in the host's own plan approval
                                     ▼
            Execution: Step 0 saves plan.md and held files and deletes
            the hand-off, then Gate 1 (stops at its exit if hard gates)
```

- **Why the hand-off file:** a mode switch can lose detail. Long conversations get compacted, and the Developer may switch in a fresh chat, especially in Cursor. The file carries the agreed design, so plan mode always starts from the full picture. It's deleted in Step 0.
- **If the Developer declines plan mode:** the agent writes the Plan in normal mode under the same standards, presents it, and waits for an explicit go-ahead. Then it saves `plan.md` and stops.
- **If the Developer goes straight to plan mode without `craft-plan`:** on its first run, `craft-plan` offers (once, with permission) to add a single line to the Developer's **local-only** agent rules: `CLAUDE.local.md` for Claude Code, and a `.cursor/rules/craft.mdc` rule for Cursor. Each file is listed in `.git/info/exclude`, so it's never committed. The line reads: *"When planning a Feature, follow `.craft/planning-standards.md` and read its folder under `.craft/features/` first."* It also copies the standards to `.craft/planning-standards.md`, refreshed whenever `craft-plan` runs, so both hosts can find them at a stable project path. Plain plan mode then still meets the bar. It just skips the architect conversation.

**The architect's principles** (`architect-guide.md`):
- Reuse before build.
- Boring, proven technology first.
- Every new infrastructure component must be justified by a concrete need, with its operational cost stated.
- Match the solution to real scale numbers, not imagined ones.
- Design for failure.
- Prefer reversible steps.
- Respect the existing stack and conventions.
- Say plainly when something is over-engineered, including the Developer's own idea.

**Technology choice guide** (`tech-choices.md`): when each option fits and when it's overkill:
- sync request vs background job
- in-process vs a queue (BullMQ, SQS, RabbitMQ) vs a log (Kafka)
- cron vs scheduled jobs vs event triggers
- polling vs SSE vs websockets
- cache placement
- SQL vs document stores
- event-driven designs and their consistency cost

**Guardrails:**
- No implementation code. Unit tests are specified, not written, with tests-first order recommended.
- Never recommends a technology without saying why it beats the simpler option.
- Treats technical claims the code can't confirm (library behaviour, limits) as assumptions to check.

**Conversation budget:** no hard question ceiling, because this is a design discussion. A typical Feature needs 5–10 decision turns. "you decide", "skip" and "enough, write the plan" always work.

**Folder:**
- `SKILL.md`
- `conversation-protocol.md`, `feature-folder.md`
- `prd-intake.md`: the paths above, plus how to import
- `architect-guide.md`, `tech-choices.md`
- `mode-existing.md`, `mode-greenfield.md`
- `project-profile-template.md`, `prd-lite-template.md`
- `planning-standards.md`: the quality bar handed to plan mode; not a template

### 4.4 `craft-challenge`: optional adversarial conversation

- **Description:** "Challenge a Feature's PRD and Plan before building: weak value, scope creep, contradictions, untestable acceptance criteria, missed edge cases, existing-system risk, abuse, feasibility, simpler alternatives, scale and rollback. Use when the Developer says challenge, stress-test or poke holes."
- **Steps:**
  1. Not in a continuous flow: ask the scope question first (§3.9). Then find the Feature folder and read whichever of `prd.md` and `plan.md` exist. If neither exists, challenge any document the Developer pastes or uploads; changes are then proposed in chat rather than applied to a file (§3.9).
  2. Run the challenge panel.
  3. Discuss one concern per turn (§3.6, at most 10 questions), blocking concerns first. Suggest a better alternative wherever a concern has one.
  4. Show the full change list, per document and numbered.
  5. One confirmation, through the question prompt:
     - **Apply all** *(Recommended)*
     - **Apply all, review later** (changed documents go to `draft`)
     - **Choose changes**

     Applying saves a `.history` copy of each document first.
  6. If a PRD change makes the Plan stale, the skill says so once (§3.5).
- **Guardrails:** writes no file of its own. Doesn't re-ask what the documents already answer. If nothing is blocking, say so and finish quickly.
- **Folder:** `SKILL.md`, `conversation-protocol.md`, `feature-folder.md`, `lenses.md`.

### 4.5 `craft-secure`: per-change security review

- **Description:** "Lightweight security review of a Feature's code changes against its Spec and threat model, with findings split into confirmed and needs-validation. Not a full audit. Use when the Developer asks for a security review of a Feature or PR."
- **Steps:**
  1. Not in a continuous flow: ask the scope question first (§3.9). In flow, find the Feature folder and the scope, using the first of these that applies:
     - the branch against its merge base
     - a PR number or commit range the Developer gives
     - the Plan's files touched
     - paths the Developer names

     In flow, ask only if the scope is still ambiguous, for example when on `main` with nothing uncommitted.
  2. Build the threat list: the Plan's `T-n` as a starting point, plus the PRD's security product rules, plus the brief's security challenges, plus anything new in the diff.
  3. Review authorization and access, injection, input validation and limits, secrets, sensitive data in responses and logs, SSRF and redirects, file upload, rate limiting and abuse, and newly added dependencies.
  4. Check that every planned mitigation exists in the code, and that no code path can break a confirmed Invariant from the brief (for example, a retry that moves money twice).
  5. Write `security.md`. Don't fix anything; that's `craft-fix`'s job.
- **Guardrails:** state the "not an audit" disclaimer. A Finding is `confirmed` only with a concrete code path. Offer Cloudflare's `security-audit` for a deep audit if it's installed.
- **Folder:** `SKILL.md`, `feature-folder.md`, `checklist.md`, `findings-template.md`.

### 4.6 `craft-test`: end-to-end tests and test report

- **Description:** "Generate and run Playwright end-to-end tests from a Feature's acceptance criteria, then write a test report listing Bugs and Spec gaps. Use when the Developer wants automated browser or e2e tests for a Feature."
- **Steps:**
  1. Not in a continuous flow: ask the scope question first (§3.9), and test only that scope. Then find the Feature folder and read the Spec's ACs (including `## Later changes`) and `.craft/project.md` (how to start the app, base URL, auth). **No PRD:** run a captured PRD first (§3.9), so the tests check behaviour the Developer confirmed, not whatever the code currently does.
  2. Detect the Playwright setup. If it's missing, propose installing it and ask before adding dependencies.
  2b. **Test data and login** (`test-data-and-auth.md`):
     - reuse the project's existing e2e setup and seed scripts if it has them
     - otherwise ask once how a test user signs in. Credentials come from environment variables only and are never written to files
     - tests create their own data through the app's API or UI, and clean it up
  2c. **Supported in v1:** web UIs and HTTP APIs. For other projects (CLI, library, mobile), it writes integration tests with the project's own test runner where possible. Otherwise it says plainly that v1 doesn't cover that project type.
  3. Generate one test per AC, titled with its ID. If a brief exists, also add one end-to-end journey test per critical use case (`U-n`), following its story. Tests go in `.craft/features/<slug>/e2e/`, with a small Playwright config there that extends the project's own config. The tests run without touching any project file. The Developer can ask to promote them into the project's test suite, which is then their committed code. ACs with no UI use API-level tests through Playwright's request fixture.
  4. Start the app as a background process (how is in `shared/host.md`), or use the configured URL. Run the tests with traces and screenshots on failure, then stop the app. Screenshots of passing key flows go to `assets/` for the product doc.
  5. Write `test-report.md`, classifying each failure (§3.3), and note the test files in the report so `craft-fix` can show what it changes.
- **Guardrails:** never run against production; require a local or staging URL. Don't change app code.
- **Folder:** `SKILL.md`, `feature-folder.md`, `playwright-setup.md`, `test-patterns.md`, `report-template.md`.

### 4.7 `craft-fix`: fix the Issues

- **Description:** "Fix a Feature's open Issues (confirmed security Findings from `security.md`, then Bugs and Spec gaps from `test-report.md`) or a bug the Developer describes, test-first: a failing regression test before every fix. Developer confirmation for security fixes, a checkpoint each cycle, and a final full test re-run. Use when the Developer asks to fix reported issues or a specific bug."
- **Inputs:** not in a continuous flow, the scope question comes first (§3.9): open Issues in a Feature's reports, a described bug, failing tests from the last run, or other. In flow, the Feature's reports.
  - A described bug becomes `B-n` in the Feature's `test-report.md`, when the bug belongs to a Feature.
  - It's reproduced as a failing regression test before any fix.
  - A bug outside any Feature gets a regression test, a fix and a chat summary only.
  - `craft-fix` never creates a Feature folder.
  - With no reports and no described bug, it offers `craft-secure` or `craft-test` (§3.9).
- **Order:**
  1. **Findings, in one review.** First, `needs-validation` Findings are shown to the Developer to confirm or reject. Then every confirmed Finding gets a proposed fix, and all the diffs are shown together. One prompt follows: **Apply all** *(Recommended)* · **Choose** · **None**. Fixed Findings are marked `fixed`. Security changes stay deliberate, without one click per Finding.
  2. **Bugs and Spec gaps, in a loop.**
     - Bug: reproduce with the single test, find the root cause, make a minimal fix, re-run that test.
     - Spec gap: ask the Developer what should happen, add the AC to the Spec under `## Later changes`, then fix and re-run.
     - Checkpoint with the Developer after each cycle (fixed / remaining / escalated).
  3. **Final run.** Re-run the full Feature suite and the unit tests, then update `test-report.md`.
  4. If a fix changes something the Plan describes, update `plan.md` and add a line to its change log.
- **Rules:**
  - Never weaken, skip or delete a test or assertion to make it pass. If the test is wrong, explain why and ask. Before the final run, the skill lists every test file it changed (`git diff` on the test paths), and each one needs the Developer's explicit OK.
  - At most 3 attempts per Issue, then mark it `escalated`.
  - At most 3 cycles, then stop and summarize.
- **Folder:** `SKILL.md`, `feature-folder.md`, `loop-rules.md`.

### 4.8 `craft-docs-eng`: technical document for engineers

- **Description:** "Write the engineering document for a built Feature: architecture, data flow, diagrams, API and data model changes, configuration, runbook, testing and security notes. Use when the Developer wants technical or developer docs for a Feature."
- **Sources:** the code (it wins on any disagreement), the Spec, the Plan and its change log, `security.md` and `test-report.md`. Not in a continuous flow, it asks the scope question first (§3.9). Run alone on a Feature built without the suite, it documents from the code and git history, plus the Developer's pointer to its scope (paths, routes, PR), and notes which sources were absent (§3.9).
- **Content:** overview; architecture and data flow; diagrams (architecture plus a sequence diagram per main flow); data model and API changes; configuration and env vars; runbook (deploy, roll back, monitor, common failures); how it's tested and how to run the tests; security notes; known limitations.
- **Diagrams:** use `diagram-design` if it's installed, otherwise inline Mermaid.
- **Output:** `engineering.md`. If `docs_target: notion` and a Notion connector is available, offer to publish it there. Markdown stays the source.
- **Folder:** `SKILL.md`, `feature-folder.md`, `eng-doc-template.md`.

### 4.9 `craft-docs-product`: document for product and non-engineers

- **Description:** "Write a plain-language document about a built Feature for product, support and business readers: what shipped, why, how to use it, what changed for End users, and known limits. Use when the Developer wants product-facing or non-technical docs."
- **Content:**
  - What and why (from the Spec's goal), and who it's for.
  - How to use it, with screenshots from `assets/`.
  - What changed for existing End users.
  - Limits and edge-case behaviour, in plain words.
  - Rollout notes and a support FAQ.
  - The Spec's goals compared with what shipped.
- **Evidence rule:** an AC is described as shipped only if its test passed in the latest `test-report.md`. Every other AC goes under "Not yet verified". If `test-report.md` is older than the latest code change to the Feature, ask the Developer to re-run `craft-test` first.
- **Scope:** not in a continuous flow, it asks the scope question first (§3.9).
- **Run alone** (no PRD or no test report): it takes the what and why from the Developer and the code. A banner reads "Described from the code; not verified by tests", and it offers `craft-test` for verified claims. Unverified behaviour is never presented as tested (§3.9).
- **Guardrails:** no code and no jargon.
- **Folder:** `SKILL.md`, `feature-folder.md`, `product-doc-template.md`.

### 4.10 `craft-flow`: router, and the "continue" entry for new threads

- **Description:** "Pick up where you left off, in any thread. Shows where each Feature is in the Shipcraft flow, and continues the next step: the next skill, or the next gate of the build. Use when the Developer says 'continue', 'next' or 'where am I', or starts a new thread mid-Feature."
- **Behaviour:**
  - Reads `.craft/state.md`, or rebuilds it from the artifacts if it's missing. Shows the resume card and asks the resume question (§3.11).
  - Derives each stage's status from the artifacts (file present, frontmatter status, gate statuses) plus skip reasons in `.craft/state.md`.
  - **Continues a stage:** runs the next skill, which resumes from its saved progress.
  - **Continues the build:** building isn't a skill, so `craft-flow` hands the host agent a precise instruction, for example *"Build Gate 3 of `.craft/features/recurring-tasks/plan.md` from step 2. Read only the guardrails, the invariants and Gate 3's section."* The gate's exit then updates the state.
  - Records "skip X because Y".
- **Guardrails:** does no stage work and never builds, fixes or overwrites without the Developer's consent.
- **Folder:** `SKILL.md`, plus the shared files.

---

## 5. Repository layout

Modelled on `mattpocock/skills` and the Agent Skills specification, so the repo looks and installs like the ones people already trust.

```
shipcraft/
├── .claude-plugin/        plugin.json (name, version, skills list), marketplace.json
├── skills/
│   └── craft-prd/         SKILL.md · references/*.md · assets/*-template.md, assets/example-*.md
│       (same shape for craft-plan, craft-explore, craft-flow, craft-challenge;
│        v0.2: craft-secure, craft-test, craft-fix, craft-docs-eng, craft-docs-product)
├── shared/                ux.md, conversation-protocol.md, feature-folder.md, resume.md, host.md, manifest.json
│                          (canonical sources; sync copies them into each skill's references/)
├── docs/                  craft-prd.md … (one page per skill), journey.md, examples/recurring-tasks/, assets/,
│                          design/roadmap.md, design/build-plan.md, adr/
├── evals/                 <skill>/evals.json (official format), fixtures/{tasks-node,tasks-py,empty}/, seeds/,
│                          rubrics/, calibration/, run.cjs, checks.cjs, judge.cjs, results/,
│                          journeys/recurring-tasks.md   (workspaces, gitignored: <skill>-workspace/iteration-N/)
├── scripts/               sync-shared.cjs, sync-plugin-version.cjs, lint-language.cjs (+ .allow), lint-skills.cjs, lint-docs.cjs
├── test/                  node:test for sync, lints, checks
├── .github/               ISSUE_TEMPLATE/{bug,idea,config}.yml, workflows/{ci,release}.yml
└── README.md · LICENSE · CHANGELOG.md · CONTRIBUTING.md · AGENTS.md · CLAUDE.md (→ AGENTS.md) · GLOSSARY.md · SCOPE.md
```

**Skill format** follows the Agent Skills specification exactly: the frontmatter `name` equals the folder name, `description` is at most 1,024 characters and says "Use when …", plus `license: MIT` and `metadata.version`. Docs the skill loads on demand go in `references/`, templates and golden examples in `assets/`, and there is no `scripts/` folder. Every skill passes `skills-ref validate` and is listed in `plugin.json`.

**Install model.** Claude Code: the plugin from this repo's marketplace, which updates itself. Cursor and other agents: `npx skills@latest add <owner>/shipcraft -g -a <agent>`. **Use `-g`**: the installer's default is project level, which writes `.claude/skills/` and `skills-lock.json` into the project as untracked files (Gate 0, SP-07). There is no setup step; the first skill run creates `.craft/`.

---

## 6. Scripts

**Nothing executable ships to users.** Skills are pure Markdown. Rules that a runtime script might have enforced (saving history, avoiding secrets, one question per prompt, never writing outside `.craft/`) are instructions in the skills, **verified by transcript checks in the evals** (§8). If dogfooding shows drift that evals can't catch, Claude Code hooks are the next step, added only for proven drift.

**Repo scripts** (in `scripts/`, plain JavaScript with `// @ts-check`, zero dependencies, not installed):

| Script | Does |
|---|---|
| `sync-shared.cjs` | Copies `shared/` into each skill's `references/` according to `shared/manifest.json`. `--check` fails if any copy differs (runs in CI) |
| `sync-plugin-version.cjs` | Keeps `plugin.json` and each skill's `metadata.version` equal |
| `lint-language.cjs` | Fails if skill text uses a term from the *Avoid* lists in `GLOSSARY.md`. Per-term patterns and an allow file; template comments and code blocks are skipped |
| `lint-skills.cjs` | Fails if a `SKILL.md` exceeds 150 lines or its description exceeds 100 words, names a host tool outside `host.md`, points to a reference that doesn't exist, or if `skills/` contains anything that isn't Markdown |
| `lint-docs.cjs` | Fails if a *released* skill has no `docs/<skill>.md` page or README row, or if any doc link or image is broken |

CI also runs the official `skills-ref validate` on every skill, `claude plugin validate` on the manifests, `tsc --noEmit`, and `node --test`.

---

## 7. Build phases

The build sequence is gated and lives in [build-plan.md](build-plan.md): G0 spikes, G1 simplify the design, G2 repo and tooling, G3 shared contract, G4 eval harness, G5–G10 the planning-half skills (`craft-prd`, `craft-plan` in two parts, `craft-explore`, `craft-flow`, `craft-challenge`), G11 Cursor and parity, G12 dogfood and head-to-head, G13 docs and the v0.1 release, G14 launch; v0.2 follows with `craft-secure`, `craft-test`, `craft-fix` and the docs skills.

**Two releases.** v0.1 is the planning half, released after a week of real use. v0.2 is the prove-it half. Realistic estimate: about 5–7 weeks for v0.1 and 3 more for v0.2, for one person plus Claude Code.

---

## 8. Testing the skills

**Output quality is measured, not hoped for.**
- **Golden examples.** Every skill that produces an artifact ships a short golden example in its `assets/` (`example-brief.md`, `example-prd.md`, an example plan gate, and in v0.2 the security, test-report and doc examples), all drawn from the reference journey. The skill reads it as its quality bar.
- **Rubrics.** `evals/rubrics/<artifact>.md` scores each artifact from 1 to 5 on named criteria. For a PRD: problem clarity, testable ACs, edge-case coverage, scope discipline, no invented evidence. For a Plan: the planning standards' "Done when" checklist, decision quality, buildability.
- **Scoring.** An LLM judge (median of three runs, evidence quotes required, calibrated against human-scored samples) scores every eval output. **Release threshold:** an average of at least 4 per artifact, and no criterion below 3.

**Official eval format.** Cases live in `evals/<skill>/evals.json` (prompt, expected output, files). Multi-turn fields (persona, answer sheet, start mode, checks, rubric) sit in an `extra` object. Every case runs **with and without the skill** into `<skill>-workspace/iteration-N/eval-<id>/{with_skill,without_skill}/`, producing `outputs/`, `timing.json` and `grading.json`. The `without_skill` run is also the "plain plan mode" baseline for the head-to-head.

**Transcript checks**, run on every eval, stand in for runtime scripts:

| Check | Verifies |
|---|---|
| TC-ONEQ | Exactly one question per prompt |
| TC-GIT | `git status --porcelain` shows nothing from Shipcraft |
| TC-HIST | A `.history` copy exists before every overwrite |
| TC-SECRET | No secret-looking strings in `.craft/` |
| TC-CEIL | Question count stays under the ceiling |
| TC-NOWRITE | No Plan is written before the design summary is confirmed |
| TC-STEP0 | The Plan starts with Step 0 |
| TC-NOPROMPT | No question prompts in `craft-explore` |
| TC-UX | Opening and closing lines match `ux.md` |

**Fixtures.** A small task tracker, in two stacks, plus `empty`:
- `tasks-node` (Express + SQLite) and `tasks-py` (FastAPI + SQLite): login, projects, tasks, member invites, and a daily-digest job table with a cron worker.
- Seeded problems: a task readable across teams (IDOR) and a CSV import with no row limit.
- The reference journey is **recurring tasks**: schedules, duplicates, timezones and what happens on a missed run.

**Also tested:** both situations (new product on `empty`, a Feature added to an existing product on the fixtures); two stacks for planning, security, test and fix; trigger tests (five phrases that should load each skill and five that shouldn't, including near misses such as "plan this refactor"); cold starts versus in-flow runs (§3.9); parity between hosts judged by rubric, never by text diff; and a human smoothness run of the reference journey in each host, switching host midway.

## 9. README and documentation

The repo is public, so the README is the product's front door. Readers are developers who've never seen Shipcraft. **Less text, more examples:** every claim is shown, not just stated.

### 9.1 Writing rules

- **Show, then tell.** Every section leads with an example (a command, a short exchange, a file snippet), followed by at most 2–3 lines of explanation.
- **Benefit first.** Each skill is introduced by the problem it removes, not by how it works internally.
- **Plain words.** Internal terms are explained once, in passing ("the Spec, meaning your PRD"). No other jargon.
- **Scannable.** Tables, short bullets, and headings phrased as questions where it helps ("Where are my files?"). The README itself reads in about 3 minutes; depth lives in per-skill pages.
- **Real, not invented.** Examples come from the reference journey (`evals/journeys/recurring-tasks.md`), and GIFs or screenshots come from real runs in both Claude Code and Cursor.
- **Kept true.** Every command in the docs is run during the release check, and every link resolves (`lint-docs.cjs`).

### 9.2 `README.md` structure

| # | Section | Contents |
|---|---|---|
| 1 | **Title** | Name, tagline (*Plan it. Build it. Prove it. Ship it.*), and one sentence: "Skills for Claude Code and Cursor that take a feature from idea to shipped, tested and documented code." |
| 2 | **Why use it** | 5–6 pain → relief pairs, one line each:<br>• "AI builds from vague ideas" → explore + PRD turn an idea into testable requirements in about 15 minutes<br>• "Plans miss edge cases, retries and security" → an architect conversation plus planning standards<br>• "Context gets lost between chats" → everything is saved; say "continue" anywhere<br>• "Is it really done?" → a browser test per requirement, a security review and a fix loop<br>• "Nobody writes docs" → engineering and product docs written from the real code<br>• "Clutter in my repo" → nothing it creates is ever committed |
| 3 | **See it in 30 seconds** | A GIF or a 10-line exchange: an idea typed → one question with a recommended answer → a PRD file appears |
| 4 | **Install** | See 9.3 |
| 5 | **Quickstart** | The three depths as copy-paste paths:<br>**Express:** `/craft-plan add CSV export to reports`<br>**Standard:** `/craft-prd …` → `/craft-plan`<br>**Full:** `/craft-explore …` → `/craft-prd` → `/craft-plan`<br>Then "build", and `/craft-secure` → `/craft-test` → `/craft-fix` → `/craft-docs-eng` and `/craft-docs-product` |
| 6 | **The skills** | One table: skill · use it when · you get · link to its page (9.4). Ten rows, one line each |
| 6b | **See real output** | A link to `docs/examples/recurring-tasks/`: the actual brief, PRD, Plan, security review, test report and both docs from the reference journey, so readers can judge the quality before installing |
| 7 | **A real example** | The recurring-tasks journey condensed to about one screen, one exchange per stage, linking to the full walkthrough |
| 8 | **How it works** | Four short answers:<br>• *Where are my files?* `.craft/`, never committed<br>• *Can I skip steps?* Yes, every skill works alone<br>• *New chat?* Say "continue"<br>• *Claude Code vs Cursor?* The same flow; where Cursor needs a manual step, the skill tells you exactly what to do |
| 8b | **Works with your stack** | A small table: every skill works in any language. `craft-test` covers any web UI or HTTP API, whatever the backend. Non-web projects (CLI, library, mobile) get limited test support in v1, said plainly |
| 9 | **FAQ** | Do I need every step? · Does it change my repo? · Which stacks does it support? · Can I share a PRD with my team? · How long does a Feature take? · What does it cost in tokens? · Can I use my own PRD? |
| 10 | **Optional companions** | `diagram-design` and Cloudflare's `security-audit`: what each adds, with its install command |
| 11 | **Credits and license** | See 9.5 |

### 9.3 Installation guide (README §4)

Each part is short and copy-paste ready:
- **Requirements:** Node 18+ (for `npx`), plus Claude Code or Cursor.
- **One command:** `npx skills add <user>/shipcraft`. This installs at user level, so nothing is added to your project.
- **Check it worked:** type `/craft-flow` in a chat. You should see *"No features yet. Start with /craft-explore, /craft-prd or /craft-plan."*
- **Claude Code notes** and **Cursor notes:** where the skills appear, how slash commands look, and Cursor's manual plan-mode switch (shown by the skill when it's needed).
- **Update** and **uninstall:** one command each. What happens to `.craft/` (it stays until you delete it).
- **Troubleshooting**, as a table of symptom → fix: skills don't appear · no clickable questions (the plain-text fallback is used) · "can't switch to plan mode" · tests can't sign in.

### 9.4 Per-skill pages (`docs/skills/<skill>.md`)

One page per skill, each about one screen, all in the same shape:

```
# /craft-prd: turn an idea into a clear PRD

What it does     One sentence.
Use it when      …        Skip it when      …
Why it helps     2–3 bullets, each a benefit ("no requirement gets lost", "edge cases found before code")

How to use
  /craft-prd recurring tasks for my task app
  Anytime: say "you decide", "skip", "back" or "enough"

Example          5–10 lines of a real exchange, with the question prompt as it appears
What you get     The file path, plus a short snippet of it
Works alone?     What happens if earlier steps were skipped
Tips             2–3 lines
```

### 9.5 Credits and license

- The repo is MIT.
- A Credits section links to each repo and names the idea it inspired:
  - `mattpocock/skills`: composable skills, questions that come with a recommended answer, GLOSSARY.md and ADRs. Shipcraft deliberately asks one question at a time through the host's prompt instead of batching them.
  - `cloudflare/security-audit-skill`: short `SKILL.md` with on-demand references, the confirmed/needs-validation split, zero-dependency validators.
  - `cathrynlavery/diagram-design`: progressive disclosure, first-run gates, multi-host distribution.
  - Carlin Yuen, [*Writing PRDs and product requirements*](https://carlinyuen.medium.com/writing-prds-and-product-requirements-2effdb9c6def): the PRD structure behind `prd-template.md` (problem over solution, use-case-grouped requirements with P0/P1/P2, lifecycle journeys, measurable outcomes, at most 3 phases, a short document). The structure was adapted and rewritten, not copied.
- **No text or code is copied**, so no third-party notices are needed.
- An "Optional companions" section explains how to install `diagram-design` and Cloudflare's `security-audit`, and what each adds.

---

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Question fatigue | One question per turn, each with options. The ceilings are maximums, and the skill stops when coverage is complete. The panel resolves what it can, and Assumptions are shown instead of asked. "you decide" and "enough, draft it" are always available. Tuned during dogfood |
| Suggestions bloat the scope | At most one Suggestion per turn, each with a stated benefit. "Later" and ignored Suggestions go to `## Ideas for later`, not the Requirements |
| Gimmicky AI suggestions | AI is suggested only where it clearly beats rules, with cost, failure mode and fallback stated |
| The LLM states wrong domain "facts" (regulations, standards) during exploration | Every claim in `brief.md` is source-tagged. `llm (unverified)` claims need the Developer's confirmation, and downstream skills treat them as questions. Regulatory topics are flagged for checking against a primary source |
| `brief.md` grows into an unreadable transcript | The template is fixed and the brief is distilled, not logged: rules, challenges and leanings, not dialogue |
| `craft-fix` makes tests pass by weakening them | A hard rule against it, Spec gaps going to the Developer, attempt and cycle caps, a checkpoint each cycle |
| Removing `craft-check` hides scope creep and backend-only ACs | One e2e test per AC, including API-level tests for ACs without UI. Scope creep is accepted as out of scope for v1, and can be revisited after dogfooding |
| Plan and code drift apart | `craft-fix` and the Challenge update the Plan with a change log, and the code wins wherever they disagree |
| Per-skill install breaks shared references | The self-containment rule and `sync-shared.cjs` |
| Context bloat in large repos | The project profile, mode files loaded only as needed, folder hints, short `SKILL.md` files |
| A stale project profile | Its date is shown at the start of each `craft-plan` run, and `refresh profile` regenerates it |
| The architect over-engineers (Kafka for 10 events a day) | "Reuse before build" and "boring first" principles, every new component justified by a concrete need with its operational cost, a "simplest thing" skeptic on the panel, and an eval for it |
| An imported PRD loses meaning when converted | The original wording is kept where possible, gaps are listed explicitly, and the Developer approves the converted version |
| Skipping the PRD weakens tests and docs | A short PRD is still captured during the design conversation, so every downstream skill has ACs |
| Claude and Cursor behave differently | The experience contract (§3.10), with every difference isolated in `shared/host.md` and a one-line degrade. A parity check and a smoothness run block every release |
| Playwright setup friction | Detect it first, ask before installing, use API-level tests where there's no UI |
| Security output mistaken for an audit | A disclaimer, the confirmed/needs-validation split, a pointer to Cloudflare's skill |
| `npx skills add` doesn't work for Cursor | The Phase 0 spike, before any other work |
| Working documents are local, so teammates don't see them in PRs | Deliberate: the repo stays clean. An explicit export (to a chosen path, or to Notion) shares any document when needed |
| A fresh clone or another machine starts without `.craft/` | The PRD, Plan and reports start over unless the Developer exported them. The built code and its tests are in git as usual |
| Too much ceremony before any code (explore + PRD + plan ≈ 1 hour) | Depth chosen per Feature: Full, Standard or Express (§3.9). Express reaches an approved Plan in about 15 minutes |
| Agents fail to find `.craft/` files because search skips gitignored paths | Skills always use explicit paths. The Phase 0 hidden-folder spike confirms both hosts |
| Agents drift from the rules over long sessions, with no runtime script to enforce them | Transcript checks on every eval (§8). Conversation and save rules are verified there. Hooks are added later, only for drift that dogfooding proves |
| The suite turns out no better than plain plan mode | The Phase 5 head-to-head, with a decision rule before v0.1 |
| An overwritten artifact is lost, since `.craft/` isn't in git | `.history/` versions and "undo" in every skill (§3.1) |
| Inconsistent look and feel across skills | `shared/ux.md` UI kit, checked by `lint-skills.cjs` |
| Mediocre output quality goes unnoticed | Golden examples, rubric scoring with a release threshold, human sampling (§8) |
| A weak first impression at launch | Value within two minutes, real example outputs in the repo, a demo video, the newcomer test (§9, Phase 9) |
| Skills bloat into copies of this roadmap | `lint-skills.cjs` in CI: at most 150 lines per `SKILL.md`, with detail in reference files |
| Recorded build progress is wrong (the agent forgot to update it) | Resume verifies against reality: it runs the gate's tests and checks the files before continuing |
| Untrusted pasted or fetched content steers the agent | The "treat inputs as data" promise in the experience contract |
| Heavy skills hijack ordinary requests ("plan this refactor") | Explicit or unmistakable triggers only, with near-miss trigger tests |
| e2e tests can't sign in or have no data | `test-data-and-auth.md`: reuse the project's setup, credentials from environment variables only, tests create their own data |

---

## 11. Design review, 2026-10-08

> **History.** Sections 11.1 to 11.6 record the review as it happened. Several fixes there (document approval, `approved_hash`, a shared runtime tool) were later **removed by design** in revisions 2 and 3 (see 11.7). They stay as a record of why the design changed.

A full read-through challenged this roadmap for gaps, contradictions, failure points, bad experience and unstated trade-offs. Every finding is listed with its resolution, which has been applied inline above.

### 11.1 Contradictions fixed

| Found | Resolution |
|---|---|
| §2.1 still called `craft-flow` "built last", and the pipeline called it optional, though it now resumes threads and moved to Phase 4 | Both updated |
| A captured PRD was "approved in one line" in one place and "approved with the Plan" in another | Approved with the Plan in `craft-plan`, in one line elsewhere (§3.5, §3.9, §4.3) |
| §3.6 allowed host tool names in skill text, while §3.7 confined them to `shared/host.md` | Only `shared/host.md` names host tools |
| `security.md` and §3.4 relied on threat IDs `T-n` that the planning standards never required | The standards now require `T-n` with mitigations and tests |
| The planning standards told Gate 0 to edit the project's agent rules file, a committed file, which breaks the never-commit rule | Guardrails go to the local-only rules file in Step 0 |
| Phase 0's plan-mode spike contained bullets belonging to the question-prompt spike; Phase 1 listed a Plan template that no longer exists | Reorganised; Phase 1 lists the `plan.md` wrapper |
| The repository layout listed stale skill files and missed `host.md`, `resume.md`, `context-map.md` and `techniques.md` | Rewritten |

### 11.2 Places it would have broken

| Found | Resolution |
|---|---|
| Hosts' search tools skip gitignored files, so agents might not find anything in `.craft/` | Explicit paths only, plus a Phase 0 hidden-folder spike (§3.1) |
| `npx skills add` at project level would put skill files in the repo, against the never-commit rule | User-level install by default; project-level installs are git-excluded (§2.1), plus an install spike |
| Manual edits to an approved PRD or Plan went undetected | `approved_hash` (§2.2) |
| Changing an approved PRD left the Plan built on it silently stale | Cascade to `needs-review` (§2.2) |
| `craft-test` had no answer for signing in or test data, and assumed every project is a web app | Test data and login step, background app start, v1 scope stated (§4.6) |
| Resuming trusted a progress note the agent may have forgotten to update | Trust but verify, with step checkboxes in `plan.md` (§3.11) |
| Explore or PRD run inside plan mode held writes that a thread ending would lose | A Your turn block to leave plan mode first (§3.7) |
| Branch switches, monorepos and worktrees were unaddressed | Branch recorded and warned on, `.craft/` at the git root, per-package profile; worktrees noted as a limitation (§3.1) |
| Nothing stopped secrets landing in `.craft/`, or pasted content steering the agent | No secrets rule (§3.1); inputs treated as data (§3.10) |

### 11.3 Experience improved

| Found | Resolution |
|---|---|
| About an hour of conversation before any code, for every Feature | Depth per Feature: Full, Standard or Express (§3.9) |
| Approval fatigue: captured PRD, Challenge re-approval, every security fix, every hard gate | Approvals combined where safe (§2.2, §4.4, §4.7); hard gates opt-in |
| Chattiness: openings, closings, recaps, checkpoints and fresh-thread hints stacking up | "Quiet by default" (§3.10) |
| Developer controls ("you decide", "skip", "back", "enough") were undiscoverable | Named once in each skill's opening line |
| Heavy skills could hijack ordinary requests | Trigger policy and near-miss tests (§8) |
| The inner panel and sub-agents on every turn would be slow and costly | The panel runs at the start and on deltas; sub-agents only for large Features (§3.6) |
| The parity check demanded identical LLM output, which is impossible | Rubric-based parity plus headless automation where possible (§8) |
| One big release after every phase | v0.1 is the planning half after dogfooding; v0.2 is the prove-it half. A realistic estimate of 5–7 weeks (§7) |

### 11.4 Trade-offs accepted, stated plainly

- **No team visibility.** PRDs, Plans and reports never appear in pull requests. Sharing is an explicit export.
- **No CI enforcement.** CI can't see `.craft/`, so gates are conventions plus an optional local pre-commit hook.
- **Plan quality depends on the host's plan mode and model.** The standards set the bar, and `craft-tools.cjs validate` checks only the anchors downstream skills need.
- **No static "build vs Spec" review** since `craft-check` was removed. Scope creep can go unnoticed; per-AC tests catch missing behaviour, not extra behaviour.
- **One developer per Feature.** Shared editing of the same PRD or Plan across people isn't supported in v1.
- **Web UIs and HTTP APIs only** for `craft-test` in v1.
- **Cursor may need manual mode switches** that Claude Code does itself. Handled with a Your turn block, not hidden.

### 11.5 Second pass

| Found | Resolution |
|---|---|
| `approved_hash` assumed the LLM could compute a hash, which it can't do reliably | `craft-tools.cjs hash` computes it. Without Node, an approved copy is kept and compared (§6) |
| Scripts lived inside single skill folders that other skills also needed, which breaks self-containment | One shared `craft-tools.cjs`, copied into every skill (§6) |
| The most important rules depended only on the agent remembering them over long sessions | Script drift checks at every skill's opening and closing, plus a test-change snapshot that enforces "never weaken a test" (§6) |
| The suite's core bet (better results than plain plan mode) was never tested | Phase 5 head-to-head with a decision rule before v0.1 (§7) |
| Nothing stopped skills from bloating into copies of this roadmap | `lint-skills.cjs` in CI (§6) |
| Phase 0 blocked all work on unconfirmed Cursor behaviour | Claude Code must be confirmed; Cursor gaps are recorded as *assumed* and must be confirmed before the v0.1 release (§7) |

### 11.6 Launch-quality pass

| Found | Resolution |
|---|---|
| No defined first-run experience; time to first value unknown | "Value in the first two minutes" and a 3-line first-run welcome (§3.10) |
| Every skill could format its messages differently | `shared/ux.md` UI kit for every recurring message (Phase 1) |
| `.craft/` isn't in git, so a Challenge or fix overwriting a PRD was unrecoverable | `.history/` versions plus "undo" and "show history" (§3.1) |
| Output quality had rules but no bar to aim at and no measurement | Golden examples per artifact, rubrics, LLM-judge scoring with human sampling, and a release threshold (§8) |
| New products and additions to existing products weren't both proven | Every journey eval runs in both situations (§8) |
| Failures could surface as raw errors | "Recover, don't crash" (§3.10) |
| Nothing let readers judge quality before installing, and there was no launch plan | Real outputs in `docs/examples/`, published rubric scores, and Phase 9: assets, community setup and launch posts |

### 11.7 Revisions 2 to 4 (build planning, 2026-10-08)

| Change | Why |
|---|---|
| **Removed the document approval flow**: statuses, `approved_hash`, re-approval, the cascade, the gate script (D-1, D-2). Consent now exists only to act: plan-mode approval, the pause between gates, confirming edits and security fixes | Simpler for users, fewer failure modes. A stale PRD is a notice (`prd_updated`), never a block |
| **Removed the runtime tool `craft-tools.cjs`** (D-3). Skills are pure Markdown | Matches the reference repos, and nothing executable ships to users. Rules once enforced by the tool are verified by transcript checks in the evals instead |
| **Adopted the Agent Skills specification and the official eval format** (D-18, D-19) | A recognised standard builds trust and works in every compliant host |
| **Standard repo shape** (D-20, D-21): plugin manifests, `skills/`, `docs/<skill>.md`, `AGENTS.md`, `GLOSSARY.md`, `SCOPE.md`; design records moved to `docs/design/` | Mirrors the repos people already trust |
| **Install at user level** (`-g`) | Spike SP-07: the installer's default adds untracked files to the project |
| **Fixture domain** is a task tracker and the reference journey is recurring tasks | Simpler to understand, with real edge cases |
| **Renamed to Shipcraft** (`craft-`, `.craft/`) | Spike SP-01: `mrtblount/Spec-to-Ship` already exists with a near-identical idea and name |

