# Security and privacy guide

**Reviewed:** 2026-08-09
**Scope:** public iamjk.site source, contact endpoint, container runtime, and Git release workflow

The 2026-08-08 personal-context review informs the public copy. Only the
non-sensitive, intentionally shareable layer belongs here. The source profile
stays outside this repository.

## Public-content rules

iamjk.site is a personal website with a privacy-conscious contact endpoint.

- Do not publish an email address or `mailto:` link. Visitors use the protected contact form.
- Do not publish JK’s age or year of birth.
- Use “Philippines,” not a more precise city.
- Keep personal details limited to the content JK intentionally chose to share.
- Do not place credentials, API tokens, private keys, 1Password secrets, or VPS secrets in the repository.
- Keep contact details server-side; the form sends messages through Resend without exposing the destination inbox in page source.

## Repository boundary

Only source, build configuration, public assets, tests, and release guidance
belong in GitHub. The following remain local-only and are ignored:

- `.openai/` — hosting-provider metadata not needed by the VPS deployment.
- `.serena/` — local agent configuration and memories.
- `.env*`, private keys, certificates, credentials, generated output, and
  dependency directories.

These paths were removed from Git tracking in the repository cleanup. A local
ignore rule does not remove historical data; if a real secret ever entered Git,
revoke it first and follow GitHub's sensitive-data removal procedure.

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

The repository scan should produce no email-address matches in public source.
The rendered-output test separately rejects email-shaped strings and `mailto:`
links in `dist/client/index.html`. Runtime-only sender and recipient values are
injected through Podman secrets and never copied into the image or browser
bundle. A clean result is a release check, not proof that arbitrary personal
data is impossible to add later.

## Contact endpoint

The browser exposes only the public Turnstile site key. The server validates
each token at Cloudflare’s Siteverify endpoint before calling Resend. Tokens
are single-use and short-lived. The endpoint also requires name, country, and
message; caps field and request sizes; rejects a honeypot and implausibly fast
submissions; checks same-origin requests; and throttles repeated attempts by
client address. Resend failures return a short reference instead of provider
details. Server logs retain only that reference, the HTTP status, and a
provider error type; they never retain message content, contact details, or
credentials. Each delivery request also includes a unique Resend idempotency
key.

Create these secrets on the VPS and keep their values out of source control,
container build arguments, logs, and shell history:

```bash
printf '%s' "$TURNSTILE_SECRET_VALUE" | podman secret create iamjk-site_TURNSTILE_SECRET -
printf '%s' "$RESEND_API_KEY_VALUE" | podman secret create iamjk-site_resend-api-key -
printf '%s' 'website@iamjk.site' | podman secret create iamjk-site_resend-from -
printf '%s' 'hello@iamjk.site' | podman secret create iamjk-site_resend-to -
```

The Quadlet template maps these secrets to runtime-only environment variables.
Do not publish port `4321`; Caddy should reverse-proxy to `iamjk-site:4321`
over `caddy.network`.

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

GitHub CLI is the required authentication path for GitHub remote operations.
Keep `origin` on HTTPS; do not use the SSH remote for pushes. Confirm the active
account, configure Git to use GitHub CLI credentials, verify the remote, then
push the local commit:

```bash
gh auth status
gh auth setup-git --hostname github.com
gh repo view ItsAdventureTime/iamjk-site --json nameWithOwner,defaultBranchRef
git remote set-url origin https://github.com/ItsAdventureTime/iamjk-site.git
git push origin main
```

`gh auth setup-git` configures GitHub CLI credentials for Git transport; it does
not create a cryptographic signature. Commit signing is separate from remote
transport; if signing is enabled, verification comes from the signed commit, the
registered signing public key, and the matching GitHub author email. A failed
signing agent must not be worked around by publishing private key material.

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

The canonical release path runs tests on macOS through Podman, transfers a
sanitized source build context to the VPS, builds the standalone Node 24 Alpine
image natively on the VPS, restarts the Quadlet service, and then invokes the
VPS-side bunny-purge script over SSH. The rsync exclusions keep `.env` files,
private-key/certificate files, generated output, and local agent metadata out
of the VPS build context. Before purging the CDN, it checks the new contact
markup internally and confirms the public `GET /api/contact` route returns
`405 Method Not Allowed`, proving Caddy reaches the Node endpoint. Run it from
the repository root:

~~~bash
cd ~/dev/iamjk-site
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
- GitHub removing sensitive data:
  https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
- GitHub preventing data leaks:
  https://docs.github.com/en/code-security/tutorials/secure-your-organization/prevent-data-leaks
- 1Password SSH commit signing:
  https://www.1password.dev/ssh/git-commit-signing
- 1Password SSH agent:
  https://www.1password.dev/ssh/agent
- Podman machine:
  https://docs.podman.io/en/latest/markdown/podman-machine.1.html
- Podman run:
  https://docs.podman.io/en/latest/markdown/podman-run.1.html
- MDN Canvas optimization:
  https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
- MDN requestAnimationFrame:
  https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- Node official image and Alpine tradeoffs:
  https://github.com/nodejs/docker-node
- Bunny purge cache:
  https://docs.bunny.net/cdn/purge-cache
