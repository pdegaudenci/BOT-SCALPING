from fastapi import FastAPI
from api.webhook import webhook

app = FastAPI()

# Montamos la ruta /api/webhook desde el módulo
app.include_router(webhook.router)
