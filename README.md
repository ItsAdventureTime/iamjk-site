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
