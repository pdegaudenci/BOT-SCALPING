"use client";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [validacion, setValidacion] = useState(null);
  const [contexto, setContexto] = useState(null);
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("https://bot-scalping-4r9136659-pdegaudencis-projects.vercel.app/api/index");
      const data = await res.json();
      setTimestamp(data.timestamp);
      setValidacion(data.validacion);
      setContexto(data.contexto);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">📈 Dashboard de Scalping</h1>
      <p className="text-sm text-gray-400">Actualizado: {timestamp}</p>

      {validacion ? (
        <div className="border rounded p-4 shadow bg-green-50">
          <h2 className="text-lg font-semibold">✅ Señal Validada: {validacion.entrada.toUpperCase()}</h2>
          <p><strong>Precio:</strong> {validacion.precio}</p>
          <p><strong>SL:</strong> {validacion.sl} | <strong>TP:</strong> {validacion.tp}</p>
          <p><strong>Probabilidad:</strong> {validacion.probabilidad}%</p>
          <p><strong>Razón:</strong> {validacion.razon}</p>
        </div>
      ) : (
        <p className="italic text-gray-500">No hay señal validada.</p>
      )}

      {contexto && (
        <div className="border rounded p-4 shadow bg-blue-50">
          <h2 className="text-lg font-semibold">📊 Análisis del Mercado</h2>
          <p><strong>Resumen:</strong> {contexto.resumen}</p>
          <p><strong>Riesgo:</strong> {contexto.riesgo}</p>
          <p><strong>Recomendación:</strong> {contexto.recomendacion}</p>
        </div>
      )}
    </main>
  );
}