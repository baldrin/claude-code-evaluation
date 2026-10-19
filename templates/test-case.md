---
title: "Test case template"
status: Final
owner: <evaluation-lead>
last_updated: 2026-10-15
version: 1.0
---

# Test case template

[🏠 Home](../README.md) › [Templates](README.md) › Test case

Copy the block below into the right catalog file in `docs/03-test-plan/catalog/`. Add a row for it to that file's summary table too.

---

### <DOMAIN>-NNN · <Short imperative title>

| Field | Value |
|---|---|
| **Priority** | P0 / P1 / P2 |
| **Phase** | 1 / 2 / 1-2 |
| **Controls verified** | `CTL-NN`, … |
| **Risks addressed** | `R-NN`, … |
| **Docs** | <link to official doc page> |

**Objective.** One sentence: what this test proves.

**Preconditions.**
- Environment state, policy version, and accounts needed.

**Steps.**
1. …
2. …

**Expected result.**
- What a pass looks like, stated so it can be checked.

**Evidence to capture.**
- Screenshot / terminal log / config hash / egress log, with file names per [evidence/README.md](../evidence/README.md).

**Result.** ⏳ · Evidence: `evidence/<DOMAIN>-NNN/` · Version tested: `—` · Date: `—`

**Notes.**
