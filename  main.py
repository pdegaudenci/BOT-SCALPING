from fastapi import FastAPI
from api.webhook import router  # Suponiendo que tienes el webhook en api/webhook.py

app = FastAPI()
app.include_router(router)
