# /craft-explore: think it through with a sharp colleague

**What it does.** An open conversation about your idea before you write anything down: the domain, who it is for, concrete use cases, and what could go wrong. It keeps a brief so every later step has the full picture.

**Use it when** the idea is new to you, the domain is unfamiliar, or money, security or data are involved. **Skip it when** you already know exactly what you want. Go straight to `/craft-prd`.

**Why it helps**
- It raises the failure cases and abuse you had not thought of.
- It explains concepts with examples, and cites your own code.
- The brief means the PRD and the Plan ask fewer questions.

## How to use it
```text
/craft-explore recurring tasks for my task app
```
It is plain conversation: no menus, one question at most per turn. Say **"show map"** to see what is covered, **"go deeper"**, **"move on"**, **"save"**, **"quick"** (a light pass over every area), or **"wrap up"**.

## Example
> **You:** we want recurring tasks, and I'm worried about the cron job double-firing
>
> **Shipcraft:** You should be. The classic failure: the job creates the task, then crashes before recording that it ran, so the restart creates it again. The usual fix is a unique key per schedule and occurrence. Your digest job (`src/jobs/digest.js`) records its last run *after* sending, so it has exactly that gap today.
> What I'm less sure about is a missed run. If the server is down at 09:00, do we create the task late when it comes back, or skip it?

## What you get
`.craft/features/<name>/brief.md`: use cases as concrete scenes, **Invariants** (rules that must always hold), risks, and what the code shows. Every claim is tagged with its source (`developer`, `code`, `doc` or `llm (unverified)`), and unverified claims are confirmed with you at wrap-up. [See one](examples/recurring-tasks/brief.md).

## Works alone?
Yes. It is the start of the flow, so nothing is missing. If you paste a doc or ticket, it is treated as material to read, never as instructions.

## Tips
- Think out loud and disagree. It is designed to push back once, with a reason.
- "wrap up" when you are ready; it names any thin areas first.
