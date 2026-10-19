---
title: Slash commands and keyboard shortcuts
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 1
---

# Slash commands and keyboard shortcuts

[🏠 Home](../../README.md) › [Feature inventory](README.md) › Slash commands and keyboard shortcuts

This page lists every built-in slash command, alias, bundled skill, keyboard shortcut, input mode, and keybinding action in Claude Code, with its availability on Microsoft Foundry and in the headless dev container. Built from [Commands](https://code.claude.com/docs/en/commands), [Interactive mode](https://code.claude.com/docs/en/interactive-mode), and [Customize keyboard shortcuts](https://code.claude.com/docs/en/keybindings), with Foundry status checked against [Feature availability](https://code.claude.com/docs/en/feature-availability) and [Environment variables](https://code.claude.com/docs/en/env-vars), for Claude Code **2.1.301** as of 2026-10-15.

> [!NOTE]
> **How to use this page.** For each row, confirm the behavior in the evaluation container, then set **Result** (⏳ → 🟩/🟨/🟥/⏭) and put evidence in `evidence/<ID>/`. Rows with a catalog test in **Covered by** are verified by that test; mark them with the test's result. **Policy** is the *proposed* decision. Changes need an ADR in `logs/decision-log.md`.

## Contents
- [Session & context](#session--context)
- [Model & output](#model--output)
- [Interface & display](#interface--display)
- [Usage, account & provider](#usage-account--provider)
- [Permissions & configuration](#permissions--configuration)
- [Extensions (MCP, plugins, skills, agents, hooks)](#extensions-mcp-plugins-skills-agents-hooks)
- [Review & shipping](#review--shipping)
- [Automation & scheduling](#automation--scheduling)
- [Integrations & remote sessions](#integrations--remote-sessions)
- [Artifacts & design](#artifacts--design)
- [Diagnostics & help](#diagnostics--help)
- [Bundled skills](#bundled-skills)
- [Command menu & invocation](#command-menu--invocation)
- [Keyboard shortcuts: general](#keyboard-shortcuts-general)
- [Keyboard shortcuts: text editing](#keyboard-shortcuts-text-editing)
- [Multiline input](#multiline-input)
- [Input modes](#input-modes)
- [Viewer and dialog keys](#viewer-and-dialog-keys)
- [Vim editor mode](#vim-editor-mode)
- [Keybindings file and actions](#keybindings-file-and-actions)
- [Interactive-mode features](#interactive-mode-features)
- [Removed and deprecated](#removed-and-deprecated)
- [Coverage summary](#coverage-summary)

## Session & context

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-001 | `/background [prompt]` | Detach the session to run as a background agent and free the terminal. | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Alias `/bg`. Monitor with `claude agents`. Turned off by `disableAgentView` or `CLAUDE_CODE_DISABLE_AGENT_VIEW`. |
| INV-CMD-002 | `/branch [name]` | Branch the conversation at this point to try another direction. | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | Switches into the branch; the original stays available in `/resume`. |
| INV-CMD-003 | `/btw [question]` | Ask a side question without adding it to the conversation history. | ✅ | ✅ | 🟢 Allow | — | ⏳ | No tool access; runs while Claude works. No-argument form reopens the last answer (v2.1.212+). Overlay keys are under Viewer and dialog keys. |
| INV-CMD-004 | `/cd <path>` | Move the session to another working directory, keeping the conversation. | ✅ | ✅ | 🟢 Allow | — | ⏳ | Applies the new directory's project config, unlike `/add-dir`. [verify] sandbox write scope follows the move. |
| INV-CMD-005 | `/clear [name]` | Start a new conversation with empty context. | ✅ | ✅ | 🟢 Allow | [FEAT-006](../03-test-plan/catalog/features.md#feat-006) | ⏳ | Aliases `/reset`, `/new`. The previous conversation stays resumable from `/resume` or the rewind menu. |
| INV-CMD-006 | `/compact [instructions]` | Summarize the conversation so far to free context space. | ✅ | ✅ | 🟢 Allow | [FEAT-006](../03-test-plan/catalog/features.md#feat-006) | ⏳ | Optional focus instructions for the summary. |
| INV-CMD-007 | `/context [all]` | Show context-window usage as a grid with optimization suggestions. | ✅ | ✅ | 🟢 Allow | [FEAT-006](../03-test-plan/catalog/features.md#feat-006), [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | `all` expands the per-item breakdown in fullscreen. Warns when over the limit. |
| INV-CMD-008 | `/copy [N]` | Copy the last, or Nth-latest, response to the clipboard. | ✅ | ❓ | 🟢 Allow | — | ⏳ | Picker for code blocks; `w` writes the selection to a file instead. [verify] clipboard reaches the VDI from the container terminal. |
| INV-CMD-009 | `/exit` | Exit the CLI, or detach from an attached background session. | ✅ | ✅ | ⚪ Default | — | ⏳ | Alias `/quit`. |
| INV-CMD-010 | `/export [filename]` | Export the conversation as plain text to a file or the clipboard. | ✅ | ✅ | 🟢 Allow | [DATA-009](../03-test-plan/catalog/data.md#data-009), [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | Export can contain code and command output from the session; handle per DATA-009. |
| INV-CMD-011 | `/fork [prompt]` | Copy the conversation into a new background session and keep working here. | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | v2.1.212+. The copy is told to make its own worktree (v2.1.221+). With agent view off, starts a forked subagent instead. |
| INV-CMD-012 | `/init` | Generate a starter `CLAUDE.md` for the project. | ✅ | ✅ | 🟢 Allow | [FEAT-004](../03-test-plan/catalog/features.md#feat-004) | ⏳ | `CLAUDE_CODE_NEW_INIT=1` adds an interactive flow. Its offer to run `/import` doesn't apply on Foundry. |
| INV-CMD-013 | `/list-agents` | List subagents, teammates, and sessions that Claude can message. | ✅ | ✅ | ⚪ Default | — | ⏳ | Also `/peers`. v2.1.224+. On Foundry, messaging is same-machine only (v2.1.248+). Inbound control: `crossSessionInbound`. |
| INV-CMD-014 | `/memory` | Edit `CLAUDE.md` files and turn auto memory on or off. | ✅ | ✅ | 🟢 Allow | [FEAT-004](../03-test-plan/catalog/features.md#feat-004), [FEAT-005](../03-test-plan/catalog/features.md#feat-005), [DATA-010](../03-test-plan/catalog/data.md#data-010) | ⏳ | Also views auto memory entries. |
| INV-CMD-015 | `/recap` | Generate a one-line summary of the current session on demand. | ✅ | ✅ | 🟢 Allow | — | ⏳ | Capped at 400 characters. Runs only when you invoke it yourself. |
| INV-CMD-016 | `/rename [name]` | Rename the session and show the name on the prompt bar. | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | No argument auto-generates a name. Works in `-p`. Control characters replaced, 200-character cap (v2.1.221+). |
| INV-CMD-017 | `/resume [session]` | Resume a conversation by ID or name, or open the session picker. | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | Alias `/continue`. Attaches to a running background session (v2.1.285+). |
| INV-CMD-018 | `/rewind` | Roll code and/or conversation back to a checkpoint, or summarize from a message. | ✅ | ✅ | 🟢 Allow | [FEAT-003](../03-test-plan/catalog/features.md#feat-003) | ⏳ | Aliases `/checkpoint`, `/undo`. `CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING` stops code restore. |
| INV-CMD-019 | `/stop` | Stop the attached background session, keeping transcript and worktree. | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | To detach without stopping, use `/exit` or `←`. |
| INV-CMD-020 | `/subtask <task>` | Spawn a forked background subagent whose result returns to this conversation. | ✅ | ✅ | 🟢 Allow | [FEAT-007](../03-test-plan/catalog/features.md#feat-007), [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | v2.1.212+. Not available when agent view is off. |
| INV-CMD-021 | `/tasks` | View and manage background work in the session, including finished subagents. | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Also `/bashes`. Runs immediately while Claude responds. |

## Model & output

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-022 | `/advisor [model\|off]` | Turn the advisor tool, a second model consulted for guidance, on or off. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Advisor isn't available on Foundry (feature-availability page; also needs feature-flag fetching). Backstop: `CLAUDE_CODE_DISABLE_ADVISOR_TOOL=1`. |
| INV-CMD-023 | `/autocompact [auto\|<tokens>]` | Set how full the context gets before automatic compaction. | ✅ | ✅ | 🟢 Allow | [COST-009](../03-test-plan/catalog/cost.md#cost-009) | ⏳ | Saved to user settings. v2.1.221+. |
| INV-CMD-024 | `/effort [level\|auto\|status\|ultracode [on\|off]]` | Set the reasoning effort level, or turn ultracode on or off. | ✅ | ✅ | 🟢 Allow | [FEAT-018](../03-test-plan/catalog/features.md#feat-018), [COST-003](../03-test-plan/catalog/cost.md#cost-003) | ⏳ | `max` is session-only; `maxEffortLevel` can cap it. `on`/`off` forms v2.1.284+. Works in `-p`. |
| INV-CMD-025 | `/fast [on\|off]` | Toggle fast mode: faster output at a higher cost per token. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Fast mode isn't available on Foundry (feature-availability page). Backstop: `CLAUDE_CODE_DISABLE_FAST_MODE=1`. |
| INV-CMD-026 | `/model [model]` | Switch the model and save it as the default for new sessions. | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011), [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Managed `availableModels` plus `ANTHROPIC_DEFAULT_OPUS_MODEL` and siblings pin Foundry deployments. `s` in the picker = this session only. `-p` form v2.1.205+. |
| INV-CMD-027 | `/output-style [style]` | List output styles or switch to one. | ✅ | ✅ | 🟢 Allow | [EXT-013](../03-test-plan/catalog/extensions.md#ext-013) | ⏳ | v2.1.269+. |

## Interface & display

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-028 | `/color [color\|default]` | Set the prompt bar color for this session. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Eight named colors or random. Works in `-p`. |
| INV-CMD-029 | `/focus` | Toggle focus view: last prompt, one-line tool summary, and final response. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Fullscreen rendering only. `viewMode` setting overrides the saved choice. |
| INV-CMD-030 | `/keybindings` | Open or create the keyboard shortcuts file. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | File: `~/.claude/keybindings.json`. |
| INV-CMD-031 | `/scroll-speed` | Adjust mouse-wheel scroll speed interactively. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Fullscreen rendering only; not in the JetBrains terminal. |
| INV-CMD-032 | `/statusline` | Configure a custom status line command. | ✅ | ✅ | 🔴 Block | [EXT-007](../03-test-plan/catalog/extensions.md#ext-007) | ⏳ | Only the managed `statusLine` runs when `allowManagedHooksOnly` (🔒 managed-only) is on (CTL-15). |
| INV-CMD-033 | `/terminal-setup` | Install a Shift+Enter newline binding and other terminal tweaks. | ✅ | ❓ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Targets VS Code, Cursor, Devin Desktop, Alacritty, Zed, Apple Terminal, iTerm2. [verify] it can reach VS Code keybindings from a Dev Container. |
| INV-CMD-034 | `/theme` | Change the color theme, including colorblind, ANSI, and custom themes. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Custom themes from `~/.claude/themes/` or plugins. |
| INV-CMD-035 | `/tui [default\|fullscreen]` | Set the terminal renderer and relaunch with the conversation intact. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | No argument prints the active renderer. Writes the `tui` setting. |
| INV-CMD-036 | `/voice [hold\|tap\|off]` | Toggle voice dictation or pick its mode. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Requires a claude.ai account (commands and feature-availability pages); no microphone in the container. |

## Usage, account & provider

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-037 | `/usage` | Show session cost, plan usage limits, and activity stats. | ✅ | ✅ | 🟢 Allow | [COST-002](../03-test-plan/catalog/cost.md#cost-002), [COST-013](../03-test-plan/catalog/cost.md#cost-013) | ⏳ | Aliases `/cost`, `/stats` (opens Stats tab). Plan-limit breakdown is claude.ai-only; cost figures use `modelPricing`. Through the Claude apps gateway it shows a Spend limit bar, percentage-only while `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` is set (ADR-013). |
| INV-CMD-038 | `/insights` | Generate an HTML report analyzing your recent sessions on this machine. | ✅ | ✅ | ⚪ Default | — | ⏳ | Makes model calls (cost). Not in cloud sessions. [verify] report location and retention. |
| INV-CMD-039 | `/team-onboarding` | Generate a teammate onboarding guide from 30 days of usage. | ✅ | ✅ | ⚪ Default | — | ⏳ | Markdown guide for everyone; the share link is for claude.ai subscribers only. Makes model calls. |
| INV-CMD-040 | `/login` | Sign in to an Anthropic account. | ❓ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013) | ⏳ | Not used with Foundry auth. Hide with `DISABLE_LOGIN_COMMAND=1`; enforce provider with managed `allowedProviders`. [verify] shown when `CLAUDE_CODE_USE_FOUNDRY=1`. |
| INV-CMD-041 | `/logout` | Sign out of an Anthropic account. | ❓ | ✅ | 🔴 Block | — | ⏳ | Hide with `DISABLE_LOGOUT_COMMAND=1`. [verify] shown on Foundry. |
| INV-CMD-042 | `/upgrade` | Open the plan upgrade page in a browser. | ❓ | ⛔ | 🔴 Block | — | ⏳ | claude.ai plans only; hidden on Enterprise plans. No URL printed without a browser. Hide with `DISABLE_UPGRADE_COMMAND=1`. [verify] |
| INV-CMD-043 | `/usage-credits` | Configure usage credits, or request them from an admin, at a limit. | ❓ | ✅ | 🔴 Block | — | ⏳ | Formerly `/extra-usage`. Prints the URL without a browser (v2.1.205+). Hide with `DISABLE_EXTRA_USAGE_COMMAND=1`. [verify] |
| INV-CMD-044 | `/rate-limit-options` | Show ways to keep working when a claude.ai usage limit blocks you. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Requires a claude.ai subscription (docs). |
| INV-CMD-045 | `/passes` | Share a free week of Claude Code with friends. | ❓ | ✅ | ⛔ Unavailable | — | ⏳ | Only visible to eligible claude.ai accounts. [verify] |
| INV-CMD-046 | `/privacy-settings` | View and update claude.ai privacy settings. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Pro and Max subscribers only (docs). |
| INV-CMD-047 | `/stickers` | Order Claude Code stickers. | ❓ | ❓ | ⚪ Default | — | ⏳ | [verify] behavior without a browser or claude.ai account. |
| INV-CMD-048 | `/setup-bedrock` | Wizard for Amazon Bedrock auth, region, and model pins. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. Hidden until `CLAUDE_CODE_USE_BEDROCK=1`. |
| INV-CMD-049 | `/setup-vertex` | Wizard for Google Cloud's Agent Platform auth, project, region, and pins. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Other provider. Hidden until `CLAUDE_CODE_USE_VERTEX=1`. |

## Permissions & configuration

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-050 | `/add-dir <path>` | Add a working directory for file access this session. | ✅ | ✅ | 🟢 Allow | [PERM-013](../03-test-plan/catalog/permissions.md#perm-013) | ⏳ | Grants file access only, not `.claude/` config. Managed deny rules and sandbox still apply. Runs `DirectoryAdded` hooks. |
| INV-CMD-051 | `/auto-mode-setup` | Draft `autoMode.environment` entries from the project and recent sessions. | ⛔ | ✅ | ⛔ Unavailable | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011), [POL-016](../03-test-plan/catalog/policy.md#pol-016) | ⏳ | Needs a Pro, Max, or Team plan and feature-flag fetching, neither present on Foundry. Auto mode pending ADR. |
| INV-CMD-052 | `/config [key=value ...]` | Open Settings, or set keys directly with `key=value`. | ✅ | ✅ | 🟢 Allow | [POL-004](../03-test-plan/catalog/policy.md#pol-004), [POL-005](../03-test-plan/catalog/policy.md#pol-005) | ⏳ | Alias `/settings`. Managed values win. `/config --help` lists keys. Works in `-p`. |
| INV-CMD-053 | `/permissions` | Manage allow, ask, and deny rules and working directories. | ✅ | ✅ | 🟡 Restrict | [PERM-017](../03-test-plan/catalog/permissions.md#perm-017), [POL-007](../03-test-plan/catalog/policy.md#pol-007) | ⏳ | Alias `/allowed-tools`. `allowManagedPermissionRulesOnly` (🔒 managed-only) ignores local rules and hides always-allow. |
| INV-CMD-054 | `/plan [description]` | Enter plan mode, optionally starting on a task. | ✅ | ✅ | 🟢 Allow | [PERM-010](../03-test-plan/catalog/permissions.md#perm-010), [FEAT-002](../03-test-plan/catalog/features.md#feat-002) | ⏳ | Example: `/plan fix the auth bug`. |
| INV-CMD-055 | `/sandbox` | Toggle sandbox mode and view its status. | ✅ | ✅ | 🟡 Restrict | [SBX-014](../03-test-plan/catalog/sandbox.md#sbx-014), [SBX-001](../03-test-plan/catalog/sandbox.md#sbx-001) | ⏳ | Managed `sandbox.enabled`, `sandbox.failIfUnavailable`, `sandbox.allowUnsandboxedCommands: false`. [verify] a user toggle-off is refused. |

## Extensions (MCP, plugins, skills, agents, hooks)

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-056 | `/agents` | Print a reminder to ask Claude to create or manage subagents. | ✅ | ✅ | 🟡 Restrict | [EXT-009](../03-test-plan/catalog/extensions.md#ext-009), [PERM-016](../03-test-plan/catalog/permissions.md#perm-016) | ⏳ | Interactive UI only on v2.1.197 and earlier. Project agents allowed; managed `Agent(Name)` deny rules limit them. |
| INV-CMD-057 | `/hooks` | View configured hooks. | ✅ | ✅ | 🟡 Restrict | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005), [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | `allowManagedHooksOnly` (🔒 managed-only): only managed hooks, including the audit hook, run. |
| INV-CMD-058 | `/import [codex\|gemini\|cursor] [--dry-run] [--yes]` | Bring config from Codex, Gemini CLI, or Cursor into Claude Code. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Docs: not available on Microsoft Foundry. v2.1.213+. |
| INV-CMD-059 | `/mcp [reconnect (<server>\|all)\|enable\|disable [<server>\|all]]` | Manage MCP server connections and OAuth. | ✅ | ✅ | 🔴 Block | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001), [EXT-002](../03-test-plan/catalog/extensions.md#ext-002), [EXT-011](../03-test-plan/catalog/extensions.md#ext-011) | ⏳ | `allowManagedMcpServersOnly` (🔒 managed-only) with an empty managed `allowedMcpServers`; `disableClaudeAiConnectors`. Text summary in `-p`. |
| INV-CMD-060 | `/plugin [subcommand]` | Browse, install, enable, or disable plugins. | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003), [EXT-004](../03-test-plan/catalog/extensions.md#ext-004) | ⏳ | `strictKnownMarketplaces: []` and `disableSideloadFlags` (🔒 managed-only). Built-in mods such as `cc-plugin-diff` are toggled here. |
| INV-CMD-061 | `/plugin-authoring` | Load the reference Claude uses to write a mod. | ✅ | ✅ | 🟡 Restrict | [EXT-014](../03-test-plan/catalog/extensions.md#ext-014) | ⏳ | Skill from a built-in plugin; v2.1.287+. User mods stop under `allowManagedHooksOnly` (🔒 managed-only). [verify] id-index cites `allowManagedModsOnly`. |
| INV-CMD-062 | `/reload-plugins [--force]` | Reload active plugins to apply changes without restarting. | ✅ | ✅ | ⚪ Default | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Moot while plugins are blocked. `--force` when MCP tools would change. `-p` form v2.1.260+. |
| INV-CMD-063 | `/reload-skills` | Re-scan skill and command directories for added or changed skills. | ✅ | ✅ | 🟢 Allow | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Reports skill counts added and removed. |
| INV-CMD-064 | `/skill-doctor` | Show each skill's context cost and how often it is used. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Needs feature-flag fetching, which is off on third-party providers (env-vars page). v2.1.252+. |
| INV-CMD-065 | `/skills` | List available skills and cycle their visibility. | ✅ | ✅ | 🟡 Restrict | [FEAT-009](../03-test-plan/catalog/features.md#feat-009), [EXT-008](../03-test-plan/catalog/extensions.md#ext-008), [EXT-010](../03-test-plan/catalog/extensions.md#ext-010) | ⏳ | `disableSkillShellExecution` (managed `true` wins); managed `skillOverrides` lock visibility. Keys: `t` sort, `Space`/`Enter` cycle, `Esc` save. |

## Review & shipping

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-066 | `/code-review [low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [--max-findings n\|all\|default] [pr#\|branch\|path]` | Review the diff, a PR, branch, or path for correctness bugs. | ✅ | ✅ | 🟢 Allow | [FEAT-013](../03-test-plan/catalog/features.md#feat-013) | ⏳ | Bundled skill. Alias `/review` (separate command before v2.1.223). `--comment` posts via the GitHub token. `ultra` is cloud: see `/ultrareview`. |
| INV-CMD-067 | `/diff` | Review working-tree changes, including Claude's edits so far. | ✅ | ✅ | 🟢 Allow | [FEAT-026](../03-test-plan/catalog/features.md#feat-026) | ⏳ | Panel in fullscreen (110+ columns, v2.1.287+) or dialog; drawn by built-in mod `cc-plugin-diff`. |
| INV-CMD-068 | `/run` | Launch and drive the project's app to see a change working. | ✅ | ❓ | 🟢 Allow | — | ⏳ | Bundled skill. Infers CLI, server, TUI, or browser launch. [verify] browser-driven or graphical apps in the headless container. |
| INV-CMD-069 | `/run-skill-generator` | Record a per-project skill that teaches `/run` and `/verify` the launch. | ✅ | ✅ | 🟢 Allow | [EXT-008](../03-test-plan/catalog/extensions.md#ext-008) | ⏳ | Bundled skill. Commits `.claude/skills/run-<name>/`; project-skill policy applies. |
| INV-CMD-070 | `/security-review` | Analyze the branch's changes for security vulnerabilities. | ✅ | ✅ | 🟢 Allow | [FEAT-014](../03-test-plan/catalog/features.md#feat-014) | ⏳ | Diffs against origin's default branch; needs an `origin` remote. |
| INV-CMD-071 | `/simplify [target]` | Review changed code for cleanups and apply the fixes. | ✅ | ✅ | 🟢 Allow | [FEAT-023](../03-test-plan/catalog/features.md#feat-023) | ⏳ | Bundled skill. Four parallel review agents. Doesn't hunt bugs. |
| INV-CMD-072 | `/ultrareview [PR or branch]` | Run a deep multi-agent code review in a cloud sandbox. | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Alias of `/code-review ultra`, kept as its own row for availability. Ultrareview requires a Claude subscription. |
| INV-CMD-073 | `/verify` | Build and run the app to confirm a change does what it should. | ✅ | ❓ | 🟢 Allow | — | ⏳ | Bundled skill; user-invoked only since v2.1.215. May write `.claude/skills/verify/SKILL.md`. [verify] graphical apps in the container. |

## Automation & scheduling

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-074 | `/batch <instruction>` | Split a large change into 5 to 30 parallel worktree subagents. | ✅ | ✅ | 🟢 Allow | [FEAT-023](../03-test-plan/catalog/features.md#feat-023), [FEAT-010](../03-test-plan/catalog/features.md#feat-010), [PERM-007](../03-test-plan/catalog/permissions.md#perm-007) | ⏳ | Bundled skill. Needs git (or a `WorktreeCreate` hook; non-git v2.1.281+). Each unit publishes its change, so the `git push` ask rule applies. |
| INV-CMD-075 | `/deep-research <question>` | Fan out web searches, cross-check sources, and write a cited report. | ✅ | ✅ | 🟡 Restrict | [NET-007](../03-test-plan/catalog/network.md#net-007), [PERM-014](../03-test-plan/catalog/permissions.md#perm-014) | ⏳ | Bundled workflow; user-invoked only since v2.1.218. WebFetch bounded by `WebFetch(domain:)` rules and the egress allowlist. |
| INV-CMD-076 | `/goal [condition\|clear]` | Keep Claude working across turns until a condition is met. | ✅ | ✅ | 🟢 Allow | — | ⏳ | `clear`, `stop`, `off`, `reset`, `none`, or `cancel` removes it. Watch cost (R-15). |
| INV-CMD-077 | `/loop [interval] [prompt]` | Run a prompt repeatedly while the session stays open. | ✅ | ✅ | 🔴 Block | [FEAT-021](../03-test-plan/catalog/features.md#feat-021), [COST-016](../03-test-plan/catalog/cost.md#cost-016) | ⏳ | Bundled skill. Alias `/proactive`. Off via `CLAUDE_CODE_DISABLE_CRON=1` (CTL-28); FEAT-021 is exercised in a test profile before the lock. |
| INV-CMD-078 | `/schedule [description]` | Create, update, list, or run cloud routines. | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Alias `/routines`. Routines require a Claude subscription; docs suggest `/loop` instead. |
| INV-CMD-079 | `/workflow-authoring` | Load the reference for writing dynamic workflow scripts. | ✅ | ✅ | ⚪ Default | — | ⏳ | Bundled skill; v2.1.248+. Present only when workflows are on. |
| INV-CMD-080 | `/workflows` | Watch, pause, resume, or save workflow runs. | ✅ | ✅ | ⚪ Default | — | ⏳ | Workflows are available on Foundry. `disableWorkflows` turns them off; decide via ADR given cost (R-15). |

## Integrations & remote sessions

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-081 | `/autofix-pr [prompt]` | Start a cloud session that watches the PR and pushes fixes. | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Needs cloud sessions (Claude subscription) and the `gh` CLI. |
| INV-CMD-082 | `/chrome` | Configure Claude in Chrome settings. | ⛔ | ⛔ | ⛔ Unavailable | [SURF-010](../03-test-plan/catalog/surfaces.md#surf-010) | ⏳ | Chrome extension requires a Claude subscription; no browser in the container. A deployed `managed-mcp.json` also blocks it. |
| INV-CMD-083 | `/claude-in-chrome [task]` | Have Claude do a browser task through Claude in Chrome. | ⛔ | ⛔ | ⛔ Unavailable | [SURF-010](../03-test-plan/catalog/surfaces.md#surf-010) | ⏳ | Bundled skill; needs Chrome integration. |
| INV-CMD-084 | `/desktop` | Continue the session in the Claude Code Desktop app. | ⛔ | ⛔ | ⛔ Unavailable | [SURF-007](../03-test-plan/catalog/surfaces.md#surf-007) | ⏳ | Alias `/app`. Needs macOS or x64 Windows and a Claude subscription. |
| INV-CMD-085 | `/ide` | Manage IDE integrations and show their status. | ✅ | ✅ | 🟢 Allow | [SURF-002](../03-test-plan/catalog/surfaces.md#surf-002), [ENV-009](../03-test-plan/catalog/env.md#env-009) | ⏳ | VS Code extension in the Dev Container. |
| INV-CMD-086 | `/install-github-app` | Install the Claude GitHub App and Actions workflow for a repo. | ⛔ | ❓ | ⛔ Unavailable | [SURF-004](../03-test-plan/catalog/surfaces.md#surf-004), [IDN-010](../03-test-plan/catalog/identity.md#idn-010) | ⏳ | Hidden on Microsoft Foundry (env-vars page). Backstop `DISABLE_INSTALL_GITHUB_APP_COMMAND=1`. [verify] browser step in container. |
| INV-CMD-087 | `/install-slack-app` | Install the Claude Slack app through a browser OAuth flow. | ⛔ | ⛔ | ⛔ Unavailable | [SURF-009](../03-test-plan/catalog/surfaces.md#surf-009) | ⏳ | Claude Code in Slack requires a Claude subscription. |
| INV-CMD-088 | `/mobile` | Show a QR code to download the Claude mobile app. | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Aliases `/ios`, `/android`. Claude Code on mobile requires a Claude subscription. |
| INV-CMD-089 | `/remote-control` | Make this session available for Remote Control from claude.ai. | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Alias `/rc`. Requires a claude.ai subscription. Backstop: managed `disableRemoteControl`. |
| INV-CMD-090 | `/remote-env` | Choose the default cloud environment for CLI-started cloud sessions. | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Cloud sessions require a Claude subscription. |
| INV-CMD-091 | `/teleport` | Pull a cloud session into this terminal. | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Also `/tp`. Requires a claude.ai subscription. |
| INV-CMD-092 | `/web-setup` | Connect GitHub for cloud sessions using local `gh` credentials. | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Cloud sessions require a Claude subscription. |

## Artifacts & design

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-093 | `/artifacts` | List your artifacts, then attach, open, or copy a link to one. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Artifacts require a Claude subscription. v2.1.208+. Backstop `CLAUDE_CODE_DISABLE_ARTIFACT=1`. |
| INV-CMD-094 | `/artifact-capabilities` | Load the reference for runtime capabilities of published artifacts. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Bundled skill. Available only where artifacts are. |
| INV-CMD-095 | `/artifact-diagramming` | Load diagramming guidance for legible inline SVG in artifacts. | ❓ | ✅ | ⛔ Unavailable | — | ⏳ | Bundled skill; v2.1.221+. [verify] whether it is listed on Foundry, where artifacts are unavailable. |
| INV-CMD-096 | `/design [brief]` | Draft UI mockups as artboards on a Claude Design artifact canvas. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Docs: unavailable on Microsoft Foundry. Bundled skill; v2.1.265+. |
| INV-CMD-097 | `/design-login` | Authorize design-system access for `/design-sync` with a claude.ai account. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Needs a claude.ai account. |
| INV-CMD-098 | `/design-sync [hint]` | Convert and upload the repo's React design system to Claude Design. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Docs: unavailable on Microsoft Foundry. Bundled skill. |
| INV-CMD-099 | `/slides [brief]` | Make a Claude Slides presentation artifact from a brief. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Docs: unavailable on Microsoft Foundry. Bundled skill; v2.1.265+. |

## Diagnostics & help

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-100 | `/bug [report]` | Report a bug, choosing how much history to include, after consent. | ✅ | ✅ | 🔴 Block | [DATA-007](../03-test-plan/catalog/data.md#data-007) | ⏳ | Alias `/share`. On Foundry it writes a local bundle to `~/.claude/feedback-bundles/`. Disabled by `DISABLE_FEEDBACK_COMMAND=1`. |
| INV-CMD-101 | `/debug [description]` | Turn on session debug logging and analyze the log. | ✅ | ✅ | 🟢 Allow | [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | Bundled skill. Captures from that point unless started with `--debug`. |
| INV-CMD-102 | `/doctor [prompt-audit [path]]` | Run a setup checkup and apply fixes you confirm. | ✅ | ✅ | 🟢 Allow | [ENV-014](../03-test-plan/catalog/env.md#env-014), [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | Bundled skill; alias `/checkup`. `prompt-audit` v2.1.283+. `DISABLE_DOCTOR_COMMAND=1` hides it. |
| INV-CMD-103 | `/feedback [report]` | Send product feedback through the same dialog and consent as `/bug`. | ✅ | ✅ | 🔴 Block | [DATA-007](../03-test-plan/catalog/data.md#data-007) | ⏳ | Opens Claude-drafted feedback queue when enabled. Disabled by `DISABLE_FEEDBACK_COMMAND=1` and `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`. |
| INV-CMD-104 | `/heapdump` | Write a JavaScript heap snapshot and memory breakdown. | ✅ | ✅ | ⚪ Default | — | ⏳ | Hidden; type in full. Writes to the home directory on Linux. The `.heapsnapshot` holds conversation and credentials: never share it. |
| INV-CMD-105 | `/help` | Show help and available commands. | ✅ | ✅ | 🟢 Allow | — | ⏳ | Opens immediately in fullscreen even mid-turn. |
| INV-CMD-106 | `/powerup` | Learn features through quick interactive lessons with animated demos. | ✅ | ✅ | 🟢 Allow | — | ⏳ | Local interactive lessons; useful during onboarding. |
| INV-CMD-107 | `/radio` | Open Claude FM lo-fi radio, or print the stream URL. | ✅ | ✅ | ⚪ Default | — | ⏳ | Prints the URL without a browser. [verify] stream host is outside the egress allowlist. |
| INV-CMD-108 | `/release-notes` | View the changelog in an interactive version picker. | ✅ | ✅ | 🟢 Allow | — | ⏳ | Release-notes fetch is nonessential traffic. [verify] output with `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` set. |
| INV-CMD-109 | `/status` | Show version, model, account, and connectivity on the Status tab. | ✅ | ✅ | 🟢 Allow | [POL-003](../03-test-plan/catalog/policy.md#pol-003), [IDN-012](../03-test-plan/catalog/identity.md#idn-012) | ⏳ | Runs while Claude responds. `Session kind` row v2.1.221+. |

## Bundled skills

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-110 | `/claude-api [migrate\|upgrade\|managed-agents-onboard\|prompt-audit\|cost-optimize\|build-eval\|hillclimb\|preserved-thinking-migration]` | Load Claude API and Managed Agents reference for the project's language. | ✅ | ✅ | 🟢 Allow | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Also activates on `anthropic` or `@anthropic-ai/sdk` imports. Other bundled skills are listed under their function, marked Bundled skill. |
| INV-CMD-111 | `/dataviz [request]` | Design guidance for charts and dashboards with palette validation. | ✅ | ✅ | 🟢 Allow | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Validates colorblind safety and contrast with a bundled script. |
| INV-CMD-112 | `/fewer-permission-prompts` | Scan transcripts and add a read-only allowlist to project settings. | ✅ | ✅ | 🟡 Restrict | [POL-007](../03-test-plan/catalog/policy.md#pol-007) | ⏳ | Rules it writes are ignored under `allowManagedPermissionRulesOnly` (🔒 managed-only). |
| INV-CMD-113 | `/update-config [request]` | Describe a settings change and Claude edits the matching `settings.json`. | ✅ | ✅ | 🟢 Allow | [POL-004](../03-test-plan/catalog/policy.md#pol-004), [POL-005](../03-test-plan/catalog/policy.md#pol-005) | ⏳ | Managed settings still win. Use `/config` for theme and model. |

## Command menu & invocation

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-114 | Hidden commands | Some commands appear only after you type their full name. | ✅ | ✅ | ⚪ Default | — | ⏳ | Examples: `/heapdump`, `/setup-bedrock`, `/setup-vertex`. A partial name never shows them. |
| INV-CMD-115 | Unknown and unavailable commands | Unavailable commands are left out of the menu and report Unknown command. | ✅ | ✅ | ⚪ Default | — | ⏳ | Some answer with their own message when policy disables them. Typos highlight nothing; `Enter` submits as typed. |
| INV-CMD-116 | Mid-prompt `/` completion | Complete a command name partway through a prompt with `Tab`. | ✅ | ✅ | ⚪ Default | — | ⏳ | A command runs only when it starts the message. `Tab` on a bare mid-prompt `/` lists all. |
| INV-CMD-117 | `/skill-a /skill-b <args>` chaining | Chain up to six skills; trailing text goes to each as arguments. | ✅ | ✅ | 🟢 Allow | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Skills only; built-in commands take the rest of the line as arguments. |
| INV-CMD-118 | Commands sent mid-turn | Commands queue until the turn ends; some run immediately. | ✅ | ✅ | ⚪ Default | — | ⏳ | Immediate: `/status`, `/tasks`, `/usage`, `/model`, `/effort`, `/fast`, `/btw`. `/bug` (v2.1.232+), `/add-dir`, `/permissions` (v2.1.234+) open at once; `/theme`, `/help` too in fullscreen. |
| INV-CMD-119 | Plugin skill bare-name match | A plugin skill matches on its bare name and inserts the full name. | ✅ | ✅ | ⚪ Default | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Example: `/deploy` finds `myplugin:deploy-app`. Moot while plugins are blocked. |
| INV-CMD-120 | MCP prompts as commands | MCP servers can expose prompts that appear as `/` commands. | ✅ | ✅ | 🔴 Block | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001) | ⏳ | No MCP servers: `allowManagedMcpServersOnly` (🔒 managed-only) with an empty allowlist. |
| INV-CMD-121 | Custom skills and `.claude/commands/` | Your own skills and commands appear in the `/` menu. | ✅ | ✅ | 🟡 Restrict | [EXT-008](../03-test-plan/catalog/extensions.md#ext-008), [EXT-010](../03-test-plan/catalog/extensions.md#ext-010) | ⏳ | Project skills allowed with `disableSkillShellExecution`. |

## Keyboard shortcuts: general

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-KEY-122 | `Ctrl+C` | Interrupt running work, or clear input; second press exits. | ✅ | ✅ | ⚪ Default | — | ⏳ | Reserved. `Up` on the empty prompt restores the cleared draft (v2.1.288+). |
| INV-KEY-123 | `Ctrl+X Ctrl+K` | Stop all background subagents and artifact auto-replies in this session. | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Press twice within 3 s. Works while a subagent permission prompt is open. |
| INV-KEY-124 | `Ctrl+D` | Exit Claude Code; second press within 800 ms confirms. | ✅ | ✅ | ⚪ Default | — | ⏳ | Reserved. Deletes the next character when the prompt has text. |
| INV-KEY-125 | `Ctrl+G` or `Ctrl+X Ctrl+E` | Edit the prompt or a custom response in the default text editor. | ✅ | ✅ | ⚪ Default | — | ⏳ | Needs an editor in the image. Optional last-response context via `/config`. |
| INV-KEY-126 | `Ctrl+L` | Force a full redraw, keeping input and conversation. | ✅ | ✅ | ⚪ Default | — | ⏳ | Recovers a garbled display. |
| INV-KEY-127 | `Ctrl+O` | Toggle the transcript viewer with detailed tool usage. | ✅ | ✅ | ⚪ Default | — | ⏳ | Shows timestamps and model per message; expands collapsed MCP and cross-session lines. |
| INV-KEY-128 | `Ctrl+R` | Reverse-search prompt history. | ✅ | ✅ | ⚪ Default | — | ⏳ | Classic: inline, all projects. Fullscreen: dialog; `Ctrl+S` cycles session, project, all. |
| INV-KEY-129 | `Ctrl+V`, `Cmd+V` (iTerm2), or `Alt+V` (Windows, WSL) | Paste a clipboard image as an `[Image #N]` chip. | ✅ | ❓ | ⚪ Default | [FEAT-001](../03-test-plan/catalog/features.md#feat-001), [DATA-012](../03-test-plan/catalog/data.md#data-012) | ⏳ | Both `Ctrl+V` and `Alt+V` bound on WSL. [verify] image clipboard reaches the container from the VDI terminal. |
| INV-KEY-130 | `Ctrl+B` | Move running Bash commands and agents to the background. | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | tmux users press twice. Also `Ctrl+X Ctrl+B`. |
| INV-KEY-131 | `Ctrl+T` | Show or hide Claude's to-do checklist. | ✅ | ✅ | ⚪ Default | [FEAT-016](../03-test-plan/catalog/features.md#feat-016) | ⏳ | Up to five tasks shown. Tools default only on Opus 4.7, Sonnet 4.6, Haiku 4.5 and earlier; else `CLAUDE_CODE_ENABLE_TODO_TOOLS=1`. Share via `CLAUDE_CODE_TASK_LIST_ID`. |
| INV-KEY-132 | `Ctrl+S` | Stash the prompt, or restore the stash on an empty prompt. | ✅ | ✅ | ⚪ Default | — | ⏳ | Restores text, cursor, pastes, and input mode. |
| INV-KEY-133 | `Ctrl+Z` | Suspend Claude Code to the shell; `fg` resumes. | ✅ | ✅ | ⚪ Default | — | ⏳ | Unix only. |
| INV-KEY-134 | `Left`/`Right` arrows | Cycle tabs in permission dialogs and menus. | ✅ | ✅ | ⚪ Default | — | ⏳ | Switch tabs while the tab row has focus. |
| INV-KEY-135 | `Tab` | Accept an autocomplete suggestion, or comment on a permission answer. | ✅ | ✅ | ⚪ Default | — | ⏳ | Comment field opens on most permission prompts with Yes or No focused. |
| INV-KEY-136 | `Up`/`Down` or `Ctrl+P`/`Ctrl+N` | Move within multiline input, then navigate command history. | ✅ | ✅ | ⚪ Default | — | ⏳ | `Up` from the first row takes back queued messages. |
| INV-KEY-137 | `Esc` | Interrupt Claude, close a dialog, or decline a permission prompt. | ✅ | ✅ | ⚪ Default | — | ⏳ | Keeps work done so far; queued messages go next. Deselects a selected footer item. |
| INV-KEY-138 | `Esc` + `Esc` | Clear the draft, or open the rewind menu on empty input. | ✅ | ✅ | ⚪ Default | [FEAT-003](../03-test-plan/catalog/features.md#feat-003) | ⏳ | Cleared draft is saved to history. |
| INV-KEY-139 | `Ctrl+Enter` or `Ctrl+X Ctrl+S` | Send queued messages and the draft right away. | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.275+. `Ctrl+X Ctrl+S` works in any terminal. Only queues in shell mode. |
| INV-KEY-140 | `Shift+Tab`, or `Alt+M` on Windows without VT mode | Cycle permission modes. | ✅ | ✅ | 🟡 Restrict | [PERM-001](../03-test-plan/catalog/permissions.md#perm-001), [POL-016](../03-test-plan/catalog/policy.md#pol-016) | ⏳ | Manual, acceptEdits, plan, then bypass and auto when available. Managed `permissions.disableBypassPermissionsMode` and `disableAutoMode` remove modes. |
| INV-KEY-141 | `Option+P` (macOS) or `Alt+P` (Windows/Linux) | Switch model without clearing the prompt. | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | Choices limited by managed `availableModels`. |
| INV-KEY-142 | `Option+T` (macOS) or `Alt+T` (Windows/Linux) | Toggle extended thinking. | ✅ | ✅ | ⚪ Default | — | ⏳ | No effect on Opus 5.5, Sonnet 5.5, Haiku 5.5, or Fable models. |
| INV-KEY-143 | `Option+O` (macOS) or `Alt+O` (Windows/Linux) | Toggle fast mode. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Fast mode isn't available on Foundry. |

## Keyboard shortcuts: text editing

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-KEY-144 | `Ctrl+A` | Move the cursor to the start of the current line. | ✅ | ✅ | ⚪ Default | — | ⏳ | Logical line in multiline input. |
| INV-KEY-145 | `Ctrl+E` | Move the cursor to the end of the current line. | ✅ | ✅ | ⚪ Default | — | ⏳ | Logical line in multiline input. |
| INV-KEY-146 | `Ctrl+K` | Delete to the end of the line. | ✅ | ✅ | ⚪ Default | — | ⏳ | Deleted text kept for `Ctrl+Y`. |
| INV-KEY-147 | `Ctrl+U` | Delete from the cursor to the line start. | ✅ | ✅ | ⚪ Default | — | ⏳ | Repeat to clear across lines. macOS terminals map `Cmd+Backspace` here. |
| INV-KEY-148 | `Ctrl+W` | Delete back to the previous whitespace. | ✅ | ✅ | ⚪ Default | — | ⏳ | Ignores punctuation, so one press removes a whole path or `--flag=value`. |
| INV-KEY-149 | `Ctrl+Y` | Paste the text last deleted with a kill shortcut. | ✅ | ✅ | ⚪ Default | — | ⏳ | — |
| INV-KEY-150 | `Alt+Y` (after `Ctrl+Y`) | Cycle through previously deleted text. | ✅ | ✅ | ⚪ Default | — | ⏳ | Option as Meta on macOS. |
| INV-KEY-151 | `Alt+B` | Move the cursor back one word. | ✅ | ✅ | ⚪ Default | — | ⏳ | A word is letters and digits; `_`, `.`, `/` separate words. |
| INV-KEY-152 | `Alt+F` | Move the cursor forward one word. | ✅ | ✅ | ⚪ Default | — | ⏳ | Option as Meta on macOS. |
| INV-KEY-153 | `Alt+D` | Delete to the end of the word. | ✅ | ✅ | ⚪ Default | — | ⏳ | Deleted text kept for `Ctrl+Y`. |
| INV-KEY-154 | `Option+Delete` (macOS) or `Ctrl+Backspace` (Windows) | Delete only the previous word. | ✅ | ✅ | ⚪ Default | — | ⏳ | Readline conventions v2.1.261+. Editing keys aren't remappable in `keybindings.json`. |
| INV-KEY-155 | `Ctrl+_` or `Ctrl+Shift+-` | Undo the last input edit. | ✅ | ✅ | ⚪ Default | — | ⏳ | Restores text and cursor position. |

## Multiline input

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-KEY-156 | `\` + `Enter` | Insert a newline; works in all terminals. | ✅ | ✅ | ⚪ Default | — | ⏳ | — |
| INV-KEY-157 | `Option+Enter` | Insert a newline on macOS with Option as Meta. | ✅ | ⛔ | ⚪ Default | — | ⏳ | macOS only; VDI clients are Windows. |
| INV-KEY-158 | `Shift+Enter` | Insert a newline where the terminal supports it. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Native in Windows Terminal, iTerm2, WezTerm, Ghostty, Kitty, Warp, Apple Terminal; else `/terminal-setup`. |
| INV-KEY-159 | `Ctrl+J` | Insert a newline in any terminal without configuration. | ✅ | ✅ | ⚪ Default | — | ⏳ | `chat:newline` action. |
| INV-KEY-160 | Paste mode | Paste code blocks or logs directly into the prompt. | ✅ | ✅ | ⚪ Default | — | ⏳ | Large pastes collapse to a `[Pasted text #N]` reference. |

## Input modes

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-KEY-161 | `/` at start | Open the command and skill menu; type letters to filter. | ✅ | ✅ | ⚪ Default | [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ | Lists built-ins, bundled and user skills, plugin and MCP commands. Highlight rules v2.1.236+. |
| INV-KEY-162 | `!` at start (shell mode) | Run a shell command directly; output joins the conversation. | ✅ | ✅ | 🟢 Allow | [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ | Runs outside the Bash sandbox unless strict sandbox mode; container firewall still applies. Claude replies unless `respondToBashCommands: false`. |
| INV-KEY-163 | Shell mode keys | `Tab` completes from `!` history and paths; `Esc`, `Backspace`, `Ctrl+U` exit. | ✅ | ✅ | ⚪ Default | [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ | Exit keys work on an empty prompt. Pasting text that starts with `!` enters shell mode. |
| INV-KEY-164 | `@` file mention | Mention a file or directory with path autocomplete. | ✅ | ✅ | ⚪ Default | [FEAT-001](../03-test-plan/catalog/features.md#feat-001), [PERM-002](../03-test-plan/catalog/permissions.md#perm-002) | ⏳ | [verify] Read deny rules stop `@` of secret files. `CLAUDE_CODE_DISABLE_FILE_MENTIONS` (v2.1.299+) changes expansion. |
| INV-KEY-165 | `@` session mention | Suggest your other live sessions after `@` plus a letter. | ✅ | ✅ | ⚪ Default | — | ⏳ | Cross-session messaging; same machine only on Foundry. v2.1.232+. |
| INV-KEY-166 | `:` emoji shortcode | Insert an emoji by shortcode, with suggestions. | ✅ | ✅ | ⚪ Default | — | ⏳ | v2.1.217+. `emojiCompletionEnabled: false` turns it off. |
| INV-KEY-167 | `?` on empty input | Toggle the shortcut help panel. | ✅ | ✅ | ⚪ Default | — | ⏳ | With text present, `?` types the character. |
| INV-KEY-168 | Mouse in `/` and `@` lists | Hover highlights and click accepts a suggestion. | ✅ | ✅ | ⚪ Default | — | ⏳ | Fullscreen rendering only. |
| INV-KEY-169 | `Enter` while Claude works | Queue a message, shell command, or command without interrupting. | ✅ | ✅ | ⚪ Default | — | ⏳ | Messages go after current tool calls; commands after the turn ends. |
| INV-KEY-170 | `Up` on first line with a queue | Take queued messages back into the input to edit. | ✅ | ✅ | ⚪ Default | — | ⏳ | Queued shell commands come back only when nothing else is queued. |
| INV-KEY-171 | Prompt suggestions (`Tab` or `Right`) | Accept the grayed-out suggested next prompt. | ❓ | ✅ | ⚪ Default | — | ⏳ | Off by default without feature flags (third-party providers). [verify] `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=true` enables. Small background requests. |
| INV-KEY-172 | Command history (`Up` recall) | Recall prompts from past sessions of the same project. | ✅ | ✅ | ⚪ Default | — | ⏳ | Stored per working directory; repeats collapse; `!` history expansion off. |
| INV-KEY-173 | Voice dictation (hold or tap `Space`) | Dictate a prompt by holding or tapping Space. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Requires a claude.ai account; no microphone in the container. |

## Viewer and dialog keys

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-KEY-174 | `Ctrl+T` in the `/theme` picker | Toggle syntax highlighting for code blocks. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Only inside the theme picker. |
| INV-KEY-175 | `?` in transcript viewer | Toggle the keyboard shortcut help panel. | ✅ | ✅ | ⚪ Default | — | ⏳ | Fullscreen rendering only. |
| INV-KEY-176 | `{` / `}` in transcript viewer | Jump to the previous or next user prompt. | ✅ | ✅ | ⚪ Default | — | ⏳ | Fullscreen rendering only. |
| INV-KEY-177 | `Ctrl+E` in transcript viewer | Toggle show-all content. | ✅ | ✅ | ⚪ Default | — | ⏳ | Classic renderer only. `transcript:toggleShowAll`. |
| INV-KEY-178 | `[` in transcript viewer | Write the conversation to native terminal scrollback for searching. | ✅ | ✅ | ⚪ Default | — | ⏳ | Fullscreen rendering only. |
| INV-KEY-179 | `v` in transcript viewer | Open the conversation in `$VISUAL` or `$EDITOR`. | ✅ | ✅ | ⚪ Default | — | ⏳ | Writes a temporary file. Fullscreen rendering only. |
| INV-KEY-180 | `q`, `Ctrl+C`, `Esc` in transcript viewer | Exit the transcript viewer. | ✅ | ✅ | ⚪ Default | — | ⏳ | Rebind via `transcript:exit`. |
| INV-KEY-181 | `/btw` overlay keys | Dismiss, scroll, browse, copy, fork, or clear side-question answers. | ✅ | ✅ | ⚪ Default | — | ⏳ | `Space`/`Enter`/`Esc`, `Up`/`Down`, `Shift+Left`/`Shift+Right` or `[`/`]` or `Tab` (v2.1.257+), `c`, `f`, `x`. |
| INV-KEY-182 | Diff dialog keys | Pick files, open a diff, choose a turn source, attach a diff. | ✅ | ✅ | ⚪ Default | [FEAT-026](../03-test-plan/catalog/features.md#feat-026) | ⏳ | `Up`/`Down`, `Enter`, `Esc`, `Tab`, `PageUp`/`PageDown`. |
| INV-KEY-183 | Diff panel keys | Scroll the file list and cycle the comparison base. | ✅ | ✅ | ⚪ Default | [FEAT-026](../03-test-plan/catalog/features.md#feat-026) | ⏳ | `Alt+Up`/`Alt+Down` or `Ctrl+Up`/`Ctrl+Down`; `Ctrl+X B`. Click `ask` or `source`. Fullscreen, v2.1.287+. |
| INV-KEY-184 | History search keys | Cycle, accept, execute, or cancel a reverse-search match. | ✅ | ✅ | ⚪ Default | — | ⏳ | Classic: `Ctrl+R` next, `Tab`/`Esc` accept, `Enter` run, `Ctrl+C` or `Backspace` cancel. Fullscreen: `Ctrl+S` scope. |

## Vim editor mode

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-KEY-185 | Vim editor mode (`/config` → Editor mode) | Turn on vim-style editing in the prompt input. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Setting `editorMode`. Mode and cursor survive `Ctrl+O` and panels. |
| INV-KEY-186 | `Esc`/`Ctrl+[`, `i`, `I`, `a`, `A`, `o`, `O`, `v`, `V` | Switch between NORMAL, INSERT, and VISUAL modes. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `Ctrl+[` under the Kitty protocol v2.1.242+. |
| INV-KEY-187 | `vimInsertModeRemaps` | Map a two-key INSERT sequence, such as `jj`, to Escape. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | v2.1.208+. Read from user, `--settings`, and managed settings only; project files ignored. |
| INV-KEY-188 | `h` `j` `k` `l`, `Space`, `w` `e` `b`, `0` `$` `^`, `gg` `G`, `f` `F` `t` `T`, `;` `,`, `%`, `/` | Move the cursor and search history in NORMAL mode. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `%` v2.1.301+. `/` opens history search. `j`/`k` at edges navigate history; `←` on empty prompt opens agent view. |
| INV-KEY-189 | `x`, `r`, `dd`, `D`, `dw` `de` `db`, `df` `dt`, `dj` `dk`, `dgg` `dG`, `d0` `c0` `y0`, `d%` `c%` `y%`, `cc`, `C`, `cw` `ce` `cb`, `s`, `S`, `yy`/`Y`, `yw` `ye` `yb`, `p` `P`, `>>` `<<`, `J`, `u`, `.` | Delete, change, yank, paste, indent, join, undo, and repeat in NORMAL mode. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `s`/`S` v2.1.211+; `d0`/`c0`/`y0` v2.1.281+; `d%`/`c%`/`y%` v2.1.301+. |
| INV-KEY-190 | `iw` `aw`, `iW` `aW`, `i"` `a"`, `i'` `a'`, `i(` `a(`, `i[` `a[`, `i{` `a{` | Text objects for `d`, `c`, and `y` operators. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | — |
| INV-KEY-191 | `d`/`x`, `y`, `c`/`s`, `p`, `r`, `~` `u` `U`, `>` `<`, `J`, `o`, `v`/`V` | Operate on character-wise or line-wise visual selections. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Text objects also select. Block-wise `Ctrl+V` isn't supported. |
| INV-KEY-192 | Vim mode and keybindings interaction | Vim handles text input; keybindings handle component actions. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `Esc` enters NORMAL, not `chat:cancel`. `?` shows help in NORMAL. Most Ctrl keys pass through. Vim keys not remappable. |

## Keybindings file and actions

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-KEY-193 | `~/.claude/keybindings.json` | Customize shortcuts per context; changes apply without restarting. | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Fields `$schema`, `$docs`, `bindings`. Open with `/keybindings`. |
| INV-KEY-194 | Binding contexts | Scope each block of bindings to where it applies. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | 27 contexts: `Global`, `Chat`, `Autocomplete`, `Settings`, `Confirmation`, `Tabs`, `Help`, `Transcript`, `HistorySearch`, `Task`, `ThemePicker`, `Attachments`, `Footer`, `MessageSelector`, `DiffDialog`, `DiffPanel`, `ModelPicker`, `EffortSlider`, `Select`, `Plugin`, `AbovePrompt`, `AbovePromptInput`, `AbovePromptSelect`, `Pane`, `PaneField`, `Agents`, `Scroll`. |
| INV-KEY-195 | Keystroke syntax | Write modifiers, special keys, and case-insensitive key names. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `ctrl`, `shift`, `alt`/`opt`/`meta`, `cmd`/`super`/`win` (needs Kitty or modifyOtherKeys). Non-US layouts: Latin names. |
| INV-KEY-196 | Chords (for example `ctrl+k ctrl+s`) | Bind keystroke sequences, each within 3 seconds of the last. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | — |
| INV-KEY-197 | Unbind with `null` | Remove a default binding, including the `ctrl+x` chords. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Unbind every `ctrl+x` chord in each context to reclaim the prefix. |
| INV-KEY-198 | Reserved shortcuts | `Ctrl+C`, `Ctrl+D`, `Ctrl+M`, `Ctrl+[`, `Ctrl+I`, `Ctrl+H`, Caps Lock can't be rebound. | ✅ | ✅ | ⚪ Default | — | ⏳ | `Ctrl+H` on Windows depends on `CLAUDE_CODE_BS_AS_CTRL_BACKSPACE`. |
| INV-KEY-199 | Terminal conflicts | `Ctrl+B` (tmux), `Ctrl+A` (screen), `Ctrl+Z` (SIGTSTP) may clash. | ✅ | ✅ | ⚪ Default | — | ⏳ | tmux: press `Ctrl+B` twice. |
| INV-KEY-200 | Text-field typing | Bare-letter bindings still type in dialog text fields. | ✅ | ✅ | ⚪ Default | — | ⏳ | Non-printing keys, modified keys, and chord second keys still fire. |
| INV-KEY-201 | Binding validation | Invalid bindings produce warnings in the debug log. | ✅ | ✅ | ⚪ Default | — | ⏳ | Run with `--debug`. Unknown actions are skipped; defaults stay. |
| INV-KEY-202 | `Global` app actions | Interrupt, exit, redraw, toggle to-dos, toggle transcript. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `app:interrupt` `Ctrl+C`, `app:exit` `Ctrl+D`, `app:redraw` unbound, `app:toggleTodos` `Ctrl+T`, `app:toggleTranscript` `Ctrl+O`. |
| INV-KEY-203 | History actions | Open history search and step through history. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `history:search` `Ctrl+R`, `history:previous` `Up`, `history:next` `Down`. |
| INV-KEY-204 | `Chat` actions | Submit, queue, edit, stash, paste images, and switch modes from the prompt. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `chat:cancel`, `clearInput` `Ctrl+L`, `clearScreen` `Cmd+K`, `killAgents`, `cycleMode`, `modelPicker`, `fastMode`, `thinkingToggle`, `submit`, `queueSubmit` `Ctrl+X Enter` (v2.1.247+), `sendNow`, `newline`, `undo`, `externalEditor`, `stash`, `imagePaste`. |
| INV-KEY-205 | `Autocomplete` actions | Accept, dismiss, and move through suggestions. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `autocomplete:accept` `Tab`, `dismiss` `Esc`, `previous` `Up`, `next` `Down`. |
| INV-KEY-206 | `Confirmation` actions | Answer and navigate permission and confirmation dialogs. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `confirm:yes` `Enter`, `no` `Esc`, `previous`/`next` arrows, `nextField` `Tab`, `toggle` `Space`, `cycleMode` `Shift+Tab`. Bare-letter bindings act in every dialog. |
| INV-KEY-207 | `Transcript` actions | Toggle show-all and exit the transcript viewer. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `transcript:toggleShowAll` `Ctrl+E` (classic only), `transcript:exit` `q`/`Ctrl+C`/`Esc`. |
| INV-KEY-208 | `HistorySearch` actions | Next match, accept, cancel, execute, and cycle scope. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `next` `Ctrl+R`, `accept` `Esc`/`Tab`, `cancel` `Ctrl+C`, `execute` `Enter`, `cycleScope` `Ctrl+S` (fullscreen). |
| INV-KEY-209 | `Task` actions | Background the foreground task. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `task:background` `Ctrl+B`, `Ctrl+X Ctrl+B`. |
| INV-KEY-210 | `ThemePicker` actions | Toggle syntax highlighting in the theme picker. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `theme:toggleSyntaxHighlighting` `Ctrl+T`. |
| INV-KEY-211 | `Help` actions | Close the help menu. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `help:dismiss` `Esc`. |
| INV-KEY-212 | `Tabs` actions | Move to the next or previous dialog tab. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `tabs:next` `Tab`/`Right`, `tabs:previous` `Shift+Tab`/`Left`. |
| INV-KEY-213 | `Attachments` actions | Move between, remove, or leave image attachments. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `next` `Right`, `previous` `Left`, `remove` `Backspace`/`Delete`, `exit` `Down`/`Esc`. |
| INV-KEY-214 | `Footer` actions | Navigate, open, clear, or stop footer items. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `next`, `previous`, `up` (`Up`/`Ctrl+P`), `down` (`Down`/`Ctrl+N`), `openSelected` `Enter`, `clearSelection` `Esc`, `close` `x`. |
| INV-KEY-215 | `MessageSelector` context | Rebind Select actions for the rewind menu list only. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | No actions of its own; `Home`/`End` jump to ends. |
| INV-KEY-216 | `DiffDialog` actions | Navigate the earlier diff viewer and scroll its detail view. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `diff:dismiss`, `previousSource`, `nextSource`, `previousFile` (`Up`/`K`), `nextFile` (`Down`/`J`), `back`; pager `scroll:*` keys. Only when `cc-plugin-diff` is disabled. |
| INV-KEY-217 | `DiffPanel` actions | Cycle comparison base and scroll the diff panel file list. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `app:cycleDiffBase` `Ctrl+X B`, `diffFileListUp`/`Down`, unbound `toggleReplTab`, `toggleDiffNoiseFilter`, `toggleDiffPreSession`. |
| INV-KEY-218 | `ModelPicker` actions | Adjust effort or apply a model to this session only. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `decreaseEffort` `Left`, `increaseEffort` `Right`, `thisSessionOnly` `s`. |
| INV-KEY-219 | `EffortSlider` actions | Move the `/effort` slider, toggle ultracode, or apply to this session. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `decreaseEffort`, `increaseEffort`, `toggleUltracode` `Tab` (v2.1.284+), `thisSessionOnly` `s` (v2.1.257+). |
| INV-KEY-220 | `Select` actions | Move through, page, accept, or cancel list options. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `next`, `previous`, `pageUp`, `pageDown`, `first` `Home`, `last` `End`, `accept` `Enter`, `cancel` `Esc`. |
| INV-KEY-221 | `Plugin` actions | Toggle, install, or favorite plugins in the plugin dialog. | ✅ | ✅ | ⚪ Default | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | `plugin:toggle` `Space`, `install` `I`, `favorite` `F`. Moot while plugins are blocked. |
| INV-KEY-222 | Above-prompt actions | Collapse, focus, and operate the band where mods draw controls. | ✅ | ✅ | ⚪ Default | [EXT-014](../03-test-plan/catalog/extensions.md#ext-014) | ⏳ | `abovePrompt:toggle` `Ctrl+X Ctrl+A`, `focus` `Ctrl+X Tab`, `next`, `previous`, `press`, `leave`, `highlightNext`, `highlightPrevious`. |
| INV-KEY-223 | `Pane` actions | Scroll, resize, close, or switch mod panes. | ✅ | ✅ | ⚪ Default | [EXT-014](../03-test-plan/catalog/extensions.md#ext-014) | ⏳ | Scroll keys; `grow` `Ctrl+X Left`/`Up`, `shrink` `Ctrl+X Right`/`Down`, `close` `Ctrl+X X`; unbound `next`/`previous`. |
| INV-KEY-224 | `Settings` actions | Search, retry, change, or close the settings panel. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | `settings:search` `/`, `settings:retry` `R`, `select:accept` `Enter`/`Space`, `confirm:no` `Esc`. |
| INV-KEY-225 | `Agents` actions | Group, pin, find, rename, and jump sessions in agent view. | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | `switchView` `Ctrl+S`, `togglePin` `Ctrl+T`, `find` `Ctrl+F`, `rename` `Ctrl+R`, `previousGroup`/`nextGroup`. v2.1.257+; some v2.1.288+. |
| INV-KEY-226 | Voice actions | Push-to-talk for voice dictation. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | `voice:pushToTalk` `Space`. Voice needs a claude.ai account. |
| INV-KEY-227 | `Scroll` actions | Scroll the conversation and extend or copy selections in fullscreen. | ✅ | ✅ | ⚪ Default | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Fullscreen only. Wheel, `PageUp`/`PageDown`, `Ctrl+Home`/`Ctrl+End`, unbound half/full page; `selection:copy` `Ctrl+Shift+C`, `selection:extend*` with `Shift`, unbound `selection:clear`. |

## Interactive-mode features

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-KEY-228 | Background Bash commands | Run long commands asynchronously while you keep working. | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Auto-backgrounds at timeout (not `sleep`). 5 GB output cap. `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` turns off. |
| INV-KEY-229 | Automatic session recap | Show a one-line recap when you return after stepping away. | ✅ | ✅ | ⚪ Default | — | ⏳ | After 3+ minutes idle and 3+ turns. On for every provider. Off in `/config` → Session recap. |
| INV-KEY-230 | "You should know" suggestions | Built-in mod that flags tradeoffs or results you may have missed. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Needs feature-flag fetching, off on Foundry. Off by default; v2.1.287+. Answer with `1`, `2`, `0`. |
| INV-KEY-231 | Spell check as you type | Underline misspelled words in the prompt input. | ✅ | ❓ | ⚪ Default | — | ⏳ | Off by default; `spellcheck` read from user or managed settings. v2.1.235+. [verify] aspell, hunspell, or ispell in the image. |
| INV-KEY-232 | Invisible character removal | Strip hidden Unicode from prompts and pastes before sending. | ✅ | ✅ | ⚪ Default | — | ⏳ | Shows `Removed N invisible characters`; press Enter again. Helps against hidden pasted instructions (R-09). |
| INV-KEY-233 | Wait for usage limit reset | Auto-continue a task after a claude.ai usage limit resets. | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | claude.ai subscription only; not offered for cloud providers. `Esc` cancels. v2.1.234+. |
| INV-KEY-234 | PR review status badge | Footer PR link colored by review state; `Ctrl+click` opens it. | ✅ | ✅ | 🔴 Block | [NET-003](../03-test-plan/catalog/network.md#net-003) | ⏳ | Status checks stop under `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` (CTL-19). Needs a GitHub token. `prStatusFooterEnabled`. |
| INV-KEY-235 | GitLab merge request badge | Footer `MR !N` badge colored by merge request state. | ✅ | ✅ | ⛔ Unavailable | — | ⏳ | Not applicable: GitHub is the SCM. Needs `glab`; v2.1.234+. |
| INV-KEY-236 | Issue reference links | Make `owner/repo#123` clickable to the repo host's issue page. | ✅ | ✅ | ⚪ Default | — | ⏳ | `FORCE_HYPERLINK=1` or `0`. Links built from the git remote's host. |

## Removed and deprecated

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CMD-237 | `/pr-comments [PR]` | Fetched and displayed GitHub pull request comments. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.91. Ask Claude directly instead. |
| INV-CMD-238 | `/ultraplan <prompt>` | Sent a planning task to a cloud session for browser review. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed. Use plan mode. |
| INV-CMD-239 | `/vim` | Toggled between Vim and Normal editing modes. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed in v2.1.92. Use `/config` → Editor mode. |
| INV-KEY-240 | `keybindingFlavor` | Setting that turned on readline word-editing keys. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Deprecated v2.1.261; no effect, still accepted. Readline behavior is always on. |
| INV-KEY-241 | `confirm:toggleExplanation` (`Ctrl+E`) | Showed a model explanation on Bash and PowerShell prompts. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed before v2.1.257. |
| INV-KEY-242 | `Doctor` context and `doctor:fix` | Bindings for the old `/doctor` diagnostics screen. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Existed before v2.1.205. |
| INV-KEY-243 | `messageSelector:*` actions | Old rewind-list actions: `up`, `down`, `top`, `bottom`, `select`. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Replaced by Select actions in v2.1.283; old bindings still map. `Shift+K`/`Shift+J` defaults replaced by `Home`/`End`. |
| INV-KEY-244 | `diff:viewDetails` and `Left` for `diff:back` | Old diff viewer bindings. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | `diff:viewDetails` maps to `select:accept` since v2.1.283. `Left` default for `diff:back` removed v2.1.203. |
| INV-KEY-245 | `footer:dismiss`, `confirm:previousField`, `permission:toggleDebug` | No-op actions kept so old keybinding files stay valid. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | `footer:dismiss` was `Backspace`/`Delete` before v2.1.281. |
| INV-KEY-246 | Default `y` and `n` confirmation bindings | Letter shortcuts that confirmed or declined dialogs. | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Removed as defaults in v2.1.280; files made earlier by `/keybindings` still list them. |

## Coverage summary

| Policy | Count |
|---|---|
| 🟢 Allow | 57 |
| 🟡 Restrict | 12 |
| 🔴 Block | 12 |
| ⚪ Default | 118 |
| ⛔ Unavailable | 47 |
| **Total** | **246** |

| Result | Count |
|---|---|
| ⏳ Not run | 246 |
| 🟩 Pass | 0 |
| 🟨 Issue | 0 |
| 🟥 Blocker | 0 |
| ⏭ N/A | 0 |

## Related

- [Feature inventory rollup](README.md)
- [CLI flags and subcommands](cli-flags-and-subcommands.md)
- [Settings keys](settings-keys.md)
- [Environment variables](environment-variables.md)
- [Tools, hooks & modes](tools-and-hooks.md)
- [Surfaces and integrations](surfaces-and-integrations.md)
- [Test catalog: features](../03-test-plan/catalog/features.md) · [extensions](../03-test-plan/catalog/extensions.md) · [surfaces](../03-test-plan/catalog/surfaces.md)
- Official docs: [Commands](https://code.claude.com/docs/en/commands) · [Interactive mode](https://code.claude.com/docs/en/interactive-mode) · [Customize keyboard shortcuts](https://code.claude.com/docs/en/keybindings) · [Skills](https://code.claude.com/docs/en/skills) · [Feature availability](https://code.claude.com/docs/en/feature-availability)
