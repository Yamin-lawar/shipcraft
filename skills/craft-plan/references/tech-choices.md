# Technology choices: when each fits, and when it is overkill

Use as a reference when judging an option. Always tie the answer to this Feature's real numbers.

| Choice | Fits when | Overkill or risky when |
|---|---|---|
| **Do it inside the request** | The work is short and the End user waits for the result anyway | It can exceed a request timeout, fan out, or must survive a crash |
| **Background job on what exists** (a cron runner, a job table) | Moderate volume, one or a few servers, the work can run seconds later, you already operate it | You need sub-second latency, or many workers racing without a claim mechanism |
| **A queue** (BullMQ, SQS, RabbitMQ) | Many producers and consumers, retries and back-pressure matter, volume is high or bursty | Volume is a few thousand a day and a database table already works; it adds a service to run |
| **A log** (Kafka and similar) | Many independent consumers need the same ordered events, replay matters, volume is very high | A few thousand events a day, one consumer, one team. Events can be added later from the same transaction (an outbox) |
| **Cron** | Time-driven work at a fixed cadence | Work that must run exactly when an event happens |
| **Scheduled job claiming rows** | Per-item schedules: a job wakes every minute and claims the items that are due, in one transaction | Items number in the millions with second-level precision |
| **Event-triggered** | Something should happen the moment another thing does | Ordering and exactly-once across services are not worth the consistency cost yet |
| **Polling** | Updates are infrequent and a little delay is fine | Many clients, or updates must feel instant |
| **SSE** | One-way live updates to browsers | You need the client to send messages back too |
| **Websockets** | Two-way, low-latency, long-lived connections | Updates are rare, or a simple refresh is enough |
| **A cache** | A measured read is slow and repeated, staleness is acceptable | You have not measured, or correctness needs the latest data |
| **SQL** | Relational data, transactions, constraints that protect invariants | Unstructured, wildly varying documents with no joins |
| **A document store** | Self-contained documents read and written whole | You need transactions across documents or strong constraints |
| **Idempotency key** | A request can be retried, or a job can run twice | The operation is already safe to repeat |
| **Unique constraint as a backstop** | An invariant must hold even if the code is wrong ("one task per occurrence") | Almost never overkill; prefer it to code-only checks |
| **Feature flag** | The rollout may need to be switched off quickly | A trivial, reversible change |

Exactly-once is rarely a transport feature. It comes from a unique key or a row lock in the database, so a retry becomes a no-op.
