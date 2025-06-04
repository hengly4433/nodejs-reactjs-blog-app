# ─── frontend/Dockerfile ───────────────────────────────────────────────────────

# 1) Build stage: use Node to build the Vite/React app
FROM node:18-alpine AS build
WORKDIR /app

# 1.A) Copy package files & install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# 1.B) Copy the Vite config, tsconfig, and the entry HTML into /app
COPY tsconfig.json vite.config.ts ./
COPY index.html ./                   

# 1.C) Copy any static assets (favicon, images) from public/
COPY public ./public

# 1.D) Copy all sources
COPY src ./src

# 1.E) Build for production
RUN npm run build

# ─── Production stage: serve the built files with nginx ────────────────────────
FROM nginx:stable-alpine AS production

# 2.A) Remove the default nginx html
RUN rm -rf /usr/share/nginx/html/*

# 2.B) Copy the build result from the “build” stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
