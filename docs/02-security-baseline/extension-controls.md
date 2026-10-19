---
title: Extension controls
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: "1-2"
---

# Extension controls

[🏠 Home](../../README.md) › Security baseline › Extension controls

Claude Code can be extended with MCP servers, plugins, hooks, skills, subagents, output styles, status lines, and helper scripts. **Each of these is a code-execution or instruction-injection surface.** This page sets the policy for each and the setting that enforces it.

## Contents
- [Policy summary](#policy-summary)
- [MCP servers](#mcp-servers)
- [Plugins, marketplaces, and mods](#plugins-marketplaces-and-mods)
- [Hooks](#hooks)
- [Skills and subagents](#skills-and-subagents)
- [Other command surfaces](#other-command-surfaces)
- [VS Code extensions (not Claude Code extensions)](#vs-code-extensions-not-claude-code-extensions)
- [Policy delivered by the gateway (ADR-013)](#policy-delivered-by-the-gateway-adr-013)
- [Path to enabling extensions later](#path-to-enabling-extensions-later)

## Policy summary

| Surface | Runs code? | Can a repo ship it? | Phase 1–2 policy | Enforced by | Tests |
|---|---|---|---|---|---|
| MCP servers | ✅ (local stdio servers run as processes) | ✅ `.mcp.json` | 🔴 **Block all** (managed-only, none defined) | `allowManagedMcpServersOnly` | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001), [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) |
| claude.ai connectors | Remote | — | 🔴 Block / ⛔ n/a | `ENABLE_CLAUDEAI_MCP_SERVERS=false` | [EXT-011](../03-test-plan/catalog/extensions.md#ext-011) |
| Plugins & marketplaces | ✅ | ✅ (via `extraKnownMarketplaces`) | 🔴 **Block** | `strictKnownMarketplaces: []` | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) |
| Sideload flags (`--plugin-dir`, `--mcp-config`, `--agents`) | ✅ | — | 🔴 **Block** | `disableSideloadFlags` | [EXT-004](../03-test-plan/catalog/extensions.md#ext-004) |
| Mods (JS inside Claude Code, outside the sandbox) | ✅ | via plugins | 🔴 Block | `pluginConfigs.allowManagedModsOnly` + `allowManagedHooksOnly` [verify] | [EXT-014](../03-test-plan/catalog/extensions.md#ext-014) |
| Hooks | ✅ (shell, HTTP, MCP, prompt, agent) | ✅ `.claude/settings.json` | 🟡 **Managed only** (audit hook) | `allowManagedHooksOnly` | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005), [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) |
| Skills | ⚠️ Instructions, plus inline shell | ✅ `.claude/skills/` | 🟡 **Allow, no inline shell** | `disableSkillShellExecution` | [EXT-008](../03-test-plan/catalog/extensions.md#ext-008), [EXT-010](../03-test-plan/catalog/extensions.md#ext-010) |
| Subagents | Instructions + tool scoping | ✅ `.claude/agents/` | 🟡 Allow (they inherit the sandbox and rules) | Inherit managed policy | [EXT-009](../03-test-plan/catalog/extensions.md#ext-009), [SBX-010](../03-test-plan/catalog/sandbox.md#sbx-010) |
| CLAUDE.md / rules | Instructions | ✅ | 🟢 Allow (core feature) | — (prompt-injection risk accepted, covered by layers) | [FEAT-004](../03-test-plan/catalog/features.md#feat-004) |
| Output styles | Instructions | ✅ | 🟢 Allow | — | [EXT-013](../03-test-plan/catalog/extensions.md#ext-013) |
| VS Code extensions (separate surface, [below](#vs-code-extensions-not-claude-code-extensions)) | ✅ (in the VS Code Server) | ⚠️ `devcontainer.json` lists them | 🟡 **Baked into the image only** | Image build ([ADR-015](../../logs/decision-log.md#adr-015)) | [ENV-018](../03-test-plan/catalog/env.md#env-018) |
| Status line command | ✅ (shell) | ✅ | 🔴 Block non-managed | Covered by `allowManagedHooksOnly` | [EXT-007](../03-test-plan/catalog/extensions.md#ext-007) |
| `apiKeyHelper`, `otelHeadersHelper`, `awsAuthRefresh`, … | ✅ (shell) | ✅ | 🔴 Block non-managed | Read from the highest-ranked source only [verify] | [EXT-015](../03-test-plan/catalog/extensions.md#ext-015) |

## MCP servers

- **Phase 1 and 2 stance: no MCP servers.** Developers use `gh` and normal CLIs, which the docs recommend over MCP for cost reasons anyway ([costs](https://code.claude.com/docs/en/costs)).
- `allowManagedMcpServersOnly: true` 🔒 means only servers defined in managed configuration (`managed-mcp.json` or `managedMcpServers`) can load. Project `.mcp.json` and `claude mcp add` have no effect ([managed MCP](https://code.claude.com/docs/en/managed-mcp)).
- `allowedMcpServers` / `deniedMcpServers` match on `serverUrl`, `serverCommand`, or `serverName`. **`serverName` is a label, not a security control**, so never allowlist by name alone.

## Plugins, marketplaces, and mods

- `strictKnownMarketplaces: []` 🔒: an empty allowlist blocks every plugin source ([plugins for orgs](https://code.claude.com/docs/en/plugins/org)).
- `blockedMarketplaces` isn't needed when the allowlist is empty.
- `disableSideloadFlags` 🔒 rejects `--plugin-dir`, `--mcp-config`, and `--agents` on the command line.
- `CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL=1` stops automatic install of the official marketplace. Add it to managed env [verify] if [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) shows any auto-install attempt.

## Hooks

- `allowManagedHooksOnly: true` 🔒: hooks from user, project, and local settings are ignored. This also restricts `statusLine` to managed settings ([hooks](https://code.claude.com/docs/en/hooks)).
- **Managed audit hook.** One script at `/opt/claude-audit/audit-hook.sh` (root-owned, in the image) is registered on `SessionStart`, `PreToolUse`, `PostToolUse`, `PermissionDenied`, `ConfigChange`, and `SessionEnd`. It appends a JSON line (timestamp, session ID, event, tool name, decision, but **no content**) to a local log that's shipped to the SIEM. It complements OTel's `tool_decision` events and gives a second, independent audit trail.
- HTTP hooks: if used later, restrict them with `allowedHttpHookUrls` and `httpHookAllowedEnvVars`.

> [!NOTE]
> This repo documents the hook's *contract*: inputs, outputs, log schema. Building the script is out of scope for this documentation kit.

**Audit log record (contract):**

| Field | Example | Source |
|---|---|---|
| `ts` | `2026-10-21T14:03:22Z` | hook |
| `session_id` | `…` | hook input |
| `event` | `PreToolUse` | hook argument |
| `tool` | `Bash` | hook input |
| `decision` | `allow` / `deny` / `ask` | hook input / PermissionDenied |
| `dev` | `<dev-alias>` | container env |
| `policy_hash` | `sha256:…` | file at startup |

## Skills and subagents

- Skills are Markdown instructions that may include inline shell. `disableSkillShellExecution: true` removes the inline-shell part. Skills can still direct Claude to run commands, but those go through normal permissions and the sandbox.
- Project skills (`.claude/skills/`) and agents (`.claude/agents/`) are **allowed**. They're valuable for productivity (shared team workflows) and are reviewed through normal PR review.
- Subagents inherit the parent's sandbox and permission rules. `Agent(Name)` rules can restrict them further if needed ([PERM-016](../03-test-plan/catalog/permissions.md#perm-016)).
- Locking skills and agents to plugin-only sources (`strictPluginOnlyCustomization`) isn't needed at this stage.

## Other command surfaces

| Surface | Risk | Stance |
|---|---|---|
| `statusLine` (shell command run on every render) | Code execution from project settings | Managed only (via `allowManagedHooksOnly`) |
| `apiKeyHelper` | Shell script that returns credentials | Not used: Entra ID only, no keys ([ADR-006](../../logs/decision-log.md#adr-006)). Non-managed values not honored [verify]. In gateway mode, a configured `apiKeyHelper` conflicts with the forced gateway sign-in, so it must stay unset. |
| `otelHeadersHelper` | Shell script for OTel auth headers | May be used **in managed policy only**, to inject per-developer identity in direct-Foundry mode. Not needed in gateway mode: the gateway stamps identity on every export ([TEL-013](../03-test-plan/catalog/telemetry.md#tel-013)). |
| `fileSuggestion` (custom command) | Shell execution | ⚪ Default [verify] whether it's restricted |
| Keybindings, themes, output styles | None | 🟢 Allow |

## VS Code extensions (not Claude Code extensions)

VS Code extensions (Python, C# Dev Kit, Java, and the Claude Code extension itself) are a **separate surface** from everything above. They run in the VS Code Server inside the dev container, not inside Claude Code, and Claude Code's policy doesn't govern them. Their risk here is mostly operational: the container has no internet, so anything that downloads at attach time fails ([R-29](../../logs/risk-register.md#r-29)).

| Item | Stance | Decision | Test |
|---|---|---|---|
| Language extensions (Python, C# Dev Kit, Java, …) | **Baked into the per-language image** at build time. Fallback: pinned VSIX files, with checksums, in a Nexus raw hosted repository. | [ADR-015](../../logs/decision-log.md#adr-015) | [ENV-018](../03-test-plan/catalog/env.md#env-018) |
| VS Code Server | Normally downloaded into the container on first attach. Pin the VS Code version on the VDI and pre-install the matching server in the image, or host it in Nexus [verify]. | [ADR-015](../../logs/decision-log.md#adr-015) | [ENV-018](../03-test-plan/catalog/env.md#env-018), [ENV-009](../03-test-plan/catalog/env.md#env-009) |
| Runtime downloads by extensions (language servers, SDKs) | Pre-install what they fetch on first run, or point them at Nexus | [ADR-015](../../logs/decision-log.md#adr-015) | [ENV-018](../03-test-plan/catalog/env.md#env-018) |
| Claude Code VS Code extension | **Pinned to the same version as the CLI**, so it stays inside the policy's `requiredMinimumVersion`/`requiredMaximumVersion` range. Installed from the image, never from the Marketplace at runtime. | [ADR-014](../../logs/decision-log.md#adr-014) | [ENV-009](../03-test-plan/catalog/env.md#env-009), [ENV-018](../03-test-plan/catalog/env.md#env-018) |

`devcontainer.json`'s `customizations.vscode.extensions` list installs from the Marketplace when the container is created, so it **doesn't** work offline on its own. Treat it as a list of what the image must already contain.

## Policy delivered by the gateway (ADR-013)

If the Claude apps gateway is accepted ([ADR-013](../../logs/decision-log.md#adr-013)), it delivers managed settings per Entra group at the managed tier ([Claude apps gateway](https://code.claude.com/docs/en/claude-apps-gateway)). This lets different groups get different model lists without editing the VDI file. It **doesn't loosen** anything here:

- Every lock on this page (`allowManagedMcpServersOnly`, `strictKnownMarketplaces: []`, `disableSideloadFlags`, `allowManagedHooksOnly`, `disableSkillShellExecution`) stays in the file **and** is mirrored into the gateway's base policy. Machines that never connect get their policy from the file alone ([gateway overlay](managed-settings.md#gateway-overlay-adr-013)).
- Deny lists and hook arrays from gateway policies are unioned with the base layer, never replaced.
- Keep the audit hook in the file. Shell-capable settings pushed by a gateway trigger an approval dialog on the developer's machine.
- A compromised gateway could push settings to every developer, so its configuration is treated like MDM ([R-24](../../logs/risk-register.md#r-24), [CTL-24](defense-in-depth.md#ctl-24)).

## Path to enabling extensions later

If Phase 2 shows demand for an MCP server (for example, an internal docs search) or a plugin:

1. Security review of the server or plugin source and its supply chain.
2. Host it in an internal marketplace or registry, pinned by version.
3. Add it to `managedMcpServers`, or add the internal marketplace to `strictKnownMarketplaces`.
4. Add its domain to the firewall and sandbox allowlists if it's remote.
5. Run [EXT-012](../03-test-plan/catalog/extensions.md#ext-012) and log an ADR.

## Related
- [Managed settings](managed-settings.md) · [Extension tests (EXT)](../03-test-plan/catalog/extensions.md)
- [Settings keys inventory](../04-feature-inventory/settings-keys.md) · [Tools, hooks, and modes inventory](../04-feature-inventory/tools-and-hooks.md)
