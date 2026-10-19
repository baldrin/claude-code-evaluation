---
title: CLI flags and subcommands
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 1
---

# CLI flags and subcommands

[🏠 Home](../../README.md) › [Feature inventory](README.md) › CLI flags and subcommands

Every `claude` subcommand (nested ones included), every subcommand option, and every top-level flag, with a proposed policy for the Foundry-backed dev container. Built from the [CLI reference](https://code.claude.com/docs/en/cli-reference) and the `--help` output of the installed build, for Claude Code **2.1.301** as of 2026-10-15.

> [!NOTE]
> **How to use this page.** For each row, confirm the behavior in the evaluation container, then set **Result** (⏳ → 🟩/🟨/🟥/⏭) and put evidence in `evidence/<ID>/`. Rows with a catalog test in **Covered by** are verified by that test; mark them with the test's result. **Policy** is the *proposed* decision. Changes need an ADR in `logs/decision-log.md`.

> [!IMPORTANT]
> **Sources and gaps.** The docs say `claude --help` does not list every flag. **Notes** says *Both*, *Docs only*, or *Help only* for each row. `--help` output was captured from build 2.1.301 on the evaluator's macOS workstation; re-capture it inside the container as evidence [verify]. Subcommand rows inherit policy from their parent unless Notes says otherwise. Each subcommand's own `-h`/`--help` is covered by the `--help, -h` row. `SUB` rows are subcommands and invocation forms; `CLI` rows are flags and subcommand options.

## Contents
- [Invocation forms](#invocation-forms)
- [Subcommands: authentication](#subcommands-authentication)
- [Subcommands: MCP](#subcommands-mcp)
- [Subcommands: plugin](#subcommands-plugin)
- [Subcommands: plugin marketplace](#subcommands-plugin-marketplace)
- [Subcommands: background sessions and daemon](#subcommands-background-sessions-and-daemon)
- [Subcommands: auto mode](#subcommands-auto-mode)
- [Subcommands: maintenance](#subcommands-maintenance)
- [Subcommands: cloud, remote, and review](#subcommands-cloud-remote-and-review)
- [Subcommands: other](#subcommands-other)
- [Print/headless and automation flags](#printheadless-and-automation-flags)
- [Model and effort flags](#model-and-effort-flags)
- [Permissions and tools flags](#permissions-and-tools-flags)
- [System prompt and context flags](#system-prompt-and-context-flags)
- [Config, MCP, and plugin flags](#config-mcp-and-plugin-flags)
- [Session flags](#session-flags)
- [Background, worktree, and cloud flags](#background-worktree-and-cloud-flags)
- [Surface and UI flags](#surface-and-ui-flags)
- [Debug and info flags](#debug-and-info-flags)
- [Subcommand options: self-hosted-runner](#subcommand-options-self-hosted-runner)
- [Coverage summary](#coverage-summary)
- [Related](#related)

## Invocation forms

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SUB-001 | `claude` | Start an interactive session in the current directory | ✅ | ✅ | 🟢 Allow | [SURF-001](../03-test-plan/catalog/surfaces.md#surf-001), [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ | Both. |
| INV-SUB-002 | `claude "query"` | Start an interactive session with an initial prompt | ✅ | ✅ | 🟢 Allow | [FEAT-001](../03-test-plan/catalog/features.md#feat-001) | ⏳ | Both. Help shows it as the `[prompt]` argument. |
| INV-SUB-003 | `claude -p "query"` | Run one query non-interactively, print the result, exit | ✅ | ✅ | 🟢 Allow | [FEAT-012](../03-test-plan/catalog/features.md#feat-012) | ⏳ | Docs command table. Same behavior as the `--print` row. |
| INV-SUB-004 | `cat file \| claude -p "query"` | Pipe file or command output into a print-mode query | ✅ | ✅ | 🟢 Allow | [FEAT-012](../03-test-plan/catalog/features.md#feat-012) | ⏳ | Docs only (usage pattern of `--print`). |
| INV-SUB-005 | `claude -c` | Continue the most recent conversation in this directory | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | Docs command table. Same behavior as the `--continue` row. |
| INV-SUB-006 | `claude -c -p "query"` | Continue the latest conversation non-interactively | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017), [FEAT-012](../03-test-plan/catalog/features.md#feat-012) | ⏳ | Docs only (usage pattern). Includes `-p`, SDK, and `/loop` sessions. |
| INV-SUB-007 | `claude -r "<session>" "query"` | Resume a session by ID or name with a new prompt | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | Docs only (usage pattern of `--resume`). |

## Subcommands: authentication

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SUB-008 | `claude auth` | Manage Anthropic account sign-in | ⛔ | ✅ | ⛔ Unavailable | [POL-013](../03-test-plan/catalog/policy.md#pol-013) | ⏳ | Both. Group: `login`, `logout`, `status`, `help [command]`. Only `status` is useful on Foundry. |
| INV-SUB-009 | `claude auth login` | Sign in to a claude.ai or Anthropic Console account | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013), [NET-002](../03-test-plan/catalog/network.md#net-002) | ⏳ | Both. Stops personal-account routing: `allowedProviders` 🔒 managed-only + egress firewall denies Anthropic login hosts (CTL-04) [verify]. |
| INV-CLI-010 | `claude auth login --claudeai` | Sign in with a Claude subscription (the default) | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013) | ⏳ | Help only. Same mechanism as `claude auth login`. |
| INV-CLI-011 | `claude auth login --console` | Sign in with Anthropic Console API billing | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013) | ⏳ | Both. Same mechanism as `claude auth login`. |
| INV-CLI-012 | `claude auth login --email` | Pre-fill the email address on the login page | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013) | ⏳ | Both. Same mechanism as `claude auth login`. |
| INV-CLI-013 | `claude auth login --sso` | Force the SSO login flow | ⛔ | ✅ | 🔴 Block | [POL-013](../03-test-plan/catalog/policy.md#pol-013) | ⏳ | Both. Same mechanism as `claude auth login`. |
| INV-SUB-014 | `claude auth logout` | Log out of the Anthropic account | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Both. No Anthropic session exists on Foundry. |
| INV-SUB-015 | `claude auth status` | Print authentication status, JSON by default | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. Expect `authMethod: third_party`. `configDirectory` field needs v2.1.268+. Exit code on Foundry [verify]. Compare `/status` (IDN-012). |
| INV-CLI-016 | `claude auth status --json` | Output status as JSON (the default) | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. |
| INV-CLI-017 | `claude auth status --text` | Output status as human-readable text | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. |
| INV-SUB-018 | `claude setup-token` | Generate a long-lived OAuth token for CI and scripts | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Both. Requires a Claude subscription. CI uses Foundry auth instead (SURF-005). |

## Subcommands: MCP

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SUB-019 | `claude mcp` | Configure and manage MCP servers | ✅ | ✅ | 🟡 Restrict | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001), [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Both. Group also lists `help [command]`. No servers at start: `allowManagedMcpServersOnly` + empty managed `allowedMcpServers` 🔒 managed-only (CTL-12). |
| INV-SUB-020 | `claude mcp add` | Add a stdio, SSE, or HTTP MCP server | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only (docs link to MCP page). Config may be written, but the server must not load: `allowManagedMcpServersOnly` + empty managed `allowedMcpServers` 🔒 managed-only (CTL-12). |
| INV-CLI-021 | `claude mcp add --callback-port` | Fix the port for the OAuth callback | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Inherits `mcp add` policy. |
| INV-CLI-022 | `claude mcp add --client-id` | Set the OAuth client ID for HTTP or SSE servers | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Inherits `mcp add` policy. |
| INV-CLI-023 | `claude mcp add --client-secret` | Prompt for the OAuth client secret | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Also reads `MCP_CLIENT_SECRET`. Inherits `mcp add` policy. |
| INV-CLI-024 | `claude mcp add --env` | Set environment variables for a stdio server | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Short form `-e`. Inherits `mcp add` policy. |
| INV-CLI-025 | `claude mcp add --header` | Set HTTP headers for HTTP or SSE servers | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Short form `-H`. Inherits `mcp add` policy. |
| INV-CLI-026 | `claude mcp add --scope` | Choose local, user, or project configuration scope | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002), [EXT-001](../03-test-plan/catalog/extensions.md#ext-001) | ⏳ | Help only. Short form `-s`. `project` writes `.mcp.json`. Inherits `mcp add` policy. |
| INV-CLI-027 | `claude mcp add --transport` | Choose stdio, sse, or http transport | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Short form `-t`. Inherits `mcp add` policy. |
| INV-SUB-028 | `claude mcp add-json` | Add an MCP server from a JSON string | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Accepts stdio, SSE, HTTP, or WebSocket. `allowManagedMcpServersOnly` + empty managed `allowedMcpServers` 🔒 managed-only (CTL-12). |
| INV-CLI-029 | `claude mcp add-json --client-secret` | Prompt for the OAuth client secret | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Inherits `mcp add-json` policy. |
| INV-CLI-030 | `claude mcp add-json --scope` | Choose local, user, or project configuration scope | ✅ | ✅ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Short form `-s`. Inherits `mcp add-json` policy. |
| INV-SUB-031 | `claude mcp add-from-claude-desktop` | Import MCP servers from Claude Desktop configuration | ✅ | ⛔ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Mac and WSL only; no Desktop in the container. `allowManagedMcpServersOnly` + empty managed `allowedMcpServers` 🔒 managed-only (CTL-12). |
| INV-CLI-032 | `claude mcp add-from-claude-desktop --scope` | Choose the scope for imported servers | ✅ | ⛔ | 🔴 Block | [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Short form `-s`. Inherits parent policy. |
| INV-SUB-033 | `claude mcp get` | Show details and health of one MCP server | ✅ | ✅ | 🟢 Allow | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001) | ⏳ | Help only. Read-only. Unapproved `.mcp.json` servers show as pending. |
| INV-SUB-034 | `claude mcp list` | List configured MCP servers and their health | ✅ | ✅ | 🟢 Allow | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001), [EXT-002](../03-test-plan/catalog/extensions.md#ext-002) | ⏳ | Help only. Read-only. Use it to confirm the lockdown. |
| INV-SUB-035 | `claude mcp login` | Run an MCP server's OAuth flow from the shell | ✅ | ✅ | 🔴 Block | [EXT-011](../03-test-plan/catalog/extensions.md#ext-011), [EXT-012](../03-test-plan/catalog/extensions.md#ext-012) | ⏳ | Both. claude.ai connectors are ⛔ on Foundry. No approved servers in Phase 1: `allowManagedMcpServersOnly` + empty managed `allowedMcpServers` 🔒 managed-only (CTL-12). |
| INV-CLI-036 | `claude mcp login --no-browser` | Print the authorization URL instead of opening a browser | ✅ | ✅ | 🔴 Block | [EXT-012](../03-test-plan/catalog/extensions.md#ext-012) | ⏳ | Both. The form a headless container needs. Inherits `mcp login` policy. |
| INV-SUB-037 | `claude mcp logout` | Clear stored OAuth credentials for an MCP server | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. Only removes credentials. |
| INV-SUB-038 | `claude mcp remove` | Remove an MCP server from configuration | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. |
| INV-CLI-039 | `claude mcp remove --scope` | Remove the server from one scope only | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Short form `-s`. |
| INV-SUB-040 | `claude mcp reset-project-choices` | Reset approvals for project `.mcp.json` servers | ✅ | ✅ | ⚪ Default | [EXT-001](../03-test-plan/catalog/extensions.md#ext-001) | ⏳ | Help only. Project servers must stay unloaded either way. |
| INV-SUB-041 | `claude mcp serve` | Run Claude Code itself as an MCP server | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. No setting disables it. [verify] managed permissions and sandbox apply to tools served this way. |
| INV-CLI-042 | `claude mcp serve --debug` | Enable debug output for the MCP server | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Short form `-d`. |
| INV-CLI-043 | `claude mcp serve --verbose` | Override the verbose setting for the MCP server | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. |

## Subcommands: plugin

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SUB-044 | `claude plugin` | Manage Claude Code plugins | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Both. Alias `claude plugins`. Group also lists `help [command]`. `strictKnownMarketplaces: []` 🔒 managed-only (CTL-13). |
| INV-SUB-045 | `claude plugin configure` | Show or set a plugin's user options | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Nothing installable under `strictKnownMarketplaces: []` 🔒 managed-only (CTL-13). |
| INV-CLI-046 | `claude plugin configure --json` | Output plugin options as JSON | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits parent policy. |
| INV-CLI-047 | `claude plugin configure --values-stdin` | Read option values from stdin as JSON | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits parent policy. |
| INV-SUB-048 | `claude plugin details` | Show a plugin's components and projected token cost | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. Read-only. |
| INV-SUB-049 | `claude plugin disable` | Disable an enabled plugin | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Nothing installed to disable. |
| INV-CLI-050 | `claude plugin disable --all` | Disable every enabled plugin | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Short form `-a`. |
| INV-CLI-051 | `claude plugin disable --json` | Print a machine-readable result line | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. |
| INV-CLI-052 | `claude plugin disable --scope` | Choose user, project, or local scope | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Short form `-s`. |
| INV-SUB-053 | `claude plugin enable` | Enable a disabled plugin | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. `strictKnownMarketplaces: []` 🔒 managed-only (CTL-13). |
| INV-CLI-054 | `claude plugin enable --json` | Print a machine-readable result line | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits parent policy. |
| INV-CLI-055 | `claude plugin enable --scope` | Choose user, project, or local scope | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Short form `-s`. Inherits parent policy. |
| INV-SUB-056 | `claude plugin eval` | Run a plugin's eval suite and report scores | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Loads plugin code from a path or name. [verify] `strictKnownMarketplaces: []` 🔒 managed-only (CTL-13) also stops path targets. Report publishes to claude.ai by default (⛔). |
| INV-CLI-057 | `claude plugin eval --ablation` | Add a no-plugin baseline arm and report the delta | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-058 | `claude plugin eval --allow-real-servers` | Start the plugin's real MCP servers when no mock exists | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Servers run outside the OS sandbox. Inherits `plugin eval` policy. |
| INV-CLI-059 | `claude plugin eval --allow-tools` | Grant gated tools such as Bash, Write, WebFetch, MCP | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-060 | `claude plugin eval --case` | Filter eval cases by name glob | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-061 | `claude plugin eval --concurrency` | Run up to n agent runs at once | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Short form `-j`. Inherits `plugin eval` policy. |
| INV-CLI-062 | `claude plugin eval --disallow-tools` | Keep named built-in tools from Claude in every case | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-063 | `claude plugin eval --eval-dir` | Choose the directory that holds eval cases | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-064 | `claude plugin eval --json` | Print or write the full run result as JSON | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-065 | `claude plugin eval --judge-model` | Override the LLM grader model (default haiku) | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Needs a Haiku deployment on Foundry (COST-010). Inherits `plugin eval` policy. |
| INV-CLI-066 | `claude plugin eval --keep-temp` | Keep scaffold directories for debugging | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-067 | `claude plugin eval --max-cost-usd` | Abort the eval when a cost ceiling is hit | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-068 | `claude plugin eval --mocks` | Choose MCP mock stand-ins: record or off | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-069 | `claude plugin eval --model` | Override the model for all cases | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-070 | `claude plugin eval --no-publish` | Keep the HTML report local; skip claude.ai publishing | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-071 | `claude plugin eval --no-scaffold` | Skip each case's scaffold script | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-072 | `claude plugin eval --output-dir` | Directory for the aggregate result JSON | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-073 | `claude plugin eval --publish-report` | Require publishing the report to claude.ai | ⛔ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Publishing needs claude.ai (⛔ on Foundry). Inherits `plugin eval` policy. |
| INV-CLI-074 | `claude plugin eval --report` | Write the HTML report to a given path | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-075 | `claude plugin eval --runs` | Override the number of runs per case | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-076 | `claude plugin eval --scaffold` | Run each case's author-supplied bash scaffold script | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Runs bash as the user. Inherits `plugin eval` policy. |
| INV-CLI-077 | `claude plugin eval --tag` | Filter cases by tag | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-078 | `claude plugin eval --threshold` | Exit 1 when any case scores below the threshold | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-079 | `claude plugin eval --trust-plugin` | Skip the first-run plugin trust prompt, for CI | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Trust bypass for plugin code. Inherits `plugin eval` policy. |
| INV-CLI-080 | `claude plugin eval --verbose` | Log per-message trace events to the debug log | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-SUB-081 | `claude plugin eval init` | Author an eval suite by interview or blank template | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-082 | `claude plugin eval init --bare` | Write a blank single-case eval template | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-083 | `claude plugin eval init --eval-dir` | Choose the directory to write cases into | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin eval` policy. |
| INV-CLI-084 | `claude plugin eval init --interactive` | Run the authoring interview in a terminal | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Short form `-i`. Inherits `plugin eval` policy. |
| INV-SUB-085 | `claude plugin init` | Scaffold a new plugin under `~/.claude/skills/` | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Alias `new`. Scaffold auto-loads as `<name>@skills-dir`; any `strictKnownMarketplaces: []` 🔒 managed-only (CTL-13) allowlist stops that load [verify]. |
| INV-CLI-086 | `claude plugin init --author` | Set the plugin author name | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin init` policy. |
| INV-CLI-087 | `claude plugin init --author-email` | Set the plugin author email | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin init` policy. |
| INV-CLI-088 | `claude plugin init --description` | Set the manifest description | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin init` policy. |
| INV-CLI-089 | `claude plugin init --force` | Overwrite an existing `.claude-plugin/` folder | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Short form `-f`. Inherits `plugin init` policy. |
| INV-CLI-090 | `claude plugin init --with` | Also scaffold skills, agents, hooks, MCP, LSP, and more | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin init` policy. |
| INV-SUB-091 | `claude plugin install` | Install a plugin from a marketplace | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Both (docs example). Alias `i`. `strictKnownMarketplaces: []` 🔒 managed-only (CTL-13); also `disableCommandPluginSources` 🔒. |
| INV-CLI-092 | `claude plugin install --accept-command` | Accept a marketplace-declared install command by its hash | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin install` policy. |
| INV-CLI-093 | `claude plugin install --config` | Set a plugin userConfig option at install | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin install` policy. |
| INV-CLI-094 | `claude plugin install --json` | Print a machine-readable result line | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin install` policy. |
| INV-CLI-095 | `claude plugin install --marketplace` | Install from a marketplace source, adding it first | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Adds a marketplace; same allowlist check. Inherits `plugin install` policy. |
| INV-CLI-096 | `claude plugin install --registry` | Use a specific npm registry for npm plugins | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Internal mirror only (NET-010). Inherits `plugin install` policy. |
| INV-CLI-097 | `claude plugin install --scope` | Choose user, project, or local scope | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Short form `-s`. Inherits `plugin install` policy. |
| INV-CLI-098 | `claude plugin install --yes` | Accept the marketplace-declared command without a prompt | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Short form `-y`. Inherits `plugin install` policy. |
| INV-SUB-099 | `claude plugin list` | List installed plugins | ✅ | ✅ | 🟢 Allow | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Read-only. Use it to confirm none are installed. |
| INV-CLI-100 | `claude plugin list --available` | Include plugins available from marketplaces | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. Requires `--json`. |
| INV-CLI-101 | `claude plugin list --data-size` | Measure plugin data directory sizes | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. Requires `--json`. |
| INV-CLI-102 | `claude plugin list --json` | Output the plugin list as JSON | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. |
| INV-SUB-103 | `claude plugin prune` | Remove auto-installed dependencies no longer needed | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Alias `autoremove`. Nothing installed. |
| INV-CLI-104 | `claude plugin prune --dry-run` | List what would be removed | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. |
| INV-CLI-105 | `claude plugin prune --scope` | Prune at user, project, or local scope | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Short form `-s`. |
| INV-CLI-106 | `claude plugin prune --yes` | Skip the confirmation prompt | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Short form `-y`. |
| INV-SUB-107 | `claude plugin tag` | Create a release git tag for a plugin | ✅ | ✅ | ⚪ Default | [IDN-007](../03-test-plan/catalog/identity.md#idn-007) | ⏳ | Help only. Pushes are limited by the scoped token and rulesets (CTL-17). |
| INV-CLI-108 | `claude plugin tag --dry-run` | Print the tag without creating it | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. |
| INV-CLI-109 | `claude plugin tag --force` | Skip dirty-tree and existing-tag checks | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Short form `-f`. |
| INV-CLI-110 | `claude plugin tag --message` | Set the tag annotation message | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Short form `-m`. |
| INV-CLI-111 | `claude plugin tag --push` | Push the tag to the remote after creating it | ✅ | ✅ | ⚪ Default | [IDN-007](../03-test-plan/catalog/identity.md#idn-007) | ⏳ | Help only. |
| INV-CLI-112 | `claude plugin tag --remote` | Choose the remote for `--push` | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Default `origin`. |
| INV-SUB-113 | `claude plugin test` | Run a mod's test files | ✅ | ✅ | ⚪ Default | [EXT-014](../03-test-plan/catalog/extensions.md#ext-014) | ⏳ | Help only. Runs `*.test.ts` files locally. Mods themselves are managed-only (`allowManagedModsOnly`). |
| INV-SUB-114 | `claude plugin uninstall` | Uninstall an installed plugin | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Alias `remove`. Nothing installed. |
| INV-CLI-115 | `claude plugin uninstall --json` | Print a machine-readable result line | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. |
| INV-CLI-116 | `claude plugin uninstall --keep-data` | Keep the plugin's persistent data directory | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. |
| INV-CLI-117 | `claude plugin uninstall --prune` | Also remove unneeded auto-installed dependencies | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. |
| INV-CLI-118 | `claude plugin uninstall --scope` | Uninstall from user, project, or local scope | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Short form `-s`. |
| INV-CLI-119 | `claude plugin uninstall --yes` | Skip the prune confirmation prompt | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Short form `-y`. |
| INV-SUB-120 | `claude plugin update` | Update a plugin to its latest version | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Allowlist is enforced on update: `strictKnownMarketplaces: []` 🔒 managed-only (CTL-13). |
| INV-CLI-121 | `claude plugin update --accept-command` | Accept a changed marketplace-declared command by hash | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin update` policy. |
| INV-CLI-122 | `claude plugin update --json` | Print a machine-readable result line | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `plugin update` policy. |
| INV-CLI-123 | `claude plugin update --scope` | Choose user, project, local, or managed scope | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Short form `-s`. Inherits `plugin update` policy. |
| INV-CLI-124 | `claude plugin update --yes` | Accept the displayed command without a prompt | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Short form `-y`. Inherits `plugin update` policy. |
| INV-SUB-125 | `claude plugin validate` | Validate a plugin or marketplace manifest | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. Local and read-only. |
| INV-CLI-126 | `claude plugin validate --json` | Output the validation report as JSON | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. |
| INV-CLI-127 | `claude plugin validate --strict` | Treat warnings as errors | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. |

## Subcommands: plugin marketplace

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SUB-128 | `claude plugin marketplace` | Manage plugin marketplaces | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Group also lists `help [command]`. `strictKnownMarketplaces: []` 🔒 managed-only (CTL-13). |
| INV-SUB-129 | `claude plugin marketplace add` | Add a marketplace from a URL, path, or GitHub repo | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. An empty `strictKnownMarketplaces: []` 🔒 managed-only (CTL-13) blocks every source. |
| INV-CLI-130 | `claude plugin marketplace add --claudeai` | Add a marketplace that claude.ai hosts for you | ⛔ | ✅ | ⛔ Unavailable | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Needs claude.ai. |
| INV-CLI-131 | `claude plugin marketplace add --json` | Print a machine-readable result line | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `marketplace add` policy. |
| INV-CLI-132 | `claude plugin marketplace add --scope` | Declare the marketplace at user, project, or local scope | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `marketplace add` policy. |
| INV-CLI-133 | `claude plugin marketplace add --sparse` | Limit the checkout to some directories | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Uses git sparse-checkout. Inherits `marketplace add` policy. |
| INV-SUB-134 | `claude plugin marketplace list` | List configured marketplaces | ✅ | ✅ | 🟢 Allow | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Read-only. |
| INV-CLI-135 | `claude plugin marketplace list --json` | Output the marketplace list as JSON | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. |
| INV-SUB-136 | `claude plugin marketplace remove` | Remove a configured marketplace | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Alias `rm`. |
| INV-CLI-137 | `claude plugin marketplace remove --json` | Print a machine-readable result line | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. |
| INV-CLI-138 | `claude plugin marketplace remove --scope` | Remove the declaration from one settings scope | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. |
| INV-SUB-139 | `claude plugin marketplace update` | Refresh marketplaces from their sources | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Allowlist is enforced on refresh: `strictKnownMarketplaces: []` 🔒 managed-only (CTL-13). |
| INV-CLI-140 | `claude plugin marketplace update --json` | Print a machine-readable result line | ✅ | ✅ | 🔴 Block | [EXT-003](../03-test-plan/catalog/extensions.md#ext-003) | ⏳ | Help only. Inherits `marketplace update` policy. |

## Subcommands: background sessions and daemon

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SUB-141 | `claude agents` | Open agent view to monitor and dispatch background sessions | ✅ | ✅ | 🟡 Restrict | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Both. Needs an interactive terminal unless `--json`. Dispatched sessions inherit managed settings and the bypass/sideload blocks [verify]. |
| INV-CLI-142 | `claude agents --add-dir` | Add a working directory for dispatched sessions | ✅ | ✅ | 🟡 Restrict | [PERM-013](../03-test-plan/catalog/permissions.md#perm-013) | ⏳ | Both. Sandbox and managed deny rules still apply. |
| INV-CLI-143 | `claude agents --agent` | Set the default agent for dispatched sessions | ✅ | ✅ | 🟡 Restrict | [EXT-009](../03-test-plan/catalog/extensions.md#ext-009) | ⏳ | Both. Project and managed agents only (EXT-009). |
| INV-CLI-144 | `claude agents --all` | With `--json`, include completed background sessions | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. |
| INV-CLI-145 | `claude agents --allow-dangerously-skip-permissions` | Offer bypass-permissions mode to dispatched sessions | ✅ | ✅ | 🔴 Block | [PERM-001](../03-test-plan/catalog/permissions.md#perm-001) | ⏳ | Help only. `permissions.disableBypassPermissionsMode: "disable"`. |
| INV-CLI-146 | `claude agents --cwd` | Show only sessions started under a path | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. |
| INV-CLI-147 | `claude agents --dangerously-skip-permissions` | Dispatch sessions in bypassPermissions mode | ✅ | ✅ | 🔴 Block | [PERM-001](../03-test-plan/catalog/permissions.md#perm-001) | ⏳ | Help only. `permissions.disableBypassPermissionsMode: "disable"`. |
| INV-CLI-148 | `claude agents --effort` | Set the default effort for dispatched sessions | ✅ | ✅ | 🟢 Allow | [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Both. |
| INV-CLI-149 | `claude agents --json` | Print active sessions as a JSON array and exit | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. No TTY needed. |
| INV-CLI-150 | `claude agents --mcp-config` | Apply MCP server config to dispatched sessions | ✅ | ✅ | 🔴 Block | [EXT-004](../03-test-plan/catalog/extensions.md#ext-004) | ⏳ | Both. `disableSideloadFlags` 🔒 managed-only [verify] it covers `claude agents`. |
| INV-CLI-151 | `claude agents --model` | Set the default model for dispatched sessions | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | Both. Limited by managed `availableModels`. |
| INV-CLI-152 | `claude agents --permission-mode` | Set the default permission mode for dispatched sessions | ✅ | ✅ | 🟡 Restrict | [PERM-001](../03-test-plan/catalog/permissions.md#perm-001), [POL-016](../03-test-plan/catalog/policy.md#pol-016) | ⏳ | Both. `permissions.disableBypassPermissionsMode: "disable"`; `disableAutoMode` per ADR. |
| INV-CLI-153 | `claude agents --plugin-dir` | Load plugins for agent view and dispatched sessions | ✅ | ✅ | 🔴 Block | [EXT-004](../03-test-plan/catalog/extensions.md#ext-004) | ⏳ | Both. `disableSideloadFlags` 🔒 managed-only [verify] it covers `claude agents`. |
| INV-CLI-154 | `claude agents --restricted` | Start dispatched sessions in restricted mode | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. |
| INV-CLI-155 | `claude agents --setting-sources` | Choose which setting sources load | ✅ | ✅ | 🟡 Restrict | [POL-006](../03-test-plan/catalog/policy.md#pol-006) | ⏳ | Help only. Managed settings always load and win. |
| INV-CLI-156 | `claude agents --settings` | Apply a settings file or JSON to dispatched sessions | ✅ | ✅ | 🟡 Restrict | [POL-006](../03-test-plan/catalog/policy.md#pol-006) | ⏳ | Both. Managed settings always win. |
| INV-CLI-157 | `claude agents --strict-mcp-config` | Use only `--mcp-config` servers in dispatched sessions | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. Can only narrow. |
| INV-SUB-158 | `claude attach` | Open a background session in this terminal | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Both. Partial session name needs v2.1.290+. |
| INV-SUB-159 | `claude logs` | Print a background session's recent output | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Both. Partial session name needs v2.1.290+. |
| INV-SUB-160 | `claude stop` | Stop a background session and keep its conversation | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Both. Alias `claude kill`. |
| INV-SUB-161 | `claude rm` | Delete a background session and its worktree | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Both. Works on sessions that already exited. Transcript stays local. |
| INV-CLI-162 | `claude rm --discard-unpushed` | Also discard the worktree's unpushed commits | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. v2.1.260+. Value comes from a prior refusal. |
| INV-CLI-163 | `claude rm --force-remove-worktree` | Delete a worktree directory git could not remove | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. v2.1.268+. Value comes from a prior refusal. |
| INV-SUB-164 | `claude respawn` | Restart a background session on the current binary | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Both. Keeps the conversation. |
| INV-CLI-165 | `claude respawn --all` | Restart every running background session | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Both. Useful after an image upgrade (OPS-001). |
| INV-SUB-166 | `claude daemon` | Manage the background-session supervisor | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Both, but not in the top-level `--help` list. Service install is disabled; runs on demand. A leading `--dangerously-skip-permissions` still routes here. |
| INV-SUB-167 | `claude daemon logs` | Follow the supervisor log file | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. Log at `~/.claude/daemon.log`. |
| INV-SUB-168 | `claude daemon run` | Run the supervisor in the foreground | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. Help shows an optional `[json-path]` argument. |
| INV-SUB-169 | `claude daemon status` | Show supervisor state, version, and worker count | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Both. Exits 1 when the supervisor is not running. |
| INV-SUB-170 | `claude daemon stop` | Stop the supervisor and its background sessions | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. Docs show it as `claude daemon stop --any`. |
| INV-CLI-171 | `claude daemon stop --any` | Also stop an on-demand (transient) supervisor | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. |
| INV-CLI-172 | `claude daemon stop --keep-workers` | Leave background sessions running for the next supervisor | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. |
| INV-SUB-173 | `claude daemon uninstall` | Remove the background service (launchctl or systemd) | ✅ | ❓ | ⚪ Default | — | ⏳ | Help only. Container likely has no systemd [verify]. |
| INV-CLI-174 | `claude daemon --json-path` | Use a specific supervisor config file | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Default `~/.claude/daemon.json`. |
| INV-CLI-175 | `claude daemon --log-file` | Use a specific supervisor log file | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only. Default `~/.claude/daemon.log`. |

## Subcommands: auto mode

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SUB-176 | `claude auto-mode` | Inspect or reset the auto mode classifier config | ❓ | ✅ | 🟡 Restrict | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011), [POL-016](../03-test-plan/catalog/policy.md#pol-016) | ⏳ | Both. Group also lists `help [command]`. Foundry: Sonnet 5+, Opus 4.7+, Haiku 5.5, Fable only. Use is decided by ADR; `disableAutoMode` enforces it. |
| INV-SUB-177 | `claude auto-mode config` | Print the effective auto mode config as JSON | ✅ | ✅ | 🟢 Allow | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011) | ⏳ | Both (docs name it in the `defaults` row). Read-only. |
| INV-SUB-178 | `claude auto-mode critique` | Get AI feedback on custom auto mode rules | ❓ | ✅ | ⚪ Default | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011) | ⏳ | Help only. Sends the rules to the model [verify] on Foundry. |
| INV-CLI-179 | `claude auto-mode critique --model` | Override the model used for the critique | ❓ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | Help only. Limited by managed `availableModels`. |
| INV-SUB-180 | `claude auto-mode defaults` | Print the built-in classifier rules as JSON | ✅ | ✅ | 🟢 Allow | [PERM-011](../03-test-plan/catalog/permissions.md#perm-011) | ⏳ | Both. v2.1.208+. Read-only. |
| INV-CLI-181 | `claude auto-mode defaults --label` | Show only rules whose label starts with a prefix | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. Case-insensitive. |
| INV-SUB-182 | `claude auto-mode reset` | Remove the `autoMode` section from user settings | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. v2.1.212+. Managed and `--settings` rules still apply. |
| INV-CLI-183 | `claude auto-mode reset --yes` | Skip the confirmation prompt | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. Short form `-y`. |

## Subcommands: maintenance

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SUB-184 | `claude doctor` | Print read-only install and settings diagnostics | ✅ | ✅ | 🟢 Allow | [ENV-014](../03-test-plan/catalog/env.md#env-014), [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | Both. Reads settings in the current directory without a trust prompt. |
| INV-SUB-185 | `claude install` | Install or reinstall the native binary at a version | ✅ | ✅ | 🔴 Block | [ENV-005](../03-test-plan/catalog/env.md#env-005), [OPS-001](../03-test-plan/catalog/operations.md#ops-001) | ⏳ | Both. `DISABLE_UPDATES=1` in managed `env`; version pinned in image; installer host not on egress allowlist (CTL-04). |
| INV-CLI-186 | `claude install --force` | Force installation even if already installed | ✅ | ✅ | 🔴 Block | [ENV-005](../03-test-plan/catalog/env.md#env-005) | ⏳ | Help only. Inherits `claude install` policy. |
| INV-SUB-187 | `claude update` | Check for updates and install them | ✅ | ✅ | 🔴 Block | [ENV-005](../03-test-plan/catalog/env.md#env-005), [OPS-001](../03-test-plan/catalog/operations.md#ops-001), [POL-010](../03-test-plan/catalog/policy.md#pol-010) | ⏳ | Both. Alias `upgrade` (help only). `DISABLE_UPDATES=1` in managed `env`; version pinned in image; installer host not on egress allowlist (CTL-04). `DISABLE_AUTOUPDATER` alone does not block it. |
| INV-SUB-188 | `claude purge` | Delete all local Claude Code state for a project | ✅ | ✅ | ⚪ Default | [DATA-003](../03-test-plan/catalog/data.md#data-003), [OPS-005](../03-test-plan/catalog/operations.md#ops-005) | ⏳ | Both. Removes transcripts used for incident reconstruction; OTel and egress logs remain [verify]. |
| INV-CLI-189 | `claude purge --all` | Purge state for every project | ✅ | ✅ | ⚪ Default | [OPS-005](../03-test-plan/catalog/operations.md#ops-005) | ⏳ | Both. |
| INV-CLI-190 | `claude purge --dry-run` | List what would be deleted without deleting | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. |
| INV-CLI-191 | `claude purge --interactive` | Confirm each item before deleting | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. Short form `-i`. |
| INV-CLI-192 | `claude purge --yes` | Skip the confirmation prompt | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. Short form `-y`. |

## Subcommands: cloud, remote, and review

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SUB-193 | `claude remote-control` | Serve sessions for control from claude.ai or the Claude app | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Docs only; not in the `--help` list. `remote-control --help` errors: needs claude.ai subscription auth. Server-mode flags not inventoried. |
| INV-CLI-194 | `claude remote-control --name` | Name the Remote Control session | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Docs only (example). |
| INV-SUB-195 | `claude ultrareview` | Run a cloud multi-agent code review and print findings | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Both. Ultrareview needs a Claude subscription. |
| INV-CLI-196 | `claude ultrareview --json` | Print the raw findings payload | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Both. |
| INV-CLI-197 | `claude ultrareview --no-post` | Do not post findings to the PR (the default) | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Both. v2.1.227+. |
| INV-CLI-198 | `claude ultrareview --post` | Post findings to the PR as one comment | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Both. v2.1.227+. github.com PR targets only. |
| INV-CLI-199 | `claude ultrareview --timeout` | Set maximum minutes to wait (default 45) | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Both. |
| INV-SUB-200 | `claude self-hosted-runner` | Host Claude Code cloud sessions on your own machine | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Both; not in the top-level `--help` list. v2.1.224+. Defaults to `api.anthropic.com`. Cloud sessions need a Claude subscription; not on Foundry. Options listed in the last section. |
| INV-SUB-201 | `claude self-hosted-runner setup` | Guided operator walkthrough for a runner | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Docs only. Not run (could change state). |
| INV-SUB-202 | `claude self-hosted-runner doctor` | Diagnose a deployed runner | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Docs only. Not run. |
| INV-SUB-203 | `claude self-hosted-runner orchestrator` | Spawn on-demand runners | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Docs only. Not run. |

## Subcommands: other

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-SUB-204 | `claude gateway` | Run the self-hosted Claude apps gateway server | ✅ | ✅ | 🟡 Restrict | [IDN-014](../03-test-plan/catalog/identity.md#idn-014), [OPS-011](../03-test-plan/catalog/operations.md#ops-011) | ⏳ | Both. Runs the Claude apps gateway on its Linux host, not in dev containers. Proposed target (ADR-013): Entra sign-in, spend caps, OTLP relay, Foundry upstream. |
| INV-CLI-205 | `claude gateway --config` | Path to the gateway YAML config | ✅ | ✅ | ⚪ Default | [OPS-011](../03-test-plan/catalog/operations.md#ops-011) | ⏳ | Both. Required. `gateway.yaml` is under change control (R-24). |
| INV-SUB-206 | `claude import` | Import configuration from Codex, Gemini, or Cursor | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Both. Docs: unavailable on Microsoft Foundry. v2.1.213+. |
| INV-CLI-207 | `claude import --dry-run` | Show what would be imported without writing | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Both. |
| INV-CLI-208 | `claude import --yes` | Skip the interactive picker | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Both. Headless use needs `--yes=<digest>`. |

## Print/headless and automation flags

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CLI-209 | `--print, -p` | Print the response and exit without the interactive UI | ✅ | ✅ | 🟢 Allow | [FEAT-012](../03-test-plan/catalog/features.md#feat-012) | ⏳ | Both. Skips the workspace trust dialog. Invalid settings files are silently ignored (check POL-008). Project hooks and `.mcp.json` load without `--bare` (EXT-001, EXT-005). |
| INV-CLI-210 | `--output-format` | Choose text, json, or stream-json output in print mode | ✅ | ✅ | 🟢 Allow | [FEAT-012](../03-test-plan/catalog/features.md#feat-012), [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ | Both. |
| INV-CLI-211 | `--input-format` | Choose text or stream-json input in print mode | ✅ | ✅ | 🟢 Allow | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ | Both. |
| INV-CLI-212 | `--json-schema` | Validate the final output against a JSON Schema | ✅ | ✅ | 🟢 Allow | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ | Both. Print mode only. |
| INV-CLI-213 | `--include-partial-messages` | Stream partial message chunks as they arrive | ✅ | ✅ | 🟢 Allow | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ | Both. Needs `-p` and stream-json. |
| INV-CLI-214 | `--include-hook-events` | Include hook lifecycle events in the output stream | ✅ | ✅ | 🟢 Allow | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ | Both. Needs stream-json. |
| INV-CLI-215 | `--replay-user-messages` | Echo stdin user messages back on stdout | ✅ | ✅ | 🟢 Allow | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ | Both. Needs stream-json input and output. |
| INV-CLI-216 | `--forward-subagent-text` | Emit subagent text and thinking blocks in the stream | ✅ | ✅ | 🟢 Allow | [FEAT-020](../03-test-plan/catalog/features.md#feat-020) | ⏳ | Both. v2.1.211+. Env `CLAUDE_CODE_FORWARD_SUBAGENT_TEXT` does the same. |
| INV-CLI-217 | `--prompt-suggestions` | Emit a predicted next prompt after each turn | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. Help shows boolean choices. Needs `-p`, stream-json, and `--verbose`. |
| INV-CLI-218 | `--max-budget-usd` | Stop a print run when estimated spend hits a cap | ✅ | ✅ | 🟢 Allow | [COST-005](../03-test-plan/catalog/cost.md#cost-005) | ⏳ | Both. Client-side estimate. Cap enforcement v2.1.217+. |
| INV-CLI-219 | `--max-turns` | Limit the number of agentic turns in print mode | ✅ | ✅ | 🟢 Allow | [COST-005](../03-test-plan/catalog/cost.md#cost-005) | ⏳ | Docs only. |
| INV-CLI-220 | `--no-session-persistence` | Do not save the session to disk | ✅ | ✅ | 🟢 Allow | [DATA-003](../03-test-plan/catalog/data.md#data-003) | ⏳ | Both. Print mode only. |
| INV-CLI-221 | `--permission-prompts` | Choose who answers permission prompts in print mode | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. `none` auto-denies. v2.1.259+. |
| INV-CLI-222 | `--permission-prompt-tool` | Route print-mode permission prompts to an MCP tool | ✅ | ✅ | 🟡 Restrict | [PERM-015](../03-test-plan/catalog/permissions.md#perm-015) | ⏳ | Docs only. Needs an MCP server; only managed servers load: `allowManagedMcpServersOnly` + empty managed `allowedMcpServers` 🔒 managed-only (CTL-12). |
| INV-CLI-223 | `--bare` | Minimal mode that skips auto-discovery for fast scripted runs | ✅ | ✅ | 🟡 Restrict | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006), [POL-004](../03-test-plan/catalog/policy.md#pol-004) | ⏳ | Both. Sets `CLAUDE_CODE_SIMPLE`. Relies on managed settings still applying [verify], including the audit hook and sandbox. |
| INV-CLI-224 | `--exclude-dynamic-system-prompt-sections` | Move per-machine context out of the system prompt for caching | ✅ | ✅ | 🟢 Allow | [COST-004](../03-test-plan/catalog/cost.md#cost-004) | ⏳ | Both. |
| INV-CLI-225 | `--init` | Run Setup hooks with the `init` matcher, print mode | ✅ | ✅ | ⚪ Default | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | Docs only. Only managed hooks run (`allowManagedHooksOnly`). |
| INV-CLI-226 | `--init-only` | Run Setup and SessionStart hooks, then exit | ✅ | ✅ | ⚪ Default | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | Docs only. Only managed hooks run. |
| INV-CLI-227 | `--maintenance` | Run Setup hooks with the `maintenance` matcher, print mode | ✅ | ✅ | ⚪ Default | [EXT-005](../03-test-plan/catalog/extensions.md#ext-005) | ⏳ | Docs only. Only managed hooks run. |

## Model and effort flags

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CLI-228 | `--model` | Set the session model by alias or full name | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011), [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Both. Limited by managed `availableModels`; aliases map to `ANTHROPIC_DEFAULT_*_MODEL`. |
| INV-CLI-229 | `--effort` | Set the effort level for this session | ✅ | ✅ | 🟢 Allow | [FEAT-018](../03-test-plan/catalog/features.md#feat-018) | ⏳ | Both. Docs add `ultracode` (v2.1.203+); help lists only low to max [verify]. |
| INV-CLI-230 | `--fallback-model` | Fall back to other models when the primary is unavailable | ✅ | ✅ | 🟡 Restrict | [POL-011](../03-test-plan/catalog/policy.md#pol-011) | ⏳ | Both. Must name allowed Foundry deployments (`availableModels`). |
| INV-CLI-231 | `--advisor` | Enable the server-side advisor tool with a model | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Docs only. Advisor is not available on Foundry. |
| INV-CLI-232 | `--betas` | Add beta headers to API requests | ❓ | ✅ | ⚪ Default | — | ⏳ | Both. API key users only [verify] on Foundry. |
| INV-CLI-233 | `--autocompact` | Set the auto-compact window for this session | ✅ | ✅ | 🟢 Allow | [COST-009](../03-test-plan/catalog/cost.md#cost-009) | ⏳ | Both. v2.1.221+. |

## Permissions and tools flags

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CLI-234 | `--permission-mode` | Start in a given permission mode | ✅ | ✅ | 🟡 Restrict | [PERM-001](../03-test-plan/catalog/permissions.md#perm-001), [PERM-008](../03-test-plan/catalog/permissions.md#perm-008), [PERM-010](../03-test-plan/catalog/permissions.md#perm-010), [POL-016](../03-test-plan/catalog/policy.md#pol-016) | ⏳ | Both. Help lists `manual` in place of `default`. `bypassPermissions` refused via `permissions.disableBypassPermissionsMode: "disable"`; `auto` per ADR (`disableAutoMode`). |
| INV-CLI-235 | `--dangerously-skip-permissions` | Skip all permission prompts (bypassPermissions) | ✅ | ✅ | 🔴 Block | [PERM-001](../03-test-plan/catalog/permissions.md#perm-001) | ⏳ | Both. `permissions.disableBypassPermissionsMode: "disable"`. |
| INV-CLI-236 | `--allow-dangerously-skip-permissions` | Add bypassPermissions to the Shift+Tab mode cycle | ✅ | ✅ | 🔴 Block | [PERM-001](../03-test-plan/catalog/permissions.md#perm-001) | ⏳ | Both. `permissions.disableBypassPermissionsMode: "disable"`. |
| INV-CLI-237 | `--enable-auto-mode` | Former flag that enabled auto mode | ⛔ | ⛔ | ⛔ Unavailable | — | ⏳ | Docs only. Removed in v2.1.111; use `--permission-mode auto`. |
| INV-CLI-238 | `--allowedTools, --allowed-tools` | Pre-approve tools so they run without a prompt | ✅ | ✅ | 🔴 Block | [POL-007](../03-test-plan/catalog/policy.md#pol-007) | ⏳ | Both. Ignored under `allowManagedPermissionRulesOnly` 🔒 managed-only. |
| INV-CLI-239 | `--disallowedTools, --disallowed-tools` | Deny or remove tools for this session | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. Only tightens; still applies under managed-only rules. |
| INV-CLI-240 | `--tools` | Restrict which built-in tools Claude can use | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. Does not affect MCP tools. Default set omits Glob and Grep on Linux. |
| INV-CLI-241 | `--add-dir` | Grant file access to additional directories | ✅ | ✅ | 🟡 Restrict | [PERM-013](../03-test-plan/catalog/permissions.md#perm-013) | ⏳ | Both. Sandbox and managed deny rules still apply; container mounts only the workspace (ENV-012). |
| INV-CLI-242 | `--restricted` | Remove command tools and load only managed settings | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. v2.1.248+. Refuses bypass and cloud sessions. |
| INV-CLI-243 | `--disable-slash-commands` | Disable all skills and commands for this session | ✅ | ✅ | 🟢 Allow | [FEAT-009](../03-test-plan/catalog/features.md#feat-009) | ⏳ | Both. Help says "Disable all skills". |

## System prompt and context flags

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CLI-244 | `--system-prompt` | Replace the entire default system prompt | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. Drops default safety guidance; permissions and sandbox still apply. `__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__` splits the cached part (v2.1.275+). |
| INV-CLI-245 | `--system-prompt-file` | Replace the system prompt with a file's contents | ✅ | ✅ | ⚪ Default | — | ⏳ | Docs only. |
| INV-CLI-246 | `--append-system-prompt` | Append text to the default system prompt | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. |
| INV-CLI-247 | `--append-system-prompt-file` | Append a file's contents to the default system prompt | ✅ | ✅ | 🟢 Allow | — | ⏳ | Docs only. Can combine with `--append-system-prompt` (v2.1.283+). |
| INV-CLI-248 | `--append-subagent-system-prompt` | Append text to every subagent's system prompt | ✅ | ✅ | 🟢 Allow | — | ⏳ | Docs only. Print mode only. v2.1.205+. |
| INV-CLI-249 | `--append-subagent-system-prompt-file` | Append a file's text to subagent system prompts | ✅ | ✅ | 🟢 Allow | — | ⏳ | Docs only. Print mode only. v2.1.261+. |
| INV-CLI-250 | `--system-prompt-snapshot` | Record the system prompt once, or rebuild it each request | ✅ | ✅ | ⚪ Default | — | ⏳ | Both. v2.1.257+. Before v2.1.268 it had no effect on Foundry. |
| INV-CLI-251 | `--agent` | Run the session as a named agent | ✅ | ✅ | 🟡 Restrict | [EXT-009](../03-test-plan/catalog/extensions.md#ext-009), [FEAT-008](../03-test-plan/catalog/features.md#feat-008) | ⏳ | Both. Overrides the `agent` setting. Project and managed agents only, per the agents policy (EXT-009). |
| INV-CLI-252 | `--agents` | Define custom subagents inline as JSON | ✅ | ✅ | 🔴 Block | [EXT-004](../03-test-plan/catalog/extensions.md#ext-004) | ⏳ | Both. `disableSideloadFlags` 🔒 managed-only. File form needs v2.1.281+. |
| INV-CLI-253 | `--safe-mode` | Start with all customizations disabled for troubleshooting | ✅ | ✅ | 🟢 Allow | [EXT-006](../03-test-plan/catalog/extensions.md#ext-006) | ⏳ | Both. Sets `CLAUDE_CODE_SAFE_MODE`. Managed policy and policy hooks still apply [verify]. |

## Config, MCP, and plugin flags

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CLI-254 | `--settings` | Load extra settings from a file or JSON string | ✅ | ✅ | 🟡 Restrict | [POL-006](../03-test-plan/catalog/policy.md#pol-006) | ⏳ | Both. Managed settings always win. Its permission rules are ignored under `allowManagedPermissionRulesOnly`. Max 2 MiB. |
| INV-CLI-255 | `--setting-sources` | Choose which setting sources load: user, project, local | ✅ | ✅ | 🟡 Restrict | [POL-006](../03-test-plan/catalog/policy.md#pol-006) | ⏳ | Both. Managed settings always load and win. |
| INV-CLI-256 | `--mcp-config` | Load MCP servers from JSON files or strings | ✅ | ✅ | 🔴 Block | [EXT-004](../03-test-plan/catalog/extensions.md#ext-004) | ⏳ | Both. `disableSideloadFlags` 🔒 managed-only. Only in-process `sdk` entries still pass. |
| INV-CLI-257 | `--strict-mcp-config` | Use only `--mcp-config` servers, ignoring other MCP config | ✅ | ✅ | 🟢 Allow | — | ⏳ | Both. Can only narrow [verify] with managed MCP config. |
| INV-CLI-258 | `--plugin-dir` | Load a plugin from a folder or zip for one session | ✅ | ✅ | 🔴 Block | [EXT-004](../03-test-plan/catalog/extensions.md#ext-004) | ⏳ | Both. `disableSideloadFlags` 🔒 managed-only; also rejects `CLAUDE_CODE_PLUGIN_DIRS` (v2.1.280+). |
| INV-CLI-259 | `--plugin-url` | Fetch a plugin zip from a URL for one session | ✅ | ✅ | 🔴 Block | [EXT-004](../03-test-plan/catalog/extensions.md#ext-004) | ⏳ | Both. `disableSideloadFlags` 🔒 managed-only. |
| INV-CLI-260 | `--channels` | Listen for channel notifications from MCP servers | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Docs only. Research preview. Channels are not available on Foundry; `channelsEnabled` 🔒 managed-only. |
| INV-CLI-261 | `--dangerously-load-development-channels` | Enable channels not on the approved allowlist | ⛔ | ✅ | ⛔ Unavailable | — | ⏳ | Docs only. Ignored with `-p`. Channels are not available on Foundry. |

## Session flags

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CLI-262 | `--continue, -c` | Load the most recent conversation in this directory | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | Both. Finished background sessions need v2.1.257+. |
| INV-CLI-263 | `--resume, -r` | Resume a session by ID, name, or picker | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | Both. Running background session opens via attach (v2.1.285+). |
| INV-CLI-264 | `--fork-session` | Create a new session ID when resuming | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | Both. |
| INV-CLI-265 | `--session-id` | Use a specific UUID as the session ID | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | Both. |
| INV-CLI-266 | `--name, -n` | Set a display name for the session | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017) | ⏳ | Both. |
| INV-CLI-267 | `--from-pr` | Find sessions linked to a pull request | ✅ | ✅ | 🟢 Allow | [FEAT-017](../03-test-plan/catalog/features.md#feat-017), [FEAT-015](../03-test-plan/catalog/features.md#feat-015) | ⏳ | Both. Accepts a PR number or GitHub PR URL. |

## Background, worktree, and cloud flags

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CLI-268 | `--bg, --background` | Start the session as a background agent and return | ✅ | ✅ | 🟢 Allow | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Both. Cannot combine with `-p`. Checks workspace trust. |
| INV-CLI-269 | `--exec` | Run a shell command as a background PTY job | ✅ | ✅ | ⚪ Default | [FEAT-011](../03-test-plan/catalog/features.md#feat-011) | ⏳ | Docs only. Use with `--bg`. Runs as the user, not via the Bash tool; sandbox coverage [verify]. |
| INV-CLI-270 | `--worktree, -w` | Start in an isolated git worktree | ✅ | ✅ | 🟢 Allow | [FEAT-010](../03-test-plan/catalog/features.md#feat-010) | ⏳ | Both. Can branch from a GitHub PR. |
| INV-CLI-271 | `--tmux` | Create a tmux session for the worktree | ✅ | ❓ | ⚪ Default | [FEAT-010](../03-test-plan/catalog/features.md#feat-010) | ⏳ | Both. Needs `--worktree` and tmux in the image [verify]. |
| INV-CLI-272 | `--teammate-mode` | Choose how agent-team teammates display | ✅ | ✅ | ⚪ Default | [FEAT-022](../03-test-plan/catalog/features.md#feat-022) | ⏳ | Docs only. `iterm2` does not apply in the container. |
| INV-CLI-273 | `--cloud` | Create or message a cloud session | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Both. Cloud sessions need a Claude subscription; not on Foundry. |
| INV-CLI-274 | `--remote` | Deprecated alias for `--cloud` | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Docs only. Deprecated. |
| INV-CLI-275 | `--teleport` | Resume a cloud session in the local terminal | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Both. Cloud sessions need a Claude subscription; not on Foundry. |
| INV-CLI-276 | `--environment` | Create a cloud session on a self-hosted environment | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Both. v2.1.224+. |
| INV-CLI-277 | `--ref` | Base an `--environment` session on a named ref | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Docs only. |
| INV-CLI-278 | `--remote-control, --rc` | Start a session also controllable from claude.ai | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Both; `--rc` is docs only. Remote Control needs a Claude subscription. |
| INV-CLI-279 | `--remote-control-session-name-prefix` | Prefix for auto-generated Remote Control session names | ⛔ | ✅ | ⛔ Unavailable | [SURF-008](../03-test-plan/catalog/surfaces.md#surf-008) | ⏳ | Both. |
| INV-CLI-280 | `--file` | Download file resources by ID at startup | ❓ | ✅ | ⛔ Unavailable | — | ⏳ | Help only; undocumented. `file_id:path` format, likely cloud-session files [verify]. |

## Surface and UI flags

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CLI-281 | `--chrome` | Enable Claude in Chrome browser integration | ⛔ | ⛔ | ⛔ Unavailable | [SURF-010](../03-test-plan/catalog/surfaces.md#surf-010) | ⏳ | Both. Chrome extension needs a Claude subscription; no browser in the container. |
| INV-CLI-282 | `--no-chrome` | Disable Chrome integration for this session | ✅ | ✅ | 🟢 Allow | [SURF-010](../03-test-plan/catalog/surfaces.md#surf-010) | ⏳ | Both. |
| INV-CLI-283 | `--desktop` | Open the session in the Claude Desktop app | ⛔ | ⛔ | ⛔ Unavailable | [SURF-007](../03-test-plan/catalog/surfaces.md#surf-007) | ⏳ | Both. macOS and x64 Windows with a Claude subscription. v2.1.285+. |
| INV-CLI-284 | `--ide` | Auto-connect to the IDE when exactly one is available | ✅ | ✅ | 🟢 Allow | [SURF-002](../03-test-plan/catalog/surfaces.md#surf-002) | ⏳ | Both. |
| INV-CLI-285 | `--ax-screen-reader` | Render flat, screen-reader friendly output | ✅ | ✅ | 🟢 Allow | [FEAT-024](../03-test-plan/catalog/features.md#feat-024) | ⏳ | Both. v2.1.181+. |
| INV-CLI-286 | `--brief` | Enable the SendUserMessage tool for agent-to-user messages | ✅ | ✅ | ⚪ Default | — | ⏳ | Help only; undocumented [verify]. |

## Debug and info flags

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CLI-287 | `--debug, -d` | Enable debug mode with optional category filter | ✅ | ✅ | 🟢 Allow | [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | Both; `-d` is help only. Filter binds only in `=` form. Logs stay local. |
| INV-CLI-288 | `--debug-file` | Write debug logs to a given file | ✅ | ✅ | 🟢 Allow | [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | Both. Implies `--debug`. |
| INV-CLI-289 | `--verbose` | Show full turn-by-turn output | ✅ | ✅ | 🟢 Allow | [FEAT-025](../03-test-plan/catalog/features.md#feat-025) | ⏳ | Both. |
| INV-CLI-290 | `--version, -v` | Print the version number | ✅ | ✅ | 🟢 Allow | [ENV-005](../03-test-plan/catalog/env.md#env-005) | ⏳ | Both. |
| INV-CLI-291 | `--help, -h` | Show help for the command | ✅ | ✅ | 🟢 Allow | — | ⏳ | Help only. Every subcommand also accepts `-h`/`--help`. |

## Subcommand options: self-hosted-runner

| ID | Item | Purpose | Foundry | Container | Policy | Covered by | Result | Notes |
|---|---|---|---|---|---|---|---|---|
| INV-CLI-292 | `claude self-hosted-runner --api-url` | Set the API base URL | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-293 | `claude self-hosted-runner --environment-secret-file` | Path to the environment secret file | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. Deprecated alias `--pool-secret-file`. |
| INV-CLI-294 | `claude self-hosted-runner --lock-to-account` | Lock the runner to one account | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-295 | `claude self-hosted-runner --client-label` | Observability label sent at registration | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-296 | `claude self-hosted-runner --proxy-authorization-command` | Command that produces a Proxy-Authorization header | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-297 | `claude self-hosted-runner --proxy-authorization-file` | File that holds the Proxy-Authorization header | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-298 | `claude self-hosted-runner --capacity` | Maximum concurrent sessions | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-299 | `claude self-hosted-runner --base-dir` | Base directory for repo checkouts | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-300 | `claude self-hosted-runner --exec-path` | Binary to spawn for child sessions | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-301 | `claude self-hosted-runner --hooks-dir` | Directory of runner lifecycle hook scripts | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-302 | `claude self-hosted-runner --session-stop-grace-sec` | Wait time for a clean session exit | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-303 | `claude self-hosted-runner --post-session-hook-timeout-sec` | Time budget for the post-session hook | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-304 | `claude self-hosted-runner --drain-wait-sec` | Wait for in-flight turns before SIGTERM | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. Deprecated alias `--drain-wait-bg-tasks-sec`. |
| INV-CLI-305 | `claude self-hosted-runner --drain-marker-file` | Marker file that signals a host drain | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-306 | `claude self-hosted-runner --git-ssh-rewrite` | Rewrite HTTPS git URLs to SSH for a host | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-307 | `claude self-hosted-runner --git-host-rewrite` | Rewrite one git host name to another | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-308 | `claude self-hosted-runner --use-anthropic-git-proxy` | Use Anthropic-managed git authentication | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. Replaces home-level git config. |
| INV-CLI-309 | `claude self-hosted-runner --configure-git` | Set git identity and Anthropic commit signing | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-310 | `claude self-hosted-runner --push-outcome-on-release` | Push outcome branches when a session is released | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-311 | `claude self-hosted-runner --trust-workspace` | Seed workspace trust for session repos | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-312 | `claude self-hosted-runner --remove-session-state` | Delete per-session state when a session ends | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-313 | `claude self-hosted-runner --confine-repo-settings` | Guard mode for repo-committed settings | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-314 | `claude self-hosted-runner --server-auto-mode-lists` | Which server auto mode lists sessions receive | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-315 | `SELF_HOSTED_RUNNER_HOST_CONFIG_DIR` | Directory seeded into each session's config directory | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. Help prints only the env var, no flag name. |
| INV-CLI-316 | `claude self-hosted-runner --host-config-snapshot` | Hold the host config snapshot on disk or in memory | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-317 | `claude self-hosted-runner --health-port` | Port for the `/healthz` listener | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-318 | `claude self-hosted-runner --log-level` | Runner log level: info or debug | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-319 | `claude self-hosted-runner --log-file` | Tee runner logs to a file | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-320 | `claude self-hosted-runner --exit-if-unused-min` | Exit if never assigned work for N minutes | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-321 | `claude self-hosted-runner --drain-grace-sec` | Keep polling for work after sessions finish | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-322 | `claude self-hosted-runner --retire-at` | Retire the runner at a fixed time | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-323 | `claude self-hosted-runner --defer-shutdown-max-min` | Defer shutdown on the first signal | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-324 | `claude self-hosted-runner --release-idle-session-min` | Release a session slot after user idle time | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-325 | `claude self-hosted-runner --startup-timeout-min` | Release a session that never finishes starting | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-326 | `claude self-hosted-runner --kill-session-after-min` | Cap a session's wall-clock lifetime | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. |
| INV-CLI-327 | `claude self-hosted-runner --debug-token-dir` | Write live tokens to disk for debugging | ⛔ | ✅ | ⛔ Unavailable | [SURF-011](../03-test-plan/catalog/surfaces.md#surf-011) | ⏳ | Help only. Runner hosts cloud sessions, which need a Claude subscription. Debug only; writes secrets to disk. |

## Coverage summary

327 rows: 73 `SUB` (subcommands and invocation forms) and 254 `CLI` (flags and subcommand options).

| Policy | Count |
|---|---|
| 🟢 Allow | 83 |
| 🟡 Restrict | 20 |
| 🔴 Block | 96 |
| ⚪ Default | 60 |
| ⛔ Unavailable | 68 |
| **Total** | **327** |

| Result | Count |
|---|---|
| ⏳ Not run | 327 |
| 🟩 Pass | 0 |
| 🟨 Issue | 0 |
| 🟥 Blocker | 0 |
| ⏭ N/A | 0 |

## Related

- [Feature inventory index](README.md): the other inventory pages (settings, environment variables, slash commands, tools, surfaces).
- Catalog tests: [permissions](../03-test-plan/catalog/permissions.md), [policy](../03-test-plan/catalog/policy.md), [extensions](../03-test-plan/catalog/extensions.md), [features](../03-test-plan/catalog/features.md), [surfaces](../03-test-plan/catalog/surfaces.md).
- Official docs: [CLI reference](https://code.claude.com/docs/en/cli-reference) · [Plugin CLI reference](https://code.claude.com/docs/en/plugins/cli-reference) · [MCP](https://code.claude.com/docs/en/mcp) · [Agent view](https://code.claude.com/docs/en/agent-view) · [Headless mode](https://code.claude.com/docs/en/headless) · [Feature availability](https://code.claude.com/docs/en/feature-availability) · [Settings reference](https://code.claude.com/docs/en/settings-reference)
