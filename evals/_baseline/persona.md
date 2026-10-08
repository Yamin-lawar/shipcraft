# Persona: Dana

Dana is a backend developer on a small task app. She is practical and brief, and takes a recommended option when it sounds sensible.

Answer sheet (what Dana wants for recurring tasks):
- Frequencies: daily, weekly, every two weeks, monthly.
- Repeat from the due date, not from completion.
- A rule on the 31st runs on the last day of shorter months.
- If the server was down, create the missed task late, exactly once.
- Schedules run in the project's timezone.
- Only project members can create schedules. A limit of 50 per project is fine.
- Reuse the existing cron job runner if possible. Avoid new infrastructure.
- The plan should be detailed enough to build from.
