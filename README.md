# iamjk.site

Personal website for Juan Karlo “JK” de Guzman. The site is intentionally
personal rather than professional: it covers his interests, current reading
and learning, faith, teaching, technology, and the things he is still figuring
out.

It uses the bundled vinext/React setup and builds to a Cloudflare
Worker-compatible output for Sites or a static site behind Caddy.

## Local development

```bash
pnpm install
pnpm dev
```

## Validation

```bash
pnpm build
pnpm test
pnpm run lint
```

The main page is in `app/page.tsx`, the design tokens and responsive styling are
in `app/globals.css`, and the social preview is `public/og.png`.

## Fedora CoreOS VPS deployment

The static files for Caddy are written to `dist/client/`. Run the validation
commands locally, then copy that directory to the existing Caddy document root:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm run lint
pnpm build
rsync -av --delete dist/client/ jk@YOUR_VPS_HOST:/home/jk/iamjk-site/
```

Replace `YOUR_VPS_HOST` with the VPS hostname or IP. The `--delete` flag keeps
the VPS copy identical to the local build and only affects
`/home/jk/iamjk-site/`.

On the VPS, make sure the static files are readable by the rootless Caddy
container:

```bash
sudo chown -R jk:jk /home/jk/iamjk-site
find /home/jk/iamjk-site -type d -exec chmod 750 {} +
find /home/jk/iamjk-site -type f -exec chmod 640 {} +
```

The Caddy Quadlet must expose the directory with this read-only mount:

```ini
Volume=/home/jk/iamjk-site:/srv/iamjk-site:ro,Z
```

The `iamjk.site` Caddy route should use `/srv/iamjk-site` as its root and
`file_server` to serve the exported files. If the Quadlet or Caddyfile changed,
validate before restarting the user service:

```bash
podman run --rm --volume /home/jk/caddy/conf:/etc/caddy:ro,Z docker.io/library/caddy:alpine caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
systemctl --user daemon-reload
systemctl --user restart caddy.service
systemctl --user status caddy.service --no-pager
```

For a content-only update, Caddy normally does not need a restart. Confirm DNS,
TLS, and the response from the public hostname:

```bash
curl --fail --silent --show-error --head https://iamjk.site/
curl --fail --silent --show-error https://iamjk.site/ | rg -F "I'm JK."
```

The existing temporary Caddy profile adds `X-Robots-Tag: noindex`. Remove its
`import private_noindex` line when the site is ready to appear in search
engines.

## Content and voice

The site uses American English (`en-US`) and a natural, conversational voice.
Copy should sound like JK speaking to a real person. Prefer concrete details,
short sentences, contractions, and first-person language. Avoid slogans,
therapy-speak, corporate language, inflated claims, generic calls to action,
and polished phrases that do not sound like JK.

Before publishing copy, check it for:

- natural American English and correct punctuation;
- specific, verifiable first-person details;
- clear headings and links that make sense out of context;
- no unnecessary AI-style filler or exaggerated language;
- mobile-friendly line length and readable sentence structure.

## Deployment

The project is connected to the Sites project recorded in
`.openai/hosting.json`. The safe release sequence is:

1. validate the source;
2. build the deployable archive;
3. push the exact commit to the Sites source repository;
4. save a Sites version from that commit and archive;
5. deploy the saved version;
6. confirm the deployment status and URL.

Keep the Sites source credential temporary and pass it through Git's
`http.extraHeader`; do not store it in the repository or shell history.
