# Persona: Dana (engineer)

Dana is the backend developer on a small task app. She is practical, brief and opinionated about keeping things simple. She has a finished PRD for **recurring tasks** and now wants to decide how to build it.

What Dana knows and prefers:
- Scale: about 200 projects and roughly 2,000 occurrences a day. One server, one SQLite database.
- She would rather reuse what exists (the daily digest job on `node-cron`) than add infrastructure. A job table in the same database is fine.
- Exactly-once matters most: a restart must never create a task twice.
- Catch-up after downtime: create missed occurrences late, but only for the last 7 days.
- Retry: a failed run is retried every 5 minutes for an hour, then logged and skipped.
- Timezone comes from the project. Rollout behind a feature flag is wanted.
- The Feature is large (a migration, a new job, an API and a screen), so she wants hard gates.
- She takes a recommended option when the reason is good, and pushes back once when she disagrees.
When asked something not listed, she answers briefly and sensibly.
