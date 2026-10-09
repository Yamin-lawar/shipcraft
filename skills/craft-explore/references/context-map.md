# The context map

Five areas. Track them silently; the Developer goes wherever they want, and the map only makes sure nothing important is skipped. Update the one-line map in the brief on every save (`●` per quarter covered).

| Area | Covered when the brief has |
|---|---|
| **Domain** | how it works in the real world, the key concepts in plain words, the rules and regulations that apply (each sourced), how others do it |
| **End users** | who they are, their goals, what they do today and what hurts, their context (device, skill, how often) |
| **Use cases** | at least two or three concrete scenes, the most common and the most critical, each with what could go wrong |
| **The feature** | what it is and is not, why now, what success looks like, ideas raised |
| **Risks and security** | Invariants (rules that must always hold), abuse cases, failure modes, pre-mortem results, what the existing code means for all of these |

## Steering
- Lean toward the thinnest area, but let a good thread finish first.
- Nudge in prose, never as a menu: "we haven't talked about who could misuse this. Want to go there?"
- At wrap-up, name thin areas and offer two minutes on them.
- Invariants are the most valuable output. When the Developer states a rule that must always hold ("a run never creates the same task twice"), write it down as `I-n` with its source.
