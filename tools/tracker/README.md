---
title: Test tracker
status: In review
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 1.0
---

# Test tracker

[🏠 Home](../../README.md) › Tools › Test tracker

A single HTML file for recording the evaluation as you go, and turning it into a report at the end ([ADR-019](../../logs/decision-log.md#adr-019)). Each entry is one step or test: what you did, the result, what you tried when it didn't work, notes and exceptions, private notes, a status, and attached screenshots and logs.

- **No install, no network.** Open `tracker.html` in Microsoft Edge or Google Chrome. The page's security policy blocks all network requests, so nothing leaves the machine.
- **Plain files.** Entries and attachments are saved as ordinary files in a records folder you choose, so git can version them.
- **Private notes stay private.** They're never included in a report or a Markdown export. Only a full backup contains them.

> [!WARNING]
> **Keep the records folder out of the agent's reach.** Don't put it in the repo Claude Code works on, and don't mount it into any container ([R-27](../../logs/risk-register.md#r-27), [DATA-013](../../docs/03-test-plan/catalog/data.md#data-013)). The tracker warns you if the folder you pick looks like a code repo.

## Contents
- [Get started](#get-started)
- [Recording a step](#recording-a-step)
- [Dashboard and search](#dashboard-and-search)
- [Building the report](#building-the-report)
- [Where the files go](#where-the-files-go)
- [Backups](#backups)
- [Maintenance](#maintenance)
- [What was tested](#what-was-tested)

## Get started

1. Copy `tracker.html` to your work machine. Open it in **Edge** (double-click it, or drag it into a window).
2. Click **Run self-test**. It checks the browser features the tracker needs and runs ten functional tests in a temporary area of browser storage. Your records aren't touched.
3. Pick where records live:
   - **Choose records folder…** (recommended). Edge asks for permission to edit the folder. Next time, click **Reconnect** to grant it again.
   - **Use browser storage** if folder access is blocked by policy. Records then live only in this browser profile. **Export a backup regularly**, because non-persistent VDI profiles are wiped at sign-out.
4. Optional: **Settings** → set defaults for new entries (tester, Claude Code version, image digest, policy version), and **Add standard test-catalog sections** (ENV, POL, PERM, …).

## Recording a step

1. Pick a section in the sidebar (or add one with ＋), then **+ New entry** (or press **Alt+N**).
2. Give it a title. Optionally add a **Test ID** such as `ENV-001`. The box suggests catalog IDs, shows the test's priority and title, and fills in the title if it's empty.
3. Set the status: 🟩 **Pass** · 🟨 **Issue** · 🟥 **Blocker** · ⏳ **Not run** · ⏭ **N/A** · 🔁 **Retest**.
4. Fill in **What I did**, **Result**, **Steps to fix / what I tried** (use **+ Timestamped step** to log each attempt), and **Notes and exceptions**.
5. Add evidence: **paste a screenshot with Ctrl+V**, drag files onto the drop area, or use **Add files…**. Give each one a caption. Logs and text files can be read in place.
6. Use **🔒 Private notes** for anything that must not appear in a report.

Everything saves automatically about half a second after you stop typing. The indicator at the top shows **Saving…** and then **Saved** with the time.

| Shortcut | Action |
|---|---|
| Alt+N | New entry |
| Ctrl+K | Search |
| Ctrl+V | Paste a screenshot into the open entry |
| Enter / Esc | Confirm / close a dialog |

## Dashboard and search

The dashboard shows:
- the totals for each status
- blockers and issues first
- a progress bar for each section
- **test catalog coverage**: how many of the 73 P0 tests (and all 213) have a result, by domain, using the latest entry for each test ID
- recent activity

The status chips in the sidebar filter the lists. Search covers every text field, attachment names and captions, and private notes.

## Building the report

Click **Build report**, choose the sections and statuses, and decide whether to embed screenshots and include log text. The tracker saves two files in the records folder's `reports/` folder:

| File | Use |
|---|---|
| `report-YYYYMMDD-HHMMSS.html` | One self-contained document: summary, blockers and issues, catalog coverage, then every entry with its screenshots and logs. Open it and use **Print → Save as PDF** for a PDF. |
| `report-YYYYMMDD-HHMMSS.md` | The same content as Markdown, with links to the evidence files. Convert it to Word with Pandoc from the `reports` folder: `pandoc report-….md -o report.docx` |

Reports never contain private notes. Text is escaped, so pasted test payloads (for example, from the prompt-injection drills) can't run when the report is opened. **Apply the [redaction rules](../../evidence/README.md#redaction-rules) before a report leaves the records location.**

## Where the files go

```
<records folder>/
├── tracker.json                 ← tracker title, sections, defaults
├── entries/
│   └── e-20261021-143005-ab12.json   ← one file per entry (includes private notes)
├── evidence/
│   ├── ENV-001/                 ← attachments for entries with a test ID
│   │   ├── 20261021-screenshot.png
│   │   └── 20261021-docker-desktop-backend.log
│   └── _entries/<entry-id>/     ← attachments for entries without a test ID
└── reports/
    ├── report-20261105-160212.html
    └── report-20261105-160212.md
```

Attachment names follow the [evidence naming rules](../../evidence/README.md#file-naming): `YYYYMMDD-<slug>.<ext>`, from the caption or the original file name. If you add or change an entry's test ID later, its attachments move to the matching folder.

## Backups

**Settings → Export full backup** saves one `.json` file with every entry, every attachment, and **private notes**. Store it like the records themselves. **Import backup…** restores it into the current storage, which is also how you move from browser storage to a folder.

## Maintenance

| Task | Command |
|---|---|
| Refresh the embedded test catalog after tests are added or renamed | `python3 tools/tracker/build-catalog.py` |
| Run the automated tests (Node 20 or later) | `node tools/tracker/test/run-core-tests.mjs` |

The tests run the tracker's own code against an in-memory copy of the browser's file API. They cover:
- storage and saving
- attachment naming and moves
- deleting entries
- report and Markdown escaping
- private-note exclusion
- section and status filters
- catalog coverage
- backup and restore, including protection against a backup that tries to write outside the records folder
- the built-in self-test

## What was tested

Tested on 2026-10-19 with tracker version 1.0:

| Check | Result |
|---|---|
| Automated core tests (Node 26) | 🟩 18 of 18 |
| Built-in self-test in a Chromium browser | 🟩 10 of 10 |
| Full workflow in the browser: sections, entries, test ID lookup, statuses, timestamped steps, pasted screenshot, dropped log, private notes, search, status filters, settings, standard sections, delete with confirmation, reload persistence | 🟩 |
| HTML and Markdown reports: no private notes, escaped text, embedded screenshot, inlined log, catalog coverage | 🟩 |
| **Records folder mode in Edge, and opening from disk (`file://`)** | ⏳ **Not yet tested.** The test browser (Brave) has the folder picker turned off. Run the self-test in Edge on the work machine first. |

If Edge's policy blocks folder access, use browser storage with regular backups, or ask IT to allow the File System Access API for local files.
