# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build TypeScript → JavaScript
# ─────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Production image (only prod deps + compiled JS)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine

# 1) Create a non-root user for extra security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# 2) Copy package.json so we can install only prodDeps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 3) Copy the compiled code from the builder stage
COPY --from=builder /app/build ./build

# 4) Create the `/app/uploads/posts` folder so Multer can write to it
RUN mkdir -p /app/uploads/posts \
  && chown -R appuser:appgroup /app/uploads

# 5) Make sure everything under /app is owned by the non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000
CMD ["node", "build/index.js"]
