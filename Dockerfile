# Base image
FROM node:20-alpine AS base
RUN npm install -g pnpm

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Args
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

# Check URI
RUN echo "Checking MONGODB_URI..." && \
    if [ -z "$MONGODB_URI" ]; then \
        echo "Error: MONGODB_URI is not set" && \
        exit 1; \
    fi && \
    echo "MONGODB_URI is set. First 10 characters: ${MONGODB_URI:0:10}..." && \
    if [[ "$MONGODB_URI" != mongodb* ]]; then \
        echo "Error: MONGODB_URI does not start with 'mongodb'" && \
        exit 1; \
    fi

# Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Environment variable check
RUN if [ -z "$MONGODB_URI" ]; then \
    echo "Error: MONGODB_URI is required for build" && exit 1; \
    fi

RUN pnpm run build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

# Non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy .env files
COPY --from=builder /app/.env.production ./.env.production
COPY --from=builder /app/.env ./.env

# Permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Port
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]