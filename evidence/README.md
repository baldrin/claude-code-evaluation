---
title: Evidence rules and index
status: Final
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 1.1
---

# Evidence rules and index

[🏠 Home](../README.md) › Evidence

Evidence is what makes the reports defensible. Every verdict in the test catalog must point to evidence here. A reviewer who wasn't in the room should be able to see what was tested, how, on which version, and what happened.

## Contents
- [Where records live](#where-records-live)
- [Recording with the tracker](#recording-with-the-tracker)
- [Folder layout](#folder-layout)
- [File naming](#file-naming)
- [What to capture](#what-to-capture)
- [Redaction rules](#redaction-rules)
- [Secure evidence store](#secure-evidence-store)
- [Evidence index](#evidence-index)

## Where records live

> [!IMPORTANT]
> **Keep evaluation records out of the agent's reach.** Records means test results, evidence, findings drafts, tracker data, and private notes. The agent under test must not be able to read or change them ([ADR-004](../logs/decision-log.md#adr-004), [R-27](../logs/risk-register.md#r-27), [DATA-013](../docs/03-test-plan/catalog/data.md#data-013)). Concretely:
>
> - Not in the single GitHub repo the agent's token can reach, and not in any repo cloned into a dev container.
> - Not in any folder shared into Docker Desktop or mounted into a container.
> - On the evaluation lead's own workstation (or the secure evidence store), in a separate records repo or folder such as `<org>/claude-code-eval-records` or `C:\EvalRecords\`.
>
> This docs repo holds the plan, the templates, and **redacted** evidence that has been copied in deliberately. The working records stay in the records location until they're redacted and published.

## Recording with the tracker

The tracker (`tools/tracker/tracker.html`, [ADR-019](../logs/decision-log.md#adr-019), coming in a later change) is a single HTML file you open in Edge. You point it at the records folder, and it saves each entry and its attachments there as ordinary files, so git can version them.

| Tracker field | Maps to |
|---|---|
| Section, title, optional test ID | Catalog domain and test ID, when there is one |
| Status: 🟩 Pass · 🟨 Issue · 🟥 Blocker · ⏳ Not run · ⏭ N/A | The verdict copied into the catalog Result cell |
| What I did · Result · Steps to fix · Notes | The sections of [test-result.md](../templates/test-result.md) |
| Attachments (screenshots, logs) | Files named by the rules below |
| **Private notes** | **Never exported.** They stay in the records folder only. |

**Build report** compiles every entry into one document, without private notes. Attachments for an entry with a test ID keep the `<TEST-ID>/YYYYMMDD-<slug>.<ext>` naming below, so tracker output and manual `RESULT.md` records stay compatible. Apply the [redaction rules](#redaction-rules) before anything leaves the records location.

## Folder layout

```
evidence/
├── README.md               ← this file (rules + index)
├── ENV-001/
│   ├── RESULT.md           ← result record (from templates/test-result.md)
│   ├── 20261019-hyperv-status.log
│   └── 20261019-vdi-virtualization.png
├── SBX-004/
│   └── ...
└── _shared/                ← artifacts used by many tests (policy snapshots, image manifests)
    ├── policy-v0.3-managed-settings.redacted.json
    └── image-v0.3-manifest.txt
```

One folder per test ID. Use `_shared/` for artifacts that many tests reference, such as the managed-settings snapshot each test ran against. The same layout applies in the records location; only redacted copies come into this repo.

## File naming

`YYYYMMDD-<short-slug>.<ext>`, all lowercase, words separated by hyphens.

| Type | Extension | Example |
|---|---|---|
| Terminal output | `.log` or `.txt` | `20261021-curl-blocked.log` |
| Screenshot | `.png` | `20261021-status-managed-source.png` |
| Config snapshot | `.json` / `.yaml` (redacted) | `20261021-managed-settings.redacted.json` |
| Network capture summary | `.txt` / `.csv` | `20261022-egress-summary.csv` |
| Screen recording | `.gif` / `.mp4` (keep under 10 MB) | `20261022-prompt-injection-drill.gif` |
| Dashboard export | `.png` / `.csv` | `20261105-cost-by-team.png` |

## What to capture

For **every** test attempt, capture these in `RESULT.md`:

| Always | How |
|---|---|
| Claude Code version | `claude --version` |
| Image digest | `docker inspect --format '{{.Image}}' <container>` or the registry digest |
| Policy version | `sha256sum /etc/claude-code/managed-settings.json` (and the drop-ins) |
| Provider and model | `/status` inside Claude Code (screenshot) |
| Date, time, tester | In the attempt header |

Also capture whatever proves the specific expected result. That might be the refusal message, the blocked network call, a log line in the collector, an Azure portal view, or the GitHub API response. **Show the negative case too.** For a block test, capture both the attempt and the block.

> [!TIP]
> Use `script -q <file>.log` (Linux) to record a whole terminal session. Run `claude --debug` to get a debug log in `~/.claude/debug/`, which is useful when a control behaves unexpectedly.

## Redaction rules

Before anything goes into git:

| Replace | With |
|---|---|
| Foundry resource names, endpoints | `<foundry-resource>`, `https://<foundry-resource>.services.ai.azure.com` |
| Tenant / subscription / object IDs | `<tenant-id>`, `<subscription-id>`, `<object-id>` |
| API keys, tokens, bearer headers | `<REDACTED-SECRET>`: and **rotate** the secret if it ever appeared in an artifact |
| Real usernames, emails | `<dev-alias>`, `<dev-01>`… |
| Internal hostnames, IPs | `<internal-host>`, `10.x.x.x` |
| Org / repo names | `<org>`, `<repo>` |
| Proprietary source code | A short excerpt only, or a description |

> [!CAUTION]
> Transcripts in `~/.claude/projects/` can contain source code, file contents, and command output. **Never commit raw transcripts.** Quote only the lines you need, redacted.

## Secure evidence store

Unredacted originals go in `<secure-evidence-store>` (for example, a restricted SharePoint or Azure storage container), using the same folder and file names. `.gitignore` excludes `evidence/**/raw/`, so you can keep originals locally under a `raw/` subfolder while you work.

## Evidence index

Update this table as tests are run. It's the quick lookup for report writers. Verdicts use 🟩 Pass · 🟨 Issue · 🟥 Blocker · ⏭ N/A ([legend](../templates/README.md#status-and-result-legend)).

| Test ID | Verdict | Date | Version | Key artifact | Finding |
|---|---|---|---|---|---|
| _example_ `SBX-004` | 🟩 | 2026-10-21 | 2.1.301 | `SBX-004/20261021-cat-azure-denied.log` | — |
