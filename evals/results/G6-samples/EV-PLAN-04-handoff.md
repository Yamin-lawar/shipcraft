---
craft_format: 1
feature: habit-tracker
prd: .craft/features/habit-tracker/prd.md
brief: none
mode: greenfield
size: small
gating: none
updated: 2026-10-09
---
# Hand-off: Habit tracker

## Design summary
Single-user static SPA (Vite + React + TypeScript). Habits and check-ins in localStorage as one versioned JSON blob behind a Storage interface. Streaks are derived by a pure function from per-habit check-in dates (never stored). Flow: tap habit -> write unique {habitId, YYYY-MM-DD} -> recompute -> render; undo deletes the pair. JSON export/import included. Deployed to a static host.

## Decisions
| ID | Decision | Chosen | Alternatives | Why |
|---|---|---|---|---|
| D-1 | Users | Single user, local-only | Accounts + sync | No backend/auth needed for "just me" |
| D-2 | Schedules | Daily only; any miss breaks streak | Weekday schedules, grace day | Simplest rule; Developer's choice |
| D-3 | Backfill/day | Any past day; local date, local midnight | 7-day limit, today only | Forgiving; plain date strings avoid TZ bugs. Future dates refused |
| D-4 | Stack | Vite + React + TypeScript | Vanilla TS, Next.js | Mainstream, static build, no server runtime |
| D-5 | Storage | localStorage, one versioned JSON blob behind a Storage interface | IndexedDB, SQLite WASM | Tens of KB total; swappable later |
| D-6 | Backup | JSON export/import in v1 (validate, confirm before overwrite) | Later, never | Browser data can be wiped |
| D-7 | Hosting | Static host; rollback = redeploy previous build | Local only, own server | $0, no ops |
| D-8 | Tests | Vitest (streak/date/storage/import) + one Playwright smoke | RTL only, manual | Risk is in pure logic |

## Reuse
Nothing exists (empty repo). Browser provides localStorage, Date, file download/upload APIs.

## Constraints
- Dates are local calendar strings YYYY-MM-DD, never timestamps; unique (habitId, date).
- Streaks are derived, never stored.
- Today unchecked does not break the current streak until the day ends.
- Future dates cannot be toggled.
- Archived habits keep history.

## Hard parts and failure handling
- Corrupt/unparsable storage: keep raw value under a backup key, show a clear error, start empty only after user confirms.
- Failed write (quota/blocked storage): surface error, do not swallow; UI must not show a state that wasn't saved.
- DST/timezone: avoided via date strings; date arithmetic done on calendar days, tested around DST.
- Import: schema-validate, reject newer versions, confirm before overwrite.

## Security and trust boundaries
No server, accounts or network calls. Imported JSON is untrusted: validated, rendered as text only (no HTML injection), size-limited.

## Data and migrations
Blob has `version`; a migrate() function from day one (v1 only for now). Not applicable otherwise: no server database.

## Rollout and rollback
Static deploy. Rollback = redeploy previous build. Changing the URL/origin orphans local data, so export first. No flags needed.

## Numbers
A few habits x 365 dates/year = tens of KB; localStorage limit ~5MB (assumption to check per browser). Cost $0.

## Observability
Not applicable: no server. Errors to console plus in-app message.

## Files held back
None.

## Open questions
- Which static host (not decided; any works).
- Whether to add a PWA/offline manifest later (out of scope for v1).

## Suggested first slices (for the Plan)
1. Scaffold Vite/React/TS + Vitest. 2. Date + streak pure functions with tests. 3. Storage module + versioning + corruption handling. 4. Habit CRUD and today list. 5. Backfill/history view. 6. Export/import. 7. Playwright smoke + deploy.
