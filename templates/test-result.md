---
title: "<TEST-ID> result"
status: Draft
owner: <evaluation-lead>
last_updated: YYYY-MM-DD
version: 0.1
---

<!-- Links in this template are relative to its destination folder (see templates/README.md), not to templates/. -->

# <TEST-ID> · <Test title>: result record

[🏠 Home](../../README.md) › Evidence › <TEST-ID>

> [!NOTE]
> Save this file as `evidence/<TEST-ID>/RESULT.md` in the records location, which must be outside anything the agent under test can reach (see `evidence/README.md`). Add one **Attempt** section per run and never delete earlier attempts. The latest attempt's verdict is the one copied into the catalog. Keep private notes out of this file: the tracker has a private-notes field that is never exported.

## Summary

| Field | Value |
|---|---|
| Test | [<TEST-ID>](../../docs/03-test-plan/catalog/<domain>.md#<anchor>) |
| Current verdict | ⏳ / 🟩 Pass / 🟨 Issue / 🟥 Blocker / ⏭ N/A |
| Findings raised | `F-NNN`, … or none |
| Last run | YYYY-MM-DD |

## Attempt 1 · YYYY-MM-DD

| Field | Value |
|---|---|
| Tester | <evaluation-lead> |
| Claude Code version | `claude --version` output |
| Image / digest | `<registry>/<image>@sha256:…` |
| Managed policy version | `sha256` of `managed-settings.json` or policy tag |
| Model / deployment | `<deployment-name>` |
| Permission mode | default / acceptEdits / plan / auto / dontAsk |

### What I did

Numbered steps as actually performed, including any deviation from the catalog steps.

### What happened

Observed behavior. Paste short terminal output inline, put long output in a file, and link it.

```text
<trimmed output>
```

### Evidence files

| File | Description |
|---|---|
| `YYYYMMDD-<slug>.png` | … |
| `YYYYMMDD-<slug>.log` | … |

### Steps to fix (if it didn't work)

What you changed to get it working, in order, with the result of each try. Note any setting, file, or ADR the fix touched.

### Notes and exceptions

Anything a reader of the final report needs: accepted deviations, environment quirks, follow-ups.

### Verdict and reasoning

🟩 Pass / 🟨 Issue / 🟥 Blocker / ⏭ N/A: one or two sentences explaining the verdict against the expected result. 🟨 and 🟥 always raise a finding.
