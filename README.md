<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Licencia-Académica-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Universidad-Continental-002C77?style=for-the-badge" />
</p>

# 📚 Tutor Virtual de Lectura Crítica  

## 📖 Descripción del Proyecto  
**Tutor Virtual de Lectura Crítica** es una aplicación web desarrollada con el stack **MERN** que busca fortalecer las habilidades de **pensamiento crítico** en los usuarios.  

A través de la lectura de textos, el sistema genera **preguntas automáticas**, detecta **sesgos o falacias lógicas** y evalúa la comprensión del contenido. Además, integra **automatización con n8n** para programar sesiones de estudio, enviar recordatorios y registrar el progreso de los usuarios.  

Este proyecto forma parte del curso **Taller de Proyectos 2 – Ingeniería de Sistemas e Informática** de la **Universidad Continental**, bajo la dirección del docente:  
👨‍🏫 *Ing. Gamarra Moreno Daniel*  

---

## 👥 Integrantes del Equipo
- Huaccho Mancilla Steven José  
- Lazo Maravi Nilton Joel  
- Poma Goche Abigail Karim  
- Ramirez Basualdo Lenin Sebasthian  
- Robles Sanchez Britney Sheyla  
- Rojas Mellado Andrea Mirella  

---

## 🎯 Objetivos del Proyecto
- Desarrollar una aplicación web educativa que apoye la **lectura crítica** y el **análisis reflexivo**.  
- Integrar **inteligencia artificial (IA)** para mejorar la experiencia de aprendizaje.  
- Automatizar flujos de estudio mediante **n8n**.  
- Aplicar **buenas prácticas de ingeniería de software** y metodologías ágiles.  
- Promover la **sostenibilidad digital** reduciendo el uso de papel y optimizando recursos.  

---

## 🛠️ Stack Tecnológico  

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,nodejs,express,mongodb,docker,git,github" alt="Tecnologías del proyecto" />
</p>

- **Frontend:** React.js con diseño responsive y gestión de estado.  
- **Backend:** Node.js + Express.js.  
- **Base de Datos:** MongoDB (Atlas o local).  
- **IA:** Generación de preguntas y detección de sesgos con NLP.  
- **Automatización:** n8n para programar sesiones, enviar notificaciones y registrar avances.  
- **Contenerización:** Docker para levantar servicios.  

---

## 🏗️ Arquitectura del Sistema  

```mermaid 
flowchart TD
    A[Usuario] --> B[Frontend React]
    B --> C[Backend Express.js]
    C --> D[Base de Datos MongoDB]
    C --> E[Servicio IA - Ollama]
    C --> F[n8n - Automatización]
    F --> G[Notificaciones por Email]
    F --> D
    E --> D
    
    subgraph "Contenedores Docker"
        B
        C
        D
        F
    end
```
```mermaid 
flowchart TD
    A[Usuario ingresa texto] --> B[Enviar texto al Backend]
    B --> C[Backend llama a IA - Ollama]
    C --> D[IA genera las 5 preguntas]
    D --> E[Guardar preguntas en MongoDB]
    E --> F[Retornar preguntas al Frontend]
    F --> G[Mostrar preguntas al usuario]
```
```mermaid
flowchart LR
    subgraph Actores
        A1([Usuario])
        A2([Docente])
        A3([Administrador])
    end

    subgraph Casos_de_Uso
        U1[(Generar preguntas)]
        U2[(Responder preguntas)]
        U3[(Recibir retroalimentación)]
        U4[(Descargar informe PDF)]
        D1[(Asignar textos)]
        D2[(Ver progreso de estudiantes)]
        AD1[(Gestionar métricas globales)]
    end

    A1 --> U1
    A1 --> U2
    A1 --> U3
    A1 --> U4

    A2 --> D1
    A2 --> D2

    A3 --> AD1
```
```mermaid 
graph TD
    A[Frontend React] -->|REST API| B[Backend Express]
    B --> C[(MongoDB)]
    B --> D[Ollama - IA]
    B --> E[n8n Automatización]

    subgraph Backend
        B
        C
        D
        E
    end
```
---

## 🏗️ Metodología de Desarrollo 

```mermaid 
gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Setup project structure"
    branch feature/hu01-question-generation
    checkout feature/hu01-question-generation
    commit id: "Add question generation API"
    commit id: "Integrate Ollama API"
    checkout develop
    merge feature/hu01-question-generation
    branch feature/hu02-feedback-system
    commit id: "Implement feedback logic"
    commit id: "Add feedback UI components"
    checkout develop
    merge feature/hu02-feedback-system
    checkout main
    merge develop tag: "v1.0.0"
```
---

## 📂 Estructura del Proyecto

A continuación se presenta la estructura general del proyecto **MERN + IA + n8n**, organizada por carpetas y módulos principales.

```bash
tutor-virtual-lectura-critica/
├── frontend/                     # Aplicación React (Vite)
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Vistas principales (Home, Lectura, Reportes)
│   │   ├── hooks/                # Hooks personalizados
│   │   ├── services/             # Peticiones API hacia el backend
│   │   ├── context/              # Contexto global (auth, sesiones)
│   │   ├── styles/               # Estilos globales / Tailwind
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js

├── backend/                      # API con Node.js + Express
│   ├── src/
│   │   ├── controllers/          # Lógica de cada endpoint
│   │   ├── routes/               # /api/ia (preguntas, feedback, reportes, etc.)
│   │   ├── models/               # Modelos de MongoDB (Text, Questions, Reports)
│   │   ├── services/             # Servicios IA (Ollama, sesgos, PDF)
│   │   ├── middleware/           # Autenticación, logs, validaciones
│   │   └── utils/                # Helpers, manejo de errores
│   ├── tests/                    # Pruebas con Jest
│   ├── package.json
│   └── server.js                 # Punto de inicio del backend

├── n8n/                          # Flujos automatizados n8n
│   └── workflows.json            # Recordatorios, registro de avance, emails

├── docker-compose.yml            # Orquestación de contenedores
├── .env.example                  # Variables de entorno modelo
├── README.md
└── docs/                         # Documentación adicional
    ├── arquitectura.png
    ├── uml/
    └── informe-final.pdf

---

## 🔀 Git Flow del Proyecto

Para garantizar orden, control de versiones y trabajo colaborativo, el proyecto utiliza la estrategia **Git Flow**.  
Este flujo permite desarrollar nuevas funciones sin afectar la rama principal y mantener un historial limpio.

### 🌲 Estructura de ramas

El proyecto utiliza las siguientes ramas principales:

| Rama | Función |
|------|---------|
| **main** | Versión estable lista para producción. |
| **develop** | Integración de nuevas funcionalidades antes de pasar a main. |
| **feature/** | Desarrollo de nuevas funcionalidades (una rama por HU). |
| **hotfix/** | Correcciones urgentes en producción. |
| **release/** | Preparación de versiones finales. |

### 🧩 Convención de ramas "feature/HU"

Para cada Historia de Usuario (HU), se crea una rama:
feature/hu01-generar-preguntas
feature/hu02-feedback
feature/hu05-reportes
feature/hu06-informe-pdf

## 🛠 Comandos del Flujo de Trabajo

### 1️⃣ Crear una nueva HU
```bash
git checkout develop
git pull
git checkout -b feature/hu01-generar-preguntas
```
---


## 🧠 Ejemplos de Uso de la API (Backend)

A continuación se muestran ejemplos reales para interactuar con el **backend del Tutor Virtual**.  
Todas las rutas están disponibles en `http://localhost:3000/api/ia`.

### 1. Generar preguntas (HU01)
Genera 5 preguntas de comprensión lectora a partir de un texto.

**Ruta:** `POST /api/ia/questions`  
**Ejemplo:**
```bash
curl -X POST http://localhost:3000/api/ia/questions \
  -H "Content-Type: application/json" \
  -d '{"text": "La contaminación ambiental afecta la salud y el equilibrio ecológico."}'
Respuesta esperada:

json
Copiar código
{
  "message": "Texto y preguntas guardados en Mongo correctamente",
  "data": {
    "questions": [
      "¿Qué consecuencias tiene la contaminación ambiental?",
      "¿Cómo afecta la contaminación al equilibrio ecológico?",
      "¿Qué relación existe entre contaminación y salud?",
      "¿Por qué es importante reducir la contaminación?",
      "¿Qué acciones se pueden tomar para mitigarla?"
    ]
  }
}
```
### 2. Obtener retroalimentación (HU02)
Analiza una respuesta y devuelve una retroalimentación corta.

Ruta: POST /api/ia/feedback
Ejemplo:

Copiar código
```bash
curl -X POST http://localhost:3000/api/ia/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "text": "La contaminación ambiental afecta la salud y el equilibrio ecológico.",
    "question": "¿Qué consecuencias tiene la contaminación ambiental?",
    "answer": "Provoca enfermedades respiratorias y daña los ecosistemas."
  }'
Respuesta esperada:

json
Copiar código
{
  "feedback": "Correcta, mencionas efectos reales pero podrías profundizar en el daño ecológico.",
  "saved": { ... }
}
```
### 3. Generar reporte general (HU05)
Devuelve un resumen estadístico de todas las respuestas.

Ruta: GET /api/ia/reports
Ejemplo:

Copiar código
```bash
curl http://localhost:3000/api/ia/reports
Respuesta esperada:

json
Copiar código
{
  "total": 12,
  "correctas": 7,
  "incorrectas": 3,
  "parciales": 2,
  "ultimas": [ ... ]
}
```
### 4. Generar informe PDF (HU06)
Descarga un informe con las respuestas y retroalimentaciones.

Ruta: GET /api/ia/informe
Ejemplo:

Copiar código
```bash
curl -o informe.pdf http://localhost:3000/api/ia/informe
📄 El archivo informe.pdf se descarga automáticamente con el resumen de resultados.
```
### 5. Chat con IA
Ruta: POST /api/ia/chat
Ejemplo:

```bash
Copiar código
curl -X POST http://localhost:3000/api/ia/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explica brevemente qué es el pensamiento crítico."}'
Respuesta esperada:

json
Copiar código
{
  "ok": true,
  "answer": "El pensamiento crítico consiste en analizar, cuestionar y evaluar la información antes de aceptarla."
}
```
### 🧪 Ejecución de Pruebas Automatizadas
El proyecto utiliza Jest con pnpm para las pruebas unitarias e integradas.

Comando para ejecutar todas las pruebas:

Copiar código
```bash
pnpm test
```
Comando para ver la cobertura:

Copiar código
```bash
pnpm jest --coverage
```
La meta es alcanzar al menos 70% de cobertura, con objetivo ideal de 90%.

### 💡 Notas Técnicas
Todos los endpoints se encuentran en src/backend/routes/ia.js.

El modelo usado por defecto es llama3:8b, configurable desde el archivo .env con:

env
Copiar código
```bash
OLLAMA_MODEL=llama3:8b
OLLAMA_HOST=http://<tu_ip_local>:11434
La base de datos se ejecuta en MongoDB (local o Atlas).
```
El servicio de pruebas usa mocks definidos en jest.setup.js.

---

## ⚙️ Instrucciones de Instalación  

1. **Instalar Docker**  
   - Seguir la guía en video: [Cómo instalar Docker](https://www.youtube.com/watch?v=wMioaU5yk_w).  

2. **Clonar el repositorio**  
   ```bash
   git clone https://github.com/Nilton-Lazo/proyecto-mern-ia.git
   cd proyecto-mern-ia
   
3. **Levantar los servicios con Docker Compose**
   ```bash
   docker-compose up --build

4. **Acceder al sistema**
   - Una vez completados los pasos, navegar a: [Sistema local](http://localhost:5173/).
     
---

## 📌 Historias de Usuario (Épicas)
- Como **estudiante**, quiero que el tutor virtual me haga preguntas sobre el texto leído para mejorar mi análisis crítico.  
- Como **docente**, quiero asignar textos con actividades automáticas para evaluar el progreso.  
- Como **usuario**, quiero que el sistema detecte sesgos o falacias en los artículos que leo.  
- Como **sistema**, quiero automatizar el envío de textos y actividades para fomentar hábitos de lectura.  
- Como **administrador**, quiero ver un panel con el nivel de comprensión promedio de los usuarios.  

---

## 🤖 Funcionalidades Clave
✅ Generación automática de preguntas críticas.  
✅ Detección de sesgos y falacias en los textos.  
✅ Automatización de recordatorios y asignaciones con n8n.  
✅ Panel de administración con métricas de comprensión.  
✅ Seguridad con autenticación y gestión de usuarios.  

---

## ✅ Pruebas Automatizadas
- **Unitarias:** Jest (backend y frontend).  
- **E2E:** Cypress o Playwright.  
- **Cobertura mínima:** 70% (objetivo >90%).  

---

## 📊 Metodología de Trabajo
- **Metodología Ágil:** Scrum/Kanban con sprints semanales.  
- **Tablero de gestión de tareas:** GitHub Projects / Trello.  
- **Control de versiones:** Uso de Git Flow para gestión de ramas y commits descriptivos.  

---

## 🌱 Impacto Ambiental
🌍 El proyecto promueve la **educación digital** evitando el uso de papel y fomentando el aprendizaje sostenible.  
⚡ El uso de **Docker** permite reducir hasta un 30% el consumo energético frente a entornos locales tradicionales.  

---

## 📂 Documentación
📄 `README.md` con información del proyecto y del equipo.  
📊 Diagramas de arquitectura (UML, flujo de datos, contenedores).  
📝 Informe técnico final con decisiones de diseño, IA, automatización e impacto ambiental.  

---

## 🧭 Guía de Usuario

Esta guía explica el uso básico del sistema **Tutor Virtual de Lectura Crítica**.

### ✔ 1. Registro e Inicio de Sesión
1. Ingrese su correo electrónico.
2. Cree una contraseña segura.
3. Acceda al sistema para visualizar el panel principal.

### ✔ 2. Crear una Sesión de Lectura
1. Ir a la sección **“Nuevo Texto”**.
2. Pegar o escribir el texto que desea analizar.
3. Hacer clic en **“Generar Preguntas”**.
4. El sistema generará automáticamente 5 preguntas críticas.

### ✔ 3. Responder Preguntas
1. Seleccionar una pregunta del listado.
2. Escribir la respuesta en el cuadro correspondiente.
3. El sistema mostrará retroalimentación en tiempo real basada en IA.

### ✔ 4. Ver Historial y Reportes
- En la sección **“Reportes”**, podrá visualizar:
  - Respuestas correctas, incorrectas y parciales.
  - Últimas actividades registradas.
  - Historial de sesiones.

### ✔ 5. Descargar Informe PDF
1. Ir a **“Reportes”** → “Generar PDF”.
2. Descargar informe con:
   - Preguntas
   - Respuestas
   - Retroalimentación
   - Métricas de rendimiento

---

## 📽️ Demostración
Se incluirá un video demostrativo mostrando:  
🎥 Funcionalidades principales.  
🔄 Flujo de usuario.  
🤖 Integración de IA y n8n.  

---

## 📜 Licencia
Este proyecto es de uso académico para el curso **Taller de Proyectos 2** – **Universidad Continental** (2025).  

---

