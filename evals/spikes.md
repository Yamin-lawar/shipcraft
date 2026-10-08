# Gate 0 spikes

Verdicts: **confirmed** (observed), **partial** (some facts, rest in a later gate), **open** (needs the Developer or Cursor).
Run on 2026-10-08 with Claude Code (CLI 2.1.x, Node 26, git 2.39).

| ID | Spike | Verdict | Finding |
|---|---|---|---|
| SP-01 | Name check | **resolved: renamed to Shipcraft (prefix `craft-`)** | npm: `shipcraft` and `spectoship` are free. GitHub: no repo named `spectoship`, but `mrtblount/Spec-to-Ship` exists (MIT, 2 stars, last updated 2026-03): "Product development pipeline for Claude Code, from idea to PRD to spec to shipped product", with `prd-builder` and `spec-driven-dev` skills. Same idea, same name apart from casing. Related but different: ReqForge, CocoPlus, ATLAS_OS |
| SP-02 | `npx skills` install and load | **confirmed (install)** | `npx skills@latest add <path\|repo>` works with a local path. It lists skills (`-l`), and installs with `-a <agent>`, `-s <skill>`, `--copy` (default is symlink). Layout is preserved: `SKILL.md`, `references/` and `assets/` all copied. Slash-command and by-wording loading are not yet tested (needs an interactive session); GitHub-repo install waits for R-1 |
| SP-03 | Question prompt, normal mode | **confirmed (Claude Code)** | The question tool takes 1–4 questions with 2–4 options each, an automatic "Other" free-text option, and an optional `multiSelect`. Marking an option "(Recommended)" and listing it first works. Cursor: **open** |
| SP-04 | Hidden, gitignored `.craft/` | **confirmed** | Explicit-path read and write work. Default search (`rg`) **skips it** (hidden folder and gitignored). With `--hidden --no-ignore` it's found. So skills must open `.craft/` files by explicit path. Cursor: **open** |
| SP-05 | Plan mode | **confirmed (Claude Code)** | A skill can request plan mode (the Developer must consent). In plan mode only the plan file can be edited, and the plan is written to `~/.claude/plans/<name>.md`. Approval is a separate step that reads that file. After approval, execution happens outside plan mode. Cursor: **open** |
| SP-06 | `.craft/.gitignore` and `.git/info/exclude` | **confirmed** | Created `.craft/.gitignore` (`*`) and appended to `.git/info/exclude`. `git status --porcelain` shows neither. May trigger a permission prompt for writes outside the working directory. Not applicable here. Cursor: **open** |
| SP-07 | Install location | **confirmed, with a consequence** | **Default is project-level**: `npx skills add` writes `./.claude/skills/<skill>/` **and `./skills-lock.json`**, and both show as untracked in `git status`, so they can be committed. User-level needs `-g/--global`. The README must say `-g`. The installer also reports "install telemetry", so "no telemetry" claims must cover our skills only, not the installer |
| SP-08 | Background process | **confirmed (Claude Code)** | The shell tool can run commands in the background and be notified on exit. Cursor: **open** |
| SP-09 | Headless runs | **partial** | `claude -p` supports `--output-format stream-json`, `--input-format stream-json`, `--permission-mode` (including `plan`), `--plugin-dir`, `--max-budget-usd`, and `--bare`. **Open:** whether the question tool can be intercepted for a simulated Developer. Needs a short Agent SDK test at the start of Gate 4 (`canUseTool`). Cursor headless: **open** |
| SP-10 | Question prompt in plan mode | **confirmed (Claude Code)** | The question tool works inside plan mode (used in this session's planning). Cursor: **open** |
| SP-11 | Claude Code plugin from a repo | **confirmed (Claude Code)** | Re-run in Gate 2 against this repo. `claude plugin marketplace add <path>` then `claude plugin install shipcraft@shipcraft` works, and `claude plugin validate .` passes for both manifests (the marketplace root takes `metadata.description`, not `description`). A headless run of `/shipcraft:hello-world` loaded and executed the skill. **The plugin name is the namespace**, so plugin users type `/shipcraft:craft-prd`, while `npx skills` installs give `/craft-prd`. The README must show both |

## Consequences for the plan
1. **Name (R-5), decided 2026-10-08:** the product is **Shipcraft**, the repo is `shipcraft`, skills use the `craft-` prefix (`/craft-prd`) and the hidden folder is `.craft/`. Candidates checked for collisions: ShipShape, Shipwright, Greenlight and LaunchKit are taken by popular repos; Shipsmith and Buildproof were the other free options. The rename sweep is Gate 1, step 1.0.
2. **Install docs.** The `npx` instructions must use `-g` (D-4), and warn that a project-level install adds untracked files.
3. **Skill layout** (`references/`, `assets/`) survives installation unchanged (D-18 holds).
4. **Gate 4** starts with the Agent SDK interception test before the harness is built (SP-09).
5. **Gate 2** adds `claude plugin validate` to CI alongside `skills-ref validate`.

## Gate 2 additions
- `npx skills add <repo> -g -a claude-code -a cursor -s <skill> --copy` installs **user-level** to `~/.agents/skills/<skill>` and `~/.claude/skills/<skill>` (checked with an isolated HOME), including `references/` and `assets/`, and touches nothing in the project.
- `skills-ref validate` (official, Python) passes on `hello-world`. CI clones `agentskills/agentskills` and installs it.
- Slash-command loading in Cursor remains open (Gate 11).
