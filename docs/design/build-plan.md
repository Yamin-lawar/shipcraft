## Gate status

| Gate | Name | Status |
|---|---|---|
| G0 | Spikes | passed (two Claude Code items and Cursor deferred to G4, G2 and G11) |
| G1 | Simplify the design | passed |
| G2 | Repo and tooling | passed |
| G3 | Shared contract | exit checks done, awaiting the Developer's review |
| G4 | Eval harness and fixtures | pending |
| G5 | sts-prd | pending |
| G6 | sts-plan, part 1 | pending |
| G7 | sts-plan, part 2 | pending |
| G8 | sts-explore | pending |
| G9 | sts-flow and resume | pending |
| G10 | sts-challenge | pending |
| G11 | Cursor and parity | pending |
| G12 | Dogfood and head-to-head | pending |
| G13 | Docs and v0.1 release | pending |
| G14 | Launch v0.1 | pending |
| G15 | v0.2: sts-secure | pending |
| G16 | v0.2: sts-test | pending |
| G17 | v0.2: sts-fix | pending |
| G18 | v0.2: docs skills | pending |
| G19 | v0.2: release | pending |

---

# SpecToShip build plan (v0.1 detailed, v0.2 outlined)

| | |
|---|---|
| Builds | The SpecToShip skill suite, as designed in `ROADMAP.md`, simplified by Gate 1 |
| Size / gating | **Large · hard gates.** Each gate stops at its exit checklist, and the next starts when the Developer says continue |
| Detail | G0–G14 (through the v0.1 release and launch) fully detailed. G15–G19 (v0.2) outlined, detailed after dogfooding |
| Estimate | v0.1 ≈ 5–7 weeks, v0.2 ≈ 3 weeks (one Developer plus Claude Code) |

**Revision 2** (from the Developer's comments on revision 1):
- **No approval flow in the skills.** Document statuses (draft, approved, needs-review), approval hashes, gate checks and re-approval are removed. The host's own plan-mode approval and the build gate pauses stay.
- **No runtime script.** Skills ship as pure Markdown. Installation and use are as simple as `mattpocock/skills`: a Claude Code plugin, or `npx skills add` for Cursor, with zero setup.
- **This repo's build plan is committed** (`docs/design/build-plan.md` since revision 3). Only *users'* projects get the self-ignoring `.sts/`.
- **No business or client names anywhere.** The reference plan is called "the private reference plan".
- **Fixture domain:** a simple task tracker. The example journey becomes "recurring tasks".
- **Skill order:** `sts-prd` first, at the builder's discretion, which the Developer approved.

**Revision 4** (Gate 0 finding, 2026-10-08): `mrtblount/Spec-to-Ship` already exists with a near-identical idea and name. **The product is renamed Shipcraft.**
- Repo `shipcraft`, skills prefixed `craft-` (`/craft-prd`, `/craft-plan`, `/craft-explore`, `/craft-flow`, `/craft-challenge`; v0.2: `craft-secure`, `craft-test`, `craft-fix`, `craft-docs-eng`, `craft-docs-product`), hidden folder `.craft/` in users' projects.
- Everywhere this plan says SpecToShip, `sts-` or `.sts/`, read Shipcraft, `craft-` and `.craft/`. Gate 1 step 1.0 makes the change mechanically.
- Spike results are in `evals/spikes.md`. Notable: `npx skills add` installs **project-level by default** and adds `skills-lock.json`, so the README must use `-g` (D-4).

**Revision 3** (the Developer: "our repo must be very standard, so people trust it and use it"):
- **The official Agent Skills specification is the contract.** Every skill:
  - has a `SKILL.md` whose frontmatter `name` matches its folder and whose `description` is ≤1,024 characters, plus `license` and `metadata.version`
  - puts reference docs in `references/` and templates and examples in `assets/`
  - passes the official `skills-ref validate` in CI
- **The official eval format.** `evals.json` holds the prompt, expected output and files. Every case runs **with and without the skill**, and results go into `iteration-N/` workspaces with `grading.json` and `timing.json`. Our simulated Developer and rubrics extend this format, never replace it. Eval material sits outside the skill folders, so installs stay small.
- **A standard repo shape, mirroring `mattpocock/skills`:**
  - `.claude-plugin/plugin.json` (listing every skill) and `marketplace.json`
  - `skills/<skill>/`, and `docs/<skill>.md` per skill
  - `README.md`, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`, `AGENTS.md` (with `CLAUDE.md` pointing to it), `GLOSSARY.md` (was `CONTEXT.md`), `SCOPE.md`
  - `.github/ISSUE_TEMPLATE/*.yml`, plus a release workflow with plugin version sync
- **Design documents move out of the root:** to `docs/design/roadmap.md` and `docs/design/build-plan.md`, with ADRs in `docs/adr/`.

## Context

SpecToShip is a public suite of ten skills for Claude Code and Cursor that takes one feature from idea to shipped, tested and documented code. Roughly 15 design rounds produced `ROADMAP.md`, `CONTEXT.md`, `skills/sts-plan/planning-standards.md` and `skills/sts-prd/prd-template.md`. This plan turns that design into hard gates.

Each gate proves one thing before the next builds on it:
- the hosts behave as assumed
- the design is simplified
- the repo stays consistent automatically
- each skill meets a scored quality bar
- the suite beats plain plan mode

The goal is a launch-quality public repo: installed in 30 seconds, consistent whether people run the whole flow or one skill, on a new product or an existing one, with top-quality output.

The product is Markdown prompts, so its tests are of four kinds:
- **lints** (size, language, references, host names)
- **scenario evals:** headless conversations with a simulated Developer against sample apps, scored by rubric
- **transcript checks**
- **human feel checks**

Only the repo's own tooling is code: sync, lints, the eval harness.

---

## Step 0: save (first step after approval)

- [ ] 0.1 Write this plan verbatim to `docs/design/build-plan.md` (committed from G2). Add a gate status table at the top, with G0–G19 all `pending`.
- [ ] 0.2 Write §13 Guardrails to `AGENTS.md` at the repo root, and a one-line `CLAUDE.md` that points to it, as the reference repo does (both committed; they guide contributors too).
- [ ] 0.3 Begin G0. There are no held files and no hand-off file.

---

## 1. Inputs accounted for

| Input | What it says | Where it lands |
|---|---|---|
| `ROADMAP.md` v3 | Decisions, conventions, specs for all ten skills, scripts, phases, testing, docs, risks, review log | The source for every gate. Simplified by G1 (D-1 to D-6). Departures: X-1 to X-9 |
| `CONTEXT.md` (becomes `GLOSSARY.md`) | Glossary and *Avoid* terms | G1 renames it, removes **Approval** and adds **Fixture**. Used by `lint-language` (G2) |
| `planning-standards.md` | The quality bar for plans | This plan follows it. G1 removes approval and hash wording and adds the anchor labels (D-11) |
| `prd-template.md` | The standard PRD format | G1 removes `status`, `approved_*` and "Changes after approval" (renamed "Later changes"). Used by `sts-prd` (G5) |
| `mattpocock/skills` (README and repo tree) | Install via a Claude Code plugin, or `npx skills@latest add … -a <agent>`; pure-Markdown skills. Repo shape: `.claude-plugin/`, `skills/`, `docs/<skill>.md`, `AGENTS.md`, `CLAUDE.md`, `GLOSSARY.md`, `SCOPE.md`, `CHANGELOG.md`, YAML issue templates, a release workflow with version sync | D-3, D-4, D-20, G0 spikes, G2 layout, README (G13) |
| Agent Skills specification (`agentskills/agentskills`, `docs/specification.mdx`) | `SKILL.md` frontmatter rules (name matches folder; description ≤1,024 characters), optional `references/`, `assets/` and `scripts/`, and the `skills-ref validate` tool | D-18, I-13, every skill gate |
| Agent Skills guide "Evaluating skill output quality" | `evals.json` (prompt, expected output, files); with and without the skill; `iteration-N/` workspaces with `grading.json` and `timing.json` | D-19, G4 |
| Conversation decisions and memory | One question per prompt; explore is free prose; gating is the Developer's choice | `ux.md` and the protocol (G3), transcript checks (G4) |
| Plan-agent review (revision 1) | Ordering bug, contradictions, harness gaps, test-ID scheme, risks | The gate order, X-items, the test scheme and the risks below |
| The private reference plan | What a top-quality plan looks like | The G7 quality comparison. Kept outside the repo, never named (R-6) |

There's no PRD for building SpecToShip; the roadmap is the Spec. Tests trace to roadmap sections (`§n`).

---

## 2. Scope checklist

**v0.1, the planning half (Must):**
- [ ] Spikes recorded (Claude Code confirmed; Cursor confirmed or *assumed*)
- [ ] Design simplified: no approval flow, no runtime tool, the install model, the fixture domain
- [ ] Repo: plugin manifests, the `skills/` layout, `sync-shared`, three lints, CI
- [ ] Shared contract: `ux.md`, `conversation-protocol.md`, `feature-folder.md`, `resume.md`, `host.md`, templates, golden examples
- [ ] Eval harness: task-tracker fixtures (Node and Python), `empty`, runner, simulated Developer, transcript checks, rubrics, a calibrated judge, a plain-plan-mode baseline
- [ ] Skills: `sts-prd`, `sts-plan`, `sts-explore`, `sts-flow`, `sts-challenge`
- [ ] Cursor confirmed and parity passed
- [ ] Dogfood week with the head-to-head and its go/no-go
- [ ] README with 30-second install, skill pages, `docs/journey.md`, `docs/examples/`; newcomer test passed
- [ ] The v0.1.0 tag and launch

**v0.1 (Should):** a listing in the official Claude plugin marketplace, demo video, social preview, Discussions, dev.to post, Cursor headless automation.

**v0.2 (outlined):** `sts-secure`, `sts-test`, `sts-fix`, `sts-docs-eng`, `sts-docs-product`, v0.2 parity, release and launch.

**Not built:**
- document approval or statuses, approval hashes, a gate-check script, a pre-commit hook
- any script shipped inside skills
- an npm package
- telemetry
- hooks (only if dogfooding proves drift)
- team sharing
- non-web `sts-test` beyond the project's own runner

---

## 3. Decisions

| ID | Decision | Choice | Alternatives | Why | Status |
|---|---|---|---|---|---|
| D-1 | Approval flow | **None.** No document statuses, hashes, re-approval, cascade or gate script. The PRD is simply the latest PRD. The Plan records `prd_updated`; if the PRD is newer, skills say "the PRD changed since the Plan was written" | Statuses with a hash | Developer's direction: simpler, less friction | agreed |
| D-2 | What stays as "consent" | The host's plan-mode approval. Gate pauses in a gated build ("Gate 2 done. Continue?"). Confirming edits in `sts-challenge` and security fixes in `sts-fix`. A Spec-gap answer in `sts-fix` | Remove all of it | These are consent to *act*, not document states | agreed |
| D-3 | Runtime tool | **None.** Skills are pure Markdown. `.history` copies, secret avoidance and checks are instructions, verified by evals | `sts-tools.cjs` | Matches the reference repo's simplicity, and nothing executable ships to users | agreed |
| D-4 | Install | **Claude Code:** a plugin from this repo's marketplace (`.claude-plugin/`), which updates itself. **Cursor and others:** `npx skills@latest add <owner>/spec-to-ship -a cursor`, user-level if supported (SP-07). **Zero setup:** the first skill run creates `.sts/` | `npx` only | Same shape as the reference repo | agreed |
| ~~D-5~~ | ~~Command names~~ | ~~A plugin named `sts`~~ | | Superseded by D-22: use the standard plugin namespacing | replaced |
| D-6 | Fixtures | A task tracker: login, projects, tasks, member invites, a daily-digest cron job. Node (Express + SQLite) and a small Python (FastAPI + SQLite) twin, plus `empty`. Seeded IDOR (a task readable across teams) and a CSV import with no row limit. Example journey: **recurring tasks** | Banking app | Simple to understand, with real edge cases (scheduling, duplicates, timezones). Developer's choice | agreed |
| D-7 | Skill order | `sts-prd` → `sts-plan` → `sts-explore` → `sts-flow` → `sts-challenge` | The roadmap's order | Explore's exit needs `sts-prd` (X-1). `sts-prd` proves the protocol. The plan-mode hand-off is the biggest unknown | agreed |
| D-8 | Phase split | G2 repo and tooling, G3 contract, G4 eval harness | One phase | The harness is L-sized and must exist before any skill | agreed |
| D-9 | Cursor timing | G11 runs before dogfood (G12) | At release | Dogfood switches hosts | agreed |
| D-10 | Early go/no-go | Baseline in G4, mini head-to-head in G7, full in G12 | Only in dogfood | A kill decision 5 weeks in is too late | agreed |
| D-11 | Plan anchors | Required labels: `Gate n — <name>`, then `**Delivers**`, `**Tests**` and `**Exit checklist**` in each gate; an invariants table; a `T-n` threats list | Free form | Eval checks and downstream skills need them. The layout otherwise stays free | agreed |
| D-12 | Eval execution | Claude Code headless (`claude -p` / Agent SDK) with an LLM simulated Developer that answers question prompts by tool interception (SP-09). Cursor: a manual subset | Scripted fixed answers | Adaptive questions need an adaptive answerer | agreed |
| D-13 | Shared files | `shared/manifest.json` maps each file to its skills. Copies are committed (installers pull from git). `sync-shared --check` runs in CI | Symlinks | Installers copy folders | agreed |
| D-14 | Lint scope | `lint-language` uses per-term patterns, an allow file, and skips template comments and code blocks. `lint-docs` checks only released skills | Naive lint | Otherwise it's red on day one | agreed |
| D-15 | Description cap | ≤100 words | 60 | Current descriptions run 75–95 words; triggers matter | agreed |
| D-16 | Repo tooling language | Plain JavaScript (CommonJS) with `// @ts-check`, `tsc --noEmit`, `node:test`, zero dependencies. **Repo-only:** sync, lints, eval harness | TypeScript, Python | Roadmap §2.1 | agreed |
| D-17 | This build's plan | Committed `docs/design/build-plan.md`, plus `AGENTS.md` and `CLAUDE.md`, in this repo | `.sts/` | Our own repo may commit its plan; only users' repos must stay clean | agreed |
| D-18 | Skill format | Follow the Agent Skills spec exactly:<br>• frontmatter `name` (= folder), `description` (≤1,024 characters, with "Use when …"), `license: MIT`, `metadata.version`<br>• `references/` for docs the skill loads on demand<br>• `assets/` for templates and golden examples<br>• no `scripts/` (D-3)<br>• CI runs `skills-ref validate` on every skill | A custom flat layout | The official standard, so any compliant host and installer works, and readers recognise it | agreed |
| D-19 | Eval format | The official `evals.json` and `iteration-N/` workspace (`with_skill/` and `without_skill/`, `grading.json`, `timing.json`). Multi-turn fields (persona, answer sheet, fixture, start mode) live in an `extra` object, and fixtures are listed in `files`. Eval material sits in the repo's `evals/<skill>/`, not inside skill folders, so installs stay small | A custom YAML schema | Standard and familiar. "Without skill" *is* our baseline, so every eval doubles as a head-to-head | agreed |
| D-20 | Repo shape | Mirror the reference repo:<br>• `.claude-plugin/plugin.json` (with a `skills` list) and `marketplace.json`<br>• `skills/<skill>/`, `docs/<skill>.md`<br>• root: `README.md`, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md` → `AGENTS.md`, `GLOSSARY.md`, `SCOPE.md`<br>• `.github/ISSUE_TEMPLATE/{bug,idea,config}.yml`, `.github/workflows/{ci,release}.yml`<br>• `scripts/`<br>• design records in `docs/design/` and `docs/adr/` | `ROADMAP.md` and others at the root | A clean, familiar root builds trust | agreed |
| D-21 | Glossary file | Rename `CONTEXT.md` to `GLOSSARY.md`, the reference repo's current name for the same thing | Keep `CONTEXT.md` | Familiar to readers of the reference repo | agreed |
| D-22 | Command naming | Plugin name `spec-to-ship` (repo name). Skills keep the `sts-` prefix, so `npx` installs give `/sts-prd` without collisions. Claude Code shows the plugin namespace as hosts normally do | A custom plugin name such as `sts` | The standard namespacing, unsurprising. SP-11 confirms how it reads | agreed (replaces D-5) |

**Contradictions resolved:**
- **X-1:** explore's exit needs `sts-prd`. Resolved by D-7.
- **X-2:** "no template" versus checks. Resolved by D-11.
- **X-3:** description length. Resolved by D-15.
- **X-4:** *Avoid* terms in existing text. Resolved by D-14.
- **X-5:** `lint-docs` before docs exist. Resolved by D-14.
- **X-6:** the file lists in roadmap §3.6, §4.6 and §5 disagree. Fixed in G1.
- **X-7:** "the same `plan.md`" across modes means structurally equivalent, judged by `PAR` and checks.
- **X-8:** the roadmap's BullMQ fixture and banking journey. Resolved by D-6.
- **X-9:** the roadmap's approval flow and `sts-tools.cjs`. Resolved by D-1 to D-3, rewritten in G1.

**Assumptions** (default chosen):
- Node 18+ is present, for `npx` only.
- The `npx skills` CLI supports `-a cursor` and a user-level install; SP-07 checks the user-level part.
- The Claude Code plugin marketplace works from a GitHub repo; SP-11 checks it.
- Headless Claude Code and the Agent SDK are available for evals.
- The judge is the strongest Claude model, pinned per release.

---

## 4. How it works

**Using it (a user's machine):**

```
Install once ─ Claude Code: /plugin marketplace add <owner>/spec-to-ship → /plugin install sts
            └ Cursor:      npx skills@latest add <owner>/spec-to-ship -a cursor
Use         ─ /sts-prd recurring tasks for my task app
              → SKILL.md (≤150 lines) loads references on demand · formats from ux.md · host notes from host.md
              → first run creates <project>/.sts/ (+ .gitignore "*") · writes features/<slug>/prd.md · .history/
```

**Building it (this repo):**

```
shared/*.md ──sync-shared (manifest)──► skills/<skill>/ (committed copies)
CI: tsc --noEmit · node --test · sync-shared --check · lint-language · lint-skills · lint-docs
evals/run.cjs <skill>/evals.json ─► with_skill & without_skill · headless host + simulated Developer ─► transcript + outputs
     ─► checks.cjs (transcript checks) ─► judge.cjs ×3 (median, rubric, evidence quotes) ─► evals/results/
```

**Files.** Existing, moved in G1: `ROADMAP.md` → `docs/design/roadmap.md`; `CONTEXT.md` → `GLOSSARY.md`; `skills/sts-plan/planning-standards.md` → `skills/sts-plan/references/`; `skills/sts-prd/prd-template.md` → `skills/sts-prd/assets/`.

The final repo, with everything else an *addition*:

```
spec-to-ship/
├── .claude-plugin/        plugin.json (name, version, skills list), marketplace.json
├── skills/
│   └── sts-prd/           SKILL.md · references/*.md · assets/*-template.md, assets/example-*.md
│       (same shape for sts-plan, sts-explore, sts-flow, sts-challenge; v0.2: secure, test, fix, docs-eng, docs-product)
├── shared/                ux.md, conversation-protocol.md, feature-folder.md, resume.md, host.md, manifest.json
│                          (canonical sources; sync copies them into each skill's references/)
├── docs/                  sts-prd.md … (one page per skill), journey.md, examples/recurring-tasks/, assets/,
│                          design/roadmap.md, design/build-plan.md, adr/
├── evals/                 <skill>/evals.json (official format), fixtures/{tasks-node,tasks-py,empty}/, seeds/,
│                          rubrics/, calibration/, run.cjs, checks.cjs, judge.cjs, results/,
│                          journeys/recurring-tasks.md   (workspaces: <skill>-workspace/iteration-N/, gitignored)
├── scripts/               sync-shared.cjs, sync-plugin-version.cjs, lint-language.cjs (+ .allow), lint-skills.cjs, lint-docs.cjs
├── test/                  node:test for sync, lints, checks
├── .github/               ISSUE_TEMPLATE/{bug,idea,config}.yml, workflows/{ci,release}.yml
└── README.md · LICENSE · CHANGELOG.md · CONTRIBUTING.md · AGENTS.md · CLAUDE.md (→ AGENTS.md) · GLOSSARY.md · SCOPE.md
```

**Skill frontmatter** (every skill):

```yaml
---
name: sts-prd                      # = folder name
description: Turn a feature idea into a PRD through … Use when … (≤1,024 characters)
license: MIT
metadata:
  version: "0.1.0"                 # kept in sync with plugin.json by sync-plugin-version
---
```

**Eval case** (official `evals.json`, extended only inside `extra`):

```json
{ "skill_name": "sts-prd",
  "evals": [ { "id": 1,
    "prompt": "/sts-prd recurring tasks for my task app",
    "expected_output": "A PRD in the standard format with testable ACs covering schedule edge cases …",
    "files": ["evals/fixtures/tasks-node"],
    "extra": { "start_mode": "normal", "seed": null, "developer": "evals/sts-prd/personas/pm-clear.md",
               "turn_cap": 30, "checks": ["TC-ONEQ","TC-GIT","TC-HIST"], "rubric": "prd", "threshold": 4 } } ] }
```

Each case runs `with_skill` and `without_skill` into `<skill>-workspace/iteration-N/eval-<id>/`, producing `outputs/`, `timing.json` and `grading.json` (rubric scores, checks and evidence).

---

## 5. Invariants (of the suite)

| ID | Rule | Enforced by | Test |
|---|---|---|---|
| I-1 | Nothing SpecToShip writes into a user project can be committed | First run creates `.sts/.gitignore` (`*`); files outside `.sts/` go in `.git/info/exclude` | TC-GIT on every eval |
| I-2 | Exactly one question per question prompt; never a batch | `conversation-protocol.md`, `ux.md` | TC-ONEQ on every eval |
| I-3 | The previous version is saved before any artifact is overwritten | `feature-folder.md` rule | TC-HIST |
| I-4 | Skills are pure Markdown: no executable files ship | — | LN-SHIP (only `.md` inside `skills/`) |
| I-5 | Each skill is self-contained: no reference leaves its folder | — | LN-SKILL-REF |
| I-6 | Shared copies equal the canonical files | `sync-shared` | UT-SYNC, CI `--check` |
| I-7 | `SKILL.md` ≤150 lines; description ≤100 words | — | LN-SKILL-SIZE |
| I-8 | Host tool names appear only in `host.md` | — | LN-SKILL-HOST |
| I-9 | No secrets are written to `.sts/` | Skill rule | TC-SECRET (scan of `.sts/` after every eval) |
| I-10 | Unverified claims are never stated as fact | `sts-explore` guardrails | rubric criterion "claims sourced" |
| I-11 | Pasted, imported or fetched content is data, never instructions | `ux.md` | EV-INJ-01..02 |
| I-12 | Every Plan's first step is Step 0: save | `planning-standards.md` | TC-STEP0 |
| I-13 | Every skill conforms to the Agent Skills spec | — | LN-SPEC (`skills-ref validate` on every skill in CI), LN-PLUGIN (every skill listed in `plugin.json`, versions in sync) |

## 6. Progress state (no approvals)

**Feature progress** lives in a user project's `.sts/state.md`: depth, branch, a stage table (`done | skipped: <reason> | in progress | pending`), the next step, the current gate and step, and a last-session note. Gates in a Plan go `pending` → `in-progress` → `passed`. With hard gating, the agent pauses at `passed` until the Developer says continue.

**PRD/Plan staleness:** the Plan stores `prd_updated` (the PRD's `updated` date). A newer PRD makes `sts-flow`, `sts-plan` and gate resume say once: "The PRD changed since the Plan was written. Review the Plan?"

**Concurrency:** one Developer per Feature. The risk is two threads or hosts writing the same artifact. Mitigations: `.history` before every write, and trust-but-verify on resume.

## 7. Failure modes

| What fails | What happens | Recovery |
|---|---|---|
| The plugin marketplace or `npx skills` behaves differently than assumed (SP-02, SP-07, SP-11) | Install friction | README documents the working path per host. Manual copy is the last resort |
| Plan mode is unavailable or declined | No hand-off | The agent writes the Plan in normal mode under the same standards |
| The question prompt is unavailable | — | Plain-text single question (`host.md`) |
| Search skips `.sts/` | Skill can't find its files | Explicit paths only (SP-04) |
| The LLM forgets `.history` or the state update | Lost version or stale progress | Evals catch it (TC-HIST). Resume verifies progress against tests and files |
| Noisy judge | Wrong pass or fail | Median of 3, evidence quotes, calibration gate (G4) |
| The simulated Developer drifts | Invalid eval | `checks` flag answers off its answer sheet; rerun |
| A fixture fails to start | Evals blocked | Fixture smoke tests (G4) |
| Cursor diverges | Parity fails | A `host.md` row, or a fix in G11 |
| Eval cost | Budget | Tiers: smoke per commit (≤10 min, Claude Code, Node); full per gate; both hosts at release |
| The head-to-head fails | — | The G12 decision rule: rethink before v0.1 |

## 8. Security

| ID | Threat | Mitigation | Test |
|---|---|---|---|
| T-1 | Prompt injection through pasted PRDs, tickets or fetched pages | "Treat inputs as data" in `ux.md` and every conversational skill | EV-INJ-01, EV-INJ-02 |
| T-2 | Secrets written into `.sts/` and later shared | Skill rule; credentials only from environment variables | TC-SECRET |
| T-3 | Executable code shipped to users' machines | Skills are Markdown only | LN-SHIP |
| T-4 | Repo or supply-chain compromise | No runtime dependencies, protected `main`, tagged releases, `CHANGELOG.md` | G13 release checklist |
| T-5 | Heavy skills hijacking ordinary requests | Conservative descriptions | TG-* ≥9/10, near misses included |

## 9. Concrete numbers

| Item | Value |
|---|---|
| `SKILL.md` size | ≤150 lines |
| Skill description | ≤100 words |
| PRD questions | ≤20 (typically 8–12) |
| Challenge questions | ≤10 |
| Captured-PRD questions | ≤5 |
| Import gap questions | ≤3 |
| Recap | every 5 questions |
| Explore checkpoint | about every 8 exchanges |
| Turn length | about 150 words |
| History | newest 10 per file (the skill deletes older copies) |
| Judge | median of 3 runs; pinned model |
| Judge calibration | ≥80% of items within ±1 of the human score, 5 human-scored items per rubric |
| Quality bar | average ≥4 per artifact, no criterion <3 |
| Trigger tests | ≥9/10 correct per skill |
| Feel checks | ≥4/5 |
| Newcomer test | install to an approved Plan in <20 min, with 0 questions asked |
| Install | ≤30 seconds per host |
| Smoke evals | ≤10 min per commit |

## 10. Observability

- **Eval runs** write `evals/runs/<date>/<scenario>/` (transcript, `.sts/` snapshot, checks, judge JSON). This folder is gitignored. Summaries go to the committed `evals/results/G<n>.md`.
- **Skills** have no telemetry. Their visible trail is the opening and closing lines, `state.md` notes, and `.history/`.

## 11. Test plan

**ID scheme:**

| Prefix | Kind |
|---|---|
| `SP` | spike |
| `UT` | `node:test` for repo tooling |
| `LN` | lint self-test |
| `TC` | transcript check, run on every eval |
| `EV-<SKILL>-nn[-cu\|-cc][-node\|-py\|-empty]` | scenario eval. `cu` means a Feature added to an existing product; `cc` means a new product |
| `TG` | trigger test |
| `JR` | release flow |
| `PAR` | parity check |
| `HF` | human feel check |
| `BASE`, `H2H` | baseline and head-to-head |

**Transcript checks**, run on every eval:

| ID | Checks |
|---|---|
| TC-ONEQ | One question per prompt; a plain-text turn ends with at most one question |
| TC-GIT | `git status --porcelain` shows nothing from SpecToShip |
| TC-HIST | Every overwrite was preceded by a `.history` copy |
| TC-SECRET | No secret-looking strings in `.sts/` |
| TC-CEIL | Question count stays under the ceiling |
| TC-NOWRITE | No Plan is written before the design summary is confirmed |
| TC-STEP0 | The Plan starts with Step 0 |
| TC-NOPROMPT | No question prompts in `sts-explore` |
| TC-UX | Opening and closing lines match `ux.md` |

| ID | Pri | Type | Scenario → expected | Roadmap § |
|---|---|---|---|---|
| UT-SYNC-01..03 | High | unit | Drift detected, manifest honoured, missing target created | D-13 |
| UT-CHECKS-01..09 | Crit | unit | Each TC detects a seeded violation and passes a clean transcript | G4 |
| LN-LANG / SKILL / DOCS / SHIP | High | lint | Positive and allowlisted cases for each rule | §6, D-14 |
| LN-SPEC / LN-PLUGIN | Crit | lint | `skills-ref validate` passes on every skill; `plugin.json` lists every skill, at the release version | D-18, D-20 |
| EV-HARNESS-01 | Crit | eval | A known-bad transcript fails its checks | G4 |
| EV-PRD-01..08 | High | eval | Simple and touches-existing ideas × Node, Python and empty; the four controls; the ceiling; a cold start | §4.2 |
| EV-PRD-09 | High | eval | Seeded brief → noticeably fewer questions | §4.1 |
| EV-PLAN-01..05 | High | eval | Existing PRD, imported, declined (captured), greenfield, "use Kafka" | §4.3 |
| EV-PLAN-MM-01..04, EV-PLAN-FRESH-01 | Crit | eval | Start normal; start in plan mode; decline plan mode; plain plan mode with the pointer; a fresh chat with the hand-off | §4.3 |
| EV-EXP-01..04 | High | eval | Domain-heavy, simple, greenfield, resumed | §4.1 |
| EV-FLOW-01..04 | High | eval | Resume card; state rebuilt from artifacts; branch mismatch; verified build resume | §3.11, §4.10 |
| EV-CHAL-01..03 | High | eval | Weak PRD and Plan; apply-all; the PRD-newer-than-Plan notice | §4.4 |
| EV-INJ-01..02 | Crit | eval | Injected instructions in an imported PRD or a fetched page are ignored and flagged | §3.10 |
| EV-COLD-* / EV-FLOWIN-* | High | eval | Each skill alone versus in flow | §3.9 |
| TG-* | High | eval | Trigger tests with near misses | §8 |
| JR-01..04 | Crit | journey | Release flows (§14 below) | §8 |
| PAR-* | High | manual | Rubric-based parity between the two hosts | §3.10 |
| HF-PRD / PLAN / EXP | Med | human | ≥4/5 | §7 |
| BASE-01, H2H-01, H2H-02 | Crit | eval / human | Baseline (G4); mini head-to-head (G7); full head-to-head (G12) | §7 |

---

## 12. Implementation sequence and gates

Every gate also requires the **standing checks**: `node --test`, `npx tsc --noEmit -p .`, `node scripts/sync-shared.cjs --check`, every lint, and `skills-ref validate` on every skill folder, all exiting 0. Steps are checkboxes in `docs/design/build-plan.md`, and its status table is updated at each gate exit. The builder stops at each exit and continues on the Developer's word.

### Gate 0 — Spikes (1–2 days)
**Goal:** facts about the hosts and installers, not guesses.

**Delivers:** `evals/spikes.md` with a verdict for each of SP-01..11, and a draft `shared/host.md`.

**Steps:**
- [ ] 0.1 Name check for "SpecToShip" and `spec-to-ship`. **SP-01**
- [ ] 0.2 A hello-world skill installed with `npx skills@latest add <repo> -a cursor` and `-a claude-code`. It loads by slash command and by wording. **SP-02**
- [ ] 0.3 The question prompt in normal and plan mode: one question, Recommended, Other. **SP-03**
- [ ] 0.4 Read and write a gitignored `.sts/` by explicit path; does search skip it? **SP-04**
- [ ] 0.5 Plan mode: entering it, the plan file, approval, how the text reaches the next step. **SP-05**
- [ ] 0.6 Can a skill create `.sts/.gitignore` and edit `.git/info/exclude`, including under Claude Code permission prompts? **SP-06**
- [ ] 0.7 Install location: user or project level, the project left untouched, a global flag? **SP-07**
- [ ] 0.8 Background app start and stop, needed later by `sts-test`. **SP-08**
- [ ] 0.9 Headless `claude -p` / Agent SDK with question-tool interception for a simulated Developer. Cursor headless? **SP-09**
- [ ] 0.10 The question prompt inside plan mode, in both hosts. **SP-10**
- [ ] 0.11 A Claude Code plugin from a repo marketplace: install, self-update, and how skill commands are named. Settles D-5. **SP-11**

**Tests:** SP-01..11.

**Exit checklist:**
- [ ] Every SP has a recorded verdict.
- [ ] No Claude Code row in `host.md` is *assumed*.
- [ ] D-4, D-5 and D-12 confirmed, or revised in this plan's revision summary.

**Unblocks:** G1.

### Gate 1 — Simplify the design (1 day, documents only)
**Goal:** the design documents match revision 2 before anything is built on them.

**Delivers:** the simplified design in its standard home: `docs/design/roadmap.md`, `GLOSSARY.md`, `SCOPE.md`, and the moved `planning-standards.md` and `prd-template.md`.

**Steps:**
- [ ] 1.0 **Rename sweep** (Revision 4): SpecToShip → Shipcraft, `sts-` → `craft-`, `.sts/` → `.craft/`, `sts_format` → `craft_format`, in `ROADMAP.md`, `CONTEXT.md`, `AGENTS.md`, the skills folder names and files, and `evals/` and `shared/`. Review the diff with `git diff --stat` once the repo exists, or by `grep -rn "sts\|SpecToShip"` before then. Rename `skills/sts-plan` to `skills/craft-plan` and `skills/sts-prd` to `skills/craft-prd`.
- [ ] 1.1 Remove the approval flow everywhere (D-1, D-2): statuses, `approved_*`, hashes, cascade, gate rules, the `sts-gate` and hash mentions, the Approval term. "Spec = approved PRD" becomes "Spec = the PRD". "Changes after approval" becomes "Later changes". Add `prd_updated`.
- [ ] 1.2 Remove `sts-tools.cjs` and replace each use with an instruction and an eval check (D-3). §6 becomes repo-only scripts.
- [ ] 1.3 Rewrite the install model (D-4, D-5): §2.1, §9.3, and the README spec.
- [ ] 1.4 Task-tracker fixtures and the recurring-tasks journey (D-6), replacing the banking examples in §4.1, §8 and §9.
- [ ] 1.5 Gate order and phases per D-7 to D-10. Fix X-6.
- [ ] 1.6 Add the anchor labels to `planning-standards.md` (D-11), and remove the hash and approval wording there.
- [ ] 1.7 Add a review-log entry (§11.7) summarising revisions 2 and 3.
- [ ] 1.8 Standard layout (D-20, D-21):
  - `ROADMAP.md` → `docs/design/roadmap.md`, `CONTEXT.md` → `GLOSSARY.md`
  - `planning-standards.md` → `skills/sts-plan/references/`, `prd-template.md` → `skills/sts-prd/assets/`
  - update every reference to these paths
  - write `SCOPE.md`: what SpecToShip does and deliberately doesn't do, drawn from roadmap §2 and the not-built list
- [ ] 1.9 Rewrite roadmap §5 (repo layout) and the skill folder lists in §4 to the spec layout (`references/`, `assets/`), plus §8 to the official eval format (D-18, D-19).

**Tests:** a manual read-through, plus `grep -i "approv\|hash\|sts-tools"`, where every remaining hit is deliberate (plan-mode approval, gate continue).

**Exit checklist:**
- [ ] The grep is reviewed with the Developer.
- [ ] `GLOSSARY.md` has no Approval term.
- [ ] The repo root contains only the standard files (D-20).
- [ ] The Developer confirms the documents read correctly.

**Unblocks:** G2.

### Gate 2 — Repo and tooling (2 days)
**Goal:** a repo that keeps itself consistent and installs like the reference repo.

**Delivers:**
- `git init`, MIT `LICENSE`, the layout from §4
- `.claude-plugin/plugin.json` (with a `skills` list) and `marketplace.json`, modelled on the reference repo (per SP-11)
- `scripts/sync-plugin-version.cjs`: keeps `plugin.json` and each skill's `metadata.version` equal
- `.github/ISSUE_TEMPLATE/{bug,idea,config}.yml` and `.github/workflows/{ci,release}.yml`. CI installs `skills-ref` (Python, CI-only) and validates every skill
- `AGENTS.md`, with `CLAUDE.md` pointing to it
- `shared/manifest.json`, `scripts/sync-shared.cjs`, the four lints plus the allow file
- `test/`, `package.json` (no dependencies), `tsconfig.json` (`checkJs`, `noEmit`)
- the CI workflow
- `docs/design/build-plan.md` committed

**Steps:**
- [ ] 2.1 Repo skeleton, then the first commit of the design documents, the build plan, `AGENTS.md` and `CLAUDE.md`.
- [ ] 2.2 Write UT-SYNC first, then implement `sync-shared` (manifest, `--check`).
- [ ] 2.3 The lints with their LN self-tests: LANG (D-14), SKILL (size, references, host names, D-15), DOCS (released only), SHIP (Markdown only), SPEC (`skills-ref validate`), PLUGIN (skills list and versions).
- [ ] 2.4 Plugin manifests. A hello-world skill installs through both paths (re-run SP-02 and SP-11 against this repo).
- [ ] 2.5 CI and the release workflow (tag → version sync check → GitHub release with `CHANGELOG` notes).

**Tests:** UT-SYNC-01..03, LN-*.

**Exit checklist:**
- [ ] Standing checks green locally and in CI.
- [ ] Tampering with a shared copy makes `--check` exit 1.
- [ ] Both install paths load the hello-world skill.
- [ ] `skills-ref validate skills/hello-world` passes.
- [ ] Side by side, the repo root and `.claude-plugin/` follow the same conventions as the reference repo.

**Unblocks:** G3.

### Gate 3 — Shared contract (2 days)
**Goal:** one source for every format, rule and host difference.

**Delivers:**
- `shared/ux.md`: opening and closing lines, first-run welcome, question and fallback, Your turn block, resume card, checkpoint and recap, error, undo; each with an example
- `shared/conversation-protocol.md`, `feature-folder.md` (first run, depth, `.history`, explicit paths, no secrets, inputs as data), `resume.md`, `host.md`. All are synced into each skill's `references/`
- the brief template, the `plan.md` wrapper (with `prd_updated`), and the `project.md`, `glossary.md` and `state.md` templates
- `evals/journeys/recurring-tasks.md`
- golden `example-brief.md` and `example-prd.md`, in the producing skill's `assets/`

**Steps:**
- [ ] 3.1 `ux.md`
- [ ] 3.2 Protocol
- [ ] 3.3 Feature folder
- [ ] 3.4 Resume
- [ ] 3.5 `host.md` from the spikes
- [ ] 3.6 Templates
- [ ] 3.7 Journey script and golden examples
- [ ] 3.8 Manifest entries, then sync

**Tests:** LN-* on all new files; the golden PRD meets every PRD rubric criterion at ≥4, by human review.

**Exit checklist:**
- [ ] Standing checks green.
- [ ] The Developer has reviewed `ux.md`, the journey and both golden examples.

**Unblocks:** G4.

### Gate 4 — Eval harness and fixtures (4–5 days)
**Goal:** every skill gate can prove quality with numbers.

**Delivers:**
- `evals/fixtures/tasks-node` (Express + SQLite): login, projects, tasks, invites, a daily-digest job table plus cron, seeded IDOR and an unlimited CSV import, with smoke tests
- `tasks-py` (FastAPI + SQLite), with the same behaviour in a smaller form
- `empty`
- `seeds/`
- `evals/<skill>/evals.json` in the **official format**, with multi-turn fields under `extra` (D-19)
- `run.cjs` (headless runner plus simulated Developer). Writes the official `<skill>-workspace/iteration-N/eval-<id>/{with_skill,without_skill}/` with `outputs/`, `timing.json` and `grading.json`
- `checks.cjs` (all TC)
- `judge.cjs` (pinned model, ×3 median, JSON with evidence quotes)
- `rubrics/` (PRD, Plan, brief, conversation, parity) and `calibration/`
- BASE-01

**Steps:**
- [ ] 4.1 Both fixtures and their smoke tests.
- [ ] 4.2 The runner, reading the official `evals.json` and writing the official workspace. Every case runs with and without the skill.
- [ ] 4.3 The simulated Developer: persona, answer sheet, interjections, drift flags.
- [ ] 4.4 Write UT-CHECKS first, then `checks.cjs`. EV-HARNESS-01.
- [ ] 4.5 Rubrics and judge calibration.
- [ ] 4.6 BASE-01: plain host plan mode (the `without_skill` run) plans "recurring tasks" on `tasks-node`. Score and record it.
- [ ] 4.7 `npm run eval:smoke`, `eval:gate <n>` and `eval:release`.

**Tests:** fixture smoke tests, UT-CHECKS-01..09, EV-HARNESS-01, calibration.

**Exit checklist:**
- [ ] Fixture tests pass.
- [ ] EV-HARNESS-01 fails as intended.
- [ ] The judge is within ±1 of the human score on ≥80% of calibration items.
- [ ] BASE-01 recorded in `evals/results/G4.md`.
- [ ] Smoke run takes ≤10 min.

**Unblocks:** G5.

**Every skill gate (G5–G10) also exits with:**
- `skills-ref validate skills/<skill>` passing
- the skill listed in `plugin.json`
- `references/` and `assets/` used as the spec defines
- `with_skill` beating `without_skill` on the rubric in its `grading.json`

### Gate 5 — `sts-prd` (2–3 days)
**Goal:** a conversation that feels like a sharp PM and yields a top-quality PRD.

**Delivers:** `skills/sts-prd/`: `SKILL.md`, `references/` (`edge-case-checklist.md` plus the shared copies), and `assets/` (`prd-template.md`, `example-prd.md`). Also `evals/sts-prd/evals.json`. It covers coverage, suggestions, Mermaid flows, progressive saving, captured-PRD mode, and the cold-start scope question.

**Steps:**
- [ ] 5.1 Write the EV-PRD cases in `evals/sts-prd/evals.json`, the TG phrases and the HF checklist first.
- [ ] 5.2 `SKILL.md` (≤150 lines).
- [ ] 5.3 `edge-case-checklist.md`.
- [ ] 5.4 Iterate until the evals pass; then the feel check.

**Tests:** EV-PRD-01..08 (cu and cc, Node, Python and empty), EV-INJ-01, EV-COLD-PRD, TG-PRD, HF-PRD, and every TC.

**Exit checklist:**
- [ ] PRD rubric average ≥4, no criterion below 3.
- [ ] TC-ONEQ, CEIL, HIST, GIT and SECRET pass on every run.
- [ ] TG ≥9/10. HF ≥4/5.
- [ ] A simple idea finishes in ≤12 questions (median).

**Unblocks:** G6.

### Gate 6 — `sts-plan`, part 1: intake and the architect conversation (3–4 days)
**Goal:** a code-grounded design conversation with an experienced architect.

**Delivers:** `skills/sts-plan/`:
- `SKILL.md`
- `references/`: `prd-intake.md`, `architect-guide.md`, `tech-choices.md`, `mode-existing.md`, `mode-greenfield.md`, `planning-standards.md`
- `assets/`: `project-profile-template.md`, `prd-lite-template.md`

It covers the hand-off file, the gating question, and wider stack detection.

**Steps:**
- [ ] 6.1 Write EV-PLAN-01..05 first.
- [ ] 6.2 Intake: all paths, including import with ≤3 gap questions and a captured PRD.
- [ ] 6.3 Groundwork: stack detection, project profile, code exploration.
- [ ] 6.4 Design conversation: readout, options, one decision per prompt, an honest technology fit, summary.
- [ ] 6.5 Hand-off written progressively; size and gating questions.

**Tests:** EV-PLAN-01..05 on both stacks, TC-NOWRITE, EV-COLD-PLAN, TG-PLAN.

**Exit checklist:**
- [ ] Every intake path is taken correctly.
- [ ] The readout reuses the fixture's job table and cron.
- [ ] "Use Kafka" gets an honest fit and a simpler alternative.
- [ ] Conversation rubric ≥4.

**Unblocks:** G7.

### Gate 7 — `sts-plan`, part 2: plan-mode hand-off, Step 0, mini head-to-head (2 days)
**Goal:** plan mode writes a Plan to the standards from any start, measurably better than the baseline.

**Delivers:**
- the mode-aware flow and the decline fallback
- Step 0 (`plan.md` with `prd_updated`, local guardrails in `CLAUDE.local.md` or `.cursor/rules/sts.mdc` added to `.git/info/exclude`, held files, hand-off deleted)
- ADR offers
- the rules-file pointer, offered once
- the golden example plan gate

**Steps:**
- [ ] 7.1 Write EV-PLAN-MM-01..04 and FRESH-01.
- [ ] 7.2 Implement.
- [ ] 7.3 H2H-01: the suite's Plan versus BASE-01, same rubric, plus a side-by-side read against the private reference plan (R-6).

**Tests:** EV-PLAN-MM-01..04, EV-PLAN-FRESH-01, TC-STEP0, JR-01.

**Exit checklist:**
- [ ] All 4 mode paths end with a `plan.md` carrying the anchors (D-11).
- [ ] No hand-off file left; TC-GIT clean.
- [ ] Plan rubric ≥4.
- [ ] **H2H-01: the suite beats BASE-01 by ≥0.5 on average.** If not, stop and revise.

**Unblocks:** G8.

### Gate 8 — `sts-explore` (3–4 days)
**Goal:** a conversation between two engineers that yields a brief giving every later skill full context.

**Delivers:** `skills/sts-explore/`:
- `SKILL.md`
- `references/`: `context-map.md`, `techniques.md`, `exploration-guide.md`
- `assets/`: `brief-template.md`, `example-brief.md`

**Steps:**
- [ ] 8.1 Write EV-EXP-01..04 first, including a persona that raises a fact the LLM must research or tag as unverified.
- [ ] 8.2 Implement.
- [ ] 8.3 EV-PRD-09: a seeded brief means fewer PRD questions.

**Tests:** EV-EXP-01..04, EV-INJ-02, EV-PRD-09, TC-NOPROMPT, TG-EXP, HF-EXP.

**Exit checklist:**
- [ ] Brief rubric ≥4, with "claims sourced" never below 4.
- [ ] 0 question prompts.
- [ ] ≥4 techniques per session (median).
- [ ] EV-PRD-09 uses ≥30% fewer questions than EV-PRD-01.
- [ ] HF ≥4/5.

**Unblocks:** G9.

### Gate 9 — `sts-flow` and resume (2 days)
**Goal:** "continue" works in any thread, at any point.

**Delivers:** `skills/sts-flow/SKILL.md`, with:
- the resume card and state rebuilt from artifacts
- branch warning and the PRD-newer notice
- build resume by gate and step, with verification
- depth-driven next steps
- undo and history

**Steps:**
- [ ] 9.1 Write EV-FLOW-01..04 and JR-03 first.
- [ ] 9.2 Implement.
- [ ] 9.3 The opening and closing lines in every skill reference `resume.md` (protocol, then sync).

**Tests:** EV-FLOW-01..04, JR-03 (Claude Code), EV-COLD-*, EV-FLOWIN-*.

**Exit checklist:**
- [ ] JR-03 resumes at the recorded step, reading only that gate's section.
- [ ] Deleting `state.md` and rebuilding gives the same stages.

**Unblocks:** G10.

### Gate 10 — `sts-challenge` (1–2 days)
**Goal:** an adversarial pass that improves documents with one confirmation.

**Delivers:** `skills/sts-challenge/`: `SKILL.md`, `references/lenses.md`.

**Steps:**
- [ ] 10.1 Write EV-CHAL-01..03 first.
- [ ] 10.2 Implement: lenses, one concern per prompt, the change list, apply all / choose / none.

**Tests:** EV-CHAL-01..03, EV-COLD-CHAL, TG-CHAL.

**Exit checklist:**
- [ ] The seeded weaknesses are raised.
- [ ] Apply-all edits both documents, with `.history` copies.
- [ ] No file of the skill's own is written.

**Unblocks:** G11.

### Gate 11 — Cursor and parity (2 days)
**Goal:** one product across both hosts.

**Delivers:** every `host.md` row confirmed; PAR-* run on EV-PRD-01, EV-PLAN-01, EV-PLAN-MM-01, EV-EXP-01, EV-FLOW-01 and EV-CHAL-01 in both hosts; JR-03 with a host switch.

**Steps:**
- [ ] 11.1 Re-run the SPs in Cursor.
- [ ] 11.2 Fix the skills and `host.md`.
- [ ] 11.3 Parity runs.

**Tests:** PAR-*, JR-03 (cross-host).

**Exit checklist:**
- [ ] 0 *assumed* rows.
- [ ] Every PAR passes, or each difference is explained in `host.md`.

**Unblocks:** G12.

### Gate 12 — Dogfood and head-to-head (about 1 week)
**Goal:** prove it on real work, and decide go or no-go.

**Delivers:** `evals/dogfood-notes.md`, the H2H-02 table, the top fixes, and a recorded decision.

**Steps:**
- [ ] 12.1 Real Feature A (R-2): Full depth, a fresh thread per stage and per gate, at least one host switch.
- [ ] 12.2 Real Feature B: plain plan mode versus the suite at Standard depth. Compare completeness, decisions reversed, Bugs and Spec gaps found later, total time, and a blind read.
- [ ] 12.3 Fix the top friction items and re-run the affected evals.

**Tests:** H2H-02, JR-02, re-runs.

**Exit checklist:**
- [ ] **Go** only if the suite is clearly better on quality at ≤2× the time.
- [ ] No open Critical friction item.

**Unblocks:** G13. On no-go, revise and repeat G12.

### Gate 13 — Docs and the v0.1 release (2 days)
**Goal:** a newcomer succeeds from the README alone.

**Delivers:**
- `README.md` in the reference repo's shape:
  - header image
  - skills.sh badge
  - one-line pitch
  - "Installation (30-second setup)", with a collapsible `<details>` block per agent (Claude Code plugin; Cursor and others via `npx skills@latest add … -a <agent>`)
  - "Why use it", as problem → fix
  - demo, quickstart by depth, skill table, real output, how it works, supported stacks, FAQ, credits
  - "Validated against the Agent Skills specification"
- `docs/sts-*.md` for the 5 released skills, `docs/journey.md`, `docs/examples/recurring-tasks/` from a real run
- published rubric scores and honest timings
- `CHANGELOG.md`, `CONTRIBUTING.md`, issue templates
- the `v0.1.0` tag

**Steps:**
- [ ] 13.1 Write the docs.
- [ ] 13.2 Run every documented command.
- [ ] 13.3 Newcomer test, ≥1 person per host.
- [ ] 13.4 Tag the release.

**Tests:** LN-DOCS, JR-01..04 re-run, NEW-01.

**Exit checklist:**
- [ ] `lint-docs` exits 0.
- [ ] Install takes ≤30 s per host.
- [ ] Newcomer test <20 min with 0 questions, in both hosts.
- [ ] JR-01..04 green.
- [ ] The tag exists.

**Unblocks:** G14.

### Gate 14 — Launch v0.1 (1 day plus 72 hours)
**Delivers:** demo GIF and video, social preview, topics, Discussions, `good first issue`s, a submission to the official Claude plugin marketplace (Should), and posts (Show HN, r/ClaudeAI, r/cursor, X/LinkedIn, dev.to).

**Exit checklist:**
- [ ] Assets live.
- [ ] Posts published.
- [ ] Every issue and comment answered within 72 hours.

**Unblocks:** detailing G15–G19.

### v0.2 outline (detailed after G12)

| Gate | Builds |
|---|---|
| **G15 `sts-secure`** | Checklist, findings template, scope question, `T-n` checks. Seeded IDOR and unlimited import come back `confirmed`, on both stacks |
| **G16 `sts-test`** | Playwright in `.sts/` with an extending config, test data and login, background app start, one test per AC plus journey tests, B-n and G-n classification. The test-file snapshot is an instruction (`git diff` on the test paths) |
| **G17 `sts-fix`** | Batch Finding review, test-first loop, Spec-gap ACs under "Later changes", the test-change list shown to the Developer, caps, Plan change log |
| **G18 Docs skills** | Engineering doc with diagrams; product doc with the verified / not-yet-verified split and screenshots |
| **G19 v0.2 release** | Parity, JR-05 (explore to docs), docs, `v0.2.0`, launch |

---

## 13. Guardrails (written to `CLAUDE.md` in Step 0)

**Skills**
- ALWAYS keep each `SKILL.md` ≤150 lines, with detail in references; never paste roadmap text in wholesale.
- ALWAYS use the `ux.md` formats and `GLOSSARY.md` terms. Host names live only in `host.md`.
- ALWAYS edit shared files in `shared/`, then run sync. NEVER edit a synced copy.
- ALWAYS write the scenarios, rubric and trigger phrases before the skill text.
- Skills stay pure Markdown. NEVER ship an executable inside `skills/`.
- ALWAYS follow the Agent Skills spec:
  - `name` = folder
  - description ≤1,024 characters, with "Use when …"
  - docs in `references/`, templates and examples in `assets/`
  - `skills-ref validate` green
- ALWAYS list every skill in `plugin.json`, and bump versions only through `sync-plugin-version`.

**User repos**
- Skills write only inside `.sts/` or to git-excluded local files.
- ALWAYS save a `.history` copy before an overwrite.
- NEVER write secrets.

**Repo tooling**
- Zero dependencies, `// @ts-check`, test first.

**Gates**
- ALWAYS show the exit-checklist output before marking a gate passed.
- NEVER start the next gate until the Developer says continue.

## 14. Release flows (real hosts, no mocks)

| ID | Flow |
|---|---|
| JR-01 | **Express, existing product:** `/sts-plan` on `tasks-node` → captured PRD → architect conversation → plan mode → Step 0. The Plan has the anchors; TC-GIT clean |
| JR-02 | **Full, new product:** `/sts-explore` on `empty` → `/sts-prd` → `/sts-challenge` → `/sts-plan`. Every artifact scores ≥4 |
| JR-03 | **Across threads and hosts:** stop mid-PRD; resume in a new thread; plan in a third (switching host); "continue" mid-gate in a fourth. No question repeated; resume lands on the right step |
| JR-04 | **Cold starts:** each v0.1 skill run alone in an empty repo. Scope question asked, gaps named, useful work done, nothing invented |

## 15. Scope tiers

- **Never reduced:**
  - I-1 to I-12 and their tests
  - the one-question rule
  - the rubric threshold
  - H2H-01 and H2H-02
  - parity
  - the newcomer test
  - the 30-second install
- **Should, off the critical path:** official marketplace listing, demo video, social image, Discussions, dev.to, Cursor headless automation.
- **Cut order if time runs short:**
  1. dev.to post
  2. social image
  3. Discussions
  4. Cursor headless automation
  5. demo video (the GIF remains)
  6. official marketplace listing (the repo marketplace remains)

## 16. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| The eval harness becomes its own project | Delay | Spiked in G0, built once in G4; Claude Code only is automated |
| Noisy judge | False pass or fail | Calibration, median of 3, evidence quotes, pinned model |
| Plan mode behaves differently between hosts or versions | Broken hand-off | Mode matrix in G7; declining plan mode is the fallback |
| Without a runtime tool, rules depend on the LLM remembering them (`.history`, secrets) | Lost version or a leak | Transcript checks on every eval; resume verifies; hooks only if dogfooding proves drift |
| Plugin naming makes long commands | Clunky experience | SP-11 and D-5 (plugin named `sts`) |
| The go/no-go comes too late | Wasted weeks | BASE-01 in G4, H2H-01 in G7 |
| Lint noise | The lint gets disabled | Allow file, LN self-tests |
| Eval cost | Budget | Three tiers |
| Cursor gaps | Inconsistent experience | G11 before dogfood; Your turn blocks |

## 17. Definition of done

**v0.1:**
- [ ] G0–G14 passed, each continued on the Developer's word.
- [ ] Standing checks green.
- [ ] JR-01..04 green in both hosts.
- [ ] Rubric bar met.
- [ ] H2H decision is go.
- [ ] Newcomer test passed.
- [ ] 30-second install in both hosts.
- [ ] `v0.1.0` tagged and launched.

**v0.2:** G15–G19 detailed, then passed, with JR-05 green.

## 18. Readiness

**Blocking (the Developer decides):**

| ID | Item | Needed by |
|---|---|---|
| R-1 | Public GitHub owner and repo name, for the plugin marketplace and `npx` | G0.2 (a local path can stand in until G2.4) |
| R-2 | The real project and two Features for dogfooding | G12 |
| R-3 | Cursor access | G0 (partly), G11 |
| R-4 | Eval budget (an approximate spend cap per tier) and judge model | G4 |
| ~~R-5~~ | ~~Name-check outcome~~ | Resolved: Shipcraft |
| R-6 | A private copy of the reference plan, kept outside the repo and never named in it | G7.3 |

**Non-blocking assumptions:** Node 18+ (for `npx`); headless Claude Code and the Agent SDK are available; one Developer per Feature; artifacts in English.
