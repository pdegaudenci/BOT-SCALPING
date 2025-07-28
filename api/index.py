from http.server import BaseHTTPRequestHandler
import json
import openai
from datetime import datetime
import traceback
from dotenv import load_dotenv
import os

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")


# Datos en memoria
contexto_actual = {}
ultima_validacion = None
ultimo_timestamp = None
ultima_senal = None
ultimas_velas = []

# Datos por defecto para primer render
datos_por_defecto = {
    "timestamp": None,
    "validacion": None,
    "contexto": {
        "resumen": "No hay datos aún.",
        "riesgo": "-",
        "recomendacion": "-"
    },
    "senal": None,
    "ultimas_velas": []
}

def analizar_contexto(payload):
    prompt_contexto = f"""
Eres un analista técnico de criptomonedas. Con base en los siguientes indicadores, describe la situación actual del mercado de forma objetiva para mostrar en un dashboard informativo:

{json.dumps(payload)}

Devuelve un JSON con este formato:
{{
  "resumen": "Actualmente el mercado muestra una tendencia alcista...",
  "riesgo": "moderado",
  "recomendacion": "Esperar retroceso"
}}
"""
    try:
        print("\n📤 Enviando a GPT (contexto):")
        print(json.dumps(payload, indent=2))

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt_contexto}],
            temperature=0.3
        )

        result = json.loads(response.choices[0].message.content.strip())
        contexto_actual.update(result)

        print("\n🧠 Respuesta de GPT (contexto):")
        print(json.dumps(result, indent=2))

    except Exception as e:
        contexto_actual["resumen"] = "Error al conectar con OpenAI. Reintentar más tarde."
        contexto_actual["riesgo"] = "-"
        contexto_actual["recomendacion"] = "-"
        print("\n❌ Error GPT (contexto):", str(e))
        print(traceback.format_exc())

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        global ultima_validacion, contexto_actual, ultimo_timestamp, ultima_senal, ultimas_velas
        try:
            length = int(self.headers['Content-Length'])
            data = self.rfile.read(length).decode('utf-8')
            payload = json.loads(data)

            print("\n📩 Señal recibida (POST):")
            print(json.dumps(payload, indent=2))

            entrada = payload.get("entrada")
            entrada = entrada.lower() if isinstance(entrada, str) else None
            result_validacion = None

            # Guardar datos recibidos
            ultima_senal = payload
            ultimo_timestamp = datetime.utcnow().isoformat() + "Z"
            ultimas_velas = payload.get("ultimas_velas", [])

            if entrada in ["long", "short"]:
                prompt = f"""
Eres un analista experto en scalping. Evalúa la señal recibida:

{json.dumps(payload)}

Devuelve solo JSON:
{{
  "validar": true,
  "probabilidad": 82,
  "sl": 162.5,
  "tp": 164.7,
  "razon": "Cruce de EMAs y MACD confirmado",
  "entrada": "{entrada}",
  "precio": {payload.get("precio", 0)}
}}
"""
                print("\n📤 Enviando a GPT (validación):")
                print(json.dumps(payload, indent=2))

                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3
                )

                result_validacion = json.loads(response.choices[0].message.content.strip())
                ultima_validacion = result_validacion

                print("\n🧠 Respuesta de GPT (validación):")
                print(json.dumps(result_validacion, indent=2))
            else:
                print("⚠️ No se detectó señal válida ('long' o 'short')")

            analizar_contexto(payload)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "timestamp": ultimo_timestamp,
                "validacion": ultima_validacion,
                "contexto": contexto_actual,
                "senal": ultima_senal,
                "ultimas_velas": ultimas_velas
            }).encode())

        except Exception as e:
            print("\n❌ Error en POST:", str(e))
            print(traceback.format_exc())
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_GET(self):
        global ultima_validacion, contexto_actual, ultimo_timestamp, ultima_senal, ultimas_velas

        if self.path == "/api/ping":
            try:
                print("\n🔍 Verificando conexión con OpenAI GPT...")
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": "¿Estás disponible?"}],
                    temperature=0,
                    max_tokens=10
                )
                mensaje = response.choices[0].message.content.strip()
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
                self.end_headers()
                self.wfile.write(json.dumps({
                    "gpt_status": "ok",
                    "mensaje": mensaje
                }).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
                self.end_headers()
                self.wfile.write(json.dumps({
                    "gpt_status": "error",
                    "error": str(e)
                }).encode())
            return

        # Si no hay datos reales, usar datos por defecto
        response_data = {
            "status": "ok",
            "timestamp": ultimo_timestamp or datos_por_defecto["timestamp"],
            "validacion": ultima_validacion or datos_por_defecto["validacion"],
            "contexto": contexto_actual or datos_por_defecto["contexto"],
            "senal": ultima_senal or datos_por_defecto["senal"],
            "ultimas_velas": ultimas_velas or datos_por_defecto["ultimas_velas"]
        }

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

        print("\n📦 Respuesta enviada al frontend (GET):")
        print(json.dumps(response_data, indent=2))
