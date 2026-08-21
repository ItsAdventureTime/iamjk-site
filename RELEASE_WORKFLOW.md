# Normal update and release workflow

**Reviewed:** 2026-08-22
**Scope:** source, content, dependencies, configuration, documentation, GitHub, and VPS releases

This is the normal workflow after every project update. Keep the code change,
the user-facing guide, the validation evidence, the signed local commit, and
the HTTPS GitHub release in the same reviewable change.

## 1. Update the project and its guides

1. Inspect the current working tree before editing.
2. Make the smallest coherent source or configuration change.
3. Update the relevant README, design, security, deployment, or workflow guide
   when behavior, commands, dependencies, or operational expectations change.
4. Keep secrets, `.env*` files, VPS routing configuration, private keys,
   generated output, dependency directories, and agent metadata out of Git.

## 2. Run the project gate in Docker Sandbox

Project execution belongs in the deterministic Docker Sandbox, not on the macOS
host:

```bash
jk-sbx-project ensure
jk-sbx-project exec ./scripts/sandbox-node.sh node --version
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm pnpm --version
jk-sbx-project exec ./scripts/sandbox-node.sh --with-pnpm sh -c 'CI=true pnpm install --frozen-lockfile && CI=true pnpm run check && CI=true pnpm test'
jk-sbx-project exec git diff --check
```

`scripts/sandbox-node.sh` runs the project commands in the pinned official
`node:24.18.0-alpine` image inside the Sandbox’s private Docker daemon. This
keeps the project runtime independent from the Sandbox agent shell’s Node
version and keeps `node_modules` temporary.

The deployment helper asks Buildx for the VPS platform. `Containerfile` builds
the Astro bundle on the sandbox’s native platform and assembles the requested
Node runtime image without executing target-architecture commands, so an ARM
Docker Sandbox can produce the VPS image without a remote build.
The helper uses the same pinned runtime wrapper, so the Sandbox agent shell’s
Node version is not a project-runtime prerequisite.

For UI changes, also run the browser smoke check at desktop and narrow mobile
widths. Confirm overflow, focus, active navigation, loading/error states,
reduced motion, and the primary interaction path. Do not use local Podman for
this gate. Podman remains the VPS production runtime and Quadlet service model.

## 3. Confirm HTTPS GitHub authentication

Use GitHub CLI for GitHub authentication and remote inspection. Keep the remote
on HTTPS and never switch it to an SSH URL:

```bash
gh auth status --hostname github.com
gh auth setup-git --hostname github.com
gh repo view ItsAdventureTime/iamjk-site --json nameWithOwner,defaultBranchRef
git remote set-url origin https://github.com/ItsAdventureTime/iamjk-site.git
git status --short --branch
```

The expected authentication status includes `Git operations protocol: https`.
Do not print or copy the token. Do not use SSH keys, passkeys, or an SSH remote
for GitHub transport.

`gh auth setup-git` configures GitHub CLI as Git’s credential helper. GitHub CLI
does not replace the local Git index or commit-object creation, so a literal
`gh`-only local commit is not technically available. The safe boundary is:
Git creates the local commit; `gh` authenticates every GitHub-facing operation;
the HTTPS remote publishes the signed commit.

## 4. Create and verify a signed local commit

Stage only the reviewed files, then sign the commit with the approved local
signer:

```bash
git add <reviewed-files>
git diff --cached --check
git commit -S -m "Describe the update"
git verify-commit HEAD
git show --show-signature --format=fuller --stat HEAD
```

Do not continue when `git verify-commit HEAD` fails or the signature is not
verified. Do not bypass signing, paste private key material into a command, or
switch to an unapproved SSH signer. GitHub supports GPG, SSH, and S/MIME commit
signatures; this project’s HTTPS transport requirement is separate from the
cryptographic signing method.

### Current signing readiness

As of 2026-08-22, this workspace has an SSH-based 1Password signer configured
but no local GPG or S/MIME signer. Because the project norm excludes SSH keys
for this workflow, signed publishing is blocked until an approved non-SSH signer
is configured and its public key is registered with the matching GitHub account.
Never create an unsigned release to work around this state.

## 5. Publish and verify the remote commit

After the signed local commit is verified:

```bash
git push origin main
gh api repos/ItsAdventureTime/iamjk-site/commits/main --jq '{sha: .sha, message: .commit.message, verified: .commit.verification.verified, reason: .commit.verification.reason}'
```

The remote verification result must report `verified: true` with an expected
verification reason. Stop if the remote SHA, message, or signature does not
match the local release. Do not use `gh repo sync` for this workflow; it syncs
repositories and is not the normal way to publish the current local commit.

## 6. Deploy only after Git and validation pass

The VPS is updated with the existing helper after the local gate and signed
GitHub release are complete:

```bash
./scripts/deploy-vps.sh --init  # first setup only
./scripts/deploy-vps.sh
```

The helper validates and builds the target-platform Node image in Docker
Sandbox, transfers one saved image archive, lets VPS Podman load the image,
restarts the rootless Quadlet, validates and gracefully reloads Caddy, checks
the public endpoint, and only then runs the VPS-side CDN purge. The VPS does
not build or compile the application. Do not manually restart the service or
purge the CDN during a normal update.

## Official references

- [GitHub CLI authentication](https://cli.github.com/manual/gh_auth)
- [GitHub CLI Git credential setup](https://cli.github.com/manual/gh_auth_setup-git)
- [GitHub CLI environment and token handling](https://cli.github.com/manual/gh_help_environment)
- [Docker Sandboxes](https://docs.docker.com/ai/sandboxes/)
- [Docker multi-platform builds](https://docs.docker.com/build/building/multi-platform/)
- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [Docker Official Node image](https://hub.docker.com/_/node)
- [GitHub commit signing](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)
- [Git database commits API](https://docs.github.com/en/rest/git/commits)
- [GitHub secret scanning and push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection)
