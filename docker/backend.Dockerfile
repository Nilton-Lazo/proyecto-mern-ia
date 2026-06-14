# Backend — contexto: raíz del monorepo
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY src/backend/package.json ./src/backend/

RUN pnpm install --filter backend --frozen-lockfile || pnpm install --filter backend

COPY src/backend ./src/backend

WORKDIR /app/src/backend

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
