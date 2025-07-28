
# 🧠 BOT-SCALPING – Cripto Scalping Asistido por IA

Sistema fullstack que permite recibir señales de trading desde TradingView, analizarlas con un LLM personalizado, y desplegarlas en un dashboard web en tiempo real.

## 📦 Estructura del Proyecto

```

BOT-SCALPING-main/
├── api/           # Backend Python que valida señales y responde análisis
├── frontend/      # Frontend en React + TailwindCSS con dashboard en tiempo real
└── vercel.json    # Configuración para despliegue en Vercel

```

---

## 🔧 Backend (API)

- Lenguaje: Python 3
- Funcionalidad: Recibe señales desde TradingView vía Webhook y las valida usando un modelo de lenguaje (ej: GPT o DeepSeek).
- Endpoint principal:
  - `POST /api/index`: recibe señal con precio, tipo (`long` o `short`), etc.
  - `GET /api/index`: consulta el último estado de análisis recibido
- Dependencias en `api/requirements.txt`.

### 🔐 Variables esperadas
Define claves de acceso a LLM en variables de entorno (si aplica): `API_KEY`, `MODEL_URL`, etc.

---

## 💻 Frontend

- Framework: React con Next.js y TailwindCSS
- Lenguaje: TypeScript
- Página principal: `frontend/app/page.jsx`
- Muestra:
  - Señales validadas (`long`/`short`, precio de entrada, SL, TP)
  - Análisis técnico generado por GPT personalizado

### Comandos de desarrollo

```bash
cd frontend
npm install
npm run dev
````

---

## 🚀 Despliegue en Vercel

* Backend y frontend configurados como función serverless
* `vercel.json` contiene los paths necesarios

### Recomendación

Configura variables de entorno en Vercel para proteger claves API y URLs de modelos.

---

## 📈 Flujo General

1. TradingView lanza alerta → llega al backend (`/api/index`)
2. El backend calcula indicadores y envía contexto al LLM
3. El modelo responde con validación (✅/❌), SL, TP, probabilidad
4. El frontend muestra en vivo las señales y análisis

---

## 🧪 Tech Stack

* **Backend**: Python, FastAPI o BaseHTTPHandler, DeepSeek/GPT API
* **Frontend**: React, Next.js, TailwindCSS, TypeScript
* **Infra**: Vercel (serverless)

---

## ✨ Futuras Mejoras

* Autenticación de señales
* Historial de operaciones
* Entrenamiento del modelo propio
* Integración con Binance vía API

---

## 👨‍💻 Autor

Pedro Sebastián Degaudenci – Data Engineer & Backend Dev

