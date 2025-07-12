from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/api/webhook")
async def receive_alert(request: Request):
    data = await request.json()
    print("📩 Alerta recibida:", data)

    # Aquí luego conectas con tu GPT o lógica de validación
    return JSONResponse(content={
        "status": "ok",
        "message": "Alerta recibida",
        "data": data
    })
