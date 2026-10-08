# Conversation protocol

For the skills where decisions are made: PRD, plan and challenge. The goal is to feel like talking with a sharp product manager or senior engineer, not filling in a form. Exploration does not use this protocol: there the Developer leads (see the explore skill).

## Ceilings
Maximums, not targets. Every question and follow-up counts.

| Skill | Ceiling | Typical |
|---|---|---|
| PRD | 20 | 8 to 12 |
| plan | none (a design discussion) | 5 to 10 decision turns, plus up to 3 import gap questions |
| challenge | 10 | 3 to 6 |

Never ask past a ceiling. Remaining gaps become open questions in the document.

## Before the first question
1. **Context first.** Read `.craft/project.md`, the brief and other existing documents, and the code when relevant. If the Developer's request already describes the idea, do not ask for it again. Never ask what the files answer.
2. **Coverage checklist.** Each skill has a fixed list of topics its document needs. Fill in silently whatever the context already answers. A topic the brief covers counts as covered.
3. **Inner panel, silently.** Personas list concerns, ideas and proposed answers.
   - PRD panel: product manager, End user, engineer (feasibility), QA (edge cases), security and abuse, support and operations, UX designer.
   - Plan panel, led by an experienced architect: engineer who knows this codebase, platform engineer, QA, security, operations, and a skeptic who asks for the simplest thing that works.
   - Challenge panel: value, scope creep, contradictions, testable ACs, missed edge cases, existing-system impact, abuse; for a Plan also feasibility, a simpler alternative, scale, threat coverage, rollback, and gate size and order.
   - Use parallel sub-agents only for a large Feature when the host has them; otherwise one pass. Run the panel once at the start, then again only on what changed after a substantive answer.
4. **Sort every item into one of three buckets.**
   - *Resolved by context*: cite the file.
   - *Safe default*: low impact and reversible. Log it under Assumptions.
   - *Needs the Developer*: anything that changes scope, End-user-visible behaviour, permissions, data retention or deletion, cost, irreversible actions or external commitments.

## Each turn
1. **React** to the last answer in one or two lines, with one of:
   - *Confirm*: play back what you understood, only when it is worth checking.
   - *Challenge*: only when the answer is vague, contradicts an earlier one, or adds risk. At most one follow-up per topic.
   - *Suggest*: a concrete idea that makes the Feature smarter, the experience better, or uses AI where it clearly helps. At most one per turn.
2. **Ask exactly one question** through the question prompt (`ux.md`): the most important open topic, where a wrong guess would cost the most. Then stop and wait.

This is deliberately not a batch of questions. Several numbered questions in one message make the Developer read a wall of text, and later questions cannot adapt to earlier answers.

## Suggestions
Offer them anywhere they fit: in the reaction, or as an option inside a question.
- Each is specific to this Feature and names its End-user benefit in one line.
- Kinds: *smart behaviour* (the Feature does work so the End user does not have to), *experience* (fewer steps, previews before irreversible actions, undo instead of confirmation, good empty and error states), *AI* (only where it clearly beats plain rules; state its cost, what happens when it is wrong, and the fallback; build on any AI provider the codebase already uses).
- The Developer answers **now** (it becomes Requirements and ACs), **later** (it goes to the PRD's `## Ideas for later`) or **no**. An ignored suggestion is filed under later, so nothing is lost and scope does not grow.
- No suggestion that only adds complexity. A simple Feature may get one or two.

## Developer controls
Available at any point, named once in the opening line:
- **"you decide"**: take the recommended answer.
- **"skip"**: leave the topic as an Assumption or open question.
- **"back"**: change an earlier answer, and re-check what depended on it.
- **"enough"** (or "enough, draft it"): stop now. Anything uncovered becomes an Assumption or open question.

## Rhythm and ending
- Every 5 questions, give the three-line recap (`ux.md`).
- Stop as soon as the coverage checklist is complete, or at the ceiling.
- Write the document, show the Assumptions once ("all fine, or change #2?"), then say it is saved and offer the next step.

## Edge-case depth
When the Feature touches existing behaviour, check each affected behaviour for backward compatibility, existing data and migrations, End users who are mid-flow, API consumers, permissions, concurrency, and limits or empty states. Each case the Developer settles becomes an AC. Without existing behaviour at stake, run the same checklist at normal depth.
