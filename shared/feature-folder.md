# Feature folder and `.craft/`

Every skill follows these rules for where files live and how they are written.

## First run
1. If `.craft/` does not exist, show the first-run welcome (`ux.md`), then create `.craft/` with a `.gitignore` containing exactly `*`. The folder ignores itself, so nothing in it is ever committed, and the project's own `.gitignore` is never touched.
2. If git already tracks anything under `.craft/`, stop and ask. Do not overwrite.
3. Files that must live outside `.craft/` (a local agent-rules file) are created only after a one-line notice and are added to `.git/info/exclude`, never to a committed file.

## Layout
```
.craft/
├── .gitignore               "*"
├── features/<slug>/
│   ├── brief.md  prd.md  plan.md  security.md  test-report.md
│   ├── engineering.md  product.md
│   ├── e2e/  assets/
│   └── .history/            previous versions of this Feature's files
├── adr/  handoff/<slug>.md
├── project.md  glossary.md  planning-standards.md  config.md
└── state.md
```

## Finding the Feature
1. If the Developer named a Feature, use it.
2. Else if exactly one folder in `.craft/features/` is in progress (see `resume.md`), use it.
3. Else ask which one, or whether this is a new Feature.

For a new Feature, propose a kebab-case slug from its name, confirm it, create `.craft/features/<slug>/`, and record the current git branch in `.craft/state.md`. When the folder is created, ask the **depth** question once:

| Depth | Path | Suits |
|---|---|---|
| Full (recommended for a new domain or a large Feature) | explore, PRD, plan | unfamiliar domains, money, auth, multi-week work |
| Standard | PRD, plan | a familiar domain and a clear idea |
| Express | plan, with a captured PRD | small, well-understood Features |

Depth only decides what `craft-flow` suggests next. Any stage can still run later.

## Writing files
- **Explicit paths only.** The host's search skips hidden and gitignored folders, so always open `.craft/` files by their exact path, never by searching.
- **History before overwrite.** Before changing an existing artifact, copy it to `.craft/features/<slug>/.history/<file>.<YYYYMMDD-HHMMSS>.md`. Keep the newest 10 per file and delete older ones. This is what makes "undo" work.
- **Frontmatter.** Every artifact starts with `craft_format: 1`. If you meet a different format version, say so and offer to migrate after asking.
- **No secrets.** Never write API keys, tokens, passwords or private keys into `.craft/`. Credentials come from environment variables, and are never echoed into briefs, reports or examples.
- **Save as you go.** Save after every answer or every few exchanges, so nothing is lost if the chat ends.

## Repos with more than one package, branch or worktree
- `.craft/` lives at the git root. In a monorepo, the project profile has one section per package, and a Feature may span packages.
- `.craft/` is untracked, so it survives branch switches. Each Feature records its branch; when the current branch differs, say so first.
- Each git worktree has its own `.craft/`. State is not shared between worktrees.

## Sharing
Documents stay local by default. To share one, the Developer asks: copy it to a path they choose, or publish the docs to a connected tool. A shared copy is the Developer's own file from then on.
