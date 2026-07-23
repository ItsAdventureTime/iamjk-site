# iamjk.site

Personal portfolio site for Juan Karlo “JK” de Guzman. It uses the bundled
vinext/React starter so it can build to a Cloudflare Worker-compatible output
for Sites or be served as the app behind Caddy.

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
