# syntax=docker/dockerfile:1

ARG NODE_ENV=production

# ── Stage 1: install dependencies ─────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: build application ────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1
# Requires prisma/schema.prisma (created by BCK-010)
RUN npx prisma generate
RUN npm run build

# ── Stage 3: minimal production runner ────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nodeuser

COPY --from=builder --chown=nodeuser:nodejs /app/public ./public
COPY --from=builder --chown=nodeuser:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodeuser:nodejs /app/.next/static ./.next/static

USER nodeuser

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
