---
title: Training agenda
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 2
---

# Training agenda

[🏠 Home](../../README.md) › Phase 2 pilot › Training agenda

This is the 90-minute onboarding session each cohort gets on day 1, plus follow-up material. The content draws on the Phase 1 feature sweep ([FEAT tests](../03-test-plan/catalog/features.md)), where each feature was rated for usefulness.

Developers with Windows-only .NET or VB.NET repos also get a **10-minute breakout** after the session: the shared-folder workflow, building and testing in Visual Studio, and reviewing build-file, script, and package changes **before** building on Windows ([quick-start](developer-quickstart.md#windows-only-net-and-vbnet-repos)).

## Session plan (90 min)

| Time | Segment | Content | Format |
|---|---|---|---|
| 0:00 | **Why we're here** (10 min) | Goals of the pilot, what's measured and what isn't ([AUP §6](acceptable-use-policy.md#6-whats-measured-about-you)), how your feedback shapes the decision | Talk |
| 0:10 | **How it's secured** (10 min) | Container, sandbox, network, managed policy, in plain language. Claude Code only ever runs in the container, never natively on Windows. Web search and web fetch are off. Packages come only from Nexus, so don't change package sources. What will be blocked and why. How to ask for changes. | Talk + diagram ([defense in depth](../02-security-baseline/defense-in-depth.md#layer-model)) |
| 0:20 | **Setup together** (15 min) | Everyone runs the [quick-start](developer-quickstart.md) steps 1–4. Helpers on hand. | Hands-on |
| 0:35 | **Core loop demo** (15 min) | Live on a real pilot repo: explore → plan mode → implement → tests → review diff → commit → PR. Esc and rewind. `/clear`. | Live demo |
| 0:50 | **Your turn** (20 min) | Each person picks a small real issue in their repo and works it with Claude, using the demo pattern | Hands-on |
| 1:10 | **Power features** (10 min) | CLAUDE.md and `/init` · subagents · `/code-review`, `/security-review` · `/model` and `/effort` for cost · skills · worktrees | Demo |
| 1:20 | **Good habits and cost** (5 min) | The [daily habits](developer-quickstart.md#daily-habits-that-work) table. What a typical day costs, and what's expensive. Your spend caps: the 75%/95% warnings, the emails, what happens at 100%, and why agents left running unattended get paused. | Talk |
| 1:25 | **Q&A and logistics** (5 min) | Support channel, office hours, surveys, PR checkbox | Talk |

## Prompting patterns to teach

| Pattern | Example |
|---|---|
| Explore first | "Read the auth module and explain how sessions expire. Don't change anything yet." |
| Plan, then do | Shift+Tab → "Plan the change to add rate limiting to /login" → review → approve |
| Give verification | "…then run `make test` and fix failures until green." |
| Constrain scope | "Only modify files under `src/parser/`." |
| Ask for alternatives | "Give me two approaches with trade-offs before implementing." |
| Review mode | "Review this diff as a senior engineer. Focus on error handling and edge cases." |
| Learn the codebase | "I'm new to this repo. Walk me through a request from the HTTP handler to the database." |
| Check what can build here | "Scan the `.csproj` and `.vbproj` files and tell me which projects can build and test here, which can only compile, and which need Windows." |
| Review before a Windows build | "List every change you made to build files, scripts, or package references since the last commit, and why." |

## Follow-up material

- [Developer quick-start](developer-quickstart.md)
- Recording of the session (internal)
- Official: [Best practices](https://code.claude.com/docs/en/best-practices) · [Common workflows](https://code.claude.com/docs/en/common-workflows) · [Costs](https://code.claude.com/docs/en/costs)
- Pilot `CLAUDE.md` template ([FEAT-004](../03-test-plan/catalog/features.md#feat-004) output)
- Use-case library from show & tell sessions (built during the pilot)

## Trainer checklist

- [ ] Demo repo reset to a known commit, with a real but small issue ready
- [ ] Demo container tested the same morning (`/status` clean)
- [ ] Helpers briefed (one per ~6 participants)
- [ ] Support channel pinned message ready
- [ ] Attendance and AUP acknowledgements recorded in the roster
- [ ] Spend caps set for every participant, and the notification job running (gateway stage)
- [ ] Shared-folder setup checked for each Windows-only repo
