---
title: Identity and access
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: "1-2"
---

# Identity and access

[🏠 Home](../../README.md) › Architecture › Identity and access

This page covers who and what authenticates to which system, with what rights, and how credentials are kept away from the agent. The principle throughout is **least privilege**: each identity gets only what its job needs, and Claude Code's own tools can't read the credentials. **Entra ID is the only way to reach the models. There is no shared key** ([ADR-006](../../logs/decision-log.md#adr-006)).

## Contents
- [Identity map](#identity-map)
- [No keys: Entra ID only](#no-keys-entra-id-only)
- [Microsoft Foundry access](#microsoft-foundry-access)
- [Stage 1: direct Foundry sign-in](#stage-1-direct-foundry-sign-in)
- [Stage 2: Claude apps gateway sign-in](#stage-2-claude-apps-gateway-sign-in)
- [GitHub access (single repository)](#github-access-single-repository)
- [Nexus access](#nexus-access)
- [Protecting credentials from the agent](#protecting-credentials-from-the-agent)
- [Evaluator identities](#evaluator-identities)
- [Lifecycle: onboarding, rotation, offboarding](#lifecycle-onboarding-rotation-offboarding)

## Identity map

| Identity | Used by | Authenticates to | Rights | Lifetime | Stage |
|---|---|---|---|---|---|
| **Developer AD account** (synced to Entra) | The developer | BeyondTrust → isolated VDI | Member of the pilot AD security group, mapped to the BeyondTrust resource group | Company account | Both |
| **Developer Entra ID account** | Claude Code (`DefaultAzureCredential`), `az` | Microsoft Foundry | Custom role: invoke Claude deployments only | Access token ≈1 h, refreshed by the credential chain | 1 |
| **Developer Entra ID account** | Browser sign-in for `/login` | Claude apps gateway (OIDC) | Gateway access and a policy by Entra group. **No** Foundry role. | Gateway session `ttl_hours` (1 h), refreshed silently | 2 |
| **Gateway session token** | Claude Code in the container | Claude apps gateway | Inference for the models the user's group allows, within their spend caps | 1 h | 2 |
| **Gateway managed identity** | The gateway | Microsoft Foundry | Custom role (or `Cognitive Services User`) on the Foundry resource only | Platform-managed | 2 |
| **Gateway app registration** (confidential client) | The gateway | Entra ID | Sign users in. Client secret or certificate in the gateway's secret store. | Rotated on a schedule | 2 |
| **Gateway admin API keys** (`write_keys`, `read_keys`) | Spend-limit automation, reporting | Gateway admin API | Set and read spend caps | Rotated on a schedule | 2 |
| **Developer GitHub fine-grained PAT** *or* **GitHub App user token** | `git`, `gh` in the container | `<org>/<repo>` only | Contents: read/write · Pull requests: read/write · Metadata: read. Nothing else. | «30–90 days» (PAT) / ≈8 h (App user token) | Both |
| **Nexus read access** | pip, Maven, Gradle, NuGet in the container | Nexus | Read only. Anonymous read, or a read-only token masked from the agent. | — | Both |
| **Foundry API key** | — | — | **None. API-key auth is disabled on the resource.** | — | — |
| **Evaluator GitHub token** | Evaluation lead's metric pulls | GitHub org (read-only) | Read PRs, commits, checks across pilot repos | Phase 2 only. Never placed in a dev container. | Both |
| **Evaluator Azure reader** | Cost analysis | Azure Cost Management, Monitor | Cost Management Reader, Log Analytics Reader | Evaluation only | Both |
| **CI identity** (if [SURF-005](../03-test-plan/catalog/surfaces.md#surf-005) proceeds) | GitHub Actions | Foundry directly, via an Azure OIDC federated credential | Same custom role, scoped to a CI deployment | Per job | Both. The gateway has no service-token flow for CI. |

## No keys: Entra ID only

| Rule | How | Test |
|---|---|---|
| API-key auth is off on the Foundry resource | Set `disableLocalAuth: true` on the resource. Enforce it with Azure Policy (the built-in policy that requires Cognitive Services accounts to disable local authentication). Confirm it applies to Claude deployments [verify]. | [IDN-002](../03-test-plan/catalog/identity.md#idn-002) |
| No key variables in policy | `ANTHROPIC_FOUNDRY_API_KEY` is never set. `apiKeyHelper` is managed-only ([CTL-15](../02-security-baseline/defense-in-depth.md#ctl-15)). | [EXT-015](../03-test-plan/catalog/extensions.md#ext-015) |
| Access through a group | The pilot AD security group (synced to Entra) is the unit of access. Stage 1: the group holds the Foundry role. Stage 2: the group is assigned to the gateway's app registration, and only the gateway's managed identity holds the Foundry role. | [IDN-004](../03-test-plan/catalog/identity.md#idn-004), [IDN-015](../03-test-plan/catalog/identity.md#idn-015) |

## Microsoft Foundry access

Claude Code supports three Foundry authentication methods ([Foundry docs](https://code.claude.com/docs/en/microsoft-foundry)). We use only Entra ID:

| Method | Configuration | Least-privilege assessment | Per-user audit | Our use | Test |
|---|---|---|---|---|---|
| **Microsoft Entra ID** | Leave `ANTHROPIC_FOUNDRY_API_KEY` and `ANTHROPIC_FOUNDRY_AUTH_TOKEN` unset. Claude Code uses the Azure SDK `DefaultAzureCredential` chain (for example, `az login --use-device-code` in the container). | ✅ Per-user identity, RBAC-scoped, revocable centrally, no shared secret | ✅ Caller identity in Azure logs | ✅ Stage 1 developers; the gateway's managed identity in stage 2 | [IDN-001](../03-test-plan/catalog/identity.md#idn-001) |
| **API key** | `ANTHROPIC_FOUNDRY_API_KEY` | ❌ Resource-wide shared secret. Usage can't be tied to a person. Rotation affects everyone. | ❌ | ❌ **Disabled** on the resource | [IDN-002](../03-test-plan/catalog/identity.md#idn-002) |
| **Bearer token** | `ANTHROPIC_FOUNDRY_AUTH_TOKEN` (takes precedence over the others) | ✅ Short-lived. An external process can mint it. | ✅ | Only if CI needs it | [IDN-003](../03-test-plan/catalog/identity.md#idn-003) |

**Stage 1 configuration** (set in managed `env`; see [managed-settings.md](../02-security-baseline/managed-settings.md)). In stage 2 these move into the gateway's `models:` mapping and come out of the file.

```bash
CLAUDE_CODE_USE_FOUNDRY=1
ANTHROPIC_FOUNDRY_RESOURCE=<foundry-resource>          # resource name only, not a URL
ANTHROPIC_DEFAULT_OPUS_MODEL=<opus-deployment-name>     # pin! without it, "opus" → Opus 4.6 on Foundry
ANTHROPIC_DEFAULT_SONNET_MODEL=<sonnet-deployment-name>
ANTHROPIC_DEFAULT_HAIKU_MODEL=<haiku-deployment-name>   # else background tasks use the primary model
```

**RBAC.** The built-in `Azure AI User` or `Cognitive Services User` roles work, but they're broader than needed. Use a **custom role** limited to data actions ([Foundry docs](https://code.claude.com/docs/en/microsoft-foundry#azure-rbac-configuration)), scoped to the Foundry resource only:

```json
{
  "Name": "Claude Code Foundry Invoker",
  "Description": "Invoke Claude model deployments only. No management plane.",
  "Actions": [],
  "DataActions": ["Microsoft.CognitiveServices/accounts/providers/*"],
  "AssignableScopes": ["/subscriptions/<subscription-id>/resourceGroups/<rg>/providers/Microsoft.CognitiveServices/accounts/<foundry-resource>"]
}
```

Stage 1: assign it to the pilot group (`grp-claude-code-pilot`, synced from AD). Group membership is the on/off switch for each developer ([OPS-003](../03-test-plan/catalog/operations.md#ops-003)). Stage 2: assign it to the gateway's managed identity only, and remove the group's assignment ([IDN-015](../03-test-plan/catalog/identity.md#idn-015)).

> [!TIP]
> Enable diagnostic settings on the Foundry resource and send request logs to Log Analytics. In stage 1 that gives a per-caller audit trail independent of Claude Code's own telemetry ([IDN-005](../03-test-plan/catalog/identity.md#idn-005)). In stage 2 every call comes from the gateway's identity, so per-user attribution comes from the gateway instead ([TEL-013](../03-test-plan/catalog/telemetry.md#tel-013), [TEL-014](../03-test-plan/catalog/telemetry.md#tel-014)).

## Stage 1: direct Foundry sign-in

1. The developer runs `az login --use-device-code` inside the container and approves the sign-in in the browser on the VDI.
2. The Azure CLI stores the token cache in `~/.azure`. Claude Code picks it up through `DefaultAzureCredential`.
3. Claude Code calls the Foundry private endpoint with the developer's own Entra token.

| Risk | Protection | Test |
|---|---|---|
| The agent reads the token cache | `Read(~/.azure/**)` deny + sandbox `denyRead` + credential masking | [IDN-008](../03-test-plan/catalog/identity.md#idn-008), [SBX-004](../03-test-plan/catalog/sandbox.md#sbx-004) |
| A stolen refresh token is used elsewhere | Conditional Access for the Azure CLI and Foundry sign-ins: require a compliant device or the company network (named location), and a sign-in frequency of 8–12 hours [verify] | [IDN-009](../03-test-plan/catalog/identity.md#idn-009) |
| A token outlives the person's access | Removing the user from the group stops new tokens. Existing access tokens last up to about an hour. | [IDN-011](../03-test-plan/catalog/identity.md#idn-011) |

## Stage 2: Claude apps gateway sign-in

The gateway holds the only Foundry credential. Developers sign in with their Entra account and receive a short-lived gateway token ([gateway docs](https://code.claude.com/docs/en/claude-apps-gateway), [deployment docs](https://code.claude.com/docs/en/claude-apps-gateway-deploy)).

| Item | Design | Test |
|---|---|---|
| Entra app registration | Confidential web app. Single redirect URI `https://<claude-gateway>.<internal-domain>/oauth/callback`. "Assignment required" on, assigned to the pilot group. Allow `offline_access` so sessions refresh silently. | [IDN-014](../03-test-plan/catalog/identity.md#idn-014) |
| Issuer | `https://login.microsoftonline.com/<tenant-id>/v2.0` | [IDN-014](../03-test-plan/catalog/identity.md#idn-014) |
| Groups | Entra emits group **object IDs**, not names. Use the GUIDs in `managed.policies[].match.groups`, or use App Roles for readable names (`oidc.groups_claim: roles`). | [IDN-014](../03-test-plan/catalog/identity.md#idn-014) |
| Gateway → Foundry | `provider: foundry` with `auth: { use_azure_ad: true }`: the gateway's managed identity, holding the custom role on the Foundry resource only | [IDN-015](../03-test-plan/catalog/identity.md#idn-015) |
| Sign-in on the developer side | Managed settings force `/login` to the gateway (`forceLoginMethod: "gateway"`, `forceLoginGatewayUrl`). Device flow: the CLI shows a code; the developer approves it in the browser. Claude Code only accepts a gateway on a private address and pins its TLS certificate on first connect. | [IDN-014](../03-test-plan/catalog/identity.md#idn-014) |
| What the container holds | The gateway session token only. No Azure CLI, no `~/.azure` cache, no Foundry endpoint in the allowlist. | [IDN-014](../03-test-plan/catalog/identity.md#idn-014), [IDN-008](../03-test-plan/catalog/identity.md#idn-008) |
| Session lifetime | `session.ttl_hours: 1`. Group changes take effect on the next refresh. | [IDN-009](../03-test-plan/catalog/identity.md#idn-009) |

An excerpt of the identity parts of `gateway.yaml` (the key names follow the [configuration reference](https://code.claude.com/docs/en/claude-apps-gateway-config); confirm `client_id`/`client_secret` and `allowed_groups` against it [verify]):

```yaml
oidc:
  issuer: https://login.microsoftonline.com/<tenant-id>/v2.0
  client_id: <app-client-id>
  client_secret: ${OIDC_CLIENT_SECRET}
  groups_claim: groups              # or "roles" with App Roles
  allowed_groups: [<pilot-group-object-id>]
upstreams:
  - provider: foundry
    resource: <foundry-resource>
    auth: { use_azure_ad: true }    # managed identity
models:
  - id: <opus-model-id>
    upstream_model:
      foundry: <opus-deployment-name>
session:
  jwt_secret: ${SESSION_JWT_SECRET}
  ttl_hours: 1
```

> [!IMPORTANT]
> **How access ends in stage 2.** Disabling or removing a user in Entra ends their gateway session within `ttl_hours` (one hour), when the next refresh fails. For an **instant** per-user block, set that user's spend cap to `"0"` through the admin API: the gateway checks caps on every request ([COST-015](../03-test-plan/catalog/cost.md#cost-015)). There's no per-session revocation. Rotating the JWT secret without keeping the old one logs **everyone** out.

## GitHub access (single repository)

Each developer reaches **exactly one** repository. That limits the blast radius and closes off github.com as a general exfiltration path ([R-06](../../logs/risk-register.md#r-06)).

| Control | Setting | Test |
|---|---|---|
| Token scope | Fine-grained PAT with **Repository access: Only select repositories → `<org>/<repo>`**, or a GitHub App installed on that repo only | [IDN-006](../03-test-plan/catalog/identity.md#idn-006) |
| Token permissions | Contents R/W, Pull requests R/W, Metadata R. **No** Actions, Workflows, Secrets, Administration, or Members. | [IDN-010](../03-test-plan/catalog/identity.md#idn-010) |
| Branch protection / rulesets | `main` requires a PR plus ≥1 human review. No force-push. No deletion. Status checks required. | [IDN-007](../03-test-plan/catalog/identity.md#idn-007) |
| Workflow files | Changes under `.github/workflows/` need CODEOWNERS review. Claude Code is also denied edits there ([PERM-003](../03-test-plan/catalog/permissions.md#perm-003)). | [PERM-003](../03-test-plan/catalog/permissions.md#perm-003) |
| Gists / other repos | The token can't create gists or reach other repos. Confirm with a negative test. | [NET-009](../03-test-plan/catalog/network.md#net-009) |
| Org policy | Fine-grained PAT approval required. Maximum lifetime enforced. | [IDN-011](../03-test-plan/catalog/identity.md#idn-011) |
| Commit attribution | Claude Code's `attribution` setting adds a `Co-Authored-By` trailer, so assisted commits can be measured | [FEAT-015](../03-test-plan/catalog/features.md#feat-015) |
| CI | GitHub Actions calls Foundry directly with its own federated identity. The gateway's sign-in is a browser device flow, so it can't serve unattended jobs. | [SURF-005](../03-test-plan/catalog/surfaces.md#surf-005) |
| Evaluation records | The repo the agent can reach must **not** hold the evaluation's tracker data, evidence, or private notes ([R-27](../../logs/risk-register.md#r-27)) | [DATA-013](../03-test-plan/catalog/data.md#data-013) |

> [!NOTE]
> No SSH keys go into the container. Git uses HTTPS with the scoped token through a credential helper (for example, `gh auth git-credential`).

## Nexus access

| Rule | Why | Test |
|---|---|---|
| Container access is read-only: anonymous read on the proxy and group repositories, or a read-only token masked from the agent | A publish right would turn `twine upload`, `mvn deploy`, or `dotnet nuget push` into an exfiltration channel | [IDN-016](../03-test-plan/catalog/identity.md#idn-016) |
| The Claude Code package is readable only by the image-build account | Developers can't install another Claude Code version ([ADR-014](../../logs/decision-log.md#adr-014)) | [ENV-016](../03-test-plan/catalog/env.md#env-016) |
| Publish rights exist only for the build pipeline, outside any developer container | Supply chain integrity ([R-26](../../logs/risk-register.md#r-26)) | [IDN-016](../03-test-plan/catalog/identity.md#idn-016) |

## Protecting credentials from the agent

Developers' tools (`git`, `gh`, `az` in stage 1) need credentials. Claude Code's tools (Read, Bash) must not be able to read them. Three layers do this:

| Layer | Mechanism | Covers | Test |
|---|---|---|---|
| Permission deny rules | `Read(~/.azure/**)`, `Read(~/.config/gh/**)`, `Read(~/.claude/.credentials.json)`, `Read(**/.env*)` and similar | Claude's **Read**/**Edit** tools (not covered by the sandbox) | [PERM-002](../03-test-plan/catalog/permissions.md#perm-002) |
| Sandbox `filesystem.denyRead` + `credentials` masking | Same paths, denied to Bash and its children | `cat`, `python -c open(...)`, and so on | [SBX-004](../03-test-plan/catalog/sandbox.md#sbx-004), [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) |
| Network allowlist | Even if read, a secret can't be sent anywhere except allowlisted hosts | Exfiltration | [NET-002](../03-test-plan/catalog/network.md#net-002) |

Stage 2 shrinks the problem: there is no Azure token in the container at all, only a one-hour gateway token and the GitHub token.

> [!WARNING]
> A git push to the allowed repo is itself an exfiltration channel: secrets could be committed. Mitigations are GitHub secret scanning with push protection on the repo, and the prompt-injection drill ([DATA-005](../03-test-plan/catalog/data.md#data-005)).

Do the sandbox rules still let `git` and `gh` use their credential files when Claude runs `git push` through Bash? This is a known tension. Test it in [IDN-008](../03-test-plan/catalog/identity.md#idn-008) and record the chosen approach, for example a credential helper that sits outside the denied path, or an `ask` rule on `git push` ([PERM-007](../03-test-plan/catalog/permissions.md#perm-007)).

## Evaluator identities

The evaluation lead's broader credentials are **never** placed in a developer container or given to Claude Code:

- **Org-wide GitHub read and the Azure cost reader.** Metric pulls run from the evaluation lead's own workstation. See [github-metrics-queries.md](../06-productivity-quality/github-metrics-queries.md).
- **Gateway admin access.** Humans use an Entra group listed in `admin.admin_groups`, which is audited by user. The spend-notification and runaway-detection automation uses its own `write_keys` entry, and reporting uses a `read_keys` entry, so each appears separately in the audit log ([COST-014](../03-test-plan/catalog/cost.md#cost-014), [COST-015](../03-test-plan/catalog/cost.md#cost-015)).
- **Evaluation records** (tracker data, evidence, private notes) live outside anything the agent under test can reach ([DATA-013](../03-test-plan/catalog/data.md#data-013)).

## Lifecycle: onboarding, rotation, offboarding

| Event | Steps | Target time | Test |
|---|---|---|---|
| **Onboard** | Add to the pilot AD security group (gives BeyondTrust access, the gateway app assignment, and in stage 1 the Foundry role) → issue the scoped GitHub token → developer opens the container → `az login` (stage 1) or `/login` to the gateway (stage 2) → first session. Set a per-user cap only if the group default doesn't fit. | « < 30 min » | [OPS-007](../03-test-plan/catalog/operations.md#ops-007) |
| **Rotate** | GitHub PAT before expiry. Gateway client secret or certificate, and admin API keys, on a schedule. Gateway JWT secret in stages (prepend new → roll → remove old after `ttl_hours`). There is no Foundry key to rotate. | No downtime | [OPS-010](../03-test-plan/catalog/operations.md#ops-010), [OPS-011](../03-test-plan/catalog/operations.md#ops-011) |
| **Offboard** | Remove from the group → in stage 2, set the user's cap to `"0"` for an instant block → revoke the GitHub token → delete the `~/.claude` volume → confirm OTel shows no further activity. Gateway identity rows age out on their retention window, or are deleted on request. | « < 15 min » | [IDN-011](../03-test-plan/catalog/identity.md#idn-011), [OPS-004](../03-test-plan/catalog/operations.md#ops-004) |
| **Kill switch (one user)** | Stage 2: zero cap for that user (instant). Stage 1: remove them from the group (up to about an hour for existing tokens). | Stage 2: « < 5 min » | [COST-015](../03-test-plan/catalog/cost.md#cost-015) |
| **Kill switch (everyone)** | Stage 1: remove the role assignment from the group (or disable the deployment). Stage 2: remove the gateway managed identity's Foundry role, or scale the gateway to zero. An org-wide zero cap only applies to users without their own cap, so don't rely on it alone. All sessions fail on the next request. | « < 15 min » | [OPS-003](../03-test-plan/catalog/operations.md#ops-003) |

## Related
- [Reference architecture](reference-architecture.md) · [Network egress](network-egress.md) · [Threat model](threat-model.md)
- [Identity tests (IDN)](../03-test-plan/catalog/identity.md)
