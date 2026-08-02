# Security and privacy guide

**Reviewed:** 2026-08-03
**Scope:** public iamjk.site source, generated static output, and Git release workflow

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

Build locally and deploy only the generated static directory. Before copying it
to the VPS, run:

```bash
pnpm test
pnpm run check
pnpm run build
rg -n -i 'mailto:|[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}' dist
```

The final scan should return no matches. Caddy’s CSP must allow the compiled
same-origin Astro module while keeping inline event handlers disabled. See
`README.md` for the current Caddy pattern and deployment commands.

## References

- GitHub push protection:
  https://docs.github.com/en/code-security/concepts/secret-security/push-protection
- GitHub secret scanning:
  https://docs.github.com/en/code-security/concepts/secret-security/about-alerts
- 1Password SSH commit signing:
  https://www.1password.dev/ssh/git-commit-signing
- 1Password SSH agent:
  https://www.1password.dev/ssh/agent
