# Backend — Multi-stage production Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---- Dependencies ----
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production
COPY prisma ./prisma/
RUN npx prisma generate

# ---- Build ----
FROM base AS builder
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci
COPY prisma ./prisma/
RUN npx prisma generate
COPY src ./src/
RUN npm run build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
COPY entrypoint.sh ./

RUN chmod +x /app/entrypoint.sh

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["/bin/sh", "/app/entrypoint.sh"]
