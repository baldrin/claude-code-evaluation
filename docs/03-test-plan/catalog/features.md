---
title: "Catalog: FEAT, workflow features"
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-15
version: 0.1
phase: "1-2"
---

# FEAT: Workflow features

[🏠 Home](../../../README.md) › [Test strategy](../test-strategy.md) › FEAT

These tests check that the core development workflows work **inside the locked-down environment with Foundry**. A control that makes Claude Code useless isn't a success. These tests also feed the training material ([training agenda](../../07-phase2-pilot/training-agenda.md)) and the [benchmark tasks](../../06-productivity-quality/benchmark-tasks.md). The individual commands and keys behind each feature are in the [feature inventory](../../04-feature-inventory/README.md).

> [!TIP]
> For each feature, record **"useful?"** (1–5) and a one-line note on how a developer would use it. That turns the sweep into the content for the developer quick-start and training.

## Summary

| ID | Test | Pri | Result | Useful (1–5) |
|---|---|---|---|---|
| [FEAT-001](#feat-001) | Interactive basics: prompt, @ mentions, `!` shell, image paste | P1 | ⏳ | |
| [FEAT-002](#feat-002) | Plan mode workflow end to end | P1 | ⏳ | |
| [FEAT-003](#feat-003) | Checkpoints and `/rewind` | P1 | ⏳ | |
| [FEAT-004](#feat-004) | CLAUDE.md, `/init`, rules, `/memory` | P1 | ⏳ | |
| [FEAT-005](#feat-005) | Auto memory | P1 | ⏳ | |
| [FEAT-006](#feat-006) | Context management: `/compact`, `/clear`, `/context` | P1 | ⏳ | |
| [FEAT-007](#feat-007) | Built-in subagents | P1 | ⏳ | |
| [FEAT-008](#feat-008) | Custom subagent definitions | P1 | ⏳ | |
| [FEAT-009](#feat-009) | Skills (bundled and project) | P1 | ⏳ | |
| [FEAT-010](#feat-010) | Worktrees (`-w`) | P1 | ⏳ | |
| [FEAT-011](#feat-011) | Background tasks and agent view | P1 | ⏳ | |
| [FEAT-012](#feat-012) | Headless mode (`-p`) with JSON output | P0 | ⏳ | |
| [FEAT-013](#feat-013) | `/code-review` | P1 | ⏳ | |
| [FEAT-014](#feat-014) | `/security-review` | P1 | ⏳ | |
| [FEAT-015](#feat-015) | Git workflow with attribution trailer | P0 | ⏳ | |
| [FEAT-016](#feat-016) | Todo / task list | P2 | ⏳ | |
| [FEAT-017](#feat-017) | Sessions: `/resume`, `--continue`, naming, `/export` | P1 | ⏳ | |
| [FEAT-018](#feat-018) | `/model` and `/effort` switching | P1 | ⏳ | |
| [FEAT-019](#feat-019) | Managed quality-gate hooks | P1 | ⏳ | |
| [FEAT-020](#feat-020) | `stream-json` and `--json-schema` | P2 | ⏳ | |
| [FEAT-021](#feat-021) | `/loop` and local scheduled tasks | P2 | ⏳ | |
| [FEAT-022](#feat-022) | Agent teams (experimental) | P2 | ⏳ | |
| [FEAT-023](#feat-023) | `/simplify` and `/batch` | P2 | ⏳ | |
| [FEAT-024](#feat-024) | UI: keybindings, themes, editor mode, terminal setup, status line | P2 | ⏳ | |
| [FEAT-025](#feat-025) | Diagnostics: `/doctor`, `/debug`, `/status`, `/usage`, `/context` | P1 | ⏳ | |
| [FEAT-026](#feat-026) | `/diff` and reviewing changes | P1 | ⏳ | |

---

<a id="feat-001"></a>
### FEAT-001 · Interactive basics: prompt, @ mentions, `!` shell mode, image paste

**Priority** P1 · **Docs** [interactive mode](https://code.claude.com/docs/en/interactive-mode)

**Steps.** Ask a codebase question. Use `@path/file` and `@dir/` mentions. Run `!git status` (shell mode). Paste a screenshot (Ctrl+V) and ask about it. Try multiline input and Esc to interrupt.

**Expected.** All work in the CLI and in the VS Code panel. Note that `!` commands run **outside** Claude's sandbox. Only the container firewall applies to them.

**Result.** ⏳ · `evidence/FEAT-001/`

<a id="feat-002"></a>
### FEAT-002 · Plan mode workflow end to end

**Priority** P1 · **Docs** [permission modes](https://code.claude.com/docs/en/permission-modes)

**Steps.** Shift+Tab to plan mode. "Plan how to add input validation to <module>". Review and edit the plan, approve it, and let Claude implement.

**Expected.** A plan is produced without changes. On approval, implementation follows the plan.

**Result.** ⏳ · `evidence/FEAT-002/`

<a id="feat-003"></a>
### FEAT-003 · Checkpoints and `/rewind`

**Priority** P1 · **Docs** [checkpointing](https://code.claude.com/docs/en/checkpointing)

**Steps.** Make three edits across turns. `/rewind` (or Esc Esc) to before edit 2: restore code only, then conversation only, then both. Note what isn't restored (for example, Bash side effects).

**Expected.** File edits restored as documented. Limits recorded for training.

**Result.** ⏳ · `evidence/FEAT-003/`

<a id="feat-004"></a>
### FEAT-004 · CLAUDE.md, `/init`, rules, and `/memory`

**Priority** P1 · **Docs** [memory](https://code.claude.com/docs/en/memory)

**Steps.** Run `/init` in a pilot-like repo. Review the generated CLAUDE.md. Add a rule ("always run `make lint` before committing"). Check `/memory`. Confirm the rule is followed. Test whether a managed `claudeMd` 🔒 (org-wide instructions) loads [verify].

**Expected.** A useful CLAUDE.md, with rules followed. Produce a **template CLAUDE.md** for pilot repos.

**Result.** ⏳ · `evidence/FEAT-004/`

<a id="feat-005"></a>
### FEAT-005 · Auto memory

**Priority** P1 · **Docs** [memory](https://code.claude.com/docs/en/memory)

**Steps.** Over several sessions, check whether Claude saves and recalls project facts. Inspect the memory files ([DATA-010](data.md#data-010)).

**Expected.** Works. A decision on keeping it on.

**Result.** ⏳ · `evidence/FEAT-005/`

<a id="feat-006"></a>
### FEAT-006 · Context management: `/compact`, `/clear`, `/context`

**Priority** P1 · **Docs** [costs](https://code.claude.com/docs/en/costs)

**Steps.** Run a long session. `/context` (grid). `/compact focus on the parser changes`. `/clear` between tasks. Record the token and cost impact (OTel `compaction` event).

**Expected.** Works. Guidance for training ("clear between tasks").

**Result.** ⏳ · `evidence/FEAT-006/`

<a id="feat-007"></a>
### FEAT-007 · Built-in subagents (Explore, Plan, general-purpose)

**Priority** P1 · **Docs** [subagents](https://code.claude.com/docs/en/sub-agents)

**Steps.** "Find every place we parse dates and summarize the patterns" (should use Explore). Check that subagents run under the same policy ([SBX-010](sandbox.md#sbx-010)), and check their cost attribution.

**Expected.** Subagents are used and results returned. Cost visible under `query_source=subagent`.

**Result.** ⏳ · `evidence/FEAT-007/`

<a id="feat-008"></a>
### FEAT-008 · Custom subagent definitions

**Priority** P1

**Steps.** Create `.claude/agents/test-writer.md` (restricted tools, Sonnet). Invoke it with `/agents` and by name.

**Expected.** Works. Tool restrictions are honored. Template saved for the pilot.

**Result.** ⏳ · `evidence/FEAT-008/`

<a id="feat-009"></a>
### FEAT-009 · Skills (bundled and project)

**Priority** P1 · **Docs** [skills](https://code.claude.com/docs/en/skills)

**Steps.** List with `/skills`. Run bundled skills that make sense offline (`/simplify`, `/code-review`). Create a project skill (for example, "release-notes"). Note which bundled skills need claude.ai or blocked network, and mark them ⛔.

**Expected.** Usable skill list recorded. A project skill template.

**Result.** ⏳ · `evidence/FEAT-009/`

<a id="feat-010"></a>
### FEAT-010 · Worktrees (`-w`)

**Priority** P1 · **Docs** [worktrees](https://code.claude.com/docs/en/worktrees)

**Steps.** `claude -w feature-x`. Make changes. Run a second session in parallel on another worktree. Check that the worktree path is inside the sandbox write scope.

**Expected.** Works, or the sandbox write scope needs the worktree location (record it).

**Result.** ⏳ · `evidence/FEAT-010/`

<a id="feat-011"></a>
### FEAT-011 · Background tasks and agent view

**Priority** P1 · **Docs** [agent view](https://code.claude.com/docs/en/agent-view)

**Steps.** Ctrl+B to background a long command. Use `/tasks`. `claude --bg "<task>"`, `claude agents`, `claude attach`.

**Expected.** Works in the container (the daemon may need a writable runtime dir). Record the behavior.

**Result.** ⏳ · `evidence/FEAT-011/`

<a id="feat-012"></a>
### FEAT-012 · Headless mode (`-p`) with JSON output

**Priority** P0 · **Docs** [headless](https://code.claude.com/docs/en/headless)

**Steps.** `claude -p "summarize the last 5 commits" --output-format json --max-turns 5 --permission-mode dontAsk`. Check the JSON fields (result, cost, usage, session_id). Note that on third-party providers, `-p` runs **start in auto mode** in recent versions unless the managed `defaultMode` is set, so confirm the starting mode. Also note that `--allowedTools` is ignored under `allowManagedPermissionRulesOnly`, so CI allowlists must live in managed policy.

**Expected.** Works non-interactively, the policy applies, and the JSON is parseable. This is the basis for any CI use.

**Result.** ⏳ · `evidence/FEAT-012/`

<a id="feat-013"></a>
### FEAT-013 · `/code-review`

**Priority** P1 · **Docs** [code review (local)](https://code.claude.com/docs/en/code-review-local)

**Steps.** On a branch with a seeded bug, run `/code-review` at effort low and high. Try `--fix`. Skip `--comment` unless the token allows PR comments.

**Expected.** The seeded bug is found. Record true and false positives. `/ultrareview` is ⛔ (cloud).

**Result.** ⏳ · `evidence/FEAT-013/`

<a id="feat-014"></a>
### FEAT-014 · `/security-review`

**Priority** P1

**Steps.** On a branch with a seeded vulnerability (SQL injection, hard-coded fake secret), run `/security-review`.

**Expected.** Found. Useful as a pre-PR habit.

**Result.** ⏳ · `evidence/FEAT-014/`

<a id="feat-015"></a>
### FEAT-015 · Git workflow: branch, commit, PR with attribution trailer

**Priority** P0 · **Docs** [settings: attribution](https://code.claude.com/docs/en/settings-reference)

**Steps.** "Create a branch, fix issue #N, commit, push, and open a PR." Approve the push prompt. Inspect the commit message trailer and the PR description.

**Expected.** The trailer and PR line match the managed `attribution` values **exactly** ([measurement framework](../../06-productivity-quality/measurement-framework.md#attribution)). The PR is created with the scoped token. OTel `commit.count` and `pull_request.count` increment.

**Result.** ⏳ · `evidence/FEAT-015/`

<a id="feat-016"></a>
### FEAT-016 · Todo / task list

**Priority** P2

**Steps.** A multi-step request. Ctrl+T to toggle the task list.

**Expected.** Tasks shown and updated. Note: task tools may be missing with custom deployment names [verify] ([COST-011](cost.md#cost-011)).

**Result.** ⏳ · `evidence/FEAT-016/`

<a id="feat-017"></a>
### FEAT-017 · Sessions: `/resume`, `--continue`, naming, `/export`

**Priority** P1

**Steps.** `/rename`, exit, `claude -c`, `claude -r` (picker), `--fork-session`, `/export`. Recreate the container and resume (volume persistence).

**Expected.** Works across container restarts.

**Result.** ⏳ · `evidence/FEAT-017/`

<a id="feat-018"></a>
### FEAT-018 · `/model` and `/effort` switching

**Priority** P1 · **Docs** [model config](https://code.claude.com/docs/en/model-config)

**Steps.** Switch models and effort levels mid-session. Check OTel `api_request.model` and `effort`. Try `opusplan` [verify on Foundry].

**Expected.** Allowed models only ([POL-011](policy.md#pol-011)). Effort changes are visible in telemetry.

**Result.** ⏳ · `evidence/FEAT-018/`

<a id="feat-019"></a>
### FEAT-019 · Managed quality-gate hooks (lint/test on PostToolUse)

**Priority** P1 · **Docs** [hooks guide](https://code.claude.com/docs/en/hooks-guide)

**Steps.** In a test policy, add a managed `PostToolUse` hook on `Edit|Write` that runs the repo linter and returns failures to Claude. Make an edit that violates lint.

**Expected.** Claude sees the lint failure and fixes it. This shows hooks as a **quality** lever, not just a security one. Candidate for the Phase 2 policy.

**Result.** ⏳ · `evidence/FEAT-019/`

<a id="feat-020"></a>
### FEAT-020 · `stream-json` output and `--json-schema`

**Priority** P2

**Steps.** `claude -p … --output-format stream-json --verbose`. `--json-schema '<schema>'` for structured output.

**Expected.** Works. Useful for automation.

**Result.** ⏳ · `evidence/FEAT-020/`

<a id="feat-021"></a>
### FEAT-021 · `/loop` and local scheduled tasks

**Priority** P2 · **Docs** [scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks)

**Steps.** `/loop 5m check CI status for my PR`. Check whether local cron-style tasks work in the container. Cloud routines (`/schedule`) are ⛔.

**Expected.** Behavior recorded. Cost impact noted.

**Result.** ⏳ · `evidence/FEAT-021/`

<a id="feat-022"></a>
### FEAT-022 · Agent teams (experimental)

**Priority** P2 · **Docs** [agent teams](https://code.claude.com/docs/en/agent-teams)

**Steps.** In a test container, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Try a team task.

**Expected.** Recorded. Probably 🔴 for the pilot (experimental, cost).

**Result.** ⏳ · `evidence/FEAT-022/`

<a id="feat-023"></a>
### FEAT-023 · `/simplify` and `/batch`

**Priority** P2

**Steps.** `/simplify` on a recent diff. `/batch` a small multi-file change (it uses worktrees).

**Expected.** Works or is marked ⛔. Record usefulness.

**Result.** ⏳ · `evidence/FEAT-023/`

<a id="feat-024"></a>
### FEAT-024 · UI: keybindings, themes, editor mode, terminal setup, status line

**Priority** P2

**Steps.** `/theme`, `/config` (editor mode: vim), `/keybindings`, `/terminal-setup`. Check that the status line is managed-only ([EXT-007](extensions.md#ext-007)).

**Expected.** Preference features work.

**Result.** ⏳ · `evidence/FEAT-024/`

<a id="feat-025"></a>
### FEAT-025 · Diagnostics: `/doctor`, `/debug`, `/status`, `/usage`, `/context`

**Priority** P1

**Steps.** Run each. `claude --debug` writes to `~/.claude/debug/`.

**Expected.** All work. Document them in the support runbook ([OPS-006](operations.md#ops-006)).

**Result.** ⏳ · `evidence/FEAT-025/`

<a id="feat-026"></a>
### FEAT-026 · `/diff` and reviewing changes

**Priority** P1

**Steps.** After edits, `/diff` in the CLI. Review the diff in VS Code. Accept or reject individual hunks.

**Expected.** Clear review flow. The accept/reject decisions show up in `code_edit_tool.decision`.

**Result.** ⏳ · `evidence/FEAT-026/`
