# Edge-case checklist

Use it to decide what to probe, never to read out as a list. Ask only about what applies, one question at a time. Each case the Developer settles becomes an AC under the Requirement it belongs to.

## Lifecycle of whatever the Feature creates or changes
- **First use:** what does an End user see before anything exists? What does the first run need?
- **Everyday use:** the main path, the usual size, the usual frequency.
- **Coming back and changing it:** edit, undo, rename, move.
- **Many of them:** long lists, paging, limits, a per-person or per-project cap, performance an End user would notice.
- **Errors and recovery:** bad input, a failed step halfway, a retry, a double submit, offline or slow.
- **Retiring it:** delete, archive, restore, what happens to things that depend on it.
- **Leaving:** export, hand-over, account removal.

## When the Feature touches existing behaviour
- **Backward compatibility:** what must keep working exactly as today? Who relies on it?
- **Existing data:** old rows without the new field, a migration, a default, data that no longer fits.
- **End users mid-flow:** someone halfway through the old flow when the new one ships.
- **API and integration consumers:** changed responses, new required fields, webhooks, exports.
- **Permissions:** who may do the new thing, and who must not see what; roles that already exist.
- **Concurrency:** two people at once, the same action twice, an action while a background job runs.
- **Time:** time zones, daylight saving, month ends, "late" and "missed".

## Abuse and security (product rules, not implementation)
- Who might misuse this, and how? Flooding, guessing identifiers, reading another team's data, sending to people who did not agree.
- What is logged, and what personal data is kept or shown?

## Measurement
- What event would show the Feature works? Is there a baseline, or is it "unknown, measure first"?
