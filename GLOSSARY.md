# Shipcraft

A suite of skills that takes one Feature from idea to shipped, tested and documented code, through conversations with a Developer and files left in the project.

## Language

### People

**Developer**:
The person running the suite, and the only person the skills talk to.
_Avoid_: user

**End user**:
A person who uses the Feature being built.
_Avoid_: user, customer

### What gets built

**Feature**:
The unit of work the suite handles from idea to ship. One Feature has one Spec.
_Avoid_: change, ticket, story

**Exploration**:
An open, Developer-led conversation about a Feature's domain before the PRD or Plan is written. The agent explains, compares and raises pitfalls instead of interviewing.
_Avoid_: discovery, brainstorm, interview

**Brief**:
The distilled record of a Feature's Explorations, covering the domain, End users, Use cases, the Feature itself, and risks and security, with each claim tagged by its source. Input to planning, not a contract.
_Avoid_: context file, notes, transcript

**Use case**:
A short, concrete story of an End user trying to get something done with the Feature, including what could go wrong. Use cases seed the main flow, Acceptance criteria and journey tests.
_Avoid_: scenario, user story, persona

**Invariant**:
A rule about the domain that must always hold, such as "a retried transfer never moves money twice". Confirmed Invariants become Acceptance criteria and design constraints.
_Avoid_: constraint, business rule

**Spec**:
The PRD of a Feature. The long-lived statement of what the Feature must do.
_Avoid_: spec.md, requirements doc

**PRD**:
The document that captures a Feature's problem, scope, Requirements and Acceptance criteria. It is written through the product conversation, imported from the Developer's own document, or captured briefly when a later skill needs acceptance criteria and none exist. It is the Spec.
_Avoid_: product doc, brief

**Requirement**:
One capability the Feature must provide, identified as `R-n`.

**Acceptance criterion**:
One testable, given/when/then statement under a Requirement, identified as `AC-n.m`. Edge cases settled in conversation become Acceptance criteria. There is no separate edge-case item.
_Avoid_: edge case (as an artifact), test case

**Plan**:
The technical approach for building a Feature from its Spec, written by the host's plan mode to Shipcraft's planning standards. Kept up to date whenever a change touches what it describes. Where the Plan and the code disagree, the code wins.
_Avoid_: spec, roadmap

**Gate**:
A stage of a Plan with its own deliverables, unit tests and exit checklist, used when the Developer chooses gated planning. With hard gates, the next Gate starts only after the Developer says continue. With checkpoints, it starts as soon as the checklist is green.
_Avoid_: milestone, phase, sprint

**Feature folder**:
The one folder in the project that holds everything about a single Feature. It is created before anything else is written for that Feature.
_Avoid_: workspace, spec folder

**Mode**:
Whether a Plan builds on an existing codebase (`existing`) or from nothing (`greenfield`). A property of the Plan, not of the PRD.
_Avoid_: project type

### Conversation

**Suggestion**:
A concrete idea the agent offers during a conversation to make the Feature smarter, easier to use, or AI-assisted. The Developer takes it now, defers it, or rejects it.
_Avoid_: recommendation (that's the preferred option of a question), tip

**Idea for later**:
A Suggestion the Developer deferred or ignored. Recorded in the PRD, and never in scope.
_Avoid_: backlog, nice-to-have

### Flow

**Depth**:
How much of the flow a Feature goes through, chosen once by the Developer: Full (explore, PRD, plan), Standard (PRD, plan) or Express (plan with a captured PRD).
_Avoid_: mode, track, tier

**Hand-off**:
The file that carries an agreed design from the planning conversation into plan mode, so nothing is lost when the mode or thread changes. Deleted once the Plan is saved.
_Avoid_: context dump, notes

### Gates

**Consent**:
The Developer's explicit go-ahead before the agent acts: the host's plan-mode approval, continuing past a Gate, confirming a Challenge's edits, or confirming security fixes. Documents themselves have no approval state.
_Avoid_: approval, sign-off, lock

**Challenge**:
An optional adversarial conversation about a Feature's PRD and Plan. Its agreed outcomes are written back into both documents.
_Avoid_: review, grilling

### Problems found

**Issue**:
Anything the fix step works on: a Bug, a Spec gap or a Finding.
_Avoid_: defect, ticket

**Bug**:
A failing end-to-end test caused by the code.
_Avoid_: defect

**Spec gap**:
A failing end-to-end test where the Spec doesn't say what should happen. The Developer decides, and the decision becomes a new Acceptance criterion.
_Avoid_: missing requirement, ambiguity

**Finding**:
A security problem reported by the security review.
_Avoid_: vulnerability (unless confirmed), bug

### Testing the skills

**Fixture**:
A small sample application kept in this repo's `evals/` folder, used to run skills against a real codebase and score the result. Never shipped to users.
_Avoid_: demo app, example project

