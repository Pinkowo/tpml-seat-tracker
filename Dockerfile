# syntax=docker/dockerfile:1.7

# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production

# Install dependencies with layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
