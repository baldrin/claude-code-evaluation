---
title: Tools, hooks, and permission modes
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 1
---

# Tools, hooks, and permission modes

[🏠 Home](../../README.md) › [Feature inventory](README.md) › Tools, hooks, and permission modes

Every built-in tool Claude can call, every hook event, hook handler type, and hook source, every permission mode, and every permission rule syntax, with the proposed policy and the control that covers each one. Built from the [Tools reference](https://code.claude.com/docs/en/tools-reference), [Hooks reference](https://code.claude.com/docs/en/hooks), [Choose a permission mode](https://code.claude.com/docs/en/permission-modes), [Configure permissions](https://code.claude.com/docs/en/permissions), and [Sandboxing](https://code.claude.com/docs/en/sandboxing) for Claude Code **2.1.301** as of 2026-10-15.

> [!NOTE]
> **How to use this page.** For each row, confirm the behavior in the evaluation container, then set **Result** (⏳ → 🟩/🟨/🟥/⏭) and put evidence in `evidence/<ID>/`. Rows with a catalog test in **Covered by** are verified by that test; mark them with the test's result. **Policy** is the *proposed* decision. Changes need an ADR in `logs/decision-log.md`.

## Contents
- [Tools: files and search](#tools-files-and-search)
- [Tools: shell and execution](#tools-shell-and-execution)
- [Tools: web](#tools-web)
- [Tools: agents, planning, and orchestration](#tools-agents-planning-and-orchestration)
- [Tools: tasks and scheduling](#tools-tasks-and-scheduling)
- [Tools: MCP and tool discovery](#tools-mcp-and-tool-discovery)
- [Tools: claude.ai or Anthropic API only](#tools-claudeai-or-anthropic-api-only)
- [Hook events: session lifecycle](#hook-events-session-lifecycle)
- [Hook events: prompts and turns](#hook-events-prompts-and-turns)
- [Hook events: tool calls and permissions](#hook-events-tool-calls-and-permissions)
- [Hook events: subagents, tasks, and teams](#hook-events-subagents-tasks-and-teams)
- [Hook events: configuration, files, and worktrees](#hook-events-configuration-files-and-worktrees)
- [Hook events: compaction, models, and MCP elicitation](#hook-events-compaction-models-and-mcp-elicitation)
- [Hook handler types](#hook-handler-types)
- [Hook sources](#hook-sources)
- [Permission modes](#permission-modes)
- [Rule syntax: rule lists and general forms](#rule-syntax-rule-lists-and-general-forms)
- [Rule syntax: Bash and PowerShell](#rule-syntax-bash-and-powershell)
- [Rule syntax: Read and Edit paths](#rule-syntax-read-and-edit-paths)
- [Rule syntax: web, MCP, agents, skills, and cd](#rule-syntax-web-mcp-agents-skills-and-cd)
- [Coverage summary](#coverage-summary)
- [Related](#related)

## Tools: files and search

> [!NOTE]
> The [sandbox](https://code.claude.com/docs/en/sandboxing#what-runs-outside-the-sandbox) wraps shell commands only (Bash, PowerShell, Monitor). Read, Edit, Write, WebFetch, WebSearch, MCP servers, LSP servers, and hooks run **outside** it and rely on permission rules, the container firewall (CTL-04), and container hardening instead. See [SBX-011](../03-test-plan/catalog/sandbox.md#sbx-011).

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-TOOL-001 | `Read` | Reads files, images, PDFs, and notebooks into context | ✅ | ✅ | 🟡 Restrict | [PERM-002](../03-test-plan/catalog/permissions.md#perm-002), [IDN-008](../03-test-plan/catalog/identity.md#idn-008), [PERM-018](../03-test-plan/catalog/permissions.md#perm-018) | ⏳ | Not sandboxed (`denyRead` doesn't stop it). Managed `Read(...)` deny rules for secrets via `allowManagedPermissionRulesOnly`. No prompt inside working directories. Rules also cover `@` mentions. |
| INV-TOOL-002 | `Edit` | Exact string replacement in an existing file | ✅ | ✅ | 🟡 Restrict | [PERM-003](../03-test-plan/catalog/permissions.md#perm-003), [SBX-011](../03-test-plan/catalog/sandbox.md#sbx-011) | ⏳ | Not sandboxed. Managed `Edit(...)` deny rules protect `.github/workflows` and CI config. A `Read` deny also blocks Edit (v2.1.208+). Protected paths always prompt. |
| INV-TOOL-003 | `Write` | Creates a file or overwrites it with full content | ✅ | ✅ | 🟡 Restrict | [PERM-003](../03-test-plan/catalog/permissions.md#perm-003), [SBX-011](../03-test-plan/catalog/sandbox.md#sbx-011) | ⏳ | Not sandboxed. Governed by managed `Edit(...)` rules; a `Write(path)` rule is never consulted. A `Read` deny also blocks Write (v2.1.228+). |
| INV-TOOL-004 | `NotebookEdit` | Replaces, inserts, or deletes Jupyter notebook cells | ✅ | ✅ | 🟡 Restrict | [PERM-003](../03-test-plan/catalog/permissions.md#perm-003) | ⏳ | Not sandboxed. Uses managed `Edit(...)` rules. Not covered by `Read` deny rules, so protected paths need an `Edit` deny too. |
| INV-TOOL-005 | `Glob` | Finds files by name pattern | ✅ | ✅ | ⚪ Default | [PERM-002](../03-test-plan/catalog/permissions.md#perm-002) | ⏳ | Absent by default on Linux; Claude uses sandboxed `find` via Bash instead. Returns if named in `--tools`/`--allowedTools` or if Bash is removed. Not sandboxed; `Read(...)` rules apply. Ignores `.gitignore`. |
| INV-TOOL-006 | `Grep` | Searches file contents with ripgrep regex | ✅ | ✅ | ⚪ Default | [PERM-002](../03-test-plan/catalog/permissions.md#perm-002) | ⏳ | Absent by default on Linux, like Glob; Claude uses sandboxed `grep` via Bash. Not sandboxed when present; `Read(...)` rules apply. |
| INV-TOOL-007 | `LSP` | Language-server navigation, references, and type diagnostics | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Inactive until a code-intelligence plugin is installed; plugins are blocked by the plugin/marketplace lockdown (`strictKnownMarketplaces`, CTL-13). LSP servers run outside the sandbox. `Read(...)` rules apply. |
| INV-TOOL-008 | `MultiEdit` | Legacy multi-edit file tool | ❓ | ❓ | ⚪ Default | — | ⏳ | Legacy; named only on the permissions page, not in the tools reference. `MultiEdit(path)` rules are never consulted. [verify] whether it exists in 2.1.301. |

## Tools: shell and execution

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-TOOL-009 | `Bash` | Runs shell commands, each in a separate process | ✅ | ✅ | 🟡 Restrict | [SBX-003](../03-test-plan/catalog/sandbox.md#sbx-003), [SBX-004](../03-test-plan/catalog/sandbox.md#sbx-004), [SBX-005](../03-test-plan/catalog/sandbox.md#sbx-005), [PERM-004](../03-test-plan/catalog/permissions.md#perm-004), [PERM-005](../03-test-plan/catalog/permissions.md#perm-005), [PERM-006](../03-test-plan/catalog/permissions.md#perm-006) | ⏳ | Runs inside the sandbox (mandatory: `sandbox.enabled`, `failIfUnavailable`, `allowUnsandboxedCommands: false`). Managed `Bash(...)` deny/ask rules are not a boundary (R-05). Built-in read-only commands run without a prompt. |
| INV-TOOL-010 | `PowerShell` | Runs PowerShell 7 commands natively | ✅ | ✅ | ⚪ Default | — | ⏳ | Opt-in on Linux: `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` plus `pwsh` 7+ on `PATH`; not planned for the image [verify]. Runs inside the sandbox on Linux; no sandbox on native Windows (R-03). Uses `PowerShell(...)` rules, not Bash rules. Preview. |
| INV-TOOL-011 | `Monitor` | Streams background command or WebSocket output to Claude as events | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Docs: not available on Foundry, nor when `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` or `DISABLE_TELEMETRY` is set. If present, runs inside the sandbox and uses Bash rules (SBX-003/004/005, PERM-004). Confirm absent. |

## Tools: web

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-TOOL-012 | `WebFetch` | Fetches a URL and extracts content through a separate model call | ✅ | ✅ | 🔴 Block | [PERM-014](../03-test-plan/catalog/permissions.md#perm-014), [NET-006](../03-test-plan/catalog/network.md#net-006), [DATA-011](../03-test-plan/catalog/data.md#data-011) | ⏳ | Disabled by ADR-016 (pending the lead's confirmation): `CLAUDE_CODE_DISABLE_WEB_FETCH=1`, managed `WebFetch` deny, `skipWebFetchPreflight: true` (CTL-26). With no internet it could only reach allowlisted hosts such as GitHub, which is an exfiltration path. Not sandboxed; the container firewall still applies. If WebFetch is kept, fall back to managed `WebFetch(domain:...)` rules. |
| INV-TOOL-013 | `WebSearch` | Runs a server-side web search; returns titles and URLs | ✅ | ✅ | 🔴 Block | [NET-007](../03-test-plan/catalog/network.md#net-007) | ⏳ | Denied in managed policy and locked by `allowManagedPermissionRulesOnly` (ADR-016, CTL-26). Runs server-side on Foundry, so the container firewall can't stop it. Also off on Claude apps gateway sessions. No env var disables it, and the session cap can't be set to 0. |

## Tools: agents, planning, and orchestration

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-TOOL-014 | `Agent` | Spawns a subagent with its own context window | ✅ | ✅ | 🟢 Allow | [FEAT-007](../03-test-plan/catalog/features.md#feat-007), [PERM-016](../03-test-plan/catalog/permissions.md#perm-016), [SBX-010](../03-test-plan/catalog/sandbox.md#sbx-010) | ⏳ | Not sandboxed itself; subagent tool calls inherit the sandbox and permission rules. `Agent(Name)` rules limit types. Also launches forks and agent-team teammates. |
| INV-TOOL-015 | `SubagentHandback` | Delivers a subagent's final report after classifier review | ❓ | ✅ | ⚪ Default | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011) | ⏳ | Provided only in auto mode, to local non-fork subagents; v2.1.271+, so Foundry availability follows auto mode [verify]. Follows the auto-mode ADR (POL-016). No sandbox involvement. |
| INV-TOOL-016 | `SendMessage` | Messages a teammate, a resumed subagent, or another local session | ✅ | ✅ | 🟢 Allow | — | ⏳ | Same-machine sessions work on Foundry (v2.1.248+); sessions beyond the machine need Remote Control (⛔). Auto mode classifier reviews sends. Denying it also removes subagent messaging. Not sandboxed. |
| INV-TOOL-017 | `ListAgents` | Lists subagents, teammates, and local sessions Claude can message | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.224+, only where cross-session messaging is on. Backs `/list-agents`. Cloud and Remote Control sessions are not listed on Foundry. `crossSessionInbound: refuse` blocks inbound. |
| INV-TOOL-018 | `Workflow` | Runs a dynamic workflow script that orchestrates many background subagents | ✅ | ✅ | ⚪ Default | — | ⏳ | Docs list Foundry as supported. Prompts before running. Spawned agents follow the sandbox and rules. Cost risk (R-15). |
| INV-TOOL-019 | `EnterPlanMode` | Switches the session into plan mode | ✅ | ✅ | 🟢 Allow | [PERM-010](../03-test-plan/catalog/permissions.md#perm-010), [FEAT-002](../03-test-plan/catalog/features.md#feat-002) | ⏳ | No prompt. Mode switch only; no sandbox involvement. |
| INV-TOOL-020 | `ExitPlanMode` | Presents the plan for approval and leaves plan mode | ✅ | ✅ | 🟢 Allow | [PERM-010](../03-test-plan/catalog/permissions.md#perm-010), [FEAT-002](../03-test-plan/catalog/features.md#feat-002) | ⏳ | Requires approval. Offers "Yes, and use auto mode" when auto is available, otherwise "Yes, auto-accept edits". No sandbox involvement. |
| INV-TOOL-021 | `EnterWorktree` | Creates or enters an isolated git worktree | ✅ | ✅ | 🟢 Allow | [FEAT-010](../03-test-plan/catalog/features.md#feat-010) | ⏳ | Paths outside `.claude/worktrees/` prompt (v2.1.206+). Fires `WorktreeCreate`. Not sandboxed; moves the session's write scope. |
| INV-TOOL-022 | `ExitWorktree` | Leaves a worktree session and returns to the original directory | ✅ | ✅ | 🟢 Allow | [FEAT-010](../03-test-plan/catalog/features.md#feat-010) | ⏳ | No prompt. Can fire `WorktreeRemove`. Not offered to `isolation: worktree` subagents. Not sandboxed. |
| INV-TOOL-023 | `AskUserQuestion` | Asks multiple-choice questions to clarify requirements | ✅ | ✅ | 🟢 Allow | — | ⏳ | No prompt, but never auto-approved in any mode; denied in `dontAsk`. Optional `askUserQuestionTimeout`. UI only; no sandbox involvement. |
| INV-TOOL-024 | `Skill` | Runs a skill inside the main conversation | ✅ | ✅ | 🟡 Restrict | [FEAT-009](../03-test-plan/catalog/features.md#feat-009), [EXT-008](../03-test-plan/catalog/extensions.md#ext-008), [EXT-010](../03-test-plan/catalog/extensions.md#ext-010) | ⏳ | Requires approval. Project skills allowed with `disableSkillShellExecution`; `Skill(...)` rules. Skill `allowed-tools` ignored under `allowManagedPermissionRulesOnly` (v2.1.282+). Not sandboxed itself. |
| INV-TOOL-025 | `ReportFindings` | Returns code-review findings as a structured list | ✅ | ✅ | 🟢 Allow | [FEAT-013](../03-test-plan/catalog/features.md#feat-013) | ⏳ | Called when code-review instructions ask for it, such as `/code-review`. No prompt. Output only; no sandbox involvement. |

## Tools: tasks and scheduling

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-TOOL-026 | `TaskCreate` | Adds a task to the session task list | ✅ | ✅ | 🟢 Allow | [FEAT-016](../03-test-plan/catalog/features.md#feat-016) | ⏳ | On by default only on Opus 4.7, Sonnet 4.6, Haiku 4.5 and earlier; unrecognized model IDs get none, so custom Foundry deployment names may need `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` [verify]. Fires `TaskCreated`. No sandbox involvement. |
| INV-TOOL-027 | `TaskGet` | Retrieves full details for one task | ✅ | ✅ | 🟢 Allow | [FEAT-016](../03-test-plan/catalog/features.md#feat-016) | ⏳ | Same availability as `TaskCreate`. |
| INV-TOOL-028 | `TaskList` | Lists all tasks with their status | ✅ | ✅ | 🟢 Allow | [FEAT-016](../03-test-plan/catalog/features.md#feat-016) | ⏳ | Same availability as `TaskCreate`. |
| INV-TOOL-029 | `TaskUpdate` | Updates task status, dependencies, or details, or deletes tasks | ✅ | ✅ | 🟢 Allow | [FEAT-016](../03-test-plan/catalog/features.md#feat-016) | ⏳ | Same availability as `TaskCreate`. Marking complete fires `TaskCompleted`. |
| INV-TOOL-030 | `TaskStop` | Stops a background task, teammate, or named background agent | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Not part of the model-gated Task tool set. Shown as `Stop Task` in the transcript; rules must use `TaskStop`. No sandbox involvement. |
| INV-TOOL-031 | `TaskOutput` | Formerly retrieved background task output (removed) | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.277; Claude reads the output file with `Read`. Deprecated; rules naming it raise no startup warning. |
| INV-TOOL-032 | `TodoWrite` | Manages the legacy session checklist | ✅ | ✅ | ⚪ Default | [FEAT-016](../03-test-plan/catalog/features.md#feat-016) | ⏳ | Disabled by default in favor of the Task tools; `CLAUDE_CODE_ENABLE_TASKS=0` brings it back where task tools exist. |
| INV-TOOL-033 | `CronCreate` | Schedules a recurring or one-shot prompt inside the session | ✅ | ✅ | 🟢 Allow | [FEAT-021](../03-test-plan/catalog/features.md#feat-021) | ⏳ | Session-scoped; restored on `--resume`/`--continue` if unexpired. Each run fires `UserPromptSubmit`. No sandbox involvement. |
| INV-TOOL-034 | `CronDelete` | Cancels a scheduled task by ID | ✅ | ✅ | 🟢 Allow | [FEAT-021](../03-test-plan/catalog/features.md#feat-021) | ⏳ | No prompt. |
| INV-TOOL-035 | `CronList` | Lists the session's scheduled tasks | ✅ | ✅ | 🟢 Allow | [FEAT-021](../03-test-plan/catalog/features.md#feat-021) | ⏳ | No prompt. |
| INV-TOOL-036 | `ScheduleWakeup` | Picks when the next self-paced `/loop` iteration runs | ✅ | ✅ | 🟢 Allow | [FEAT-021](../03-test-plan/catalog/features.md#feat-021) | ⏳ | Between 1 minute and 1 hour; `stop: true` ends the loop. Dynamic intervals need v2.1.248+ on Foundry. |

## Tools: MCP and tool discovery

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-TOOL-037 | `mcp__<server>__<tool>` | Tools exposed by connected MCP servers | ✅ | ✅ | 🟡 Restrict | [PERM-015](../03-test-plan/catalog/permissions.md#perm-015), [EXT-001](../03-test-plan/catalog/extensions.md#ext-001), [EXT-002](../03-test-plan/catalog/extensions.md#ext-002), [EXT-012](../03-test-plan/catalog/extensions.md#ext-012) | ⏳ | Not sandboxed; local MCP servers run with full user access. Managed-only MCP (`allowManagedMcpServersOnly`, 🔒 managed-only), empty at start. `mcp__` permission rules. |
| INV-TOOL-038 | `ListMcpResourcesTool` | Lists resources exposed by connected MCP servers | ✅ | ✅ | 🟡 Restrict | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001), [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Useful only with an MCP server; none at start (`allowManagedMcpServersOnly`). Not sandboxed. |
| INV-TOOL-039 | `ReadMcpResourceTool` | Reads one MCP resource by URI | ✅ | ✅ | 🟡 Restrict | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001), [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Same as `ListMcpResourcesTool`. Not sandboxed. |
| INV-TOOL-040 | `ToolSearch` | Searches for and loads deferred tools on demand | ❓ | ✅ | ⚪ Default | — | ⏳ | Not supported on Foundry deployments hosted on Azure, which reject it server-side; MCP tools then load upfront. Depends on the hosting option (DATA-001) [verify]. No sandbox involvement. |
| INV-TOOL-041 | `WaitForMcpServers` | Waits for MCP servers that are still connecting | ✅ | ✅ | 🟡 Restrict | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001) | ⏳ | Appears only when tool search is off; Azure-hosted Foundry sessions start on the tool-search path. MCP is managed-only (`allowManagedMcpServersOnly`). |

## Tools: claude.ai or Anthropic API only

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-TOOL-042 | `Artifact` | Publishes an HTML or Markdown page on claude.ai | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Needs a claude.ai plan and `/login`. Not sandboxed. An `Artifact` deny rule disables it if it ever appears. |
| INV-TOOL-043 | `EndConversation` | Ends the session after sustained abuse or on explicit request | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Docs: not on Foundry; v2.1.213+, interactive terminal only. Deny/ask rules can't remove it while other tools remain; PreToolUse hooks don't fire for it. |
| INV-TOOL-044 | `PushNotification` | Sends a desktop notification, plus phone push over Remote Control | ❓ | ⛔ | ⛔ Unavailable | — | ⏳ | Push delivery uses Anthropic-hosted infrastructure, not reachable from Foundry; whether the desktop-only part appears is unclear [verify]. Headless container has no desktop. |
| INV-TOOL-045 | `RemoteTrigger` | Creates, runs, and lists claude.ai Routines; backs `/schedule` | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Routines need a claude.ai plan; docs say not accessible from Foundry. |
| INV-TOOL-046 | `SendFeedback` | Drafts a feedback report queued for your review | ⛔ | ✅ | ⛔ Unavailable | [DATA-007](../03-test-plan/catalog/data.md#data-007) | ⏳ | Docs: left out on Foundry and whenever `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` or `DISABLE_FEEDBACK_COMMAND=1` is set. v2.1.238+. |
| INV-TOOL-047 | `SendUserFile` | Sends a session file to your device with a caption | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Needs a Remote Control client or a cloud session; docs say not on Foundry. |
| INV-TOOL-048 | `ShareOnboardingGuide` | Uploads `ONBOARDING.md` and returns a share link | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | claude.ai Pro, Max, Team, and Enterprise only; called from `/team-onboarding`. |
| INV-TOOL-049 | `advisor` | Server tool that consults a stronger advisor model | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Experimental, Anthropic API only; docs say not on Foundry. No name for rules or hook matchers. Configured with `/advisor` or `advisorModel`. |

## Hook events: session lifecycle

> [!NOTE]
> **Policy for every hook event:** 🟡 Restrict. Only managed hooks run (`allowManagedHooksOnly: true`, 🔒 managed-only, [EXT-005](../03-test-plan/catalog/extensions.md#ext-005)). Command hooks run **outside** the sandbox with full user access. "Blocks" summarizes the [exit code 2 table](https://code.claude.com/docs/en/hooks#exit-code-2-behavior-per-event) and [decision control](https://code.claude.com/docs/en/hooks#decision-control). Rows without a catalog test: confirm the event appears under `/hooks` → **All events**.

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-HOOK-050 | `SessionStart` | Runs when a session starts, resumes, clears, compacts, or forks | ✅ | ✅ | 🟡 Restrict | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Blocks: no (context only). `command` and `mcp_tool` handlers only. Used by managed audit hook (EXT-006). `allowManagedHooksOnly`. |
| INV-HOOK-051 | `Setup` | Runs on `--init-only`, or `-p` with `--init` or `--maintenance` | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no. Never fires on normal startup. `command` handlers only in practice (`mcp_tool` skipped). `allowManagedHooksOnly`. |
| INV-HOOK-052 | `InstructionsLoaded` | Runs when a CLAUDE.md or `.claude/rules/*.md` file loads | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no (async, observability only). Not fired for `AGENTS.md` read directly. `allowManagedHooksOnly`. |
| INV-HOOK-053 | `SessionEnd` | Runs when a session terminates | ✅ | ✅ | 🟡 Restrict | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Blocks: no. Shared 1.5 s budget, raised to match a longer per-hook `timeout` up to 60 s. Used by managed audit hook (EXT-006). `allowManagedHooksOnly`. |

## Hook events: prompts and turns

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-HOOK-054 | `UserPromptSubmit` | Runs before Claude processes a submitted or self-started prompt | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (exit 2 or `decision: "block"`). 30 s default timeout. Also fires for scheduled tasks, background subagent reports, and cross-session messages. `allowManagedHooksOnly`. |
| INV-HOOK-055 | `UserPromptExpansion` | Runs when a typed slash command expands into a prompt | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes. Covers direct `/skill` invocation, which `PreToolUse` on `Skill` misses. `allowManagedHooksOnly`. |
| INV-HOOK-056 | `MessageDisplay` | Rewrites assistant text on screen while it streams | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no (display only; transcript and Claude keep the original). 10 s default timeout. `allowManagedHooksOnly`. |
| INV-HOOK-057 | `Notification` | Runs when Claude Code sends a notification | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no. Types include `permission_prompt` and `idle_prompt`; `quota_auto_resume_*` types are claude.ai-only. `allowManagedHooksOnly`. |
| INV-HOOK-058 | `Stop` | Runs when the main agent finishes responding | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (keeps Claude working). Not fired on user interrupt. `/goal` relies on hooks and can't run under `allowManagedHooksOnly`. |
| INV-HOOK-059 | `StopFailure` | Runs instead of Stop when a turn ends on an API error | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no (output ignored except `terminalSequence`). Matchers include `rate_limit` and `cloud_credential_error` (v2.1.267+); useful for Foundry 429s (COST-007). `allowManagedHooksOnly`. |

## Hook events: tool calls and permissions

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-HOOK-060 | `PreToolUse` | Runs before a tool call executes; can rewrite its input | ✅ | ✅ | 🟡 Restrict | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Blocks: yes (`permissionDecision` allow/deny/ask/defer, or exit 2). Deny and ask rules still win over a hook `allow`. Not fired for `EndConversation` or `@` file mentions. Used by managed audit hook (EXT-006). `allowManagedHooksOnly`. |
| INV-HOOK-061 | `PermissionRequest` | Runs when a tool call needs a permission decision | ✅ | ✅ | 🟡 Restrict | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Blocks: yes, via JSON `decision.behavior: "deny"`; exit 2 is not honored. Not fired for sandbox network prompts. Used by managed audit hook (EXT-006). `allowManagedHooksOnly`. |
| INV-HOOK-062 | `PermissionDenied` | Runs when auto mode denies a tool call | ❓ | ✅ | 🟡 Restrict | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006), [PERM-011](../03-test-plan/catalog/permissions.md#perm-011) | ⏳ | Blocks: no (already denied; `retry: true` lets the model retry). Fires only in auto mode, so availability follows auto mode [verify]. Used by managed audit hook (EXT-006). `allowManagedHooksOnly`. |
| INV-HOOK-063 | `PostToolUse` | Runs after a tool call succeeds; can replace its output | ✅ | ✅ | 🟡 Restrict | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006), [FEAT-019](../03-test-plan/catalog/features.md#feat-019) | ⏳ | Blocks: no (tool already ran; `decision: "block"` sends feedback). Used by managed audit hook (EXT-006). `allowManagedHooksOnly`. |
| INV-HOOK-064 | `PostToolUseFailure` | Runs after a started tool call fails | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no. Not fired for permission denials or validation errors. `allowManagedHooksOnly`. |
| INV-HOOK-065 | `PostToolBatch` | Runs once after a batch of parallel tool calls resolves | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (stops the loop before the next model call). No matcher. `allowManagedHooksOnly`. |

## Hook events: subagents, tasks, and teams

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-HOOK-066 | `SubagentStart` | Runs when a subagent is spawned or resumed | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no (context only). Matches agent type, such as `Explore`. `allowManagedHooksOnly`. |
| INV-HOOK-067 | `SubagentStop` | Runs when a subagent finishes responding | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (prevents the subagent from stopping). `allowManagedHooksOnly`. |
| INV-HOOK-068 | `TaskCreated` | Runs when `TaskCreate` is creating a task | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (rolls back the task). Doesn't fire in sessions without the Task tools (INV-TOOL-026). `allowManagedHooksOnly`. |
| INV-HOOK-069 | `TaskCompleted` | Runs when a task is being marked completed | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (task stays open). `allowManagedHooksOnly`. |
| INV-HOOK-070 | `TeammateIdle` | Runs when an agent-team teammate is about to go idle | ✅ | ✅ | 🟡 Restrict | [FEAT-022](../03-test-plan/catalog/features.md#feat-022) | ⏳ | Blocks: yes (teammate keeps working). Agent teams are experimental. `allowManagedHooksOnly`. |

## Hook events: configuration, files, and worktrees

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-HOOK-071 | `ConfigChange` | Runs when a settings, managed policy, or skill file changes mid-session | ✅ | ✅ | 🟡 Restrict | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006), [POL-015](../03-test-plan/catalog/policy.md#pol-015) | ⏳ | Blocks: yes, except `policy_settings` changes. Used by managed audit hook (EXT-006). `allowManagedHooksOnly`. |
| INV-HOOK-072 | `CwdChanged` | Runs when a main-conversation shell command changes directory | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no. Can write `CLAUDE_ENV_FILE`. No matcher. `allowManagedHooksOnly`. |
| INV-HOOK-073 | `DirectoryAdded` | Runs after `/add-dir` or SDK `register_repo_root` adds a directory | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no. Not fired for `--add-dir`. Docs: hook commands run unsandboxed. `allowManagedHooksOnly`. |
| INV-HOOK-074 | `FileChanged` | Runs when a watched file changes on disk | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no. Matcher is a literal filename list, such as `.envrc\|.env`. `allowManagedHooksOnly`. |
| INV-HOOK-075 | `WorktreeCreate` | Replaces default `git worktree` creation and returns the path | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (any non-zero exit fails creation). Not fired when Claude runs `git worktree add` in Bash. `allowManagedHooksOnly`. |
| INV-HOOK-076 | `WorktreeRemove` | Cleans up a worktree that a `WorktreeCreate` hook created | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (non-zero exit fails removal if the directory remains). `allowManagedHooksOnly`. |

## Hook events: compaction, models, and MCP elicitation

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-HOOK-077 | `PreCompact` | Runs before manual or automatic context compaction | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (blocking recovery compaction fails the request). `allowManagedHooksOnly`. |
| INV-HOOK-078 | `PostCompact` | Runs after compaction completes | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no. `allowManagedHooksOnly`. |
| INV-HOOK-079 | `PreModelSwitch` | Runs before a user- or client-requested model switch | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes. v2.1.251+. Matches the canonical model name; an unrecognized Foundry deployment ID runs every hook regardless of matcher [verify]. `allowManagedHooksOnly`. |
| INV-HOOK-080 | `PostModelSwitch` | Runs after the session's model changes, including automatic fallbacks | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: no (context only). v2.1.251+. `allowManagedHooksOnly`. |
| INV-HOOK-081 | `Elicitation` | Runs when an MCP server requests user input mid-task | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (declines the request). Needs an MCP server; none at start. `allowManagedHooksOnly`. |
| INV-HOOK-082 | `ElicitationResult` | Runs after the user answers an MCP elicitation | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Blocks: yes (response becomes decline). Needs an MCP server. `allowManagedHooksOnly`. |

## Hook handler types

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-HOOK-083 | `command` | Runs a shell command; input on stdin, result by exit code or JSON | ✅ | ✅ | 🟡 Restrict | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005), [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Runs outside the sandbox with full user access. 600 s default timeout. `onFailure: "block"` fails closed (v2.1.295+). Managed-only via `allowManagedHooksOnly`. |
| INV-HOOK-084 | `http` | POSTs event JSON to a URL and reads a JSON response | ✅ | ✅ | 🟡 Restrict | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | `allowedHttpHookUrls` limits target URLs, managed hooks included (array merges across settings files); `httpHookAllowedEnvVars` limits header variables. Not supported on SessionStart or Setup. Container firewall must allow the URL. |
| INV-HOOK-085 | `mcp_tool` | Calls a tool on a configured MCP server | ✅ | ✅ | 🟡 Restrict | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | Needs an MCP server; none at start (`allowManagedMcpServersOnly`). Skipped on SessionStart at launch and on Setup. Managed-only via `allowManagedHooksOnly`. |
| INV-HOOK-086 | `prompt` | Sends hook input to a Claude model for a JSON decision | ✅ | ✅ | 🟡 Restrict | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | Uses the background model through Foundry by default (cost, COST-010). 30 s default timeout. Supported only on tool, permission, prompt, stop, task, and teammate events. Managed-only via `allowManagedHooksOnly`. |
| INV-HOOK-087 | `agent` | Spawns a tool-using subagent to verify a condition | ✅ | ✅ | 🟡 Restrict | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | Experimental. Up to 50 turns, 60 s default timeout. Same events as `prompt` except PermissionRequest. Managed-only via `allowManagedHooksOnly`. |

## Hook sources

> [!WARNING]
> The docs say `allowManagedHooksOnly` blocks user, project, local, plugin, and **agent-frontmatter** hooks. They don't say whether it blocks hooks in **skill frontmatter**, and project skills are allowed under our policy. INV-HOOK-093 must be tested before Phase 2.

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-HOOK-088 | `~/.claude/settings.json` hooks | User-level hooks for all of a developer's projects | ✅ | ✅ | 🔴 Block | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | Blocked by `allowManagedHooksOnly`. |
| INV-HOOK-089 | `.claude/settings.json` hooks | Project hooks committed to the repository | ✅ | ✅ | 🔴 Block | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | Blocked by `allowManagedHooksOnly`. Without it, `-p` runs execute them in folders never trusted. |
| INV-HOOK-090 | `.claude/settings.local.json` hooks | Local, uncommitted project hooks | ✅ | ✅ | 🔴 Block | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | Blocked by `allowManagedHooksOnly`. |
| INV-HOOK-091 | `managed-settings.json` hooks | Organization-wide hooks from managed policy settings | ✅ | ✅ | 🟢 Allow | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006), [POL-001](../03-test-plan/catalog/policy.md#pol-001) | ⏳ | 🔒 managed-only. Hosts the audit hook. `disableAllHooks` outside managed settings can't turn them off. |
| INV-HOOK-092 | Plugin `hooks/hooks.json` | Hooks bundled with an enabled plugin | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003), [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | Blocked by `allowManagedHooksOnly` unless the plugin is force-enabled in managed `enabledPlugins`; plugins are blocked anyway (CTL-13). |
| INV-HOOK-093 | Skill frontmatter `hooks` | Hooks registered when a skill is invoked | ✅ | ✅ | 🔴 Block | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005), [EXT-008](../03-test-plan/catalog/extensions.md#ext-008) | ⏳ | Intended blocked by `allowManagedHooksOnly`, but docs don't list skill frontmatter among blocked sources [verify]. Project-skill hooks run even in untrusted `-p` folders. |
| INV-HOOK-094 | Subagent frontmatter `hooks` | Hooks active only while that subagent runs | ✅ | ✅ | 🔴 Block | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005), [EXT-009](../03-test-plan/catalog/extensions.md#ext-009) | ⏳ | Docs list agent-frontmatter hooks as blocked by `allowManagedHooksOnly`. Project-agent hooks also need workspace trust (v2.1.218+). |

## Permission modes

> [!IMPORTANT]
> On v2.1.283 and later, **`auto` is the built-in starting permission mode** for terminal and VS Code sessions on every provider, including Foundry with a supported model. `claude -p` on a third-party provider also starts in `auto` on v2.1.285 and later. Our target start mode (`default`) therefore needs managed `permissions.defaultMode: "default"`, or `disableAutoMode: "disable"` if the ADR blocks auto mode ([POL-016](../03-test-plan/catalog/policy.md#pol-016)).

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-MODE-095 | `default` | Manual mode: prompts on first use; reads run without asking | ✅ | ✅ | 🟢 Allow | [PERM-008](../03-test-plan/catalog/permissions.md#perm-008) | ⏳ | Target starting mode; set with managed `permissions.defaultMode`. `claude --help` lists `manual` (the documented alias) instead of `default`; docs accept both. |
| INV-MODE-096 | `acceptEdits` | Auto-accepts file edits and common filesystem commands in working directories | ✅ | ✅ | 🟢 Allow | [PERM-009](../03-test-plan/catalog/permissions.md#perm-009) | ⏳ | Also auto-approves `mkdir`, `touch`, `rm`, `rmdir`, `mv`, `cp`, `sed` on in-scope paths. Protected paths and critical-path removals still prompt; deny rules still apply. |
| INV-MODE-097 | `plan` | Explores and proposes a plan; no source edits until approved | ✅ | ✅ | 🟢 Allow | [PERM-010](../03-test-plan/catalog/permissions.md#perm-010), [FEAT-002](../03-test-plan/catalog/features.md#feat-002) | ⏳ | When auto mode is available and `useAutoModeDuringPlan` is on (default), the classifier approves shell commands during planning. Plan blocks aren't enforced when bypass is available (blocked by PERM-001). |
| INV-MODE-098 | `auto` | A classifier model reviews actions instead of prompting you | ❓ | ✅ | 🟡 Restrict | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011), [POL-016](../03-test-plan/catalog/policy.md#pol-016) | ⏳ | Docs: on by default on Foundry for Sonnet 5+, Opus 4.7+, Haiku 5.5 (v2.1.293+), and Fable [verify] on our deployments. Policy pending ADR: managed `permissions.defaultMode: "default"` now; `disableAutoMode: "disable"` if blocked. |
| INV-MODE-099 | `dontAsk` | Auto-denies anything that would prompt; only pre-approved actions run | ✅ | ✅ | 🟢 Allow | [PERM-012](../03-test-plan/catalog/permissions.md#perm-012), [FEAT-012](../03-test-plan/catalog/features.md#feat-012) | ⏳ | For CI. Ask rules (such as `git push`) become denies; `AskUserQuestion` denied. Not in the Shift+Tab cycle. `allowManagedPermissionRulesOnly` ignores `--allowedTools`, so CI allow rules must be managed [verify]. |
| INV-MODE-100 | `bypassPermissions` | Skips permission prompts and safety checks | ✅ | ✅ | 🔴 Block | [PERM-001](../03-test-plan/catalog/permissions.md#perm-001) | ⏳ | Managed `permissions.disableBypassPermissionsMode: "disable"` rejects `--dangerously-skip-permissions` and agent `permissionMode: bypassPermissions`; `--allow-dangerously-skip-permissions` [verify]. Also refused as root (outside a recognized sandbox) and with `--restricted`. |

## Rule syntax: rule lists and general forms

> [!NOTE]
> **Policy for rule syntaxes:** permission rules are authored only in managed settings. `allowManagedPermissionRulesOnly` (🔒 managed-only, [POL-007](../03-test-plan/catalog/policy.md#pol-007)) ignores `allow`, `ask`, and `deny` rules from user, project, local, and `--settings` files and ignores `--allowedTools`. `--disallowedTools` and session deny/ask rules can still add restrictions. The same `Tool(specifier)` format is used by hook `if` fields and skill `allowed-tools`.

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-RULE-101 | `permissions.deny` | Blocks matching calls in every mode; evaluated first | ✅ | ✅ | 🟡 Restrict | [PERM-002](../03-test-plan/catalog/permissions.md#perm-002), [PERM-003](../03-test-plan/catalog/permissions.md#perm-003), [PERM-004](../03-test-plan/catalog/permissions.md#perm-004) | ⏳ | Managed-only via `allowManagedPermissionRulesOnly`. Order is deny → ask → allow; specificity doesn't matter. A bare tool name removes the tool from context. |
| INV-RULE-102 | `permissions.ask` | Forces a prompt even when an allow rule matches | ✅ | ✅ | 🟡 Restrict | [PERM-007](../03-test-plan/catalog/permissions.md#perm-007) | ⏳ | Managed `Bash(git push *)`. Prompts in every mode, auto and bypass included; denied in `dontAsk`. `allowManagedPermissionRulesOnly`. |
| INV-RULE-103 | `permissions.allow` | Runs matching calls without a prompt | ✅ | ✅ | 🟡 Restrict | [POL-007](../03-test-plan/catalog/policy.md#pol-007), [PERM-017](../03-test-plan/catalog/permissions.md#perm-017) | ⏳ | Only managed allow rules apply; always-allow choices are hidden. Project allow rules otherwise need workspace trust. Never pre-approves protected-path writes. `allowManagedPermissionRulesOnly`. |
| INV-RULE-104 | `Tool` (bare name) | Matches every use of a tool, such as `Bash` or `Read` | ✅ | ✅ | 🟡 Restrict | — | ⏳ | `Bash(*)` is equivalent. As a deny rule it removes the tool from context, except `EndConversation`. `allowManagedPermissionRulesOnly`. |
| INV-RULE-105 | `Tool(specifier)` | Narrows a rule to a command, path, domain, or name | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Specifier depends on the tool (rows below). Parentheses inside need no escaping. Use canonical names (`TaskStop`, not the `Stop Task` label). `allowManagedPermissionRulesOnly`. |
| INV-RULE-106 | `Tool(param:value)` | Deny or ask on one top-level tool input parameter | ✅ | ✅ | 🟡 Restrict | [PERM-016](../03-test-plan/catalog/permissions.md#perm-016) | ⏳ | Examples: `Agent(model:opus)`, `Agent(isolation:worktree)`, `Bash(run_in_background:true)`. Deny/ask only; primary fields such as `Bash(command:...)` are ignored. MCP only via `--disallowedTools`. `allowManagedPermissionRulesOnly`. |
| INV-RULE-107 | `*` and `mcp__*` (tool-name glob) | Denies or asks for a set of tools by name pattern | ✅ | ✅ | 🟡 Restrict | [PERM-015](../03-test-plan/catalog/permissions.md#perm-015) | ⏳ | Must match the full tool name. Allow globs work only after a literal `mcp__<server>__`; unanchored allow globs are skipped with a warning. `allowManagedPermissionRulesOnly`. |

## Rule syntax: Bash and PowerShell

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-RULE-108 | `Bash(npm run build)` (exact) | Matches one exact command string | ✅ | ✅ | 🟡 Restrict | [PERM-004](../03-test-plan/catalog/permissions.md#perm-004), [PERM-006](../03-test-plan/catalog/permissions.md#perm-006) | ⏳ | Compound commands split on `&&`, `\|\|`, `;`, `\|`, `&`, newlines; each part must match. Also governs Monitor. Not a security boundary (R-05). `allowManagedPermissionRulesOnly`. |
| INV-RULE-109 | `Bash(npm run *)` (wildcard) | `*` matches any text; trailing ` *` also matches the bare command | ✅ | ✅ | 🟡 Restrict | [PERM-004](../03-test-plan/catalog/permissions.md#perm-004), [PERM-005](../03-test-plan/catalog/permissions.md#perm-005), [PERM-006](../03-test-plan/catalog/permissions.md#perm-006) | ⏳ | Put `*` after the subcommand. Wrappers such as `timeout` and bare `xargs` are stripped; `/usr/bin/curl` and `sh -c` forms are not matched, so the sandbox and firewall are the backstop. `allowManagedPermissionRulesOnly`. |
| INV-RULE-110 | `Bash(ls:*)` (suffix form) | Older trailing-wildcard spelling equal to `Bash(ls *)` | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Recognized only at the end of a pattern. Prompts save the space form. `allowManagedPermissionRulesOnly`. |
| INV-RULE-111 | `PowerShell(Get-ChildItem *)` | Matches PowerShell commands; aliases canonicalized, case-insensitive | ✅ | ✅ | ⚪ Default | — | ⏳ | PowerShell tool not enabled (INV-TOOL-010). Separate from Bash rules. On Windows with Git Bash, a Bash deny also turns PowerShell off. |

## Rule syntax: Read and Edit paths

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-RULE-112 | `Read(<path>)` | Gitignore-style path rule for reading files | ✅ | ✅ | 🟡 Restrict | [PERM-002](../03-test-plan/catalog/permissions.md#perm-002), [IDN-008](../03-test-plan/catalog/identity.md#idn-008) | ⏳ | Covers Read, Grep, Glob, LSP, `@` mentions, recognized Bash file commands, and `<` redirects; a deny also blocks Edit/Write. Merged into the sandbox config. `allowManagedPermissionRulesOnly`. |
| INV-RULE-113 | `Edit(<path>)` | Gitignore-style path rule for changing files | ✅ | ✅ | 🟡 Restrict | [PERM-003](../03-test-plan/catalog/permissions.md#perm-003) | ⏳ | Covers Edit, Write, NotebookEdit, `>` redirects, and `tee` targets. An allow also grants read and sandbox write access. `allowManagedPermissionRulesOnly`. |
| INV-RULE-114 | `//path` | Absolute path from the filesystem root | ✅ | ✅ | 🟡 Restrict | [PERM-002](../03-test-plan/catalog/permissions.md#perm-002) | ⏳ | Example: `Read(//**/.env)`. A single leading `/` is not absolute. `allowManagedPermissionRulesOnly`. |
| INV-RULE-115 | `~/path` | Path from the home directory | ✅ | ✅ | 🟡 Restrict | [IDN-008](../03-test-plan/catalog/identity.md#idn-008) | ⏳ | For credential files under the container user's home. `allowManagedPermissionRulesOnly`. |
| INV-RULE-116 | `/path` | Path relative to the settings source's anchor directory | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Project/local/CLI: primary working directory; user: `~/.claude`; `--settings`: that file's directory. Managed-settings anchor not documented [verify]; prefer `//` or `~/` in managed rules. `allowManagedPermissionRulesOnly`. |
| INV-RULE-117 | `path` or `./path` | Path relative to the current directory | ✅ | ✅ | 🟡 Restrict | [PERM-002](../03-test-plan/catalog/permissions.md#perm-002) | ⏳ | Bare filenames match at any depth (`Read(.env)` = `Read(**/.env)`). A single-segment directory deny matches at any depth; an allow only at cwd. `allowManagedPermissionRulesOnly`. |
| INV-RULE-118 | `!pattern` (negation) | Carves paths out of earlier deny or ask rules | ✅ | ✅ | 🟡 Restrict | — | ⏳ | Same source only; can't reach `/`, `~/`, or `//` rules; can't reopen a blocked directory. Embedding-host `!` rules are dropped. `allowManagedPermissionRulesOnly`. |
| INV-RULE-119 | `Write(...)`, `NotebookEdit(...)`, `Glob(...)`, `MultiEdit(...)` | Path rules for these tools are accepted but never consulted | ✅ | ✅ | ⚪ Default | — | ⏳ | Startup warning (v2.1.210+). Use `Edit(...)` or `Read(...)` instead. A bare tool-name rule such as a `Write` deny still applies at tool level. |

## Rule syntax: web, MCP, agents, skills, and cd

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-RULE-120 | `WebFetch(domain:example.com)` | Matches fetches to one hostname | ✅ | ✅ | 🟡 Restrict | [PERM-014](../03-test-plan/catalog/permissions.md#perm-014), [NET-006](../03-test-plan/catalog/network.md#net-006) | ⏳ | Case-insensitive; trailing dot ignored. Allow rules also add the host to the sandbox allowlist; under `allowManagedDomainsOnly` only managed ones count. `allowManagedPermissionRulesOnly`. |
| INV-RULE-121 | `WebFetch(domain:*.example.com)` | Matches subdomains at any depth, not the apex | ✅ | ✅ | 🟡 Restrict | [PERM-014](../03-test-plan/catalog/permissions.md#perm-014) | ⏳ | Wildcards need v2.1.172+. Sandbox honors only a leading `*.` or bare `*`; a mid-pattern `*` never crosses a dot. `allowManagedPermissionRulesOnly`. |
| INV-RULE-122 | `WebFetch(domain:*)` | Matches every domain; differs from bare `WebFetch` | ✅ | ✅ | 🟡 Restrict | [PERM-014](../03-test-plan/catalog/permissions.md#perm-014) | ⏳ | As allow, also opens sandboxed egress to every host; as deny, refuses each fetch and all sandbox egress. Bare `WebFetch` leaves the sandbox list alone. `allowManagedPermissionRulesOnly`. |
| INV-RULE-123 | `WebSearch` | Allows or denies the WebSearch tool as a whole | ✅ | ✅ | 🔴 Block | [NET-007](../03-test-plan/catalog/network.md#net-007) | ⏳ | Managed `permissions.deny: ["WebSearch"]` (ADR-016). No specifier form exists. Deny wins over any allow rule. |
| INV-RULE-124 | `mcp__<server>` | Matches every tool from one MCP server | ✅ | ✅ | 🟡 Restrict | [PERM-015](../03-test-plan/catalog/permissions.md#perm-015) | ⏳ | Server name as configured. Parenthesized `mcp__` rules in settings files are skipped. `allowManagedPermissionRulesOnly`. |
| INV-RULE-125 | `mcp__<server>__*` | Wildcard form for all tools from one server | ✅ | ✅ | 🟡 Restrict | [PERM-015](../03-test-plan/catalog/permissions.md#perm-015) | ⏳ | Server segment must stay literal in allow rules. `allowManagedPermissionRulesOnly`. |
| INV-RULE-126 | `mcp__<server>__<tool>` | Matches one tool from one server | ✅ | ✅ | 🟡 Restrict | [PERM-015](../03-test-plan/catalog/permissions.md#perm-015) | ⏳ | Partial globs such as `mcp__github__get_*` work in allow rules. Plugin servers use `mcp__plugin_<plugin>_<server>__<tool>`. `allowManagedPermissionRulesOnly`. |
| INV-RULE-127 | `mcp__claude_ai_<server>__<tool>` | Names tools from claude.ai connectors | ⛔ | ✅ | ⛔ Unavailable | [EXT-011](../03-test-plan/catalog/extensions.md#ext-011) | ⏳ | Connectors need a claude.ai login. An org `ask` setting forces a prompt in every mode. |
| INV-RULE-128 | `Agent(<AgentName>)` | Matches a subagent type, such as `Explore` or a custom name | ✅ | ✅ | 🟡 Restrict | [PERM-016](../03-test-plan/catalog/permissions.md#perm-016), [FEAT-007](../03-test-plan/catalog/features.md#feat-007) | ⏳ | Use in deny or `--disallowedTools` to disable an agent. Parameter forms are in INV-RULE-106. `allowManagedPermissionRulesOnly`. |
| INV-RULE-129 | `Skill(<name> *)` | Matches skills by name | ✅ | ✅ | 🟡 Restrict | [EXT-008](../03-test-plan/catalog/extensions.md#ext-008) | ⏳ | From the tools-reference rule table. A `Skill(skill:<name>)` deny matches the skill under any of its names. `allowManagedPermissionRulesOnly`. |
| INV-RULE-130 | `Cd` and `Cd(<path>)` | Restricts targets of the user-run `/cd` command | ✅ | ✅ | ⚪ Default | — | ⏳ | Not a model tool. Any `Cd` allow rule switches `/cd` to allowlist mode; a bare `Cd` deny disables it. Whether managed-only rules cover it [verify]. |

## Coverage summary

| Policy | Count |
|---|---|
| 🟢 Allow | 22 |
| 🟡 Restrict | 74 |
| 🔴 Block | 11 |
| ⚪ Default | 12 |
| ⛔ Unavailable | 11 |
| **Total** | **130** |

| Result | Count |
|---|---|
| ⏳ Not run | 130 |
| 🟩 Pass | 0 |
| 🟨 Issue | 0 |
| 🟥 Blocker | 0 |
| ⏭ N/A | 0 |

## Related
- [Feature inventory index](README.md): the other inventory pages
- Catalog tests: [permissions.md](../03-test-plan/catalog/permissions.md), [sandbox.md](../03-test-plan/catalog/sandbox.md), [extensions.md](../03-test-plan/catalog/extensions.md), [policy.md](../03-test-plan/catalog/policy.md), [network.md](../03-test-plan/catalog/network.md)
- Official docs: [Tools reference](https://code.claude.com/docs/en/tools-reference), [Hooks reference](https://code.claude.com/docs/en/hooks), [Choose a permission mode](https://code.claude.com/docs/en/permission-modes), [Configure permissions](https://code.claude.com/docs/en/permissions), [Sandboxing](https://code.claude.com/docs/en/sandboxing), [Settings reference](https://code.claude.com/docs/en/settings-reference)
