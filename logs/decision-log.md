---
title: Decision log (ADRs)
status: In review
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
---

# Decision log (ADRs)

[🏠 Home](../README.md) › Logs › Decision log

This page records every architecture and policy decision, with its context and consequences, so the final report can defend each choice. New entries use the [ADR template](../templates/adr.md).

## Index

| ADR | Decision | Status | Date |
|---|---|---|---|
| [ADR-001](#adr-001) | Microsoft Foundry as the model provider | ✅ Accepted | 2026-10-15 |
| [ADR-002](#adr-002) | Claude Code runs in a Linux dev container on the Windows VDI | ✅ Accepted | 2026-10-15 |
| [ADR-003](#adr-003) | One GitHub repository per developer | ✅ Accepted | 2026-10-15 |
| [ADR-004](#adr-004) | Evaluation documentation in a Markdown git repo | ✅ Accepted | 2026-10-15 |
| [ADR-005](#adr-005) | Docker Desktop (Business) on the Hyper-V backend | ✅ Accepted | 2026-10-15 |
| [ADR-006](#adr-006) | Foundry authentication: Entra ID only, API keys disabled | ✅ Accepted | 2026-10-19 |
| [ADR-007](#adr-007) | OpenTelemetry backend | 🟡 Proposed | |
| [ADR-008](#adr-008) | Default permission mode (Manual vs. auto) | 🟡 Proposed | |
| [ADR-009](#adr-009) | Foundry deployment hosting option (Hosted on Azure recommended) | 🟡 Proposed | |
| [ADR-010](#adr-010) | Git credentials vs. sandbox credential protection | 🟡 Proposed | |
| [ADR-011](#adr-011) | Two-phase evaluation with staggered cohorts | ✅ Accepted | 2026-10-15 |
| [ADR-012](#adr-012) | Databricks Unity AI Gateway evaluated and rejected | ✅ Accepted | 2026-10-19 |
| [ADR-013](#adr-013) | Claude apps gateway in front of Foundry (staged) | 🟡 Proposed (recommended) | |
| [ADR-014](#adr-014) | Claude Code distributed only in the IT-built image, sourced from Nexus | ✅ Accepted | 2026-10-19 |
| [ADR-015](#adr-015) | Language packages and VS Code components through Nexus; per-language images | ✅ Accepted | 2026-10-19 |
| [ADR-016](#adr-016) | Web tools disabled (WebSearch; WebFetch pending confirmation) | ✅ Accepted | 2026-10-19 |
| [ADR-017](#adr-017) | .NET / VB.NET capability tiers; Claude Code never runs natively | ✅ Accepted | 2026-10-19 |
| [ADR-018](#adr-018) | Evaluation on VDIs; production target is Docker on users' PCs | ✅ Accepted | 2026-10-19 |
| [ADR-019](#adr-019) | Test tracking with a local tracker and the 🟩🟨🟥 legend | ✅ Accepted | 2026-10-19 |

---

<a id="adr-001"></a>
### ADR-001 · Microsoft Foundry as the model provider

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-15 |
| **Deciders** | Evaluation lead, `<sponsor>` |
| **Related** | R-07, R-13, R-18 · CTL-16, CTL-18 |

**Context.** Claude Code can use the Anthropic API, Claude for Teams/Enterprise, Amazon Bedrock, Google Vertex AI, or Microsoft Foundry ([authentication](https://code.claude.com/docs/en/authentication)). The company's cloud and identity platform is Azure.

**Decision.** Use **Microsoft Foundry**.

**Consequences.**
- ✅ Azure billing, Entra ID and RBAC, data under existing Microsoft agreements, and per-caller Azure logs.
- ⚠️ These are **not available**: server-managed settings, the claude.ai analytics dashboard, contribution metrics, the Claude Code Analytics API, fast mode, `/logout`, claude.ai surfaces (web, mobile, Remote Control, Slack, routines, ultrareview), and the Code Review GitHub app. We must build measurement from OTel + Azure + GitHub ([R-13](risk-register.md)).
- ⚠️ Models **must be pinned** with `ANTHROPIC_DEFAULT_*_MODEL`. Without that, `opus` resolves to an older default ([R-10](risk-register.md)).
- ⚠️ The deployment **hosting option** has to be decided ([ADR-009](#adr-009)).
- ⚠️ ToolSearch isn't supported on Azure-hosted Foundry deployments [verify]. That matters if MCP is enabled later.
- ✅ The GitHub Action supports Foundry (`use_foundry: "true"` with `azure/login`) ([surfaces inventory](../docs/04-feature-inventory/surfaces-and-integrations.md)).
- 2026-10-19: **reconfirmed** after comparing Databricks Unity AI Gateway ([ADR-012](#adr-012)). Per-user caps and governance come from the Claude apps gateway in front of Foundry ([ADR-013](#adr-013)). Web tools are off by decision ([ADR-016](#adr-016)).

<a id="adr-002"></a>
### ADR-002 · Claude Code runs in a Linux dev container on the Windows VDI

| Field | Value |
|---|---|
| **Status** | Accepted (subject to [ENV-001](../docs/03-test-plan/catalog/env.md#env-001) and [ENV-006](../docs/03-test-plan/catalog/env.md#env-006)) |
| **Date** | 2026-10-15 |
| **Related** | R-01, R-02, R-03, R-16 · CTL-01–CTL-04 |

**Context.** Developers work on Windows VDIs. Claude Code's OS sandbox doesn't run on native Windows ([sandboxing](https://code.claude.com/docs/en/sandboxing)).

**Options.**
1. Native Windows install: no sandbox. Rejected.
2. Linux VM directly in Hyper-V: a sandbox and strong isolation, but heavier per-developer VM management.
3. Dev container on Docker Desktop with the WSL 2 backend: gives developers a root-capable WSL distro that sees the Windows filesystem. Ruled out because the company standard is Hyper-V.
4. **Dev container on Docker Desktop with the Hyper-V backend**: sandbox, plus container isolation, plus a firewall, plus a read-only policy mount. WSL stays disabled.

**Decision.** Option 4 (revised 2026-10-15: the company standard is Hyper-V, replacing the earlier WSL 2 assumption).

**Consequences.** Needs nested virtualization so Hyper-V runs on the VDI (ENV-001), and Docker Desktop Business ([ADR-005](#adr-005)). Engine access is a residual trust issue ([R-01](risk-register.md)). The nested bubblewrap sandbox has to be proven (ENV-006).

**Update 2026-10-19.** Claude Code **never** runs natively on Windows, in the evaluation or in production ([ADR-017](#adr-017)). The same images later run on users' PCs ([ADR-018](#adr-018)). Windows-only .NET code is handled by capability tiers, not by running Claude on Windows.

<a id="adr-003"></a>
### ADR-003 · One GitHub repository per developer

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-15 |
| **Related** | R-06 · CTL-17 |

**Context.** Organizational constraint: each developer may access only one repository.

**Decision.** Fine-grained tokens scoped to a single repo, with contents and PR permissions only.

**Consequences.** ✅ Small blast radius, and github.com isn't a general exfiltration path. ⚠️ Repo and developer are confounded in the metrics, which the within-person baseline handles ([measurement framework](../docs/06-productivity-quality/measurement-framework.md#study-design)). ⚠️ The evaluator needs a separate org-read token for metrics.

<a id="adr-004"></a>
### ADR-004 · Evaluation documentation in a Markdown git repo

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-15 |

**Decision.** Keep all plans, tests, evidence pointers, logs, and reports as GitHub-rendered Markdown in this repository, following the [style guide](../templates/README.md).

**Consequences.** Version history and review via PRs. No secrets or real identifiers in the repo. Unredacted evidence goes to the secure store.

**Update 2026-10-19.** Test records (tracker data, evidence, private notes) live **outside anything the agent under test can reach**: not in the single repo Claude Code works on, and not mounted into any container ([ADR-019](#adr-019), [R-27](risk-register.md#r-27), [DATA-013](../docs/03-test-plan/catalog/data.md#data-013)). This docs repo must not be that repo either.

<a id="adr-005"></a>
### ADR-005 · Docker Desktop (Business) on the Hyper-V backend

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-15 |
| **Deciders** | Evaluation lead, per the company virtualization standard (Hyper-V) |
| **Related** | R-01, R-11, R-16 · [ENV-001](../docs/03-test-plan/catalog/env.md#env-001), [ENV-002](../docs/03-test-plan/catalog/env.md#env-002), [ENV-010](../docs/03-test-plan/catalog/env.md#env-010) |

**Context.** The engine must run on the Windows VDI, follow the company's Hyper-V standard, and stop developers from running privileged or unmanaged containers.

**Options considered.**

| Option | Hyper-V backend | Restrict what devs run? | Notes |
|---|---|---|---|
| **Docker Desktop (Business)** | ✅ | Settings Management, Enhanced Container Isolation, Registry/Image Access Management | Best admin controls. Paid per user. |
| Podman Desktop | ✅ (Podman machine on Hyper-V) | Rootless by default, fewer central controls | Dev Containers compatibility to test |
| Rancher Desktop | ❌ (WSL 2 only on Windows) | Limited | Doesn't meet the Hyper-V standard |
| Docker Engine in WSL 2 | ❌ | Weak | Doesn't meet the standard |

**Decision.** Docker Desktop (Business) with the **Hyper-V backend**. The WSL 2 engine is disabled and locked through `admin-settings.json`. Enhanced Container Isolation is on. File sharing is limited to the policy folder, plus `C:\Dev` for Windows-only repos ([ADR-017](#adr-017)). Only the company registry is allowed. Sign-in is enforced ([target configuration](../docs/01-architecture/reference-architecture.md#docker-desktop-configuration-target)).

**Consequences.**
- ✅ No user-accessible Linux distro on the VDI, so WSL can be disabled entirely ([CTL-01](../docs/02-security-baseline/defense-in-depth.md#ctl-01)).
- ✅ Central, locked engine settings reduce [R-01](risk-register.md).
- ⚠️ Licensing cost per developer ([R-11](risk-register.md)).
- ⚠️ Bind mounts from Windows are slower on Hyper-V, so the repo lives in a container volume ([ENV-013](../docs/03-test-plan/catalog/env.md#env-013)).
- ⚠️ The exact Settings Management key names must be confirmed against the deployed version [verify].

**Why the Business tier (added 2026-10-19).** Two separate reasons:

1. **Any paid tier is required by the licence.** Docker Desktop needs a paid, per-user subscription for organizations with more than 250 employees or more than $10 million in annual revenue ([Docker pricing FAQ](https://www.docker.com/pricing/faq/)).
2. **Our security design needs features that only Business includes.** Docker's [pricing page](https://www.docker.com/pricing/) lists these as Business-only, not in Personal, Pro, or Team:

| Business-only feature | What it does for us | Without it | Control / risk / test |
|---|---|---|---|
| **Settings Management** (locked `admin-settings.json`) | Keeps the Hyper-V backend, WSL off, file sharing limited to the policy folder and `C:\Dev`, the daemon not exposed on TCP, and updates controlled. Developers can't change any of it. | A developer can turn WSL back on, share the whole drive, or expose the Docker daemon, which bypasses the container boundary | CTL-03 · R-01 · [ENV-002](../docs/03-test-plan/catalog/env.md#env-002) |
| **Enhanced Container Isolation** | Stops containers from taking over Docker Desktop's VM or the host, blocks `docker.sock` mounts, and runs containers in user namespaces (which may also help the nested Claude Code sandbox) | A privileged or socket-mounting container can escape and reach the host | CTL-03 · R-01, R-16 · [ENV-006](../docs/03-test-plan/catalog/env.md#env-006), [ENV-010](../docs/03-test-plan/catalog/env.md#env-010) |
| **Registry and Image Access Management** | Only images from the company registry (the IT-built image) can be pulled | Developers can run any public image, unscanned | CTL-02 · R-20 · [ENV-003](../docs/03-test-plan/catalog/env.md#env-003) |
| **SSO and SCIM** (with enforced sign-in) | Docker Desktop is tied to the company organization, which is what makes the policies above apply, and offboarding happens in the identity provider | Settings and access rules don't reliably apply; licences aren't tied to people | CTL-03 · [ENV-002](../docs/03-test-plan/catalog/env.md#env-002) |

Settings Management also needs a **verified company domain** in Docker's admin console, and enforced sign-in is recommended so every developer authenticates to the organization ([Settings Management](https://docs.docker.com/enterprise/security/hardened-desktop/settings-management/)). One Business seat per developer who runs Docker Desktop, in the evaluation and later on PCs.

<a id="adr-006"></a>
### ADR-006 · Foundry authentication: Entra ID only, API keys disabled

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-19 |
| **Deciders** | Evaluation lead |
| **Related** | [R-08](risk-register.md#r-08) · [CTL-16](../docs/02-security-baseline/defense-in-depth.md#ctl-16) · [IDN-001](../docs/03-test-plan/catalog/identity.md#idn-001), [IDN-002](../docs/03-test-plan/catalog/identity.md#idn-002), [IDN-014](../docs/03-test-plan/catalog/identity.md#idn-014) |

**Options.** Entra ID via `DefaultAzureCredential` (per user, no shared secret) · API key (resource-wide shared secret, visible to sandboxed processes through the environment) · bearer token (short-lived, needs an external minting process).

**Decision.** **Entra ID only. No shared key for anyone.**
- Set `disableLocalAuth: true` on the Foundry resource and enforce it with Azure Policy, so a key wouldn't work even if one were generated [verify that Claude deployments honor it] ([IDN-002](../docs/03-test-plan/catalog/identity.md#idn-002)).
- Grant access through the AD security group (synced to Entra) with the custom role (data actions only), scoped to the Foundry resource.
- **Direct stage** (Phase 1 start): developers run `az login --use-device-code` in the container; Claude Code uses the Azure SDK default credential chain. The token cache is protected by Read deny and sandbox `denyRead`. Conditional Access (compliant device or named location, sign-in frequency 8–12 hours) limits a stolen token [verify].
- **Gateway stage** ([ADR-013](#adr-013)): developers sign in to the gateway with Entra. Only the gateway's managed identity holds the Foundry role, and the container holds no Azure token ([IDN-014](../docs/03-test-plan/catalog/identity.md#idn-014), [IDN-015](../docs/03-test-plan/catalog/identity.md#idn-015)).
- CI keeps its own Entra identity (OIDC) for GitHub Actions, since the gateway has no service-token flow.

**Consequences.** Per-user identity everywhere, offboarding happens in Entra, and there's no secret to rotate or leak. Also evaluate `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` ([IDN-008](../docs/03-test-plan/catalog/identity.md#idn-008)) [verify].

<a id="adr-007"></a>
### ADR-007 · OpenTelemetry backend

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Related** | R-13 · [TEL-001](../docs/03-test-plan/catalog/telemetry.md#tel-001), [TEL-012](../docs/03-test-plan/catalog/telemetry.md#tel-012) |

**Options.** Azure Monitor / Application Insights (OTLP ingestion [verify]) · Prometheus + Grafana (Anthropic's monitoring-guide stack) · the existing company observability platform (Datadog, Splunk, Elastic, …).

**Recommendation.** Phase 1: the monitoring-guide Docker Compose stack, to prove the data. Phase 2: the company platform, so Security can monitor and the data is retained.

**Decision.** *Pending.*

<a id="adr-008"></a>
### ADR-008 · Default permission mode (Manual vs. auto)

| Field | Value |
|---|---|
| **Status** | Proposed: **Manual (`default`)** to start |
| **Related** | R-17 · [PERM-011](../docs/03-test-plan/catalog/permissions.md#perm-011), [POL-016](../docs/03-test-plan/catalog/policy.md#pol-016) |

**Context.** Since v2.1.283, auto mode (a classifier reviews actions instead of the developer) is the built-in starting mode for interactive sessions, including on Foundry. On v2.1.285+, `-p` runs on third-party providers also start in auto ([permission modes](https://code.claude.com/docs/en/permission-modes)). Auto mode cuts prompt fatigue, but replaces a human checkpoint with a model judgment.

**Options.** (1) Managed `defaultMode: "default"`, with auto available on request. (2) Disable auto entirely. (3) Auto as the default, with a managed `autoMode.environment` description.

**Recommendation.** Option 1 for Phase 2 weeks 1–4. Revisit at G2 using PERM-011's decision-quality data and friction survey results.

**Decision.** *Pending PERM-011.*

<a id="adr-009"></a>
### ADR-009 · Foundry deployment hosting option

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Related** | R-07 · [DATA-001](../docs/03-test-plan/catalog/data.md#data-001), [DATA-002](../docs/03-test-plan/catalog/data.md#data-002) |

**Context.** When a Claude deployment is created, Foundry offers hosting options that determine whether inference runs on Azure or on Anthropic infrastructure ([Foundry docs](https://code.claude.com/docs/en/microsoft-foundry)).

**Recommendation (2026-10-19).** **Hosted on Azure**, with **US Data Zone** deployments where the model allows it. With Hosted on Azure, prompts and completions stay in Azure; only usage metadata and content flagged by Anthropic's safety systems go to Anthropic ([Claude in Microsoft Foundry](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry)). Fable models are only available Hosted on Anthropic, so they're out of scope unless Security approves. Azure-hosted deployments lack some API features (code execution, newer web tools, tool search); Claude Code adapts automatically.

**Decision.** *Security and Legal to decide, based on the [data-handling questions](../docs/02-security-baseline/data-handling.md#model-provider-microsoft-foundry).*

<a id="adr-010"></a>
### ADR-010 · Git credentials vs. sandbox credential protection

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Related** | R-08 · [IDN-008](../docs/03-test-plan/catalog/identity.md#idn-008), [SBX-009](../docs/03-test-plan/catalog/sandbox.md#sbx-009) |

**Context.** Denying `~/.config/gh` to sandboxed Bash protects the token, but may break `git push` when Claude runs it.

**Options.**
1. The developer pushes manually. `!git push` runs outside Claude's sandbox, as the developer's own command.
2. A credential helper outside the denied path, accepting that sandboxed processes can use (not read) the credential.
3. Sandbox credential masking, if it keeps git working.

**Decision.** *Pending IDN-008 / SBX-009.*

<a id="adr-011"></a>
### ADR-011 · Two-phase evaluation with staggered cohorts

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-15 |
| **Related** | R-14 |

**Decision.** Phase 1: the evaluation lead alone (configuration and security). Phase 2: 15–20 developers in two randomized, staggered cohorts (B starts 3 weeks after A), plus within-person baselines and counterbalanced benchmark tasks.

**Consequences.** A concurrent comparison window without denying anyone the tool for long. Results reported as effect sizes with confidence intervals, given the small sample.

<a id="adr-012"></a>
### ADR-012 · Databricks Unity AI Gateway evaluated and rejected

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-19 |
| **Deciders** | Evaluation lead |
| **Related** | [ADR-001](#adr-001), [ADR-013](#adr-013) · [R-20](risk-register.md#r-20), [R-04](risk-register.md#r-04) |

**Context.** The original network plan routed Claude Code through **Azure Databricks Unity AI Gateway** with an access token, launched with `ug claude` ([Databricks: Connect Claude Code](https://learn.microsoft.com/en-us/azure/databricks/ai-gateway/coding-agent-claude), [unity-gateway CLI](https://github.com/databricks/unity-gateway)).

**Options.**
1. **Databricks Unity AI Gateway.** Pros: a built-in coding-agent dashboard, per-user usage tables, per-user hard caps, governed MCP tools and skills. Cons:
   - The gateway, its service policies, tracing, and subscription pass-through are **beta or preview**.
   - `ug` manages Claude Code's **managed-settings file** (`/etc/claude-code/managed-settings.json`), which in our design is the read-only security policy.
   - Its extras are blocked by our policy anyway: a plugin through `--plugin-dir`, hooks, and local MCP proxies.
   - Manual setup uses a **long-lived personal access token**, against the no-keys decision ([ADR-006](#adr-006)).
   - A Python/uv tool installed from GitHub that also offers to upgrade Claude Code.
   - It's a generic third-party gateway: Anthropic doesn't audit it, and gateway sessions aren't eligible for Claude Code's HIPAA configuration ([gateway compatibility](https://code.claude.com/docs/en/llm-gateway-protocol)).
   - The manual config sets `CLAUDE_CODE_USE_GATEWAY`, which isn't in Claude Code's env-var reference.
   - Inference tables would store developers' code.
2. **Microsoft Foundry directly**, adding the Claude apps gateway for per-user governance ([ADR-013](#adr-013)).

**Decision.** Option 2. Databricks is out of scope for the evaluation.

**Consequences.** The network plan's "Azure Databricks LLM Access" box and its access token are replaced by Foundry behind a private endpoint, with Entra ID and no token. The per-user dashboards and caps we'd have got from Databricks come from the Claude apps gateway, OTel, and Azure instead.

<a id="adr-013"></a>
### ADR-013 · Claude apps gateway in front of Foundry (staged)

| Field | Value |
|---|---|
| **Status** | Proposed (recommended). Decide at the end of Phase 1 week 3. |
| **Related** | [R-08](risk-register.md#r-08), [R-13](risk-register.md#r-13), [R-15](risk-register.md#r-15), [R-24](risk-register.md#r-24) · [CTL-24](../docs/02-security-baseline/defense-in-depth.md#ctl-24), [CTL-28](../docs/02-security-baseline/defense-in-depth.md#ctl-28) · [IDN-014](../docs/03-test-plan/catalog/identity.md#idn-014), [IDN-015](../docs/03-test-plan/catalog/identity.md#idn-015), [COST-013](../docs/03-test-plan/catalog/cost.md#cost-013), [COST-014](../docs/03-test-plan/catalog/cost.md#cost-014), [COST-015](../docs/03-test-plan/catalog/cost.md#cost-015), [TEL-013](../docs/03-test-plan/catalog/telemetry.md#tel-013), [TEL-014](../docs/03-test-plan/catalog/telemetry.md#tel-014), [OPS-011](../docs/03-test-plan/catalog/operations.md#ops-011) |

**Context.** Requirements: track each developer's cost, shut a developer off at a limit, email them and the evaluation lead at X% of their weekly or monthly use, and automatically stop runaway agents (for example, ten agents running all night). Foundry alone can't do any of this per user: Azure budgets alert per subscription or resource, and cost data lags by hours.

**Options.**
1. **Foundry direct**: simplest, no per-user caps, identity in telemetry needs extra work.
2. **[Claude apps gateway](https://code.claude.com/docs/en/claude-apps-gateway)**, Anthropic's self-hosted gateway, built into the `claude` binary, with no licence fee:
   - Entra sign-in, with a 1-hour session.
   - Managed settings per Entra group, and identity-stamped OTLP telemetry.
   - [Per-user and per-group spend caps](https://code.claude.com/docs/en/claude-apps-gateway-spend-limits): daily, weekly, or monthly, enforced on every request. A `"0"` cap is an instant per-user kill switch. The CLI warns at 75% and 95%.
   - Upstream `provider: foundry` through a managed identity.
3. **Azure API Management** as a custom gateway. Not verified for Claude's request format. Not pursued.

**Recommendation.** Option 2, **staged**. Phase 1 first proves direct Foundry (simpler, isolates problems), then puts the gateway in front and runs the gateway tests.

**Consequences.**
- **Better least privilege:** developers need no Azure role, and the container holds no Azure token. The container's allowlist shrinks to the gateway, Nexus, and GitHub.
- **New infrastructure:** a Linux container service (AKS or Container Apps), Azure Database for PostgreSQL, an Entra app registration, private DNS, and a TLS certificate. Claude Code refuses a gateway on a public IP.
- **Feature losses:** WebSearch is off (already decided, [ADR-016](#adr-016)). Only the 5-minute prompt cache works, not the 1-hour TTL. There's no service-token flow, so CI keeps direct Foundry.
- **Spend is an estimate:** set `pricing.overrides` to Azure contract rates and reconcile with the invoice.
- **Settings to change:** set `enforcement.fail_closed_on_error: true`.
- **No per-user rate limit**, only caps. The gateway becomes a high-value target ([R-24](risk-register.md#r-24)).
- **Email notifications** need a small scheduled job that reads the admin API ([cost model](../docs/05-cost/cost-model.md)).

<a id="adr-014"></a>
### ADR-014 · Claude Code distributed only in the IT-built image, sourced from Nexus

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-19 |
| **Related** | [R-19](risk-register.md#r-19), [R-20](risk-register.md#r-20), [R-03](risk-register.md#r-03) · [CTL-02](../docs/02-security-baseline/defense-in-depth.md#ctl-02), [CTL-25](../docs/02-security-baseline/defense-in-depth.md#ctl-25) · [ENV-016](../docs/03-test-plan/catalog/env.md#env-016), [OPS-001](../docs/03-test-plan/catalog/operations.md#ops-001) |

**Decision.**
- **Installed at build time only.** IT's image build pulls one pinned Claude Code version from Nexus (npm proxy, or a raw repo with a checksum) and installs it root-owned. Developers never download or install Claude Code.
- **Nexus access:** the Claude Code package in Nexus is readable only by the build account.
- **No self-updates:** `DISABLE_UPDATES=1` is set in the managed policy. The policy's version range is the backstop.
- **Same artifact everywhere:** the same Nexus copy feeds the gateway image ([ADR-013](#adr-013)).
- **Upgrades:** update the pin, rebuild, rerun the P0 tests, publish a new digest, and raise the version range. Monthly, plus urgent security fixes.
- **No Windows installs:** never installed natively on Windows; the AppLocker/Intune block stays.

**Consequences.** No internet access needed on developer machines. Everyone runs an identical, scanned build. Rollback means going back to the previous digest. The policy file stays **outside** the image (read-only mount), so policy changes don't need a rebuild.

<a id="adr-015"></a>
### ADR-015 · Language packages and VS Code components through Nexus; per-language images

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-19 |
| **Related** | [R-20](risk-register.md#r-20), [R-26](risk-register.md#r-26), [R-29](risk-register.md#r-29) · [CTL-25](../docs/02-security-baseline/defense-in-depth.md#ctl-25) · [ENV-017](../docs/03-test-plan/catalog/env.md#env-017), [ENV-018](../docs/03-test-plan/catalog/env.md#env-018), [IDN-016](../docs/03-test-plan/catalog/identity.md#idn-016), [POL-017](../docs/03-test-plan/catalog/policy.md#pol-017), [NET-010](../docs/03-test-plan/catalog/network.md#net-010) |

**Context.** Developers need Python, Java, and C#/VB.NET libraries. Claude Code doesn't fetch libraries itself; it runs `pip`, `mvn`, `gradle`, and `dotnet`, which read their own config.

**Decision.**
- **Per-language images** (Python, .NET, Java) on a common base: Claude Code, the firewall, the non-root user, and certificates.
- **Package managers point at Nexus in the image:**
  - pip: `/etc/pip.conf`, plus the equivalents for uv and Poetry.
  - Maven: global `settings.xml` with a `mirrorOf *` mirror.
  - Gradle: an init script replacing all repositories, including the plugin portal.
  - `mvnw` and `gradlew`: their distributions hosted in Nexus.
  - NuGet: `NuGet.Config` with `<clear/>` and the Nexus source.
- **Internal CA** in each trust store: the system store, pip `cert =`, JDK `cacerts`, and `NODE_EXTRA_CA_CERTS`.
- **Nexus access is read-only:** anonymous read or a read-only token, with no publish rights. Consider Repository Firewall or quarantine rules for new or suspicious packages.
- **Allowlisting:** the Nexus host is in the container firewall and in `sandbox.network.allowedDomains`.
- **A managed CLAUDE.md** in the policy folder tells Claude the package rules.
- **VS Code:** extensions are baked into the image, with pinned VSIX files (and checksums) in a Nexus raw repo as the fallback. The VS Code Server matching the VDI's pinned VS Code version is pre-installed or hosted in Nexus [verify]. The Claude Code extension is pinned to the CLI version.

**Consequences.** The config makes Nexus work; the firewall makes it the only option. Repo-level overrides (`--index-url` in a requirements file, a `<repository>` in a POM, a repo `nuget.config`) fail at the firewall. Ask rules cover registry-config edits ([ADR-017](#adr-017)).

<a id="adr-016"></a>
### ADR-016 · Web tools disabled (WebSearch; WebFetch pending confirmation)

| Field | Value |
|---|---|
| **Status** | Accepted for WebSearch. WebFetch: recommended, pending the evaluation lead's confirmation. |
| **Date** | 2026-10-19 |
| **Related** | [R-06](risk-register.md#r-06), [R-09](risk-register.md#r-09), [R-18](risk-register.md#r-18) · [CTL-26](../docs/02-security-baseline/defense-in-depth.md#ctl-26) · [NET-007](../docs/03-test-plan/catalog/network.md#net-007), [PERM-014](../docs/03-test-plan/catalog/permissions.md#perm-014), [NET-006](../docs/03-test-plan/catalog/network.md#net-006) |

**Context.** Web search must be disabled completely. On Foundry, WebSearch runs on the server side, so the container firewall can't stop it. No environment variable turns it off, and the search-count limit can't be set to 0 ([env vars](https://code.claude.com/docs/en/env-vars)).

**Decision.**
- **WebSearch:** `permissions.deny: ["WebSearch"]` in the managed policy, locked by `allowManagedPermissionRulesOnly`. The gateway also disables it on its sessions.
- **WebFetch:** `CLAUDE_CODE_DISABLE_WEB_FETCH=1`, a deny rule, and `skipWebFetchPreflight: true`. With no internet, WebFetch could only reach allowlisted hosts like GitHub, which is an exfiltration path, and it sends hostnames to `api.anthropic.com`. Revert this part if the lead wants WebFetch for internal docs.

**Consequences.** NET-007 is the only proof WebSearch is off, so it's P0. Claude can't look things up online; docs must come from the repo or a future approved internal source.

<a id="adr-017"></a>
### ADR-017 · .NET / VB.NET capability tiers; Claude Code never runs natively

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-19 |
| **Related** | [R-03](risk-register.md#r-03), [R-25](risk-register.md#r-25), [R-28](risk-register.md#r-28) · [CTL-29](../docs/02-security-baseline/defense-in-depth.md#ctl-29) · [ENV-019](../docs/03-test-plan/catalog/env.md#env-019), [ENV-020](../docs/03-test-plan/catalog/env.md#env-020), [PERM-019](../docs/03-test-plan/catalog/permissions.md#perm-019), [SURF-013](../docs/03-test-plan/catalog/surfaces.md#surf-013) |

**Context.** Windows-only C# and VB.NET code (.NET Framework, WinForms, WPF, WebForms, WCF) can't build or run in a Linux container. VB.NET follows the same rules as C#: what matters is the target framework.

**Tiers.**
| Tier | Which projects | In the container |
|---|---|---|
| **Full** | Modern .NET (`net8.0` etc.), C# or VB | Edit, build, test |
| **Compile-check** | SDK-style `net4x` or `-windows` (WinForms/WPF) | Edit and compile (via `Microsoft.NETFramework.ReferenceAssemblies` or `EnableWindowsTargeting`). Tests need Windows. |
| **Edit-only** | Old-style non-SDK projects, WebForms, WCF | Edit only. The developer builds and tests on Windows. |

**Options for Windows-only code.** (A) Windows containers: rejected because of memory limits, and they're native Windows anyway (no sandbox). (B) Self-hosted ephemeral Windows CI runner: optional, low-priority experiment ([SURF-013](../docs/03-test-plan/catalog/surfaces.md#surf-013)). (C) Claude Code natively on the VM: **rejected**; Claude Code never runs natively. (D) Modernization: out of scope for the evaluation; noted as the long-term way to move repos up a tier.

**Decision.**
- Tiers as above.
- For compile-check and edit-only repos, the repo lives in a shared Windows folder, `C:\Dev\<repo>`. That's the only extra entry in Docker Desktop's `filesharingAllowedDirectories`. Claude edits from the container, and the developer builds in Visual Studio.
- Building on Windows is where agent-written code leaves the container. Ask rules cover build files and registry configs ([CTL-29](../docs/02-security-baseline/defense-in-depth.md#ctl-29)), and the AUP and training require a review before building.
- Each repo's tier is classified at onboarding; Claude can scan the project files in its first session ([ENV-019](../docs/03-test-plan/catalog/env.md#env-019)).

**Consequences.** Some repos get less from Claude. Tier is a covariate in the measurement framework, and tiers are balanced across cohorts ([R-28](risk-register.md#r-28)).

<a id="adr-018"></a>
### ADR-018 · Evaluation on VDIs; production target is Docker on users' PCs

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-19 |
| **Related** | [R-23](risk-register.md#r-23), [R-03](risk-register.md#r-03) · [CTL-27](../docs/02-security-baseline/defense-in-depth.md#ctl-27) · [NET-014](../docs/03-test-plan/catalog/network.md#net-014), [NET-015](../docs/03-test-plan/catalog/network.md#net-015), [ENV-021](../docs/03-test-plan/catalog/env.md#env-021), [ENV-022](../docs/03-test-plan/catalog/env.md#env-022) |

**Context.** Phase 1 and Phase 2 run on isolated Win11 VDIs (BeyondTrust jump host, Guardicore, no internet) as an extra layer during the evaluation. Once proven, the same Docker images run on users' PCs. PCs have internet and corporate network access, hold user data, and travel; laptops use the VPN, and off the VPN nothing in the tenant is reachable.

**Decision.**
- **Tag controls:** every control is tagged Portable or VDI-only in the [control catalog](../docs/02-security-baseline/defense-in-depth.md#control-catalog). The Phase 1 report claims "secure in Docker" only from portable controls.
- **Test where the host has internet:** re-run the portable P0 network tests on a host with internet access ([NET-014](../docs/03-test-plan/catalog/network.md#net-014)). On the isolated VDI, the VDI firewall would hide a container-firewall failure.
- **PC prerequisites ([ENV-022](../docs/03-test-plan/catalog/env.md#env-022)):**
  - a standard user, with no local admin
  - Windows Pro or Enterprise with Hyper-V, and virtualization enabled in the BIOS
  - a Docker Desktop Business licence
  - full-disk encryption (confirmed in place)
  - RAM sized from ENV-013
  - the VPN
- **Guardicore** runs on PCs too. It sees container traffic as Docker Desktop's process, so a process-level rule can restrict it without affecting other apps [verify with the Guardicore team] ([ENV-021](../docs/03-test-plan/catalog/env.md#env-021)).
- **Off the VPN,** sessions must fail closed ([NET-015](../docs/03-test-plan/catalog/network.md#net-015)).
- **Optional PC track:** the evaluation lead may run on a local PC in Phase 2, using a standard (non-admin) account for tamper tests.

**Consequences.** Open question for the network team: is the VPN full-tunnel or split-tunnel? With split tunnel, the container firewall is the only internet control.

<a id="adr-019"></a>
### ADR-019 · Test tracking with a local tracker and the 🟩🟨🟥 legend

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-19 |
| **Related** | [R-27](risk-register.md#r-27) · [DATA-013](../docs/03-test-plan/catalog/data.md#data-013) |

**Context.** Each step of testing needs: what was done, the result, fix steps when it didn't work, notes and exceptions, a green, yellow, or red status, and attached screenshots and logs. It also needs sections, a progress view, private notes left out of reports, and one compiled report at the end. No test-management tool is available.

**Options.** GitHub Issues + Projects (no private notes, needs a compile script) · Markdown + a build script (more manual) · OneNote/Loop (no compile) · a commercial test-management tool (none available) · **a small local tracker**.

**Decision.** A single-file tracker (`tools/tracker/tracker.html`, built and tested next):
- It opens in Edge and saves entries and attachments as ordinary files in a records folder.
- **Structure:** free-form entries in sections, with an optional test ID.
- **Status:** 🟩 Pass · 🟨 Issue · 🟥 Blocker · ⏳ Not run · ⏭ N/A.
- **Content:** "what I did", result, fix steps, notes, and **private notes that are never exported**.
- **Views and output:** a dashboard and a **Build report** button that produces one document.

The records folder lives **outside anything the agent under test can reach** ([ADR-004](#adr-004)). Result colors are squares, so they don't clash with the policy circles (🟢🟡🔴).

**Consequences.** Some companies block browser access to local files, so check Edge on the work machine.

**Update 2026-10-19.** Built and tested: [tools/tracker](../tools/tracker/README.md).
- 18 of 18 automated core tests pass, and the built-in self-test passes 10 of 10 in a Chromium browser.
- The full workflow was exercised in the browser, including both report formats.
- Records-folder mode and opening from disk in Edge weren't testable here [verify]. Run the tracker's self-test in Edge on the work machine first.
