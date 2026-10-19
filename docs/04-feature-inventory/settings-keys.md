---
title: Settings keys
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 1
---

# Settings keys

[🏠 Home](../../README.md) › [Feature inventory](README.md) › Settings keys

Every key Claude Code reads from a `settings.json` file, plus the global keys it keeps in `~/.claude.json`, with the proposed managed-policy decision for each. Notes mark 🔒 managed-only and 🌐 global (~/.claude.json) keys, and say "user/managed only" where a repository file cannot set the key. Built from [All settings](https://code.claude.com/docs/en/settings-reference) and [Settings files and precedence](https://code.claude.com/docs/en/settings), with the Foundry column cross-checked against [Feature availability](https://code.claude.com/docs/en/feature-availability), for Claude Code **2.1.301** as of 2026-10-15.

> [!NOTE]
> **How to use this page.** For each row, confirm the behavior in the evaluation container, then set **Result** (⏳ → 🟩/🟨/🟥/⏭) and put evidence in `evidence/<ID>/`. Rows with a catalog test in **Covered by** are verified by that test; mark them with the test's result. **Policy** is the *proposed* decision. Changes need an ADR in `logs/decision-log.md`.

## Contents
- [Model & responses](#model--responses)
- [Permissions](#permissions)
- [Auto mode](#auto-mode)
- [Sandbox](#sandbox)
- [MCP](#mcp)
- [Plugins, marketplaces & mods](#plugins-marketplaces--mods)
- [Skills & agents](#skills--agents)
- [Hooks & workflows](#hooks--workflows)
- [Memory & context](#memory--context)
- [Environment & auth](#environment--auth)
- [Provider & login restrictions](#provider--login-restrictions)
- [Privacy & telemetry](#privacy--telemetry)
- [Git & attribution](#git--attribution)
- [Updates & versions](#updates--versions)
- [UI & terminal](#ui--terminal)
- [Agents, worktrees & background](#agents-worktrees--background)
- [Remote, desktop & notifications](#remote-desktop--notifications)
- [Managed-only administration](#managed-only-administration)
- [Settings-file meta](#settings-file-meta)
- [Global config](#global-config)
- [Coverage summary](#coverage-summary)
- [Related](#related)

## Model & responses

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-001 | `advisorModel` | Picks the model that answers when Claude consults the advisor tool. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Advisor not available on Foundry per feature-availability; `/advisor` writes it |
| INV-SET-002 | `alwaysThinkingEnabled` | Turns extended thinking off for every session when set to false. | ✅ | ✅ | 🟢 Allow | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [COST-003](../03-test-plan/catalog/cost.md#cost-003) | ⏳ | On third-party providers the thinking parameter is omitted; adaptive models may still think |
| INV-SET-003 | `availableModels` | Allowlist of models selectable for sessions, subagents, skills, and the advisor. | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | set in managed policy: pinned Foundry deployment IDs; pair with `enforceAvailableModels` |
| INV-SET-004 | `availableModelsMatch` | Makes availableModels ID entries match one exact version instead of by prefix. | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | 🔒 managed-only; proposed: set in managed policy: `"exact"` so newer versions stay blocked until listed [verify]; min v2.1.283 |
| INV-SET-005 | `deniedModels` | Blocks named models or families even when the allowlist permits them. | ✅ | ✅ | ⚪ Default | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | 🔒 managed-only; Allowlist does the pinning; use for emergency blocks; min v2.1.283 |
| INV-SET-006 | `effortLevel` | Default reasoning effort for models without a saved per-model level. | ✅ | ✅ | 🟢 Allow | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [COST-003](../03-test-plan/catalog/cost.md#cost-003) | ⏳ | `--effort` and `CLAUDE_CODE_EFFORT_LEVEL` override it |
| INV-SET-007 | `enforceAvailableModels` | Makes the Default model option resolve to a model inside availableModels. | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | proposed: set in managed policy: `true` (R-10); read from managed only once managed exists; min v2.1.175 |
| INV-SET-008 | `fallbackModel` | Ordered backup models used when the primary model is overloaded or unavailable. | ✅ | ✅ | 🟢 Allow | [POL-011](../03-test-plan/catalog/policy.md#pol-011), [COST-007](../03-test-plan/catalog/cost.md#cost-007) | ⏳ | Still limited by `availableModels`; max 3 models; not merged across files |
| INV-SET-009 | `fastMode` | Turns fast mode on where available, at a higher per-token cost. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Fast mode not available on Foundry |
| INV-SET-010 | `fastModePerSessionOptIn` | Requires running /fast in each session instead of persisting fast mode. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Fast mode not available on Foundry |
| INV-SET-011 | `language` | Sets the default language for responses, dictation, and session titles. | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-SET-012 | `maxEffortLevel` | Caps the effort level any session or model can use. | ✅ | ✅ | ⚪ Default | [COST-003](../03-test-plan/catalog/cost.md#cost-003) | ⏳ | Lowest cap across scopes wins; candidate cost cap (R-15) [verify]; min v2.1.267 |
| INV-SET-013 | `model` | Default model for new sessions. | ✅ | ✅ | 🟢 Allow | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | Picks only within `availableModels`; a managed `model` is a default, not a lock |
| INV-SET-014 | `modelOverrides` | Maps Anthropic model IDs to provider-specific deployment IDs. | ✅ | ✅ | ⚪ Default | [COST-011](../03-test-plan/catalog/cost.md#cost-011) | ⏳ | Set in managed policy only if Foundry deployment names differ from model IDs [verify] |
| INV-SET-015 | `modelPicker` | Custom /model picker lineup with labels, added to or replacing built-ins. | ✅ | ✅ | ⚪ Default | [POL-011](../03-test-plan/catalog/policy.md#pol-011), [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | user/managed only; Optional managed lineup of Foundry deployments; min v2.1.242 |
| INV-SET-016 | `modelPicker.options` | Picker rows: model plus optional label, description, and behavesAs. | ✅ | ✅ | ⚪ Default | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | user/managed only; Field of `modelPicker`; `behavesAs` min v2.1.257 |
| INV-SET-017 | `modelPicker.replaceBuiltInOptions` | Shows only the listed rows instead of adding them after built-ins. | ✅ | ✅ | ⚪ Default | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | user/managed only; Field of `modelPicker`; default `false` |
| INV-SET-018 | `modelPricing` | Reports spend at contracted rates instead of list price. | ✅ | ✅ | 🟡 Restrict | [COST-002](../03-test-plan/catalog/cost.md#cost-002), [COST-001](../03-test-plan/catalog/cost.md#cost-001) | ⏳ | 🔒 managed-only; set in managed policy: contracted Foundry rates; feeds `/usage`, OTel cost, `--max-budget-usd`; min v2.1.242. With the Claude apps gateway, `pricing.multiplier`/`overrides` set the gateway's spend estimates and can be sent to clients as `modelPricing` (ADR-013). |
| INV-SET-019 | `modelPricing.multiplier` | Flat multiplier applied to every cost Claude Code computes. | ✅ | ✅ | 🟡 Restrict | [COST-002](../03-test-plan/catalog/cost.md#cost-002) | ⏳ | 🔒 managed-only; Field of `modelPricing`; 0 to 10; markup above 1 needs v2.1.271; set only for a flat contract discount |
| INV-SET-020 | `modelPricing.overrides` | Per-model USD rates for input, output, cache read, and cache write. | ✅ | ✅ | 🟡 Restrict | [COST-002](../03-test-plan/catalog/cost.md#cost-002) | ⏳ | 🔒 managed-only; Field of `modelPricing`; set in managed policy: per-model contracted rates |
| INV-SET-021 | `modelSettings` | Per-model saved effort level, effort cap, and auto-compact window. | ✅ | ✅ | 🟢 Allow | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [COST-009](../03-test-plan/catalog/cost.md#cost-009) | ⏳ | min v2.1.251; `maxEffortLevel` field v2.1.267; `autoCompactWindow` field v2.1.288 |
| INV-SET-022 | `outputStyle` | Selects a built-in or custom output style by name. | ✅ | ✅ | 🟢 Allow | [EXT-013](../03-test-plan/catalog/extensions.md#ext-013) | ⏳ |  |
| INV-SET-023 | `promptCacheTtl` | Sets the main-conversation prompt cache lifetime: five minutes or one hour. | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ | One-hour writes bill higher; min v2.1.242 |
| INV-SET-024 | `showThinkingSummaries` | Shows full thinking summaries when you expand thinking. | ✅ | ✅ | 🟢 Allow | — | ⏳ | Third-party providers do not redact thinking |
| INV-SET-025 | `subagentPromptCacheTtl` | Sets prompt cache lifetime for subagents, workflows, and helper requests. | ✅ | ✅ | ⚪ Default | [COST-004](../03-test-plan/catalog/cost.md#cost-004), [COST-008](../03-test-plan/catalog/cost.md#cost-008) | ⏳ | min v2.1.242 |
| INV-SET-026 | `switchModelsOnFlag` | Chooses switch or pause when a safety classifier flags a request. | ❓ | ✅ | ⚪ Default | — | ⏳ | [verify] whether classifier flagging applies on Foundry |
| INV-SET-027 | `ultracode` | Starts sessions with ultracode workflow planning turned on. | ✅ | ✅ | ⚪ Default | — | ⏳ | Needs dynamic workflows and `xhigh` support; cost exposure (R-15); current behavior v2.1.284 |

## Permissions

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-028 | `allowManagedPermissionRulesOnly` | Makes managed settings the only source of allow, ask, and deny rules. | ✅ | ✅ | 🔴 Block | [POL-007](../03-test-plan/catalog/policy.md#pol-007), [PERM-017](../03-test-plan/catalog/permissions.md#perm-017) | ⏳ | 🔒 managed-only; set in managed policy: `true`; hides always-allow, ignores `--allowedTools` and non-managed skill `allowed-tools` (v2.1.282) |
| INV-SET-029 | `permissions` | Object holding permission rules, extra directories, and mode settings. | ✅ | ✅ | 🟡 Restrict | [POL-004](../03-test-plan/catalog/policy.md#pol-004), [POL-005](../03-test-plan/catalog/policy.md#pol-005), [POL-007](../03-test-plan/catalog/policy.md#pol-007) | ⏳ | Managed rules only (CTL-07); deny rules apply in every mode |
| INV-SET-030 | `permissions.allow` | Tool uses Claude Code approves without prompting. | ✅ | ✅ | 🟡 Restrict | [PERM-006](../03-test-plan/catalog/permissions.md#perm-006), [PERM-014](../03-test-plan/catalog/permissions.md#perm-014), [PERM-015](../03-test-plan/catalog/permissions.md#perm-015), [PERM-016](../03-test-plan/catalog/permissions.md#perm-016), [POL-007](../03-test-plan/catalog/policy.md#pol-007) | ⏳ | Managed allow rules only via `allowManagedPermissionRulesOnly`; repo rules also wait for trust |
| INV-SET-031 | `permissions.ask` | Tool uses that always prompt, even in permissive modes. | ✅ | ✅ | 🟡 Restrict | [PERM-007](../03-test-plan/catalog/permissions.md#perm-007) | ⏳ | set in managed policy: `Bash(git push *)`; `dontAsk` mode denies instead |
| INV-SET-032 | `permissions.deny` | Tool uses and paths Claude Code blocks, including file discovery. | ✅ | ✅ | 🟡 Restrict | [PERM-002](../03-test-plan/catalog/permissions.md#perm-002), [PERM-003](../03-test-plan/catalog/permissions.md#perm-003), [PERM-004](../03-test-plan/catalog/permissions.md#perm-004), [PERM-005](../03-test-plan/catalog/permissions.md#perm-005), [DATA-006](../03-test-plan/catalog/data.md#data-006) | ⏳ | set in managed policy: secrets reads, `.github/workflows` and CI edits, `curl`/`wget`; Bash patterns bypassable (R-05) |
| INV-SET-033 | `permissions.additionalDirectories` | Extra working directories that Claude's file tools may access. | ✅ | ✅ | 🟡 Restrict | [PERM-013](../03-test-plan/catalog/permissions.md#perm-013) | ⏳ | Container mounts only the workspace (CTL-03); repo entries wait for trust and get limited sandbox writes [verify] |
| INV-SET-034 | `permissions.blockReadsOutsideWorkingDirectories` | File tools refuse reads outside working directories in every mode. | ✅ | ✅ | ⚪ Default | [PERM-018](../03-test-plan/catalog/permissions.md#perm-018) | ⏳ | Decision pending PERM-018; `true` from any scope wins; min v2.1.257 |
| INV-SET-035 | `permissions.defaultMode` | Permission mode that new sessions start in. | ✅ | ✅ | 🟡 Restrict | [PERM-008](../03-test-plan/catalog/permissions.md#perm-008), [PERM-009](../03-test-plan/catalog/permissions.md#perm-009), [PERM-010](../03-test-plan/catalog/permissions.md#perm-010), [PERM-012](../03-test-plan/catalog/permissions.md#perm-012), [POL-016](../03-test-plan/catalog/policy.md#pol-016) | ⏳ | set in managed policy: `"default"` (pending auto-mode ADR); `auto`/`bypassPermissions` ignored from repo files since v2.1.257 |
| INV-SET-036 | `permissions.disableBypassPermissionsMode` | Prevents bypassPermissions mode and rejects --dangerously-skip-permissions. | ✅ | ✅ | 🔴 Block | [PERM-001](../03-test-plan/catalog/permissions.md#perm-001) | ⏳ | set in managed policy: `"disable"`; agent frontmatter bypass also ignored since v2.1.223 |
| INV-SET-037 | `skipDangerousModePermissionPrompt` | Skips the confirmation dialog before entering bypassPermissions mode. | ✅ | ✅ | 🔴 Block | [PERM-001](../03-test-plan/catalog/permissions.md#perm-001) | ⏳ | user/local/managed only; Weakening key; moot because managed `permissions.disableBypassPermissionsMode` blocks bypass (a managed `false` cannot override a user `true`) |
| INV-SET-038 | `ignorePatterns` | Deprecated file-exclusion setting that permissions.deny replaces. | ✅ | ✅ | ⚪ Default | [PERM-002](../03-test-plan/catalog/permissions.md#perm-002) | ⏳ | Named as deprecated under `permissions.deny`; use deny rules instead |

## Auto mode

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-039 | `autoMode` | Custom environment, allow, soft_deny, and hard_deny rules for the auto-mode classifier. | ✅ | ✅ | 🟡 Restrict | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011) | ⏳ | user/managed only; Pending ADR; managed rules only, but user arrays concatenate [verify]; Foundry: Sonnet 5+, Opus 4.7+, Haiku 5.5, Fable only |
| INV-SET-040 | `autoMode.classifyAllShell` | Sends every shell command through the classifier while auto mode is active. | ✅ | ✅ | 🟡 Restrict | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011) | ⏳ | user/managed only; If auto mode is approved: set in managed policy: `true`; a user `true` beats managed `false`; min v2.1.193 |
| INV-SET-041 | `disableAutoMode` | Removes auto mode; sessions that would start in auto start in default. | ✅ | ✅ | 🟡 Restrict | [POL-016](../03-test-plan/catalog/policy.md#pol-016), [PERM-011](../03-test-plan/catalog/permissions.md#perm-011) | ⏳ | Pending ADR: set in managed policy: `"disable"` unless auto mode is approved |
| INV-SET-042 | `permissions.disableAutoMode` | Alias of disableAutoMode accepted inside the permissions object. | ✅ | ✅ | 🟡 Restrict | [POL-016](../03-test-plan/catalog/policy.md#pol-016) | ⏳ | Same enforcement as `disableAutoMode` (managed value) |
| INV-SET-043 | `useAutoModeDuringPlan` | Lets the classifier review plan-mode shell commands instead of prompting. | ✅ | ✅ | ⚪ Default | [PERM-010](../03-test-plan/catalog/permissions.md#perm-010), [PERM-011](../03-test-plan/catalog/permissions.md#perm-011) | ⏳ | user/local/managed only; Follows the auto-mode ADR; a managed `false` is honored |
| INV-SET-044 | `skipAutoPermissionPrompt` | Skips the one-time notice shown on first entering auto mode. | ✅ | ✅ | ⚪ Default | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011) | ⏳ | user/managed only |

## Sandbox

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-045 | `sandbox` | Object configuring OS-level isolation for the Bash commands Claude runs. | ✅ | ✅ | 🟡 Restrict | [ENV-006](../03-test-plan/catalog/env.md#env-006), [SBX-001](../03-test-plan/catalog/sandbox.md#sbx-001), [SBX-011](../03-test-plan/catalog/sandbox.md#sbx-011) | ⏳ | Managed sandbox block (CTL-09 to CTL-11); managed Booleans override developers; arrays merge |
| INV-SET-046 | `sandbox.enabled` | Turns sandboxing on for Bash commands. | ✅ | ✅ | 🟡 Restrict | [ENV-006](../03-test-plan/catalog/env.md#env-006), [SBX-001](../03-test-plan/catalog/sandbox.md#sbx-001), [SBX-010](../03-test-plan/catalog/sandbox.md#sbx-010), [SBX-014](../03-test-plan/catalog/sandbox.md#sbx-014) | ⏳ | set in managed policy: `true`; image needs bubblewrap and socat |
| INV-SET-047 | `sandbox.failIfUnavailable` | Exits at startup when the sandbox is enabled but cannot start. | ✅ | ✅ | 🔴 Block | [SBX-001](../03-test-plan/catalog/sandbox.md#sbx-001) | ⏳ | set in managed policy: `true` (blocks unsandboxed fallback) |
| INV-SET-048 | `sandbox.autoAllowBashIfSandboxed` | Runs sandboxed Bash commands without a permission prompt. | ✅ | ✅ | ⚪ Default | [PERM-007](../03-test-plan/catalog/permissions.md#perm-007), [PERM-008](../03-test-plan/catalog/permissions.md#perm-008) | ⏳ | Default `true`; deny and content-scoped ask rules still apply; [verify] ADR on prompting in Manual mode |
| INV-SET-049 | `sandbox.excludedCommands` | Commands that run outside the sandbox. | ✅ | ✅ | 🟡 Restrict | [SBX-008](../03-test-plan/catalog/sandbox.md#sbx-008) | ⏳ | set in managed policy: `[]` or minimal; repo entries ignored when admin-required; user entries still apply, no managed lock [verify] |
| INV-SET-050 | `sandbox.allowUnsandboxedCommands` | Lets Claude retry blocked commands outside the sandbox via dangerouslyDisableSandbox. | ✅ | ✅ | 🔴 Block | [SBX-002](../03-test-plan/catalog/sandbox.md#sbx-002) | ⏳ | set in managed policy: `false` (strict sandbox mode; makes sandbox admin-required); user `false` beats project `true` since v2.1.285 |
| INV-SET-051 | `sandbox.filesystem` | Object with the read and write path lists for sandboxed commands. | ✅ | ✅ | 🟡 Restrict | [SBX-003](../03-test-plan/catalog/sandbox.md#sbx-003), [SBX-004](../03-test-plan/catalog/sandbox.md#sbx-004) | ⏳ | Edit/Read permission rules feed these lists; Linux skips write entries containing wildcards; trailing-slash deny bypass fixed in v2.1.224 |
| INV-SET-052 | `sandbox.filesystem.allowWrite` | Extra paths sandboxed commands may write to. | ✅ | ✅ | 🟡 Restrict | [SBX-003](../03-test-plan/catalog/sandbox.md#sbx-003), [SBX-015](../03-test-plan/catalog/sandbox.md#sbx-015) | ⏳ | Managed: minimal entries; repo entries limited when admin-required; cannot lift protected paths |
| INV-SET-053 | `sandbox.filesystem.denyWrite` | Paths sandboxed commands may never write, even inside writable areas. | ✅ | ✅ | 🟡 Restrict | [SBX-003](../03-test-plan/catalog/sandbox.md#sbx-003), [SBX-015](../03-test-plan/catalog/sandbox.md#sbx-015) | ⏳ | set in managed policy: shell rc files, PATH dirs, CI config; merges from every scope |
| INV-SET-054 | `sandbox.filesystem.denyRead` | Paths sandboxed commands may not read. | ✅ | ✅ | 🟡 Restrict | [SBX-004](../03-test-plan/catalog/sandbox.md#sbx-004), [IDN-008](../03-test-plan/catalog/identity.md#idn-008) | ⏳ | set in managed policy: credential paths (`~/.azure`, `~/.config/gh`, `~/.git-credentials`, `.env`); default read includes credentials |
| INV-SET-055 | `sandbox.filesystem.allowRead` | Re-opens reads for paths inside a denied region. | ✅ | ✅ | 🟡 Restrict | [SBX-007](../03-test-plan/catalog/sandbox.md#sbx-007) | ⏳ | Only managed entries honored via `allowManagedReadPathsOnly`; macOS wildcard fix v2.1.236 |
| INV-SET-056 | `sandbox.filesystem.allowManagedReadPathsOnly` | Honors only allowRead entries that come from managed settings. | ✅ | ✅ | 🔴 Block | [SBX-007](../03-test-plan/catalog/sandbox.md#sbx-007) | ⏳ | 🔒 managed-only; set in managed policy: `true` |
| INV-SET-057 | `sandbox.filesystem.disabled` | Turns off filesystem isolation while keeping network isolation. | ✅ | ✅ | 🔴 Block | [SBX-003](../03-test-plan/catalog/sandbox.md#sbx-003) | ⏳ | user/managed only; Keep `false`; once managed configures `sandbox.filesystem`, only managed can set it; min v2.1.216 |
| INV-SET-058 | `sandbox.ignoreViolations` | Silences violation reports for denials you expect a command to hit. | ✅ | ✅ | ⚪ Default | — | ⏳ | Access still blocked; repo entries limited when admin-required; a user value can hide reports [verify] |
| INV-SET-059 | `sandbox.enableWeakerNestedSandbox` | Lets bubblewrap run inside unprivileged Docker by reusing the container's /proc. | ✅ | ✅ | 🟡 Restrict | [ENV-006](../03-test-plan/catalog/env.md#env-006) | ⏳ | Weakens isolation (R-16); set `true` in managed policy only if ENV-006 shows bwrap fails without it; repo values limited when admin-required |
| INV-SET-060 | `sandbox.enableWeakerNetworkIsolation` | Lets macOS sandboxed commands reach the system TLS trust service. | ✅ | ⛔ | ⛔ Unavailable | — | ⏳ | macOS only; no effect in the Linux container |
| INV-SET-061 | `sandbox.allowAppleEvents` | Lets macOS sandboxed commands send Apple Events. | ✅ | ⛔ | ⛔ Unavailable | — | ⏳ | user/managed only; macOS only |
| INV-SET-062 | `sandbox.ripgrep` | Points the sandbox at a custom ripgrep binary. | ✅ | ✅ | ⚪ Default | — | ⏳ | user/managed only; Taken whole under managed merge (v2.1.257) |
| INV-SET-063 | `sandbox.bwrapPath` | Absolute path to a bubblewrap binary installed outside PATH. | ✅ | ✅ | ⚪ Default | [ENV-006](../03-test-plan/catalog/env.md#env-006) | ⏳ | 🔒 managed-only; Set only if the image vendors `bwrap` off `PATH`; Linux/WSL2 only |
| INV-SET-064 | `sandbox.socatPath` | Absolute path to a socat binary installed outside PATH. | ✅ | ✅ | ⚪ Default | [ENV-006](../03-test-plan/catalog/env.md#env-006) | ⏳ | 🔒 managed-only; Linux/WSL2 only |
| INV-SET-065 | `sandbox.credentials` | Credential files and env vars to hide or mask from sandboxed commands. | ✅ | ✅ | 🟡 Restrict | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009), [IDN-008](../03-test-plan/catalog/identity.md#idn-008) | ⏳ | No built-in deny list; `mask` honored only from user/managed/`--settings`; invalid managed entries degrade to deny (v2.1.221) |
| INV-SET-066 | `sandbox.credentials.files` | Credential files or directories to deny or mask inside the sandbox. | ✅ | ✅ | 🟡 Restrict | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009), [IDN-008](../03-test-plan/catalog/identity.md#idn-008) | ⏳ | set in managed policy: deny/mask Azure, `gh`, and key files; `mask` min v2.1.221; repo `mask` entries dropped |
| INV-SET-067 | `sandbox.credentials.files[].extract` | Regex capture group that limits masking to part of a file. | ✅ | ✅ | ⚪ Default | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) | ⏳ | user/managed only; Mask field; min v2.1.221 |
| INV-SET-068 | `sandbox.credentials.files[].onExtractNoMatch` | What happens when extract or decode finds nothing: warn, deny, or error. | ✅ | ✅ | 🟡 Restrict | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) | ⏳ | user/managed only; proposed: set `"deny"` on managed mask entries [verify]; min v2.1.221, decode case v2.1.224 |
| INV-SET-069 | `sandbox.credentials.files[].decode` | Replaces verified JWTs in a file with structurally valid fake tokens. | ✅ | ✅ | ⚪ Default | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) | ⏳ | user/managed only; Mask field; min v2.1.224 |
| INV-SET-070 | `sandbox.credentials.files[].maskClaims` | Masks only the named payload claims inside each verified JWT. | ✅ | ✅ | ⚪ Default | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) | ⏳ | user/managed only; Needs `decode`; min v2.1.224 |
| INV-SET-071 | `sandbox.credentials.files[].maskDuplicates` | Also replaces verbatim copies of masked values elsewhere in the file. | ✅ | ✅ | ⚪ Default | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) | ⏳ | user/managed only; Only with `extract` or `decode`; min v2.1.221 |
| INV-SET-072 | `sandbox.credentials.files[].injectHosts` | Hosts where the sandbox proxy substitutes the real file value. | ✅ | ✅ | 🟡 Restrict | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009), [SBX-005](../03-test-plan/catalog/sandbox.md#sbx-005) | ⏳ | user/managed only; proposed: narrow to each token's own host, such as `api.github.com`; must be in `allowedDomains`; min v2.1.221 |
| INV-SET-073 | `sandbox.credentials.envVars` | Environment variables to remove or mask inside the sandbox. | ✅ | ✅ | 🟡 Restrict | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009), [IDN-008](../03-test-plan/catalog/identity.md#idn-008) | ⏳ | set in managed policy: deny `ANTHROPIC_FOUNDRY_API_KEY` and Azure vars, mask `GITHUB_TOKEN` [verify]; repo `mask` entries dropped |
| INV-SET-074 | `sandbox.credentials.envVars[].extract` | Regex capture group that limits masking to part of a value. | ✅ | ✅ | ⚪ Default | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) | ⏳ | user/managed only; Mask field; cannot combine with `decode`; min v2.1.224 |
| INV-SET-075 | `sandbox.credentials.envVars[].onExtractNoMatch` | What happens when extract matches nothing: warn, deny, or error. | ✅ | ✅ | 🟡 Restrict | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) | ⏳ | user/managed only; proposed: set `"deny"` on managed mask entries [verify]; `decode` entries accept `warn` only; min v2.1.224 |
| INV-SET-076 | `sandbox.credentials.envVars[].decode` | Replaces a JWT value with a structurally valid fake token. | ✅ | ✅ | ⚪ Default | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) | ⏳ | user/managed only; Mask field; min v2.1.224 |
| INV-SET-077 | `sandbox.credentials.envVars[].maskClaims` | Masks only the named payload claims inside a JWT value. | ✅ | ✅ | ⚪ Default | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) | ⏳ | user/managed only; Needs `decode`; min v2.1.224 |
| INV-SET-078 | `sandbox.credentials.envVars[].injectHosts` | Hosts where the sandbox proxy substitutes the real variable value. | ✅ | ✅ | 🟡 Restrict | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009), [SBX-005](../03-test-plan/catalog/sandbox.md#sbx-005) | ⏳ | user/managed only; proposed: narrow per token, such as `api.github.com`; IPv6 written as a bare address |
| INV-SET-079 | `sandbox.credentials.allowPlaintextInject` | Allows mask substitution on plain HTTP as well as terminated HTTPS. | ✅ | ✅ | 🔴 Block | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009) | ⏳ | user/managed only; Weakening key (cleartext credentials); keep `false`, set explicitly in managed policy |
| INV-SET-080 | `sandbox.credentials.awsPairs` | Groups custom-named AWS variables into one credential for SigV4 re-signing. | ✅ | ✅ | ⚪ Default | — | ⏳ | user/managed only; AWS only, not used here; min v2.1.224 |
| INV-SET-081 | `sandbox.credentials.sigv4` | Proxy handling for AWS request forms it cannot re-sign. | ✅ | ✅ | ⚪ Default | — | ⏳ | user/managed only; AWS only, not used here; min v2.1.224 |
| INV-SET-082 | `sandbox.network` | Object with host, port, and socket rules for sandboxed commands. | ✅ | ✅ | 🟡 Restrict | [SBX-005](../03-test-plan/catalog/sandbox.md#sbx-005), [SBX-006](../03-test-plan/catalog/sandbox.md#sbx-006) | ⏳ | `WebFetch(domain:...)` rules feed the same lists |
| INV-SET-083 | `sandbox.network.allowUnixSockets` | Unix socket paths sandboxed commands may connect to on macOS. | ✅ | ⛔ | ⛔ Unavailable | [SBX-013](../03-test-plan/catalog/sandbox.md#sbx-013) | ⏳ | Ignored on Linux; see `allowAllUnixSockets` |
| INV-SET-084 | `sandbox.network.allowAllUnixSockets` | Lets sandboxed commands connect to every Unix socket. | ✅ | ✅ | 🔴 Block | [SBX-013](../03-test-plan/catalog/sandbox.md#sbx-013) | ⏳ | Weakening key; set `false` in managed policy (overrides users); `docker.sock` not mounted (CTL-03); on WSL2 also reopens interop |
| INV-SET-085 | `sandbox.network.allowLocalBinding` | Lets macOS sandboxed commands listen on ports and reach localhost. | ✅ | ⛔ | ⚪ Default | [SBX-012](../03-test-plan/catalog/sandbox.md#sbx-012) | ⏳ | No effect on Linux (each command gets its own loopback); SBX-012 records the dev-server decision |
| INV-SET-086 | `sandbox.network.allowMachLookup` | Extra XPC and Mach services the macOS sandbox may look up. | ✅ | ⛔ | ⛔ Unavailable | — | ⏳ | macOS only |
| INV-SET-087 | `sandbox.network.allowedDomains` | Domains sandboxed commands may reach without prompting. | ✅ | ✅ | 🟡 Restrict | [SBX-005](../03-test-plan/catalog/sandbox.md#sbx-005), [SBX-006](../03-test-plan/catalog/sandbox.md#sbx-006), [NET-001](../03-test-plan/catalog/network.md#net-001) | ⏳ | set in managed policy: Foundry endpoint, `github.com`, internal mirror; managed-only via `allowManagedDomainsOnly`; IPv6 brackets v2.1.229 |
| INV-SET-088 | `sandbox.network.deniedDomains` | Domains always blocked for sandboxed commands. | ✅ | ✅ | 🟡 Restrict | [SBX-005](../03-test-plan/catalog/sandbox.md#sbx-005), [NET-009](../03-test-plan/catalog/network.md#net-009) | ⏳ | Managed: exfil-prone hosts (e.g. gist, uploads) [verify]; merges from every scope, so users can only tighten |
| INV-SET-089 | `sandbox.network.strictAllowlist` | Denies hosts outside the allowlist instead of prompting. | ✅ | ✅ | 🔴 Block | [SBX-005](../03-test-plan/catalog/sandbox.md#sbx-005) | ⏳ | user/managed only; set in managed policy: `true`; repo cannot change it; min v2.1.219 |
| INV-SET-090 | `sandbox.network.allowManagedDomainsOnly` | Honors only managed allowedDomains and WebFetch allow rules. | ✅ | ✅ | 🔴 Block | [SBX-006](../03-test-plan/catalog/sandbox.md#sbx-006) | ⏳ | 🔒 managed-only; set in managed policy: `true`; also makes sandbox admin-required and proxy ports managed-only |
| INV-SET-091 | `sandbox.network.httpProxyPort` | Sends sandbox HTTP traffic to your own proxy instead of Claude Code's. | ✅ | ✅ | ⚪ Default | [NET-005](../03-test-plan/catalog/network.md#net-005), [NET-012](../03-test-plan/catalog/network.md#net-012) | ⏳ | Your proxy then does all filtering; managed-only under `allowManagedDomainsOnly`; [verify] chaining to corporate proxy |
| INV-SET-092 | `sandbox.network.socksProxyPort` | Sends sandbox SOCKS traffic to your own SOCKS5 proxy. | ✅ | ✅ | ⚪ Default | [NET-005](../03-test-plan/catalog/network.md#net-005) | ⏳ | Same limits as `httpProxyPort` |
| INV-SET-093 | `sandbox.network.tlsTerminate` | Makes the sandbox proxy terminate TLS so it can read HTTPS requests. | ✅ | ✅ | 🟡 Restrict | [SBX-009](../03-test-plan/catalog/sandbox.md#sbx-009), [NET-005](../03-test-plan/catalog/network.md#net-005) | ⏳ | user/managed only; Experimental; needed for `mask`; set in managed policy only if mask entries are used [verify]; optional `caCertPath`/`caKeyPath` |

## MCP

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-094 | `allowAllClaudeAiMcps` | Loads claude.ai connectors alongside a deployed managed-mcp.json. | ⛔ | ✅ | ⛔ Unavailable | [EXT-011](../03-test-plan/catalog/extensions.md#ext-011) | ⏳ | 🔒 managed-only; claude.ai connectors need a claude.ai login; never set |
| INV-SET-095 | `allowClaudeInChromeWithManagedMcp` | Lets the Claude in Chrome server run alongside managed-mcp.json. | ⛔ | ⛔ | ⛔ Unavailable | [SURF-010](../03-test-plan/catalog/surfaces.md#surf-010) | ⏳ | 🔒 managed-only; Device sources only; Chrome needs a claude.ai subscription and a browser; min v2.1.282 |
| INV-SET-096 | `allowedMcpServers` | Allowlist of MCP servers users can add. | ✅ | ✅ | 🔴 Block | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001), [EXT-002](../03-test-plan/catalog/extensions.md#ext-002), [EXT-012](../03-test-plan/catalog/extensions.md#ext-012) | ⏳ | set in managed policy: `[]` (blocks every user-added server); built-in and managed servers exempt (managed-mcp.json exemption v2.1.259) |
| INV-SET-097 | `allowManagedMcpServersOnly` | Applies only the managed MCP allowlist. | ✅ | ✅ | 🔴 Block | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001), [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | 🔒 managed-only; set in managed policy: `true` |
| INV-SET-098 | `deniedMcpServers` | Denylist of MCP servers, applied everywhere including built-ins. | ✅ | ✅ | ⚪ Default | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002), [SURF-010](../03-test-plan/catalog/surfaces.md#surf-010) | ⏳ | Merges from every scope; optional managed entry for `claude-in-chrome` [verify] |
| INV-SET-099 | `disableClaudeAiConnectors` | Stops fetching and connecting claude.ai MCP connectors. | ✅ | ✅ | 🔴 Block | [EXT-011](../03-test-plan/catalog/extensions.md#ext-011) | ⏳ | set in managed policy: `true` (defense in depth; `true` from any scope wins) |
| INV-SET-100 | `disabledMcpjsonServers` | Rejects named servers from a project's .mcp.json file. | ✅ | ✅ | ⚪ Default | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001) | ⏳ | Moot under the empty managed allowlist |
| INV-SET-101 | `enableAllProjectMcpServers` | Auto-approves every server in project .mcp.json files. | ✅ | ✅ | 🔴 Block | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001) | ⏳ | Weakening key; `allowManagedMcpServersOnly` plus empty `allowedMcpServers` still block approved servers |
| INV-SET-102 | `enabledMcpjsonServers` | Auto-approves named servers from project .mcp.json files. | ✅ | ✅ | 🔴 Block | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001) | ⏳ | Same enforcement as `enableAllProjectMcpServers` |
| INV-SET-103 | `managedMcpServers` | Remote MCP servers provided to every user from managed settings. | ✅ | ✅ | ⚪ Default | [EXT-012](../03-test-plan/catalog/extensions.md#ext-012) | ⏳ | 🔒 managed-only; Unset at start (no MCP); channel for future approved servers; min v2.1.259 |

## Plugins, marketplaces & mods

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-104 | `allowedChannelPlugins` | Replaces the default allowlist of channel plugins that can push messages. | ⛔ | ✅ | ⛔ Unavailable | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | 🔒 managed-only; Channels not available on Foundry; string form min v2.1.267 |
| INV-SET-105 | `blockedMarketplaces` | Blocklist of plugin marketplace sources. | ✅ | ✅ | ⚪ Default | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | 🔒 managed-only; Redundant under `strictKnownMarketplaces: []`; owner wildcard v2.1.223 |
| INV-SET-106 | `channelsEnabled` | Allows channels for the organization. | ⛔ | ✅ | ⛔ Unavailable | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | 🔒 managed-only; Channels not available on Foundry; leave unset |
| INV-SET-107 | `disableCommandPluginSources` | Blocks command-sourced plugins and marketplace headersHelper commands. | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | 🔒 managed-only; Unset follows `allowManagedHooksOnly: true`, so blocked; may set `true` explicitly; min v2.1.229 |
| INV-SET-108 | `pluginSuggestionMarketplaces` | Marketplaces whose plugins may appear as contextual install suggestions. | ✅ | ✅ | ⚪ Default | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | 🔒 managed-only; Unset: no suggestions |
| INV-SET-109 | `pluginTrustMessage` | Organization text added to the plugin trust warning. | ✅ | ✅ | ⚪ Default | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | 🔒 managed-only; Not needed while plugins are blocked |
| INV-SET-110 | `strictKnownMarketplaces` | Allowlist of marketplace sources users may add and install from. | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | 🔒 managed-only; set in managed policy: `[]` (blocks every source, the official one and `@skills-dir` plugins included) |
| INV-SET-111 | `allowedMarketplaces` | Alias for strictKnownMarketplaces. | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | 🔒 managed-only; Alias since v2.1.232; keep the canonical name in the managed file |
| INV-SET-112 | `strictPluginOnlyCustomization` | Allows skills, agents, hooks, or MCP only from plugins or managed settings. | ✅ | ✅ | ⚪ Default | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005), [EXT-008](../03-test-plan/catalog/extensions.md#ext-008), [EXT-009](../03-test-plan/catalog/extensions.md#ext-009) | ⏳ | 🔒 managed-only; Leave unset: would block project skills and agents; hooks and MCP already managed-only |
| INV-SET-113 | `strictPluginOnlyCustomization.skills` | Locks user and project skills and commands to plugin or managed sources. | ✅ | ✅ | ⚪ Default | [EXT-008](../03-test-plan/catalog/extensions.md#ext-008) | ⏳ | 🔒 managed-only; Do not lock: project skills allowed |
| INV-SET-114 | `strictPluginOnlyCustomization.agents` | Locks user and project agents to plugin or managed sources. | ✅ | ✅ | ⚪ Default | [EXT-009](../03-test-plan/catalog/extensions.md#ext-009) | ⏳ | 🔒 managed-only; Do not lock: project agents allowed |
| INV-SET-115 | `strictPluginOnlyCustomization.hooks` | Stops hooks from user, project, and local settings files. | ✅ | ✅ | ⚪ Default | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | 🔒 managed-only; Redundant with `allowManagedHooksOnly` |
| INV-SET-116 | `strictPluginOnlyCustomization.mcp` | Stops MCP servers from ~/.claude.json and .mcp.json. | ✅ | ✅ | ⚪ Default | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001), [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | 🔒 managed-only; Redundant with `allowManagedMcpServersOnly` |
| INV-SET-117 | `enabledPlugins` | Turns plugins on or off by plugin@marketplace ID. | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Moot: `strictKnownMarketplaces: []` blocks every marketplace; managed `false` hides a plugin everywhere; built-in plugins [verify] |
| INV-SET-118 | `extraKnownMarketplaces` | Pre-registers named plugin marketplaces. | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Blocked by `strictKnownMarketplaces: []`; repo entries wait for trust; same-name entries taken whole since v2.1.228; `headersHelper` v2.1.238 |
| INV-SET-119 | `additionalMarketplaces` | Alias for extraKnownMarketplaces. | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Alias since v2.1.232; same enforcement |
| INV-SET-120 | `pluginConfigs` | Stores plugin userConfig answers and built-in plugin options by plugin ID. | ✅ | ✅ | 🟡 Restrict | [EXT-014](../03-test-plan/catalog/extensions.md#ext-014) | ⏳ | user/managed only; Managed sets the built-in guard option `allowManagedModsOnly`; repo entries ignored |
| INV-SET-121 | `allowManagedModsOnly` | Built-in guard option that refuses mods users install themselves. | ✅ | ✅ | 🔴 Block | [EXT-014](../03-test-plan/catalog/extensions.md#ext-014) | ⏳ | 🔒 managed-only; Under `pluginConfigs["cc-plugin-sec-default@builtin"].options`; set in managed policy: `true` |
| INV-SET-122 | `prependPlugins` | Managed plugins whose mods run before every user-installed mod. | ✅ | ✅ | ⚪ Default | [EXT-014](../03-test-plan/catalog/extensions.md#ext-014) | ⏳ | user/managed only; Leave unset; a managed list must name `sec-default@builtin` to keep the built-in guard |
| INV-SET-123 | `appendPlugins` | Managed plugins whose mods run after every user-installed mod. | ✅ | ✅ | ⚪ Default | [EXT-014](../03-test-plan/catalog/extensions.md#ext-014) | ⏳ | user/managed only; Leave unset |
| INV-SET-124 | `syncClaudeAiPlugins` | Stops downloading plugins enabled for the claude.ai account. | ⛔ | ✅ | ⛔ Unavailable | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | user/local/managed only; Needs a claude.ai login; min v2.1.273 |

## Skills & agents

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-125 | `agent` | Runs the main thread as a named subagent with its prompt, tools, and model. | ✅ | ✅ | 🟢 Allow | [FEAT-008](../03-test-plan/catalog/features.md#feat-008), [PERM-016](../03-test-plan/catalog/permissions.md#perm-016) | ⏳ | `--agent` overrides; a custom prompt drops the git snapshot in `-p` runs |
| INV-SET-126 | `disableBundledSkills` | Removes bundled skills and workflows from the session. | ✅ | ✅ | ⚪ Default | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Leave unset: bundled skills allowed unless they need claude.ai |
| INV-SET-127 | `disableSkillShellExecution` | Replaces inline shell in skills and commands with a policy notice. | ✅ | ✅ | 🔴 Block | [EXT-010](../03-test-plan/catalog/extensions.md#ext-010) | ⏳ | set in managed policy: `true`; cannot be overridden; bundled and managed skills unaffected |
| INV-SET-128 | `skillOverrides` | Hides or collapses skills without editing their SKILL.md. | ✅ | ✅ | 🟢 Allow | [FEAT-009](../03-test-plan/catalog/features.md#feat-009), [EXT-008](../03-test-plan/catalog/extensions.md#ext-008) | ⏳ | `/skills` writes the local file; managed could hide claude.ai-only bundled skills [verify] |
| INV-SET-129 | `syncClaudeAiSkills` | Stops downloading skills enabled for the claude.ai account. | ⛔ | ✅ | ⛔ Unavailable | [EXT-008](../03-test-plan/catalog/extensions.md#ext-008) | ⏳ | user/local/managed only; Needs a claude.ai login |
| INV-SET-130 | `skillListingBudgetFraction` | Share of the context window reserved for the skill listing. | ✅ | ✅ | ⚪ Default | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Default `0.01` |
| INV-SET-131 | `skillListingMaxDescChars` | Per-skill character cap on descriptions in the skill listing. | ✅ | ✅ | ⚪ Default | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Default `1536` |

## Hooks & workflows

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-132 | `allowedHttpHookUrls` | URL patterns that HTTP hooks may target. | ✅ | ✅ | ⚪ Default | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005), [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | User HTTP hooks already blocked; pin to the collector if the audit hook is HTTP [verify] |
| INV-SET-133 | `allowManagedHooksOnly` | Runs only managed, SDK, and force-enabled plugin hooks. | ✅ | ✅ | 🔴 Block | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005), [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | 🔒 managed-only; set in managed policy: `true`; also gates status line and file suggestion, disables command plugin sources (`headersHelper` block v2.1.238), blocks `/goal` |
| INV-SET-134 | `disableAllHooks` | Turns off hooks, the custom status line, and custom file suggestion. | ✅ | ✅ | ⚪ Default | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Not set in managed (would stop the audit hook); a user value cannot stop managed hooks; SDK hooks survive a managed value since v2.1.242 |
| INV-SET-135 | `disableWorkflows` | Turns off dynamic workflows and bundled workflow commands. | ✅ | ✅ | ⚪ Default | — | ⏳ | [verify] decision: cost exposure (R-15) |
| INV-SET-136 | `enableWorkflows` | Personal on or off switch for dynamic workflows. | ✅ | ✅ | 🟢 Allow | — | ⏳ | Cannot override `disableWorkflows` |
| INV-SET-137 | `hooks` | Lifecycle hook handlers: command, prompt, agent, HTTP, or MCP tool. | ✅ | ✅ | 🟡 Restrict | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005), [EXT-006](../03-test-plan/catalog/extensions.md#ext-006), [FEAT-019](../03-test-plan/catalog/features.md#feat-019), [POL-015](../03-test-plan/catalog/policy.md#pol-015) | ⏳ | Managed audit hook (and quality gates) only; others blocked by `allowManagedHooksOnly` |
| INV-SET-138 | `httpHookAllowedEnvVars` | Outer allowlist of env vars HTTP hooks may put in headers. | ✅ | ✅ | ⚪ Default | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Applies to managed hooks too |
| INV-SET-139 | `workflowKeywordTriggerEnabled` | Makes typing the word ultracode trigger a dynamic workflow. | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-SET-140 | `workflowSizeGuideline` | Advisory agent-count target for the dynamic workflows Claude writes. | ✅ | ✅ | ⚪ Default | — | ⏳ | Advice, not a cap; min v2.1.219 |

## Memory & context

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-141 | `autoCompactEnabled` | Compacts the conversation automatically as context nears the limit. | ✅ | ✅ | 🟢 Allow | [FEAT-006](../03-test-plan/catalog/features.md#feat-006), [COST-009](../03-test-plan/catalog/cost.md#cost-009) | ⏳ |  |
| INV-SET-142 | `autoCompactWindow` | Context size in tokens that triggers automatic compaction. | ✅ | ✅ | 🟢 Allow | [COST-009](../03-test-plan/catalog/cost.md#cost-009) | ⏳ | 100000 to 1000000 tokens |
| INV-SET-143 | `autoMemoryDirectory` | Custom directory for auto memory storage. | ✅ | ✅ | ⚪ Default | [DATA-010](../03-test-plan/catalog/data.md#data-010), [FEAT-005](../03-test-plan/catalog/features.md#feat-005) | ⏳ | Repo value honored only after trust; keep the default under `~/.claude/projects` |
| INV-SET-144 | `autoMemoryEnabled` | Turns auto memory reading and writing on or off. | ✅ | ✅ | 🟢 Allow | [FEAT-005](../03-test-plan/catalog/features.md#feat-005), [DATA-010](../03-test-plan/catalog/data.md#data-010) | ⏳ |  |
| INV-SET-145 | `bashOutputMaxChars` | Inline character limit for successful command output Claude receives. | ✅ | ✅ | ⚪ Default | — | ⏳ | 4000 to 128000; min v2.1.261 |
| INV-SET-146 | `claudeMd` | Organization CLAUDE.md text injected from managed settings. | ✅ | ✅ | ⚪ Default | [FEAT-004](../03-test-plan/catalog/features.md#feat-004), [POL-017](../03-test-plan/catalog/policy.md#pol-017) | ⏳ | 🔒 managed-only; alternative to the managed CLAUDE.md file `/etc/claude-code/CLAUDE.md` used by ADR-015 (packages only from Nexus, don't change registry settings, web tools are off). Use one, not both. |
| INV-SET-147 | `claudeMdExcludes` | Glob patterns for CLAUDE.md files to skip when memory loads. | ✅ | ✅ | 🟢 Allow | [FEAT-004](../03-test-plan/catalog/features.md#feat-004) | ⏳ | Cannot exclude managed CLAUDE.md |
| INV-SET-148 | `fileCheckpointingEnabled` | Snapshots files before edits so /rewind can restore them. | ✅ | ✅ | 🟢 Allow | [FEAT-003](../03-test-plan/catalog/features.md#feat-003) | ⏳ | Ignored in `-p` and Agent SDK sessions |
| INV-SET-149 | `idleCompaction` | Compacts idle long conversations shortly before the prompt cache expires. | ❓ | ✅ | ⚪ Default | [COST-009](../03-test-plan/catalog/cost.md#cost-009) | ⏳ | Needs feature-flag fetch from Anthropic; likely inactive with nonessential traffic off [verify]; min v2.1.290 |
| INV-SET-150 | `pluginConfigs["cc-plugin-agents-md@builtin"].options.instructionFiles` | Built-in option choosing whether Claude Code reads AGENTS.md instruction files. | ✅ | ✅ | 🟢 Allow | [FEAT-004](../03-test-plan/catalog/features.md#feat-004) | ⏳ | user/managed only; Project instructions setting; plugin ID was `agents-md@builtin` before v2.1.285 |
| INV-SET-151 | `plansDirectory` | Where plan mode stores its plan files. | ✅ | ✅ | 🟢 Allow | [FEAT-002](../03-test-plan/catalog/features.md#feat-002) | ⏳ |  |
| INV-SET-152 | `taskOutputMaxChars` | Removed inline limit for background task output. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.277; no effect |

## Environment & auth

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-153 | `env` | Environment variables applied to every session and its subprocesses. | ✅ | ✅ | 🟡 Restrict | [POL-012](../03-test-plan/catalog/policy.md#pol-012), [TEL-001](../03-test-plan/catalog/telemetry.md#tel-001), [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005), [NET-003](../03-test-plan/catalog/network.md#net-003), [ENV-005](../03-test-plan/catalog/env.md#env-005) | ⏳ | set in managed policy: Foundry vars, `ANTHROPIC_DEFAULT_*_MODEL`, OTel, `DISABLE_AUTOUPDATER`, nonessential/error reporting off; repo OTel vars ignored (v2.1.282) |
| INV-SET-154 | `apiKeyHelper` | Command that generates the API credential sent with model requests. | ❓ | ✅ | 🟡 Restrict | [EXT-015](../03-test-plan/catalog/extensions.md#ext-015), [IDN-002](../03-test-plan/catalog/identity.md#idn-002) | ⏳ | Not used (Entra ID); repo value waits for trust; managed precedence over user value under test [verify]; JWT-expiry rerun v2.1.246 |
| INV-SET-155 | `awsAuthRefresh` | Command that refreshes Bedrock credentials in the .aws directory. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Amazon Bedrock only |
| INV-SET-156 | `awsCredentialExport` | Command that prints AWS credentials as JSON for Bedrock. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Amazon Bedrock only |
| INV-SET-157 | `gcpAuthRefresh` | Command that refreshes Google Cloud application default credentials. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Google Cloud Agent Platform only |
| INV-SET-158 | `proxyAuthHelper` | Helper key named only in the managed-sources merge table. | ❓ | ❓ | ⚪ Default | [NET-005](../03-test-plan/catalog/network.md#net-005) | ⏳ | No entry of its own on the reference [verify]; read from the highest-priority source only |

## Provider & login restrictions

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-159 | `allowedProviders` | Providers a machine may use to reach Claude. | ✅ | ✅ | 🟡 Restrict | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [IDN-014](../03-test-plan/catalog/identity.md#idn-014) | ⏳ | 🔒 managed-only; set in managed policy: `["foundry"]` for the direct stage; add `gateway` once ADR-013 is accepted [verify value]; an empty list refuses every provider; min v2.1.285 |
| INV-SET-160 | `forceLoginMethod` | Restricts login to claude.ai, Console, or a cloud gateway. | ✅ | ✅ | 🟡 Restrict | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [IDN-014](../03-test-plan/catalog/identity.md#idn-014) | ⏳ | Gateway overlay (ADR-013): `"gateway"`, paired with `forceLoginGatewayUrl`, in the managed file. Not set in the direct-Foundry stage. All login paths enforce it since v2.1.212. |
| INV-SET-161 | `forceLoginGatewayUrl` | Gateway URL that the /login Cloud gateway screen connects to. | ✅ | ✅ | 🟡 Restrict | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [IDN-014](../03-test-plan/catalog/identity.md#idn-014) | ⏳ | user/managed only; gateway overlay (ADR-013): `https://<claude-gateway>.<internal-domain>`. Makes the machine gateway-only, which is the intent once the gateway is accepted. |
| INV-SET-162 | `forceLoginOrgUUID` | Restricts claude.ai logins to the listed organization UUIDs. | ⛔ | ✅ | ⛔ Unavailable | [POL-013](../03-test-plan/catalog/policy.md#pol-013) | ⏳ | claude.ai login only |
| INV-SET-163 | `gatewayInternalNetworks` | Public IPv4 blocks where /login accepts a cloud gateway. | ✅ | ✅ | ⚪ Default | [NET-016](../03-test-plan/catalog/network.md#net-016) | ⏳ | 🔒 managed-only; only needed if the gateway sits on public IPv4 space the company owns. Expected unset: the gateway gets a private IP reached over ExpressRoute (ADR-013); min v2.1.268 |

## Privacy & telemetry

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-164 | `cleanupPeriodDays` | Days to keep transcripts and app data before deletion. | ✅ | ✅ | 🟡 Restrict | [DATA-003](../03-test-plan/catalog/data.md#data-003) | ⏳ | set in managed policy: `<retention-days>` per ADR; default 30, minimum 1 |
| INV-SET-165 | `desktopSessionCleanupPeriodDays` | Age limit for Desktop and Cowork session transcripts. | ❓ | ⛔ | ⛔ Unavailable | [DATA-003](../03-test-plan/catalog/data.md#data-003) | ⏳ | user/managed only; Desktop and Cowork only [verify]; min v2.1.248 |
| INV-SET-166 | `feedbackDrafts` | Controls Claude-drafted feedback cards and the SendFeedback tool. | ✅ | ✅ | 🔴 Block | [DATA-007](../03-test-plan/catalog/data.md#data-007) | ⏳ | user/managed only; set in managed policy: `"off"` (removes SendFeedback); managed beats user |
| INV-SET-167 | `feedbackSurveyRate` | Probability that the session quality survey appears. | ✅ | ✅ | 🔴 Block | [DATA-007](../03-test-plan/catalog/data.md#data-007), [NET-003](../03-test-plan/catalog/network.md#net-003) | ⏳ | set in managed policy: `0`; Foundry default rate is 0.005 |
| INV-SET-168 | `skipWebFetchPreflight` | Skips sending WebFetch hostnames to api.anthropic.com for a safety check. | ✅ | ✅ | 🟡 Restrict | [NET-006](../03-test-plan/catalog/network.md#net-006), [NET-003](../03-test-plan/catalog/network.md#net-003), [PERM-014](../03-test-plan/catalog/permissions.md#perm-014) | ⏳ | set in managed policy: `true` (policy v0.2, ADR-016); Anthropic egress is blocked and WebFetch is disabled |
| INV-SET-169 | `otelHeadersHelper` | Command that generates headers for OpenTelemetry exports. | ✅ | ✅ | 🟡 Restrict | [TEL-001](../03-test-plan/catalog/telemetry.md#tel-001), [TEL-005](../03-test-plan/catalog/telemetry.md#tel-005), [EXT-015](../03-test-plan/catalog/extensions.md#ext-015) | ⏳ | Managed value only if the collector needs rotating tokens; user-value handling under test [verify] |

## Git & attribution

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-170 | `attribution` | Customizes the commit trailer and pull request attribution text. | ✅ | ✅ | 🟡 Restrict | [FEAT-015](../03-test-plan/catalog/features.md#feat-015) | ⏳ | set in managed policy: `<org-attribution>`; managed lines outrank CLAUDE.md; `false` value v2.1.281 |
| INV-SET-171 | `attribution.commit` | Attribution text and trailers added to git commits. | ✅ | ✅ | 🟡 Restrict | [FEAT-015](../03-test-plan/catalog/features.md#feat-015) | ⏳ | set in managed policy as part of `attribution` |
| INV-SET-172 | `attribution.pr` | Attribution text added to pull request descriptions. | ✅ | ✅ | 🟡 Restrict | [FEAT-015](../03-test-plan/catalog/features.md#feat-015) | ⏳ | set in managed policy as part of `attribution` |
| INV-SET-173 | `attribution.sessionUrl` | Appends the claude.ai session link from cloud or Remote Control sessions. | ⛔ | ✅ | ⛔ Unavailable | [FEAT-015](../03-test-plan/catalog/features.md#feat-015) | ⏳ | Cloud and Remote Control sessions only |
| INV-SET-174 | `includeCoAuthoredBy` | Deprecated Boolean for commit and pull request attribution. | ✅ | ✅ | ⚪ Default | [FEAT-015](../03-test-plan/catalog/features.md#feat-015) | ⏳ | Deprecated since v2.0.62; ignored once `attribution` is set |
| INV-SET-175 | `includeGitInstructions` | Includes built-in git workflow instructions and the git status snapshot. | ✅ | ✅ | 🟢 Allow | [FEAT-015](../03-test-plan/catalog/features.md#feat-015) | ⏳ |  |
| INV-SET-176 | `prUrlTemplate` | Rewrites rendered PR links to point at an internal review tool. | ✅ | ✅ | ⚪ Default | — | ⏳ | GitHub is the SCM |

## Updates & versions

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-177 | `autoUpdatesChannel` | Release channel auto-updates follow: latest or stable. | ✅ | ✅ | ⚪ Default | [ENV-005](../03-test-plan/catalog/env.md#env-005), [OPS-001](../03-test-plan/catalog/operations.md#ops-001) | ⏳ | Moot: `DISABLE_AUTOUPDATER` in managed env and version pinned in image |
| INV-SET-178 | `minimumVersion` | Version floor below which updates will not install. | ✅ | ✅ | ⚪ Default | [ENV-005](../03-test-plan/catalog/env.md#env-005) | ⏳ | Constrains updates only, not startup |
| INV-SET-179 | `requiredMaximumVersion` | Newest Claude Code version allowed to start. | ✅ | ✅ | 🟡 Restrict | [POL-010](../03-test-plan/catalog/policy.md#pol-010), [OPS-001](../03-test-plan/catalog/operations.md#ops-001), [OPS-002](../03-test-plan/catalog/operations.md#ops-002) | ⏳ | 🔒 managed-only; set in managed policy: `2.1.301` (pin); min v2.1.163 |
| INV-SET-180 | `requiredMinimumVersion` | Oldest Claude Code version allowed to start. | ✅ | ✅ | 🟡 Restrict | [POL-010](../03-test-plan/catalog/policy.md#pol-010), [OPS-001](../03-test-plan/catalog/operations.md#ops-001) | ⏳ | 🔒 managed-only; set in managed policy: `2.1.301` (pin); min v2.1.163 |

## UI & terminal

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-181 | `askUserQuestionTimeout` | Auto-continues an unanswered AskUserQuestion dialog after idle time. | ✅ | ✅ | 🟢 Allow | — | ⏳ | user/managed only |
| INV-SET-182 | `autoContinueAtUsageLimit` | Waits and resumes the task after a claude.ai usage limit resets. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | user/managed only; claude.ai usage limits only; min v2.1.234 |
| INV-SET-183 | `autoScrollEnabled` | Follows new output to the bottom in fullscreen rendering. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-184 | `axScreenReader` | Renders flat, screen-reader friendly output. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-185 | `bashEditDiffEnabled` | Records files changed while Bash commands run, in every mode. | ✅ | ✅ | ⚪ Default | [FEAT-026](../03-test-plan/catalog/features.md#feat-026), [FEAT-019](../03-test-plan/catalog/features.md#feat-019) | ⏳ | user/managed only; Gives PostToolUse hooks the changed files; min v2.1.269 |
| INV-SET-186 | `companyAnnouncements` | Organization announcements shown at startup. | ✅ | ✅ | ⚪ Default | — | ⏳ | Optional managed message |
| INV-SET-187 | `defaultShell` | Shell for !-prefixed commands: bash or powershell. | ✅ | ✅ | 🟢 Allow | [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ | PowerShell needs `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` on Foundry and Linux |
| INV-SET-188 | `dialogExpiry` | Deadline for dialogs forwarded to remote clients and held messages. | ✅ | ✅ | ⚪ Default | — | ⏳ | user/managed only; min v2.1.224 |
| INV-SET-189 | `editorMode` | Prompt key bindings: normal or vim. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-190 | `emojiCompletionEnabled` | Emoji shortcode suggestions and replacement in the prompt. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | min v2.1.217 |
| INV-SET-191 | `fileSuggestion` | Custom command that supplies @ file path autocomplete. | ✅ | ✅ | 🟡 Restrict | [EXT-007](../03-test-plan/catalog/extensions.md#ext-007), [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ | Runs a command; only a managed value runs under `allowManagedHooksOnly` |
| INV-SET-192 | `footerLinksRegexes` | Regex rules that turn IDs in output into footer link badges. | ✅ | ✅ | 🟢 Allow | — | ⏳ | user/managed only; Nested quantifiers can freeze the UI |
| INV-SET-193 | `keybindingFlavor` | Deprecated choice of word-editing key behavior. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Deprecated since v2.1.261; no effect |
| INV-SET-194 | `maxProseWidth` | Caps the column width of response prose. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | min v2.1.282 |
| INV-SET-195 | `prefersReducedMotion` | Reduces or turns off interface animations. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-196 | `promptSuggestionEnabled` | Shows grayed-out prompt predictions in the input. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | No effect on Foundry; only `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=1` turns them on |
| INV-SET-197 | `respectGitignore` | Makes the @ file picker skip gitignored files. | ✅ | ✅ | 🟢 Allow | [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ | Falls back to the `~/.claude.json` value |
| INV-SET-198 | `respondToBashCommands` | Whether Claude replies after you run a ! shell command. | ✅ | ✅ | 🟢 Allow | [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ |  |
| INV-SET-199 | `showClearContextOnPlanAccept` | Adds a clear-context option to the plan approval menu. | ✅ | ✅ | 🟢 Allow | [FEAT-002](../03-test-plan/catalog/features.md#feat-002) | ⏳ |  |
| INV-SET-200 | `showTurnDuration` | Shows the turn duration message after each response. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-201 | `spellcheck` | Underlines misspelled prompt words using an installed spell checker. | ✅ | ❓ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | user/managed only; Needs aspell, hunspell, or ispell in the image [verify]; min v2.1.235 |
| INV-SET-202 | `spinnerTipsEnabled` | Shows feature tips in the spinner line. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-203 | `spinnerTipsOverride` | Adds custom spinner tips or replaces the built-in ones. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Repo files contribute plain strings only (v2.1.247) |
| INV-SET-204 | `spinnerVerbs` | Adds custom spinner verbs or replaces the built-in ones. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-205 | `statusLine` | Custom command that renders a status line below the prompt. | ✅ | ✅ | 🟡 Restrict | [EXT-007](../03-test-plan/catalog/extensions.md#ext-007), [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Runs a command; only a managed value runs under `allowManagedHooksOnly` |
| INV-SET-206 | `subagentStatusLine` | Custom command that rewrites the subagent task rows. | ✅ | ✅ | 🟡 Restrict | [EXT-007](../03-test-plan/catalog/extensions.md#ext-007) | ⏳ | Same gate as `statusLine` |
| INV-SET-207 | `syntaxHighlightingDisabled` | Turns off syntax highlighting in diffs and code blocks. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-208 | `terminalProgressBarEnabled` | Reports progress to terminals that show a progress indicator. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-209 | `terminalTitleFromRename` | Uses the session name as the terminal tab title. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-210 | `theme` | Interface color theme. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-211 | `timeFormat` | Format of times shown in the interface. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | min v2.1.257 |
| INV-SET-212 | `timeZone` | Time zone for times shown in the interface. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | min v2.1.257 |
| INV-SET-213 | `tui` | Terminal renderer: classic or fullscreen. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-214 | `verbose` | Shows full tool input and output inline. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024), [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ |  |
| INV-SET-215 | `viewMode` | Transcript view a session starts in: default, verbose, or focus. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-216 | `vimInsertModeRemaps` | Maps two-key INSERT-mode sequences to Escape in vim mode. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | user/managed only; min v2.1.208 |
| INV-SET-217 | `voice` | Turns voice dictation on and sets the dictation key behavior. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Needs a claude.ai account and a microphone |
| INV-SET-218 | `voiceEnabled` | Deprecated Boolean that turns voice dictation on. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Deprecated since v2.1.92; claude.ai only |
| INV-SET-219 | `wheelScrollAccelerationEnabled` | Accelerates mouse-wheel scrolling in fullscreen rendering. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |

## Agents, worktrees & background

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-220 | `crossSessionInbound` | Accepts, holds, or refuses messages from your other sessions. | ✅ | ✅ | ⚪ Default | — | ⏳ | Same-machine only on Foundry (v2.1.248); repo value applies only if stricter; min v2.1.224 |
| INV-SET-221 | `disableAgentView` | Turns off background agents and agent view. | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Leave unset while FEAT-011 evaluates agent view |
| INV-SET-222 | `isolatePeerMachines` | Requires approval before messages reach your sessions on other machines. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Cross-machine messaging needs Remote Control (claude.ai); min v2.1.224 |
| INV-SET-223 | `processWrapper` | Corporate launcher placed in front of background processes. | ✅ | ✅ | ⚪ Default | — | ⏳ | user/managed only; Linux and macOS; min v2.1.210 |
| INV-SET-224 | `teammateMode` | Where agent-team teammates display: in-process or split panes. | ✅ | ✅ | 🟢 Allow | [FEAT-022](../03-test-plan/catalog/features.md#feat-022) | ⏳ |  |
| INV-SET-225 | `worktree` | Object configuring how Claude Code creates and isolates git worktrees. | ✅ | ✅ | 🟢 Allow | [FEAT-010](../03-test-plan/catalog/features.md#feat-010) | ⏳ |  |
| INV-SET-226 | `worktree.baseRef` | Branches new worktrees from the remote default branch or local HEAD. | ✅ | ✅ | 🟢 Allow | [FEAT-010](../03-test-plan/catalog/features.md#feat-010) | ⏳ | Default `"fresh"` |
| INV-SET-227 | `worktree.symlinkDirectories` | Directories symlinked from the main repository into each worktree. | ✅ | ✅ | 🟢 Allow | [FEAT-010](../03-test-plan/catalog/features.md#feat-010) | ⏳ |  |
| INV-SET-228 | `worktree.sparsePaths` | Directories checked out in each worktree via sparse-checkout. | ✅ | ✅ | 🟢 Allow | [FEAT-010](../03-test-plan/catalog/features.md#feat-010) | ⏳ |  |
| INV-SET-229 | `worktree.bgIsolation` | How background sessions isolate edits: worktree or none. | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011), [FEAT-010](../03-test-plan/catalog/features.md#feat-010) | ⏳ | Keep the default `"worktree"` |
| INV-SET-230 | `worktree.location` | Worktree folder for Desktop SSH sessions on a remote machine. | ❓ | ⛔ | ⛔ Unavailable | [SURF-007](../03-test-plan/catalog/surfaces.md#surf-007) | ⏳ | user only; Desktop app only [verify]; Desktop v1.44121.0+ |

## Remote, desktop & notifications

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-231 | `agentPushNotifEnabled` | Lets Claude send phone push notifications when it decides to. | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Needs Remote Control |
| INV-SET-232 | `awaySummaryEnabled` | Shows a one-line session recap after time away. | ✅ | ✅ | 🟢 Allow | — | ⏳ |  |
| INV-SET-233 | `disableArtifact` | Deprecated switch that turns off the Artifact tool. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Deprecated (use `enableArtifact`); Artifacts need claude.ai |
| INV-SET-234 | `disableDeepLinkRegistration` | Stops registering the claude-cli:// protocol handler with the OS. | ✅ | ❓ | ⚪ Default | — | ⏳ | Headless container has no desktop handler [verify] |
| INV-SET-235 | `disableDesktopLocalSessions` | Turns off on-device Code sessions in the desktop app. | ❓ | ⛔ | ⛔ Unavailable | [SURF-007](../03-test-plan/catalog/surfaces.md#surf-007) | ⏳ | 🔒 managed-only; Desktop app only [verify]; Desktop v1.37937.0+ |
| INV-SET-236 | `disableRemoteControl` | Refuses Remote Control in every form. | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Remote Control needs claude.ai; optional managed `true` as defense in depth |
| INV-SET-237 | `enableArtifact` | Turns off the Artifact tool when set to false. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Artifacts need claude.ai; `false` from any scope wins (v2.1.242) |
| INV-SET-238 | `inputNeededNotifEnabled` | Sends a phone push when a prompt is waiting for input. | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Needs Remote Control |
| INV-SET-239 | `preferredNotifChannel` | Local notification method for completions and waiting prompts. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ |  |
| INV-SET-240 | `remote.defaultEnvironmentId` | Default cloud environment for cloud sessions created from the CLI. | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Cloud sessions need claude.ai |
| INV-SET-241 | `remoteControlAtStartup` | Connects Remote Control automatically when each session starts. | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Remote Control needs claude.ai |
| INV-SET-242 | `sshConfigs` | Shared SSH connections for the desktop environment dropdown. | ❓ | ⛔ | ⛔ Unavailable | [SURF-007](../03-test-plan/catalog/surfaces.md#surf-007) | ⏳ | user/managed only; Desktop app only [verify] |
| INV-SET-243 | `sshHostAllowlist` | Hosts that desktop SSH sessions may connect to. | ❓ | ⛔ | ⛔ Unavailable | [SURF-007](../03-test-plan/catalog/surfaces.md#surf-007) | ⏳ | 🔒 managed-only; Desktop app only [verify]; Desktop v2.26454.0+ |
| INV-SET-244 | `browserExternalPageTools` | Keeps Claude's tools off external pages in the desktop Browser pane. | ❓ | ⛔ | ⛔ Unavailable | [SURF-007](../03-test-plan/catalog/surfaces.md#surf-007) | ⏳ | 🔒 managed-only; Desktop app only [verify] |
| INV-SET-245 | `disableBrowserExternalNavigation` | Turns off external browsing in the desktop Browser pane. | ❓ | ⛔ | ⛔ Unavailable | [SURF-007](../03-test-plan/catalog/surfaces.md#surf-007) | ⏳ | 🔒 managed-only; Desktop app only [verify] |
| INV-SET-246 | `disableMobileSimulatorTools` | Blocks Claude's tools for the desktop iOS Simulator pane. | ❓ | ⛔ | ⛔ Unavailable | [SURF-007](../03-test-plan/catalog/surfaces.md#surf-007) | ⏳ | 🔒 managed-only; Desktop app only [verify] |

## Managed-only administration

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-247 | `disableSideloadFlags` | Rejects --plugin-dir, --plugin-url, --agents, and --mcp-config at startup. | ✅ | ✅ | 🔴 Block | [EXT-004](../03-test-plan/catalog/extensions.md#ext-004) | ⏳ | 🔒 managed-only; set in managed policy: `true`; also covers `CLAUDE_CODE_PLUGIN_DIRS` (v2.1.280); min v2.1.193 |
| INV-SET-248 | `forceRemoteSettingsRefresh` | Blocks startup until server-managed settings are freshly fetched. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | 🔒 managed-only; Server-managed settings not available on Foundry |
| INV-SET-249 | `managedSourcesBehavior` | First-wins or merge across admin-delivered managed sources. | ✅ | ✅ | ⚪ Default | [POL-009](../03-test-plan/catalog/policy.md#pol-009) | ⏳ | 🔒 managed-only; Keep `"first-wins"` (single file source, CTL-06); min v2.1.242 |
| INV-SET-250 | `parentSettingsBehavior` | Whether embedding-host managed settings apply under the admin tier. | ✅ | ✅ | ⚪ Default | [POL-009](../03-test-plan/catalog/policy.md#pol-009), [SURF-002](../03-test-plan/catalog/surfaces.md#surf-002) | ⏳ | 🔒 managed-only; Keep `"first-wins"` |
| INV-SET-251 | `policyHelper` | Executable that computes managed settings at startup. | ✅ | ✅ | ⚪ Default | [POL-014](../03-test-plan/catalog/policy.md#pol-014) | ⏳ | 🔒 managed-only; Not used at start (static file, CTL-06); a failing helper blocks startup |
| INV-SET-252 | `policyHelper.path` | Absolute path of the policy helper executable. | ✅ | ✅ | ⚪ Default | [POL-014](../03-test-plan/catalog/policy.md#pol-014) | ⏳ | 🔒 managed-only; Required when `policyHelper` is set |
| INV-SET-253 | `policyHelper.timeoutMs` | Milliseconds to wait for the helper before the run fails. | ✅ | ✅ | ⚪ Default | [POL-014](../03-test-plan/catalog/policy.md#pol-014) | ⏳ | 🔒 managed-only; Default 10000, minimum 1000 |
| INV-SET-254 | `policyHelper.refreshIntervalMs` | Interval for re-running the helper in the background. | ✅ | ✅ | ⚪ Default | [POL-014](../03-test-plan/catalog/policy.md#pol-014) | ⏳ | 🔒 managed-only; `0` or at least 60000 |
| INV-SET-255 | `wslInheritsWindowsSettings` | Makes WSL read managed settings from the Windows policy chain. | ✅ | ⛔ | 🟡 Restrict | [ENV-008](../03-test-plan/catalog/env.md#env-008) | ⏳ | 🔒 managed-only; Windows admin sources only; proposed: `true` in HKLM so a WSL install inherits the Windows backstop [verify]; min v2.1.282 |

## Settings-file meta

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-256 | `$schema` | Points editors at the published JSON schema for settings files. | ✅ | ✅ | 🟢 Allow | — | ⏳ | From the settings page; schema can lag new keys |

## Global config

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SET-257 | `autoConnectIde` | Connects to a running IDE automatically from an external terminal. | ✅ | ✅ | 🟢 Allow | [SURF-002](../03-test-plan/catalog/surfaces.md#surf-002) | ⏳ | 🌐 global (~/.claude.json) |
| INV-SET-258 | `autoInstallIdeExtension` | Installs the IDE extension automatically from a VS Code terminal. | ✅ | ✅ | ⚪ Default | [SURF-002](../03-test-plan/catalog/surfaces.md#surf-002) | ⏳ | 🌐 global (~/.claude.json); Image should pre-install the extension [verify] |
| INV-SET-259 | `claudeInChromeDefaultEnabled` | Starts every session with Chrome integration on. | ⛔ | ⛔ | ⛔ Unavailable | [SURF-010](../03-test-plan/catalog/surfaces.md#surf-010) | ⏳ | 🌐 global (~/.claude.json); Chrome needs a claude.ai subscription and a browser |
| INV-SET-260 | `copyFullResponse` | Makes /copy copy the full response without a picker. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | 🌐 global (~/.claude.json) |
| INV-SET-261 | `copyOnSelect` | Copies mouse selections automatically in fullscreen and agent view. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | 🌐 global (~/.claude.json) |
| INV-SET-262 | `defaultToAgentsView` | Opens agent view when claude runs with no arguments. | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | 🌐 global (~/.claude.json) |
| INV-SET-263 | `diffTool` | Shows proposed diffs in the connected IDE or the terminal. | ✅ | ✅ | 🟢 Allow | [SURF-002](../03-test-plan/catalog/surfaces.md#surf-002), [FEAT-026](../03-test-plan/catalog/features.md#feat-026) | ⏳ | 🌐 global (~/.claude.json) |
| INV-SET-264 | `externalEditorContext` | Adds Claude's last response as comments in the Ctrl+G editor. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | 🌐 global (~/.claude.json) |
| INV-SET-265 | `leftArrowOpensAgents` | Left arrow on an empty prompt backgrounds the session and opens agent view. | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | 🌐 global (~/.claude.json) |
| INV-SET-266 | `permissionExplainerEnabled` | Removed toggle for the Ctrl+E command explanation. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | 🌐 global (~/.claude.json); Removed in v2.1.257 |
| INV-SET-267 | `prStatusFooterEnabled` | Shows a footer badge with the current branch's PR status. | ✅ | ✅ | 🟢 Allow | [FEAT-015](../03-test-plan/catalog/features.md#feat-015) | ⏳ | 🌐 global (~/.claude.json) |
| INV-SET-268 | `teammateDefaultModel` | Removed default model for agent-team teammates. | ⛔ | ⛔ | ⛔ Unavailable | [FEAT-022](../03-test-plan/catalog/features.md#feat-022) | ⏳ | 🌐 global (~/.claude.json); Removed in v2.1.234 |

## Coverage summary

| Policy | Count |
|---|---|
| 🟢 Allow | 64 |
| 🟡 Restrict | 55 |
| 🔴 Block | 28 |
| ⚪ Default | 77 |
| ⛔ Unavailable | 44 |
| **Total** | **268** |

| Result | Count |
|---|---|
| ⏳ Not run | 268 |
| 🟩 Pass | 0 |
| 🟨 Issue | 0 |
| 🟥 Blocker | 0 |
| ⏭ N/A | 0 |

## Related

- [Feature inventory index](README.md): the other inventory pages (CLI, environment variables, commands, tools, surfaces)
- [Defense in depth](../02-security-baseline/defense-in-depth.md): the controls (CTL-06 to CTL-21) these keys implement
- Test catalog: [policy](../03-test-plan/catalog/policy.md) · [permissions](../03-test-plan/catalog/permissions.md) · [sandbox](../03-test-plan/catalog/sandbox.md) · [extensions](../03-test-plan/catalog/extensions.md) · [telemetry](../03-test-plan/catalog/telemetry.md) · [data](../03-test-plan/catalog/data.md) · [cost](../03-test-plan/catalog/cost.md)
- [Templates and style guide](../../templates/README.md)
- Official docs: [All settings](https://code.claude.com/docs/en/settings-reference) · [Settings files and precedence](https://code.claude.com/docs/en/settings) · [Managed settings](https://code.claude.com/docs/en/managed-settings) · [Sandboxing](https://code.claude.com/docs/en/sandboxing) · [Permissions](https://code.claude.com/docs/en/permissions) · [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry) · [Feature availability](https://code.claude.com/docs/en/feature-availability) · [Mods administration](https://code.claude.com/docs/en/plugins/mods/admin)
