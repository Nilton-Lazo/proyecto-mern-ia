# Estrategia de pruebas — Tutor Virtual I.E.P. San Carlos

Organización profesional alineada al proyecto académico (ICACIT).

## Pirámide de pruebas

| Tipo | Herramienta | Carpeta | Qué prueba |
|------|-------------|---------|------------|
| **Unitarias backend** | Jest | `tests/unit/backend/` | Lógica pura (utils, middlewares) |
| **Unitarias frontend** | Jest + React Testing Library | `tests/unit/frontend/` | Componentes y páginas aislados |
| **Integración API** | Jest + Supertest | `tests/integration/api/` | Rutas Express con mocks de BD |
| **Integración frontend** | RTL + mock API / MSW* | `tests/integration/frontend/` | UI + capa HTTP simulada |

\* Handlers MSW preparados en `tests/support/msw/` para ampliación.
| **Aceptación / E2E** | Cypress | `cypress/e2e/` | Flujo completo usuario real |
| **Contrato API manual/CI** | Postman + Newman | `tests/postman/` | Endpoints HTTP documentados |

> **Nota:** "E2E" = pruebas de extremo a extremo (Cypress). No confundir con CO₂ u otras métricas.

## Estructura de carpetas

```
tests/
├── unit/
│   ├── backend/          # Jest — skillScoring, auth.middleware
│   └── frontend/         # Jest + RTL — Login, Activities, etc.
├── integration/
│   ├── api/              # Supertest — auth, teacher, student, ai
│   └── frontend/         # MSW — StudentActivities.integration
├── postman/
│   ├── collections/      # Colección Newman + legado Gestión Usuarios
│   └── environments/     # Variables local / docker
├── support/
│   ├── jest.setup.js
│   ├── jest.frontend.setup.js
│   ├── env.jest.ts
│   └── msw/              # Handlers Mock Service Worker
cypress/                  # E2E (aceptación)
coverage/                 # Reportes HTML (generados, no commitear)
├── unit-backend/lcov-report/index.html
├── unit-frontend/lcov-report/index.html
├── integration-api/lcov-report/index.html
└── integration-frontend/lcov-report/index.html
```

## Entornos

### Desarrollo local (sin Docker)
```bash
# 1. MongoDB corriendo en :27017
# 2. Backend + frontend
pnpm dev:backend    # :3000
pnpm dev:frontend   # :5173
```

### Docker (solo backend + frontend)
MongoDB **fuera** de Docker (como usas ahora):
```bash
cp docker/.env.example .env   # opcional
docker compose up -d --build
# Backend conecta a Mongo en host: mongodb://host.docker.internal:27017/tutor-lectura
```

## Comandos por tipo de prueba

### 1. Unitarias backend
```bash
pnpm test:unit:backend
pnpm coverage:open:unit-backend    # abre HTML en navegador
```

### 2. Unitarias frontend
```bash
pnpm test:unit:frontend
pnpm coverage:open:unit-frontend
```

### 3. Integración API (Supertest)
```bash
pnpm test:integration:api
pnpm coverage:open:integration-api
```

### 4. Integración frontend (MSW)
```bash
pnpm test:integration:frontend
pnpm coverage:open:integration-frontend
```

### 5. Todas las pruebas Jest (unit + integration)
```bash
pnpm test
```

### 6. E2E / Aceptación (Cypress)
Requiere: MongoDB + backend + frontend activos.
```bash
pnpm seed:e2e          # usuarios luis@gmail.com / joel@gmail.com
pnpm test:e2e          # verifica servicios + corre Cypress
pnpm cy:open           # modo interactivo
```

### 7. Postman / Newman (API real)
Requiere: backend + MongoDB + usuarios sembrados.
```bash
pnpm seed:e2e
pnpm test:postman
# Importar manualmente: tests/postman/collections/tutor-virtual-api.postman_collection.json
```

### 8. Todo el pipeline local
```bash
pnpm test:all          # Jest + Cypress E2E
```

## Reportes de coverage (HTML)

Tras ejecutar tests con `--coverage`, abre:

| Tipo | Ruta HTML |
|------|-----------|
| Unit backend | `coverage/unit-backend/lcov-report/index.html` |
| Unit frontend | `coverage/unit-frontend/lcov-report/index.html` |
| Integración API | `coverage/integration-api/lcov-report/index.html` |
| Integración frontend | `coverage/integration-frontend/lcov-report/index.html` |

En macOS: `pnpm coverage:open:unit-backend` (etc.)

## Cypress — por qué fallaba

Cypress necesita **servicios reales**:
1. MongoDB en `:27017`
2. Backend en `:3000`
3. Frontend en `:5173`
4. Usuarios E2E (`pnpm seed:e2e`)

No depende de Docker para Mongo; tú lo corres aparte. El script `pnpm test:e2e` verifica todo antes de ejecutar.

## Postman legado

Las colecciones en `tests/postman/collections/` bajo "Gestión de Usuarios" referían rutas antiguas (`/api/users/me`). La colección principal actualizada es `tutor-virtual-api.postman_collection.json`.
