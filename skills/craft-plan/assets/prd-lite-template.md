---
craft_format: 1
feature: <slug>
title: <Feature name>
origin: imported          # imported | captured
captured_by:              # craft-plan when captured here
touches_existing: no
author: Developer
updated: <YYYY-MM-DD>
---

# <Feature name>

> <Two or three lines in plain English: what, for whom, the change.>

## 1. The problem
<Who is struggling with what, with the evidence you have. Say "unknown" where there is none.>

## 2. Target users and use cases
- **U-1** As a <role>, I want <goal>, so that <outcome>.

## 5. Proposed solution
<One or two sentences.>

## 7. Out of scope
- <What this will not do. Never empty.>

## 9. Requirements
#### R-1 [P0] <Who> can <capability>
- **AC-1.1** Given <context>, when <action>, then <observable result>.

## 15. Open questions
| Question | Why it matters | Owner | Needed by |
|---|---|---|---|

<!-- A short PRD. It follows the full PRD template's section numbers, so a later /craft-prd run can fill in the rest. Keep original wording when importing. Never invent evidence. -->
