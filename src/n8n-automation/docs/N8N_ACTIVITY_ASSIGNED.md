# Activity Assigned — Integración backend ↔ n8n

Workflow en n8n: **Activity Assigned Notification**

Cuando un docente asigna una actividad, el backend MERN envía un POST al webhook de n8n con los datos de la actividad y los estudiantes.

## URLs del webhook

| Modo | URL |
|------|-----|
| **Prueba** (Listen for test event) | `http://localhost:5678/webhook-test/activity-assigned` |
| **Producción** (workflow activo) | `http://localhost:5678/webhook/activity-assigned` |

Variable en backend:

```env
N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL=http://localhost:5678/webhook-test/activity-assigned
```

## 1. Ejecutar n8n

```bash
n8n start
```

Panel: http://localhost:5678

## 2. Abrir workflow

**Activity Assigned Notification**

## 3. Escuchar eventos de prueba

1. Abre el nodo **Webhook**
2. Pulsa **Listen for test event**
3. Deja n8n escuchando

## 4. Configurar backend

En `src/backend/.env`:

```env
N8N_BASE_URL=http://localhost:5678
N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL=http://localhost:5678/webhook-test/activity-assigned
N8N_INTERNAL_API_KEY=change_me
```

Reinicia el backend después de cambiar `.env`.

## 5. Ejecutar backend

```bash
pnpm dev:backend
```

## 6. Probar endpoint de diagnóstico

```bash
curl http://localhost:3000/api/automation/test-activity-assigned
```

Respuesta esperada:

```json
{
  "success": true,
  "message": "Prueba enviada a n8n correctamente",
  "data": {
    "success": true,
    "message": "Evento enviado correctamente a n8n",
    "workflow": "activity-assigned-notification",
    "webhookUrl": "http://localhost:5678/webhook-test/activity-assigned"
  }
}
```

## 7. Verificar en n8n

En el panel de n8n debe aparecer la ejecución con el payload de prueba:

- `event`: `activity_assigned`
- `title`: `Lectura de prueba desde backend`
- `students`: array con estudiante de prueba

## 8. Probar flujo real (docente asigna actividad)

1. Inicia sesión como docente
2. Crea y asigna una actividad desde la plataforma
3. El backend responde:

```json
{
  "success": true,
  "message": "Actividad asignada correctamente",
  "activity": { ... },
  "automation": {
    "n8nTriggered": true,
    "message": "Evento enviado correctamente a n8n"
  }
}
```

4. Verifica la ejecución en n8n

## 9. Revisar logs en MongoDB

```bash
curl "http://localhost:3000/api/automation/workflow-logs?workflowName=activity-assigned-notification&limit=5" \
  -H "x-n8n-api-key: change_me"
```

Campos guardados:

- `workflowName`: `activity-assigned-notification`
- `eventType`: `activity_assigned`
- `status`: `success` o `failed`
- `payload`, `response`, `activityId`, `teacherId`

## 10. Pasar a Production URL

1. Activa el workflow en n8n (toggle **Active**)
2. Cambia en `.env`:

```env
N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL=http://localhost:5678/webhook/activity-assigned
```

3. Reinicia el backend

## Payload de referencia

Ver: `examples/activity-assigned-payload.json`

## Comportamiento si n8n falla

- La actividad **siempre se crea** en MongoDB
- El frontend recibe `success: true` con `automation.n8nTriggered: false`
- El error queda registrado en `WorkflowLog` y en consola del backend

## Solución de problemas

| Problema | Solución |
|----------|----------|
| 503 al probar | n8n no está corriendo o no escucha test event |
| URL no configurada | Agrega `N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL` en `.env` |
| Actividad se crea pero n8n no recibe | Verifica Listen for test event activo |
| Timeout | Aumenta `N8N_WEBHOOK_TIMEOUT_MS` en `.env` |
