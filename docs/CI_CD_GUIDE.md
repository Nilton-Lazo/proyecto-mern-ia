# Guía CI/CD — Tutor Virtual MERN IA

Este documento describe el pipeline de **Integración Continua (CI)** configurado en GitHub Actions y el camino preparado para **Despliegue Continuo (CD)** futuro.

---

## ¿Qué es CI/CD en este proyecto?

| Concepto | Qué hace aquí |
|----------|----------------|
| **CI** | En cada push o pull request a `main`, `master` o `rama-steven`, GitHub Actions valida automáticamente backend y frontend. |
| **CD** | **No está activo.** El workflow incluye comentarios con orientación para conectar Vercel, Render o Railway cuando el equipo lo decida. |

---

## Archivo de workflow

```
.github/workflows/ci.yml
```

**Nombre del workflow:** `CI - Tutor Virtual MERN IA`

### Ramas que activan el pipeline

| Evento | Ramas |
|--------|-------|
| `push` | `main`, `master`, `rama-steven` |
| `pull_request` | `main`, `master`, `rama-steven` |

> Si la rama principal del equipo es solo `main`, las otras ramas se mantienen por compatibilidad con el flujo Git del proyecto.

---

## Jobs del pipeline

### 1. `backend` — Backend: tests y sintaxis

Valida el código del servidor sin modificar lógica de negocio ni conectar servicios reales.

| Paso | Comando | Descripción |
|------|---------|-------------|
| Instalar deps | `pnpm install --frozen-lockfile` | Workspace pnpm (raíz + `src/backend` + `src/frontend`) |
| Sintaxis | `node --check src/backend/index.js` | Verifica que el entrypoint cargue sin error de sintaxis |
| Unit tests | `pnpm test:unit:backend` | Jest — `jest.unit.backend.config.cjs` |
| Integración API | `pnpm test:integration:api` | Supertest — `jest.integration.api.config.cjs` |

**Scripts en `package.json` (raíz):** los tests viven en la raíz del monorepo pnpm, no en `src/backend/package.json`.

### 2. `frontend` — Frontend: lint, tests y build

| Paso | Comando | Descripción |
|------|---------|-------------|
| Lint | `pnpm --filter frontend run lint` | ESLint en `src/frontend` |
| Unit tests | `pnpm test:unit:frontend` | Jest + Testing Library |
| Integración MSW | `pnpm test:integration:frontend` | Jest con mocks de red |
| Build | `pnpm build:frontend` | `tsc -b && vite build` |

### 3. `e2e` — Cypress (desactivado)

El job E2E está **comentado** en el workflow porque `pnpm test:e2e` (`scripts/run-e2e.sh`) requiere:

- MongoDB en ejecución
- Backend en `:3000`
- Frontend en `:5173`
- Seed de usuarios (`pnpm seed:e2e`)

Hasta que se configuren servicios en CI, E2E se ejecuta **solo de forma local**.

### 4. `deploy` — CD futuro (desactivado)

No hay despliegue automático. Ver sección [CD futuro](#cd-futuro-despliegue).

---

## Gestor de paquetes y caché

El proyecto usa **pnpm workspace** (`pnpm-workspace.yaml`):

```yaml
packages:
  - 'src/backend'
  - 'src/frontend'
```

- **Versión pnpm:** `10.15.1` (declarada en `src/backend/package.json`)
- **Instalación:** siempre desde la raíz con `pnpm install --frozen-lockfile`
- **Caché:** `actions/setup-node@v4` con `cache: pnpm`

No se mezclan npm/yarn.

---

## Variables de entorno en CI

El job `backend` usa **valores de prueba**. No se leen secretos reales ni `.env` del repositorio.

| Variable | Valor en CI | Notas |
|----------|-------------|-------|
| `NODE_ENV` | `test` | |
| `PORT` | `3000` | |
| `JWT_SECRET` | `test_secret` | Solo para tests |
| `JWT_EXPIRES` | `7d` | |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/tutor_virtual_test` | Tests mockean modelos; no conecta BD real |
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | Ollama mockeado en Jest |
| `OLLAMA_MODEL` | `llama3:8b` | |
| `N8N_BASE_URL` | `http://localhost:5678` | No se llama n8n real en CI |
| `N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL` | `http://localhost:5678/webhook/activity-assigned` | |
| `N8N_INTERNAL_API_KEY` | `change_me` | |

El job `frontend` usa:

| Variable | Valor en CI |
|----------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api` |

---

## Artefactos (coverage)

Tras cada ejecución, se suben reportes de cobertura (si existen):

| Artifact | Rutas |
|----------|-------|
| `coverage-backend` | `coverage/unit-backend/`, `coverage/integration-api/` |
| `coverage-frontend` | `coverage/unit-frontend/`, `coverage/integration-frontend/` |

Descarga: GitHub → Actions → run → **Artifacts** al final de la página.

Los reportes HTML están en `lcov-report/index.html` dentro de cada carpeta.

---

## Cómo leer errores del pipeline

1. Ve a **GitHub → Actions → CI - Tutor Virtual MERN IA**.
2. Abre el run fallido.
3. Revisa qué job falló: `backend` o `frontend`.
4. Expande el step con ❌ (ej. `Unit tests — backend`).
5. El log muestra el mismo output que verías en terminal local.

Errores frecuentes:

| Síntoma | Causa probable |
|---------|----------------|
| `pnpm install --frozen-lockfile` falla | `pnpm-lock.yaml` desactualizado — ejecuta `pnpm install` local y commitea el lockfile |
| Jest timeout | Test de integración esperando servicio real — debe estar mockeado |
| `tsc` / build falla | Error de tipos TypeScript en frontend |
| ESLint falla | Reglas en `src/frontend/eslint.config.js` |

---

## Validación local antes de push

Ejecuta desde la **raíz del repositorio**:

```bash
# 1. Dependencias
pnpm install --frozen-lockfile

# 2. Backend
node --check src/backend/index.js
pnpm test:unit:backend
pnpm test:integration:api

# 3. Frontend
pnpm --filter frontend run lint
pnpm test:unit:frontend
pnpm test:integration:frontend
VITE_API_URL=http://localhost:3000/api pnpm build:frontend

# 4. (Opcional) Pipeline Jest completo
pnpm test
```

### Scripts disponibles por paquete

**Raíz (`package.json`):**

| Script | Acción |
|--------|--------|
| `test:unit:backend` | Unit tests backend + coverage |
| `test:unit:frontend` | Unit tests frontend + coverage |
| `test:integration:api` | Integración API Supertest + coverage |
| `test:integration:frontend` | Integración frontend MSW + coverage |
| `build:frontend` | Build de producción Vite |
| `test:e2e` | Cypress (local, requiere servicios) |

**`src/backend/package.json`:** solo `start` y `dev` (sin lint/test propios).

**`src/frontend/package.json`:** `dev`, `build`, `lint`, `preview` (sin script `test` — tests en raíz).

---

## CD futuro (despliegue)

Cuando el equipo configure una plataforma, el flujo típico sería:

| Componente | Plataforma sugerida | Secretos GitHub |
|------------|---------------------|-----------------|
| Frontend React | [Vercel](https://vercel.com) o Netlify | `VERCEL_TOKEN`, `VITE_API_URL` (env de build) |
| Backend Express | [Render](https://render.com) o [Railway](https://railway.app) | `RENDER_API_KEY`, `JWT_SECRET`, `MONGODB_URI`, vars `N8N_*` |
| MongoDB | [MongoDB Atlas](https://www.mongodb.com/atlas) | `MONGODB_URI` |
| n8n | Servidor propio / n8n Cloud | `N8N_*` webhooks y API key |

### Cómo agregar secretos en GitHub

1. Repositorio → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Nombre en MAYÚSCULAS (ej. `JWT_SECRET`)
4. Valor real de producción (nunca commitear en el repo)

### Job deploy (plantilla)

El bloque comentado al final de `.github/workflows/ci.yml` muestra dónde agregar un job `deploy` que:

- Solo corra en `push` a `main`
- Dependa de `backend` y `frontend` exitosos
- Use `environment: production` para aprobaciones manuales opcionales

---

## Qué revisar en GitHub Actions después del push

1. **Badge verde** en el commit o PR.
2. Ambos jobs (`backend`, `frontend`) en verde.
3. Artifacts `coverage-backend` y `coverage-frontend` generados.
4. En PRs: checks requeridos antes de merge (configurable en branch protection).

---

## Diagnóstico del workflow anterior

El `ci.yml` previo tenía un **job único** `unit-and-integration` que:

- ✅ Ejecutaba los 4 suites Jest correctamente
- ✅ Subía artifacts de coverage
- ⚠️ Usaba `pnpm@9` vía corepack (el proyecto declara `pnpm@10.15.1`)
- ⚠️ No incluía `master` en PRs ni build del frontend
- ⚠️ No incluía lint ni syntax check del backend
- ⚠️ No separaba jobs backend/frontend (menos paralelismo)
- ⚠️ Faltaban variables de entorno explícitas para n8n/Ollama/MongoDB en CI

El workflow actual conserva la misma estrategia de tests en raíz y mejora seguridad, paralelismo y cobertura del pipeline.

---

## Referencias

- [tests/README.md](../tests/README.md) — documentación de pruebas
- [README.md](../README.md) — instalación y comandos generales
- [.github/workflows/ci.yml](../.github/workflows/ci.yml) — definición del pipeline
