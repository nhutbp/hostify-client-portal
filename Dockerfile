## syntax=docker/dockerfile:1.7
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV CI=true

FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts \
  && npm rebuild argon2 esbuild lightningcss

FROM deps AS build
COPY . .
ENV NODE_ENV=production
ARG APP_URL
ARG VITE_API_PREFIX
ARG S3_ENDPOINT
ENV VITE_API_BASE_URL=${APP_URL}
ENV VITE_API_PREFIX=${VITE_API_PREFIX}
ENV VITE_CDN_BASE_URL=${S3_ENDPOINT}
RUN npx prisma generate \
  && npx vite build \
  && npm prune --omit=dev --ignore-scripts \
  && npm cache clean --force

FROM gcr.io/distroless/nodejs24-debian12 AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=build /app/prisma/migrations ./prisma/migrations
COPY --from=build /app/prisma/generated ./prisma/generated
COPY --from=build /app/prisma/seed ./prisma/seed
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/server/common ./server/common
COPY --from=build /app/shared ./shared
COPY --from=build /app/content ./content
COPY --from=build /app/server/prod-server.mjs ./server/prod-server.mjs
COPY --from=build /app/server/start-prod.mjs ./server/start-prod.mjs

EXPOSE 3000
CMD ["server/start-prod.mjs"]
