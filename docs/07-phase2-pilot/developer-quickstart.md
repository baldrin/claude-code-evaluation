---
title: Developer quick-start
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 2
---

# Developer quick-start

[🏠 Home](../../README.md) › Phase 2 pilot › Developer quick-start

**Welcome to the Claude Code pilot.** This page gets you from zero to your first useful session in about 30 minutes. If you get stuck, ask in `#claude-code-pilot`.

> [!IMPORTANT]
> Before you start, read and acknowledge the [acceptable use policy](acceptable-use-policy.md). In short: no secrets, customer data, or regulated data in prompts or repos, and you review everything before it merges.

## Contents
- [What you get](#what-you-get)
- [1. Open your repo in the dev container](#1-open-your-repo-in-the-dev-container)
- [2. Sign in](#2-sign-in)
- [3. Sign in to GitHub](#3-sign-in-to-github)
- [4. Start Claude Code](#4-start-claude-code)
- [5. Your first session](#5-your-first-session)
- [Daily habits that work](#daily-habits-that-work)
- [What's locked down, and why](#whats-locked-down-and-why)
- [Spend limits](#spend-limits)
- [Windows-only .NET and VB.NET repos](#windows-only-net-and-vbnet-repos)
- [Troubleshooting](#troubleshooting)

## What you get

- **Claude Code** (an AI coding agent) inside a secure Linux dev container on your VDI, in VS Code or the terminal. It's already installed in the container. There's nothing to download.
- Models served by our company's **Microsoft Foundry** tenant, through our **Claude gateway** once it's enabled.
- Access to **your one pilot repository** on GitHub.
- Packages for Python, Java, and .NET from our internal **Nexus** server, already configured.

## 1. Open your repo in the dev container

1. On your VDI, make sure **Docker Desktop** is running (whale icon in the system tray), then open VS Code.
2. Open the pilot launcher: **`<how the container is launched, e.g. a desktop shortcut or "Dev Containers: Clone Repository in Container Volume…">`**.
3. Wait for the container to build or pull (the first time takes a few minutes).
4. Bottom-left of VS Code should show **`Dev Container: claude-dev`**.

> [!WARNING]
> Claude Code only ever runs inside the container. Never install or run it directly on Windows. It's blocked, and it would run without the safety sandbox.

## 2. Sign in

You sign in with your company account. There's no API key to manage. Which way you sign in depends on whether the gateway is enabled for the pilot. Your onboarding email says which.

**Through the gateway (the usual way).** Start Claude Code (`claude` in the terminal, or the Claude panel in VS Code), then run:

```text
/login
```

1. The **Cloud gateway** screen opens with our gateway's address already filled in. Press Enter.
2. The first time, Claude Code shows the gateway's certificate fingerprint. Check that it matches the one in your onboarding email before you accept it.
3. Open the link it shows in your VDI browser, sign in with your company account, and approve.
4. Back in Claude Code, `/status` shows the account you signed in with.

The sign-in lasts about an hour and renews by itself while you're working.

**Direct to Foundry (only if your onboarding email says so).** In the VS Code terminal (inside the container):

```bash
az login --use-device-code
```

Open the link in your VDI browser, enter the code, and sign in with your company account.

## 3. Sign in to GitHub

```bash
gh auth login --hostname github.com --git-protocol https --with-token < <path-to-token-provided>   # or the method in your onboarding email
gh auth setup-git
gh repo view <org>/<repo>   # should work
```

Your token can only see your pilot repo. That's intentional.

## 4. Start Claude Code

**Option A: VS Code panel.** Click the Claude icon in the sidebar.
**Option B: terminal.** Run `claude`.

Then check the setup:

```text
/status
```

You should see the gateway account you signed in with (or **API provider: Microsoft Foundry** in direct mode) and **managed settings** listed. If not, see [troubleshooting](#troubleshooting).

## 5. Your first session

Try these in order. Each one takes a few minutes:

| # | Try | What you learn |
|---|---|---|
| 1 | "Give me an overview of this repo's architecture and how to run its tests." | Codebase Q&A |
| 2 | `/init` | Claude writes a `CLAUDE.md` with project notes. Review it and commit it if it's useful. |
| 3 | Shift+Tab to **plan mode**, then "Plan how to fix issue #<n>." | Plan before code |
| 4 | Approve the plan and let it implement. Review the diff. | The edit/review loop |
| 5 | "Run the tests and fix any failures." | Agentic loop with tests |
| 6 | "Commit this on a new branch and open a PR." Approve the push prompt. | Git workflow. Your PR gets a Claude trailer. |
| 7 | `/code-review` on your branch | AI review before human review |

## Daily habits that work

| Habit | Why |
|---|---|
| **Start in plan mode** for anything non-trivial | Better results. You stay in control. |
| **`/clear` between unrelated tasks** | Keeps context focused and **cuts cost** |
| **Give it a way to check itself**: tests, a linter, a build command | Claude is much better when it can verify its own work |
| **Be specific**: files, function names, expected behavior | Less back-and-forth |
| **Review every diff** like a colleague's PR | You own what you merge |
| **Use Sonnet for most work and Opus for hard problems** (`/model`) | Cost/quality balance. See the [cost guidance](../05-cost/cost-model.md#cost-levers). |
| **Esc to interrupt, Esc Esc to rewind** | Course-correct early |
| **Fill in the PR checkbox** (None / Some / Most) | It's how we measure the pilot |
| **Do the Friday pulse** (2 min) | Your feedback shapes the rollout decision |

## What's locked down, and why

| You might notice | Why |
|---|---|
| Some commands are blocked (`curl`, `wget`, `ssh`, force-push) | Stops data leaving the container. Protects history. |
| Claude can't read `.env`, keys, or your Azure/GitHub credentials | Secrets stay out of the AI's context |
| Network access is limited to GitHub, Nexus, and our gateway (or Foundry) | Prompt-injection protection |
| **Web search and web fetch are off** | By policy. Claude can't search or fetch web pages. Paste in what it needs, or point it at docs in the repo. |
| Packages come only from Nexus (`pip`, Maven/Gradle, NuGet are already set up) | Supply-chain protection. If a package is missing, ask for it in the channel. Don't change package sources. |
| No MCP servers or plugins | Supply-chain protection, for now. Ask if you need one. |
| Claude asks before editing build files and package configs (`.csproj`, `.vbproj`, `.props`, `.targets`, `Directory.Build.*`, NuGet/pip configs, `.ps1`/`.cmd`/`.bat`) | These files run code when you build on Windows, so you get to look first |
| You're asked before `git push` and merges | You stay in control of irreversible actions |
| You can't change these settings | They're managed centrally |

If a control blocks something you legitimately need, post it in `#claude-code-pilot`. We tune the policy based on your feedback.

## Spend limits

Your usage has a daily, weekly, and monthly cap, set centrally. Periods reset at midnight **UTC** (the evening, US time), on Mondays for the weekly cap, and on the 1st for the monthly cap.

| When | What happens |
|---|---|
| 50% and 80% of your weekly or monthly cap | You and the evaluation lead get an email |
| 75% and 95% of your cap | Claude Code shows a warning. `/usage` shows a **Spend limit** bar. |
| 100% | Requests are blocked until the period resets, or until the lead raises your cap. The message says which cap and when it resets. You both get an email. |
| Lots of agents running with nobody at the keyboard (for example overnight) | An automatic check pauses your access, and you and the lead get an email. The lead restores it once you've talked. |

Don't leave agents running unattended. If you need a long-running job, tell the lead first.

## Windows-only .NET and VB.NET repos

Some .NET and VB.NET projects only build on Windows. For those repos, Claude edits the code and **you** build and test it in Visual Studio:

1. Your repo lives in `C:\Dev\<repo>` on the VDI. The container opens that same folder, so Claude's edits show up in Visual Studio.
2. Ask Claude to make the change, as usual.
3. **Before you build on Windows**, review what Claude changed. Look hardest at build files (`.csproj`, `.vbproj`, `.props`, `.targets`, `Directory.Build.*`), scripts (`.ps1`, `.cmd`, `.bat`), and any new or changed package references. Building runs whatever those files say, outside the container.
4. Build and test in Visual Studio. Paste any errors back to Claude.

Some of these projects can still be compiled inside the container (not run), which catches build errors early. Your onboarding tells you which kind your repo is.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Failed to get token from azureADTokenProvider` | Run `az login --use-device-code` again |
| Repeated connection errors on the first prompt | Check `/status`. If the provider or resource looks wrong, report it. |
| "Operation not permitted" from a command | The sandbox blocked it, as designed. If you need it, ask in the channel. |
| `429` / rate-limit messages | Wait a minute. Report it if it's frequent. |
| `spend limit reached (daily; resets …)` | You've hit a cap. Wait for the reset, or ask the lead in the channel. |
| A package won't install ("not found") | It isn't in Nexus yet. Ask for it in the channel. Don't add other package sources. |
| `/login` won't connect to the gateway | Check that you're on your VDI, then report it in the channel |
| WebSearch or WebFetch "unavailable" | Turned off by policy, as designed |
| `/status` doesn't show managed settings | **Stop** and report it immediately. The container may be misconfigured. |
| Anything else | `/doctor`, then post its output (redacted) in the channel |

## Related
- [Acceptable use policy](acceptable-use-policy.md) · [Training agenda](training-agenda.md)
- Official docs: [Quickstart](https://code.claude.com/docs/en/quickstart) · [Best practices](https://code.claude.com/docs/en/best-practices) · [Common workflows](https://code.claude.com/docs/en/common-workflows)
