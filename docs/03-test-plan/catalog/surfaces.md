---
title: "Catalog: SURF, surfaces and integrations"
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: "1-2"
---

# SURF: Surfaces and integrations

[🏠 Home](../../../README.md) › [Test strategy](../test-strategy.md) › SURF

These tests record which Claude Code surfaces work with Foundry inside our environment, and confirm that the ones that don't (mostly claude.ai-dependent) are recorded as N/A with a reason. Full list: [surfaces inventory](../../04-feature-inventory/surfaces-and-integrations.md).

## Summary

| ID | Test | Pri | Result |
|---|---|---|---|
| [SURF-001](#surf-001) | Terminal CLI in the container | P0 | ⏳ |
| [SURF-002](#surf-002) | VS Code extension in a Dev Container | P0 | ⏳ |
| [SURF-003](#surf-003) | JetBrains via remote development [verify] | P2 | ⏳ |
| [SURF-004](#surf-004) | GitHub Actions (claude-code-action) with Foundry [verify] | P1 | ⏳ |
| [SURF-005](#surf-005) | Headless CLI in GitHub Actions with Azure OIDC | P1 | ⏳ |
| [SURF-006](#surf-006) | Agent SDK with Foundry | P2 | ⏳ |
| [SURF-007](#surf-007) | Desktop app with Foundry [verify] | P2 | ⏳ |
| [SURF-008](#surf-008) | Web, mobile, Remote Control: confirm N/A | P2 | ⏳ |
| [SURF-009](#surf-009) | Slack / Claude Tag: confirm N/A | P2 | ⏳ |
| [SURF-010](#surf-010) | Chrome extension and computer use are blocked | P1 | ⏳ |
| [SURF-011](#surf-011) | Routines, ultrareview, cloud sessions: confirm N/A | P2 | ⏳ |
| [SURF-012](#surf-012) | GitLab CI/CD: N/A | P2 | ⏳ |
| [SURF-013](#surf-013) | Optional Windows CI runner loop | P2 | CTL-17, CTL-29 | ⏳ |

---

<a id="surf-001"></a>
### SURF-001 · Terminal CLI in the container

**Priority** P0

**Steps.** Run `claude` in the VS Code integrated terminal (container) and in a standalone terminal attached with `docker exec`. Check rendering (fullscreen TUI, colors), copy/paste, and image paste.

**Expected.** Fully usable. Record terminal quirks (Windows Terminal → `docker exec` → container).

**Result.** ⏳ · `evidence/SURF-001/`

<a id="surf-002"></a>
### SURF-002 · VS Code extension in a Dev Container

**Priority** P0 · **Docs** [VS Code](https://code.claude.com/docs/en/vs-code)

**Steps.** Builds on [ENV-009](env.md#env-009). Exercise the extension's features: side panel chat, inline diff accept/reject, @-mentions of open files, plan mode toggle, permission prompts, and selection context.

**Expected.** Features work. Policy applies the same way as in the CLI.

**Result.** ⏳ · `evidence/SURF-002/`

<a id="surf-003"></a>
### SURF-003 · JetBrains via remote development [verify]

**Priority** P2 · **Docs** [JetBrains](https://code.claude.com/docs/en/jetbrains)

**Steps.** Only if pilot developers use JetBrains. Gateway or Dev Containers into the same image, with the plugin on the remote side.

**Expected.** Works, or ⏭ N/A (no JetBrains users).

**Result.** ⏳ · `evidence/SURF-003/`

<a id="surf-004"></a>
### SURF-004 · GitHub Actions (claude-code-action) with Foundry [verify]

**Priority** P1 · **Docs** [GitHub Actions](https://code.claude.com/docs/en/github-actions)

**Steps.** Per the docs, the action supports Foundry with `use_foundry: "true"` and `azure/login` for OIDC. Confirm this works in our tenant [verify]. Configure it in the test repo with Azure OIDC (federated credential), the managed-policy equivalent via `settings` input, and a `--max-budget-usd`. Trigger with an `@claude` comment.

**Expected.** Works, or a documented gap ⇒ fall back to [SURF-005](#surf-005). Use a **custom GitHub App** limited to Contents, Issues, and Pull requests, not the official Claude GitHub App, which can write workflows (see the [surfaces inventory](../../04-feature-inventory/surfaces-and-integrations.md)).

**Result.** ⏳ · `evidence/SURF-004/`

<a id="surf-005"></a>
### SURF-005 · Headless CLI in GitHub Actions with Azure OIDC

**Priority** P1 · **Docs** [headless](https://code.claude.com/docs/en/headless)

**Steps.** A workflow job that logs in to Azure with OIDC (`azure/login`), installs the pinned Claude Code, writes managed settings to `/etc/claude-code/` on the runner, and runs `claude -p "<review the diff>" --permission-mode dontAsk --max-budget-usd 1 --output-format json`. Post the result as a PR comment with the workflow's `GITHUB_TOKEN`.

**Expected.** Works with the CI identity's RBAC role. Cost visible in OTel under `team.id=ci`. Candidate Phase 2 use case: automated PR review.

**Result.** ⏳ · `evidence/SURF-005/`

<a id="surf-006"></a>
### SURF-006 · Agent SDK with Foundry

**Priority** P2 · **Docs** [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)

**Steps.** A minimal Python or TypeScript SDK script in the container with the Foundry env vars. Run a query.

**Expected.** Works. Note it for future internal-tooling use cases.

**Result.** ⏳ · `evidence/SURF-006/`

<a id="surf-007"></a>
### SURF-007 · Desktop app with Foundry [verify]

**Priority** P2 · **Docs** [desktop](https://code.claude.com/docs/en/desktop)

**Steps.** Read the docs for third-party provider support. **Don't** install on the VDI (native Windows, no sandbox), unless as an isolated test.

**Expected.** Recorded as ⛔ / 🔴 with the reason (native Windows, no sandbox).

**Result.** ⏳ · `evidence/SURF-007/`

<a id="surf-008"></a>
### SURF-008 · Web, mobile, Remote Control: confirm N/A

**Priority** P2

**Steps.** Run `/remote-control` and `--remote`, and check the docs.

**Expected.** Refused (requires claude.ai subscription auth). ⏭ N/A recorded.

**Result.** ⏳ · `evidence/SURF-008/`

<a id="surf-009"></a>
### SURF-009 · Slack / Claude Tag: confirm N/A

**Priority** P2

**Steps.** Check the docs. `/install-slack-app`.

**Expected.** ⏭ N/A (needs a claude.ai organization).

**Result.** ⏳ · `evidence/SURF-009/`

<a id="surf-010"></a>
### SURF-010 · Chrome extension and computer use are blocked

**Priority** P1

**Steps.** `/chrome`, `claude --chrome`. Confirm that egress to `bridge.claudeusercontent.com` is blocked and that computer use isn't available (it's macOS-only and the container is headless).

**Expected.** Unavailable.

**Result.** ⏳ · `evidence/SURF-010/`

<a id="surf-011"></a>
### SURF-011 · Routines, ultrareview, cloud sessions: confirm N/A

**Priority** P2

**Steps.** `/schedule`, `/ultrareview`, `--cloud`, `/teleport`.

**Expected.** Refused or unavailable. ⏭ N/A.

**Result.** ⏳ · `evidence/SURF-011/`

<a id="surf-012"></a>
### SURF-012 · GitLab CI/CD: N/A

**Priority** P2

**Expected.** ⏭ N/A (GitHub shop). Recorded for completeness.

**Result.** ⏳ · `evidence/SURF-012/`

<a id="surf-013"></a>
### SURF-013 · Optional Windows CI runner build-and-test loop for Windows-only repos

**Priority** P2 · **Controls** CTL-17, CTL-29 · **Risks** R-28

**Steps.** If time allows ([ADR-017](../../../logs/decision-log.md#adr-017), option B): register an ephemeral self-hosted Windows runner for one Windows-only repo (on-prem, Nexus-only egress, no secrets). Claude pushes a branch, the workflow builds and tests, and Claude reads the result with `gh run watch` and `gh run view --log-failed`. Time the loop and note the token cost.

**Expected.** It works, or it's recorded as not worth the friction. Claude can't edit workflow files ([PERM-003](permissions.md#perm-003)).

**Result.** ⏳ · `evidence/SURF-013/`
