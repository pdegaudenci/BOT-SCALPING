from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/api/webhook")
async def webhook(request: Request):
    data = await request.json()
    print("📩 Alerta recibida:", data)

    # Puedes conectar con OpenAI aquí para validación GPT
    # resultado = validar_con_gpt(data)

    return JSONResponse(content={"status": "ok", "message": "Alerta recibida", "data": data})
