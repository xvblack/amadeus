# Install dependencies only when needed
FROM node:18 AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
WORKDIR /app

RUN npm i -g pnpm

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

FROM node:18 AS toolkit
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENTRYPOINT ["scripts/docker-entrypoint-toolkit.sh"]

# Rebuild the source code only when needed
FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

# If using npm comment out above and use below instead
RUN PRISMA_BINARIES_MIRROR=http://prisma-builds.s3-eu-west-1.amazonaws.com npx prisma generate
ENV NODE_ENV production
RUN npx tsc && npm run build

# Production image, copy all the files and run next
FROM node:18 AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# Automatically leverage output traces to reduce image size
# TODO: revert to custom server
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/app app
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/node_modules node_modules
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/app app
# COPY --from=builder --chown=nextjs:nodejs /app/node_modules node_modules
# COPY --from=builder --chown=nextjs:nodejs /app/public public
# COPY --chown=nextjs:nodejs ./server.js ./server.js

COPY --from=builder --chown=nextjs:nodejs /app/package.json package.json
COPY --from=builder --chown=nextjs:nodejs /app/public public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist dist
COPY --from=builder --chown=nextjs:nodejs /app/.next .next

# COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# CMD ["node", "server.js"]
CMD ["npm", "run", "start-server"]