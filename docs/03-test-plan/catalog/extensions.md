---
title: "Catalog: EXT, extensions"
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-15
version: 0.1
phase: 1
---

# EXT: Extensions

[🏠 Home](../../../README.md) › [Test strategy](../test-strategy.md) › EXT

These tests prove that MCP servers, plugins, hooks, skills, and other customization surfaces are locked down as specified, and that the managed audit hook works. Reference: [extension-controls.md](../../02-security-baseline/extension-controls.md).

## Summary

| ID | Test | Pri | Controls | Result |
|---|---|---|---|---|
| [EXT-001](#ext-001) | Project `.mcp.json` servers don't load | P0 | CTL-12 | ⏳ |
| [EXT-002](#ext-002) | User-added MCP servers don't load | P0 | CTL-12 | ⏳ |
| [EXT-003](#ext-003) | Plugin and marketplace installs blocked | P0 | CTL-13 | ⏳ |
| [EXT-004](#ext-004) | Sideload flags rejected | P0 | CTL-13 | ⏳ |
| [EXT-005](#ext-005) | Unmanaged hooks don't run | P0 | CTL-14 | ⏳ |
| [EXT-006](#ext-006) | Managed audit hook fires and logs | P1 | CTL-14 | ⏳ |
| [EXT-007](#ext-007) | Project statusLine doesn't run | P1 | CTL-15 | ⏳ |
| [EXT-008](#ext-008) | Project skills policy enforced | P1 | CTL-15 | ⏳ |
| [EXT-009](#ext-009) | Project subagents policy enforced | P1 | CTL-15 | ⏳ |
| [EXT-010](#ext-010) | `disableSkillShellExecution` works | P1 | CTL-15 | ⏳ |
| [EXT-011](#ext-011) | claude.ai connectors disabled | P1 | CTL-12, CTL-19 | ⏳ |
| [EXT-012](#ext-012) | Approved MCP server works under the allowlist (if any) | P2 | CTL-12 | ⏳ |
| [EXT-013](#ext-013) | Output styles | P2 | CTL-15 | ⏳ |
| [EXT-014](#ext-014) | Mods restricted | P1 | CTL-13 | ⏳ |
| [EXT-015](#ext-015) | Helper commands from user settings not honored | P1 | CTL-15 | ⏳ |

---

<a id="ext-001"></a>
### EXT-001 · Project `.mcp.json` servers do not load

**Priority** P0 · **Controls** CTL-12 · **Risks** R-20, R-09 · **Docs** [managed MCP](https://code.claude.com/docs/en/managed-mcp)

**Steps.** Commit the `.mcp.json` fixture (a stdio server that writes a marker file when it starts). Open a session, accept the trust dialog, and run `/mcp`.

**Expected.** The server isn't listed as connected. The marker file isn't created. No `mcp_server_connection` OTel event.

**Result.** ⏳ · `evidence/EXT-001/`

<a id="ext-002"></a>
### EXT-002 · User-added MCP servers (`claude mcp add`) do not load

**Priority** P0 · **Controls** CTL-12

**Steps.** `claude mcp add marker -- /usr/bin/touch /tmp/mcp-marker`, `claude mcp add-json …`, and `claude mcp list`. Start a session and run `/mcp`.

**Expected.** The command fails, or the server is ignored. No marker file.

**Result.** ⏳ · `evidence/EXT-002/`

<a id="ext-003"></a>
### EXT-003 · Plugin and marketplace installs are blocked

**Priority** P0 · **Controls** CTL-13 · **Docs** [plugins for orgs](https://code.claude.com/docs/en/plugins/org)

**Steps.** `/plugin`, then browse and install. `claude plugin marketplace add <github-repo>`. `claude plugin install <name>`. Add `extraKnownMarketplaces` to project settings.

**Expected.** All blocked (empty `strictKnownMarketplaces`). Network attempts also fail at the firewall. Record any auto-install attempt of the official marketplace. If there is one, add `CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL=1`.

**Result.** ⏳ · `evidence/EXT-003/`

<a id="ext-004"></a>
### EXT-004 · Sideload flags are rejected

**Priority** P0 · **Controls** CTL-13

**Steps.** `claude --plugin-dir ./p`, `claude --mcp-config ./m.json`, `claude --agents '{…}'`, `claude --plugin-url …`. Also try the same flags through `claude agents …` [verify whether `disableSideloadFlags` covers it].

**Expected.** Each is rejected with a clear message.

**Result.** ⏳ · `evidence/EXT-004/`

<a id="ext-005"></a>
### EXT-005 · Unmanaged hooks do not run

**Priority** P0 · **Controls** CTL-14 · **Docs** [hooks](https://code.claude.com/docs/en/hooks)

**Steps.**
1. Project `.claude/settings.json` with `SessionStart`, `PreToolUse`, and `UserPromptSubmit` hooks that write marker files.
2. User `~/.claude/settings.json` with the same.
3. A project **skill** whose frontmatter defines a hook. The docs don't clearly list skill-frontmatter hooks among what `allowManagedHooksOnly` blocks [verify].
4. A project **subagent** definition with `hooks` in its frontmatter.
5. Run `/hooks` and a session that triggers each event.

**Expected.** No marker files from 1–4. `/hooks` lists managed hooks only. If skill or agent frontmatter hooks **do** run, that's a High finding, mitigated by `strictPluginOnlyCustomization` or by blocking project skills.

**Result.** ⏳ · `evidence/EXT-005/`

<a id="ext-006"></a>
### EXT-006 · Managed audit hook fires and logs

**Priority** P1 · **Controls** CTL-14

**Steps.** Run a session with reads, edits, a denied action, and a config change. Inspect the audit JSONL. Check the [record contract](../../02-security-baseline/extension-controls.md#hooks).

**Expected.** One record per event. Fields complete. No content. The log reaches the SIEM.

**Result.** ⏳ · `evidence/EXT-006/`

<a id="ext-007"></a>
### EXT-007 · Project statusLine does not run

**Priority** P1 · **Controls** CTL-15

**Steps.** Project and user `statusLine` commands that write a marker file.

**Expected.** No marker. The statusLine is managed-only under `allowManagedHooksOnly`.

**Result.** ⏳ · `evidence/EXT-007/`

<a id="ext-008"></a>
### EXT-008 · Project skills policy is enforced

**Priority** P1 · **Controls** CTL-15

**Steps.** Add `.claude/skills/canary/SKILL.md`. Invoke it with `/canary` and by description match. Check `/skills`.

**Expected.** Policy is "allow". The skill loads and its instructions go through normal permissions. Record the behavior for the report.

**Result.** ⏳ · `evidence/EXT-008/`

<a id="ext-009"></a>
### EXT-009 · Project subagents policy is enforced

**Priority** P1 · **Controls** CTL-15

**Steps.** Add `.claude/agents/reviewer.md` with restricted `tools`, plus a malicious one that asks for `permissionMode: bypassPermissions`. Use `/agents` and invoke both.

**Expected.** The normal agent works with its restricted tools. The bypass request is ignored (the managed bypass disable wins).

**Result.** ⏳ · `evidence/EXT-009/`

<a id="ext-010"></a>
### EXT-010 · `disableSkillShellExecution` blocks inline shell in skills

**Priority** P1 · **Controls** CTL-15

**Steps.** A skill with an inline shell block that writes a marker. Invoke it.

**Expected.** No inline execution. No marker.

**Result.** ⏳ · `evidence/EXT-010/`

<a id="ext-011"></a>
### EXT-011 · claude.ai connectors are disabled

**Priority** P1 · **Controls** CTL-12, CTL-19

**Steps.** `/mcp` (look for claude.ai connectors). Check egress for `mcp-proxy.anthropic.com`.

**Expected.** None listed. No traffic. (They need a claude.ai login anyway.)

**Result.** ⏳ · `evidence/EXT-011/`

<a id="ext-012"></a>
### EXT-012 · An approved MCP server works under the allowlist (if any)

**Priority** P2 · **Controls** CTL-12

**Steps.** Only if Phase 2 approves a server: add it via `managedMcpServers`, then test its connection, tool permissions ([PERM-015](permissions.md#perm-015)), and OTel attribution. Note that ToolSearch (deferred tool loading) isn't supported on Azure-hosted Foundry deployments [verify], so check how much context its tool definitions consume.

**Expected.** Works as configured, or ⏭ N/A.

**Result.** ⏳ · `evidence/EXT-012/`

<a id="ext-013"></a>
### EXT-013 · Output styles

**Priority** P2 · **Controls** CTL-15

**Steps.** `/output-style`, switch between built-in styles, and add a project output style.

**Expected.** Works. No code execution involved.

**Result.** ⏳ · `evidence/EXT-013/`

<a id="ext-014"></a>
### EXT-014 · Mods are restricted (`allowManagedModsOnly`)

**Priority** P1 · **Controls** CTL-13

**Steps.** Confirm the key location. The settings inventory places `allowManagedModsOnly` under `pluginConfigs`, and mods are also restricted by `allowManagedHooksOnly` [verify]. Try to load a mod from user or project config.

**Expected.** Not loaded.

**Result.** ⏳ · `evidence/EXT-014/`

<a id="ext-015"></a>
### EXT-015 · `apiKeyHelper` / `otelHeadersHelper` from user settings are not honored

**Priority** P1 · **Controls** CTL-15

**Steps.** Add `apiKeyHelper` and `otelHeadersHelper` to user and project settings, each pointing to a script that writes a marker.

**Expected.** Neither runs. Helpers are only taken from the highest-ranked source (managed) [verify].

**Result.** ⏳ · `evidence/EXT-015/`
