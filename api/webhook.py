from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from mangum import Mangum

app = FastAPI()

# 👉 Simulación de validación GPT (mock)
async def validar_con_gpt(data):
    # Aquí deberías usar openai.ChatCompletion.create si quieres usar la API real
    return {
        "validar": True,
        "probabilidad": 82,
        "sl": 162.5,
        "tp": 164.7,
        "razon": "Mock temporal: sin validación GPT"
    }

@app.post("/api/webhook")
async def receive_alert(request: Request):
    data = await request.json()
    print("📩 Alerta recibida:", data)

    try:
        gpt_result = await validar_con_gpt(data)
        return JSONResponse(content={
            "status": "ok",
            "gpt_result": gpt_result
        })
    except Exception as e:
        return JSONResponse(content={
            "status": "error",
            "message": str(e)
        }, status_code=500)

# Necesario para Vercel
handler = Mangum(app)
