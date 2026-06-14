# Frontend — contexto: raíz del monorepo
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY src/frontend/package.json ./src/frontend/

RUN pnpm install --filter frontend --frozen-lockfile || pnpm install --filter frontend

COPY src/frontend ./src/frontend

WORKDIR /app/src/frontend

ENV HOST=0.0.0.0
ENV PORT=5173

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
