# syntax=docker/dockerfile:1
# foundit-web-app image (INF-2). Two stages: the build needs pnpm and the dev dependencies; the
# runtime only has Node, the built dist/ and a tiny static server, and runs as the non-root `node`.

FROM node:24.16.0-slim AS build
# Vite inlines it at build time: the browser calls core at this URL (never a secret).
ARG VITE_API_BASE_URL=http://127.0.0.1:8000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} CI=true
WORKDIR /app
# corepack reads "packageManager" from package.json and pins pnpm 11.18.0.
RUN corepack enable
# Dependencies first: this layer is reused while only the code changes.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

FROM node:24.16.0-slim AS runtime
ENV NODE_ENV=production PORT=5173 HOST=0.0.0.0
WORKDIR /app
COPY --from=build --chown=root:root /app/dist ./dist
COPY --chown=root:root docker/serve.mjs ./docker/serve.mjs
USER node
EXPOSE 5173
CMD ["node", "docker/serve.mjs"]
