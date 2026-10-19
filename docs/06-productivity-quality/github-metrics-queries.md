---
title: GitHub metrics queries
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-15
version: 0.1
phase: 2
---

# GitHub metrics queries

[🏠 Home](../../README.md) › Productivity & quality › GitHub metrics queries

This page specifies exactly which GitHub data to pull for the [measurement framework](measurement-framework.md), and from which endpoints. It's a **specification, not a script**. The queries are written as `gh` CLI commands, so they can be run by hand or turned into a script later.

> [!CAUTION]
> Run these **only** from the evaluation lead's workstation, with a read-only token that covers the pilot repos. Never run them inside a developer container, and never give that token to Claude Code ([identity-and-access.md](../01-architecture/identity-and-access.md#evaluator-identities)).

## Contents
- [Token](#token)
- [Pull requests (GraphQL)](#pull-requests-graphql)
- [Derived fields](#derived-fields)
- [Commits and trailers](#commits-and-trailers)
- [Check runs (first-run CI pass)](#check-runs-first-run-ci-pass)
- [Reverts and follow-up fixes](#reverts-and-follow-up-fixes)
- [Code scanning alerts](#code-scanning-alerts)
- [Output schema](#output-schema)

## Token

Fine-grained PAT (or a GitHub App) with **read-only** access to the pilot repositories:

| Permission | Level |
|---|---|
| Metadata | Read |
| Contents | Read |
| Pull requests | Read |
| Checks / Commit statuses | Read |
| Code scanning alerts | Read |
| Issues | Read (for bug labels) |

## Pull requests (GraphQL)

One query per repository, paginated. Pull the **baseline window** (90–180 days before the pilot) once, then pull **weekly** during the pilot.

```bash
gh api graphql --paginate -F owner='<org>' -F name='<repo>' -f query='
query($owner:String!, $name:String!, $endCursor:String) {
  repository(owner:$owner, name:$name) {
    pullRequests(first:50, after:$endCursor, states:[MERGED, CLOSED, OPEN],
                 orderBy:{field:CREATED_AT, direction:DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        number title createdAt mergedAt closedAt isDraft
        author { login }
        additions deletions changedFiles
        baseRefName headRefName
        labels(first:20) { nodes { name } }
        body
        commits(first:1) { nodes { commit { committedDate } } }
        reviews(first:50) { nodes { state submittedAt author { login } } }
        reviewThreads { totalCount }
        files(first:100) { nodes { path additions deletions } }
      }
    }
  }
}'
```

## Derived fields

| Field | Derivation |
|---|---|
| `cycle_time_h` | `mergedAt − createdAt` (hours). Merged PRs only. |
| `coding_time_h` | `createdAt − commits[0].committedDate` |
| `time_to_first_review_h` | `min(reviews.submittedAt) − createdAt`, excluding the author |
| `rework_rounds` | Count of `reviews.state == CHANGES_REQUESTED` |
| `size_lines` | `additions + deletions`, excluding files matching `*.lock`, `package-lock.json`, `yarn.lock`, `poetry.lock`, `dist/**`, `**/generated/**` |
| `claude_checkbox` | Parse `body` for the PR template section: `None` / `Some` / `Most` / missing |
| `assisted` | `claude_checkbox in (Some, Most)` OR any commit carries the trailer (below) |
| `period` | `baseline` / `ramp` (weeks 1–2 of the dev's cohort) / `pilot` |
| `cohort` | From the pilot roster (A / B), joined by `author.login` |
| `dev_id` | Pseudonym from the roster (`<dev-01>`) |

## Commits and trailers

The trailer text must **exactly** match managed `attribution.commit` ([managed-settings.md](../02-security-baseline/managed-settings.md#target-policy-v01)):

```bash
# All commits on merged PR #N, with their messages
gh api repos/<org>/<repo>/pulls/<N>/commits --paginate \
  --jq '.[] | {sha, date: .commit.author.date, msg: .commit.message}'

# Flag commits with the Claude trailer
#   grep -i 'Co-Authored-By: Claude Code <noreply@anthropic.com>'
```

Fields: `pr_number`, `sha`, `date`, `has_claude_trailer`.

## Check runs (first-run CI pass)

```bash
# Check suites for the PR head at the time of first push. Use the first commit's SHA on the PR.
gh api repos/<org>/<repo>/commits/<first_sha>/check-runs \
  --jq '.check_runs[] | {name, conclusion, started_at}'
```

`first_run_pass` = every required check's `conclusion == success` on the **first** commit pushed to the PR.

## Reverts and follow-up fixes

| Signal | Method |
|---|---|
| **Revert** | A later PR or commit whose title or message matches `^Revert "` and references the original PR number or merge SHA, within 30 days |
| **Follow-up fix** | A later merged PR (≤ 14 days) that touches ≥ 1 of the same files **and** has a `bug`/`fix` label or `fix` in its title |

```bash
gh pr list -R <org>/<repo> --state merged --search 'Revert in:title merged:>=<date>' \
  --json number,title,mergedAt,body
```

## Code scanning alerts

```bash
gh api repos/<org>/<repo>/code-scanning/alerts --paginate \
  --jq '.[] | {number, rule: .rule.id, severity: .rule.security_severity_level, created_at, state, ref: .most_recent_instance.ref}'
```

Attribute alerts to PRs using `most_recent_instance.ref` (`refs/pull/<N>/merge`) or the commit that introduced them.

## Output schema

One row per PR, saved as CSV in the secure analysis store:

| Column | Type |
|---|---|
| `repo`, `pr_number`, `dev_id`, `cohort`, `period` | string |
| `created_at`, `merged_at` | timestamp (UTC) |
| `cycle_time_h`, `coding_time_h`, `time_to_first_review_h` | float |
| `size_lines`, `changed_files`, `rework_rounds`, `review_threads` | int |
| `first_run_pass` | bool |
| `reverted_30d`, `followup_fix_14d` | bool |
| `new_alerts` | int |
| `claude_checkbox` | enum |
| `has_claude_trailer`, `assisted` | bool |

## Related
- [Measurement framework](measurement-framework.md) · [Phase 2 report template](../../reports/phase2-pilot-report.md)
