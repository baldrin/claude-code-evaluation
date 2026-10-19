---
title: Benchmark tasks
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: "1-2"
---

# Benchmark tasks

[🏠 Home](../../README.md) › Productivity & quality › Benchmark tasks

This is a controlled set of representative tasks, done **with** and **without** Claude Code, and timed and scored with a rubric. It complements the real-work metrics: it shows the effect under controlled conditions and by task type. It's also reused for model and effort cost comparisons ([COST-003](../03-test-plan/catalog/cost.md#cost-003)).

## Contents
- [Design](#design)
- [Task set](#task-set)
- [Scoring rubric](#scoring-rubric)
- [Procedure](#procedure)
- [Recording sheet](#recording-sheet)

## Design

| Element | Design |
|---|---|
| Tasks | 8 tasks, two per type, from real pilot repos or a shared sandbox repo. Each takes about 30–90 minutes without AI. |
| Pairs | Each type has two **matched** tasks of similar size (A and B variants) |
| Counterbalancing | Half of the developers do variant A with Claude and B without. The other half do the reverse. The order also alternates. |
| Timebox | 2× the expected time. Unfinished tasks are scored as-is. |
| Phase 1 | The evaluation lead runs every task with Claude (all model/effort combos for COST-003) to calibrate times and validate the tasks |
| Phase 2 | Each participant does 4 tasks (one of each type), split 2 with / 2 without, in week 0 (cohort B, before access) or week 6 |
| Repo tier | Tasks come from repos of a known [capability tier](measurement-framework.md#repo-capability-tier). In compile-check and edit-only repos, the developer builds and tests in Visual Studio in **both** conditions, and the time includes that. Record the tier, and analyse those tasks separately. |

## Task set

Write the actual tasks against `<repo>` before Phase 2. Seed each with a known commit so it can be reset.

| ID | Type | Task (template) | Variant A | Variant B | Expected (no AI) |
|---|---|---|---|---|---|
| BT-1 | 🐛 Bug fix | Reproduce and fix a reported bug, with a regression test | Bug in date parsing | Bug in pagination | 45 min |
| BT-2 | ✨ Feature | Add a small feature end to end (API + validation + tests) | New query filter | New export format | 90 min |
| BT-3 | 🧪 Tests | Raise coverage of an untested module to ≥ 80% | Module X | Module Y | 60 min |
| BT-4 | 🔧 Refactor | Refactor a function or class for readability without behavior change; tests stay green | Long function | God class | 60 min |
| BT-5 | 🧭 Unfamiliar code | Answer 5 questions about an unfamiliar part of the codebase, then make a small change there | Subsystem P | Subsystem Q | 45 min |
| BT-6 | 📦 Dependency upgrade | Upgrade a library across a breaking change | Lib upgrade 1 | Lib upgrade 2 | 60 min |
| BT-7 | 📝 Docs | Write developer docs for a module (README + docstrings) | Module X | Module Y | 30 min |
| BT-8 | 🔍 Code review | Review a seeded PR with 5 planted issues | PR 1 | PR 2 | 30 min |

## Scoring rubric

Each attempt is scored by a reviewer who **doesn't know** whether Claude was used (blind review where feasible).

| Dimension | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **Correctness** | Doesn't work | Partially works | Works, edge cases missed | Works, edge cases handled |
| **Tests** | None | Weak | Adequate | Thorough, meaningful |
| **Code quality** | Hard to maintain | Below team standard | Meets standard | Exemplary |
| **Completeness** | < 50% | 50–80% | 80–100% | 100% + polish |
| **Security / safety** | Introduces an issue | Risky pattern | Fine | Proactively safer |

**Quality score** = sum (0–15). **Time** = minutes to "done" (the developer's call) or the timebox. For BT-8, **issues found** (0–5) replaces correctness.

## Procedure

1. Reset the repo to the task's seed commit.
2. Give the developer the task card (same wording for both conditions).
3. **With Claude:** a fresh session (`/clear`), default model and effort per pilot guidance, any mode they like. Record the session ID.
4. **Without Claude:** normal tools only (IDE, docs, search). No AI assistants.
5. Start the timer when they've read the card. Stop it when they declare done.
6. Submit as a PR to a benchmark branch for blind scoring.
7. Record cost (OTel by session ID) for the with-Claude runs.

## Recording sheet

| Dev | Tier | Task | Variant | Condition | Time (min) | Quality (0–15) | Cost ($) | Model / effort | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `<dev-01>` | Full | BT-1 | A | With | | | | | |
| `<dev-01>` | Full | BT-1 | B | Without | | | — | — | |

**Analysis:** paired difference per developer per task type (time and quality). Report the median with a range and the share of tasks where Claude was faster at equal or better quality.

## Related
- [Measurement framework](measurement-framework.md) · [COST-003](../03-test-plan/catalog/cost.md#cost-003)
