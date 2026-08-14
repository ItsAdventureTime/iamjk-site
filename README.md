# iamjk.site

Personal website for Juan Karlo “JK” de Guzman. The site is intentionally personal rather than professional: it covers his interests, faith, teaching, technology, reading, ideas, and the questions he keeps returning to.

The project is an Astro application. The public page is prerendered, while the contact endpoint runs in the Node adapter so Turnstile and Resend secrets stay server-side. Caddy reverse-proxies the application container. The page keeps its motion dependency-free with a shared Canvas 2D field, CSS-rendered section motifs, pointer/scroll response, and IntersectionObserver reveals.

## Current stack

- Astro `7.1.3` with the `@astrojs/node` standalone adapter.
- Node.js `>=24.18.0`, aligned with the current Node 24 LTS line.
- pnpm `11.15.1`, recorded through `packageManager` in `package.json`; verify the installed CLI matches it.
- TypeScript `6.0.3`.
- Caddy reverse proxy for the VPS runtime.
- Cloudflare Turnstile server-side verification and Resend email delivery.
- No database, remote font, or public email address.

The intended production deployment is the existing Fedora CoreOS VPS with a rootless Podman application container and Caddy reverse proxy. Local agent, hosting-provider, and deployment metadata stay outside the public repository.

## Repository map

- `src/pages/index.astro` — page structure, copy, metadata, Canvas 2D script, and section state.
- `app/globals.css` — design tokens, responsive layout, motifs, surfaces, motion, and browser fallbacks.
- `astro.config.mjs` — Node standalone output and canonical site URL.
- `src/pages/api/contact.ts` — same-origin JSON contact endpoint, Turnstile verification, validation, throttling, and Resend delivery.
- `Containerfile` — reproducible Node 24 production image.
- `pnpm-workspace.yaml` — explicit allowlist for the reviewed `esbuild` and `sharp` install scripts required by the build.
- `deploy/iamjk-site.container.example` — Quadlet template with secret-to-environment mappings.
- `deploy/iamjk-site.local.conf.example` — local deployment-target template; copy it only when you prefer manual setup.
- `deploy/Caddyfile.example` — reverse-proxy configuration for the Node application and Turnstile CSP.
- `tests/rendered-html.test.mjs` — build-output and design-invariant checks, including email-address exclusions.
- `DESIGN.md` — visual, content, responsive, motion, and accessibility guide.
- `SECURITY.md` — privacy, email scanning, GitHub protection, and signed Git release guide.
- `scripts/deploy-vps.sh` — local validation, sanitized rsync upload, native VPS Podman build, and Bunny purge release helper.
- `public/` — the static favicon and intentionally used public assets.
- `.deploy-vps.conf` — ignored local deployment target created by `scripts/deploy-vps.sh --init`.
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

Open the local URL Astro prints. Build output is written to `dist/`; the server endpoint is emitted under `dist/server/`.

## Validation

Run the source checks and rendered-output test locally:

```bash
pnpm run check
pnpm test
```

The `test` script runs `astro build` before Node’s test runner checks
`dist/client/index.html`. It verifies metadata, important copy, section motifs,
the same-origin module, accessibility markers, sensitive-content exclusions,
email-address exclusions, and the no-blur design constraints.

For UI or interaction changes, run a browser smoke check at a desktop width and
at least one narrow mobile width. Confirm that the primary navigation is
visibly grouped, every navigation link and the “Say hello” CTA share a 48px
height, and the mobile rail scrolls without creating page-level horizontal
overflow. Also check keyboard focus, the active section state, contact-form
pending/success/error feedback, and `prefers-reduced-motion` behavior.

## Standards baseline

The current UI follows WCAG 2.2 as the accessibility reference, WAI-ARIA/APG
guidance for landmarks and current-location state, and responsive guidance that
preserves zoom, reflow, source-order reading, visible focus, and touch-safe
targets. The page’s `prefers-reduced-motion` path stops continuous Canvas 2D
animation and pointer parallax while keeping section state available through
static scroll updates.

The repository stays on its pinned Astro 7 stack. Astro View Transitions are
not enabled because this is one prerendered document and does not need a
client-side routing layer. Revisit that decision only with route-announcement,
focus, and reduced-motion tests in place.

The standards references used for the current review are maintained in
[`DESIGN.md`](DESIGN.md).

## Contact form secrets and Turnstile

The browser receives only the public Turnstile site key. The browser submits
same-origin JSON rather than a simple HTML form post, and the endpoint requires
the exact production `Origin` header. The server validates each single-use
token at Cloudflare before calling Resend. The endpoint also
enforces the required name, country, and message fields; caps input sizes;
rejects the honeypot and fast submissions; checks same-origin requests; and
throttles each forwarded client address. Resend failures return a short
reference to the visitor while the server logs only the reference, HTTP status,
and provider error type; message content and credentials are never logged.
Resend requests also carry an idempotency key.

Create these Podman secrets on the VPS. Never place their values in source,
the image, the Quadlet file, or shell history:

```bash
printf '%s' "$TURNSTILE_SECRET_VALUE" | podman secret create iamjk-site_TURNSTILE_SECRET -
printf '%s' "$RESEND_API_KEY_VALUE" | podman secret create iamjk-site_resend-api-key -
printf '%s' "$RESEND_FROM_VALUE" | podman secret create iamjk-site_resend-from -
printf '%s' "$RESEND_TO_VALUE" | podman secret create iamjk-site_resend-to -
```

The single deployment helper installs or updates the application Quadlet in
`~/.config/containers/systemd/iamjk-site/`, joins it to `caddy.network`,
updates only the `iamjk.site` upstream and its `/api/*` cache policy in the
existing Caddyfile, restarts the rootless application, and gracefully reloads
the running Caddy service. A timestamped Caddyfile backup is created only when
the helper must make a proxy change. It does not replace the shared Caddyfile
or change any other site. Caddy should proxy `iamjk.site` to
`iamjk-site:4321` on the shared network and preserve the public host with
`header_up Host {host}`. The endpoint independently requires the exact public
`Origin` and the browser submits JSON. Do not expose port 4321 publicly.

For a production-style local check:

```bash
pnpm run build
pnpm run preview
```

Node 25 and later do not ship the Corepack executable, so this guide invokes `pnpm` directly after checking its version. The current app uses standard Canvas 2D, `requestAnimationFrame`, `IntersectionObserver`, CSS Grid, transforms, and custom properties. The canvas caps mobile pixel density and suspends its frame scheduler while the document is hidden to reduce Safari/WebKit and Chromium/Blink battery and main-thread work. The source avoids experimental `animation-timeline` APIs and browser-specific prefixes. Run a browser smoke check when an available browser runtime is connected; actual Firefox, Safari, and Chromium runs should be added to CI when those engines are available.

## Preferred macOS release workflow

The preferred release path runs on macOS:

1. Podman runs the pinned Node and pnpm test pipeline in a disposable container.
2. The helper starts the Podman machine when it is not running.
3. rsync transfers a sanitized source build context to the VPS.
4. Podman builds the application image natively on the VPS and restarts the Quadlet service.
5. SSH invokes the VPS-side bunny-purge script only after the service restarts.

## Update an existing VPS deployment

The site is already installed as a rootless Podman Quadlet on the VPS. For a
normal content, style, or application update, configure the target once and
then run one command:

```bash
cd ~/dev/iamjk-site
./scripts/deploy-vps.sh --init
./scripts/deploy-vps.sh
```

`--init` asks for the VPS hostname, SSH user, and remote application path. It
creates the ignored, mode-600 `.deploy-vps.conf` in the repository root. The
file contains routing details only; Podman secrets stay on the VPS. Edit that
file directly later if the target changes. After the one-time setup, the
normal update command is simply:

```bash
./scripts/deploy-vps.sh
```

The helper deploys the current checkout, so the normal local loop is:

```bash
# make and review the change
./scripts/deploy-vps.sh
```

If you update the checkout from Git first, use `git pull --ff-only` before the
deployment command. The helper computes its repository root from the script
location, so it can also be called from another working directory.

The helper is the release gate. It will:

1. start the local Podman machine if needed;
2. install the pinned pnpm version in a disposable Node 24 Alpine container;
3. run the frozen-lockfile check and rendered-output test;
4. verify the four existing Podman secrets on the VPS;
5. synchronize a sanitized build context, excluding Git, agent metadata,
   `skills-lock.json`, `.deploy-vps.conf`, dependencies, generated output,
   environment files, and common key/certificate extensions;
6. build the image natively on the VPS and restart `iamjk-site.service`;
7. check the running page and contact endpoint;
8. format, validate, and gracefully reload Caddy; then
9. verify the public endpoint before invoking the VPS-side `bunny-purge`.

Do not run `podman build`, `systemctl restart`, or `bunny-purge` manually for a
normal update. The helper deliberately builds on the VPS so the image matches
the VPS architecture, and it stops before the CDN purge if the app, Caddy, or
public API checks fail.

If the VPS uses non-default paths or a non-generated container name, add the
optional settings to `.deploy-vps.conf`:

```bash
DEPLOY_UPDATE_CADDY="1"
DEPLOY_QUADLET_DIR="/home/jk/.config/containers/systemd/iamjk-site"
DEPLOY_CADDY_CONFIG_PATH="/home/jk/caddy/conf/Caddyfile"
DEPLOY_APP_CONTAINER_NAME="iamjk-site"
```

Use `DEPLOY_UPDATE_CADDY="0"` only when Caddy is managed separately and its existing
`iamjk.site` block already points to `iamjk-site:4321`, preserves the public
`Host`, keeps `/api/*` responses private and uncached, and limits request bodies.
The helper still validates and reloads Caddy after the application update.

For automation or a one-off target, the legacy environment-variable overrides
remain supported and take precedence over the local config:

```bash
VPS_HOST=YOUR_VPS_HOST ./scripts/deploy-vps.sh
```

Use `./scripts/deploy-vps.sh --help` to see the available local options.

The helper requires local `podman`, `rsync`, and `ssh`, plus SSH access to the
VPS. The VPS requires rootless Podman, the existing `iamjk-site.service`, the
`caddy.network`, all four application secrets, and the VPS-side `bunny-purge`
command. No secret values belong in the command line, repository, image, or
build context.

The VPS transport is separate from GitHub transport: this helper uses SSH and
rsync to reach the server and deploy the local checkout. `gh` HTTPS
authentication can manage the GitHub repository, but it cannot replace the
VPS's SSH access. If SSH access is prohibited, do not run this helper; use a
separate VPS-supported deployment transport instead.

For a failed deployment, first inspect the helper's diagnostics and the
rootless service logs:

```bash
ssh jk@YOUR_VPS_HOST 'systemctl --user status iamjk-site.service --no-pager; journalctl --user -u iamjk-site.service -n 80 --no-pager'
```

The helper preserves timestamped Caddyfile backups when it changes or formats
that file. It does not implement an automatic application-image rollback; stop
and inspect before retrying, and use the last known-good release image only
after confirming its tag and configuration on the VPS.

### Current deployment baseline

Reviewed 2026-08-14 against the current official guidance:

- Node 24 remains the production line because it is an LTS release; do not
  switch the image to a Current or EOL line without a compatibility review.
- Astro 7 remains the application framework. Its Node adapter serves the
  prerendered document and same-origin contact endpoint from the standalone
  image; the existing `Containerfile` and `astro.config.mjs` already match
  that model.
- Rootless Quadlet remains the service model. The unit belongs under the
  user's `~/.config/containers/systemd/` path, and `systemctl --user
  daemon-reload` regenerates the service after the unit is copied.
- Caddy configuration changes use `caddy validate` followed by `caddy reload`
  rather than stopping and starting the proxy. The helper performs both checks
  before the public endpoint checks and CDN purge.
- The frozen lockfile remains the dependency-control boundary. Do not replace
  `pnpm install --frozen-lockfile` with an unconstrained install during a
  release.

Official references:

- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
- [Astro deployment guide](https://docs.astro.build/en/guides/deploy/)
- [Podman Quadlet units](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html)
- [Caddy graceful reloads](https://caddyserver.com/docs/command-line)
- [GitHub deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments) (for a future CI workflow, not this manual helper)

Podman on macOS requires a virtual machine. Install it with Homebrew and
initialize a machine once:

~~~bash
brew install podman
podman machine init
podman machine start
~~~

On later releases, start the existing machine when necessary:

~~~bash
podman machine start
~~~

Run the repeatable deployment helper from the repository root:

~~~bash
cd ~/dev/iamjk-site
./scripts/deploy-vps.sh --init  # first time only
./scripts/deploy-vps.sh
~~~

The first command creates the ignored `.deploy-vps.conf` target file. After
that one-time setup, `./scripts/deploy-vps.sh` is the normal update command;
there is no need to export VPS variables in each terminal session. The helper
also works when called outside the repository root.

The helper uses the pinned Node 24 Alpine image by default, installs the
repository-pinned pnpm version inside the disposable container, and runs the
frozen-lockfile install and test pipeline. It then transfers a sanitized build
context with rsync and builds `iamjk-site:release` natively on the VPS. This
avoids Apple Silicon-to-x86 image incompatibilities. The local test container mounts an ephemeral
Linux-only node_modules tmpfs, so macOS host modules cannot trigger pnpm's
non-interactive cleanup prompt. Alpine supplies sh, so the helper does not
assume Bash. Override the image or pnpm version only when the project runtime
policy changes. Put any deliberate override in `.deploy-vps.conf` instead of
adding it to every command:

The repository explicitly allows only the `esbuild` and `sharp` dependency
build scripts. pnpm blocks unreviewed dependency scripts by default; keep this
allowlist narrow and review it when dependencies change.

~~~bash
DEPLOY_CONTAINER_IMAGE="docker.io/library/node:24-alpine"
DEPLOY_PNPM_VERSION="11.15.1"
~~~

The helper checks the running container for `contact-form`, formats and
validates the rootless Caddyfile, gracefully reloads Caddy, and only then calls
the VPS-side bunny-purge script. This catches an old image, invalid proxy
configuration, or failed service restart before the CDN is purged. It requires
SSH access to the VPS and a VPS-side `bunny-purge` script. It does not look for
bunny-purge on macOS and does not copy CDN credentials to the local machine. It
also checks the app’s `GET /api/contact` response and the public Caddy route;
both must return the expected application behavior before the CDN is purged.

The helper is idempotent for both first application installation and later
updates. It expects the existing rootless Caddy Quadlet, `caddy.network`, the
four Podman secrets, and the VPS-side `bunny-purge` command to already exist.
The synced build context excludes Git metadata, agent metadata, generated files,
dependency directories, `.env` files, and common private-key/certificate
extensions. Podman secrets remain only on the VPS.
Set `DEPLOY_UPDATE_CADDY="0"` only when you intentionally manage the Caddy upstream
yourself; formatting, validation, and the safe reload still run. The helper
recognizes both the explicit `iamjk-site` name and
Quadlet’s generated default `systemd-iamjk-site`; set
`DEPLOY_APP_CONTAINER_NAME` if your existing service uses another name. Set
`DEPLOY_QUADLET_DIR` or `DEPLOY_CADDY_CONFIG_PATH` when your VPS uses
different paths:

~~~bash
DEPLOY_UPDATE_CADDY="1"
DEPLOY_QUADLET_DIR="/home/jk/.config/containers/systemd/iamjk-site"
DEPLOY_CADDY_CONFIG_PATH="/home/jk/caddy/conf/Caddyfile"
DEPLOY_APP_CONTAINER_NAME="iamjk-site"
~~~

Do not put Bunny API keys in the repository, shell history, or deployment
command. Bunny supports full-zone and URL/tag-based purge strategies; prefer
the narrowest purge implemented by the VPS-side wrapper. A full purge can
temporarily increase origin traffic while edge nodes refill.

Manual test fallback, useful when diagnosing the helper:

~~~bash
podman run --rm \
  --volume "$PWD:/workspace" \
  --workdir /workspace \
  --tmpfs /workspace/node_modules:notmpcopyup \
  docker.io/library/node:24-alpine \
  sh -lc 'npm install --global pnpm@11.15.1 && CI=true pnpm install --frozen-lockfile && CI=true pnpm test'

podman build --tag localhost/iamjk-site:release --file Containerfile .
~~~

## Fedora CoreOS VPS runtime notes

The macOS helper above is the canonical release path. The VPS receives a
sanitized source build context, builds its own native OCI image, and runs it as
the rootless Quadlet service described above. The
application Quadlet joins `caddy.network`, and Caddy proxies to the container
name `iamjk-site:4321`. The loopback-published port is kept as a local
diagnostic fallback; it is not the Caddy connection path.

## Caddy configuration

Caddy runs as its own rootless Podman container. Both Quadlets must join
`caddy.network`; `127.0.0.1:4321` would point back to the Caddy container, not
the application. Caddy therefore reverse-proxies `iamjk-site:4321`. Do not
leave the old `file_server` site active, because it will continue serving the
previous static HTML instead of the container. The complete example is in
`deploy/Caddyfile.example`.
Turnstile requires its browser script and frame origin in the policy; the form
also needs same-origin API requests. Do not use a policy that sets `script-src 'none'` or blocks
`challenges.cloudflare.com`.

Use a dedicated reverse-proxy site block like this, adapting the shared
security headers to your existing Caddyfile:

```caddyfile
iamjk.site {

    header {
        Strict-Transport-Security "max-age=31536000"
        >Content-Security-Policy "default-src 'none'; script-src 'self' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com; media-src 'none'; object-src 'none'; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; worker-src 'none'; manifest-src 'none'; base-uri 'none'; form-action 'self'; upgrade-insecure-requests"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Cross-Origin-Opener-Policy "same-origin-allow-popups"
        Cross-Origin-Resource-Policy "same-origin"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }

    @iamjk_api path /api/*
    header @iamjk_api {
        Cache-Control "private, no-store"
        CDN-Cache-Control "no-store"
        Pragma "no-cache"
    }

    request_body @iamjk_api {
        max_size 16KB
    }

    reverse_proxy iamjk-site:4321 {
        header_up Host {host}
    }
}

```

The page source contains no literal `style="..."` or inline event handlers, but the runtime updates CSS custom properties through the DOM style API for pointer and scroll parallax. That is why the deployment policy allows `style-src-attr 'unsafe-inline'` while keeping `script-src-attr 'none'` and `script-src 'self'`. If you later remove the DOM style updates, you can tighten the style-attribute directive and retest in the deployed browsers.

Caddy’s `encode zstd gzip` is appropriate for this application. The Node
adapter serves prerendered page output and the `/api/contact` endpoint from
the same origin, so no public API port or cross-origin policy is needed. Keep
`/api/*` responses private and uncached at Caddy and the CDN; contact responses
must never be stored or replayed.

The `request_body` limiter is a Caddy 2.10+ directive. Keep the Caddy image
current and let `caddy validate` reject an incompatible image before reload.

The deployment helper snapshots the host-mounted file, runs `caddy fmt
--overwrite`, and keeps a timestamped backup only when formatting changes are
needed. It validates the formatted file both in a temporary rootless Podman
container and with the running `caddy` container, then performs a graceful
reload. The browser’s JSON submission also avoids Astro’s form-origin check
being confused by the HTTP hop between Caddy and the Node adapter. The
temporary container has no network access and disables SELinux separation only
for this narrow host-file operation. The formatter runs as UID 0 inside the
rootless user namespace so it can write the VPS user’s host-mounted file. It
deliberately does not add `:Z` to this second mount:
the permanent Caddy Quadlet already labels the directory, and relabeling it
again can make the live read-only Caddy mount unreadable. This is necessary
because the permanent Caddy Quadlet mounts `/etc/caddy` read-only.

Manual equivalent:

```bash
CADDY_IMAGE="$(podman inspect --format '{{.ImageName}}' caddy)"
podman run --rm --entrypoint caddy \
  --network none --security-opt label=disable \
  --user 0 --userns=host \
  --volume /home/jk/caddy/conf:/etc/caddy:rw \
  "$CADDY_IMAGE" fmt --overwrite /etc/caddy/Caddyfile
podman run --rm --entrypoint caddy \
  --network none --security-opt label=disable \
  --user 0 --userns=host \
  --volume /home/jk/caddy/conf:/etc/caddy:rw \
  "$CADDY_IMAGE" validate --config /etc/caddy/Caddyfile --adapter caddyfile
podman exec caddy test -r /etc/caddy/Caddyfile || systemctl --user restart caddy.service
podman exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl --user daemon-reload
podman exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl --user status caddy.service --no-pager
```

Use `systemctl --user restart caddy.service` only when the Caddy container is
not running or when a reload cannot be performed. Caddy recommends graceful
reloads for configuration changes so active connections are not needlessly
interrupted.

For a content-only update, Caddy normally does not need a restart. Verify the public response and the compiled module:

```bash
curl --fail --silent --show-error --head https://iamjk.site/
curl --fail --silent --show-error https://iamjk.site/ | rg -F "A person is"
curl --fail --silent --show-error --head https://iamjk.site/_astro/ASSET_FROM_INDEX.js
```

The temporary Caddy profile in the existing server configuration adds `X-Robots-Tag: noindex`. Remove its `import private_noindex` line when the site is ready for public search indexing.

## Public personal context

The public copy reflects the latest personal-context review dated 2026-08-08. It
adds JK’s early Windows 95-era curiosity, online English teaching since 2019,
interdisciplinary interests, reading habits, social need for quiet, and the
ongoing balance between open systems and practical convenience.

The site intentionally leaves out sensitive health and family-care details,
exact city, birth year, age, unverified degree completion, credentials that are
not needed for the personal introduction, and volatile device configuration.
The source context file remains outside this public repository.

## GitHub CLI and verified releases

Use GitHub CLI for every GitHub remote operation. The repository remote must use
HTTPS; GitHub CLI supplies the authenticated Git credential, so GitHub pushes do
not depend on the SSH authentication agent. GitHub CLI authentication does not
sign commits. The existing 1Password SSH signer is separate and is used only for
optional commit signatures.

```bash
git add README.md SECURITY.md
git commit -m "Describe the change"
gh auth status
gh auth setup-git --hostname github.com
gh repo view ItsAdventureTime/iamjk-site --json nameWithOwner,defaultBranchRef
git remote set-url origin https://github.com/ItsAdventureTime/iamjk-site.git
git push origin main
```

`git add` and `git commit` are local repository operations. GitHub CLI manages
the authenticated HTTPS credential for the final Git transport; `git push` is
the Git operation that publishes the local commit. Do not use `gh repo sync` for
this release path because it synchronizes from a remote source into a local or
destination repository rather than publishing the local commit.

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
- Treat the top navigation as a visible control group: links and the “Say hello”
  CTA use a shared 48px minimum height, centered labels, and clear hover,
  current, and focus states.
- Keep direct interaction feedback quick and content reveals brief enough that
  scrolling visitors never mistake a delayed animation for a broken page.
- Preserve reduced-motion support, visible keyboard focus, and no-script access to the content.

## Sources used for the current implementation notes

- Node.js release status: https://nodejs.org/en/about/previous-releases
- Astro configuration reference: https://docs.astro.build/en/reference/configuration-reference/
- Astro API endpoints: https://docs.astro.build/en/guides/endpoints/
- Podman machine: https://docs.podman.io/en/latest/markdown/podman-machine.1.html
- Podman run: https://docs.podman.io/en/latest/markdown/podman-run.1.html
- Node official image and Alpine tradeoffs: https://github.com/nodejs/docker-node
- MDN Canvas optimization: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
- MDN requestAnimationFrame: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- Bunny purge cache: https://docs.bunny.net/cdn/purge-cache
- Bunny purge URL API: https://docs.bunny.net/api-reference/core/purge/purge-url
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WCAG 2.2 animation from interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- Caddy `root`: https://caddyserver.com/docs/caddyfile/directives/root
- Caddy `file_server`: https://caddyserver.com/docs/caddyfile/directives/file_server
- Caddy `header`: https://caddyserver.com/docs/caddyfile/directives/header
- Caddy request-body limits: https://caddyserver.com/docs/caddyfile/directives/request_body
- Caddy `encode`: https://caddyserver.com/docs/caddyfile/directives/encode
- Caddy `reverse_proxy`: https://caddyserver.com/docs/caddyfile/directives/reverse_proxy
- Caddy graceful reloads: https://caddyserver.com/docs/running
- Caddy command line reload: https://caddyserver.com/docs/command-line
- Podman systemd/Quadlet units: https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html
- Resend send email API: https://resend.com/docs/api-reference/emails/send-email
- Resend API errors: https://resend.com/docs/api-reference/errors
- Resend idempotency keys: https://resend.com/docs/dashboard/emails/idempotency-keys
- GitHub push protection: https://docs.github.com/en/code-security/concepts/secret-security/push-protection
- 1Password SSH commit signing: https://www.1password.dev/ssh/git-commit-signing
- GitHub CLI manual: https://cli.github.com/manual/
- GitHub CLI authentication: https://cli.github.com/manual/gh_auth

Review these sources again when changing the runtime, deployment model, security policy, or signing workflow.
