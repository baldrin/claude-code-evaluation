---
title: "Catalog: COST, cost measurement and control"
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: "1-2"
---

# COST: Cost measurement and control

[🏠 Home](../../../README.md) › [Test strategy](../test-strategy.md) › COST

These tests prove cost can be measured accurately per developer, team, and model, reconciled with the Azure invoice, and capped. Reference: [cost-model.md](../../05-cost/cost-model.md), [costs docs](https://code.claude.com/docs/en/costs).

## Summary

| ID | Test | Pri | Controls | Result |
|---|---|---|---|---|
| [COST-001](#cost-001) | OTel cost reconciles with Azure Cost Management | P0 | CTL-20, CTL-22 | ⏳ |
| [COST-002](#cost-002) | `modelPricing` matches contracted Foundry rates | P0 | CTL-22 | ⏳ |
| [COST-003](#cost-003) | Same task across models and effort levels | P1 | — | ⏳ |
| [COST-004](#cost-004) | Prompt cache hit ratio and 1-hour TTL effect | P1 | — | ⏳ |
| [COST-005](#cost-005) | `--max-budget-usd` stops a headless run | P1 | CTL-22 | ⏳ |
| [COST-006](#cost-006) | Azure budget alerts fire | P1 | CTL-22 | ⏳ |
| [COST-007](#cost-007) | TPM quota and 429 behavior | P1 | CTL-22 | ⏳ |
| [COST-008](#cost-008) | Subagent model choice impact | P1 | — | ⏳ |
| [COST-009](#cost-009) | Auto-compact window impact | P2 | — | ⏳ |
| [COST-010](#cost-010) | Haiku deployment for background tasks | P1 | CTL-18 | ⏳ |
| [COST-011](#cost-011) | 1M-context deployment naming / `modelOverrides` | P1 | CTL-18 | ⏳ |
| [COST-012](#cost-012) | Phase 1 evaluator cost-per-day baseline | P1 | — | ⏳ |
| [COST-013](#cost-013) | Per-user spend cap blocks at the limit | P0 | CTL-24, CTL-22 | ⏳ |
| [COST-014](#cost-014) | Spend-notification emails at thresholds | P1 | CTL-22 | ⏳ |
| [COST-015](#cost-015) | Runaway detection stops a user with a zero cap | P0 | CTL-28, CTL-24 | ⏳ |
| [COST-016](#cost-016) | Client-side agent limits enforced | P1 | CTL-28 | ⏳ |

---

<a id="cost-001"></a>
### COST-001 · OTel cost reconciles with Azure Cost Management

**Priority** P0 · **Controls** CTL-20, CTL-22 · **Risks** R-13

**Steps.**
1. Over at least 5 working days, record daily totals of `claude_code.cost.usage` (sum, all users).
2. Export Azure Cost Management daily cost for the Foundry resource, filtered to the Claude deployments (use a tag or resource filter, and exclude other workloads).
3. Compare day by day, allowing for Azure's billing latency (24–48 h).

**Expected.** Within «±10%» after `modelPricing` is configured ([COST-002](#cost-002)). Explain systematic differences (list price vs. contract, cache pricing, rounding).

**Evidence.** A reconciliation sheet (CSV) with per-day values and variance.

**Result.** ⏳ · `evidence/COST-001/`

<a id="cost-002"></a>
### COST-002 · `modelPricing` matches contracted Foundry rates

**Priority** P0 · **Controls** CTL-22 · **Docs** [settings reference](https://code.claude.com/docs/en/settings-reference)

**Steps.** Get per-model rates (input, output, cache write, cache read) from Finance or the Azure price sheet. Configure managed `modelPricing` [verify schema]. Run a fixed prompt and compare `/usage`, the OTel `api_request.cost_usd`, and manual calculation from token counts × rates.

**Expected.** All three agree within rounding. Without `modelPricing`, the estimate uses Anthropic list price. Record the difference, since it's relevant to the report.

**Result.** ⏳ · `evidence/COST-002/`

<a id="cost-003"></a>
### COST-003 · Same task across models and effort levels

**Priority** P1 · **Controls** —

**Steps.** Take 3 tasks from [benchmark-tasks.md](../../06-productivity-quality/benchmark-tasks.md). Run each with (Opus, Sonnet, Haiku) × (effort low, medium, high), starting from a fresh `/clear` and the same repo commit. Record cost, wall time, turns, and a quality score (rubric).

**Expected.** A cost/quality matrix that informs the default-model and effort guidance for Phase 2. Example finding: "Sonnet at medium effort reaches 90% of Opus quality at 40% of the cost."

**Result.** ⏳ · `evidence/COST-003/`

<a id="cost-004"></a>
### COST-004 · Prompt cache hit ratio and 1-hour TTL effect

**Priority** P1 · **Docs** [prompt caching](https://code.claude.com/docs/en/prompt-caching)

**Steps.** From OTel `token.usage`, compute cacheRead / (input + cacheRead + cacheCreation) over a work day. Repeat for a day with `ENABLE_PROMPT_CACHING_1H=1` (1-hour writes cost more, but survive breaks).

**Expected.** Recorded hit ratios and net cost difference. Recommendation for or against the 1-hour TTL.

**Result.** ⏳ · `evidence/COST-004/`

<a id="cost-005"></a>
### COST-005 · `--max-budget-usd` stops a headless run

**Priority** P1 · **Controls** CTL-22

**Steps.** `claude -p "<long refactor task>" --max-budget-usd 0.50 --output-format json`

**Expected.** The run stops at or near the budget and reports why. Use this in any CI or scheduled usage.

**Result.** ⏳ · `evidence/COST-005/`

<a id="cost-006"></a>
### COST-006 · Azure budget alerts fire at thresholds

**Priority** P1 · **Controls** CTL-22

**Steps.** Create an Azure budget on the Foundry resource's resource group with alerts at 50%, 80%, and 100% of a deliberately low test budget. Generate spend past 50%.

**Expected.** The alert reaches the evaluation lead and Finance. Record the alert latency.

**Result.** ⏳ · `evidence/COST-006/`

<a id="cost-007"></a>
### COST-007 · TPM quota and 429 rate-limit behavior

**Priority** P1 · **Controls** CTL-22 · **Risks** R-15

**Steps.** On a test deployment with a low TPM limit, run parallel heavy sessions (or subagent fan-out). Observe Claude Code's retry behavior (`api_error` with status 429, `api_retries_exhausted`) and the user experience.

**Expected.** Graceful retries and a clear message. Size production TPM using the guidance in the costs docs (about 50k–75k TPM per user for 20–50 users) and the Phase 1 peak usage.

**Result.** ⏳ · `evidence/COST-007/`

<a id="cost-008"></a>
### COST-008 · Subagent model choice impact

**Priority** P1

**Steps.** Run a task that uses Explore subagents with `CLAUDE_CODE_SUBAGENT_MODEL` unset (inherit) and set to the Haiku deployment. Compare cost (`query_source=subagent`) and outcome.

**Expected.** Recorded saving. Recommendation for the managed env.

**Result.** ⏳ · `evidence/COST-008/`

<a id="cost-009"></a>
### COST-009 · Auto-compact window impact

**Priority** P2 · **Docs** [costs](https://code.claude.com/docs/en/costs)

**Steps.** Run a long session with the default auto-compact window (about 967K on 1M models), then with a lower `autoCompactWindow` (for example, 200K). Compare cost and quality.

**Expected.** Recommendation on whether to set the window in policy.

**Result.** ⏳ · `evidence/COST-009/`

<a id="cost-010"></a>
### COST-010 · Haiku deployment for background tasks

**Priority** P1 · **Controls** CTL-18 · **Docs** [Foundry](https://code.claude.com/docs/en/microsoft-foundry)

**Steps.** Check OTel `query_source=auxiliary` cost with `ANTHROPIC_DEFAULT_HAIKU_MODEL` set vs. unset (unset falls back to the primary model on Foundry).

**Expected.** Background-task cost drops with Haiku pinned. Quantify it.

**Result.** ⏳ · `evidence/COST-010/`

<a id="cost-011"></a>
### COST-011 · 1M-context deployment naming and `modelOverrides`

**Priority** P1 · **Controls** CTL-18

**Steps.** Check `/context` for the detected context window. If deployment names aren't model IDs, configure `modelOverrides` (for example, `"claude-opus-4-8": "team-opus-prod"`) and re-check. Confirm tool availability (Task tools) with custom names [verify].

**Expected.** The correct window is detected. All tools are available. Document the deployment naming convention for the Azure admin.

**Result.** ⏳ · `evidence/COST-011/`

<a id="cost-012"></a>
### COST-012 · Phase 1 evaluator cost-per-day baseline

**Priority** P1

**Steps.** Log daily cost (OTel + `/usage`) in the journal throughout Phase 1. Tag test-heavy days separately from "normal development" days, when the evaluation lead does real work.

**Expected.** A first estimate of cost per active day, used to set the «$X» threshold in the [success criteria](../../00-charter/success-criteria.md#cost-criteria) and the Phase 2 budget.

**Result.** ⏳ · `evidence/COST-012/`

<a id="cost-013"></a>
### COST-013 · Per-user spend cap blocks at the limit; 75%/95% warnings shown

**Priority** P0 · **Controls** CTL-24, CTL-22 · **Risks** R-15

> [!NOTE]
> Applies once the Claude apps gateway is in place ([ADR-013](../../../logs/decision-log.md#adr-013)). Until then, run it against a test gateway or mark it ⏭ with the reason.

**Steps.** Through the admin API, set a tiny daily cap for a test user, for example `"amount": "100"` (one dollar). Work until the 75% and 95% warnings appear, then until a request is blocked. Check the `429` message (period, reset time, `blocked_message`) and the `/usage` spend bar. Confirm another user isn't affected. Raise the cap.

**Expected.** Warnings at 75% and 95%. Blocked at the limit with a clear message. Unblocked when the cap is raised. Other users unaffected.

**Result.** ⏳ · `evidence/COST-013/`

<a id="cost-014"></a>
### COST-014 · Spend-notification job emails user and lead at 50/80/100% of caps

**Priority** P1 · **Controls** CTL-22 · **Risks** R-15

> [!NOTE]
> Applies once the Claude apps gateway is in place ([ADR-013](../../../logs/decision-log.md#adr-013)). Until then, run it against a test gateway or mark it ⏭ with the reason.

**Steps.** Deploy the notification job against test caps ([cost model](../../05-cost/cost-model.md)). Drive a test user past 50%, 80%, and 100% of a weekly and a monthly cap. Check the emails to the user and to the evaluation lead, the duplicate protection, and the rollover at the UTC period boundary.

**Expected.** One email per threshold per period, to both recipients, within 30 minutes of crossing.

**Result.** ⏳ · `evidence/COST-014/`

<a id="cost-015"></a>
### COST-015 · Runaway detection sets a zero cap and stops a user's agents within the target time

**Priority** P0 · **Controls** CTL-28, CTL-24 · **Risks** R-15

> [!NOTE]
> Applies once the Claude apps gateway is in place ([ADR-013](../../../logs/decision-log.md#adr-013)). Until then, run it against a test gateway or mark it ⏭ with the reason.

**Steps.** Simulate an overnight run: start several sessions and subagents on a long task outside working hours (or shift the rule's time window). Confirm the detection rule fires (burn rate, concurrent sessions, or no keyboard activity), the automation sets a `"0"` cap for that user, the next requests fail with `429`, and both emails go out. Restore by deleting the cap. Time trigger to stop.

**Expected.** The user is stopped within the target in the [success criteria](../../00-charter/success-criteria.md). The change appears in the gateway's `/audit` trail.

**Result.** ⏳ · `evidence/COST-015/`

<a id="cost-016"></a>
### COST-016 · Client-side agent limits are enforced (subagents, workflow agents, cron, agent teams)

**Priority** P1 · **Controls** CTL-28 · **Risks** R-15

**Steps.** Ask Claude to fan out more than five parallel subagents. Run a workflow that wants more than three agents. Try `/loop` and scheduling. Try turning on agent teams through user settings.

**Expected.** The managed caps hold. Scheduling and `/loop` are unavailable. Agent teams stay off, because managed `env` wins.

**Result.** ⏳ · `evidence/COST-016/`
