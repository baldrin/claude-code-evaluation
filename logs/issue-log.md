---
title: Issue log
status: In review
owner: <evaluation-lead>
last_updated: 2026-10-15
version: 0.1
---

# Issue log

[🏠 Home](../README.md) › Logs › Issue log

Findings (`F-NNN`) from testing, and issues raised by pilot developers. Each finding gets a row here. Larger findings also get a detail page from the [finding template](../templates/finding.md), saved under `evidence/<TEST-ID>/F-NNN.md`.

## Open findings summary

| Severity | Open | Mitigated | Accepted | Closed |
|---|---|---|---|---|
| Critical | 0 | 0 | 0 | 0 |
| High | 0 | 0 | 0 | 0 |
| Medium | 0 | 0 | 0 | 0 |
| Low | 0 | 0 | 0 | 0 |
| Info | 0 | 0 | 0 | 0 |

## Findings

| ID | Date | Severity | Category | Title | Test | Control | Status | Detail |
|---|---|---|---|---|---|---|---|---|
| _F-001_ | | | | _(example) Sandbox requires weaker nested mode in Docker_ | ENV-006 | CTL-09 | Open | `evidence/ENV-006/F-001.md` |

## Pilot support tickets (Phase 2)

| # | Date | Dev | Category | Summary | Resolution | Policy change? |
|---|---|---|---|---|---|---|
| | | `<dev-NN>` | Auth / Blocked command / Rate limit / Bug / How-to | | | ADR-NNN / — |

**Categories** are used to report support load and friction in the Phase 2 report.

## Documentation discrepancies

Places where the official docs, `claude --help`, and observed behavior disagree. They're useful for vendor feedback.

| # | Item | Docs say | Observed | Version | Reported to vendor? |
|---|---|---|---|---|---|
| D-1 | `--permission-mode` values | `default` | `--help` lists `manual` (a documented alias) | 2.1.301 | — |
| D-2 | `--brief`, `--file` flags | Not documented | Present in `--help` | 2.1.301 | — |
| D-3 | `claude remote-control` | Documented | Missing from the `--help` command list (the `--remote-control` flag is present) | 2.1.301 | — |
