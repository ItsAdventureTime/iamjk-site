# Security and privacy guide

**Reviewed:** 2026-08-08
**Scope:** public iamjk.site source, generated static output, and Git release workflow

The 2026-08-08 personal-context review informs the public copy. Only the
non-sensitive, intentionally shareable layer belongs here. The source profile
stays outside this repository.

## Public-content rules

iamjk.site is a personal website, not a contact database.

- Do not publish an email address, `mailto:` link, contact form, or address-like placeholder.
- Do not publish JK’s age or year of birth.
- Use “Philippines,” not a more precise city.
- Keep personal details limited to the content JK intentionally chose to share.
- Do not place credentials, API tokens, private keys, 1Password secrets, or VPS secrets in the repository.
- Keep contact copy online-first; visitors can look JK up without exposing an inbox.

## Local scan

Run the build and scan both source files and generated output:

```bash
pnpm run check
pnpm test
rg -n -i --hidden \
  --glob '!.git/**' \
  --glob '!node_modules/**' \
  --glob '!.pnpm-store/**' \
  --glob '!.astro/**' \
  --glob '!dist/**' \
  --glob '!.DS_Store' \
  'mailto:|[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}' .
rg -n -i \
  'mailto:|[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}' \
  dist
```

The repository scan should produce no email-address matches. The rendered-output
test separately rejects email-shaped strings and `mailto:` links in
`dist/index.html`. A clean result is a release check, not proof that arbitrary
personal data is impossible to add later.

## Git history

The scan above checks the current checkout and generated output. It does not
rewrite old Git history. If a real email address, credential, token, or private
key was ever committed:

1. stop publishing the affected branch;
2. rotate or revoke any credential immediately;
3. identify affected commits and remote copies;
4. choose history rewriting only after confirming the impact on collaborators and
   deployments.

Never treat deleting the current file as remediation for an exposed secret.

## GitHub protection

Enable GitHub Secret Protection and push protection for the repository when the
account and repository plan support them. GitHub’s push protection is designed to
block supported secrets before they reach the repository. It complements, but
does not replace, this project’s email/privacy scan.

Review any push-protection alert instead of bypassing it automatically. A real
credential must be rotated or revoked before the commit is republished.

GitHub CLI is available for authenticated repository operations. Confirm the
account before publishing, then use the normal signed Git commit flow:

```bash
gh auth status
gh repo view ItsAdventureTime/iamjk-site --json nameWithOwner,defaultBranchRef
git push origin main
```

`gh auth setup-git` configures GitHub CLI credentials for Git transport; it does
not create a cryptographic signature. Verification comes from the signed commit,
the registered SSH signing public key, and the matching GitHub author email. Keep
`commit.gpgsign=true` and the 1Password SSH signer configured.

## 1Password-signed Git

Private signing and authentication keys stay in the 1Password SSH agent. The
repository uses SSH commit signing through the 1Password signer; no private key
belongs in this checkout.

Check the effective local signing configuration without printing secrets:

```bash
git config --show-origin --get-regexp \
  '^(commit\.gpgsign|user\.signingkey|gpg\.format|gpg\.ssh\.program)$'
git log -1 --show-signature
```

GitHub can show a commit as verified only after the matching public key is
registered in the GitHub account’s **Signing keys** and the commit author email
matches the account. Do not copy private key material into the repository or
shell history.

## Deployment check

The canonical release path runs the build on macOS through Podman, uploads only
dist/ with rsync, then invokes the VPS-side bunny-purge script over SSH:

~~~bash
VPS_HOST=YOUR_VPS_HOST \
VPS_USER=jk \
VPS_PATH=/home/jk/iamjk-site \
./scripts/deploy-vps.sh
~~~

The helper runs the project checks before rsync. If diagnosing it manually, run
the source and generated-output privacy scan after the container build:

~~~bash
rg -n -i 'mailto:|[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}' dist
~~~

The final scan should return no matches. Caddy’s CSP must allow the compiled
same-origin Astro module while keeping inline event handlers disabled. See
`README.md` for the Podman, rsync, bunny-purge, Caddy, and VPS instructions.

## References

- GitHub push protection:
  https://docs.github.com/en/code-security/concepts/secret-security/push-protection
- GitHub secret scanning:
  https://docs.github.com/en/code-security/concepts/secret-security/about-alerts
- 1Password SSH commit signing:
  https://www.1password.dev/ssh/git-commit-signing
- 1Password SSH agent:
  https://www.1password.dev/ssh/agent
- Podman machine:
  https://docs.podman.io/en/latest/markdown/podman-machine.1.html
- Podman run:
  https://docs.podman.io/en/v5.7.0/markdown/podman-run.1.html
- Bunny purge cache:
  https://docs.bunny.net/cdn/purge-cache
