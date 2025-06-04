# ────────────────────────────────────────────────────────────────
# Stage 1: Build stage (compile TypeScript → JS into /app/build)
# ────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

# 1) Set working directory
WORKDIR /app

# 2) Copy package.json & package-lock.json (for npm ci)
COPY package.json package-lock.json ./

# 3) Install all dependencies, including devDependencies
RUN npm ci

# 4) Copy tsconfig.json and source code
COPY tsconfig.json ./
COPY src ./src

# 5) Build the TypeScript code (tsc → /app/build)
RUN npm run build

# ────────────────────────────────────────────────────────────────
# Stage 2: Production stage (only production deps + compiled JS)
# ────────────────────────────────────────────────────────────────
FROM node:18-alpine

# 1) Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# 2) Copy package.json & package-lock.json so we can install production deps
COPY package.json package-lock.json ./

# 3) Install only production dependencies
RUN npm ci --omit=dev

# 4) Copy the compiled files (plus any other static assets)
COPY --from=builder /app/build ./build

# 5) Create the uploads directory (so Multer can write to it later)
#    We must replicate the same path your code uses: e.g. `/app/uploads/posts`
RUN mkdir -p /app/uploads/posts \
  && chown -R appuser:appgroup /app/uploads

# 6) (Optional) If you serve openapi.yml at runtime (Swagger UI), copy it here
#    Uncomment if you have an openapi.yml file in your backend folder root.
# COPY openapi.yml ./openapi.yml

# 7) Ensure everything under /app is owned by appuser
RUN chown -R appuser:appgroup /app

# 8) Switch to the non-root user
USER appuser

# 9) Expose the port your app listens on
EXPOSE 4000

# 10) Run the application (point at the built JS entrypoint)
CMD ["node", "build/index.js"]
