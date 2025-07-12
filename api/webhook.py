from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import openai
from mangum import Mangum

# Inicializar FastAPI
app = FastAPI()

# 🔐 Solo para pruebas privadas. No usar en producción.
openai.api_key = "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"

@app.post("/api/webhook")
async def receive_alert(request: Request):
    data = await request.json()
    print("📩 Alerta recibida:", data)

    try:
        prompt = f"""
Eres un analista experto en scalping de criptomonedas. Evalúa la siguiente señal recibida:

{data}

Devuelve únicamente un JSON con este formato:
{{
  "validar": true,
  "probabilidad": 80,
  "sl": 162.5,
  "tp": 164.7,
  "razon": "Cruce de EMAs y MACD confirmado, volumen fuerte y RSI > 50"
}}
"""

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        gpt_result = response.choices[0].message["content"]

        return JSONResponse(content={
            "status": "ok",
            "gpt_result": gpt_result
        })
    except Exception as e:
        return JSONResponse(content={
            "status": "error",
            "message": str(e)
        }, status_code=500)

# Requerido por Vercel para identificar el handler
handler = Mangum(app)
