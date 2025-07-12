from fastapi import FastAPI
from api import webhook

app = FastAPI()

app.include_router(webhook.router)
