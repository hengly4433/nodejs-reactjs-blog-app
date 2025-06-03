# ────────────────────────────────────────────────────────────────
# Stage 1: Build stage (compile TypeScript → JS into build/)
# ────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

# 1) Set working directory
WORKDIR /app

# 2) Copy package.json and package-lock.json (to install dependencies)
COPY package.json package-lock.json ./

# 3) Install all dependencies, including devDependencies
RUN npm ci

# 4) Copy tsconfig.json and source code
COPY tsconfig.json ./
COPY src ./src

# 5) Build the TypeScript code (tsc → build/)
RUN npm run build

# ────────────────────────────────────────────────────────────────
# Stage 2: Production stage (only production deps + compiled JS)
# ────────────────────────────────────────────────────────────────
FROM node:18-alpine

# 1) Create a non-root user for security (optional)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# 2) Copy package.json & package-lock.json (so we can install production deps)
COPY package.json package-lock.json ./

# 3) Install only production dependencies
RUN npm ci --omit=dev

# 4) Copy the compiled files (plus openapi.yaml) from builder
COPY --from=builder /app/build ./build

# 5) Chown everything to non-root user (optional)
RUN chown -R appuser:appgroup /app

# 6) Switch to the non-root user
USER appuser

# 7) Expose port (as defined in your app)
EXPOSE 4000

# 8) Run the application (point at the built JS)
CMD ["node", "build/index.js"]
