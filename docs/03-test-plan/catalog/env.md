---
title: "Catalog: ENV, environment feasibility and hardening"
status: Draft
owner: <evaluation-lead>
last_updated: 2026-10-19
version: 0.2
phase: 1
---

# ENV: Environment feasibility and hardening

[🏠 Home](../../../README.md) › [Test strategy](../test-strategy.md) › ENV

These tests check that the Windows VDI → Hyper-V → Docker Desktop → dev container stack can run Claude Code, and that it's hardened. Run them first. **ENV-001 and ENV-006 can change the architecture.**

## Summary

| ID | Test | Pri | Controls | Result |
|---|---|---|---|---|
| [ENV-001](#env-001) | VDI supports nested virtualization and Hyper-V | P0 | — | ⏳ |
| [ENV-002](#env-002) | Docker Desktop on the Hyper-V backend, settings locked | P0 | CTL-03 | ⏳ |
| [ENV-003](#env-003) | Only the IT-built image from the controlled registry runs | P0 | CTL-02 | ⏳ |
| [ENV-004](#env-004) | Container runs as non-root without sudo | P0 | CTL-03 | ⏳ |
| [ENV-005](#env-005) | Claude Code version pinned; auto-updater off | P0 | CTL-02, CTL-18 | ⏳ |
| [ENV-006](#env-006) | Built-in sandbox works inside the container | P0 | CTL-09 | ⏳ |
| [ENV-007](#env-007) | Native Windows install is blocked | P0 | CTL-01 | ⏳ |
| [ENV-008](#env-008) | Windows managed-settings backstop is present | P1 | CTL-01 | ⏳ |
| [ENV-009](#env-009) | VS Code attaches; Claude Code extension runs in the container | P0 | CTL-01 | ⏳ |
| [ENV-010](#env-010) | Developers can't launch privileged or host-mounting containers | P0 | CTL-03 | ⏳ |
| [ENV-011](#env-011) | No privileged mode, no docker.sock, NET_ADMIN dropped | P0 | CTL-03, CTL-04 | ⏳ |
| [ENV-012](#env-012) | Only the workspace and ~/.claude persist | P1 | CTL-03 | ⏳ |
| [ENV-013](#env-013) | Container performance vs. baseline | P2 | — | ⏳ |
| [ENV-014](#env-014) | `claude doctor` passes | P1 | — | ⏳ |
| [ENV-015](#env-015) | Image rebuilds reproducibly | P2 | CTL-02 | ⏳ |
| [ENV-016](#env-016) | Image installs pinned Claude Code from Nexus only | P0 | CTL-02, CTL-25, CTL-18 | ⏳ |
| [ENV-017](#env-017) | Package managers resolve only through Nexus | P1 | CTL-25, CTL-04 | ⏳ |
| [ENV-018](#env-018) | VS Code Server and extensions work offline | P1 | CTL-25, CTL-02 | ⏳ |
| [ENV-019](#env-019) | Repo .NET/VB.NET capability tier classified | P1 | CTL-29 | ⏳ |
| [ENV-020](#env-020) | Shared-folder workflow for Windows-only repos | P1 | CTL-03, CTL-29 | ⏳ |
| [ENV-021](#env-021) | Guardicore restricts container traffic at the host [verify] | P1 | CTL-27 | ⏳ |
| [ENV-022](#env-022) | PC prerequisites checklist | P1 | CTL-01, CTL-03 | ⏳ |

---

<a id="env-001"></a>
### ENV-001 · VDI supports nested virtualization and Hyper-V

**Priority** P0 · **Phase** 1 · **Controls** — · **Risks** R-02 · **Docs** [Microsoft: enable Hyper-V](https://learn.microsoft.com/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v), [nested virtualization](https://learn.microsoft.com/virtualization/hyper-v-on-windows/user-guide/nested-virtualization)

**Objective.** Prove the VDI can run Hyper-V. The VDI is itself a VM, so the VDI platform must expose virtualization extensions to it (nested virtualization).

**Steps.**
1. Ask the VDI platform team how the pool exposes nested virtualization (for example, a nested-capable Azure VM size, or `Set-VMProcessor -ExposeVirtualizationExtensions $true` on Hyper-V hosts, or "Expose hardware-assisted virtualization" on VMware). Record the pool or SKU.
2. On the VDI as admin: `systeminfo`. Under "Hyper-V Requirements", either every item is "Yes", or it says "A hypervisor has been detected".
3. `Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All`. Enable it if needed (`Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All`) and reboot.
4. After Docker Desktop is installed ([ENV-002](#env-002)), Hyper-V Manager (or `Get-VM` as admin) shows the `DockerDesktopVM` running.

**Expected.** Hyper-V is enabled and the Docker Desktop VM boots. No "virtualization not enabled" errors.

**Evidence.** `systeminfo` excerpt, the feature state, a `Get-VM` screenshot, the VDI pool/SKU name.

**Result.** ⏳ · `evidence/ENV-001/`

> [!WARNING]
> If this fails, stop. The alternatives are Hyper-V Linux VMs on central hosts (reached by Remote-SSH), a Linux VDI, or a cloud dev box. Each changes the architecture. Raise a Critical finding and an ADR.

<a id="env-002"></a>
### ENV-002 · Docker Desktop on the Hyper-V backend, with settings locked

**Priority** P0 · **Phase** 1 · **Controls** CTL-03 · **Risks** R-01, R-11 · **Decision** [ADR-005](../../../logs/decision-log.md#adr-005) · **Config** [Docker Desktop configuration](../../01-architecture/reference-architecture.md#docker-desktop-configuration-target)

**Objective.** Docker Desktop runs on the Hyper-V backend, and a developer can't switch it to WSL 2 or loosen its security settings.

**Steps.**
1. Confirm WSL is **disabled** on the VDI: `Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux`, and the same for `VirtualMachinePlatform`.
2. Install Docker Desktop `<version>` (Business) with the Hyper-V backend (installer option `--backend=hyper-v` [verify]).
3. Deploy `C:\ProgramData\DockerDesktop\admin-settings.json` and sign-in enforcement (`allowedOrgs`) through the VDI image or Intune.
4. As a **standard developer** account: open Settings. "Use the WSL 2 based engine" is unchecked and locked. Enhanced Container Isolation is on and locked. File sharing lists only the policy folder.
5. `docker info`: record the server version, the OS (Docker Desktop / LinuxKit), and the runtimes (`sysbox-runc` with ECI).
6. Try to change each locked setting from the UI, and by editing the user's `settings-store.json`.

**Expected.** The Hyper-V backend is in use. Locked settings can't be changed by the developer. `hello-world` from the internal registry runs.

**Evidence.** Settings screenshots, `docker info`, the feature states, the result of the edit attempt.

**Result.** ⏳ · `evidence/ENV-002/`

<a id="env-003"></a>
### ENV-003 · Only the IT-built image from the controlled registry runs

**Priority** P0 · **Phase** 1 · **Controls** CTL-02 · **Risks** R-20, R-01

**Objective.** Developers start the approved image (by digest), not arbitrary images.

**Steps.**
1. Confirm the dev container config references `<registry>/claude-dev@sha256:<digest>`.
2. As a developer, try `docker pull ubuntu:latest` (public registry) and `docker run` of an unapproved image.
3. Confirm the engine's registry allowlist or proxy blocks public registries.

**Expected.** The approved image runs. Public image pulls fail (registry blocked). Unapproved images can't be started (if the engine supports it), or the gap is documented under R-01.

**Evidence.** Pull and run outputs, engine settings screenshot.

**Result.** ⏳ · `evidence/ENV-003/`

<a id="env-004"></a>
### ENV-004 · Container runs as non-root without sudo

**Priority** P0 · **Phase** 1 · **Controls** CTL-03 · **Risks** R-04, R-08

**Steps.**
1. In the container: `id`, `sudo -n true`, `ls -l /etc/claude-code`, `touch /etc/claude-code/x`.
2. Check `remoteUser` in the dev container config.

**Expected.** UID is not 0. `sudo` is absent or denied. Writing under `/etc/claude-code` fails.

**Evidence.** Terminal log.

**Result.** ⏳ · `evidence/ENV-004/`

<a id="env-005"></a>
### ENV-005 · Claude Code version is pinned and the auto-updater is off

**Priority** P0 · **Phase** 1 · **Controls** CTL-02, CTL-18 · **Risks** R-19 · **Docs** [setup](https://code.claude.com/docs/en/setup), [env vars](https://code.claude.com/docs/en/env-vars)

**Steps.**
1. `claude --version` → `2.1.301`.
2. `echo $DISABLE_AUTOUPDATER` (from managed env). Run `/status` and `claude doctor`, and check the update channel / auto-update status.
3. Leave a session open for more than 1 hour, then restart. The version is unchanged.
4. Try `claude update` as the developer.

**Expected.** Version stays at 2.1.301. `claude update` fails, is a no-op, or is blocked by `requiredMaximumVersion` ([POL-010](policy.md#pol-010)). No traffic to `downloads.claude.ai` ([NET-003](network.md#net-003)).

**Evidence.** Version output, doctor output, update attempt.

**Result.** ⏳ · `evidence/ENV-005/`

<a id="env-006"></a>
### ENV-006 · Built-in sandbox (bubblewrap + socat) works inside the container

**Priority** P0 · **Phase** 1 · **Controls** CTL-09 · **Risks** R-16 · **Docs** [sandboxing](https://code.claude.com/docs/en/sandboxing)

**Objective.** Find out whether Claude Code's Linux sandbox can run inside our unprivileged container **without** `enableWeakerNestedSandbox`. This is architecture-critical.

**Steps.**
1. Confirm `bwrap --version` and `socat -V` exist in the image.
2. Start Claude Code with the managed sandbox policy (`enabled`, `failIfUnavailable: true`).
3. Run `/sandbox` and record the status.
4. Ask Claude to run `touch /tmp/ok && touch /etc/should-fail`.
5. Record the result with Enhanced Container Isolation **on** (the Sysbox runtime supports nested user namespaces, so bubblewrap may work without extra privileges [verify]) and, for comparison, off.
6. If it fails to start: record the exact error. Try in order:
   - (a) container security options that allow user namespaces (for example, a custom seccomp profile via `--security-opt`);
   - (b) `sandbox.enableWeakerNestedSandbox: true`, **in a test policy only**.

**Expected (target).** The sandbox is active with no weaker mode. The write to `/etc` is blocked.

**If not met.** ⚠️ or ❌ with a High finding. ADR on the chosen fallback. Update [sandbox-policy.md](../../02-security-baseline/sandbox-policy.md#running-inside-docker-nested-sandbox).

**Evidence.** `/sandbox` screenshot, error messages, the profile used.

**Result.** ⏳ · `evidence/ENV-006/`

<a id="env-007"></a>
### ENV-007 · Native Windows install of Claude Code is blocked on the VDI

**Priority** P0 · **Phase** 1 · **Controls** CTL-01 · **Risks** R-03

**Objective.** Developers can't run Claude Code directly on Windows, where there's no sandbox.

**Steps.**
1. As a standard VDI user, try `npm install -g @anthropic-ai/claude-code` (if Node exists), the native installer (`irm https://claude.ai/install.ps1 | iex`), and running a copied `claude.exe`. Also try `wsl --install`. WSL is disabled, so it must fail; otherwise there's a Linux route around the container.
2. Try installing the Claude Code VS Code extension in the **local** (Windows) VS Code window, not the dev container.

**Expected.** Install and run are blocked by AppLocker/Intune or a network policy, or the binary fails to execute. Any gap goes to the Windows backstop policy ([ENV-008](#env-008)).

**Evidence.** Blocked-execution event (AppLocker log), screenshots.

**Result.** ⏳ · `evidence/ENV-007/`

<a id="env-008"></a>
### ENV-008 · Windows managed-settings backstop is present

**Priority** P1 · **Phase** 1 · **Controls** CTL-01 · **Risks** R-03 · **Docs** [managed settings](https://code.claude.com/docs/en/managed-settings)

**Steps.**
1. Confirm `C:\Program Files\ClaudeCode\managed-settings.json` exists, is admin-owned, and isn't user-writable (`icacls`).
2. In an **isolated test VM** (not the pilot VDI), with AppLocker off, run native Claude Code and check `/status`. Try a Bash or Edit action.

**Expected.** The backstop policy is active. Tools are denied as specified in [managed-settings.md](../../02-security-baseline/managed-settings.md#windows-backstop-policy).

**Evidence.** `icacls` output, `/status`, denied action.

**Result.** ⏳ · `evidence/ENV-008/`

<a id="env-009"></a>
### ENV-009 · VS Code Dev Containers attaches and the Claude Code extension runs in the container

**Priority** P0 · **Phase** 1 · **Controls** CTL-01 · **Docs** [VS Code](https://code.claude.com/docs/en/vs-code), [devcontainer](https://code.claude.com/docs/en/devcontainer)

**Steps.**
1. Open the repo in VS Code → "Reopen in Container".
2. Install or enable the Claude Code extension and confirm it's listed under **"Dev Container: …" installed**, not "Local".
3. Open the Claude Code panel, run a prompt that edits a file, and check the diff view.
4. In the extension's integrated terminal, run `claude --version` and `/status`.

**Expected.** The extension runs on the remote (Linux) side. Managed policy is active (shown in `/status`). The diff/accept flow works.

**Evidence.** Extensions panel screenshot (remote section), `/status`.

**Result.** ⏳ · `evidence/ENV-009/`

<a id="env-010"></a>
### ENV-010 · Developers cannot launch privileged or host-mounting containers

**Priority** P0 · **Phase** 1 · **Controls** CTL-03 · **Risks** R-01

**Objective.** Measure the real exposure from container-engine access. This is the weakest boundary in the design.

**Steps.** As a **standard developer** account on the VDI:
1. `docker run --rm --privileged <approved-image> id`
2. `docker run --rm -v C:\:/host <approved-image> ls /host`
3. `docker run --rm -v /var/run/docker.sock:/var/run/docker.sock <approved-image> docker ps`
4. Start the approved image **without** the policy mount (`docker run` without `-v C:\ProgramData\ClaudeCodePolicy:/etc/claude-code:ro`), then run `claude` and `/status`.

**Expected (target).** With Enhanced Container Isolation, step 1's privileged container can't reach the Docker Desktop VM. Step 2 fails because `C:\` isn't an allowed file-sharing directory. Step 3 is blocked (ECI blocks `docker.sock` mounts). Step 4: the image's default config makes Claude Code unusable without policy. Options: the image entrypoint refuses to start Claude without `/etc/claude-code/managed-settings.json`, or the Foundry role is tied to a managed identity only available via the launcher [verify approach].

**If not met.** Document it precisely as a High finding under R-01, with a compensating control (VDI EDR alerting on `docker run` flags, a launcher script, monitoring).

**Evidence.** Each command and its result.

**Result.** ⏳ · `evidence/ENV-010/`

<a id="env-011"></a>
### ENV-011 · Container has no privileged mode, no docker.sock, and drops NET_ADMIN after firewall init

**Priority** P0 · **Phase** 1 · **Controls** CTL-03, CTL-04 · **Risks** R-01

**Steps.**
1. `docker inspect <container>`: check `Privileged`, `CapAdd`, `Mounts`, `SecurityOpt`.
2. Inside: `capsh --print` (or `grep Cap /proc/self/status`), `ls -l /var/run/docker.sock`, `iptables -L` (should fail without NET_ADMIN), `ip link add dummy0 type dummy`.

**Expected.** Not privileged. No docker.sock (ECI also blocks socket mounts). After init, the dev user has no NET_ADMIN/NET_RAW, so the firewall rules can't be changed.

**Evidence.** Inspect JSON (redacted), command outputs.

**Result.** ⏳ · `evidence/ENV-011/`

<a id="env-012"></a>
### ENV-012 · Only the workspace and ~/.claude volume persist; no host home mount

**Priority** P1 · **Phase** 1 · **Controls** CTL-03 · **Risks** R-08

**Steps.** `docker inspect` mounts. Inside: `ls /mnt`, `mount | grep -v overlay`. Try to bind-mount another Windows folder (for example, `C:\Users\<dev>`). Docker Desktop file sharing should refuse it.

**Expected.** Mounts are exactly `/workspace` (named volume, rw), the `~/.claude` volume (rw), and `/etc/claude-code` (bind mount of the policy folder, ro). No other Windows paths, no `~/.ssh`.

**Result.** ⏳ · `evidence/ENV-012/`

<a id="env-013"></a>
### ENV-013 · Measure container performance vs. baseline

**Priority** P2 · **Phase** 1 · **Risks** R-02

**Steps.** Time container cold start, VS Code attach, a representative build, and the test suite. Compare with the developer's usual environment. Note CPU and memory pressure on the VDI, and the memory assigned to the Docker Desktop VM. Bind mounts from Windows are slow on the Hyper-V backend, so compare a repo cloned into a container volume with a bind-mounted one.

**Expected.** Overhead acceptable to developers: target « < 20% » slower builds and « < 60 s » attach. The results feed the Phase 2 friction analysis.

**Result.** ⏳ · `evidence/ENV-013/`

<a id="env-014"></a>
### ENV-014 · `claude doctor` passes inside the container

**Priority** P1 · **Phase** 1 · **Docs** [troubleshooting](https://code.claude.com/docs/en/troubleshooting)

**Steps.** Run `claude doctor`. Record every warning.

**Expected.** No errors. Managed settings source shown. Warnings explained.

**Result.** ⏳ · `evidence/ENV-014/`

<a id="env-015"></a>
### ENV-015 · Image rebuilds reproducibly from pinned inputs

**Priority** P2 · **Phase** 1 · **Controls** CTL-02 · **Risks** R-19, R-20

**Steps.** Rebuild the image from the same inputs (pinned base digest, pinned Claude Code version, pinned packages). Compare the installed Claude Code version and package lists.

**Expected.** Same Claude Code version and toolchain versions. Differences are documented.

**Result.** ⏳ · `evidence/ENV-015/`

<a id="env-016"></a>
### ENV-016 · Image build installs the pinned Claude Code from Nexus; nothing downloads at runtime

**Priority** P0 · **Controls** CTL-02, CTL-25, CTL-18 · **Risks** R-19, R-20

**Steps.** Build the image on a build host whose egress is limited to Nexus and the base-image registry ([ADR-014](../../../logs/decision-log.md#adr-014)). Confirm in the build log that Claude Code comes only from `<nexus-host>` and that its checksum or package integrity is verified. In a running container: `claude --version` matches the pin. `ls -l "$(command -v claude)"` shows a root-owned binary the `dev` user can't write. `claude update` and `claude install` fail (`DISABLE_UPDATES`). Run a full session while watching egress for `downloads.claude.ai`, `registry.npmjs.org`, and `storage.googleapis.com`. As `dev`, try to install another version from Nexus.

**Expected.** The build succeeds with Nexus only. The binary is pinned and root-owned. No update path works, and nothing is downloaded at runtime. Another version either can't be fetched (the Nexus package is limited to the build account) or refuses to start because of the policy version range ([POL-010](policy.md#pol-010)).

**Result.** ⏳ · `evidence/ENV-016/`

<a id="env-017"></a>
### ENV-017 · Python, Java, and .NET package managers resolve only through Nexus

**Priority** P1 · **Controls** CTL-25, CTL-04 · **Risks** R-20, R-26

**Steps.** In each language image ([ADR-015](../../../logs/decision-log.md#adr-015)): `pip install requests` (and `uv pip install` if used), `mvn -q dependency:get -Dartifact=org.slf4j:slf4j-api:2.0.13`, `./mvnw -v`, `./gradlew --version` plus a build that pulls a plugin, and `dotnet restore` on a sample project. Then try direct sources: `pip install --index-url https://pypi.org/simple requests`, a `pom.xml` with a `<repository>` on `repo1.maven.org`, and a `nuget.config` that adds `nuget.org`. Run each through Claude (sandboxed Bash) and as a `!` command. Check TLS with the internal CA in every tool.

**Expected.** Installs from Nexus work inside and outside the sandbox. Direct sources fail at the firewall with an understandable error. Claude follows the managed CLAUDE.md ([POL-017](policy.md#pol-017)) and asks for a missing package rather than trying workarounds.

**Result.** ⏳ · `evidence/ENV-017/`

<a id="env-018"></a>
### ENV-018 · VS Code Server and extensions work in the offline container

**Priority** P1 · **Controls** CTL-25, CTL-02 · **Risks** R-29

**Steps.** With the VDI's VS Code version pinned, attach to the container with the firewall on. In the VS Code logs, confirm the server starts without a download attempt. Check that the baked-in extensions (Python, C# Dev Kit, Java, Claude Code) are installed and active, and that language servers or runtimes don't try to download on first use. Fallback: install a pinned VSIX from the Nexus raw repository and check its checksum. Upgrade VS Code on a test VDI and record what breaks.

**Expected.** Attach works offline and the extensions work. The VSIX fallback is documented. The rule tying the VDI's VS Code version to the image is written down, with the Claude Code extension inside the policy version range.

**Result.** ⏳ · `evidence/ENV-018/`

<a id="env-019"></a>
### ENV-019 · Each repo's .NET/VB.NET capability tier is classified and confirmed

**Priority** P1 · **Controls** CTL-29 · **Risks** R-28

**Steps.** For each pilot repo, in its first session, ask Claude to list the project files with their `TargetFramework(s)`, `UseWPF`, `UseWindowsForms`, and `ToolsVersion`, and to propose a tier ([ADR-017](../../../logs/decision-log.md#adr-017)). Confirm in the container. **Full:** `dotnet build` and `dotnet test` pass. **Compile-check:** `dotnet build` passes with `Microsoft.NETFramework.ReferenceAssemblies` or `EnableWindowsTargeting=true`, and tests can't run. **Edit-only:** the build fails as expected. Record the tier in the onboarding record and the measurement dataset.

**Expected.** Every pilot repo has a confirmed tier before its cohort starts.

**Result.** ⏳ · `evidence/ENV-019/`

<a id="env-020"></a>
### ENV-020 · Shared-folder workflow for Windows-only repos

**Priority** P1 · **Controls** CTL-03, CTL-29 · **Risks** R-25, R-28

**Steps.** For one compile-check or edit-only repo: add `C:\Dev` to Docker Desktop's `filesharingAllowedDirectories`, clone into `C:\Dev\<repo>`, and bind-mount it into the container. Have Claude edit a source file and a project file, then build and test in Visual Studio on Windows. Time file operations and builds against a named volume ([ENV-013](#env-013)). Try to mount any other Windows path.

**Expected.** The workflow works. Only `C:\Dev` can be shared. Build-file edits prompt ([PERM-019](permissions.md#perm-019)), and the developer reviews them before building on Windows. Performance is acceptable or the cost is recorded.

**Result.** ⏳ · `evidence/ENV-020/`

<a id="env-021"></a>
### ENV-021 · Guardicore sees and restricts container traffic at the host [verify]

**Priority** P1 · **Controls** CTL-27 · **Risks** R-23, R-06

**Steps.** With the Guardicore team, find which host process container connections appear under (expected: Docker Desktop's networking process [verify the name]). Apply a test rule: that process may reach only the gateway or Foundry private endpoint, Nexus, GitHub, the image registry, and Docker's sign-in hosts. From the container, try a blocked host. On the same host, use a browser and another app normally.

**Expected.** Container traffic is attributed to Docker Desktop and restricted. Other apps are unaffected, and Docker Desktop sign-in and licensing still work. Limitations are recorded: Guardicore can't see inside the container, so the container firewall stays the primary control.

**Result.** ⏳ · `evidence/ENV-021/`

<a id="env-022"></a>
### ENV-022 · PC prerequisites checklist

**Priority** P1 · **Controls** CTL-01, CTL-03 · **Risks** R-23, R-03

**Steps.** On a candidate PC (the optional PC track, [ADR-018](../../../logs/decision-log.md#adr-018)), check: a standard user with no local admin; a Windows edition with Hyper-V; virtualization enabled in the BIOS; a Docker Desktop Business licence; Docker Desktop admin settings pushed by MDM; full-disk encryption on; RAM against the [ENV-013](#env-013) sizing; the VPN client; the Guardicore agent; and the AppLocker/Intune block on native Claude Code.

**Expected.** Every item passes or has an owner and a date. Results feed the carry-over section of the Phase 1 report.

**Result.** ⏳ · `evidence/ENV-022/`
