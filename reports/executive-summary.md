---
title: "Executive summary: Claude Code evaluation"
status: Draft            # template, filled in after Phase 2
owner: <evaluation-lead>
last_updated: YYYY-MM-DD
version: 0.2
phase: "1-2"
---

# Executive summary: Claude Code evaluation

[🏠 Home](../README.md) › Reports › Executive summary

> [!NOTE]
> **Template. Keep it to two printed pages.** The audience is the executive sponsor, Security, Finance, and engineering leadership. Every number links to the Phase 1 or Phase 2 report.

## Recommendation

> **«ADOPT / ADOPT FOR TARGETED TEAMS / ADOPT WITH COST CONTROLS / DO NOT ADOPT YET»**
>
> «One sentence on why.»

## What we evaluated

Claude Code, an AI coding agent, ran in a locked-down Linux container on isolated Windows VDIs, using Claude models in our own Microsoft Foundry tenant with Entra ID sign-in and no shared keys. The end goal is to run the same container images on developers' own PCs. The evaluation had two phases: «4» weeks of security and configuration testing, then an «8»-week pilot with «n» developers.

## The three questions

| | Question | Answer | Evidence |
|---|---|---|---|
| 🔐 | **Can we secure it?** | «Yes. 73/73 critical controls verified. No open high-risk findings. Developers can't disable controls. Network egress limited to approved destinations.» | [Phase 1 report](phase1-security-configuration-report.md) |
| 💰 | **What does it cost?** | «$x per developer per month (P90 $y). Org-wide forecast $a–$b per year.» | [Phase 2 §3](phase2-pilot-report.md#3-cost) |
| 🚀 | **Does it make us better?** | «PR cycle time −x% (range), throughput +y%, quality guardrails held. Developers rate it z/5, and n% want to keep it.» | [Phase 2 §4–6](phase2-pilot-report.md#4-productivity) |

## Value vs. cost

| | Per developer per month |
|---|---|
| Estimated value of time saved | «$» (range «$–$») |
| Total cost (usage + platform share) | «$» |
| **ROI multiple** | «x×» |

## Key risks and how they're handled

| Risk | Treatment | Residual |
|---|---|---|
| Data leaving the company | Network allowlist, sandbox, approved Foundry hosting, no training on our data | «Low» |
| Agent mistakes reaching production | PR review required, branch protection, AI changes attributed | «Low» |
| Cost overrun | Per-user spend caps, automatic shutoff of runaway agents, budgets, model guidance, weekly review | «Low–Med» |
| «Top residual risk from Phase 1» | | |

## Moving from VDIs to PCs

«Recommendation: «ready / ready with conditions / not yet» to run the container on developers' PCs. Which controls were proven independent of the VDI (Phase 1 §13), which PC prerequisites are met (standard user, Hyper-V, Docker Desktop Business licence, full-disk encryption, VPN), and what must be in place first.»

| Condition for PC rollout | Status | Evidence |
|---|---|---|
| Container controls proven on an internet-connected host | «…» | [Phase 1 §13](phase1-security-configuration-report.md) |
| PC prerequisites met | «…» | ENV-022 |
| Guardicore rule for Docker Desktop traffic in place | «…» | ENV-021 |
| Sessions fail closed off the VPN | «…» | NET-015 |

## If we adopt: rollout plan

| Wave | Who | When | Prerequisites |
|---|---|---|---|
| 1 | «Pilot teams + n teams» | | |
| 2 | | | |
| 3 | | | |

**Ongoing needs:** «n FTE for platform/policy upkeep, training, support channel, quarterly cost review, upgrade cadence».

## Decisions requested

1. «Approve adoption per the plan above»
2. «Approve the annual budget of $x»
3. «Confirm the policy owner and support model»
