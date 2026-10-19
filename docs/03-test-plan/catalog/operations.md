---
title: "Catalog: OPS, operations"
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: "1-2"
---

# OPS: Operations

[🏠 Home](../../../README.md) › [Test strategy](../test-strategy.md) › OPS

These tests check that the deployment can be run day to day: upgraded, rolled back, switched off, offboarded, investigated, and supported. Reference: [pilot runbook](../../07-phase2-pilot/pilot-runbook.md).

## Summary

| ID | Test | Pri | Controls | Result |
|---|---|---|---|---|
| [OPS-001](#ops-001) | Upgrade via image rebuild and version gates | P1 | CTL-23, CTL-18 | ⏳ |
| [OPS-002](#ops-002) | Rollback to the previous image | P1 | CTL-23 | ⏳ |
| [OPS-003](#ops-003) | Kill switch within target time | P0 | CTL-23 | ⏳ |
| [OPS-004](#ops-004) | Offboarding end to end | P0 | CTL-23 | ⏳ |
| [OPS-005](#ops-005) | Incident reconstruction from logs | P0 | CTL-23, CTL-20, CTL-14 | ⏳ |
| [OPS-006](#ops-006) | Support and triage process | P1 | — | ⏳ |
| [OPS-007](#ops-007) | New-developer onboarding time | P1 | — | ⏳ |
| [OPS-008](#ops-008) | Policy change rollout to the VDI fleet | P1 | CTL-06 | ⏳ |
| [OPS-009](#ops-009) | Evidence and log retention | P2 | — | ⏳ |
| [OPS-010](#ops-010) | Credential rotation | P1 | CTL-16, CTL-17 | ⏳ |
| [OPS-011](#ops-011) | Gateway operations runbook | P1 | CTL-24, CTL-23 | ⏳ |

---

<a id="ops-001"></a>
### OPS-001 · Upgrade via image rebuild and version gates

**Priority** P1 · **Controls** CTL-23, CTL-18 · **Risks** R-19

**Steps.**
1. Read the release notes between 2.1.301 and the target version (`/release-notes`, or the changelog fetched outside the container).
2. Publish the new version to Nexus for the build account ([ADR-014](../../../logs/decision-log.md#adr-014)). Raise `requiredMaximumVersion` in a **test** policy. Rebuild the image, and the gateway image if one is in use, with the new version.
3. Rerun all P0 tests (the [retesting rule](../test-strategy.md#retesting)).
4. Promote: new image digest and new policy hash to pilot VDIs.

**Expected.** The upgrade checklist is complete, with no P0 regressions. Record the elapsed effort. It's an input to the ongoing cost of ownership.

**Result.** ⏳ · `evidence/OPS-001/`

<a id="ops-002"></a>
### OPS-002 · Rollback to the previous image

**Priority** P1 · **Controls** CTL-23

**Steps.** Revert the image digest and policy to the previous release. Confirm that sessions resume (transcript format compatibility).

**Expected.** Rollback in « < 30 min ». Sessions are usable.

**Result.** ⏳ · `evidence/OPS-002/`

<a id="ops-003"></a>
### OPS-003 · Kill switch disables all access within the target time

**Priority** P0 · **Controls** CTL-23, CTL-24

**Steps.** With two test users in active sessions, remove the RBAC role assignment from `grp-claude-code-pilot` (or disable the deployments). Time until both sessions fail. Then restore it and time the recovery. In the gateway stage, also scale the gateway to zero replicas and time the failure. Don't rely on an organization-wide `"0"` cap: per-user and group caps take precedence, so it only reaches developers without one of their own ([spend limits](https://code.claude.com/docs/en/claude-apps-gateway-spend-limits)). The per-user zero cap is the instant switch for one developer ([COST-015](cost.md#cost-015)).

**Expected.** All access stops in « ≤ 15 min ». Record actual propagation time; Entra tokens may remain valid until expiry, so note the worst case. If it's too slow, add a faster switch (disable the deployment, or block the gateway at the internal firewall).

**Result.** ⏳ · `evidence/OPS-003/`

<a id="ops-004"></a>
### OPS-004 · Offboarding checklist works end to end

**Priority** P0 · **Controls** CTL-23

**Steps.** For a test user: group removal → GitHub token revoke → delete the `~/.claude` volume → confirm no OTel activity → record completion in the pilot roster.

**Expected.** All steps complete. Access gone ([IDN-011](identity.md#idn-011)). Local data deleted.

**Result.** ⏳ · `evidence/OPS-004/`

<a id="ops-005"></a>
### OPS-005 · Incident reconstruction from transcripts, OTel, and egress logs

**Priority** P0 · **Controls** CTL-23, CTL-20, CTL-14

**Steps.** After the [DATA-005](data.md#data-005) drill, have someone who **wasn't** present reconstruct a timeline of what the agent attempted, what was allowed or blocked, and by which control. They use only OTel events, the audit hook log, egress logs, Azure logs, and the session transcript (accessed with authorization).

**Expected.** A complete, accurate timeline produced in « < 2 h ». Gaps become findings. Output: an incident-response runbook section.

**Result.** ⏳ · `evidence/OPS-005/`

<a id="ops-006"></a>
### OPS-006 · Support and issue-triage process

**Priority** P1

**Steps.** Define the support path (channel, owner, SLA). Write a troubleshooting page from Phase 1 issues (auth errors, sandbox errors, 429s, proxy/TLS errors), using `/doctor`, `/debug`, and `/status`. Dry-run three simulated tickets.

**Expected.** Support runbook ready before Phase 2.

**Result.** ⏳ · `evidence/OPS-006/`

<a id="ops-007"></a>
### OPS-007 · New-developer onboarding time

**Priority** P1

**Steps.** A colleague who hasn't seen the setup follows [developer-quickstart.md](../../07-phase2-pilot/developer-quickstart.md) unaided. Time it and note every point of confusion.

**Expected.** First successful session in « < 30 min ». The quick-start is revised from the notes.

**Result.** ⏳ · `evidence/OPS-007/`

<a id="ops-008"></a>
### OPS-008 · Policy change rollout to the VDI fleet

**Priority** P1 · **Controls** CTL-06

**Steps.** Change a harmless policy value (for example, `cleanupPeriodDays`) and roll it out to all pilot VDIs through the platform team's mechanism (image update, Intune script, or similar). Confirm through the OTel `managed_settings_resolved` event, or a policy-hash attribute, that every container picked it up.

**Expected.** Fleet-wide in « < 1 business day ». Verified centrally.

**Result.** ⏳ · `evidence/OPS-008/`

<a id="ops-009"></a>
### OPS-009 · Evidence and log retention

**Priority** P2

**Steps.** Agree retention for the evidence store, OTel data, audit logs, and transcripts with Security and Records.

**Expected.** Documented retention periods.

**Result.** ⏳ · `evidence/OPS-009/`

<a id="ops-010"></a>
### OPS-010 · Credential rotation (Foundry key / GitHub token)

**Priority** P1 · **Controls** CTL-16, CTL-17

**Steps.** Rotate the GitHub fine-grained token for a test user mid-pilot. If any Foundry API key is in use, rotate it with the key1/key2 swap.

**Expected.** No downtime beyond a re-auth. Procedure documented.

**Result.** ⏳ · `evidence/OPS-010/`

<a id="ops-011"></a>
### OPS-011 · Gateway operations: replicas, Postgres backup/restore, fail-closed, JWT rotation, upgrade

**Priority** P1 · **Controls** CTL-24, CTL-23 · **Risks** R-24

> [!NOTE]
> Applies once the Claude apps gateway is in place ([ADR-013](../../../logs/decision-log.md#adr-013)). Until then, run it against a test gateway or mark it ⏭ with the reason.

**Steps.** Run two or more replicas behind the internal load balancer and stop one mid-session. Back up and restore PostgreSQL. Stop PostgreSQL with `enforcement.fail_closed_on_error: true` and check for `429 spend limit unavailable`. Rotate the JWT secret in stages. Upgrade the gateway to a new pinned version from Nexus, then roll back.

**Expected.** A written runbook, and each behavior matches the design.

**Result.** ⏳ · `evidence/OPS-011/`
