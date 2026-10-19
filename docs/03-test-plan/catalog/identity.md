---
title: "Catalog: IDN, identity and access"
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 1
---

# IDN: Identity and access

[🏠 Home](../../../README.md) › [Test strategy](../test-strategy.md) › IDN

These tests cover least-privilege identity for Microsoft Foundry and GitHub, and check that credentials stay out of the agent's reach. Reference: [identity-and-access.md](../../01-architecture/identity-and-access.md), [Foundry docs](https://code.claude.com/docs/en/microsoft-foundry).

## Summary

| ID | Test | Pri | Controls | Result |
|---|---|---|---|---|
| [IDN-001](#idn-001) | Foundry auth with Entra ID works in the container | P0 | CTL-16 | ⏳ |
| [IDN-002](#idn-002) | API-key auth disabled on Foundry | P0 | CTL-16 | ⏳ |
| [IDN-003](#idn-003) | Foundry bearer token: lifetime and refresh | P1 | CTL-16 | ⏳ |
| [IDN-004](#idn-004) | Minimal custom RBAC role suffices | P0 | CTL-16 | ⏳ |
| [IDN-005](#idn-005) | Per-user identity in Azure logs | P0 | CTL-16 | ⏳ |
| [IDN-006](#idn-006) | GitHub token can't reach any other repo | P0 | CTL-17 | ⏳ |
| [IDN-007](#idn-007) | Branch protection blocks direct pushes to main | P0 | CTL-17 | ⏳ |
| [IDN-008](#idn-008) | Claude can't read Azure/GitHub/Foundry credentials | P0 | CTL-07, CTL-11 | ⏳ |
| [IDN-009](#idn-009) | Token expiry mid-session behaves gracefully | P1 | CTL-16 | ⏳ |
| [IDN-010](#idn-010) | GitHub token can't change workflows/secrets/settings | P1 | CTL-17 | ⏳ |
| [IDN-011](#idn-011) | Offboarding revokes access within target time | P1 | CTL-23 | ⏳ |
| [IDN-012](#idn-012) | `/status` reports Microsoft Foundry | P1 | CTL-18 | ⏳ |
| [IDN-013](#idn-013) | Signed commits (if required) | P2 | CTL-17 | ⏳ |
| [IDN-014](#idn-014) | Gateway sign-in with Entra; only a short-lived token in the container | P0 | CTL-24, CTL-16 | ⏳ |
| [IDN-015](#idn-015) | Only the gateway's managed identity can call Foundry | P1 | CTL-24, CTL-16 | ⏳ |
| [IDN-016](#idn-016) | Nexus access from the container is read-only | P1 | CTL-25 | ⏳ |

---

<a id="idn-001"></a>
### IDN-001 · Foundry auth with Entra ID works in the container

**Priority** P0 · **Controls** CTL-16 · **Decision** [ADR-006](../../../logs/decision-log.md#adr-006)

**Steps.**
1. With `ANTHROPIC_FOUNDRY_API_KEY` and `ANTHROPIC_FOUNDRY_AUTH_TOKEN` unset, run `az login --use-device-code` in the container (device code avoids a browser in the container).
2. Start Claude Code and send a prompt.
3. Record where the token cache lives (`~/.azure/`) and how long the session works without re-login.

**Expected.** Requests succeed using the developer's identity. No shared secret is involved.

**Result.** ⏳ · `evidence/IDN-001/`

<a id="idn-002"></a>
### IDN-002 · API-key auth is disabled on the Foundry resource

**Priority** P0 · **Controls** CTL-16 · **Risks** R-08

**Steps.** Confirm `disableLocalAuth: true` on the Foundry resource and the Azure Policy assignment that enforces it ([ADR-006](../../../logs/decision-log.md#adr-006)). As an admin, call the endpoint with a key (`api-key` header). Try to create a resource without the setting. In the container, confirm `ANTHROPIC_FOUNDRY_API_KEY` isn't set anywhere (environment, settings files).

**Expected.** Key calls are rejected with 401 or 403 [verify that Claude deployments honor `disableLocalAuth`]. The policy blocks non-compliant resources. Only Entra tokens work.

**Result.** ⏳ · `evidence/IDN-002/`

<a id="idn-003"></a>
### IDN-003 · Foundry auth with bearer token: lifetime and refresh

**Priority** P1 · **Controls** CTL-16

**Steps.** Mint an Entra access token outside the container (`az account get-access-token --resource https://cognitiveservices.azure.com`) and pass it in as `ANTHROPIC_FOUNDRY_AUTH_TOKEN`. Run a session past the token's expiry.

**Expected.** Record the failure mode at expiry and whether there's a refresh path. It's likely to need a restart, so it suits CI better than interactive use.

**Result.** ⏳ · `evidence/IDN-003/`

<a id="idn-004"></a>
### IDN-004 · Minimal custom RBAC role is sufficient

**Priority** P0 · **Controls** CTL-16

**Steps.** Assign only the custom role (`Microsoft.CognitiveServices/accounts/providers/*` data actions) via the pilot group. Run prompts on all deployments. Then confirm the identity **can't** list keys, change deployments, or read other resources (`az cognitiveservices account keys list …` should fail).

**Expected.** Inference works. Management-plane actions are denied.

**Result.** ⏳ · `evidence/IDN-004/`

<a id="idn-005"></a>
### IDN-005 · Per-user identity appears in Azure logs

**Priority** P0 · **Controls** CTL-16

**Steps.** Enable Foundry diagnostic settings to Log Analytics. Run prompts as two different test identities. Query the logs for caller identity, deployment, and token counts.

**Expected.** Each request is attributable to a user (object ID / UPN). This is the authoritative usage record for cost-by-user ([COST-001](cost.md#cost-001)).

**Result.** ⏳ · `evidence/IDN-005/`

<a id="idn-006"></a>
### IDN-006 · GitHub token cannot reach any other repo

**Priority** P0 · **Controls** CTL-17 · **Risks** R-06

**Steps.** With the dev's fine-grained token: `gh repo list <org>`, `gh api repos/<org>/claude-eval-forbidden`, `git ls-remote https://github.com/<org>/claude-eval-forbidden`, and `gh search code` in the org.

**Expected.** Only `<org>/<repo>` is visible. Everything else returns 404 or 403.

**Result.** ⏳ · `evidence/IDN-006/`

<a id="idn-007"></a>
### IDN-007 · Branch protection blocks direct pushes to main

**Priority** P0 · **Controls** CTL-17 · **Risks** R-17

**Steps.** Ask Claude to commit on `main` and push (approve at the prompt). Try a force-push to a feature branch. Try deleting a branch. Try merging your own PR without review.

**Expected.** Push to `main` rejected by the ruleset. Force-push denied (deny rule + ruleset). Merging needs a human review.

**Result.** ⏳ · `evidence/IDN-007/`

<a id="idn-008"></a>
### IDN-008 · Claude cannot read Azure, GitHub, or Foundry credentials

**Priority** P0 · **Controls** CTL-07, CTL-11 · **Risks** R-08

**Steps.**
1. Through every tool path, try to read `~/.azure/*`, `~/.config/gh/hosts.yml`, `~/.git-credentials`, and the git credential helper output (`git credential fill`). Use Read, Grep, Bash `cat`, Bash `python`, and a subagent.
2. **Then check that git operations still work** when Claude runs `git push` (sandboxed Bash, with the gh credential helper).

**Expected.** No credential content is revealed through any path. Record the push behavior, then choose the approach for the [credential tension](../../02-security-baseline/sandbox-policy.md#filesystem-rules) and record it in an ADR.

**Result.** ⏳ · `evidence/IDN-008/`

<a id="idn-009"></a>
### IDN-009 · Token expiry mid-session behaves gracefully

**Priority** P1 · **Controls** CTL-16

**Steps.** Revoke the Entra session (or wait for expiry with no refresh token) during a long session. Note the error and the recovery steps (`az login`, then resume).

**Expected.** A clear error, no data loss, and `/resume` continues after re-auth.

**Result.** ⏳ · `evidence/IDN-009/`

<a id="idn-010"></a>
### IDN-010 · GitHub token cannot change workflows, secrets, or settings

**Priority** P1 · **Controls** CTL-17

**Steps.** With the token: push a commit that changes `.github/workflows/ci.yml` (from the terminal, outside Claude). Run `gh secret set X`, `gh api -X PATCH repos/<org>/<repo>` (settings), and `gh workflow run`.

**Expected.** Workflow-file push rejected (the token lacks the Workflows permission). Secret, settings, and workflow-dispatch calls are denied.

**Result.** ⏳ · `evidence/IDN-010/`

<a id="idn-011"></a>
### IDN-011 · Offboarding revokes access within the target time

**Priority** P1 · **Controls** CTL-23

**Steps.** Run the offboarding steps for a test user ([identity lifecycle](../../01-architecture/identity-and-access.md#lifecycle-onboarding-rotation-offboarding)) and time each one. Confirm that Foundry calls fail, GitHub calls fail, and OTel shows no further activity.

**Expected.** Full revocation in « < 15 min ».

**Result.** ⏳ · `evidence/IDN-011/`

<a id="idn-012"></a>
### IDN-012 · `/status` reports Microsoft Foundry and the resource

**Priority** P1 · **Controls** CTL-18

**Steps.** `/status`. Also confirm `/login` and `/logout` behavior (`/logout` is unavailable on Foundry, per the docs).

**Expected.** Provider line shows "Microsoft Foundry" and `<foundry-resource>`.

**Result.** ⏳ · `evidence/IDN-012/`

<a id="idn-013"></a>
### IDN-013 · Signed commits work if required

**Priority** P2 · **Controls** CTL-17

**Steps.** If the org requires signed commits, configure SSH or gpg signing **without** exposing the signing key to Claude (sandbox denyRead), or use GitHub's web-flow signing via PR merge.

**Expected.** Commits verified, or ⏭ N/A.

**Result.** ⏳ · `evidence/IDN-013/`

<a id="idn-014"></a>
### IDN-014 · Gateway sign-in with Entra ID; container holds only a short-lived gateway token

**Priority** P0 · **Controls** CTL-24, CTL-16 · **Risks** R-08

> [!NOTE]
> Applies once the Claude apps gateway is in place ([ADR-013](../../../logs/decision-log.md#adr-013)). Until then, run it against a test gateway or mark it ⏭ with the reason.

**Steps.** With the force-login keys in the policy, start Claude Code and run `/login`. Approve the device code in the browser with Entra (MFA and Conditional Access apply). Compare the TLS fingerprint with the published one. `/status` shows the gateway. Check `~/.claude` for the stored credential and confirm the container has no `~/.azure` or other Azure token. Leave the session past `ttl_hours` (silent refresh). Disable the test user in Entra.

**Expected.** Sign-in works through Entra. The container holds only the gateway session token. The session refreshes silently. A disabled user loses access within `ttl_hours`.

**Result.** ⏳ · `evidence/IDN-014/`

<a id="idn-015"></a>
### IDN-015 · Only the gateway's managed identity can call Foundry

**Priority** P1 · **Controls** CTL-24, CTL-16 · **Risks** R-08, R-24

> [!NOTE]
> Applies once the Claude apps gateway is in place ([ADR-013](../../../logs/decision-log.md#adr-013)). Until then, run it against a test gateway or mark it ⏭ with the reason.

**Steps.** Review the Foundry resource's access control: only the gateway's managed identity has the invoke role, and the developer group has none. From an admin workstation, call Foundry with a developer's Entra token.

**Expected.** The developer call returns 403. Only the gateway can invoke models.

**Result.** ⏳ · `evidence/IDN-015/`

<a id="idn-016"></a>
### IDN-016 · Container access to Nexus is read-only; no publish credentials

**Priority** P1 · **Controls** CTL-25 · **Risks** R-06, R-08

**Steps.** Look for Nexus credentials in the image and container (`pip.conf`, Maven `settings.xml`, `NuGet.Config`, `~/.npmrc`). Try to publish to Nexus hosted repositories with `twine upload`, `mvn deploy`, `dotnet nuget push`, and `npm publish`.

**Expected.** Access is anonymous read or a read-only token. Every publish is refused. Any token is hidden from Claude ([PERM-002](permissions.md#perm-002), [SBX-009](sandbox.md#sbx-009)).

**Result.** ⏳ · `evidence/IDN-016/`
