FROM node:21-alpine AS base
WORKDIR /app
COPY *.json ./
RUN npm ci

# ---- Build ----
FROM base AS build
WORKDIR /app
COPY . .
RUN npm run build

# ---- Release ----
FROM base AS release
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm prune --production
CMD ["node", "dist/index.js"]
