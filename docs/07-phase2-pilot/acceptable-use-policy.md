---
title: Acceptable use policy (pilot draft)
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 2
---

# Acceptable use policy: Claude Code pilot (draft)

[🏠 Home](../../README.md) › Phase 2 pilot › Acceptable use policy

> [!NOTE]
> This is a draft for Security, Legal, and HR review. Once approved, every pilot participant acknowledges it before they get access.

## 1. Purpose

This policy sets the rules for using Claude Code during the `<company>` evaluation pilot. It protects company data, keeps the evaluation's results valid, and makes clear what's measured about participants.

## 2. Scope

It applies to every pilot participant using Claude Code in the provided dev container, from `<start date>` to `<end date>`.

## 3. Permitted use

- Software development tasks in **your assigned pilot repository**: writing, reviewing, testing, refactoring, documenting, and understanding code.
- Asking questions about code, tools, and technical concepts.
- Using any Claude Code feature the managed configuration allows.

## 4. Prohibited use

You must **not**:

1. Put **secrets** (passwords, keys, tokens, certificates) into prompts, files Claude reads, or commits.
2. Use **customer data, personal data (PII), production data, or regulated data** (for example PCI, PHI, or export-controlled data) with Claude Code.
3. Try to **bypass, disable, or weaken** any security control: managed settings, the sandbox, the network restrictions, the permission rules, spend limits, or the container configuration. That includes running Claude Code outside the provided container.
4. **Run Claude Code natively on Windows**, or install it any other way than the provided container image.
5. **Change package sources** (pip, Maven/Gradle, NuGet, or npm configuration), or bring in packages from anywhere other than Nexus.
6. Try to work around the **web search and web fetch** tools being turned off.
7. Use Claude Code with **repositories other than your assigned one**, or with personal accounts.
8. **Merge code you haven't reviewed.** You're accountable for every change you merge, whether you or Claude wrote it.
9. Use Claude Code to produce content that breaks company policy (harassment, discrimination, IP infringement).
10. Share pilot credentials, or let others use your session.
11. Leave agents running unattended (for example overnight) without telling the evaluation lead first.

## 5. Your responsibilities

- Review all AI-generated code with the same care as a colleague's PR.
- In a Windows-only .NET or VB.NET repo, **review Claude's changes before you build or run them on Windows**: build files (`.csproj`, `.vbproj`, `.props`, `.targets`, `Directory.Build.*`), scripts (`.ps1`, `.cmd`, `.bat`), and any new or changed packages. Building runs those files outside the container's protections.
- Mark AI assistance honestly in the PR template checkbox.
- Report anything unexpected right away in `#claude-code-pilot` or to `<security contact>`. That covers odd behavior, a control that didn't block something it should have, or a suspected data exposure.
- Complete the surveys (about 30 minutes in total, plus a 2-minute weekly pulse).

## 6. What's measured about you

Full transparency:

| Data | Collected | Not collected |
|---|---|---|
| Usage telemetry | Sessions, active time, tokens, cost, models used, tools used, accept/reject decisions, lines changed | **Prompt text, Claude's responses, file contents, and command text are not collected** (content logging is off) |
| GitHub activity | PR timings, review rounds, CI results, reverts, and the Claude checkbox/trailer, for your pilot repo only | Anything outside your pilot repo |
| Surveys | Your answers | — |
| Local transcripts | Stored **in your container only** for 30 days, so you can resume sessions | Not collected centrally. Accessed only during a security incident investigation, with authorization. |
| Security logs | Blocked network attempts, denied actions (metadata), gateway sign-ins (time and account) | — |
| Spend | Your estimated spend per day, week, and month against your caps, and the notification emails sent to you | Anything about what you were working on |

**How it's used:** only for aggregate evaluation results, with pseudonyms in all reports. **It isn't used for individual performance evaluation.** Management and HR confirm this in writing.

**Your choice:** you can leave the pilot at any time, and your data will then be excluded from the analysis.

## 7. Spend limits

Your Claude Code usage has daily, weekly, and monthly caps, set centrally. Periods reset at midnight UTC. You get a warning in Claude Code at 75% and 95% of a cap, and an email (copied to the evaluation lead) at 50%, 80%, and 100%. At a cap, requests are blocked until the period resets or the evaluation lead raises it. If an automatic check sees many agents running with nobody at the keyboard, it pauses your access and emails you and the lead. Hitting a cap isn't a violation of this policy. It's a cost control.

## 8. Enforcement

Breaking this policy may lead to removal from the pilot and to action under existing company policies `<link>`.

## 9. Acknowledgement

> I've read and understood the Claude Code pilot acceptable use policy, and I agree to follow it.
>
> Name: ________________ Date: ________ Dev ID (assigned): `<dev-NN>`

## Approval

| Role | Name | Date |
|---|---|---|
| Security | | |
| Legal | | |
| HR / Works council (if applicable) | | |
