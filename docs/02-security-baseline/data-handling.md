---
title: Data handling
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: "1-2"
---

# Data handling

[🏠 Home](../../README.md) › Security baseline › Data handling

This page covers what data leaves the developer's container, where it goes, how long it's kept, and who can see it. It's the basis for Security/Legal approval at gate G1 ([G1.7](../00-charter/success-criteria.md#gate-g1-phase-1-go--no-go)).

## Contents
- [Data flows](#data-flows)
- [Model provider: Microsoft Foundry](#model-provider-microsoft-foundry)
- [Gateway data (ADR-013)](#gateway-data-adr-013)
- [Local data in the container](#local-data-in-the-container)
- [Evaluation records](#evaluation-records)
- [Telemetry content](#telemetry-content)
- [Vendor-bound traffic we disable](#vendor-bound-traffic-we-disable)
- [Data classification rules for the pilot](#data-classification-rules-for-the-pilot)
- [Approval checklist](#approval-checklist)

## Data flows

| # | Data | From → To | Contains code / prompts? | Retention | Control |
|---|---|---|---|---|---|
| D1 | Prompts, file contents, tool output (model context) | Container → **Foundry deployment** (directly, or through the gateway once [ADR-013](../../logs/decision-log.md#adr-013) is accepted) | ✅ Yes | Per the Foundry / Anthropic terms for the chosen hosting option. **To confirm** ([DATA-002](../03-test-plan/catalog/data.md#data-002)). | Hosting option, contract |
| D2 | Session transcripts | Container local: `~/.claude/projects/` (volume) | ✅ Yes | `cleanupPeriodDays: 30` | [DATA-003](../03-test-plan/catalog/data.md#data-003) |
| D3 | Auto memory | Container local (`~/.claude/…` memory dir) | ⚠️ Summaries | Until deleted | [DATA-010](../03-test-plan/catalog/data.md#data-010) |
| D4 | OTel metrics and events | Container → company collector | ❌ No (content flags off) | Company log policy | [DATA-004](../03-test-plan/catalog/data.md#data-004) |
| D5 | Audit hook log | Container → SIEM | ❌ No (metadata only) | SIEM policy | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) |
| D6 | Commits and PRs | Container → GitHub `<org>/<repo>` | ✅ Code | Repo lifetime | Branch rules, secret scanning |
| D7 | Feedback / bug reports | Container → Anthropic | ✅ Transcripts (kept 5 years) | — | **Disabled** ([DATA-007](../03-test-plan/catalog/data.md#data-007)) |
| D8 | Error reports | Container → Anthropic (Datadog) | ⚠️ Stack traces | — | **Disabled / off by default on Foundry** ([DATA-008](../03-test-plan/catalog/data.md#data-008)) |
| D9 | Debug logs (`--debug`) | Container local: `~/.claude/debug/` | ⚠️ Possibly | Manual cleanup | Evidence rules |
| D10 | Gateway records: spend counters, developer identity (email, name, Entra groups), admin audit, audit events | Gateway → its PostgreSQL database and our log platform | ❌ No. The gateway doesn't log or store prompt or completion content. | Spend 13 months, admin audit 365 days, identity 90 days since last activity (defaults) | [Gateway data](#gateway-data-adr-013), [TEL-014](../03-test-plan/catalog/telemetry.md#tel-014) |
| D11 | Evaluation records: tracker entries, screenshots, logs, private notes | Evaluation lead → the records location | ⚠️ May contain code, config, and findings | Evaluation lifetime, then per the evidence policy | [Evaluation records](#evaluation-records), [DATA-013](../03-test-plan/catalog/data.md#data-013) |

## Model provider: Microsoft Foundry

> [!IMPORTANT]
> **Hosting option decision.** When a Claude deployment is created in Foundry, the hosting option determines **whether inference runs on Azure or on Anthropic infrastructure** ([Foundry docs](https://code.claude.com/docs/en/microsoft-foundry), [Anthropic Foundry hosting options](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry#hosting-options)). This decides where prompts and code are processed, which terms apply, and what data-residency claims we can make. Decide it explicitly in [ADR-009](../../logs/decision-log.md#adr-009) and verify the deployed setting in [DATA-001](../03-test-plan/catalog/data.md#data-001).

**Recommendation: Hosted on Azure, US Data Zone** ([ADR-009](../../logs/decision-log.md#adr-009)).

| Option | What it means | Our stance |
|---|---|---|
| **Hosted on Azure** | An Anthropic-operated service running on Azure infrastructure. "Prompts and completions remain within Azure. Only usage metadata and content flagged by Anthropic's safety systems egress to Anthropic." | ✅ Recommended |
| **US Data Zone** (Hosted on Azure only) | Keeps inference within the United States, equivalent to `inference_geo: "us"` on the Claude API | ✅ Recommended, where the model supports it. Sonnet 5.5 is Global-only. |
| **Hosted on Anthropic** | Anthropic-operated service on Anthropic infrastructure. Needed for models and features not yet on Azure. | ❌ Not without Security/Legal approval |
| Fable models | Available on Foundry **only** Hosted on Anthropic | ⏭ Out of scope unless Security/Legal approve |

Source: [Claude in Microsoft Foundry: hosting options](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry#hosting-options). Azure-hosted deployments don't support some newer server-side features; Claude Code detects that and adapts. Anthropic acts as an independent processor for Microsoft, and Anthropic's data use terms apply ([R-07](../../logs/risk-register.md#r-07)).

Questions to answer with Microsoft and Anthropic account teams before G1 ([DATA-002](../03-test-plan/catalog/data.md#data-002)):

| Question | Answer | Source / date |
|---|---|---|
| Which hosting option is each deployment using? | | |
| In which region(s) is inference processed? | | |
| How long are prompts and outputs retained, and for what purpose (abuse monitoring)? | | |
| Is any data used for model training? (Commercial terms: no, by default.) | | |
| Is zero-data-retention, or an equivalent, available for our deployments? | | |
| Who at the provider can access logged data, and under what conditions? | | |
| Do our existing Microsoft data protection terms (DPA) cover this service? | | |

## Gateway data (ADR-013)

If the Claude apps gateway is accepted, it sits on the inference path but **doesn't log or store prompt or completion content** ([gateway: what the organization can see](https://code.claude.com/docs/en/claude-apps-gateway#what-the-organization-can-see)). It sends nothing to Anthropic unless the Anthropic API is a configured upstream, which it isn't here. What it keeps ([spend limits: data lifecycle](https://code.claude.com/docs/en/claude-apps-gateway-spend-limits#data-lifecycle)):

| Table / stream | Contents | Default retention | Note |
|---|---|---|---|
| `spend` | Period-to-date spend per developer, in cents | 13 months (`admin.spend_retention_months`) | Keyed by the pseudonymous OIDC `sub` |
| `spend_limits` | Configured caps | Until deleted | |
| `admin_audit` | Who changed which cap, with before/after | 365 days (`admin.audit_retention_days`) | |
| `principal_emails` | Last-seen email, display name, Entra groups | 90 days since last activity (`admin.identity_retention_days`) | **PII.** Delete a row directly for offboarding or a data subject request. |
| Audit events (stderr) | Sign-ins, `inference`, `spend.blocked`, admin changes | Our log platform's policy | [TEL-014](../03-test-plan/catalog/telemetry.md#tel-014) |
| Telemetry relay | OTLP metrics stamped with identity, token counts, model, latency | Collector policy | Logs and traces are per-destination opt-ins. Keep them off, as today. |

Admin-API queries that filter by email or name ride in GET query strings, so scrub them from any load-balancer access logs if the PII policy requires it.

## Local data in the container

| Item | Location | Policy |
|---|---|---|
| Transcripts | `~/.claude/projects/<project>/*.jsonl` | Plaintext. Persisted on the `~/.claude` volume so `/resume` works. Auto-deleted after `cleanupPeriodDays` (30). The volume is deleted at offboarding. |
| Credentials | Entra token cache (`~/.azure/`) in direct-Foundry mode, or only a short-lived gateway session token in gateway mode. GitHub token. No API keys anywhere ([ADR-006](../../logs/decision-log.md#adr-006)). | Denied to Claude tools. Never in evidence. |
| Checkpoints | Inside the session data | Same retention as transcripts |
| Plans, todos | `~/.claude/plans/`, `~/.claude/todos/` | Same volume |

> [!CAUTION]
> Transcripts contain source code and command output. They're the best forensic record ([OPS-005](../03-test-plan/catalog/operations.md#ops-005)), but they must **never** be committed to this evaluation repo unredacted ([evidence rules](../../evidence/README.md#redaction-rules)).

## Evaluation records

Everything the evaluation lead records (tracker entries, screenshots, logs, findings, and private notes) is kept **outside anything the agent under test can reach** ([ADR-004](../../logs/decision-log.md#adr-004), [ADR-019](../../logs/decision-log.md#adr-019), [R-27](../../logs/risk-register.md#r-27)):

- Not in the single GitHub repo the agent's token can access, and not in any folder mounted into a dev container.
- A separate records repo or folder that only the evaluation lead (and reviewers) can open.
- **Private notes** in the tracker are never exported: the report build leaves them out. They're still company data on disk, so the same access rules apply to them.
- [DATA-013](../03-test-plan/catalog/data.md#data-013) checks that Claude, from inside the container, can't read or change the records.

The tracker itself (`tools/tracker/`) is being added in a later change.

## Telemetry content

| Flag | Default | Our value | Effect if enabled |
|---|---|---|---|
| `OTEL_LOG_USER_PROMPTS` | off | `0` | Prompt text appears in `user_prompt` events |
| `OTEL_LOG_ASSISTANT_RESPONSES` | off | `0` | Response text in events |
| `OTEL_LOG_TOOL_DETAILS` | off | `0` | Bash commands, tool parameters, MCP names |
| `OTEL_LOG_TOOL_CONTENT` | off | `0` | Tool output (needs tracing) |
| `OTEL_LOG_RAW_API_BODIES` | off | `0` | Full API request and response bodies |

> [!WARNING]
> Turning on `OTEL_LOG_TOOL_DETAILS` would make security monitoring much richer: we'd see the actual commands run. But it creates **employee-monitoring and data-protection** obligations ([R-12](../../logs/risk-register.md)). Get HR/Legal/Works Council approval before enabling any content flag, and tell developers if it's on ([AUP](../07-phase2-pilot/acceptable-use-policy.md)).

## Vendor-bound traffic we disable

| Setting | Stops |
|---|---|
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` | Vendor telemetry, auto-update, error reporting, `/feedback`, feature-flag fetches |
| `DISABLE_FEEDBACK_COMMAND=1` | `/feedback` (and its `/bug` alias) uploading transcripts |
| `DISABLE_ERROR_REPORTING=1` | Error reports |
| `ENABLE_CLAUDEAI_MCP_SERVERS=false` | claude.ai connector traffic |
| `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1` [verify] | Session-quality survey prompts |
| `DISABLE_TELEMETRY=1` | Anthropic usage analytics, including startup events sent before a first gateway sign-in |
| `CLAUDE_CODE_DISABLE_WEB_FETCH=1` + `skipWebFetchPreflight: true` | WebFetch, and its hostname check to `api.anthropic.com` (WebFetch off is pending confirmation, [ADR-016](../../logs/decision-log.md#adr-016)) |
| `permissions.deny: ["WebSearch"]` | Server-side web searches run by the provider on Claude's behalf ([NET-007](../03-test-plan/catalog/network.md#net-007)) |

[NET-003](../03-test-plan/catalog/network.md#net-003) confirms with an egress capture that no Anthropic-bound traffic occurs.

## Data classification rules for the pilot

| Data class | Allowed in repos and prompts used with Claude Code? |
|---|---|
| Public / open-source code | ✅ |
| Internal source code (pilot repos) | ✅ |
| Internal documentation | ✅ |
| Credentials, secrets, keys | ❌ Never. Denied by policy, and secret scanning is on. |
| Customer data, PII, production data | ❌ Not in the pilot |
| Regulated data (PCI, PHI, export-controlled) | ❌ Not in the pilot |

The developer-facing version is in the [acceptable use policy](../07-phase2-pilot/acceptable-use-policy.md).

## Approval checklist

| # | Item | Status | Approver | Date |
|---|---|---|---|---|
| 1 | Hosting option chosen and verified on all deployments | ⏳ | Security | |
| 2 | Retention and training terms confirmed in writing | ⏳ | Legal | |
| 3 | Telemetry content flags reviewed (off) | ⏳ | HR / Privacy | |
| 4 | Transcript retention (30 days) approved | ⏳ | Security | |
| 5 | AUP approved and acknowledged by pilot devs | ⏳ | Security / Eng mgmt | |
| 6 | Vendor-bound traffic confirmed disabled (NET-003) | ⏳ | Security | |
| 7 | Gateway data retention approved (if [ADR-013](../../logs/decision-log.md#adr-013) is accepted) | ⏳ | Security / Privacy | |
| 8 | Evaluation records confirmed outside the agent's reach ([DATA-013](../03-test-plan/catalog/data.md#data-013)) | ⏳ | Eval lead | |

## Related
- [Defense in depth](defense-in-depth.md) · [Data tests (DATA)](../03-test-plan/catalog/data.md)
- Official: [Data usage](https://code.claude.com/docs/en/data-usage) · [Security](https://code.claude.com/docs/en/security) · [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry)
