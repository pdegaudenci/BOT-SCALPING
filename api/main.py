from flask import Flask, request, jsonify
import openai
import os

app = Flask(__name__)

# Clave API de OpenAI (hardcodeada como pediste)
openai.api_key = "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"

GPT_ASSISTANT_URL = "https://chatgpt.com/g/g-6872df6c8e788191bcfb3499522a173f-analista-cripto-scalping"

@app.route("/api/webhook", methods=["POST"])
def webhook():
    data = request.json
    mensaje = f"Analiza y dime si debo ejecutar la operación:
{data}"

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Eres un experto en scalping cripto. Analiza datos técnicos y recomienda si ejecutar o no la operación."},
                {"role": "user", "content": mensaje + f" (Puedes usar como referencia este asistente personalizado: {GPT_ASSISTANT_URL})"}
            ],
            temperature=0.2
        )
        resultado = response["choices"][0]["message"]["content"]
        return jsonify({"status": "ok", "recomendacion": resultado})
    except Exception as e:
        return jsonify({"status": "error", "detalle": str(e)}), 500
