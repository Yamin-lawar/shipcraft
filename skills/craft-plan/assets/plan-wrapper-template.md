---
craft_format: 1
feature: <slug>
prd_updated: <the PRD's updated date when this Plan was written>
mode: existing             # existing | greenfield
size: large                # small | large
gating: hard               # hard | checkpoints | none (the Developer's choice)
gates:                     # when gating is hard or checkpoints
  - { gate: 1, name: "<name>", status: pending }   # status: pending | in-progress | passed
---
<the Plan, as written by the host's plan mode under planning-standards.md>

## Change log
<!-- Appended after the Plan is saved (by the fix and challenge skills), one line per change, with the date. -->
