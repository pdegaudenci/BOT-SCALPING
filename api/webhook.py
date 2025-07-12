from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import openai
import os

router = APIRouter()

# Tu clave secreta de OpenAI (OK usarla hardcodeada si el repo es privado)
openai.api_key = "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"

# ID de tu GPT personalizado (extraído de la URL)
GPT_ID = "g-6872df6c8e788191bcfb3499522a173f-analista-cripto-scalping"

async def validar_con_gpt(data):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Eres un analista experto en scalping de criptomonedas."},
            {"role": "user", "content": f"Evalúa esta señal JSON:\n{data}\n\nDevuélveme solo un JSON con 'validar', 'probabilidad', 'sl', 'tp', 'razon'"}
        ],
        temperature=0.3,
        tools=[],
        tool_choice="none",
        gpt_name=GPT_ID  # Se conecta al GPT personalizado
    )
    
    result_text = response.choices[0].message["content"]
    return result_text

@router.post("/api/webhook")
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
