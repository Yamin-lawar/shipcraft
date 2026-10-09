# Existing codebase

Before saying anything technical, read the code. State what you found in one line ("Node with Express and SQLite, tests with node:test; a daily digest job on node-cron; no queue").

## Detect the stack
Look for manifest files from any ecosystem: `package.json`, `pyproject.toml` or `requirements.txt`, `go.mod`, `Cargo.toml`, `pom.xml` or `build.gradle(.kts)`, `Gemfile`, `composer.json`, `*.csproj` or `*.sln`, `mix.exs`, `pubspec.yaml`, `Package.swift`. A monorepo can have several. Note the language, framework, database, test runner and how to run and test. The Developer may force a mode ("plan this as new").

## Project profile
If `.craft/project.md` is missing, create it from `assets/project-profile-template.md`: stack and versions, folder map, conventions, how to run and test, where auth and data access live, existing infrastructure, and the date. Keep it short and factual. If it exists, read it and mention its date. Refresh it only when the Developer asks.

## What to find
- **How similar features are built:** the closest existing module, from route to storage, and its tests.
- **Reusable pieces:** services, helpers, UI components, shared validation.
- **Existing infrastructure:** queues, job runners and cron, caches, event buses, websockets, feature flags, third-party services.
- **Conventions:** validation, error handling, naming, logging.
- **Auth and scoping:** how a request is tied to the right End user, team or project.
- **Data:** the schema, how migrations are done (or not), seed data.
- **Tests:** the runner, where tests live, how fixtures are made.

Cite files and lines when you rely on them. For a very large repo, ask for the folders that matter instead of reading everything. When the code and the PRD disagree, say so and ask which is right.
