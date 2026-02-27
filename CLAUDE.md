# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a new, empty project directory. No files have been created yet.

When the project is initialized, update this file with:
- Build, lint, and test commands
- The tech stack and framework choices
- High-level architecture and module organization

## Workflow Orchestration

### #1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to prevent misunderstandings

### #2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- Use task and subagents for time-intensive tasks

### #3. Self-Improvement Loop
- After ANY correction from the user: update `tools/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistakes
- Actively iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### #4. Verification Before Done
- NEVER complete a task without proving it works
- DIFF between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### #5. Second Guesses (Elegant Solution)
- For non-trivial changes: pause and ask "Is there a more elegant way?"
- If a fix feels hacky, "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes beneath a senior engineer
- The goal is correctness, not speed of processing it

### #6. Avoiding Fix Fatigue
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at bug, errors, failing tests - then resolve them
- Do not explain things for 10 lines before presenting it

### #7. Task Management
- `#noPlan Planner:` Write plan to `tools/todos.md` with checkable items
- `#reVerify Planner:` Check in before starting implementation
- `#mTrack Progresser:` Mark items complete as you go
- `#mUpdate Changelog:` High-level summary at each step
- `#mDocument ReadmeUser:` Add and review section to `tools/todos.md`
- `#mLearn Learner:` Add corrections to `tools/lessons.md` after corrections

## Core Principles
- `#mSimplicity Firster:` Make every change as simple as possible. Impact minimal code.
- `#mLadder:` No features, No temporary fixes. Senior developer decisions only.
- `#mMinimal Impactor:` Changes should only touch what's necessary. Avoid introducing bugs.
