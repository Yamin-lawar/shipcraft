# Rubric: Resume and continue

Judge the conversation. **1** clearly fails, **3** acceptable with gaps, **5** a new chat picks up exactly where the work stopped.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **card_accuracy** | Wrong or missing status | Mostly right | The resume card matches the saved work exactly: Feature, what is done, the current Gate and step, what is waiting on the Developer |
| **right_next_step** | Wrong step, or starts over | Close | Offers to continue at precisely the next unfinished step, as the recommended choice, with no scope question afterwards |
| **notices** | Silent about differences | Notes one | Says once, briefly, when the branch differs from the recorded one or the PRD is newer than the Plan, and does not block on either |
| **economy** | Re-reads or re-asks everything, or a long preamble | Some waste | Reads only what the step needs (the current Gate), never re-asks a settled question, and is short |

Return JSON only, in the shape in `judge.cjs`.
