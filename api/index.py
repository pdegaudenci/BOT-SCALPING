from fastapi import FastAPI
from mangum import Mangum
from api.webhook import router  # Asegúrate de que esté bien importado

app = FastAPI()
app.include_router(router)

# Esto es lo que Vercel necesita
handler = Mangum(app)
