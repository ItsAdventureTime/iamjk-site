# iamjk.site

Personal website for Juan Karlo “JK” de Guzman. The site is intentionally personal rather than professional: it covers his interests, faith, teaching, technology, reading, ideas, and the questions he keeps returning to.

The project is an Astro static site. Astro renders the page to HTML and browser assets at build time; Caddy serves the resulting `dist/` directory. The page keeps its motion dependency-free with a shared Canvas 2D field, CSS-rendered section motifs, pointer/scroll response, and IntersectionObserver reveals.

## Current stack

- Astro `7.1.3` with static output.
- Node.js `>=24.18.0`, aligned with the current Node 24 LTS line.
- pnpm `11.15.1`, recorded through `packageManager` in `package.json`; verify the installed CLI matches it.
- TypeScript `6.0.3`.
- Caddy `file_server` for the VPS runtime.
- No database, API server, SSR runtime, remote font, image pipeline, or public email address.

The repository includes `.openai/hosting.json` with a project ID and null D1/R2 bindings. It is metadata only for this static build; the intended production deployment remains the existing Fedora CoreOS VPS with a Caddy-mounted static directory.

## Repository map

- `src/pages/index.astro` — page structure, copy, metadata, Canvas 2D script, and section state.
- `app/globals.css` — design tokens, responsive layout, motifs, surfaces, motion, and browser fallbacks.
- `astro.config.mjs` — `output: "static"` and canonical site URL.
- `tests/rendered-html.test.mjs` — build-output and design-invariant checks, including email-address exclusions.
- `SECURITY.md` — privacy, email scanning, GitHub protection, and signed Git release guide.
- `public/` — static favicon and supporting assets.
- `dist/` — generated release output; ignored by Git.

## Local development

Use the package-manager version recorded in `package.json` and the lockfile. Check the executable first; if it is not `11.15.1`, install that version with npm or another approved pnpm installer:

```bash
pnpm --version
```

If that does not print `11.15.1`, install the pinned CLI once:

```bash
npm install --global pnpm@11.15.1
```

Then install dependencies and start Astro:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL Astro prints. Build output is written to `dist/`.

## Validation

Run the source checks and rendered-output test locally:

```bash
pnpm run check
pnpm test
```

The `test` script runs `astro build` before Node’s test runner checks `dist/index.html`. It verifies metadata, important copy, section motifs, the same-origin module, accessibility markers, sensitive-content exclusions, email-address exclusions, and the no-blur design constraints.

For a production-style local check:

```bash
pnpm run build
pnpm run preview
```

Node 25 and later do not ship the Corepack executable, so this guide invokes `pnpm` directly after checking its version. The current app uses standard Canvas 2D, `requestAnimationFrame`, `IntersectionObserver`, CSS Grid, transforms, and custom properties. The source avoids experimental `animation-timeline` APIs and browser-specific prefixes. Direct local rendering has been checked in the available browser runtime; actual Firefox, Safari, and Chromium runs should be added to CI when those engines are available.

## Fedora CoreOS VPS deployment

Build locally, then copy only the generated static directory to the host-side Caddy document root. Do not build on the VPS:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm run check
pnpm run build
rsync -av --delete dist/ jk@YOUR_VPS_HOST:/home/jk/iamjk-site/
```

Replace `YOUR_VPS_HOST` with the VPS hostname or IP. The `--delete` flag makes `/home/jk/iamjk-site/` match the local build; it does not affect other paths.

If your Quadlet mounts the host directory into the Caddy container, check that it points to the generated files:

```ini
Volume=/home/jk/iamjk-site:/srv/iamjk-site:ro,Z
```

The Caddy process needs directory traversal and file-read permissions. The exact user/group depends on the host setup; inspect them before changing ownership. A common host-side permission check is:

```bash
namei -l /home/jk/iamjk-site
find /home/jk/iamjk-site -maxdepth 2 -type f -print
```

## Caddy configuration

Caddy’s documented static pattern pairs `root` with `file_server`. The current repository needs a same-origin JavaScript policy because Astro emits a compiled module under `/_astro/`. Do not use the generic `temporary_static_site` snippet if it sets `script-src 'none'`.

Use a dedicated site snippet like this, adapting the shared security headers to your existing Caddyfile:

```caddyfile
(iamjk_static_site) {
    import common_security

    header {
        >Content-Security-Policy "default-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; worker-src 'none'; manifest-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests"
        >Cache-Control "public, max-age=300, must-revalidate"
    }

    file_server
}

iamjk.site {
    root * /srv/iamjk-site
    import iamjk_static_site
}
```

The page source contains no literal `style="..."` or inline event handlers, but the runtime updates CSS custom properties through the DOM style API for pointer and scroll parallax. That is why the deployment policy allows `style-src-attr 'unsafe-inline'` while keeping `script-src-attr 'none'` and `script-src 'self'`. If you later remove the DOM style updates, you can tighten the style-attribute directive and retest in the deployed browsers.

Caddy’s `encode zstd gzip` is appropriate for this static output. Keep hashed `/_astro/` assets immutable if your deployment process preserves their names; revalidate `/` and `/index.html` so a new HTML shell is discovered.

Validate and reload the user service only after the config passes:

```bash
podman run --rm --volume /home/jk/caddy/conf:/etc/caddy:ro,Z docker.io/library/caddy:alpine caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl --user daemon-reload
systemctl --user restart caddy.service
systemctl --user status caddy.service --no-pager
```

For a content-only update, Caddy normally does not need a restart. Verify the public response and the compiled module:

```bash
curl --fail --silent --show-error --head https://iamjk.site/
curl --fail --silent --show-error https://iamjk.site/ | rg -F "A person is"
curl --fail --silent --show-error --head https://iamjk.site/_astro/ASSET_FROM_INDEX.js
```

The temporary Caddy profile in the existing server configuration adds `X-Robots-Tag: noindex`. Remove its `import private_noindex` line when the site is ready for public search indexing.

## GitHub CLI and verified releases

Use GitHub CLI to confirm the authenticated account and repository before a
remote operation. GitHub CLI authentication supplies repository access; it does
not sign commits. The existing 1Password SSH signer and Git configuration create
the signature that GitHub can display as verified after the public signing key
and author email are registered on the account.

```bash
gh auth status
gh repo view ItsAdventureTime/iamjk-site --json nameWithOwner,defaultBranchRef
git log -1 --show-signature
git push origin main
```

See [SECURITY.md](SECURITY.md) for the full signing, privacy-scan, and
push-protection checklist.

## Privacy and release scan

The public site intentionally exposes no email address or `mailto:` link. Run the source and generated-output scans documented in [SECURITY.md](SECURITY.md) before every release. These scans complement GitHub Secret Protection and push protection; they do not replace review of Git history or rotation of a credential that was ever exposed.

## Content and design rules

- Use American English (`en-US`) and a natural, conversational voice.
- Keep the site personal; do not turn it into a résumé or generic portfolio.
- Do not publish JK’s age or year of birth.
- Use “Philippines,” not a more precise city.
- Do not publish a personal email address.
- Keep the dark charcoal surfaces semi-transparent enough for the field to remain visible, but opaque enough for reading.
- No blur, backdrop blur, glow, or decorative shadow.
- Keep headings and body copy large enough to carry the message on desktop and mobile.
- Preserve reduced-motion support, visible keyboard focus, and no-script access to the content.

## Sources used for the current implementation notes

- Node.js release status: https://nodejs.org/en/about/previous-releases
- Astro configuration reference: https://docs.astro.build/en/reference/configuration-reference/
- Caddy `root`: https://caddyserver.com/docs/caddyfile/directives/root
- Caddy `file_server`: https://caddyserver.com/docs/caddyfile/directives/file_server
- Caddy `header`: https://caddyserver.com/docs/caddyfile/directives/header
- Caddy `encode`: https://caddyserver.com/docs/caddyfile/directives/encode
- GitHub push protection: https://docs.github.com/en/code-security/concepts/secret-security/push-protection
- 1Password SSH commit signing: https://www.1password.dev/ssh/git-commit-signing
- GitHub CLI manual: https://cli.github.com/manual/
- GitHub CLI authentication: https://cli.github.com/manual/gh_auth

Review these sources again when changing the runtime, deployment model, security policy, or signing workflow.
