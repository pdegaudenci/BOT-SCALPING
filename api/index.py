from http.server import BaseHTTPRequestHandler
import json
import openai
import threading
from datetime import datetime

openai.api_key = "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"

FRONTEND_ORIGIN = "https://bot-scalping.vercel.app"

contexto_actual = {}
ultima_validacion = None
ultimo_timestamp = None
ultima_senal = None


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
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt_contexto}],
            temperature=0.3
        )
        result = json.loads(response.choices[0].message.content.strip())
        contexto_actual.update(result)
        print("\n📤 Enviando a GPT (contexto):")
        print(json.dumps(payload, indent=2))
        print("\n🧠 Respuesta de GPT (contexto):")
        print(response.choices[0].message.content.strip())
    except Exception as e:
        contexto_actual["resumen"] = f"Error al generar análisis: {str(e)}"


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        global ultima_validacion, contexto_actual, ultimo_timestamp, ultima_senal
        try:
            length = int(self.headers['Content-Length'])
            data = self.rfile.read(length).decode('utf-8')
            payload = json.loads(data)

            entrada = payload.get("entrada")
            entrada = entrada.lower() if isinstance(entrada, str) else None
            result_validacion = None

            # Guardar la última señal recibida
            ultima_senal = payload
            ultimo_timestamp = datetime.utcnow().isoformat() + "Z"

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
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3
                )
                result_validacion = json.loads(response.choices[0].message.content.strip())
                ultima_validacion = result_validacion

            # Siempre analiza el contexto
            threading.Thread(target=analizar_contexto, args=(payload,)).start()

            # ✅ Siempre respondemos con la misma estructura
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "timestamp": ultimo_timestamp,
                "validacion": result_validacion,
                "contexto": contexto_actual,
                "senal": ultima_senal
            }).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
        # Después de validar señal (en do_POST)
        print("\n📤 Enviando a GPT (validación):")
        print(json.dumps(payload, indent=2))
        print("\n🧠 Respuesta de GPT (validación):")
        print(response.choices[0].message.content.strip())


    def do_GET(self):
        global ultima_validacion, contexto_actual, ultimo_timestamp, ultima_senal
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', FRONTEND_ORIGIN)
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "ok",
            "timestamp": ultimo_timestamp,
            "validacion": ultima_validacion,
            "contexto": contexto_actual,
            "senal": ultima_senal
        }).encode())
        print("\n📦 Enviando al frontend:")
        print(json.dumps({
            "status": "ok",
            "timestamp": ultimo_timestamp,
            "validacion": result_validacion,
            "contexto": contexto_actual,
            "senal": ultima_senal
        }, indent=2))
