# Probar conexión backend ↔ n8n

Guía paso a paso para verificar que el backend MERN llama correctamente al webhook de n8n.

## Requisitos

- Node.js 18+
- MongoDB activo (para logs en `WorkflowLog`)
- n8n instalado y ejecutándose

## 1. Ejecutar n8n

```bash
n8n start
```

Panel: **http://localhost:5678**

## 2. Crear workflow de prueba en n8n

Opción A — **Importar** el JSON incluido:

```
src/n8n-automation/workflows/test-n8n-connection.json
```

Opción B — **Crear manualmente**:

1. Nuevo workflow
2. Agregar nodo **Webhook**
   - Method: `POST`
   - Path: `test-n8n`
   - Respond: **Using Respond to Webhook Node**
3. Agregar nodo **Respond to Webhook**
   - Respond With: JSON
   - Body: `{ "ok": true, "received": true }`
4. Conectar Webhook → Respond to Webhook

## 3. URLs del webhook

| Modo | URL |
|------|-----|
| **Prueba** (Listen for test event) | `http://localhost:5678/webhook-test/test-n8n` |
| **Producción** (workflow activo) | `http://localhost:5678/webhook/test-n8n` |

Para desarrollo usa la URL de **prueba** en `.env`.

## 4. Escuchar evento de prueba en n8n

1. Abre el workflow en n8n
2. Haz clic en el nodo **Webhook**
3. Pulsa **Listen for test event**
4. Deja n8n escuchando mientras pruebas desde el backend

> Si no está escuchando, el backend recibirá error de conexión o timeout.

## 5. Configurar backend

Copia y edita el entorno:

```bash
cp src/backend/.env.example src/backend/.env
```

Asegúrate de tener:

```env
N8N_BASE_URL=http://localhost:5678
N8N_TEST_WEBHOOK_URL=http://localhost:5678/webhook-test/test-n8n
N8N_INTERNAL_API_KEY=change_me
```

**Reinicia el backend** después de cambiar `.env`.

## 6. Ejecutar backend

```bash
pnpm dev:backend
# o desde src/backend: npm run dev
```

## 7. Probar conexión

### Navegador o curl

```bash
curl http://localhost:3000/api/automation/test-n8n
```

### Postman

```
GET http://localhost:3000/api/automation/test-n8n
```

No requiere autenticación ni API key.

## 8. Respuesta esperada (éxito)

```json
{
  "success": true,
  "message": "Backend conectado correctamente con n8n",
  "data": {
    "source": "backend",
    "event": "test_connection",
    "webhookUrl": "http://localhost:5678/webhook-test/test-n8n",
    "n8nResponse": { "ok": true, "received": true }
  }
}
```

## 9. Respuesta esperada (fallo)

```json
{
  "success": false,
  "message": "No se pudo conectar con n8n. Verifica que n8n esté ejecutándose en http://localhost:5678",
  "error": "fetch failed"
}
```

## 10. Verificar logs en MongoDB

Cada prueba guarda un registro en la colección `workflowlogs`:

```bash
curl "http://localhost:3000/api/automation/workflow-logs?workflowName=test-n8n&limit=5" \
  -H "x-n8n-api-key: change_me"
```

Campos registrados:

- `workflowName`: `test-n8n`
- `eventType`: `test_connection`
- `status`: `success` o `failed`
- `payload`: datos enviados al webhook
- `response`: respuesta de n8n

## 11. Solución de problemas

| Problema | Solución |
|----------|----------|
| `N8N_TEST_WEBHOOK_URL no está configurada` | Agrega la variable en `src/backend/.env` y reinicia |
| Timeout / fetch failed | n8n no está corriendo o no escucha el test event |
| 404 en webhook | Verifica path `test-n8n` y que estés en modo test o producción |
| Backend no cambia | Reinicia después de editar `.env` |
| Logs vacíos | Verifica MongoDB conectado |

## 12. Pasar de test a producción

1. Activa el workflow en n8n (toggle **Active**)
2. Cambia en `.env`:
   ```env
   N8N_TEST_WEBHOOK_URL=http://localhost:5678/webhook/test-n8n
   ```
3. Reinicia el backend
4. Prueba de nuevo con `GET /api/automation/test-n8n`
