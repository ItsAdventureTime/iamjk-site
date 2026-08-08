FROM docker.io/library/node:24-alpine AS build

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install --global pnpm@11.15.1 \
  && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM docker.io/library/node:24-alpine

ENV HOST=0.0.0.0
ENV PORT=4321
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
