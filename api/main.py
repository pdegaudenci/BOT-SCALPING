
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data.decode('utf-8'))
            print("📩 Alerta recibida:", data)

            # Simular validación con OpenAI
            gpt_result = {
                "validar": True,
                "probabilidad": 80,
                "sl": 162.5,
                "tp": 164.7,
                "razon": "Cruce de EMAs y MACD confirmado, volumen fuerte y RSI > 50"
            }

            response = {
                "status": "ok",
                "gpt_result": gpt_result
            }
            response_bytes = json.dumps(response).encode('utf-8')

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(response_bytes)

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {"status": "error", "message": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
