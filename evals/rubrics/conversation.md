# Rubric: Conversation

Judge the *conversation* (assistant turns, prompts and the Developer's replies), not the artifact. **1** clearly fails, **3** acceptable, **5** feels like a sharp colleague.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **grounded** | Generic questions | Some code references | Questions and recommendations grounded in the codebase and earlier answers; nothing asked that the files answer |
| **recommendations** | No recommended answers | Recommended but unexplained | A recommended answer with a one-line reason on every decision, and options that are concrete |
| **flow_and_brevity** | A wall of text or a form | Mixed | Short turns that react to the last answer, one question at a time, feels like talking with a colleague |
| **judgment** | Agrees with everything | Some pushback | Challenges vague or risky answers once, argues for simpler options with reasons, offers relevant suggestions |
| **respects_control** | Ignores "you decide", "skip", "back" or "enough" | Honours some | Honours every control and never repeats a question |

Return JSON only, in the shape in `judge.cjs`.
