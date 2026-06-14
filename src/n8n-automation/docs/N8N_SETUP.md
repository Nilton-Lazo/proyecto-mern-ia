# Instalación y configuración de n8n (sin Docker)

Guía paso a paso para integrar n8n con el Tutor Virtual de Lectura Crítica.

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:3000`
- MongoDB activo
- (Opcional) Ollama para flujos de IA

## 1. Instalar n8n localmente

```bash
npm install -g n8n
```

Alternativa sin instalación global:

```bash
npx n8n
```

## 2. Ejecutar n8n

```bash
n8n start
```

Abre el panel: **http://localhost:5678**

En el primer acceso, n8n pedirá crear una cuenta local de administrador.

## 3. Configurar variables en n8n

En n8n → **Settings → Variables** (o en el archivo de entorno de n8n):

| Variable | Valor |
|----------|-------|
| `N8N_INTERNAL_API_KEY` | Misma clave que en `src/backend/.env` |
| `BACKEND_URL` | `http://localhost:3000` (opcional, los workflows usan localhost por defecto) |

## 4. Configurar variables en el backend

Copia y edita `src/backend/.env`:

```bash
cp src/backend/.env.example src/backend/.env
```

Agrega:

```env
N8N_BASE_URL=http://localhost:5678
N8N_INTERNAL_API_KEY=clave_secreta_compartida
N8N_GENERATE_QUESTIONS_WEBHOOK_URL=http://localhost:5678/webhook/generate-questions
N8N_DETECT_BIASES_WEBHOOK_URL=http://localhost:5678/webhook/detect-biases
N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL=http://localhost:5678/webhook/activity-assigned
```

> Las URLs exactas del webhook aparecen en n8n al abrir el nodo **Webhook** de cada workflow importado.

## 5. Importar workflows

1. En n8n: **Workflows → Add workflow → Import from File**
2. Importa cada archivo de `src/n8n-automation/workflows/`:
   - `reading-reminder-workflow.json`
   - `activity-assigned-notification.json`
   - `weekly-teacher-report.json`
   - `generate-questions-backend.json`
   - `detect-biases-backend.json`
3. Revisa que las URLs apunten a `http://localhost:3000` (ajusta si tu backend usa otro puerto)
4. Activa cada workflow con el toggle **Active**

## 6. Copiar URLs de webhooks al .env

Para workflows con webhook:

1. Abre el workflow en n8n
2. Haz clic en el nodo **Webhook**
3. Copia **Production URL** o **Test URL**
4. Pégala en la variable correspondiente del `.env` del backend

Ejemplo:

```
N8N_ACTIVITY_ASSIGNED_WEBHOOK_URL=http://localhost:5678/webhook/activity-assigned
```

## 7. Probar conexión backend ↔ n8n

### Verificar configuración

```bash
curl -X POST http://localhost:3000/api/automation/test-webhook \
  -H "x-n8n-api-key: clave_secreta_compartida"
```

### Probar actividades pendientes

```bash
curl http://localhost:3000/api/automation/pending-activities \
  -H "x-n8n-api-key: clave_secreta_compartida"
```

### Probar webhook de actividad asignada (manual)

```bash
curl -X POST http://localhost:3000/api/automation/trigger-activity-assigned \
  -H "x-n8n-api-key: clave_secreta_compartida" \
  -H "Content-Type: application/json" \
  -d @src/n8n-automation/examples/webhook-payloads.json
```

> Ajusta el payload según el ejemplo `activityAssigned` en el JSON de ejemplos.

### Ejecutar workflow manualmente en n8n

1. Abre `reading-reminder-workflow` o `weekly-teacher-report`
2. Clic en **Execute workflow**
3. Verifica logs en MongoDB colección `workflowlogs` o vía:

```bash
curl "http://localhost:3000/api/automation/workflow-logs?limit=10" \
  -H "x-n8n-api-key: clave_secreta_compartida"
```

## 8. Configurar correo (opcional)

Los workflows actuales registran mensajes en logs. Para envío real:

1. En n8n, agrega un nodo **Send Email** o **SendGrid** después del nodo que construye el mensaje
2. Configura credenciales SMTP en n8n (no en el código del backend)
3. Variables opcionales en backend para futuro uso nativo:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=tutor@colegiosancarlos.edu.pe
```

## 9. Solución de problemas

| Problema | Solución |
|----------|----------|
| 401 API key inválida | Verifica que `N8N_INTERNAL_API_KEY` coincida en backend y header de n8n |
| 503 Automatización no configurada | Define `N8N_INTERNAL_API_KEY` en `.env` (no dejar `change_me`) |
| Webhook no responde | Activa el workflow en n8n y usa la URL de producción |
| Backend no llama a n8n | Verifica URLs en `.env`; sin URL el backend usa fallback directo |
| IA lenta en generate-questions | Ollama debe estar activo; timeout default 15s (`N8N_WEBHOOK_TIMEOUT_MS`) |

## 10. Evidencia para evaluación (ICACIT)

Los logs en `WorkflowLog` demuestran:

- Qué workflow se ejecutó
- Payload y respuesta
- Estado success/failed
- Fecha de ejecución
- Relación con actividad, estudiante o docente

Consulta: `GET /api/automation/workflow-logs`
