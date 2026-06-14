# Automatización: Activity Assigned → Notificaciones in-app

Flujo completo de automatización visible para el estudiante cuando un docente asigna una actividad.

## Qué hace el flujo

```
Docente asigna actividad (frontend)
    ↓
Backend crea actividad y llama webhook n8n
    ↓
n8n recibe evento activity_assigned
    ↓
n8n prepara payload de notificaciones
    ↓
n8n llama POST /api/notifications/bulk (con API key)
    ↓
Backend crea una Notification por estudiante
    ↓
Estudiante ve la notificación en campana / panel
```

La creación de la actividad **no depende** de n8n: si n8n falla, la actividad ya quedó guardada.

## Workflow n8n

Archivo: `workflows/activity-assigned-notification.json`

Nodos:

1. **Webhook Activity Assigned** — `POST /activity-assigned`
2. **Edit Fields** — arma título, mensaje y lista de estudiantes
3. **Create In-App Notifications** — `POST /api/notifications/bulk`
4. **Respond to Webhook** — confirma al backend

## Variables de entorno

### Backend (`src/backend/.env`)

```env
N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL=http://localhost:5678/webhook-test/activity-assigned
N8N_INTERNAL_API_KEY=change_me
BACKEND_BASE_URL=http://localhost:3000
```

### n8n (Settings → Variables)

| Variable | Valor |
|----------|-------|
| `N8N_INTERNAL_API_KEY` | Mismo valor que en backend `.env` |
| `BACKEND_BASE_URL` | `http://localhost:3000` |

## Endpoint que llama n8n

```
POST {BACKEND_BASE_URL}/api/notifications/bulk
```

### Headers

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/json` |
| `x-n8n-api-key` | Valor de `N8N_INTERNAL_API_KEY` |

### Payload

```json
{
  "event": "activity_assigned",
  "activityId": "674abc123...",
  "title": "Nueva actividad asignada: Lectura sobre el medio ambiente",
  "message": "Área: Comunicación | Fecha límite: 2026-06-20",
  "students": [
    {
      "id": "674student001...",
      "name": "María García",
      "email": "maria@example.com"
    }
  ]
}
```

### Respuesta exitosa (201)

```json
{
  "success": true,
  "created": 2,
  "notifications": [
    { "id": "...", "userId": "...", "title": "...", "type": "activity_assigned", "activityId": "..." }
  ]
}
```

## Cómo probarlo

### 1. Preparar servicios

```bash
# Terminal 1 — MongoDB + backend
pnpm run dev:backend

# Terminal 2 — n8n
n8n start
```

Verifica en logs del backend:

```
N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL: configurada
```

### 2. Activar workflow en n8n

1. Importa `activity-assigned-notification.json`
2. Configura variables `N8N_INTERNAL_API_KEY` y `BACKEND_BASE_URL`
3. Activa el workflow
4. En desarrollo con `/webhook-test/`, usa **Listen for test event**

### 3. Probar endpoint bulk directamente (opcional)

```bash
curl -X POST http://localhost:3000/api/notifications/bulk \
  -H "Content-Type: application/json" \
  -H "x-n8n-api-key: change_me" \
  -d '{
    "event": "activity_assigned",
    "activityId": "674000000000000000000001",
    "title": "Nueva actividad asignada: Prueba",
    "message": "Área: Comunicación | Fecha límite: 2026-06-20",
    "students": [{ "id": "ID_ESTUDIANTE_REAL", "name": "Estudiante", "email": "est@example.com" }]
  }'
```

Logs esperados en backend:

```
n8n solicitó creación de notificaciones
notificaciones creadas correctamente (1)
```

### 4. Probar flujo completo desde el frontend docente

1. Inicia sesión como **docente**
2. Crea y asigna una actividad a uno o más estudiantes
3. Revisa ejecución en n8n (debe llamar a `/api/notifications/bulk`)
4. Inicia sesión como **estudiante** asignado
5. Verifica:
   - Campana en el header con badge de no leídas
   - Sección "Notificaciones recientes" en `/student/home`
   - Texto: **Nueva actividad asignada: [título]**
   - Subtítulo: **Área: … | Fecha límite: …**
6. Marca como leída — el badge debe disminuir

### 5. Probar conexión backend → n8n

```bash
curl http://localhost:3000/api/automation/test-activity-assigned
```

## Endpoints para el estudiante (JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/notifications/me` | Lista notificaciones del usuario |
| `PATCH` | `/api/notifications/:id/read` | Marca como leída |

## Errores comunes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| **n8n ejecuta pero el estudiante no ve nada** | El workflow solo tiene Webhook → Edit Fields → Respond to Webhook **sin** nodo HTTP Request | Agrega nodo **HTTP Request** entre Edit Fields y Respond to Webhook que llame a `POST /api/notifications/bulk` |
| `API key inválida` en backend | Keys distintas en n8n y backend | Unificar `N8N_INTERNAL_API_KEY` (header `x-n8n-api-key`) |
| `503 Automatización n8n no configurada` | Key = `change_me` o vacía | Definir key real en `.env` |
| Notificación no aparece | IDs de estudiante incorrectos | Verificar `students[].id` en payload n8n |
| Webhook no registrado | n8n no escuchando | **Listen for test event** o activar workflow |
| Actividad se crea pero sin notificación | n8n falló silenciosamente | Revisar ejecución en n8n y logs backend |

## Logs del backend

| Mensaje | Significado |
|---------|-------------|
| `n8n solicitó creación de notificaciones` | Llegó POST a `/bulk` con API key válida |
| `notificaciones creadas correctamente (N)` | N notificaciones insertadas |
| `API key inválida` | Header `x-n8n-api-key` incorrecto o ausente |
