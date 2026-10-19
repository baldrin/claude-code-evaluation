---
title: Environment variables
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 1
---

# Environment variables

[🏠 Home](../../README.md) › [Feature inventory](README.md) › Environment variables

Every environment variable Claude Code documents, with its Foundry and container fit and a proposed policy for the managed `env` block. Rows that don't come from the env-vars page name their source page in **Notes**. Built from [Environment variables](https://code.claude.com/docs/en/env-vars), [Monitoring](https://code.claude.com/docs/en/monitoring-usage), [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry), [Model configuration](https://code.claude.com/docs/en/model-config), and [Network configuration](https://code.claude.com/docs/en/network-config) for Claude Code **2.1.301** as of 2026-10-15.

> [!NOTE]
> **How to use this page.** For each row, confirm the behavior in the evaluation container, then set **Result** (⏳ → 🟩/🟨/🟥/⏭) and put evidence in `evidence/<ID>/`. Rows with a catalog test in **Covered by** are verified by that test; mark them with the test's result. **Policy** is the *proposed* decision. Changes need an ADR in `logs/decision-log.md`.

## Contents
- [Provider selection & auth](#provider-selection--auth)
- [Models & effort](#models--effort)
- [Prompt caching](#prompt-caching)
- [API request shaping & gateway compatibility](#api-request-shaping--gateway-compatibility)
- [API timeouts, retries & streaming](#api-timeouts-retries--streaming)
- [Context, compaction & sessions](#context-compaction--sessions)
- [Subagents, background tasks & workflows](#subagents-background-tasks--workflows)
- [Tools, timeouts & limits](#tools-timeouts--limits)
- [Network, proxy & TLS](#network-proxy--tls)
- [Telemetry & OpenTelemetry](#telemetry--opentelemetry)
- [Privacy & nonessential traffic](#privacy--nonessential-traffic)
- [Feature disable switches](#feature-disable-switches)
- [claude.ai and feature-flag features](#claudeai-and-feature-flag-features)
- [MCP](#mcp)
- [Plugins, skills, hooks & mods](#plugins-skills-hooks--mods)
- [Permissions & safety](#permissions--safety)
- [Updates & install](#updates--install)
- [Terminal, UI, IDE & browser](#terminal-ui-ide--browser)
- [Debug & development](#debug--development)
- [Set by Claude Code](#set-by-claude-code)
- [Other](#other)
- [Coverage summary](#coverage-summary)
- [Related](#related)

## Provider selection & auth
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-001 | `CLAUDE_CODE_USE_FOUNDRY` | Route all model requests to Microsoft Foundry | ✅ | ✅ | 🟡 Restrict | [NET-004](../03-test-plan/catalog/network.md#net-004), [POL-012](../03-test-plan/catalog/policy.md#pol-012), [POL-013](../03-test-plan/catalog/policy.md#pol-013), [IDN-012](../03-test-plan/catalog/identity.md#idn-012) | ⏳ | Set in managed env: `1`. No setup wizard; env vars are the only configuration path (microsoft-foundry). |
| INV-VAR-002 | `ANTHROPIC_FOUNDRY_RESOURCE` | Foundry resource name used to build the endpoint URL | ✅ | ✅ | 🟡 Restrict | [NET-004](../03-test-plan/catalog/network.md#net-004), [IDN-012](../03-test-plan/catalog/identity.md#idn-012), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `<foundry-resource>`. Resource name only; a URL or host name is refused. |
| INV-VAR-003 | `ANTHROPIC_FOUNDRY_BASE_URL` | Full Foundry endpoint URL; alternative to the resource name | ✅ | ✅ | 🟡 Restrict | [NET-004](../03-test-plan/catalog/network.md#net-004), [NET-002](../03-test-plan/catalog/network.md#net-002), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Leave unset (resource name used). A shell value could target another resource; firewall allows only `<foundry-resource>` host. [verify] precedence vs `ANTHROPIC_FOUNDRY_RESOURCE`. |
| INV-VAR-004 | `ANTHROPIC_FOUNDRY_API_KEY` | Static Foundry API key for authentication | ✅ | ✅ | 🔴 Block | [IDN-002](../03-test-plan/catalog/identity.md#idn-002), [IDN-008](../03-test-plan/catalog/identity.md#idn-008), [OPS-010](../03-test-plan/catalog/operations.md#ops-010) | ⏳ | No keys (ADR-006): `disableLocalAuth: true` on the Foundry resource, enforced by Azure Policy [verify it applies to Claude deployments]. Never set in managed env; sandbox credentials deny is the backstop. |
| INV-VAR-005 | `ANTHROPIC_FOUNDRY_AUTH_TOKEN` | Entra ID bearer token for Foundry; beats API key and credential chain | ✅ | ✅ | 🟡 Restrict | [IDN-003](../03-test-plan/catalog/identity.md#idn-003), [IDN-009](../03-test-plan/catalog/identity.md#idn-009), [IDN-001](../03-test-plan/catalog/identity.md#idn-001) | ⏳ | Pending the auth-mode ADR (IDN-001/002/003). v2.1.203+. Unset both Foundry credentials to use the Azure default credential chain (Entra ID). |
| INV-VAR-006 | `CLAUDE_CODE_SKIP_FOUNDRY_AUTH` | Send Foundry requests without an Azure credential, for header-injecting gateways | ✅ | ✅ | ⚪ Default | — | ⏳ | Not used: the Claude apps gateway is reached by `/login` sign-in, not as a Foundry-format gateway (ADR-013). Requests fail without a credential. Ignored when a Foundry key or token is set. |
| INV-VAR-007 | `CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST` | Host platform owns routing; ignores provider vars and managed model pins | ✅ | ✅ | 🔴 Block | [POL-012](../03-test-plan/catalog/policy.md#pol-012), [POL-013](../03-test-plan/catalog/policy.md#pol-013), [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | Must stay unset: it makes Claude Code ignore `ANTHROPIC_DEFAULT_*_MODEL` in managed `env`. Not set in image; managed env `""` [verify] neutralizes a shell value. |
| INV-VAR-008 | `CLAUDE_CODE_USE_BEDROCK` | Route model requests to Amazon Bedrock | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [POL-012](../03-test-plan/catalog/policy.md#pol-012), [NET-002](../03-test-plan/catalog/network.md#net-002) | ⏳ | Other provider. Managed env sets `""` (empty = unset for provider selection); `allowedProviders`; egress firewall blocks the provider (NET-002). |
| INV-VAR-009 | `CLAUDE_CODE_USE_VERTEX` | Route model requests to Google Cloud's Agent Platform | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [POL-012](../03-test-plan/catalog/policy.md#pol-012), [NET-002](../03-test-plan/catalog/network.md#net-002) | ⏳ | Other provider. Managed env sets `""` (empty = unset for provider selection); `allowedProviders`; egress firewall blocks the provider (NET-002). |
| INV-VAR-010 | `CLAUDE_CODE_USE_MANTLE` | Route model requests to the Amazon Bedrock Mantle endpoint | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [POL-012](../03-test-plan/catalog/policy.md#pol-012), [NET-002](../03-test-plan/catalog/network.md#net-002) | ⏳ | Other provider. Managed env sets `""`; `allowedProviders`; egress firewall blocks the provider (NET-002). |
| INV-VAR-011 | `CLAUDE_CODE_USE_ANTHROPIC_AWS` | Route model requests to Claude Platform on AWS | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [POL-012](../03-test-plan/catalog/policy.md#pol-012), [NET-002](../03-test-plan/catalog/network.md#net-002) | ⏳ | Other provider. Managed env sets `""`; `allowedProviders`; egress firewall blocks the provider (NET-002). |
| INV-VAR-012 | `ANTHROPIC_API_KEY` | Anthropic API key sent as X-Api-Key; overrides subscription login | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [NET-002](../03-test-plan/catalog/network.md#net-002), [IDN-008](../03-test-plan/catalog/identity.md#idn-008) | ⏳ | Other provider. (direct Anthropic API). `allowedProviders`/`forceLoginMethod`; firewall blocks `api.anthropic.com`. [verify] behavior when set alongside `CLAUDE_CODE_USE_FOUNDRY`. |
| INV-VAR-013 | `ANTHROPIC_AUTH_TOKEN` | Custom bearer value for the Authorization header | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [NET-002](../03-test-plan/catalog/network.md#net-002) | ⏳ | Other provider. (Anthropic API or gateway credential). `allowedProviders`; firewall blocks non-Foundry model hosts. |
| INV-VAR-014 | `ANTHROPIC_BASE_URL` | Redirect API requests to a proxy or LLM gateway | ⛔ | ✅ | 🔴 Block | [NET-002](../03-test-plan/catalog/network.md#net-002), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Other provider. Third-party LLM gateways are not in the design; the Databricks Unity AI Gateway was evaluated and rejected (ADR-012). Managed env sets `""` [verify]; firewall blocks other hosts. A non-first-party host also disables MCP tool search. |
| INV-VAR-015 | `ANTHROPIC_AWS_API_KEY` | Workspace API key for Claude Platform on AWS | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-016 | `ANTHROPIC_AWS_BASE_URL` | Override the Claude Platform on AWS endpoint URL | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-017 | `ANTHROPIC_AWS_WORKSPACE_ID` | Workspace ID header required by Claude Platform on AWS | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-018 | `ANTHROPIC_BEDROCK_BASE_URL` | Override the Amazon Bedrock endpoint URL | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-019 | `ANTHROPIC_BEDROCK_MANTLE_BASE_URL` | Override the Bedrock Mantle endpoint URL | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-020 | `ANTHROPIC_BEDROCK_REGION_PREFIX` | Preferred Bedrock cross-region inference profile prefix | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.224+. |
| INV-VAR-021 | `ANTHROPIC_BEDROCK_SERVICE_TIER` | Bedrock service tier header (default, flex, priority) | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-022 | `AWS_BEARER_TOKEN_BEDROCK` | Amazon Bedrock API key | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-023 | `ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION` | AWS region for the Haiku-class model on Bedrock or Mantle | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-024 | `CLAUDE_CODE_AWS_CHAIN_RESOLVE_TIMEOUT_MS` | How long to wait for the AWS default credential chain | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.207+. |
| INV-VAR-025 | `CLAUDE_CODE_SKIP_AWS_CRED_CACHE` | Resolve AWS chain credentials on every request (no cache) | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.207+. |
| INV-VAR-026 | `CLAUDE_CODE_SKIP_BEDROCK_AUTH` | Skip AWS authentication for Bedrock behind a signing gateway | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-027 | `CLAUDE_CODE_SKIP_MANTLE_AUTH` | Skip AWS authentication for Bedrock Mantle | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-028 | `CLAUDE_CODE_SKIP_ANTHROPIC_AWS_AUTH` | Skip client authentication for Claude Platform on AWS | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-029 | `CLAUDE_CODE_DISABLE_BEDROCK_CONTENT_TYPE_DEFAULT` | Stop decoding header-less Bedrock streams as event streams | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.239+. |
| INV-VAR-030 | `CLAUDE_CODE_DISABLE_BEDROCK_CONTENT_TYPE_GUARD` | Skip the Bedrock stream content-type check | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.208+. |
| INV-VAR-031 | `CLAUDE_CODE_DISABLE_MODEL_ACCESS_FALLBACK` | Fail instead of downgrading when Bedrock or Vertex model access is lost | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.285+. |
| INV-VAR-032 | `CLAUDE_CODE_SKIP_MODEL_ACCESS_MEMORY` | Forget Bedrock or Vertex startup model-check results | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.285+. Foundry has no startup model check. |
| INV-VAR-033 | `ANTHROPIC_VERTEX_BASE_URL` | Override the Agent Platform endpoint URL | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-034 | `ANTHROPIC_VERTEX_PROJECT_ID` | GCP project for Agent Platform requests | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-035 | `CLAUDE_CODE_SKIP_VERTEX_AUTH` | Skip Google authentication for Agent Platform | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-036 | `CLAUDE_CODE_DISABLE_AUTH_REFRESH_LOCK` | Run gcpAuthRefresh or awsAuthRefresh without waiting on other processes | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.286+. |
| INV-VAR-037 | `VERTEX_REGION_CLAUDE_3_5_HAIKU` | Agent Platform region override for Claude 3.5 Haiku | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-038 | `VERTEX_REGION_CLAUDE_3_5_SONNET` | Agent Platform region override for Claude 3.5 Sonnet | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-039 | `VERTEX_REGION_CLAUDE_3_7_SONNET` | Agent Platform region override for Claude 3.7 Sonnet | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-040 | `VERTEX_REGION_CLAUDE_4_0_OPUS` | Agent Platform region override for Claude Opus 4 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-041 | `VERTEX_REGION_CLAUDE_4_0_SONNET` | Agent Platform region override for Claude Sonnet 4 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-042 | `VERTEX_REGION_CLAUDE_4_1_OPUS` | Agent Platform region override for Claude Opus 4.1 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-043 | `VERTEX_REGION_CLAUDE_4_5_OPUS` | Agent Platform region override for Claude Opus 4.5 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-044 | `VERTEX_REGION_CLAUDE_4_5_SONNET` | Agent Platform region override for Claude Sonnet 4.5 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-045 | `VERTEX_REGION_CLAUDE_4_6_OPUS` | Agent Platform region override for Claude Opus 4.6 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-046 | `VERTEX_REGION_CLAUDE_4_6_SONNET` | Agent Platform region override for Claude Sonnet 4.6 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-047 | `VERTEX_REGION_CLAUDE_4_7_OPUS` | Agent Platform region override for Claude Opus 4.7 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-048 | `VERTEX_REGION_CLAUDE_4_8_OPUS` | Agent Platform region override for Claude Opus 4.8 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-049 | `VERTEX_REGION_CLAUDE_5_5_OPUS` | Agent Platform region override for Claude Opus 5.5 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.280+. |
| INV-VAR-050 | `VERTEX_REGION_CLAUDE_5_5_SONNET` | Agent Platform region override for Claude Sonnet 5.5 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.284+. |
| INV-VAR-051 | `VERTEX_REGION_CLAUDE_5_OPUS` | Agent Platform region override for Claude Opus 5 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.219+. |
| INV-VAR-052 | `VERTEX_REGION_CLAUDE_5_SONNET` | Agent Platform region override for Claude Sonnet 5 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.197+. |
| INV-VAR-053 | `VERTEX_REGION_CLAUDE_FABLE_5` | Agent Platform region override for Claude Fable 5 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.170+. |
| INV-VAR-054 | `VERTEX_REGION_CLAUDE_FABLE_5_1` | Agent Platform region override for Claude Fable 5.1 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.257+. |
| INV-VAR-055 | `VERTEX_REGION_CLAUDE_HAIKU_4_5` | Agent Platform region override for Claude Haiku 4.5 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-056 | `VERTEX_REGION_CLAUDE_HAIKU_5_5` | Agent Platform region override for Claude Haiku 5.5 | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. v2.1.293+. |
| INV-VAR-057 | `ANTHROPIC_FEDERATION_RULE_ID` | Workload Identity Federation rule for the Anthropic API | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. (Anthropic API). |
| INV-VAR-058 | `ANTHROPIC_ORGANIZATION_ID` | Anthropic organization ID for Workload Identity Federation | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. (Anthropic API). |
| INV-VAR-059 | `ANTHROPIC_WORKSPACE_ID` | Anthropic workspace targeted by the federation token exchange | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. (Anthropic API). |
| INV-VAR-060 | `ANTHROPIC_PROFILE` | Anthropic profile (from `ant auth login`) to authenticate with | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. (Anthropic API). |
| INV-VAR-061 | `CLAUDE_CODE_OAUTH_TOKEN` | claude.ai OAuth access token for automation | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Needs a claude.ai account; none in this environment. |
| INV-VAR-062 | `CLAUDE_CODE_OAUTH_REFRESH_TOKEN` | claude.ai refresh token exchanged by `claude auth login` | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Needs a claude.ai account. |
| INV-VAR-063 | `CLAUDE_CODE_OAUTH_SCOPES` | Scopes the OAuth refresh token was issued with | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Needs a claude.ai account. Ignored from settings `env` in cloud sessions (network-config). |
| INV-VAR-064 | `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` | Refresh interval for apiKeyHelper credentials | ❓ | ✅ | ⚪ Default | [EXT-015](../03-test-plan/catalog/extensions.md#ext-015) | ⏳ | `apiKeyHelper` itself is controlled by CTL-15/EXT-015. [verify] whether `apiKeyHelper` applies on Foundry. |
| INV-VAR-065 | `DISABLE_LOGIN_COMMAND` | Hide the /login command | ✅ | ✅ | 🟡 Restrict | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [IDN-014](../03-test-plan/catalog/identity.md#idn-014) | ⏳ | Direct-Foundry stage only: set in managed env `1`. Don't set once the Claude apps gateway is used, because gateway sign-in runs through `/login` (ADR-013). |
| INV-VAR-066 | `DISABLE_LOGOUT_COMMAND` | Hide the /logout command | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | /logout is already unavailable on Foundry (microsoft-foundry). |

## Models & effort
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-067 | `ANTHROPIC_DEFAULT_OPUS_MODEL` | Deployment the `opus` alias and opusplan plan phase use | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011), [COST-011](../03-test-plan/catalog/cost.md#cost-011), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `<opus-deployment>`. Unpinned, `opus` resolves to Opus 4.6 on Foundry; append `[1m]` only for 4.6 models. |
| INV-VAR-068 | `ANTHROPIC_DEFAULT_SONNET_MODEL` | Deployment the `sonnet` alias and opusplan execution use | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011), [COST-011](../03-test-plan/catalog/cost.md#cost-011), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `<sonnet-deployment>`. Unpinned, `sonnet` resolves to Sonnet 4.5 on Foundry. |
| INV-VAR-069 | `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Deployment for the `haiku` alias and background tasks | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011), [COST-010](../03-test-plan/catalog/cost.md#cost-010), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `<haiku-deployment>`. Unset, Foundry runs background tasks on the primary model. |
| INV-VAR-070 | `ANTHROPIC_DEFAULT_FABLE_MODEL` | Deployment the `fable` alias resolves to | ❓ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | Not pinned unless a Fable deployment is approved; `availableModels` excludes `fable`. [verify] Fable availability on Foundry. |
| INV-VAR-071 | `ANTHROPIC_DEFAULT_OPUS_MODEL_NAME` | Picker display name for the pinned Opus model | ✅ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Optional: set in managed env with the pin; Foundry otherwise shows the deployment name. |
| INV-VAR-072 | `ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION` | Picker description for the pinned Opus model | ✅ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Optional: set in managed env with the pin. |
| INV-VAR-073 | `ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES` | Declare effort and thinking support for the pinned Opus model | ✅ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [COST-011](../03-test-plan/catalog/cost.md#cost-011) | ⏳ | [verify] effort/thinking are detected from our deployment names; if not, set in managed env. |
| INV-VAR-074 | `ANTHROPIC_DEFAULT_SONNET_MODEL_NAME` | Picker display name for the pinned Sonnet model | ✅ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Optional: set in managed env with the pin; Foundry otherwise shows the deployment name. |
| INV-VAR-075 | `ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION` | Picker description for the pinned Sonnet model | ✅ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Optional: set in managed env with the pin. |
| INV-VAR-076 | `ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES` | Declare effort and thinking support for the pinned Sonnet model | ✅ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [COST-011](../03-test-plan/catalog/cost.md#cost-011) | ⏳ | [verify] effort/thinking are detected from our deployment names; if not, set in managed env. |
| INV-VAR-077 | `ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME` | Picker display name for the pinned Haiku model | ✅ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Optional: set in managed env with the pin; Foundry otherwise shows the deployment name. |
| INV-VAR-078 | `ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION` | Picker description for the pinned Haiku model | ✅ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Optional: set in managed env with the pin. |
| INV-VAR-079 | `ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES` | Declare effort and thinking support for the pinned Haiku model | ✅ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [COST-011](../03-test-plan/catalog/cost.md#cost-011) | ⏳ | [verify] effort/thinking are detected from our deployment names; if not, set in managed env. |
| INV-VAR-080 | `ANTHROPIC_DEFAULT_FABLE_MODEL_NAME` | Picker display name for the pinned Fable model | ❓ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Optional: set in managed env with the pin; Foundry otherwise shows the deployment name. [verify] Fable on Foundry. |
| INV-VAR-081 | `ANTHROPIC_DEFAULT_FABLE_MODEL_DESCRIPTION` | Picker description for the pinned Fable model | ❓ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Optional: set in managed env with the pin. [verify] Fable on Foundry. |
| INV-VAR-082 | `ANTHROPIC_DEFAULT_FABLE_MODEL_SUPPORTED_CAPABILITIES` | Declare effort and thinking support for the pinned Fable model | ❓ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [COST-011](../03-test-plan/catalog/cost.md#cost-011) | ⏳ | [verify] effort/thinking are detected from our deployment names; if not, set in managed env. |
| INV-VAR-083 | `ANTHROPIC_MODEL` | Model setting the session starts with | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011), [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Bounded by managed `availableModels` [verify]. Read before the `model` setting; `--model` and `/model` override it. |
| INV-VAR-084 | `ANTHROPIC_DEFAULT_MODEL` | Model that new sessions start on | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | Bounded by managed `availableModels` [verify]. v2.1.236+. |
| INV-VAR-085 | `ANTHROPIC_SMALL_FAST_MODEL` | Haiku-class model for background tasks | ✅ | ✅ | ⚪ Default | [COST-010](../03-test-plan/catalog/cost.md#cost-010) | ⏳ | Deprecated; use `ANTHROPIC_DEFAULT_HAIKU_MODEL`. |
| INV-VAR-086 | `ANTHROPIC_CUSTOM_MODEL_OPTION` | Add a custom model ID to the /model picker | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | Bounded by managed `availableModels` [verify]. |
| INV-VAR-087 | `ANTHROPIC_CUSTOM_MODEL_OPTION_NAME` | Display name for the custom picker entry | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-088 | `ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION` | Display description for the custom picker entry | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-089 | `ANTHROPIC_CUSTOM_MODEL_OPTION_SUPPORTED_CAPABILITIES` | Capabilities the custom picker model supports | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-090 | `CLAUDE_CODE_SUBAGENT_MODEL` | Default model for subagents, teammates and workflow agents | ✅ | ✅ | ⚪ Default | [COST-008](../03-test-plan/catalog/cost.md#cost-008), [FEAT-007](../03-test-plan/catalog/features.md#feat-007) | ⏳ | Bounded by `availableModels` [verify]. Agent definition `model` and per-call model take precedence. |
| INV-VAR-091 | `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` | Force one model onto all subagents | ✅ | ✅ | ⚪ Default | [COST-008](../03-test-plan/catalog/cost.md#cost-008) | ⏳ | v2.1.257+. |
| INV-VAR-092 | `CLAUDE_CODE_EFFORT_LEVEL` | Effort level; overrides --effort and /effort | ✅ | ✅ | 🟢 Allow | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [COST-003](../03-test-plan/catalog/cost.md#cost-003) | ⏳ | Managed `maxEffortLevel` cap still applies. |
| INV-VAR-093 | `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT` | Send effort even when the model ID is not recognized | ✅ | ✅ | ⚪ Default | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [COST-011](../03-test-plan/catalog/cost.md#cost-011) | ⏳ | Possible fix if deployment names hide effort support [verify]. |
| INV-VAR-094 | `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` | Use a fixed thinking budget instead of adaptive reasoning | ✅ | ✅ | ⚪ Default | — | ⏳ | Opus 4.6 and Sonnet 4.6 only. |
| INV-VAR-095 | `MAX_THINKING_TOKENS` | Fixed extended-thinking token budget | ✅ | ✅ | ⚪ Default | [COST-003](../03-test-plan/catalog/cost.md#cost-003) | ⏳ | On third-party providers `0` omits the thinking parameter. |
| INV-VAR-096 | `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Maximum output tokens for most requests | ✅ | ✅ | ⚪ Default | [COST-003](../03-test-plan/catalog/cost.md#cost-003) | ⏳ | Raising it shrinks the context left before auto-compaction. |
| INV-VAR-097 | `CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP` | Stop remapping Opus 4 and 4.1 to the current Opus | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | The remap never runs on Foundry. |
| INV-VAR-098 | `CLAUDE_CODE_DISABLE_REFUSAL_FALLBACK` | Turn off the model switch when a safety classifier flags | ❓ | ✅ | ⚪ Default | — | ⏳ | Fallback on Foundry needs identifiable model IDs (model-config) [verify]. |
| INV-VAR-099 | `FALLBACK_FOR_ALL_PRIMARY_MODELS` | Stop overload retries for every model when no fallback is set | ✅ | ✅ | ⚪ Default | [COST-007](../03-test-plan/catalog/cost.md#cost-007) | ⏳ | Any non-empty value turns it on, including `0`. |

## Prompt caching
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-100 | `DISABLE_PROMPT_CACHING` | Disable prompt caching for all models | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ | Keep caching on; disabling raises cost. |
| INV-VAR-101 | `DISABLE_PROMPT_CACHING_OPUS` | Disable prompt caching for the default Opus model | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ |  |
| INV-VAR-102 | `DISABLE_PROMPT_CACHING_SONNET` | Disable prompt caching for the default Sonnet model | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ |  |
| INV-VAR-103 | `DISABLE_PROMPT_CACHING_HAIKU` | Disable prompt caching for the default Haiku model | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ |  |
| INV-VAR-104 | `DISABLE_PROMPT_CACHING_FABLE` | Disable prompt caching for Fable models | ❓ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ | [verify] Fable availability on Foundry. |
| INV-VAR-105 | `ENABLE_PROMPT_CACHING_1H` | Request a 1-hour prompt cache TTL instead of 5 minutes | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ | Decide after COST-004; 1-hour writes bill higher. Named on the microsoft-foundry page. |
| INV-VAR-106 | `ENABLE_PROMPT_CACHING_1H_BEDROCK` | Older name for ENABLE_PROMPT_CACHING_1H | ❓ | ✅ | ⚪ Default | — | ⏳ | Deprecated. [verify] still honored outside Bedrock. |
| INV-VAR-107 | `CLAUDE_CODE_PROMPT_CACHE_TTL` | Cache TTL (5m or 1h) for the main conversation | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ | v2.1.242+. |
| INV-VAR-108 | `CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL` | Cache TTL for subagents, workflows and background requests | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ | v2.1.242+. |
| INV-VAR-109 | `FORCE_PROMPT_CACHING_5M` | Force the 5-minute TTL over every 1-hour setting | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ | Candidate cost guardrail. |

## API request shaping & gateway compatibility
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-110 | `ANTHROPIC_BETAS` | Extra anthropic-beta header values for API requests | ❓ | ✅ | ⚪ Default | — | ⏳ | [verify] Foundry accepts added betas. |
| INV-VAR-111 | `ANTHROPIC_CUSTOM_HEADERS` | Extra HTTP headers added to API requests | ✅ | ✅ | ⚪ Default | [NET-004](../03-test-plan/catalog/network.md#net-004) | ⏳ | Header validation v2.1.227+. Keep unset; could carry credentials. |
| INV-VAR-112 | `CLAUDE_CODE_EXTRA_BODY` | JSON merged into every API request body | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-113 | `CLAUDE_CODE_ATTRIBUTION_HEADER` | Omit the attribution block (version, prompt fingerprint) from the system prompt | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ | Before v2.1.181 Foundry needed `0` for caching; not needed on 2.1.301. |
| INV-VAR-114 | `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` | Strip pre-release beta headers and fields from requests | ✅ | ✅ | ⚪ Default | — | ⏳ | Use only if Foundry rejects betas; also disables MCP tool search. |
| INV-VAR-115 | `CLAUDE_CODE_DISABLE_STRUCTURED_OUTPUTS` | Stop sending the structured-output field and its beta | ✅ | ✅ | ⚪ Default | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ | v2.1.288+. [verify] effect on `--json-schema`. |
| INV-VAR-116 | `CLAUDE_CODE_DISABLE_THINKING` | Omit the thinking parameter for gateways that reject it | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-117 | `DISABLE_INTERLEAVED_THINKING` | Do not send the interleaved-thinking beta header | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-118 | `CLAUDE_CODE_GATEWAY_HINT_HEADERS` | Send or suppress x-claude-code-* gateway hint headers | ❓ | ✅ | ⚪ Default | — | ⏳ | v2.1.273+. [verify] default on Foundry. |
| INV-VAR-119 | `CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING` | Stream tool inputs as Claude generates them | ❓ | ✅ | ⚪ Default | — | ⏳ | Off by default on Foundry, so long writes can look hung. [verify] `1` works on Foundry. |
| INV-VAR-120 | `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY` | Fill the /model picker from a gateway's /v1/models | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Needs an `ANTHROPIC_BASE_URL` gateway (other provider). |
| INV-VAR-121 | `CLAUDE_CODE_GATEWAY_MODEL_DISCOVERY_TIMEOUT_MS` | Timeout for gateway model discovery | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Gateway only. v2.1.269+. |

## API timeouts, retries & streaming
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-122 | `API_TIMEOUT_MS` | Per-request API timeout (default 10 minutes) | ✅ | ✅ | ⚪ Default | [COST-007](../03-test-plan/catalog/cost.md#cost-007) | ⏳ | Maximum 2147483647. |
| INV-VAR-123 | `API_FORCE_IDLE_TIMEOUT` | Turn the 5-minute body idle timeout off or on | ✅ | ✅ | ⚪ Default | — | ⏳ | Body idle timeout is on by default on Foundry. |
| INV-VAR-124 | `CLAUDE_ENABLE_STREAM_WATCHDOG` | Force the event-level stream watchdog on or off | ✅ | ✅ | ⚪ Default | — | ⏳ | On by default for every provider. |
| INV-VAR-125 | `CLAUDE_STREAM_IDLE_TIMEOUT_MS` | Timeout before stream watchdogs close a stalled connection | ✅ | ✅ | ⚪ Default | — | ⏳ | Values below 5 minutes are raised to 5 minutes. |
| INV-VAR-126 | `CLAUDE_ENABLE_BYTE_WATCHDOG` | Force the byte-level stream watchdog on or off | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Byte watchdog doesn't run on Foundry (network-config). |
| INV-VAR-127 | `CLAUDE_BYTE_STREAM_IDLE_TIMEOUT_MS` | Byte-level watchdog timeout | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | No effect on Foundry. v2.1.210+. |
| INV-VAR-128 | `CLAUDE_STREAM_FIRST_BYTE_TIMEOUT_MS` | Deadline for the first response byte | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | First-byte deadline doesn't run on Foundry. v2.1.242+. |
| INV-VAR-129 | `CLAUDE_ENABLE_BYTE_WATCHDOG_BEDROCK` | Byte watchdog on Bedrock event-stream responses | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. |
| INV-VAR-130 | `CLAUDE_CODE_CONNECT_TIMEOUT_MS` | Former connect-phase timeout for streaming requests | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.186; no-op. |
| INV-VAR-131 | `CLAUDE_CODE_MAX_RETRIES` | Number of API retries (default 10) | ✅ | ✅ | ⚪ Default | [COST-007](../03-test-plan/catalog/cost.md#cost-007) | ⏳ | Capped at 15 unless the retry watchdog is on. |
| INV-VAR-132 | `CLAUDE_CODE_RETRY_WATCHDOG` | Retry 429 and 529 errors indefinitely for unattended runs | ✅ | ✅ | ⚪ Default | [COST-007](../03-test-plan/catalog/cost.md#cost-007), [SURF-005](../03-test-plan/catalog/surfaces.md#surf-005) | ⏳ | v2.1.186+. Consider for CI only; long waits on TPM quota. |
| INV-VAR-133 | `CLAUDE_CODE_RETRY_WATCHDOG_MAX_WAIT_MS` | Cap on retry-watchdog waiting per request | ✅ | ✅ | ⚪ Default | [COST-007](../03-test-plan/catalog/cost.md#cost-007) | ⏳ | v2.1.295+. |
| INV-VAR-134 | `CLAUDE_CODE_NONSTREAMING_TIMEOUT_RETRIES` | Retries for timed-out non-streaming requests | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.285+. |
| INV-VAR-135 | `CLAUDE_CODE_OVERLOADED_RETRY_BASE_DELAY_MS` | Starting backoff for 529 overloaded retries | ❓ | ✅ | ⚪ Default | [COST-007](../03-test-plan/catalog/cost.md#cost-007) | ⏳ | v2.1.292+. [verify] Foundry returns 529. |
| INV-VAR-136 | `CLAUDE_CODE_OVERLOADED_RETRY_MAX_DELAY_MS` | Backoff ceiling for 529 overloaded retries | ❓ | ✅ | ⚪ Default | [COST-007](../03-test-plan/catalog/cost.md#cost-007) | ⏳ | v2.1.296+. [verify] Foundry returns 529. |
| INV-VAR-137 | `CLAUDE_CODE_DISABLE_NONSTREAMING_FALLBACK` | Skip the non-streaming fallback after a mid-stream failure | ✅ | ✅ | ⚪ Default | — | ⏳ |  |

## Context, compaction & sessions
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-138 | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Trigger auto-compaction earlier, as a percentage of the window | ✅ | ✅ | ⚪ Default | [COST-009](../03-test-plan/catalog/cost.md#cost-009) | ⏳ | Can lower, not raise, the threshold. |
| INV-VAR-139 | `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | Auto-compact window in tokens (100K to 1M) | ✅ | ✅ | ⚪ Default | [COST-009](../03-test-plan/catalog/cost.md#cost-009) | ⏳ | Plain integer only. |
| INV-VAR-140 | `CLAUDE_CODE_IDLE_COMPACT_MIN_TOKENS` | Context size at which idle compaction applies | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | v2.1.290+. Idle compaction needs feature-flag fetching, which Foundry skips [verify]. |
| INV-VAR-141 | `CLAUDE_CODE_DISABLE_1M_CONTEXT` | Hold models to a 200K context window | ✅ | ✅ | ⚪ Default | [COST-011](../03-test-plan/catalog/cost.md#cost-011), [COST-009](../03-test-plan/catalog/cost.md#cost-009) | ⏳ | Candidate cost control; Opus 4.7+ and Sonnet 5+ default to 1M on Foundry. |
| INV-VAR-142 | `CLAUDE_CODE_MAX_CONTEXT_TOKENS` | Override the context window assumed for the model | ✅ | ✅ | ⚪ Default | [COST-011](../03-test-plan/catalog/cost.md#cost-011) | ⏳ | Use if a deployment name is not matched to a model. |
| INV-VAR-143 | `CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT` | Skip proactive compaction for unrecognized model IDs | ✅ | ✅ | ⚪ Default | [COST-011](../03-test-plan/catalog/cost.md#cost-011) | ⏳ | v2.1.223+. |
| INV-VAR-144 | `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` | Load memory files from --add-dir directories | ✅ | ✅ | ⚪ Default | [PERM-013](../03-test-plan/catalog/permissions.md#perm-013), [FEAT-004](../03-test-plan/catalog/features.md#feat-004) | ⏳ |  |
| INV-VAR-145 | `CLAUDE_CODE_SKIP_PROMPT_HISTORY` | Do not write prompt history or transcripts to disk | ✅ | ✅ | 🟡 Restrict | [DATA-003](../03-test-plan/catalog/data.md#data-003), [OPS-005](../03-test-plan/catalog/operations.md#ops-005) | ⏳ | Proposed: set in managed env: `0` so transcripts exist for incident reconstruction [verify]. |
| INV-VAR-146 | `CLAUDE_CODE_TRANSCRIPT_LOCAL_GC` | Trim pre-compaction history from large -p transcripts | ✅ | ✅ | ⚪ Default | [DATA-003](../03-test-plan/catalog/data.md#data-003), [OPS-005](../03-test-plan/catalog/operations.md#ops-005) | ⏳ | v2.1.287+. Launch environment only; a settings `env` block can't turn it on. |
| INV-VAR-147 | `CLAUDE_CODE_FORCE_SESSION_PERSISTENCE` | Persist sessions even when launched inside another session | ✅ | ✅ | ⚪ Default | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ |  |
| INV-VAR-148 | `CLAUDE_CODE_PROJECT_DIR_NAME` | Name the projects/ directory used with CLAUDE_CONFIG_DIR | ✅ | ✅ | ⚪ Default | [DATA-003](../03-test-plan/catalog/data.md#data-003) | ⏳ | v2.1.234+. Launch environment only. |
| INV-VAR-149 | `CLAUDE_CODE_RESUME_INTERRUPTED_TURN` | Auto-resume a session that ended mid-turn | ✅ | ✅ | ⚪ Default | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | SDK use. |
| INV-VAR-150 | `CLAUDE_CODE_RESUME_INTERRUPTED_TURN_MAX_AGE_MS` | Maximum age for automatic mid-turn resume | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.211+. |
| INV-VAR-151 | `CLAUDE_CODE_RESUME_PROMPT` | Continuation message sent on automatic resume | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-152 | `CLAUDE_CODE_ENABLE_AWAY_SUMMARY` | Force session recaps on or off | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-153 | `CLAUDE_CODE_ENABLE_TASKS` | Choose the Task tools or the legacy TodoWrite tool | ✅ | ✅ | ⚪ Default | [FEAT-016](../03-test-plan/catalog/features.md#feat-016) | ⏳ |  |
| INV-VAR-154 | `CLAUDE_CODE_ENABLE_TODO_TOOLS` | Offer task-tracking tools on every model | ✅ | ✅ | ⚪ Default | [FEAT-016](../03-test-plan/catalog/features.md#feat-016) | ⏳ | v2.1.233+. |
| INV-VAR-155 | `CLAUDE_CODE_TASK_LIST_ID` | Share one task list across sessions | ✅ | ✅ | ⚪ Default | [FEAT-016](../03-test-plan/catalog/features.md#feat-016) | ⏳ |  |
| INV-VAR-156 | `CLAUDE_CODE_GOAL_CHECKIN_MINUTES` | Minutes before Claude checks a goal waiting on background work | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.234+. |
| INV-VAR-157 | `CLAUDE_CODE_NEW_INIT` | Run /init as an interactive setup flow | ✅ | ✅ | ⚪ Default | [FEAT-004](../03-test-plan/catalog/features.md#feat-004) | ⏳ |  |
| INV-VAR-158 | `CLAUDE_CODE_SIMPLE_SYSTEM_PROMPT` | Choose the full or the shorter system prompt | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-159 | `CLAUDE_CODE_MAX_TURNS` | Default cap on agentic turns | ✅ | ✅ | ⚪ Default | [COST-005](../03-test-plan/catalog/cost.md#cost-005), [FEAT-012](../03-test-plan/catalog/features.md#feat-012) | ⏳ | `--max-turns` takes precedence. |
| INV-VAR-160 | `CLAUDE_CODE_EXIT_AFTER_STOP_DELAY` | Exit automatically after the loop is idle this long | ✅ | ✅ | ⚪ Default | [FEAT-012](../03-test-plan/catalog/features.md#feat-012) | ⏳ | SDK and scripts. |
| INV-VAR-161 | `CLAUDE_CODE_EMIT_SESSION_STATE_EVENTS` | Add session_state_changed messages to stream output | ✅ | ✅ | ⚪ Default | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ |  |
| INV-VAR-162 | `CLAUDE_CODE_STARTUP_FAILURE_RESULTS` | Write a result message when startup fails (stream-json) | ✅ | ✅ | ⚪ Default | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ | v2.1.274+. |
| INV-VAR-163 | `MAX_STRUCTURED_OUTPUT_RETRIES` | Attempts allowed for --json-schema validation (default 5) | ✅ | ✅ | ⚪ Default | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ |  |

## Subagents, background tasks & workflows
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-164 | `CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS` | Remove all built-in subagents in -p and SDK runs | ✅ | ✅ | ⚪ Default | [SURF-006](../03-test-plan/catalog/surfaces.md#surf-006) | ⏳ |  |
| INV-VAR-165 | `CLAUDE_ASYNC_AGENT_STALL_TIMEOUT_MS` | Stall timeout for subagents and workflow agents | ✅ | ✅ | ⚪ Default | — | ⏳ | Default 10 minutes. |
| INV-VAR-166 | `CLAUDE_AUTO_BACKGROUND_TASKS` | Move long-running subagents to the background automatically | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ |  |
| INV-VAR-167 | `CLAUDE_CODE_WORKER_CHECKIN_SCHEDULE` | Reminder schedule for checking background subagents | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.283+. |
| INV-VAR-168 | `CLAUDE_CODE_AUTO_BACKGROUND_WORKER_CHECKIN_SECONDS` | Former background-worker check-in interval | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.283; use `CLAUDE_CODE_WORKER_CHECKIN_SCHEDULE`. |
| INV-VAR-169 | `CLAUDE_CODE_DISABLE_BG_EXIT_HANDOFF` | Stop background work instead of handing it to the next process | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.196+. |
| INV-VAR-170 | `CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP` | Keep background shells alive under memory pressure | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.193+. |
| INV-VAR-171 | `CLAUDE_DISABLE_ADOPT` | Stop in-flight work when backgrounding a session | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.195+. |
| INV-VAR-172 | `CLAUDE_CODE_BG_TASKS_REPORT_RUNNING` | Report idle at turn end despite running background work | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.269+. |
| INV-VAR-173 | `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS` | Max idle wait for background work after the final -p turn | ✅ | ✅ | ⚪ Default | [FEAT-012](../03-test-plan/catalog/features.md#feat-012) | ⏳ | v2.1.182+. |
| INV-VAR-174 | `CLAUDE_CODE_FORK_SUBAGENT` | Turn forked-subagent mode on or off | ✅ | ✅ | ⚪ Default | — | ⏳ | On by default in interactive sessions (v2.1.232+). |
| INV-VAR-175 | `CLAUDE_CODE_FORWARD_SUBAGENT_TEXT` | Include subagent text in stream-json output | ✅ | ✅ | ⚪ Default | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ | v2.1.211+. |
| INV-VAR-176 | `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` | Cap on subagents running at once (default 20) | ✅ | ✅ | 🟡 Restrict | [COST-008](../03-test-plan/catalog/cost.md#cost-008), [COST-016](../03-test-plan/catalog/cost.md#cost-016) | ⏳ | v2.1.217+. Set in managed env: `5` (default 20). Runaway-agent guardrail (CTL-28). |
| INV-VAR-177 | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` | Allowed subagent nesting depth (default 3) | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.217+. |
| INV-VAR-178 | `CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` | Former cap on total subagents per session | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.224; no-op. |
| INV-VAR-179 | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Enable experimental agent teams | ✅ | ✅ | ⚪ Default | [FEAT-022](../03-test-plan/catalog/features.md#feat-022), [COST-016](../03-test-plan/catalog/cost.md#cost-016) | ⏳ | Off by default and left unset in managed policy. COST-016 confirms it stays off; enable only in a test profile for FEAT-022 (CTL-28). |
| INV-VAR-180 | `CLAUDE_CODE_TEAM_TEARDOWN_PARK_TIMEOUT_MS` | Exit wait for agent-team teardown | ✅ | ✅ | ⚪ Default | [FEAT-022](../03-test-plan/catalog/features.md#feat-022) | ⏳ | v2.1.206+. |
| INV-VAR-181 | `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS` | Agents one workflow run executes at once | ✅ | ✅ | 🟡 Restrict | [COST-008](../03-test-plan/catalog/cost.md#cost-008), [COST-016](../03-test-plan/catalog/cost.md#cost-016) | ⏳ | v2.1.269+. Set in managed env: `3` (CTL-28). |
| INV-VAR-182 | `CLAUDE_CODE_WORKFLOW_PREFIX_STAGGER_MS` | Hold fan-out agents so they reuse a cached prompt prefix | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ | v2.1.229+. |
| INV-VAR-183 | `CLAUDE_SUBAGENT_BG_SHELL_MAX_MS` | Former cap on subagent background shell runtime | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.260; no-op. |

## Tools, timeouts & limits
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-184 | `BASH_DEFAULT_TIMEOUT_MS` | Default Bash or PowerShell command timeout (2 minutes) | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-185 | `BASH_MAX_TIMEOUT_MS` | Maximum timeout the model may set for a command | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-186 | `BASH_MAX_OUTPUT_LENGTH` | Maximum Bash output characters returned to Claude | ✅ | ✅ | ⚪ Default | — | ⏳ | Ignored when `bashOutputMaxChars` is set. |
| INV-VAR-187 | `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | Return to the project directory after each command | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-188 | `CLAUDE_CODE_SHELL` | Shell binary (bash or zsh) for the Bash tool | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-189 | `CLAUDE_ENV_FILE` | Shell script sourced before each Bash command | ✅ | ✅ | ⚪ Default | [SBX-003](../03-test-plan/catalog/sandbox.md#sbx-003) | ⏳ | Commands still run inside the sandbox. |
| INV-VAR-190 | `CLAUDE_CODE_SHELL_PREFIX` | Wrapper prefix for Bash, hook, status-line and MCP commands | ✅ | ✅ | ⚪ Default | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Possible audit wrapper; the managed audit hook is the chosen control. |
| INV-VAR-191 | `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` | Token limit for file reads (default 25,000) | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-192 | `CLAUDE_CODE_GLOB_HIDDEN` | Include or exclude dotfiles in Glob results | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-193 | `CLAUDE_CODE_GLOB_NO_IGNORE` | Make Glob respect .gitignore patterns | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-194 | `CLAUDE_CODE_GLOB_TIMEOUT_SECONDS` | Timeout for Glob file discovery | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-195 | `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` | Read-only tools and subagents run in parallel (default 10) | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-196 | `CLAUDE_CODE_TOOL_MEMORY_LIMIT` | Memory cap for Bash, PowerShell and Monitor commands on Linux | ✅ | ✅ | ⚪ Default | [ENV-013](../03-test-plan/catalog/env.md#env-013) | ⏳ | v2.1.233+. |
| INV-VAR-197 | `CLAUDE_CODE_TOOL_MEMORY_CGROUP_EXCLUDE` | Process kinds excluded from the tool memory cap | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.246+. |
| INV-VAR-198 | `CLAUDE_CODE_USE_POWERSHELL_TOOL` | Enable or disable the PowerShell tool | ✅ | ❓ | ⚪ Default | — | ⏳ | On Linux needs `pwsh` in the image [verify]; off by default. |
| INV-VAR-199 | `CLAUDE_CODE_POWERSHELL_RESPECT_EXECUTION_POLICY` | Respect the Windows PowerShell execution policy | ✅ | ⛔ | ⛔ Unavailable | — | ⏳ | Windows only. |
| INV-VAR-200 | `CLAUDE_CODE_DISABLE_WINDOWS_SHELL_LAUNCHER` | Start PowerShell commands without the cmd.exe launcher | ✅ | ⛔ | ⛔ Unavailable | — | ⏳ | Windows only. v2.1.269+. |
| INV-VAR-201 | `CLAUDE_CODE_GIT_BASH_PATH` | Path to Git Bash on Windows | ✅ | ⛔ | ⛔ Unavailable | — | ⏳ | Windows only. |
| INV-VAR-202 | `USE_BUILTIN_RIPGREP` | Use system rg instead of the bundled one | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-203 | `CLAUDE_CODE_USE_NATIVE_FILE_SEARCH` | Discover commands, agents and styles without ripgrep | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-204 | `CLAUDE_CODE_WEBFETCH_CACHE_TTL_MS` | How long WebFetch caches a response | ✅ | ✅ | ⚪ Default | [NET-006](../03-test-plan/catalog/network.md#net-006) | ⏳ | v2.1.233+. |
| INV-VAR-205 | `CLAUDE_CODE_WEBFETCH_DEADLINE_MS` | Maximum WebFetch download time | ✅ | ✅ | ⚪ Default | [NET-006](../03-test-plan/catalog/network.md#net-006) | ⏳ | v2.1.268+. |
| INV-VAR-206 | `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` | Session cap on WebSearch calls (default 200) | ❓ | ✅ | ⚪ Default | [NET-007](../03-test-plan/catalog/network.md#net-007) | ⏳ | v2.1.212+. Moot: WebSearch denied (ADR-016). Takes positive numbers only; 0 is ignored, so it can't turn WebSearch off. |
| INV-VAR-207 | `CLAUDE_CODE_WEB_SEARCH_REFILLS_PER_HOUR` | Refill rate for the WebSearch limit | ❓ | ✅ | ⚪ Default | [NET-007](../03-test-plan/catalog/network.md#net-007) | ⏳ | v2.1.290+. Moot: WebSearch denied (ADR-016). |
| INV-VAR-208 | `CLAUDE_CODE_BASH_EDIT_DIFF` | Record which files changed while a Bash command ran | ✅ | ✅ | ⚪ Default | [OPS-005](../03-test-plan/catalog/operations.md#ops-005) | ⏳ | v2.1.269+. |
| INV-VAR-209 | `TASK_MAX_OUTPUT_LENGTH` | Former limit on background task output | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.277; no-op. |

## Network, proxy & TLS
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-210 | `HTTPS_PROXY` | HTTPS proxy for Claude Code traffic | ✅ | ✅ | 🟡 Restrict | [NET-005](../03-test-plan/catalog/network.md#net-005), [NET-012](../03-test-plan/catalog/network.md#net-012), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `<corp-proxy-url>` (CTL-05) [verify] vs image-level setting. Firewall is the hard control. |
| INV-VAR-211 | `HTTP_PROXY` | HTTP proxy for Claude Code traffic | ✅ | ✅ | 🟡 Restrict | [NET-005](../03-test-plan/catalog/network.md#net-005), [NET-012](../03-test-plan/catalog/network.md#net-012), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `<corp-proxy-url>`. |
| INV-VAR-212 | `https_proxy` | Lowercase HTTPS proxy; read before HTTPS_PROXY | ✅ | ✅ | 🟡 Restrict | [NET-005](../03-test-plan/catalog/network.md#net-005), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Source: network-config. Read first, so set in managed env with the same value as `HTTPS_PROXY`. |
| INV-VAR-213 | `http_proxy` | Lowercase HTTP proxy | ✅ | ✅ | 🟡 Restrict | [NET-005](../03-test-plan/catalog/network.md#net-005), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Source: network-config. Order: `https_proxy`, `HTTPS_PROXY`, `http_proxy`, `HTTP_PROXY`. Set in managed env. |
| INV-VAR-214 | `NO_PROXY` | Hosts and IPs that bypass the proxy | ✅ | ✅ | 🟡 Restrict | [NET-005](../03-test-plan/catalog/network.md#net-005) | ⏳ | Set in managed env: `<internal-hosts>`. Space- or comma-separated. |
| INV-VAR-215 | `NODE_EXTRA_CA_CERTS` | Extra CA bundle to trust, such as a TLS-inspection root | ✅ | ✅ | 🟡 Restrict | [NET-005](../03-test-plan/catalog/network.md#net-005) | ⏳ | Source: network-config. Set in managed env or image: `<corp-ca-path>`. Also trusts an OTLP collector over HTTP. |
| INV-VAR-216 | `NODE_TLS_REJECT_UNAUTHORIZED` | Node.js switch that can turn off TLS verification | ✅ | ✅ | 🔴 Block | [NET-005](../03-test-plan/catalog/network.md#net-005) | ⏳ | Source: network-config (named as ignored in cloud sessions). Must never be `0`; set in managed env: `1` [verify]. |
| INV-VAR-217 | `CLAUDE_CODE_CERT_STORE` | CA sources to trust: bundled, system, or both | ✅ | ✅ | ⚪ Default | [NET-005](../03-test-plan/catalog/network.md#net-005) | ⏳ | Default `bundled,system`. |
| INV-VAR-218 | `CLAUDE_CODE_CLIENT_CERT` | Client certificate path for mTLS | ✅ | ✅ | ⚪ Default | [NET-011](../03-test-plan/catalog/network.md#net-011) | ⏳ | Only if mTLS is required. |
| INV-VAR-219 | `CLAUDE_CODE_CLIENT_KEY` | Client private key path for mTLS | ✅ | ✅ | ⚪ Default | [NET-011](../03-test-plan/catalog/network.md#net-011), [IDN-008](../03-test-plan/catalog/identity.md#idn-008) | ⏳ | Key file must be denied to Claude's tools. |
| INV-VAR-220 | `CLAUDE_CODE_CLIENT_KEY_PASSPHRASE` | Passphrase for an encrypted mTLS key | ✅ | ✅ | ⚪ Default | [NET-011](../03-test-plan/catalog/network.md#net-011) | ⏳ | Avoid a plaintext value in settings files. |
| INV-VAR-221 | `CLAUDE_CODE_DISABLE_MTLS_RELOAD_ON_STALE_CONNECTION` | Don't reload rotated mTLS files after connection errors | ✅ | ✅ | ⚪ Default | [NET-011](../03-test-plan/catalog/network.md#net-011) | ⏳ | v2.1.232+. |
| INV-VAR-222 | `CLAUDE_CODE_PROXY_RESOLVES_HOSTS` | Let the proxy perform DNS resolution | ✅ | ✅ | ⚪ Default | [NET-008](../03-test-plan/catalog/network.md#net-008) | ⏳ | Evaluate with the DNS exfiltration test. |
| INV-VAR-223 | `CLAUDE_CODE_GZIP_REQUEST_BODIES` | Turn off gzip of request bodies sent to api.anthropic.com | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Affects only `api.anthropic.com` traffic. |

## Telemetry & OpenTelemetry
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-224 | `CLAUDE_CODE_ENABLE_TELEMETRY` | Enable OpenTelemetry metrics and logs export | ✅ | ✅ | 🟡 Restrict | [TEL-001](../03-test-plan/catalog/telemetry.md#tel-001), [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `1`. Ignored in project and local settings. |
| INV-VAR-225 | `OTEL_METRICS_EXPORTER` | Metrics exporter: otlp, prometheus, console or none | ✅ | ✅ | 🟡 Restrict | [TEL-001](../03-test-plan/catalog/telemetry.md#tel-001), [TEL-002](../03-test-plan/catalog/telemetry.md#tel-002), [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Set in managed env: `otlp`. Source: monitoring-usage. Selectors follow per-key precedence, so lock them here. |
| INV-VAR-226 | `OTEL_LOGS_EXPORTER` | Logs and events exporter: otlp, console or none | ✅ | ✅ | 🟡 Restrict | [TEL-001](../03-test-plan/catalog/telemetry.md#tel-001), [TEL-003](../03-test-plan/catalog/telemetry.md#tel-003), [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Set in managed env: `otlp`. Source: monitoring-usage. A repo can set `none` unless managed sets it. |
| INV-VAR-227 | `OTEL_TRACES_EXPORTER` | Traces exporter (beta): otlp, console or none | ✅ | ✅ | 🟡 Restrict | [TEL-010](../03-test-plan/catalog/telemetry.md#tel-010) | ⏳ | Set in managed env: `none` until TEL-010 adopts tracing, then `otlp`. Source: monitoring-usage. |
| INV-VAR-228 | `OTEL_EXPORTER_OTLP_PROTOCOL` | OTLP protocol for all signals | ✅ | ✅ | 🟡 Restrict | [TEL-001](../03-test-plan/catalog/telemetry.md#tel-001) | ⏳ | Set in managed env: `grpc` or `http/protobuf` to match the collector; no default. Source: monitoring-usage. |
| INV-VAR-229 | `OTEL_EXPORTER_OTLP_ENDPOINT` | Collector endpoint for all signals | ✅ | ✅ | 🟡 Restrict | [TEL-001](../03-test-plan/catalog/telemetry.md#tel-001), [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Set in managed env: `<collector-url>`. Removes developer per-signal endpoints (v2.1.217+). Source: monitoring-usage. |
| INV-VAR-230 | `OTEL_EXPORTER_OTLP_HEADERS` | Authentication headers for the collector | ✅ | ✅ | 🟡 Restrict | [TEL-001](../03-test-plan/catalog/telemetry.md#tel-001), [EXT-015](../03-test-plan/catalog/extensions.md#ext-015) | ⏳ | Set in managed env: `<collector-auth>`, or a managed `otelHeadersHelper`. Source: monitoring-usage. |
| INV-VAR-231 | `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL` | Metrics-only OTLP protocol override | ✅ | ✅ | 🟡 Restrict | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Not set; a developer value is removed when managed sets the generic protocol. Source: monitoring-usage. |
| INV-VAR-232 | `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` | Metrics-only OTLP endpoint override | ✅ | ✅ | 🟡 Restrict | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Not set; a developer value is removed when managed sets the generic endpoint. Source: monitoring-usage. |
| INV-VAR-233 | `OTEL_EXPORTER_OTLP_METRICS_HEADERS` | Metrics-only headers, merged with the generic headers | ✅ | ✅ | 🟡 Restrict | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Not set; a developer value is removed when managed sets the generic headers. Source: monitoring-usage. |
| INV-VAR-234 | `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL` | Logs-only OTLP protocol override | ✅ | ✅ | 🟡 Restrict | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Not set; a developer value is removed when managed sets the generic protocol. Source: monitoring-usage. |
| INV-VAR-235 | `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` | Logs-only OTLP endpoint override | ✅ | ✅ | 🟡 Restrict | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Not set; a developer value is removed when managed sets the generic endpoint. Source: monitoring-usage. |
| INV-VAR-236 | `OTEL_EXPORTER_OTLP_LOGS_HEADERS` | Logs-only headers, merged with the generic headers | ✅ | ✅ | 🟡 Restrict | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Not set; a developer value is removed when managed sets the generic headers. Source: monitoring-usage. |
| INV-VAR-237 | `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` | Traces-only OTLP protocol override (beta) | ✅ | ✅ | 🟡 Restrict | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Not set; a developer value is removed when managed sets the generic protocol. Source: monitoring-usage. |
| INV-VAR-238 | `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | Traces-only OTLP endpoint override (beta) | ✅ | ✅ | 🟡 Restrict | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Not set; a developer value is removed when managed sets the generic endpoint. Source: monitoring-usage. |
| INV-VAR-239 | `OTEL_EXPORTER_OTLP_TRACES_HEADERS` | Traces-only headers, merged with the generic headers (beta) | ✅ | ✅ | 🟡 Restrict | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Not set; a developer value is removed when managed sets the generic headers. Source: monitoring-usage. |
| INV-VAR-240 | `OTEL_METRIC_EXPORT_INTERVAL` | Metrics export interval (default 60000 ms) | ✅ | ✅ | 🟡 Restrict | [TEL-007](../03-test-plan/catalog/telemetry.md#tel-007) | ⏳ | Set in managed env: `60000`. Applies from project settings unless managed sets it. Source: monitoring-usage. |
| INV-VAR-241 | `OTEL_LOGS_EXPORT_INTERVAL` | Logs export interval (default 5000 ms) | ✅ | ✅ | 🟡 Restrict | [TEL-007](../03-test-plan/catalog/telemetry.md#tel-007) | ⏳ | Set in managed env: `5000`. Source: monitoring-usage. |
| INV-VAR-242 | `OTEL_TRACES_EXPORT_INTERVAL` | Span batch export interval (default 5000 ms) | ✅ | ✅ | ⚪ Default | [TEL-010](../03-test-plan/catalog/telemetry.md#tel-010) | ⏳ | Source: monitoring-usage. |
| INV-VAR-243 | `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` | Delta or cumulative metrics temporality | ✅ | ✅ | 🟡 Restrict | [TEL-007](../03-test-plan/catalog/telemetry.md#tel-007) | ⏳ | Set in managed env to match the backend (default `delta`). Source: monitoring-usage. |
| INV-VAR-244 | `OTEL_EXPORTER_OTLP_CLIENT_KEY` | gRPC mTLS client key for the collector | ✅ | ✅ | ⚪ Default | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Only if the collector needs mTLS; a managed value also strips developer endpoints. Source: monitoring-usage. |
| INV-VAR-245 | `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE` | gRPC mTLS client certificate for the collector | ✅ | ✅ | ⚪ Default | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Only if the collector needs mTLS. Source: monitoring-usage. |
| INV-VAR-246 | `OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY` | Metrics-only gRPC mTLS client key | ✅ | ✅ | ⚪ Default | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005) | ⏳ | Named as an example per-signal variant; others follow the OTel spec [verify]. Source: monitoring-usage. |
| INV-VAR-247 | `OTEL_EXPORTER_OTLP_CERTIFICATE` | CA used to trust the collector over gRPC | ✅ | ✅ | ⚪ Default | [NET-005](../03-test-plan/catalog/network.md#net-005) | ⏳ | HTTP protocols use `NODE_EXTRA_CA_CERTS`. Source: monitoring-usage. |
| INV-VAR-248 | `OTEL_RESOURCE_ATTRIBUTES` | Custom resource attributes such as team, cohort and user | ✅ | ✅ | 🟡 Restrict | [TEL-004](../03-test-plan/catalog/telemetry.md#tel-004), [TEL-006](../03-test-plan/catalog/telemetry.md#tel-006) | ⏳ | Set in managed env: `team.id=<team>,cohort=<cohort>`; per-user `enduser.id` delivery [verify]. Source: monitoring-usage. |
| INV-VAR-249 | `OTEL_METRICS_INCLUDE_SESSION_ID` | Include session.id on metrics (default on) | ✅ | ✅ | ⚪ Default | [TEL-004](../03-test-plan/catalog/telemetry.md#tel-004) | ⏳ |  |
| INV-VAR-250 | `OTEL_METRICS_INCLUDE_VERSION` | Include app.version on metrics (default off) | ✅ | ✅ | ⚪ Default | [OPS-001](../03-test-plan/catalog/operations.md#ops-001) | ⏳ | Consider `true` to track version drift. |
| INV-VAR-251 | `OTEL_METRICS_INCLUDE_ACCOUNT_UUID` | Include account UUID on metrics (default on) | ✅ | ✅ | ⚪ Default | — | ⏳ | No Claude account on Foundry, so not populated. |
| INV-VAR-252 | `OTEL_METRICS_INCLUDE_ENTRYPOINT` | Include app.entrypoint on metrics (default off) | ✅ | ✅ | ⚪ Default | [TEL-012](../03-test-plan/catalog/telemetry.md#tel-012) | ⏳ | v2.1.152+. |
| INV-VAR-253 | `OTEL_METRICS_INCLUDE_RESOURCE_ATTRIBUTES` | Copy resource attributes onto metric labels (default on) | ✅ | ✅ | ⚪ Default | [TEL-004](../03-test-plan/catalog/telemetry.md#tel-004) | ⏳ | Keep on for team and cohort breakdowns. |
| INV-VAR-254 | `OTEL_METRICS_INCLUDE_REPOSITORY` | Tag metrics and events with vcs.* repository attributes | ✅ | ✅ | ⚪ Default | [TEL-012](../03-test-plan/catalog/telemetry.md#tel-012) | ⏳ | v2.1.269+. Consider `true`. |
| INV-VAR-255 | `OTEL_LOG_USER_PROMPTS` | Include user prompt text in logs and traces | ✅ | ✅ | 🔴 Block | [DATA-004](../03-test-plan/catalog/data.md#data-004), [TEL-008](../03-test-plan/catalog/telemetry.md#tel-008) | ⏳ | Kept off in managed env (`0`). Project and local settings can only turn it off. |
| INV-VAR-256 | `OTEL_LOG_ASSISTANT_RESPONSES` | Include model response text on assistant_response events | ✅ | ✅ | 🔴 Block | [DATA-004](../03-test-plan/catalog/data.md#data-004), [TEL-008](../03-test-plan/catalog/telemetry.md#tel-008) | ⏳ | Kept off in managed env (`0`); unset, it follows `OTEL_LOG_USER_PROMPTS`. v2.1.193+. |
| INV-VAR-257 | `OTEL_LOG_TOOL_DETAILS` | Include tool arguments, MCP and skill names, raw errors | ✅ | ✅ | 🔴 Block | [DATA-004](../03-test-plan/catalog/data.md#data-004), [TEL-008](../03-test-plan/catalog/telemetry.md#tel-008) | ⏳ | Kept off in managed env (`0`). |
| INV-VAR-258 | `OTEL_LOG_TOOL_CONTENT` | Include tool output in tool.output span events | ✅ | ✅ | 🔴 Block | [DATA-004](../03-test-plan/catalog/data.md#data-004), [TEL-008](../03-test-plan/catalog/telemetry.md#tel-008) | ⏳ | Kept off in managed env (`0`). Needs tracing. |
| INV-VAR-259 | `OTEL_LOG_RAW_API_BODIES` | Emit full API request and response bodies as log events | ✅ | ✅ | 🔴 Block | [DATA-004](../03-test-plan/catalog/data.md#data-004), [TEL-008](../03-test-plan/catalog/telemetry.md#tel-008) | ⏳ | Kept off in managed env (`0`). `file:<dir>` also writes bodies to disk. |
| INV-VAR-260 | `OTEL_LOG_MANAGED_SETTINGS` | Add redacted managed settings and a digest to events | ✅ | ✅ | 🟡 Restrict | [POL-003](../03-test-plan/catalog/policy.md#pol-003), [TEL-003](../03-test-plan/catalog/telemetry.md#tel-003) | ⏳ | Proposed: set in managed env: `1` as per-session policy evidence. v2.1.274+. |
| INV-VAR-261 | `CLAUDE_CODE_OTEL_CONTENT_MAX_LENGTH` | Maximum length of content-bearing telemetry attributes | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.214+. Content flags are off. |
| INV-VAR-262 | `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT` | OTel SDK limit on attribute value length | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.214+. |
| INV-VAR-263 | `OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT` | Log-record attribute length limit variant | ✅ | ✅ | ⚪ Default | — | ⏳ | Named in the `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT` row; smallest set value applies. |
| INV-VAR-264 | `OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT` | Span attribute length limit variant | ✅ | ✅ | ⚪ Default | — | ⏳ | Named in the `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT` row. |
| INV-VAR-265 | `CLAUDE_CODE_OTEL_DIAG_STDERR` | Print OTel exporter errors to stderr | ✅ | ✅ | ⚪ Default | [TEL-001](../03-test-plan/catalog/telemetry.md#tel-001) | ⏳ | v2.1.179+. Useful while debugging the collector. |
| INV-VAR-266 | `CLAUDE_CODE_OTEL_FLUSH_TIMEOUT_MS` | Timeout for flushing pending spans (default 5000) | ✅ | ✅ | ⚪ Default | [TEL-009](../03-test-plan/catalog/telemetry.md#tel-009) | ⏳ |  |
| INV-VAR-267 | `CLAUDE_CODE_OTEL_SHUTDOWN_TIMEOUT_MS` | Exporter shutdown timeout (default 2000) | ✅ | ✅ | ⚪ Default | [TEL-009](../03-test-plan/catalog/telemetry.md#tel-009) | ⏳ | Raise if metrics drop at exit. |
| INV-VAR-268 | `CLAUDE_CODE_OTEL_HEADERS_HELPER_DEBOUNCE_MS` | Refresh interval for otelHeadersHelper headers | ✅ | ✅ | ⚪ Default | [EXT-015](../03-test-plan/catalog/extensions.md#ext-015) | ⏳ |  |
| INV-VAR-269 | `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA` | Enable span tracing (beta) | ✅ | ✅ | ⚪ Default | [TEL-010](../03-test-plan/catalog/telemetry.md#tel-010) | ⏳ | Source: monitoring-usage. Decide in TEL-010. |
| INV-VAR-270 | `ENABLE_ENHANCED_TELEMETRY_BETA` | Accepted alias of CLAUDE_CODE_ENHANCED_TELEMETRY_BETA | ✅ | ✅ | ⚪ Default | [TEL-010](../03-test-plan/catalog/telemetry.md#tel-010) | ⏳ | Source: monitoring-usage. |
| INV-VAR-271 | `ENABLE_BETA_TRACING_DETAILED` | Detailed beta tracing with content-bearing span attributes | ❓ | ✅ | 🔴 Block | [DATA-004](../03-test-plan/catalog/data.md#data-004), [TEL-010](../03-test-plan/catalog/telemetry.md#tel-010) | ⏳ | Carries prompts and output; keep `0` in managed env. Needs org beta allowlist [verify] on Foundry. |
| INV-VAR-272 | `BETA_TRACING_ENDPOINT` | OTLP endpoint for detailed beta tracing | ❓ | ✅ | 🔴 Block | [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005), [DATA-004](../03-test-plan/catalog/data.md#data-004) | ⏳ | Developer value removed when managed settings pin the collector (v2.1.251+). Ignored in project and local settings. [verify] beta on Foundry. |
| INV-VAR-273 | `CLAUDE_CODE_PROPAGATE_TRACEPARENT` | Propagate W3C trace context through a custom proxy | ❓ | ✅ | ⚪ Default | [TEL-010](../03-test-plan/catalog/telemetry.md#tel-010) | ⏳ | For `ANTHROPIC_BASE_URL` proxies. v2.1.152+. [verify] effect on Foundry. |
| INV-VAR-274 | `TRACEPARENT` | W3C trace context: set in subprocesses; read inbound in -p and SDK | ✅ | ✅ | ⚪ Default | [TEL-010](../03-test-plan/catalog/telemetry.md#tel-010), [SURF-005](../03-test-plan/catalog/surfaces.md#surf-005) | ⏳ | Source: monitoring-usage. Interactive sessions ignore an inbound value. |
| INV-VAR-275 | `TRACESTATE` | Inbound W3C trace state for -p and SDK sessions | ✅ | ✅ | ⚪ Default | [TEL-010](../03-test-plan/catalog/telemetry.md#tel-010) | ⏳ | Source: monitoring-usage. |
| INV-VAR-276 | `CLAUDE_CODE_ENABLE_FEEDBACK_SURVEY_FOR_OTEL` | Send session survey ratings only to the org collector | ✅ | ✅ | ⚪ Default | [TEL-003](../03-test-plan/catalog/telemetry.md#tel-003) | ⏳ | Option for productivity measurement; nothing goes to Anthropic. |

## Privacy & nonessential traffic
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-277 | `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Turn off updates, telemetry, error reports, feedback, release notes, flag fetch | ✅ | ✅ | 🟡 Restrict | [NET-003](../03-test-plan/catalog/network.md#net-003), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `1`. Any non-empty value disables, even `0`. Doesn't cover official marketplace auto-install. |
| INV-VAR-278 | `DISABLE_TELEMETRY` | Opt out of Anthropic operational telemetry | ✅ | ✅ | 🟡 Restrict | [NET-003](../03-test-plan/catalog/network.md#net-003) | ⏳ | Set in managed env: `1` (policy v0.2). Also stops the pre-sign-in startup events when gateway sign-in is forced (ADR-013). Non-empty value = on. |
| INV-VAR-279 | `DO_NOT_TRACK` | Cross-tool telemetry opt-out, same as DISABLE_TELEMETRY | ✅ | ✅ | ⚪ Default | [NET-003](../03-test-plan/catalog/network.md#net-003) | ⏳ | Standard boolean; `0` leaves telemetry on. |
| INV-VAR-280 | `DISABLE_ERROR_REPORTING` | Opt out of error reporting | ✅ | ✅ | 🟡 Restrict | [DATA-008](../03-test-plan/catalog/data.md#data-008), [NET-003](../03-test-plan/catalog/network.md#net-003), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `1`. Non-empty value = on, even `0`. |
| INV-VAR-281 | `DISABLE_GROWTHBOOK` | Turn off feature-flag fetching | ✅ | ✅ | ⚪ Default | [NET-003](../03-test-plan/catalog/network.md#net-003) | ⏳ | Fetching is already skipped on Foundry. |
| INV-VAR-282 | `DISABLE_FEEDBACK_COMMAND` | Disable /feedback, /bug, /share and Claude-drafted feedback | ✅ | ✅ | 🟡 Restrict | [DATA-007](../03-test-plan/catalog/data.md#data-007), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `1`. |
| INV-VAR-283 | `DISABLE_BUG_COMMAND` | Older name for DISABLE_FEEDBACK_COMMAND | ✅ | ✅ | ⚪ Default | [DATA-007](../03-test-plan/catalog/data.md#data-007) | ⏳ | Legacy alias named in the `DISABLE_FEEDBACK_COMMAND` row; use the new name. |
| INV-VAR-284 | `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY` | Turn off the session quality survey | ✅ | ✅ | ⚪ Default | [DATA-007](../03-test-plan/catalog/data.md#data-007) | ⏳ | Already off through the nonessential-traffic switch. |
| INV-VAR-285 | `CLAUDE_CODE_SEND_FEEDBACK` | Turn Claude-drafted feedback off or on | ⛔ | ✅ | ⛔ Unavailable | [DATA-007](../03-test-plan/catalog/data.md#data-007) | ⏳ | Needs a fetched flag; also off through `DISABLE_FEEDBACK_COMMAND`. |
| INV-VAR-286 | `IS_DEMO` | Hide email and org name; skip onboarding | ✅ | ✅ | 🟢 Allow | — | ⏳ | Any non-empty value turns it on, even `0`. |
| INV-VAR-287 | `CLAUDE_CODE_HIDE_CWD` | Hide the working directory in the startup logo | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |

## Feature disable switches
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-288 | `CLAUDE_CODE_DISABLE_ADVISOR_TOOL` | Turn off the advisor tool and /advisor | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Advisor needs feature-flag fetching. |
| INV-VAR-289 | `CLAUDE_CODE_DISABLE_AGENT_VIEW` | Turn off background agents and agent view | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Same as `disableAgentView`. |
| INV-VAR-290 | `CLAUDE_CODE_DISABLE_ATTACHMENTS` | Send @ file mentions as plain text | ✅ | ✅ | ⚪ Default | [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ | Ignored in project and local settings. |
| INV-VAR-291 | `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Turn auto memory off (1) or force it on (0) | ✅ | ✅ | ⚪ Default | [DATA-010](../03-test-plan/catalog/data.md#data-010), [FEAT-005](../03-test-plan/catalog/features.md#feat-005) | ⏳ | `0` overrides `autoMemoryEnabled: false`; if DATA-010 turns memory off, also set `1` in managed env. |
| INV-VAR-292 | `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | Turn off all background task features | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ |  |
| INV-VAR-293 | `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` | Remove bundled skills and workflows | ✅ | ✅ | ⚪ Default | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Bundled skills are allowed by policy. |
| INV-VAR-294 | `CLAUDE_CODE_DISABLE_CLAUDE_MDS` | Load no CLAUDE.md memory files | ✅ | ✅ | ⚪ Default | [FEAT-004](../03-test-plan/catalog/features.md#feat-004) | ⏳ |  |
| INV-VAR-295 | `CLAUDE_CODE_DISABLE_CRON` | Turn off scheduled tasks and /loop | ✅ | ✅ | 🟡 Restrict | [FEAT-021](../03-test-plan/catalog/features.md#feat-021), [COST-016](../03-test-plan/catalog/cost.md#cost-016) | ⏳ | Set in managed env: `1` (CTL-28): no unattended `/loop` or scheduled tasks. FEAT-021 is exercised in a test profile before the lock. |
| INV-VAR-296 | `CLAUDE_CODE_DISABLE_EXPLORE_PLAN_AGENTS` | Turn off the built-in Explore and Plan subagents | ✅ | ✅ | ⚪ Default | [FEAT-007](../03-test-plan/catalog/features.md#feat-007) | ⏳ | v2.1.198+. |
| INV-VAR-297 | `CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING` | Turn off file checkpoints used by /rewind | ✅ | ✅ | ⚪ Default | [FEAT-003](../03-test-plan/catalog/features.md#feat-003) | ⏳ |  |
| INV-VAR-298 | `CLAUDE_CODE_DISABLE_FILE_MENTIONS` | Pass @ paths for Claude to read instead of expanding them | ✅ | ✅ | ⚪ Default | [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ | v2.1.299+. Ignored in project and local settings. |
| INV-VAR-299 | `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS` | Remove built-in commit and PR instructions and git snapshot | ✅ | ✅ | ⚪ Default | [FEAT-015](../03-test-plan/catalog/features.md#feat-015) | ⏳ |  |
| INV-VAR-300 | `CLAUDE_CODE_DISABLE_POLICY_SKILLS` | Skip skills from the managed skills directory | ✅ | ✅ | ⚪ Default | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Managed skills are guidance, not controls. |
| INV-VAR-301 | `CLAUDE_CODE_DISABLE_WEB_FETCH` | Turn off the WebFetch tool | ✅ | ✅ | 🟡 Restrict | [NET-006](../03-test-plan/catalog/network.md#net-006), [PERM-014](../03-test-plan/catalog/permissions.md#perm-014) | ⏳ | v2.1.285+. Set in managed env: `1` (ADR-016, pending confirmation). Doesn't affect WebSearch, which has its own managed deny. |
| INV-VAR-302 | `CLAUDE_CODE_DISABLE_WORKFLOWS` | Turn off workflows | ✅ | ✅ | ⚪ Default | — | ⏳ | Same as `disableWorkflows`. |
| INV-VAR-303 | `DISABLE_AUTO_COMPACT` | Turn off automatic and idle compaction | ✅ | ✅ | ⚪ Default | [FEAT-006](../03-test-plan/catalog/features.md#feat-006) | ⏳ | /compact still works. |
| INV-VAR-304 | `DISABLE_COMPACT` | Turn off all compaction, including /compact | ✅ | ✅ | ⚪ Default | [FEAT-006](../03-test-plan/catalog/features.md#feat-006) | ⏳ |  |
| INV-VAR-305 | `DISABLE_COST_WARNINGS` | Turn off cost warning messages | ✅ | ✅ | ⚪ Default | [COST-012](../03-test-plan/catalog/cost.md#cost-012) | ⏳ |  |
| INV-VAR-306 | `DISABLE_DOCTOR_COMMAND` | Hide the /doctor checkup skill | ✅ | ✅ | ⚪ Default | [ENV-014](../03-test-plan/catalog/env.md#env-014), [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | `claude doctor` is unaffected. |
| INV-VAR-307 | `DISABLE_INSTALL_GITHUB_APP_COMMAND` | Hide /install-github-app | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Already hidden on Foundry. |

## claude.ai and feature-flag features
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-308 | `CCR_FORCE_BUNDLE` | Make `claude --cloud` upload the local repo instead of cloning | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Cloud sessions need claude.ai. |
| INV-VAR-309 | `CLAUDE_REMOTE_CONTROL_SESSION_NAME_PREFIX` | Prefix for auto-named Remote Control sessions | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Remote Control needs claude.ai. |
| INV-VAR-310 | `CLAUDE_CLIENT_PRESENCE_FILE` | File that pauses Remote Control mobile pushes while you're present | ⛔ | ⛔ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | v2.1.181+. |
| INV-VAR-311 | `CLAUDE_CODE_DISABLE_ARTIFACT` | Turn off the Artifact tool (claude.ai web pages) | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Artifacts need claude.ai. Optional backstop: `1` in managed env. |
| INV-VAR-312 | `CLAUDE_CODE_ARTIFACT_AUTO_OPEN` | Stop opening a browser for new artifacts | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Artifacts need claude.ai. |
| INV-VAR-313 | `CLAUDE_CODE_ARTIFACT_COMMENTS` | Stop Claude reading and replying to artifact comments | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | v2.1.221+. |
| INV-VAR-314 | `CLAUDE_CODE_ARTIFACT_COMMENTS_AUTOREACT` | Stop Claude replying to artifact comments on its own | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | v2.1.228+. |
| INV-VAR-315 | `CLAUDE_CODE_ARTIFACT_PUBLISH_EDITS` | Stop applying small edits during artifact publish | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | v2.1.300+. |
| INV-VAR-316 | `CLAUDE_CODE_SYNC_SKILLS` | Download claude.ai account skills before the first -p query | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Needs claude.ai authentication. |
| INV-VAR-317 | `CLAUDE_CODE_SYNC_SKILLS_INSTALL_TIMEOUT_MS` | Timeout for mid-session skills resync in SDK apps | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Synced skills need claude.ai. |
| INV-VAR-318 | `CLAUDE_CODE_SYNC_SKILLS_WAIT_TIMEOUT_MS` | First-query wait for the synced skill list | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Synced skills need claude.ai. |
| INV-VAR-319 | `CLAUDE_CODE_DISABLE_FAST_MODE` | Turn off fast mode | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Fast mode needs claude.ai. |
| INV-VAR-320 | `CLAUDE_CODE_SKIP_FAST_MODE_NETWORK_ERRORS` | Treat a failed fast mode check as available | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Fast mode needs claude.ai. |
| INV-VAR-321 | `CLAUDE_CODE_SKIP_FAST_MODE_ORG_CHECK` | Skip the client-side fast mode availability check | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Fast mode needs claude.ai. |
| INV-VAR-322 | `CLAUDE_CODE_ENABLE_OPUS_4_7_FAST_MODE` | Former fast mode switch for Opus 4.7 | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.142. |
| INV-VAR-323 | `CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE` | Former pin of fast mode to Opus 4.6 | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.160; no-op. |
| INV-VAR-324 | `DISABLE_EXTRA_USAGE_COMMAND` | Hide /usage-credits | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Usage credits need claude.ai. |
| INV-VAR-325 | `DISABLE_UPGRADE_COMMAND` | Hide /upgrade | ❓ | ✅ | ⛔ Unavailable | — | ⏳ | Plan upgrade is a claude.ai feature [verify] already hidden on Foundry. |
| INV-VAR-326 | `CLAUDE_CODE_YOU_SHOULD_KNOW_DEBUG` | Show the last checks of the You should know mod | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | The mod needs feature-flag fetching. v2.1.287+. |

## MCP
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-327 | `ENABLE_CLAUDEAI_MCP_SERVERS` | Fetch MCP connectors from claude.ai | ⛔ | ✅ | 🟡 Restrict | [EXT-011](../03-test-plan/catalog/extensions.md#ext-011), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `false`. |
| INV-VAR-328 | `ENABLE_TOOL_SEARCH` | Defer or preload MCP tool definitions | ❓ | ✅ | ⚪ Default | — | ⏳ | No MCP servers at start. Some deployments always preload [verify] Foundry. |
| INV-VAR-329 | `MAX_MCP_OUTPUT_TOKENS` | Maximum tokens in an MCP tool response (default 25000) | ✅ | ✅ | ⚪ Default | — | ⏳ | No MCP servers at start. |
| INV-VAR-330 | `MCP_CLIENT_SECRET` | OAuth client secret for MCP servers with preset credentials | ✅ | ✅ | ⚪ Default | [EXT-012](../03-test-plan/catalog/extensions.md#ext-012) | ⏳ | No MCP servers at start; a secret in env reaches subprocesses unless scrubbed. |
| INV-VAR-331 | `MCP_OAUTH_CALLBACK_PORT` | Fixed port for the MCP OAuth redirect | ✅ | ❓ | ⚪ Default | [EXT-012](../03-test-plan/catalog/extensions.md#ext-012) | ⏳ | OAuth redirect from a headless container [verify]. |
| INV-VAR-332 | `MCP_CONNECTION_NONBLOCKING` | Wait (0) or don't wait for MCP servers at startup | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-333 | `MCP_CONNECT_TIMEOUT_MS` | Blocking MCP startup wait (default 5000) | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-334 | `MCP_TIMEOUT` | MCP server startup timeout (default 30000) | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-335 | `MCP_TOOL_TIMEOUT` | MCP tool execution timeout | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-336 | `MCP_DISCOVERY_CACHE` | Turn the MCP discovery cache on or off | ✅ | ✅ | ⚪ Default | — | ⏳ | Off by default since v2.1.238. |
| INV-VAR-337 | `MCP_DISCOVERY_CACHE_MAX_STALE_S` | Maximum age of a discovery-cache entry | ✅ | ✅ | ⚪ Default | — | ⏳ | Capped at 7 days. |
| INV-VAR-338 | `MCP_DISCOVERY_CACHE_STRIKES` | Failed refreshes before a cache entry is discarded | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.238+. |
| INV-VAR-339 | `MCP_DISCOVERY_CACHE_TTL_S` | Seconds a cache entry is used without refresh | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-340 | `MCP_PROTOCOL_NEGOTIATION` | Probe servers for the newer MCP protocol revision | ✅ | ✅ | ⚪ Default | — | ⏳ | v2 runtime only. v2.1.221+. |
| INV-VAR-341 | `MCP_REMOTE_SERVER_CONNECTION_BATCH_SIZE` | Remote MCP servers connected in parallel (default 20) | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-342 | `MCP_SERVER_CONNECTION_BATCH_SIZE` | Local stdio MCP servers connected in parallel (default 3) | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-343 | `MCP_SDK_GENERATION` | Pin the MCP client runtime (v1 or v2) | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.218+. |
| INV-VAR-344 | `CLAUDE_CODE_MCP_ALLOWLIST_ENV` | Start stdio MCP servers with a minimal environment | ✅ | ✅ | ⚪ Default | [EXT-012](../03-test-plan/catalog/extensions.md#ext-012), [IDN-008](../03-test-plan/catalog/identity.md#idn-008) | ⏳ | Revisit (propose `1`) if any MCP server is approved. |
| INV-VAR-345 | `CLAUDE_CODE_MCP_AUTO_BACKGROUND_MS` | Time before a running MCP call moves to the background | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.212+. |
| INV-VAR-346 | `CLAUDE_CODE_MCP_STARTUP_WAIT_MS` | First-turn wait for connecting MCP servers in -p | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.274+. |
| INV-VAR-347 | `CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT` | Abort MCP calls with no response or progress this long | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.187+. |
| INV-VAR-348 | `CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH` | Maximum MCP tool description length sent to the model | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.280+. |
| INV-VAR-349 | `CLAUDE_AGENT_SDK_MCP_NO_PREFIX` | Drop the mcp__server__ prefix on SDK-created MCP tools | ✅ | ✅ | ⚪ Default | [SURF-006](../03-test-plan/catalog/surfaces.md#surf-006) | ⏳ | SDK only. |

## Plugins, skills, hooks & mods
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-350 | `CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL` | Skip automatic registration of the official plugin marketplace | ✅ | ✅ | 🟡 Restrict | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003), [NET-003](../03-test-plan/catalog/network.md#net-003) | ⏳ | Proposed: set in managed env: `1` before first launch; not covered by the nonessential-traffic switch. |
| INV-VAR-351 | `CLAUDE_CODE_PLUGIN_DIRS` | Load plugin directories for the session, like --plugin-dir | ✅ | ✅ | 🔴 Block | [EXT-004](../03-test-plan/catalog/extensions.md#ext-004) | ⏳ | Sideload path. Blocked by the managed sideload lockdown (CTL-13) [verify] it covers the variable; managed env `""`. v2.1.280+. |
| INV-VAR-352 | `CLAUDE_CODE_PLUGIN_SEED_DIR` | Read-only pre-populated plugin directories in an image | ✅ | ✅ | 🟡 Restrict | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Reserved for the IT image (none at start); managed marketplace lockdown still applies [verify]. |
| INV-VAR-353 | `CLAUDE_CODE_PLUGIN_CACHE_DIR` | Override the plugins root directory | ✅ | ✅ | ⚪ Default | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Plugins are blocked. |
| INV-VAR-354 | `CLAUDE_CODE_PLUGIN_DIR_WATCH` | Reload a --plugin-dir mod when its files change | ✅ | ✅ | ⚪ Default | [EXT-014](../03-test-plan/catalog/extensions.md#ext-014) | ⏳ | v2.1.287+. |
| INV-VAR-355 | `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS` | Timeout for cloning or refreshing a marketplace | ✅ | ✅ | ⚪ Default | — | ⏳ | Plugins are blocked. |
| INV-VAR-356 | `CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE` | Keep the existing marketplace checkout when refresh fails | ✅ | ✅ | ⚪ Default | — | ⏳ | Plugins are blocked. |
| INV-VAR-357 | `CLAUDE_CODE_PLUGIN_PREFER_HTTPS` | Clone GitHub plugin sources over HTTPS instead of SSH | ✅ | ✅ | ⚪ Default | — | ⏳ | Plugins are blocked. |
| INV-VAR-358 | `CLAUDE_CODE_SYNC_PLUGIN_INSTALL` | Wait for plugin install before the first -p query | ✅ | ✅ | ⚪ Default | — | ⏳ | Plugins are blocked. |
| INV-VAR-359 | `CLAUDE_CODE_SYNC_PLUGIN_INSTALL_TIMEOUT_MS` | Timeout for synchronous plugin install | ✅ | ✅ | ⚪ Default | — | ⏳ | Plugins are blocked. |
| INV-VAR-360 | `CLAUDE_CODE_ENABLE_BACKGROUND_PLUGIN_REFRESH` | Refresh plugin state mid-session after background install | ✅ | ✅ | ⚪ Default | — | ⏳ | Plugins are blocked. |
| INV-VAR-361 | `SLASH_COMMAND_TOOL_CHAR_BUDGET` | Character budget for skill metadata shown to the Skill tool | ✅ | ✅ | ⚪ Default | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Legacy name. |
| INV-VAR-362 | `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` | Times a Stop hook may block turn end (default 8) | ✅ | ✅ | ⚪ Default | [FEAT-019](../03-test-plan/catalog/features.md#feat-019) | ⏳ |  |
| INV-VAR-363 | `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS` | Time budget for SessionEnd hooks | ✅ | ✅ | ⚪ Default | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Raise if the managed audit hook runs on SessionEnd. |
| INV-VAR-364 | `CLAUDE_CODE_DISABLE_PERMISSION_PROMPT_NOTIFY_HOOKS` | Skip Notification hooks for SDK-hosted permission prompts | ✅ | ✅ | ⚪ Default | — | ⏳ | No effect in terminal sessions. v2.1.233+. |

## Permissions & safety
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-365 | `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` | Strip credentials from Bash, hook and MCP subprocess environments | ✅ | ✅ | 🟡 Restrict | [IDN-008](../03-test-plan/catalog/identity.md#idn-008), [SBX-004](../03-test-plan/catalog/sandbox.md#sbx-004) | ⏳ | Proposed: set in managed env: `1`. Leaves GitHub tokens and proxy vars in place. |
| INV-VAR-366 | `CLAUDE_CODE_SCRIPT_CAPS` | Per-session call limits for named scripts (with env scrub) | ✅ | ✅ | ⚪ Default | — | ⏳ | Defense in depth only. |
| INV-VAR-367 | `CLAUDE_CODE_DISABLE_DANGEROUS_RM_TIMEOUT` | Remove the time limit on critical-path removal prompts | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.281+. Launch environment only (ignored in settings `env`). |
| INV-VAR-368 | `CLAUDE_CODE_DISABLE_INLINE_SHELL_RM_PROMPT` | Stop scanning `bash -c` scripts for critical-path removals | ✅ | ✅ | ⚪ Default | [SBX-003](../03-test-plan/catalog/sandbox.md#sbx-003) | ⏳ | Weakens a check; can't be locked in managed env (ignored there). Sandbox is the control. v2.1.288+. |
| INV-VAR-369 | `CLAUDE_CODE_DISABLE_SUBSTITUTION_RM_PROMPT` | Skip the check for `rm -rf` on command-substitution targets | ✅ | ✅ | ⚪ Default | [SBX-003](../03-test-plan/catalog/sandbox.md#sbx-003) | ⏳ | Weakens a check; can't be locked in managed env. v2.1.281+. |
| INV-VAR-370 | `CLAUDE_CODE_DISABLE_POWERSHELL_CMD_RM_DENY` | Allow cmd rd, del and erase on system paths in PowerShell | ✅ | ⛔ | ⛔ Unavailable | — | ⏳ | Windows only. Ignored in settings `env`. v2.1.283+. |
| INV-VAR-371 | `CLAUDE_CODE_RESTRICTED` | Start the session in restricted mode (--restricted) | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.248+. Ignored in settings `env`. |
| INV-VAR-372 | `CLAUDE_CODE_ENABLE_AUTO_MODE` | Former opt-in for auto mode on third-party providers | ✅ | ✅ | ⛔ Unavailable | [POL-016](../03-test-plan/catalog/policy.md#pol-016) | ⏳ | No effect; auto mode is available by default (decision pending, POL-016). |
| INV-VAR-373 | `CLAUDE_CODE_AUTO_MODE_SERVER` | Use server-side or local classifier for auto mode | ❓ | ✅ | ⚪ Default | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011), [POL-016](../03-test-plan/catalog/policy.md#pol-016) | ⏳ | v2.1.271+. [verify] on Foundry. |
| INV-VAR-374 | `CLAUDE_CODE_DISABLE_ADMIN_ENV_UNION` | Use only the top managed source's env block | ✅ | ✅ | ⚪ Default | [POL-009](../03-test-plan/catalog/policy.md#pol-009) | ⏳ | One managed file in design. Launch environment only. v2.1.223+. |
| INV-VAR-375 | `CLAUDE_AFK_TIMEOUT_MS` | Auto-continue an unanswered AskUserQuestion after idle time | ✅ | ✅ | ⚪ Default | — | ⏳ | For demos and tests; turns auto-continue on. Ignored in project and local settings. v2.1.198+. |
| INV-VAR-376 | `CLAUDE_AFK_COUNTDOWN_MS` | When the AskUserQuestion auto-continue countdown appears | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.198+. |
| INV-VAR-377 | `CLAUDE_CODE_USER_DIALOG_TIMEOUT_MS` | Deadline for dialogs forwarded to remote or SDK clients | ✅ | ✅ | ⚪ Default | — | ⏳ | Ignored in project and local settings. |
| INV-VAR-378 | `CLAUDE_CODE_PERFORCE_MODE` | Refuse edits to read-only Perforce files | ✅ | ✅ | ⚪ Default | — | ⏳ | Not applicable (GitHub). |

## Updates & install
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-379 | `DISABLE_AUTOUPDATER` | Turn off automatic background updates | ✅ | ✅ | 🟡 Restrict | [ENV-005](../03-test-plan/catalog/env.md#env-005), [POL-012](../03-test-plan/catalog/policy.md#pol-012) | ⏳ | Set in managed env: `1`. |
| INV-VAR-380 | `DISABLE_UPDATES` | Block all updates, including `claude update` and `claude install` | ✅ | ✅ | 🟡 Restrict | [ENV-005](../03-test-plan/catalog/env.md#env-005), [ENV-016](../03-test-plan/catalog/env.md#env-016), [OPS-001](../03-test-plan/catalog/operations.md#ops-001) | ⏳ | Set in managed env: `1` (ADR-014). The version comes from the IT-built image, sourced from Nexus. |
| INV-VAR-381 | `CLAUDE_CODE_PACKAGE_MANAGER_AUTO_UPDATE` | Let Claude Code run Homebrew or WinGet upgrades | ✅ | ⛔ | ⛔ Unavailable | — | ⏳ | Homebrew and WinGet installs only; not used in the image. |
| INV-VAR-382 | `DISABLE_INSTALLATION_CHECKS` | Turn off installation warnings | ✅ | ✅ | ⚪ Default | [ENV-014](../03-test-plan/catalog/env.md#env-014) | ⏳ | Can mask install problems. |
| INV-VAR-383 | `FORCE_AUTOUPDATE_PLUGINS` | Auto-update plugins even when the auto-updater is off | ✅ | ✅ | ⚪ Default | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Plugins are blocked. |

## Terminal, UI, IDE & browser
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-384 | `CLAUDE_AX_SCREEN_READER` | Screen-reader friendly output | ✅ | ✅ | 🟢 Allow | — | ⏳ | v2.1.181+. |
| INV-VAR-385 | `CLAUDE_AX_PREPARK_MS` | Screen reader mode: wait before writing a changed line | ✅ | ✅ | 🟢 Allow | — | ⏳ | v2.1.233+. |
| INV-VAR-386 | `CLAUDE_AX_STARTUP_QUIET_MS` | Screen reader mode: hold first render after startup | ✅ | ✅ | 🟢 Allow | — | ⏳ | v2.1.217+. |
| INV-VAR-387 | `CLAUDE_CODE_ACCESSIBILITY` | Keep the native cursor visible for screen magnifiers | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-VAR-388 | `CLAUDE_CODE_ALT_SCREEN_FULL_REPAINT` | Repaint the whole screen each frame in fullscreen mode | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-VAR-389 | `CLAUDE_CODE_BS_AS_CTRL_BACKSPACE` | Read 0x08 as Backspace or Ctrl+Backspace | ✅ | ✅ | 🟢 Allow | — | ⏳ | Useful from Windows terminals on the VDI. |
| INV-VAR-390 | `CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN` | Use the classic renderer instead of fullscreen | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-VAR-391 | `CLAUDE_CODE_NO_FLICKER` | Use fullscreen rendering (research preview) | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-VAR-392 | `CLAUDE_CODE_DISABLE_MOUSE` | Turn off mouse tracking in fullscreen mode | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-VAR-393 | `CLAUDE_CODE_DISABLE_MOUSE_CLICKS` | Keep wheel scrolling but ignore clicks in fullscreen | ✅ | ✅ | 🟢 Allow | — | ⏳ | v2.1.195+. |
| INV-VAR-394 | `CLAUDE_CODE_DISABLE_VIRTUAL_SCROLL` | Render every message instead of virtual scrolling | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-VAR-395 | `CLAUDE_CODE_SCROLL_SPEED` | Mouse wheel scroll multiplier in fullscreen | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-VAR-396 | `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` | Stop terminal title updates and title generation | ✅ | ✅ | 🟢 Allow | — | ⏳ | Also skips one background model request. |
| INV-VAR-397 | `CLAUDE_CODE_FORCE_STRIKETHROUGH` | Force strikethrough rendering on undetected terminals | ✅ | ✅ | 🟢 Allow | — | ⏳ | v2.1.186+. |
| INV-VAR-398 | `CLAUDE_CODE_FORCE_SYNC_OUTPUT` | Force synchronized output on undetected terminals | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-VAR-399 | `CLAUDE_CODE_FORCE_TERMINAL_IMAGES` | Draw mod Image elements on undetected kitty-protocol terminals | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-VAR-400 | `CLAUDE_CODE_NATIVE_CURSOR` | Show the terminal's own cursor at the caret | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-VAR-401 | `CLAUDE_CODE_NONBLOCKING_STDOUT` | Write output through a non-blocking descriptor | ✅ | ✅ | 🟢 Allow | — | ⏳ | v2.1.261+. |
| INV-VAR-402 | `CLAUDE_CODE_SYNTAX_HIGHLIGHT` | Turn off syntax highlighting in diffs | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-VAR-403 | `CLAUDE_CODE_TMUX_TRUECOLOR` | Allow 24-bit color inside tmux | ✅ | ✅ | 🟢 Allow | — | ⏳ | Any non-empty value turns it on, even `0`. |
| INV-VAR-404 | `FORCE_HYPERLINK` | Turn clickable OSC 8 hyperlinks on (1) or off (0) | ✅ | ✅ | 🟢 Allow | — | ⏳ | Read as a number; `false` turns links on. |
| INV-VAR-405 | `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` | Turn prompt suggestions on or off | ✅ | ✅ | 🟢 Allow | — | ⏳ | v2.1.238+. |
| INV-VAR-406 | `CLAUDE_CODE_DISABLE_NOTIFICATION_PRESENCE_CHECK` | Send desktop notifications even while you're active | ✅ | ❓ | ⚪ Default | — | ⏳ | Desktop notifications from a container [verify]. v2.1.193+. |
| INV-VAR-407 | `CLAUDE_CODE_AUTO_CONNECT_IDE` | Force or prevent automatic IDE connection | ✅ | ✅ | 🟢 Allow | [SURF-002](../03-test-plan/catalog/surfaces.md#surf-002) | ⏳ | Read before the `autoConnectIde` setting. |
| INV-VAR-408 | `CLAUDE_CODE_IDE_HOST_OVERRIDE` | Host address used to reach the IDE extension | ✅ | ✅ | ⚪ Default | [SURF-002](../03-test-plan/catalog/surfaces.md#surf-002) | ⏳ |  |
| INV-VAR-409 | `CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL` | Skip automatic IDE extension install | ✅ | ✅ | 🟡 Restrict | [SURF-002](../03-test-plan/catalog/surfaces.md#surf-002) | ⏳ | Proposed: set in managed env: `1`; extension version pinned in the dev container definition (CTL-02). |
| INV-VAR-410 | `CLAUDE_CODE_IDE_SKIP_VALID_CHECK` | Skip IDE lockfile validation when connecting | ✅ | ✅ | ⚪ Default | [SURF-002](../03-test-plan/catalog/surfaces.md#surf-002) | ⏳ |  |
| INV-VAR-411 | `CLAUDE_CODE_ENABLE_CFC` | Start with Claude in Chrome integration on or off | ❓ | ⛔ | 🔴 Block | [SURF-010](../03-test-plan/catalog/surfaces.md#surf-010) | ⏳ | Set in managed env: `0`, plus `claudeInChromeDefaultEnabled: false`. Project settings can't set `1`. [verify] Chrome needs claude.ai sign-in. |
| INV-VAR-412 | `CLAUDE_CODE_DISABLE_CFC_PROMPT` | Keep Chrome tools but omit their prompt section and skill | ❓ | ⛔ | ⛔ Unavailable | [SURF-010](../03-test-plan/catalog/surfaces.md#surf-010) | ⏳ | No Chrome in the headless container. v2.1.257+. [verify] Foundry. |

## Debug & development
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-413 | `DEBUG` | Turn on debug mode (same as --debug) | ✅ | ✅ | 🟢 Allow | [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | Only `1`, `true`, `yes`, `on` enable it. |
| INV-VAR-414 | `CLAUDE_CODE_DEBUG_LOGS_DIR` | Debug log file path (a file, not a directory) | ✅ | ✅ | 🟢 Allow | [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | Doesn't enable logging by itself. |
| INV-VAR-415 | `CLAUDE_CODE_DEBUG_LOG_LEVEL` | Minimum debug log level | ✅ | ✅ | 🟢 Allow | [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | `verbose` adds high-volume diagnostics. |
| INV-VAR-416 | `CLAUDE_CODE_SAFE_MODE` | Start without user customizations for troubleshooting | ✅ | ✅ | 🟢 Allow | — | ⏳ | Managed policy, including policy hooks, still applies. |
| INV-VAR-417 | `CLAUDE_CODE_SIMPLE` | Minimal prompt with Bash, read and edit tools only (--bare) | ❓ | ✅ | ⚪ Default | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Skips hook auto-discovery; [verify] the managed audit hook and Foundry auth still work. |

## Set by Claude Code
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-418 | `CLAUDECODE` | Set to 1 in subprocesses and IDE terminals Claude Code starts | ✅ | ✅ | ⚪ Default | — | ⏳ | Read-only marker. |
| INV-VAR-419 | `CLAUDE_CODE_CHILD_SESSION` | Set to 1 in tool, hook and status-line subprocesses | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.172+. Nested sessions are excluded from resume. |
| INV-VAR-420 | `CLAUDE_CODE_SESSION_ID` | Current session ID in tool, hook and MCP subprocesses | ✅ | ✅ | ⚪ Default | [OPS-005](../03-test-plan/catalog/operations.md#ops-005) | ⏳ | Use to correlate audit-hook logs with OTel. |
| INV-VAR-421 | `CLAUDE_EFFORT` | Effort level in effect, set in Bash and hook subprocesses | ✅ | ✅ | ⚪ Default | — | ⏳ |  |
| INV-VAR-422 | `CLAUDE_PID` | Claude Code process ID in tool and hook subprocesses | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.214+. |
| INV-VAR-423 | `CLAUDE_JOB_DIR` | Background session's job directory | ✅ | ✅ | ⚪ Default | — | ⏳ | Write and Edit there don't prompt for permission. |
| INV-VAR-424 | `CLAUDE_CODE_MESSAGING_SOCKET` | Inbox socket path for cross-session messaging | ✅ | ✅ | ⚪ Default | [SBX-013](../03-test-plan/catalog/sandbox.md#sbx-013) | ⏳ | Settings `env` can't set it. v2.1.224+. |
| INV-VAR-425 | `CLAUDE_CODE_MESSAGING_TOKEN` | Per-session token for the messaging socket | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.228+. |
| INV-VAR-426 | `CLAUDE_CODE_BRIDGE_SESSION_ID` | Remote Control session ID in Bash and hook subprocesses | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Remote Control needs claude.ai. |
| INV-VAR-427 | `CLAUDE_CODE_REMOTE` | Set to true in cloud sessions | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Cloud sessions need claude.ai. |
| INV-VAR-428 | `CLAUDE_CODE_REMOTE_SESSION_ID` | Session ID in cloud sessions | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Cloud sessions need claude.ai. |

## Other
| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-VAR-429 | `CLAUDE_CONFIG_DIR` | Override the configuration directory (default ~/.claude) | ✅ | ✅ | ⚪ Default | [ENV-012](../03-test-plan/catalog/env.md#env-012), [DATA-003](../03-test-plan/catalog/data.md#data-003) | ⏳ | Keep default (persistent volume). Ignored in project and local settings. Managed settings path unaffected. |
| INV-VAR-430 | `CLAUDE_CODE_TMPDIR` | Override the internal temp directory | ✅ | ✅ | ⚪ Default | [SBX-003](../03-test-plan/catalog/sandbox.md#sbx-003) | ⏳ | Ignored in project and local settings. |
| INV-VAR-431 | `CLAUDE_CODE_PROCESS_WRAPPER` | Launch background processes through a corporate launcher | ✅ | ✅ | ⚪ Default | — | ⏳ | Not used in the container design. User or managed settings only. v2.1.208+. |

## Coverage summary

| Policy | Count |
|---|---|
| 🟢 Allow | 30 |
| 🟡 Restrict | 55 |
| 🔴 Block | 19 |
| ⚪ Default | 231 |
| ⛔ Unavailable | 96 |
| **Total** | **431** |

| Result | Count |
|---|---|
| ⏳ Not run | 431 |
| 🟩 Pass | 0 |
| 🟨 Issue | 0 |
| 🟥 Blocker | 0 |
| ⏭ N/A | 0 |

## Related

- [Feature inventory index](README.md): the other inventory pages (settings, CLI, slash commands, tools, surfaces)
- Catalog tests most referenced here: [policy.md](../03-test-plan/catalog/policy.md), [telemetry.md](../03-test-plan/catalog/telemetry.md), [network.md](../03-test-plan/catalog/network.md), [identity.md](../03-test-plan/catalog/identity.md), [cost.md](../03-test-plan/catalog/cost.md)
- [Environment variables](https://code.claude.com/docs/en/env-vars) (primary source)
- [Variables Claude Code ignores in `env`](https://code.claude.com/docs/en/settings-reference#variables-claude-code-ignores-in-env)
- [Monitoring](https://code.claude.com/docs/en/monitoring-usage) · [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry) · [Model configuration](https://code.claude.com/docs/en/model-config) · [Network configuration](https://code.claude.com/docs/en/network-config)
- [Managed settings](https://code.claude.com/docs/en/managed-settings) (how the managed `env` block is delivered)
