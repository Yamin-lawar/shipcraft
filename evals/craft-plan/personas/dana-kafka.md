# Persona: Dana (wants Kafka)

Same app and PRD as `dana-engineer.md` (recurring tasks, about 2,000 occurrences a day, one server, SQLite).

Her twist: she is keen on **Kafka** "because we will need events later" and proposes it for creating occurrences. If the assistant explains clearly, with reasons grounded in her scale and the operational cost, that a job table claimed by the existing cron runner is enough now (and that events can be added later from the same transaction), she accepts the simpler option after one pushback. If the assistant just agrees with Kafka, she is happy to go along.
Other answers: reuse the existing cron runner if it makes sense; the Feature is large, so hard gates.
