# syntax=docker/dockerfile:1

##
# Multi-stage build for Skeleton Studio (Next.js 16, App Router).
#
#   deps    → install node_modules from the lockfile (cached until lockfile changes)
#   builder → run `next build` with output: "standalone"
#   runner  → minimal runtime: standalone server + static assets, non-root user
#
# IMPORTANT: every NEXT_PUBLIC_* var is inlined into the client bundle at BUILD
# time, not read at runtime. Pass them as --build-arg (or compose build.args).
# Setting them in `docker run -e` / compose `environment:` does nothing.
##

# ---------------------------------------------------------------------------
# Stage 1 — dependencies
# ---------------------------------------------------------------------------
FROM node:24-alpine AS deps

# glibc shim; some npm postinstall binaries expect it on musl/Alpine.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only the manifests so this layer stays cached across source edits.
COPY package.json package-lock.json ./
RUN npm ci


# ---------------------------------------------------------------------------
# Stage 2 — build
# ---------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public (client-visible) config, baked into the bundle here.
ARG NEXT_PUBLIC_PROJECT_VERSION=0.1.0
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID=

ENV NEXT_PUBLIC_PROJECT_VERSION=${NEXT_PUBLIC_PROJECT_VERSION} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_CLARITY_PROJECT_ID=${NEXT_PUBLIC_CLARITY_PROJECT_ID} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN npm run build


# ---------------------------------------------------------------------------
# Stage 3 — runtime
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as an unprivileged user; a container escape then lands on a nobody.
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

# `server.js` serves ./public and ./.next/static only if they are copied in —
# the standalone trace deliberately leaves them out (CDN-first assumption).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# busybox wget ships with Alpine; no curl install needed.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
