# Documentación de workflows n8n

## 1. reading-reminder-workflow

| Campo | Valor |
|-------|-------|
| **Archivo** | `workflows/reading-reminder-workflow.json` |
| **Trigger** | Cron diario 8:00 (`0 8 * * *`) |
| **Backend** | `GET /api/automation/pending-activities` |
| **Log** | `POST /api/automation/workflow-log` |

**Entrada:** ninguna (automático por cron)

**Salida por estudiante:** log con mensaje de recordatorio

**Mensaje:**
> Hola {{studentName}}, tienes pendiente la actividad {{title}} del área {{area}}. Fecha límite: {{dueDate}}.

**Errores posibles:**
- 401 sin API key
- Backend caído → workflow falla en nodo HTTP
- Sin actividades pendientes → no genera logs

**Evidencia:** registros en `WorkflowLog` con `workflowName: reading-reminder-workflow`

---

## 2. activity-assigned-notification

| Campo | Valor |
|-------|-------|
| **Archivo** | `workflows/activity-assigned-notification.json` |
| **Trigger** | Webhook POST `/webhook/activity-assigned` |
| **Disparado por** | Backend al crear actividad (`POST /api/teacher/activities`) |
| **Log** | `POST /api/automation/workflow-log` por estudiante |

**Entrada:** ver `examples/webhook-payloads.json → activityAssigned`

**Salida:** `{ ok: true, processed: N }`

**Errores posibles:**
- Webhook URL no configurada → backend continúa, solo registra skip
- n8n caído → actividad se crea igualmente

---

## 3. weekly-teacher-report

| Campo | Valor |
|-------|-------|
| **Archivo** | `workflows/weekly-teacher-report.json` |
| **Trigger** | Cron lunes 9:00 (`0 9 * * 1`) |
| **Backend** | `GET /api/automation/teacher-weekly-summary` |

**Datos obtenidos:**
- Actividades asignadas, entregadas, pendientes, vencidas
- Comprensión promedio
- Habilidad lectora más baja
- Estudiantes en riesgo

**Salida:** log por docente con texto de resumen

---

## 4. generate-questions-backend

| Campo | Valor |
|-------|-------|
| **Archivo** | `workflows/generate-questions-backend.json` |
| **Trigger** | Webhook POST `/webhook/generate-questions` |
| **Backend IA** | `POST /api/ai/practice` (Ollama) |
| **Usado por** | `n8nService.generateQuestionsWithFallback()` |

**Entrada:**
```json
{
  "activityId": "...",
  "text": "...",
  "area": "Comunicación",
  "topic": "Texto narrativo",
  "level": "primaria"
}
```

**Salida:** mínimo 5 preguntas con `text`, `type`, `skill`, `difficulty`

**Fallback:** si webhook no configurado, backend usa `aiService.generateTypedQuestions()` directo

**Errores:**
- Ollama no disponible → error en nodo HTTP; backend hace fallback
- Menos de 5 preguntas → workflow lanza error

---

## 5. detect-biases-backend

| Campo | Valor |
|-------|-------|
| **Archivo** | `workflows/detect-biases-backend.json` |
| **Trigger** | Webhook POST `/webhook/detect-biases` |
| **Backend IA** | `POST /api/ai/biases` |
| **Usado por** | `n8nService.detectBiasesWithFallback()` |

**Entrada:**
```json
{ "text": "...", "activityId": "..." }
```

**Salida:**
```json
{
  "biases": [{ "label": "...", "fragment": "...", "explanation": "..." }],
  "tags": ["..."]
}
```

**Errores:** no bloquean el sistema; retorna array vacío en fallback

---

## Flujo de integración general

```
Docente asigna actividad
  → Backend guarda en MongoDB
  → n8n webhook (si configurado)
  → Log en WorkflowLog

Estudiante genera preguntas
  → Backend intenta n8n webhook
  → Si falla: Ollama directo via aiService
  → Guarda en Submission

Cron recordatorio / reporte semanal
  → n8n consulta /api/automation/*
  → Procesa y registra logs
```

## Seguridad

Todos los endpoints `/api/automation/*` requieren:

```
x-n8n-api-key: <N8N_INTERNAL_API_KEY>
```

No exponer esta clave en el frontend ni en repositorios públicos.
