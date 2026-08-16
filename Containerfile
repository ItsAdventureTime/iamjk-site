# Build dependencies and Astro output on the sandbox's native platform. The
# generated server bundle is portable; only the final Node runtime needs the
# VPS target platform.
FROM --platform=$BUILDPLATFORM docker.io/library/node:24.18.0-alpine AS build

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install --global pnpm@11.15.1 \
  && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Assemble the runtime image for the VPS without executing target-architecture
# commands inside the ARM Docker Sandbox. BuildKit selects the requested
# `--platform` for this final stage.
FROM docker.io/library/node:24.18.0-alpine

ENV HOST=0.0.0.0
ENV PORT=4321
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
