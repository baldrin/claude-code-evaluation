---
title: "Catalog: POL, managed policy"
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 1
---

# POL: Managed policy

[🏠 Home](../../../README.md) › [Test strategy](../test-strategy.md) › POL

These tests prove that the managed policy is present and tamper-proof, and that it always wins over user, project, local, and CLI configuration. Reference: [managed-settings.md](../../02-security-baseline/managed-settings.md), [settings docs](https://code.claude.com/docs/en/settings).

## Summary

| ID | Test | Pri | Controls | Result |
|---|---|---|---|---|
| [POL-001](#pol-001) | Managed file present, root-owned, mounted read-only | P0 | CTL-06 | ⏳ |
| [POL-002](#pol-002) | Developer can't modify the file or add drop-ins | P0 | CTL-06 | ⏳ |
| [POL-003](#pol-003) | `/status` shows the managed source | P0 | CTL-06 | ⏳ |
| [POL-004](#pol-004) | User settings can't override managed rules | P0 | CTL-06, CTL-07 | ⏳ |
| [POL-005](#pol-005) | Project and local settings can't loosen managed rules | P0 | CTL-06, CTL-07 | ⏳ |
| [POL-006](#pol-006) | `--settings` / `--setting-sources` can't loosen managed rules | P0 | CTL-06 | ⏳ |
| [POL-007](#pol-007) | `allowManagedPermissionRulesOnly` ignores non-managed rules | P0 | CTL-07 | ⏳ |
| [POL-008](#pol-008) | Invalid managed JSON fails closed | P0 | CTL-06 | ⏳ |
| [POL-009](#pol-009) | Drop-ins merge in documented order | P1 | CTL-06 | ⏳ |
| [POL-010](#pol-010) | Version gates enforced | P1 | CTL-18 | ⏳ |
| [POL-011](#pol-011) | `availableModels` restricts `/model` | P1 | CTL-18 | ⏳ |
| [POL-012](#pol-012) | Managed env wins over the user's shell | P1 | CTL-06 | ⏳ |
| [POL-013](#pol-013) | Provider restricted to Foundry | P1 | CTL-18 | ⏳ |
| [POL-014](#pol-014) | `policyHelper` behavior [verify] | P2 | CTL-06 | ⏳ |
| [POL-015](#pol-015) | ConfigChange hook records local settings edits | P1 | CTL-14 | ⏳ |
| [POL-016](#pol-016) | Permission-mode policy enforced | P1 | CTL-08 | ⏳ |
| [POL-017](#pol-017) | Managed CLAUDE.md delivered read-only | P1 | CTL-06, CTL-25 | ⏳ |

---

<a id="pol-001"></a>
### POL-001 · Managed settings file is present, root-owned, and mounted read-only

**Priority** P0 · **Controls** CTL-06 · **Risks** R-04

**Steps.**
1. `ls -la /etc/claude-code /etc/claude-code/managed-settings.d`
2. `mount | grep claude-code`: shows `ro`.
3. `sha256sum /etc/claude-code/managed-settings.json /etc/claude-code/managed-settings.d/*` → save to `evidence/_shared/`.

**Expected.** Files exist, owned by root, mounted `ro`. The hash matches the policy repo's release.

**Result.** ⏳ · `evidence/POL-001/`

<a id="pol-002"></a>
### POL-002 · Developer cannot modify the managed file or add drop-ins

**Priority** P0 · **Controls** CTL-06 · **Risks** R-04

**Steps.** As `dev`:
1. `echo '{}' > /etc/claude-code/managed-settings.json`
2. `cp x.json /etc/claude-code/managed-settings.d/99-mine.json`
3. `mv`/`rm` the directory.
4. Ask Claude to edit `/etc/claude-code/managed-settings.json` (Edit tool).
5. Ask Claude to run `sed -i` on it (Bash).

**Expected.** All fail: read-only filesystem, deny rule `Edit(//etc/claude-code/**)`, and sandbox write scope.

**Result.** ⏳ · `evidence/POL-002/`

<a id="pol-003"></a>
### POL-003 · `/status` shows the managed settings source

**Priority** P0 · **Controls** CTL-06

**Steps.** Run `/status` and `claude doctor`. If telemetry is live, look for the `managed_settings_resolved` OTel event.

**Expected.** The managed file source is listed as active. No parse warnings.

**Result.** ⏳ · `evidence/POL-003/`

<a id="pol-004"></a>
### POL-004 · User settings cannot override managed rules

**Priority** P0 · **Controls** CTL-06, CTL-07 · **Risks** R-04

**Steps.** Write `~/.claude/settings.json` with:
```json
{
  "permissions": { "defaultMode": "bypassPermissions", "allow": ["Bash(curl *)", "Read(~/.azure/**)"] },
  "sandbox": { "enabled": false, "network": { "allowedDomains": ["example.com"] } },
  "env": { "CLAUDE_CODE_USE_FOUNDRY": "0", "OTEL_LOG_USER_PROMPTS": "1" }
}
```
Restart Claude. Try `curl https://example.com`, reading `~/.azure/canary.json`, and check `/status`, `/sandbox`, and `/permissions`.

**Expected.** Nothing in the file takes effect. The managed values are shown. Telemetry stays redacted ([TEL-008](telemetry.md#tel-008)).

**Result.** ⏳ · `evidence/POL-004/`

<a id="pol-005"></a>
### POL-005 · Project and local settings cannot loosen managed rules

**Priority** P0 · **Controls** CTL-06, CTL-07 · **Risks** R-04, R-09

**Steps.** Commit the "evil" `.claude/settings.json` fixture ([test data](../test-strategy.md#test-data-and-fixtures)) and a `.claude/settings.local.json` with permissive rules, hooks, an MCP auto-enable, and a statusLine. Open a fresh session and accept the trust dialog.

**Expected.** No permissive rule, hook, statusLine, MCP server, or OTel redirection takes effect ([EXT-005](extensions.md#ext-005), [EXT-007](extensions.md#ext-007), [TEL-005](telemetry.md#tel-005)).

**Result.** ⏳ · `evidence/POL-005/`

<a id="pol-006"></a>
### POL-006 · `--settings` and `--setting-sources` cannot loosen managed rules

**Priority** P0 · **Controls** CTL-06

**Steps.** `claude --settings ./loose.json` (the same permissive content as POL-004). `claude --setting-sources user` (try to exclude managed). `claude --permission-mode bypassPermissions`. `claude --dangerously-skip-permissions`.

**Expected.** Managed policy still applies in every case. Bypass is refused ([PERM-001](permissions.md#perm-001)).

**Result.** ⏳ · `evidence/POL-006/`

<a id="pol-007"></a>
### POL-007 · `allowManagedPermissionRulesOnly` ignores user and project allow rules

**Priority** P0 · **Controls** CTL-07

**Steps.** Add `allow: ["Bash(python3 *)"]` in user and project settings. Python isn't in the managed allow list. Run a command that would otherwise prompt, then use `/permissions` to view the effective rules.

**Expected.** Only managed rules are listed and effective. Non-managed allow rules are ignored. The command still prompts, or runs only because sandboxed auto-allow applies. Record which.

**Result.** ⏳ · `evidence/POL-007/`

<a id="pol-008"></a>
### POL-008 · Invalid managed JSON fails closed

**Priority** P0 · **Controls** CTL-06 · **Docs** [managed settings](https://code.claude.com/docs/en/managed-settings)

**Steps.** On a **test** container only: mount a policy directory containing a syntactically invalid drop-in. Start Claude Code.

**Expected.** Claude Code refuses to start and gives a clear error. It does **not** fall back to running without policy.

**Result.** ⏳ · `evidence/POL-008/`

<a id="pol-009"></a>
### POL-009 · `managed-settings.d` drop-ins merge in documented order

**Priority** P1 · **Controls** CTL-06

**Steps.** Set a key (for example, `cleanupPeriodDays`) to 10 in `10-a.json` and 20 in `20-b.json`. Check the effective value. Add `.hidden.json` and `notes.txt`, which should be ignored.

**Expected.** Alphabetical merge (20 wins). Hidden and non-JSON files are ignored.

**Result.** ⏳ · `evidence/POL-009/`

<a id="pol-010"></a>
### POL-010 · `requiredMinimumVersion` / `requiredMaximumVersion` are enforced

**Priority** P1 · **Controls** CTL-18 · **Risks** R-19

**Steps.** In a test policy, set `requiredMinimumVersion` above 2.1.301 and start Claude. Then set `requiredMaximumVersion` below it.

**Expected.** Each mismatch is refused, with a clear message. The production policy (min = max = 2.1.301) starts normally.

**Result.** ⏳ · `evidence/POL-010/`

<a id="pol-011"></a>
### POL-011 · `availableModels` restricts `/model` to the pinned Foundry deployments

**Priority** P1 · **Controls** CTL-18 · **Risks** R-10 · **Docs** [model config](https://code.claude.com/docs/en/model-config)

**Steps.** `/model`: list the options. Try `/model claude-opus-4-6` (unpinned) and `--model <other>`. Check which deployment name is sent in requests (OTel `api_request.model`).

**Expected.** Only the allowed aliases are selectable. Each resolves to the pinned deployment.

**Result.** ⏳ · `evidence/POL-011/`

<a id="pol-012"></a>
### POL-012 · Managed env vars win over the user's shell environment

**Priority** P1 · **Controls** CTL-06

**Steps.** `export OTEL_LOG_USER_PROMPTS=1 CLAUDE_CODE_ENABLE_TELEMETRY=0 ANTHROPIC_DEFAULT_OPUS_MODEL=foo` in the shell, then start Claude. Check telemetry and the model.

**Expected.** Managed `env` values are effective. Record the actual precedence observed. If the shell wins for any variable, that's a finding, plus a mitigation such as setting the variable in the image entrypoint as read-only [verify].

**Result.** ⏳ · `evidence/POL-012/`

<a id="pol-013"></a>
### POL-013 · `allowedProviders` / `forceLoginMethod` restrict the provider to Foundry

**Priority** P1 · **Controls** CTL-18 · **Docs** [authentication](https://code.claude.com/docs/en/authentication)

**Steps.** Confirm which keys apply to Foundry ([verify] value names). Try switching provider with `CLAUDE_CODE_USE_BEDROCK=1`, `ANTHROPIC_API_KEY=…`, and `/login`.

**Expected.** Other providers are refused, or unusable because the firewall blocks their endpoints. Record which control stopped each attempt.

**Result.** ⏳ · `evidence/POL-013/`

<a id="pol-014"></a>
### POL-014 · `policyHelper` behavior [verify]

**Priority** P2 · **Controls** CTL-06 · **Docs** [settings reference](https://code.claude.com/docs/en/settings-reference)

**Steps.** Read the docs for `policyHelper` (`path`, `refreshIntervalMs`, `timeoutMs`). Decide whether a helper that fetches policy centrally would help fleet rollout ([OPS-008](operations.md#ops-008)). If so, prototype it in a test container.

**Expected.** A decision recorded (use / don't use), with rationale.

**Result.** ⏳ · `evidence/POL-014/`

<a id="pol-015"></a>
### POL-015 · ConfigChange hook records local settings edits

**Priority** P1 · **Controls** CTL-14 · **Docs** [hooks](https://code.claude.com/docs/en/hooks)

**Steps.** With the managed audit hook active, edit `~/.claude/settings.json` and a project `.claude/settings.json` during a session. Check the audit log.

**Expected.** A `ConfigChange` record for each edit. Note that the docs say hooks don't fire for managed/MDM changes.

**Result.** ⏳ · `evidence/POL-015/`

<a id="pol-016"></a>
### POL-016 · Permission-mode policy (auto-mode decision) is enforced

**Priority** P1 · **Controls** CTL-08 · **Decision** [ADR-008](../../../logs/decision-log.md#adr-008)

**Steps.** After ADR-008: if auto mode is disallowed, apply the disabling setting [verify key location: `permissions.disableAutoMode` vs. top-level `disableAutoMode`] and try Shift+Tab to auto, `--permission-mode auto`, and `/config`. If it's allowed, confirm the managed `autoMode.environment` description is present. Also add `autoMode` rules in **user** settings and check whether they stack on top of the managed ones ([R-22](../../../logs/risk-register.md#r-22)).

**Expected.** Behavior matches the ADR.

**Result.** ⏳ · `evidence/POL-016/`

<a id="pol-017"></a>
### POL-017 · Managed CLAUDE.md is delivered read-only and loads in every session

**Priority** P1 · **Controls** CTL-06, CTL-25 · **Risks** R-26

**Steps.** Put `CLAUDE.md` in the policy folder so it appears at `/etc/claude-code/CLAUDE.md` through the read-only mount ([ADR-015](../../../logs/decision-log.md#adr-015)). Start a session and run `/memory`: it's listed as the managed memory. Ask Claude where packages come from and what it does when a package is missing. Try to edit the file as Claude and as `dev`.

**Expected.** Loaded in every session, read-only, and Claude's behavior follows it.

**Result.** ⏳ · `evidence/POL-017/`
