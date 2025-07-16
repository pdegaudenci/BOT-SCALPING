"use client";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [validacion, setValidacion] = useState<any>(null);
  const [contexto, setContexto] = useState<any>(null);
  const [timestamp, setTimestamp] = useState("");
  const [senal, setSenal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "/api/index";

    console.log("📡 Solicitando datos desde:", BACKEND_URL);

    try {
      const res = await fetch(BACKEND_URL);
      const data = await res.json();

      console.log("✅ Respuesta recibida del backend:");
      console.log(data);

      setTimestamp(data.timestamp || "");
      setValidacion(data.validacion || null);
      setContexto(data.contexto || null);
      setSenal(data.senal || null);
      setError(null);

      // Logs individuales para debugging detallado
      if (data.validacion) {
        console.log("📥 Señal validada:");
        console.log(data.validacion);
      } else {
        console.log("ℹ️ No se recibió validación de señal.");
      }

      if (data.contexto) {
        console.log("📥 Contexto del mercado:");
        console.log(data.contexto);
      }

      if (data.senal) {
        console.log("📥 Última señal recibida:");
        console.log(data.senal);
      }

    } catch (err) {
      console.error("❌ Error al obtener datos del backend:", err);
      setError("No se pudo conectar con el backend.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // 🔁 Actualiza cada 15 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">📈 Dashboard de Scalping</h1>
      <p className="text-sm text-gray-400">Actualizado: {timestamp}</p>

      {error && (
        <div className="text-red-600 font-semibold">⚠️ {error}</div>
      )}

      {validacion ? (
        <div className="border rounded p-4 shadow bg-green-50">
          <h2 className="text-lg font-semibold">
            ✅ Señal Validada: {validacion?.entrada?.toUpperCase()}
          </h2>
          <p><strong>Precio:</strong> {validacion?.precio ?? "N/A"}</p>
          <p><strong>SL:</strong> {validacion?.sl ?? "N/A"} | <strong>TP:</strong> {validacion?.tp ?? "N/A"}</p>
          <p><strong>Probabilidad:</strong> {validacion?.probabilidad ?? "N/A"}%</p>
          <p><strong>Razón:</strong> {validacion?.razon ?? "N/A"}</p>
        </div>
      ) : contexto ? (
        <p className="italic text-yellow-600">
          No hay señal en esta vela, pero se ha generado un análisis del mercado.
        </p>
      ) : (
        <p className="italic text-gray-500">⏳ Esperando datos del backend...</p>
      )}

      {contexto && (
        <div className="border rounded p-4 shadow bg-blue-50">
          <h2 className="text-lg font-semibold">📊 Análisis del Mercado</h2>
          <p><strong>Resumen:</strong> {contexto?.resumen ?? "N/A"}</p>
          <p><strong>Riesgo:</strong> {contexto?.riesgo ?? "N/A"}</p>
          <p><strong>Recomendación:</strong> {contexto?.recomendacion ?? "N/A"}</p>
        </div>
      )}

      {senal && (
        <div className="border rounded p-4 shadow bg-gray-50">
          <h2 className="text-lg font-semibold">🧮 Indicadores (última vela)</h2>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(senal, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
