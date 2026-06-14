#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/tutor-lectura}"
BASE_API="${BASE_API:-http://localhost:3000/api}"

echo "▶ Verificando MongoDB en $MONGODB_URI..."
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => { console.log('✓ MongoDB OK'); return mongoose.disconnect(); })
  .catch((e) => { console.error('✗ MongoDB no disponible:', e.message); process.exit(1); });
"

echo "▶ Verificando backend en $BASE_API..."
curl -sf "${BASE_API%/api}/" >/dev/null || {
  echo "✗ Backend no responde. Ejecuta: pnpm dev:backend  o  docker compose up -d"
  exit 1
}
echo "✓ Backend OK"

echo "▶ Sembrando usuarios E2E..."
node scripts/seed-e2e-users.js

echo "▶ Verificando frontend en http://localhost:5173..."
curl -sf http://localhost:5173 >/dev/null || {
  echo "✗ Frontend no responde. Ejecuta: pnpm dev:frontend  o  docker compose up -d"
  exit 1
}
echo "✓ Frontend OK"

echo "▶ Ejecutando Cypress E2E..."
pnpm exec cypress run "$@"
