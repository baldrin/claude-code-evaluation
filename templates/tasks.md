<!-- Template for TASKS.md in the records repo (see templates/README.md). Tasks name real people and teams, so the list lives there, not in the docs repo. IDs such as ENV-001 or ADR-013 refer to the docs repo. Replace each <placeholder> with a name as you go, and delete tasks that don't apply. -->

# Tasks

My working list for the Claude Code evaluation: one line per task, grouped by what happens next.

**Format:** `- [ ] What needs doing · owner · due YYYY-MM-DD · → ID`

- Only the task text is required. Add the other fields when they help.
- **Owner:** leave it off for your own tasks. Name the person or team when someone else does the work.
- **→ ID:** what the task unblocks: a test (`ENV-001`), decision (`ADR-013`), risk (`R-11`), or gate (`G1`).
- **Asking someone?** Once you've asked, move the task to **Waiting on** and add `asked YYYY-MM-DD · follow up YYYY-MM-DD`.
- **Done?** Tick it, add `· done YYYY-MM-DD`, and move it under this week's heading in **Done**.

**Every morning (2 minutes):** put anything new in the Inbox, then check **Waiting on** for follow-ups due today.

**Every Friday (10 minutes):**
1. Sort the Inbox into the other groups.
2. Chase every **Waiting on** item past its follow-up date.
3. Move anything from **Next** that's now urgent up to **Now**.
4. Copy this week's **Done** into the weekly status.

## 🔁 Recurring

- **Daily:** commit and push the records repo
- **Daily (Phase 2):** triage the support channel. Check per-user spend and runaway alerts.
- **Monday (Phase 2):** weekly cost review
- **Friday:** task review (above) and the weekly status

## 📥 Inbox

<!-- Add new tasks here as they come up, one per line. Sort them on Friday. -->

## ▶️ Now

- [ ] Create the records repo and add the starter files
- [ ] Run the tracker's self-test in Edge on the work machine (records folder, opened from disk) · → ADR-019
- [ ] Ask `<VDI team>` for a test VDI with nested virtualization, Hyper-V, and Docker Desktop Business · → ENV-001, ENV-002
- [ ] Ask `<network team>`: full or split VPN tunnel? Does the Foundry private endpoint support the Claude deployments? · → NET-015, NET-016
- [ ] Ask `<Guardicore team>` how container traffic appears on the host, and whether it can be restricted there · → ENV-021
- [ ] Ask `<Nexus owner>` for the proxy repos (PyPI, Maven Central and the Gradle plugin portal, NuGet) and the raw repos (Claude Code package, VSIX files, wrapper distributions) · → ENV-017, ENV-018
- [ ] Ask `<Entra admin>` for the pilot Entra group and the custom Foundry role assignment · → IDN-001
- [ ] Ask `<Foundry admin>` for the Foundry resource with pinned Claude deployments (Opus, Sonnet, Haiku), Hosted on Azure, API keys disabled · → IDN-002, ADR-009
- [ ] Ask `<GitHub admin>` for a test repo, a token scoped to it, and rulesets on main · → IDN-006
- [ ] Confirm the Docker Desktop Business licences cover the test VDIs, and later the pilot · → R-11
- [ ] Fill in the key dates in the charter timeline and the README gantt
- [ ] Agree the «proposed» thresholds in the success criteria with stakeholders · → G0
- [ ] Confirm WebFetch stays off as well as WebSearch · → ADR-016

## ⏳ Waiting on

<!-- Example: - [ ] Test VDI with nested virtualization · <VDI team> · asked 2026-10-20 · follow up 2026-10-23 · → ENV-001 -->

## 🔜 Next

- [ ] Get G0 sign-off on the charter, success criteria, and AUP · `<sponsor>`, `<Security>` · → G0
- [ ] Let developers and their managers know the evaluation is coming. Ask managers to start thinking about pilot candidates.
- [ ] Decide the OpenTelemetry backend · → ADR-007
- [ ] Decide the default permission mode · → ADR-008
- [ ] Decide the Foundry hosting option with Security and Legal · → ADR-009, DATA-001
- [ ] Decide git credentials vs. sandbox credential protection · → ADR-010
- [ ] Decide on the Claude apps gateway (Phase 1 week 3) · → ADR-013
- [ ] Find an internet-connected host for the portable network re-run (Phase 1 week 4) · → NET-014
- [ ] Ask `<desktop team>` to check the PC prerequisites for the production target · → ENV-022
- [ ] Book the G1 go/no-go review for the end of Phase 1 week 4 · `<Security>`, `<sponsor>` · → G1

## 💤 Later

- [ ] Ask `<engineering managers>` to pick 15–20 pilot developers and split them into two cohorts
- [ ] Classify each pilot repo by capability tier · → ENV-019
- [ ] Ask `<GitHub admin>` to set up every pilot repo: PR template with the Claude checkbox, secret scanning and push protection, rulesets on main
- [ ] Size the Foundry TPM quotas for 20 users · `<Foundry admin>` · → COST-007
- [ ] Set up the Azure budget and alerts · → COST-006
- [ ] Get the acceptable use policy approved · `<Security>`, `<HR/Legal>`
- [ ] Create the support channel and write the support runbook · → OPS-006
- [ ] Schedule the developer briefing, the 90-minute training, and office hours
- [ ] Work through the rest of the pilot runbook's entry criteria (`docs/07-phase2-pilot/pilot-runbook.md`)

## ✅ Done

### Week of YYYY-MM-DD

- [x] Kickoff meeting · done YYYY-MM-DD
