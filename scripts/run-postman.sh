#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BASE_URL="${BASE_URL:-http://localhost:3000}"
echo "▶ Postman/Newman contra $BASE_URL"

pnpm exec newman run tests/postman/collections/tutor-virtual-api.postman_collection.json \
  -e tests/postman/environments/local.postman_environment.json \
  --env-var "base_url=$BASE_URL" \
  "$@"
