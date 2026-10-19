---
title: Success criteria
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: "1-2"
---

# Success criteria

[🏠 Home](../../README.md) › Charter › Success criteria

These are the measurable thresholds the evaluation is judged against. Stakeholders **agree them before Phase 1 starts**. Fixing them early stops results from being reinterpreted afterwards. Numbers in `«guillemets»` are proposals to confirm at kickoff.

> [!IMPORTANT]
> Pre-registering criteria is what makes the final report credible. If a threshold changes after data comes in, log the change as an ADR with the reason.

## Contents
- [Gate G1: Phase 1 go / no-go](#gate-g1-phase-1-go--no-go)
- [Security criteria](#security-criteria)
- [Coverage criteria](#coverage-criteria)
- [Cost criteria](#cost-criteria)
- [Productivity criteria](#productivity-criteria)
- [Quality criteria](#quality-criteria)
- [Developer experience criteria](#developer-experience-criteria)
- [Adoption decision matrix](#adoption-decision-matrix)

## Gate G1: Phase 1 go / no-go

**Go** requires all of the following:

| # | Criterion | Evidence |
|---|---|---|
| G1.1 | Every **P0** test is 🟩, or 🟨 with a documented, accepted risk | [Test catalog](../03-test-plan/test-strategy.md) |
| G1.2 | **Zero open Critical or High** findings | [Issue log](../../logs/issue-log.md) |
| G1.3 | Developers cannot disable any security control (POL, SBX, PERM, and EXT P0 tests pass) | [POL](../03-test-plan/catalog/policy.md), [SBX](../03-test-plan/catalog/sandbox.md) |
| G1.4 | Egress is limited to the approved allowlist ([NET-001](../03-test-plan/catalog/network.md#net-001), [NET-002](../03-test-plan/catalog/network.md#net-002), [NET-003](../03-test-plan/catalog/network.md#net-003)) | Egress logs |
| G1.5 | Telemetry arrives with per-user and per-team attribution ([TEL-001](../03-test-plan/catalog/telemetry.md#tel-001)–[TEL-004](../03-test-plan/catalog/telemetry.md#tel-004)) | Collector screenshots |
| G1.6 | OTel cost reconciles with Azure Cost Management within «±10%» ([COST-001](../03-test-plan/catalog/cost.md#cost-001)) | Reconciliation sheet |
| G1.7 | Data hosting option and retention terms approved by Security/Legal ([DATA-001](../03-test-plan/catalog/data.md#data-001), [DATA-002](../03-test-plan/catalog/data.md#data-002)) | Signed approval |
| G1.8 | Kill switch and offboarding proven ([OPS-003](../03-test-plan/catalog/operations.md#ops-003), [OPS-004](../03-test-plan/catalog/operations.md#ops-004)) | Timed test record |
| G1.9 | Developer quick-start validated: a fresh developer gets to a first session in under «30 min» ([OPS-007](../03-test-plan/catalog/operations.md#ops-007)) | Timed walkthrough |
| G1.10 | Web tools are off: WebSearch and WebFetch are unavailable in every session type ([NET-007](../03-test-plan/catalog/network.md#net-007), [PERM-014](../03-test-plan/catalog/permissions.md#perm-014)) | Session captures |
| G1.11 | No API key works against the Foundry resource ([IDN-002](../03-test-plan/catalog/identity.md#idn-002)) | `401` capture + resource setting |
| G1.12 | The portable P0 network tests pass on a host that has internet access, so the container's own controls are what's tested ([NET-014](../03-test-plan/catalog/network.md#net-014)) | Egress captures from the test host |
| G1.13 | If the gateway is accepted ([ADR-013](../../logs/decision-log.md#adr-013)): a per-user cap blocks at the limit ([COST-013](../03-test-plan/catalog/cost.md#cost-013)), and the runaway check stops a user within the target time ([COST-015](../03-test-plan/catalog/cost.md#cost-015)) | Timed test record |

## Security criteria

| Criterion | Target | Must / Should |
|---|---|---|
| P0 security tests passing | 100% (🟩, or accepted 🟨) | Must |
| P1 security tests passing | ≥ «90%», with every failure risk-accepted | Should |
| Open Critical/High findings at G1 and G3 | 0 | Must |
| Security incidents during the pilot (agent-caused data loss, credential exposure, policy bypass) | 0 | Must |
| Mean time to revoke all access (kill switch) | ≤ «15 min» | Must |
| Egress to non-allowlisted destinations during the pilot | 0 successful connections | Must |

## Coverage criteria

| Criterion | Target |
|---|---|
| Feature-inventory rows with a Policy decision | 100% |
| Feature-inventory rows with a Result (not ⏳) by G1 | ≥ «95%». The rest are listed with a reason. |
| `[verify]` tags resolved by G1 | 100% (each confirmed, corrected, or turned into a finding) |
| Pilot repos classified by capability tier (full, compile-check, edit-only) before onboarding ([ENV-019](../03-test-plan/catalog/env.md#env-019)) | 100% |

## Cost criteria

| Criterion | Target | Notes |
|---|---|---|
| Mean cost per active developer-day | ≤ «$X» | Anthropic's published enterprise figure is about **$13/active day** at Anthropic list prices. Foundry pricing and our usage will differ. Set «$X» from Phase 1 data ([COST-012](../03-test-plan/catalog/cost.md#cost-012)). |
| Mean cost per developer per month | ≤ «$Y» | Anthropic's published range is **$150–250/month**. |
| 90th-percentile cost per active day | ≤ «$Z» | Anthropic reports 90% of users below $30/active day. |
| Cost forecast accuracy (week 4 forecast vs. week 8 actual) | within «±20%» | Validates the [forecast model](../05-cost/cost-model.md#forecast-model) |
| Budget overrun events | 0 unplanned | Azure budget alerts ([COST-006](../03-test-plan/catalog/cost.md#cost-006)) |
| Per-user cap enforcement (gateway stage) | Requests blocked at the cap. Warnings shown at 75% and 95%. | [COST-013](../03-test-plan/catalog/cost.md#cost-013) |
| Spend notifications | An email to the developer and the evaluation lead at «50%», «80%», and «100%» of the weekly and monthly caps, once per threshold per period, within «30 min» of crossing it | [COST-014](../03-test-plan/catalog/cost.md#cost-014) |
| Runaway stop time | Zero cap in force ≤ «1 min» after detection, and ≤ «20 min» from the start of a runaway (15-minute detection cycle plus the next request) | [COST-015](../03-test-plan/catalog/cost.md#cost-015) |
| Client-side agent limits | Concurrent subagents, workflow agents, scheduled tasks, and agent teams held to policy | [COST-016](../03-test-plan/catalog/cost.md#cost-016) |
| ROI | Value of time saved ≥ «3×» tool cost | Method in the [cost model](../05-cost/cost-model.md#roi-calculation) |

## Productivity criteria

Measured as described in the [measurement framework](../06-productivity-quality/measurement-framework.md). Use pilot developers' own baselines, plus the cohort comparison window.

| Metric | Target improvement | Must / Should |
|---|---|---|
| PR cycle time (open → merge), median | ≥ «20%» reduction | Should |
| Merged PRs per developer per week | ≥ «15%» increase | Should |
| Benchmark task completion time | ≥ «30%» reduction | Should |
| Self-reported time saved | ≥ «3 h/dev/week» median | Should |

> [!NOTE]
> With 15–20 developers, we report **effect sizes with ranges**, not just pass/fail. A "should" criterion that's missed is not automatically a failure. It's weighed in the [decision matrix](#adoption-decision-matrix).

## Quality criteria

Quality must **not regress**. These are guardrails, not goals.

| Metric | Guardrail |
|---|---|
| Change failure / revert rate | No increase beyond «+2 percentage points» vs. baseline |
| Follow-up fix PRs within 14 days of a merged PR | No significant increase |
| First-run CI pass rate | No decrease beyond «−5 pp» |
| Review rework rounds per PR | No increase |
| New static-analysis / CodeQL alerts per merged PR | No increase |
| Test coverage on changed code | No decrease |

## Developer experience criteria

| Metric | Target |
|---|---|
| Satisfaction ("I'd want to keep using it"), post-survey | ≥ «4.0 / 5» mean |
| Net "would recommend" | ≥ «+30» |
| Weekly active use among pilot devs (weeks 3–8) | ≥ «70%» |
| Friction from security controls ("controls got in my way") | ≤ «2.5 / 5» mean. If it's higher, review the permission policy. |

## Adoption decision matrix

| Security (Must) | Cost | Productivity | Quality guardrails | Recommendation |
|---|---|---|---|---|
| ✅ Met | Within budget | Most targets met | Held | **Adopt**, with a staged rollout |
| ✅ Met | Within budget | Mixed | Held | **Adopt for targeted teams/use cases**. Extend measurement. |
| ✅ Met | Over budget | Met | Held | **Adopt with cost controls** (model mix, quotas). Re-forecast. |
| ✅ Met | Any | Any | **Breached** | **Do not adopt yet.** Investigate the quality regression. |
| ❌ Not met | Any | Any | Any | **Do not adopt.** Remediate and repeat Phase 1. |

## Sign-off

| Role | Name | Agreed | Date |
|---|---|---|---|
| Executive sponsor | | | |
| Security | | | |
| Engineering leadership | | | |
| Finance | | | |
