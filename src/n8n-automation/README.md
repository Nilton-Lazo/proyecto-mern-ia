# Automatización con n8n — Tutor Virtual

> 📘 **Documentación principal:** [N8N_INTEGRATION_GUIDE.md](./N8N_INTEGRATION_GUIDE.md) — Guía completa de integración (evaluadores, desarrolladores, evidencia técnica).

n8n es un **servicio externo** de automatización. Se ejecuta por separado del backend y del frontend. Esta carpeta solo contiene workflows exportables, documentación y ejemplos.

## ¿Qué hace n8n en este proyecto?

- Recibe webhooks desde el backend MERN
- Orquesta notificaciones, recordatorios y flujos de IA
- Registra evidencia de automatización vía logs en MongoDB

**n8n no reemplaza** la lógica principal del backend. Si n8n falla, el sistema sigue funcionando.

## URL de prueba actual

```
http://localhost:5678/webhook-test/test-n8n
```

Configurada en backend como `N8N_TEST_WEBHOOK_URL`.

## URL de producción (workflow activo)

```
http://localhost:5678/webhook/test-n8n
```

Usar cuando el workflow esté activo en n8n (toggle Active).

## Estructura

```
src/n8n-automation/
  workflows/           ← JSON para importar en n8n
  docs/                ← Guías de instalación y prueba
  examples/            ← Payloads de ejemplo
  README.md
```

## Probar conexión backend → n8n

### Test genérico
```bash
curl http://localhost:3000/api/automation/test-n8n
```

### Activity Assigned (workflow activo)
```bash
curl http://localhost:3000/api/automation/test-activity-assigned
```

Webhook de prueba:
```
http://localhost:5678/webhook-test/activity-assigned
```

Guía webhook: [docs/N8N_ACTIVITY_ASSIGNED.md](./docs/N8N_ACTIVITY_ASSIGNED.md)

**Automatización completa (notificaciones in-app visibles para el estudiante):**
[docs/ACTIVITY_ASSIGNED_AUTOMATION.md](./docs/ACTIVITY_ASSIGNED_AUTOMATION.md)

## Endpoints del backend

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/automation/test-n8n` | No | Prueba conexión genérica |
| GET | `/api/automation/test-activity-assigned` | No | Prueba workflow Activity Assigned |
| GET | `/api/automation/pending-activities` | API key | Actividades pendientes |
| POST | `/api/automation/workflow-log` | API key | Registrar log manual |
| GET | `/api/automation/workflow-logs` | API key | Consultar logs |
| GET | `/api/automation/teacher-weekly-summary` | API key | Resumen semanal docente |
| POST | `/api/notifications/bulk` | API key | Crear notificaciones in-app (n8n) |
| GET | `/api/notifications/me` | JWT estudiante | Mis notificaciones |
| PATCH | `/api/notifications/:id/read` | JWT estudiante | Marcar como leída |

## Workflows

| Archivo | Estado | Propósito |
|---------|--------|-----------|
| `test-n8n-connection.json` | **Usar ahora** | Prueba backend ↔ n8n |
| `activity-assigned-notification.json` | Próximo | Notificar actividad asignada |
| `reading-reminder-workflow.json` | Próximo | Recordatorios de lectura |
| `weekly-teacher-report.json` | Próximo | Reporte semanal docente |
| `generate-questions-backend.json` | Próximo | Preguntas vía IA |
| `detect-biases-backend.json` | Próximo | Detección de sesgos |

## Instalación de n8n (sin Docker)

```bash
npm install -g n8n
n8n start
```

Alternativa: `npx n8n`

Más detalles: [docs/N8N_SETUP.md](./docs/N8N_SETUP.md)

## Variables de entorno (backend)

Ver `src/backend/.env.example`:

```env
N8N_BASE_URL=http://localhost:5678
N8N_TEST_WEBHOOK_URL=http://localhost:5678/webhook-test/test-n8n
N8N_INTERNAL_API_KEY=change_me
N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL=http://localhost:5678/webhook-test/activity-assigned
```

## Documentación

- [N8N_TEST_CONNECTION.md](./docs/N8N_TEST_CONNECTION.md) — Probar conexión paso a paso
- [N8N_SETUP.md](./docs/N8N_SETUP.md) — Instalación general
- [WORKFLOWS.md](./docs/WORKFLOWS.md) — Detalle de cada workflow
- [webhook-payloads.json](./examples/webhook-payloads.json) — Ejemplos de payloads
