---
title: Start here
status: In review
owner: <evaluation-lead>
last_updated: 2026-10-20
version: 1.0
phase: "1-2"
---

# Start here

[🏠 Home](README.md) › Start here

How the evaluation lead works through this repo: what to read first, what to set up, and the daily and weekly routine. It links to the detailed docs rather than repeating them. Pilot developers use the [developer quick-start](docs/07-phase2-pilot/developer-quickstart.md) instead.

## Read first

About two hours, in this order:

| # | Read | Why |
|---|---|---|
| 1 | [README](README.md) | The map of the repo, the legend, and the repo rules |
| 2 | [Charter](docs/00-charter/charter.md) and [success criteria](docs/00-charter/success-criteria.md) | What "done" means, and the [G1 go/no-go](docs/00-charter/success-criteria.md#gate-g1-phase-1-go--no-go) criteria. Agree the «proposed» thresholds with stakeholders early. |
| 3 | [Reference architecture](docs/01-architecture/reference-architecture.md) | What you're building. Skim [identity and access](docs/01-architecture/identity-and-access.md) and [network egress](docs/01-architecture/network-egress.md). Leave the [threat model](docs/01-architecture/threat-model.md) for later. |
| 4 | [Defense in depth](docs/02-security-baseline/defense-in-depth.md) | The 29 controls and the tests that prove each one. [Managed settings](docs/02-security-baseline/managed-settings.md) is the policy you'll deploy. |
| 5 | [Test strategy](docs/03-test-plan/test-strategy.md) | The process doc that matters most. Read [execution order](docs/03-test-plan/test-strategy.md#execution-order-phase-1), [how to run a test](docs/03-test-plan/test-strategy.md#how-to-run-a-test), and [verdict rules](docs/03-test-plan/test-strategy.md#verdict-rules) closely. |
| 6 | [Decision log](logs/decision-log.md) and [risk register](logs/risk-register.md) | Skim them so you know what's decided and what's still open |

Leave the [feature inventory](docs/04-feature-inventory/README.md) for Phase 1 week 3, and the cost, productivity, and pilot docs (`05`–`07`) until you start preparing Phase 2.

## Set up

1. **Records repo.** Create it and point the tracker at it: [setting up the records repo](tools/tracker/README.md#setting-up-the-records-repo). Run the tracker's self-test in Edge first.
2. **Task list.** Copy [templates/tasks.md](templates/tasks.md) into the records repo as `TASKS.md`. It comes with a starter backlog: the asks to the [supporting teams](docs/00-charter/charter.md#supporting-teams), the open decisions, and Phase 2 preparation. Replace the placeholders with names.
3. **Tracker defaults.** In the tracker's **Settings**, set the defaults for new entries and click **Add standard test-catalog sections** ([get started](tools/tracker/README.md#get-started)).
4. **Long-lead asks.** Send the asks under **Now** in `TASKS.md` first. Other teams take time to respond, and Week 1 depends on the VDI, Nexus, Entra, and Foundry.

## Every day

1. **Morning:** check `TASKS.md`: the Inbox, **Now**, and any **Waiting on** follow-ups due today.
2. **Pick the next tests** from the [execution order](docs/03-test-plan/test-strategy.md#execution-order-phase-1).
3. **Run each test** as [how to run a test](docs/03-test-plan/test-strategy.md#how-to-run-a-test) describes, and record it in the [tracker](tools/tracker/README.md#recording-a-step).
4. **For any 🟨 or 🟥,** raise a [finding](templates/finding.md) and log it in the [issue log](logs/issue-log.md). If it changes the design, add an [ADR](templates/adr.md) to the [decision log](logs/decision-log.md). If it's a new risk, add it to the [risk register](logs/risk-register.md).
5. **End of day:**
   - Write the day's [journal entry](logs/journal/README.md).
   - Commit and push the records repo.
   - Update the Result cells in the [test catalog](docs/03-test-plan/test-strategy.md#catalog-index), then commit this repo.

## Every week

- **Friday:** review `TASKS.md` (the routine is at the top of the file). Then write the [weekly status](templates/weekly-status.md) and update the counts on the [status board](README.md#status-board).
- **Phase 2:** add the Monday [cost review](docs/05-cost/cost-model.md#weekly-cost-review) and the other [recurring rituals](docs/07-phase2-pilot/pilot-runbook.md#recurring-rituals).

## Where things go

| What | Where |
|---|---|
| Tasks and to-dos | `TASKS.md` in the records repo |
| Results, screenshots, logs, private notes | The records repo, through the tracker |
| The verdict for each test | The Result cell in this repo's [test catalog](docs/03-test-plan/test-strategy.md#catalog-index) |
| Problems | The [issue log](logs/issue-log.md), plus a [finding](templates/finding.md) |
| Decisions | The [decision log](logs/decision-log.md) |
| Time spent and daily notes | The [journal](logs/journal/README.md) |
| Evidence for the reports | This repo's `evidence/<TEST-ID>/`, **redacted only** ([redaction rules](evidence/README.md#redaction-rules)) |

## Week 1 is the critical path

Run [ENV-001](docs/03-test-plan/catalog/env.md#env-001) (nested virtualization on the VDI) and [ENV-006](docs/03-test-plan/catalog/env.md#env-006) (Claude's sandbox inside the container) first. If either one fails, the architecture changes: stop, write an ADR for the fallback, then carry on.

## Two traps

> [!WARNING]
> - **Don't use the `!` prefix for sandbox or permission tests.** It runs your own shell command outside Claude's controls, so the test proves nothing ([how to run a test](docs/03-test-plan/test-strategy.md#how-to-run-a-test)).
> - **Mark results 🔁 Retest after any change** to the policy, the image, or the Claude Code version ([retesting](docs/03-test-plan/test-strategy.md#retesting)). Results count only for the version they ran on.

## End of Phase 1

1. Click **Build report** in the tracker ([building the report](tools/tracker/README.md#building-the-report)).
2. Fill in the [Phase 1 report](reports/phase1-security-configuration-report.md).
3. Hold the [G1 go/no-go review](docs/00-charter/success-criteria.md#gate-g1-phase-1-go--no-go).
4. Write the [executive summary](reports/executive-summary.md).

Then work through the [pilot runbook's entry criteria](docs/07-phase2-pilot/pilot-runbook.md#entry-criteria) before onboarding anyone.

## Related

- [Test tracker](tools/tracker/README.md) · [Evidence rules](evidence/README.md) · [Templates and style guide](templates/README.md) · [Pilot runbook](docs/07-phase2-pilot/pilot-runbook.md)
