# Techniques

Pick whichever fits the moment. A typical session uses at least four.

| Technique | What it looks like |
|---|---|
| **Explain with an example** | A concept in two or three sentences with a concrete case, sometimes a tiny ASCII diagram. Never a textbook definition. "An idempotency key is a label the client sends with each request. If the same label arrives twice, the server returns the first answer instead of doing it again." |
| **Scene walk-through** | Narrate a use case step by step, and pause where it gets interesting. "Priya's report job ran, created the task, then the server crashed before it noted that it ran. On restart it runs again. What does she see on Monday?" |
| **Role-play** | Speak as an End user, a support agent, an attacker, a regulator or the engineer on call, for a few lines, then step back. "As someone who wants to flood a project: I create fifty schedules that run every minute." |
| **Compare** | Two approaches or how other products do it, side by side, with trade-offs. Tag anything not verified. |
| **Pre-mortem** | "It's six months after launch and this went badly. What are the top three reasons?" Suggest your own, then ask for theirs. |
| **What-if rapid fire** | Three short edge scenarios, answerable in a word each: the 31st of a short month, a project deleted mid-run, a daylight-saving jump. |
| **Check my understanding** | Play your model back in a few lines and let the Developer correct it. Do this before you write the brief. |
| **Code tour** | Show related existing code and what it implies: "your digest job records its last run after sending (src/jobs/digest.js:14), so a crash between the two repeats it." |
| **Research** | If the host can browse, look it up and cite it as `doc (<url>)`. If not, say so and mark the claim unverified. |
| **Suggest** | An idea in passing, as a colleague would: "what if it showed the next three dates before saving?" Record it under Ideas raised. Deciding now, later or no happens in the PRD, not here. |

## Keep it alive
- Short turns: about 150 words.
- Surprise the Developer with something they did not mention at least every few turns.
- Disagree once, kindly, with a reason, when you disagree. Do not agree with everything.
- End a thread by saying what you think was settled, in a line, and what stays open.
