# Stage 1: Dependencies
FROM nvidia/cuda:12.3.1-runtime-ubuntu22.04 AS deps

# Install Node.js and Bun
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM nvidia/cuda:12.3.1-runtime-ubuntu22.04 AS builder

# Install Node.js and Bun
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lockb* ./

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_SENTRY_DSN
ARG VITE_SENTRY_ORG
ARG VITE_SENTRY_PROJECT
ARG VITE_SERVER_URL
ARG SENTRY_AUTH_TOKEN
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET

# Set build-time environment variables
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_SENTRY_ORG=$VITE_SENTRY_ORG
ENV VITE_SENTRY_PROJECT=$VITE_SENTRY_PROJECT
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET

# Build the application
RUN bun run build

# Stage 3: Runtime
FROM nvidia/cuda:12.3.1-runtime-ubuntu22.04 AS runtime

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (for runtime)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create a non-root user
RUN useradd -m -u 1001 -s /bin/bash appuser

# Copy built application from builder stage
COPY --from=builder --chown=appuser:appuser /app/.output ./.output
COPY --from=builder --chown=appuser:appuser /app/package.json ./package.json

# Copy public assets if any
COPY --from=builder --chown=appuser:appuser /app/public ./public

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Runtime environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Enable NVIDIA GPU support
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the application
CMD ["node", ".output/server/index.mjs"]