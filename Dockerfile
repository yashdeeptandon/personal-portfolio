# Stage 1: Install dependencies
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build Next.js
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Dummy values so build doesn't fail on missing env — real values injected at runtime
ENV NEXTAUTH_SECRET=build-placeholder
ENV NEXTAUTH_URL=http://localhost:3000
ENV MONGODB_URI=mongodb://placeholder
ENV DATABASE_NAME=placeholder
RUN npm run build

# Stage 3: Production runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# Python3 + unzip for Apple Health data pipeline
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv unzip \
  && rm -rf /var/lib/apt/lists/*

# Isolated Python venv with pipeline dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir numpy pandas scipy

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PYTHON_CMD=/opt/venv/bin/python3
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Next.js standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Python health pipeline scripts (process.cwd()/apple-health-data-analysis-master)
COPY --chown=nextjs:nodejs apple-health-data-analysis-master ./apple-health-data-analysis-master

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
