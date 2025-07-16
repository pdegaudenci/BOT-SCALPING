"use client";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [validacion, setValidacion] = useState(null);
  const [contexto, setContexto] = useState(null);
  const [timestamp, setTimestamp] = useState("");
  const [senal, setSenal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/index");
        const data = await res.json();
        setTimestamp(data.timestamp);
        setValidacion(data.validacion);
        setContexto(data.contexto);
        setSenal(data.senal);
      } catch (err) {
        console.error("❌ Error al obtener datos del backend:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // 🔁 Actualiza cada 15 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">📈 Dashboard de Scalping</h1>
      <p className="text-sm text-gray-400">Actualizado: {timestamp}</p>

      {validacion ? (
        <div className="border rounded p-4 shadow bg-green-50">
          <h2 className="text-lg font-semibold">
            ✅ Señal Validada: {validacion.entrada?.toUpperCase()}
          </h2>
          <p><strong>Precio:</strong> {validacion.precio}</p>
          <p><strong>SL:</strong> {validacion.sl} | <strong>TP:</strong> {validacion.tp}</p>
          <p><strong>Probabilidad:</strong> {validacion.probabilidad}%</p>
          <p><strong>Razón:</strong> {validacion.razon}</p>
        </div>
      ) : contexto ? (
        <p className="italic text-yellow-600">No hay señal en esta vela, pero se ha generado un análisis del mercado.</p>
      ) : (
        <p className="italic text-gray-500">Esperando datos...</p>
      )}

      {contexto && (
        <div className="border rounded p-4 shadow bg-blue-50">
          <h2 className="text-lg font-semibold">📊 Análisis del Mercado</h2>
          <p><strong>Resumen:</strong> {contexto.resumen}</p>
          <p><strong>Riesgo:</strong> {contexto.riesgo}</p>
          <p><strong>Recomendación:</strong> {contexto.recomendacion}</p>
        </div>
      )}

      {senal && (
        <div className="border rounded p-4 shadow bg-gray-50">
          <h2 className="text-lg font-semibold">🧮 Indicadores (última vela)</h2>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(senal, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
