---
title: Templates and Style Guide
status: Final
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 1.1
---

# Templates and Style Guide

[🏠 Home](../README.md) › Templates

Every document in this repository uses the same conventions. That keeps the evidence trail consistent and lets the final reports pull straight from the source documents.

## Templates

| Template | Use it for | Copy to |
|---|---|---|
| [test-case.md](test-case.md) | Defining a new test that isn't in the catalog | `docs/03-test-plan/catalog/<domain>.md` |
| [test-result.md](test-result.md) | Recording one execution of a test (attempt, evidence, verdict). The tracker (`tools/tracker/tracker.html`, ADR-019) records the same fields. | `evidence/<TEST-ID>/RESULT.md` in the records location |
| [finding.md](finding.md) | A security or functional problem found during testing | `logs/issue-log.md` (summary row) + `evidence/<TEST-ID>/` |
| [adr.md](adr.md) | An architecture or policy decision | `logs/decision-log.md` |
| [journal-entry.md](journal-entry.md) | Daily working notes | `logs/journal/YYYY-MM-DD.md` |
| [weekly-status.md](weekly-status.md) | Weekly status update to stakeholders | `logs/journal/week-NN-status.md` |

> [!NOTE]
> Relative links inside the templates are written for the **destination** folder in the "Copy to" column, so they resolve once the file is copied there.

## Front matter

Every Markdown document starts with YAML front matter. GitHub renders it as a table at the top of the page.

```yaml
---
title: Reference Architecture
status: Draft            # Draft | In review | Final
owner: <evaluation-lead>
last_updated: 2026-10-15 # ISO date
version: 0.1             # bump minor on edits, major on approval
phase: 1                 # optional: 1, 2, or "1-2"
---
```

## Page layout

1. Front matter.
2. `# Title` (H1, matches `title`).
3. Breadcrumb line: `[🏠 Home](../../README.md) › Section › Page`.
4. One-paragraph summary of what the page is for.
5. A **Contents** list for any page longer than about three screens.
6. Body. Use H2 for major sections and H3 for subsections. Avoid H4 and deeper.
7. **Related** links at the bottom.

## Status and result legend

Use these symbols everywhere: catalog tables, inventory tables, the tracker, reports ([ADR-019](../logs/decision-log.md#adr-019)).

| Symbol | Meaning (test result) | | Symbol | Meaning (policy decision) |
|---|---|---|---|---|
| ⏳ | Not run | | 🟢 | **Allow**: available to developers as-is |
| 🟩 | **Pass**: behaves as expected | | 🟡 | **Restrict**: allowed with configured limits |
| 🟨 | **Issue**: the objective is met, but with an issue, a workaround, or a documentation mismatch. Raise a finding. | | 🔴 | **Block**: disabled by managed policy |
| 🟥 | **Blocker**: the objective isn't met and needs remediation. Always a finding with a severity. A P0 blocker blocks go/no-go. | | ⚪ | **Default**: left at the default, no policy |
| ⏭ | N/A (with a reason) | | ⛔ | **Unavailable**: not available on Foundry or in this environment |
| 🔁 | Retest needed | | | |

> [!NOTE]
> **Squares are results, circles are policy.** Test results use squares (🟩 🟨 🟥) so they can't be confused with the policy circles (🟢 Allow · 🟡 Restrict · 🔴 Block) that sit next to them in the inventory tables, or with the circles used for risk scores. A 🔴 Block in a Policy column is a decision, not a failure. Before 2026-10-19 the result legend was ✅ Pass · ⚠️ Pass with finding · ❌ Fail; read older records with that mapping.

**Priorities:** **P0** must pass before Phase 2 (a go/no-go blocker) · **P1** should pass, or have an accepted risk · **P2** nice to have / informational.

**Finding severity:** **Critical** · **High** · **Medium** · **Low** · **Info**. Definitions are in [test-strategy.md](../docs/03-test-plan/test-strategy.md#severity-definitions).

## ID schemes

| Kind | Format | Example | Defined in |
|---|---|---|---|
| Test case | `<DOMAIN>-NNN` | `SBX-004` | `docs/03-test-plan/catalog/` |
| Inventory item | `INV-<TYPE>-NNN` | `INV-SET-112` | `docs/04-feature-inventory/` |
| Security control | `CTL-NN` | `CTL-07` | `docs/02-security-baseline/defense-in-depth.md` |
| Risk | `R-NN` | `R-03` | `logs/risk-register.md` |
| Decision | `ADR-NNN` | `ADR-005` | `logs/decision-log.md` |
| Finding / issue | `F-NNN` | `F-012` | `logs/issue-log.md` |

Domains: `ENV` environment · `POL` managed policy · `PERM` permissions · `SBX` sandbox · `NET` network · `IDN` identity · `DATA` data handling · `EXT` extensions · `TEL` telemetry · `COST` cost · `FEAT` features · `SURF` surfaces · `OPS` operations.

Never reuse or renumber an ID. If a test is retired, mark it ~~struck through~~ with a note.

## Writing conventions

- **Placeholders, not real identifiers.** Write `<foundry-resource>`, `<tenant-id>`, `<subscription-id>`, `<org>`, `<repo>`, `<dev-alias>`. This repo will live on GitHub; real resource names, tenant IDs, tokens, and hostnames belong in the secure evidence store. See [evidence/README.md](../evidence/README.md).
- **Mark unverified claims.** Write `[verify]` after any statement not yet confirmed on our build or environment. Each `[verify]` must link to the test that will confirm it.
- **Cite the source.** Link Claude Code behavior claims to the official docs page (`https://code.claude.com/docs/en/...`).
- **Record versions.** Results are only valid for the Claude Code version they were run on. Record `claude --version` with every result.
- **Callouts** use GitHub alerts:

  ```markdown
  > [!NOTE]      useful context
  > [!TIP]       recommended practice
  > [!IMPORTANT] key requirement or decision
  > [!WARNING]   risk or known limitation
  > [!CAUTION]   action that can cause harm or invalidate evidence
  ```
- **Diagrams** use Mermaid types that GitHub renders: `flowchart`, `sequenceDiagram`, `gantt`, `pie`, `xychart-beta`, `quadrantChart`, `timeline`.
- **Tables** over prose for anything that will be compared, counted, or tracked.
- **Dates** use ISO format (`2026-10-15`). Times are in UTC unless noted.
