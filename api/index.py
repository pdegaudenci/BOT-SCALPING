from http.server import BaseHTTPRequestHandler
import json
import openai
import threading
from datetime import datetime

openai.api_key = "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"

# almacenamiento en memoria simple
contexto_actual = {}

def analizar_contexto(payload):
    prompt_contexto = f"""
Eres un analista técnico de criptomonedas. Con base en los siguientes indicadores, describe la situación actual del mercado de forma objetiva para mostrar en un dashboard informativo:

{json.dumps(payload)}

Devuelve un JSON con este formato:
{{
  "resumen": "Actualmente el mercado muestra una tendencia alcista con señales de confirmación en 5M y 15M...",
  "riesgo": "moderado",
  "recomendacion": "Esperar retroceso antes de entrar en largo"
}}
"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt_contexto}],
            temperature=0.3
        )
        result = json.loads(response.choices[0].message.content.strip())
        contexto_actual.update(result)
    except Exception as e:
        contexto_actual["resumen"] = f"Error al generar análisis de contexto: {str(e)}"

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            payload = json.loads(post_data)
            entrada = payload.get("entrada", "").lower()

            result_validacion = None

            if entrada in ["long", "short"]:
                prompt_validacion = f"""
Eres un analista experto en scalping de criptomonedas. Evalúa la siguiente señal recibida:

{json.dumps(payload)}

Devuelve únicamente un JSON con este formato:
{{
  "validar": true,
  "probabilidad": 80,
  "sl": 162.5,
  "tp": 164.7,
  "razon": "Cruce de EMAs y MACD confirmado, volumen fuerte y RSI > 50"
}}
"""
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt_validacion}],
                    temperature=0.3
                )
                result_validacion = json.loads(response.choices[0].message.content.strip())

                # iniciar análisis de contexto en segundo plano
                threading.Thread(target=analizar_contexto, args=(payload,)).start()
            else:
                # sin señal, solo analizar contexto
                threading.Thread(target=analizar_contexto, args=(payload,)).start()

            output = {
                "status": "ok",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "validacion": result_validacion,
                "contexto": contexto_actual if not entrada else None
            }

            self.send_response(200)
            self.send_header('Content-type','application/json')
            self.end_headers()
            self.wfile.write(json.dumps(output).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type','application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "error",
                "message": str(e)
            }).encode())