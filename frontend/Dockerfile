# Install dependencies only when needed
FROM node:18-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN npm i -g pnpm

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml ./
# TODO: revert to frozen after resolving ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE
RUN pnpm i --no-frozen-lockfile

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Fix EdgeDB bug on wrongly importing fetch in node client.
RUN sed -i '/browserClient/s/^/\/\//' ./node_modules/edgedb/dist/nodeClient.js

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

# RUN yarn build

# If using npm comment out above and use below instead
RUN PRISMA_BINARIES_MIRROR=http://prisma-builds.s3-eu-west-1.amazonaws.com npx prisma generate
RUN npm run build

FROM edgedb/edgedb-cli:2.3.1 AS edgedb

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=edgedb --chown=nextjs:nodejs /usr/bin/edgedb ./edgedb

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir /edgedb-schema && chown nextjs:nodejs /edgedb-schema

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]