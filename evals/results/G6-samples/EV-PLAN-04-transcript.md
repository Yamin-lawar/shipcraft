**Assistant:** ▶ habit tracker web app · plan · I'll read the code, then design it with you, one decision at a time. Say "you decide", "skip", "back" or "enough" anytime.

*(wrote .craft/features/habit-tracker)*

**Assistant asked:** How deep should we go on habit-tracker? This only decides what Shipcraft suggests next.
**Developer chose:** {"How deep should we go on habit-tracker? This only decides what Shipcraft suggests next.":"Express"}

**Assistant asked:** Do you have a PRD or spec for the habit tracker to paste or attach?
**Developer chose:** {"Do you have a PRD or spec for the habit tracker to paste or attach?":"No PRD, capture a short one (Recommended)"}

**Assistant asked:** Who uses it, and do they need accounts and sync across devices?
**Developer chose:** {"Who uses it, and do they need accounts and sync across devices?":"Just me, no accounts (Recommended)"}

**Assistant asked:** Should a habit that is not due on a given day (e.g. weekdays-only on Saturday) break the streak?
**Developer chose:** {"Should a habit that is not due on a given day (e.g. weekdays-only on Saturday) break the streak?":"Daily only, any miss breaks it"}

**Assistant:** Noted: habits are daily only, so R-1 drops weekday schedules.

**Assistant asked:** How far back can you edit past days, and when does a "day" roll over?
**Developer chose:** {"How far back can you edit past days, and when does a \"day\" roll over?":"Any past day; midnight local time (Recommended)"}

*(wrote .craft/features/habit-tracker/prd.md)*

**Assistant:** PRD saved to `.craft/features/habit-tracker/prd.md` (5 requirements). Say "back" to change anything.

Mode: **greenfield** (empty repo, no manifest, one baseline commit).

**Readout**

It can be built as described, and it's small. The hard parts are modest:
1. **Streak correctness.** Current and longest streak have to recompute after any backfill or removal. Date handling must use local calendar dates, not timestamps, or timezone and DST bugs appear.
2. **Durable local data.** Browser storage can be cleared or blocked, so the data is only as safe as the browser.
3. **The "today not yet checked" rule.** The streak shouldn't read as broken at 9am.

The browser already provides storage (IndexedDB and localStorage), routing and a date API. There's no code to reuse. New: the app shell, a storage module, a pure streak function and the UI. With one user and no sync there is no server, database, auth, queue or hosting beyond static files.

**Proposed design**

**Recommended: a static single-page app, with local storage and pure logic.**
- TypeScript, Vite, and React (or plain TS), built to static files.
- Habits and check-ins live in the browser in a small storage module.
- Streaks are computed from the check-in dates by a pure function and never stored. That makes backfill and undo trivially consistent.

**Alternatives**
- **A. Server and SQLite.** Gives multi-device use, but adds hosting, auth and backups. That's overkill for "just me".
- **B. Local-first plus JSON export/import.** This is the recommended design plus a safety valve. It's cheap to add, and I'd likely suggest it.

**Main flow (check-in)**
1. The user opens the app and the list of active habits loads from storage.
2. They tap a habit for today, and the app writes `{habitId, date: "2026-10-09"}`, a unique pair.
3. The app recomputes streaks from that habit's dates and re-renders.
4. Undo deletes that pair, and the app recomputes again.

**Trade-offs:** there's no sync and no backup unless we add export. Everything is trivial to host and has no running cost.

**Assistant asked:** Which framework and language should the app use?
**Developer chose:** {"Which framework and language should the app use?":"Vite + React + TypeScript (Recommended)"}

*(wrote .craft/handoff/habit-tracker.md)*

**Assistant asked:** Where should habits and check-ins be stored in the browser?
**Developer chose:** {"Where should habits and check-ins be stored in the browser?":"localStorage, one versioned JSON blob (Recommended)"}

*(wrote .craft/handoff/habit-tracker.md)*

**Assistant asked:** Since browser storage can be wiped, do you want JSON export/import in the first version?
**Developer chose:** {"Since browser storage can be wiped, do you want JSON export/import in the first version?":"Yes: export and import buttons (Recommended)"}

*(wrote .craft/handoff/habit-tracker.md)*

**Assistant asked:** Where will it be deployed?
**Developer chose:** {"Where will it be deployed?":"Static host, e.g. GitHub Pages / Netlify / Cloudflare Pages (Recommended)"}

*(wrote .craft/handoff/habit-tracker.md)*

**Assistant asked:** How should we test it?
**Developer chose:** {"How should we test it?":"Vitest unit tests for streak/date/storage logic + one Playwright smoke test (Recommended)"}

*(wrote .craft/handoff/habit-tracker.md)*

**Assistant:** **Design summary**

**Problem:** a single-user personal habit tracker. Daily habits, check-ins, streaks, history.

**Design:** a static React, TypeScript and Vite SPA with no server. Habits and check-ins live in `localStorage` as one versioned JSON blob, behind a `Storage` interface. Streaks are never stored. A pure function derives them from each habit's check-in dates.

**Flow:** tap a habit → write the unique `{habitId, YYYY-MM-DD}` pair → recompute streaks → re-render. Undo deletes the pair.

**Decisions (and the alternative that lost):**
- D-1 Single user, local-only data (accounts and sync need a backend).
- D-2 Daily habits only, and any miss breaks the streak (weekday schedules).
- D-3 Any past day is editable, using the local date with a midnight rollover (a 7-day limit).
- D-4 Vite, React and TypeScript (vanilla TS, Next.js).
- D-5 `localStorage`, one versioned blob (IndexedDB, SQLite WASM).
- D-6 JSON export and import in v1 (later, never).
- D-7 Static host, rolling back by redeploying the previous build (local only, own server).
- D-8 Vitest for the logic plus one Playwright smoke test (React Testing Library only, manual).

**Hard parts:**
- **Dates:** dates are plain `YYYY-MM-DD` strings from the local clock, never timestamps, so timezone and DST changes can't shift history.
- **Streak rule:** today unchecked doesn't break the streak until the day ends.

**Cross-cutting:**
- **Failure and recovery:** corrupt or unparsable storage is kept as a backup key and the user gets a clear error. A write that fails (quota or blocked storage) is surfaced, not swallowed. Export is the recovery path.
- **Data and migrations:** the blob carries a `version` field and a migration function. Import rejects newer versions.
- **Security:** no server or accounts. Imported JSON is schema-validated and rendered as text, never as HTML.
- **Observability:** not applicable, because there's no server. Errors go to the console and an in-app message.
- **Scale:** a few habits × 365 dates/year is tens of KB, far under the ~5MB limit (assumption to check per browser).
- **Cost:** $0 on a static host.
- **Rollout and rollback:** no server means no migrations to coordinate. Rollback is redeploying the previous build. Changing the URL orphans the data, so export first.

**Reused:** the browser's storage and Date. **New:** everything else.
**Not done:** accounts, sync, schedules, reminders, native apps.

**Assistant asked:** Is this design summary right?
**Developer chose:** {"Is this design summary right?":"Yes, go ahead (Recommended)"}

**Assistant asked:** How should the build be gated?
**Developer chose:** {"How should the build be gated?":"No gates (Recommended)"}

*(wrote .craft/handoff/habit-tracker.md)*

**Assistant:** The design is agreed and saved. The Plan comes next, written by plan mode.

▶ Your turn: switch to Plan mode
  How:  in Claude Code, press Shift+Tab until the mode shows "plan mode", or approve the plan-mode switch if it's offered.
  Then send:  plan habit-tracker from .craft/handoff/habit-tracker.md
  Everything is saved, so nothing is lost if you do this in a new chat.

This is a good place for a fresh chat.

✔ Saved .craft/handoff/habit-tracker.md · Next: plan mode writes the Plan · Say "continue" in any new chat to pick this up.