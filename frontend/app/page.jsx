"use client";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [validacion, setValidacion] = useState(null);
  const [contexto, setContexto] = useState(null);
  const [timestamp, setTimestamp] = useState("");
  const [senal, setSenal] = useState(null);
  const [error, setError] = useState(null);
  const [estadoGpt, setEstadoGpt] = useState("verificando"); // "ok", "error", "verificando"

  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace("/api/index", "") || "";

  const fetchData = async () => {
    const BACKEND_URL = `${BACKEND_BASE_URL}/api/index`;
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
    } catch (err) {
      console.error("❌ Error al obtener datos del backend:", err);
      setError("No se pudo conectar con el backend.");
    }
  };

  const verificarEstadoGpt = async () => {
    const PING_URL = `${BACKEND_BASE_URL}/api/ping`;
    console.log("🔍 Verificando conexión con GPT en:", PING_URL);

    try {
      const res = await fetch(PING_URL);
      if (!res.ok) throw new Error("Error de conexión");
      const data = await res.json();
      console.log("✅ GPT disponible:", data);
      setEstadoGpt("ok");
    } catch (e) {
      console.error("❌ GPT no disponible:", e);
      setEstadoGpt("error");
    }
  };

  useEffect(() => {
    fetchData();
    verificarEstadoGpt();

    const intervalData = setInterval(fetchData, 15000); // 🔁 actualiza datos
    const intervalPing = setInterval(verificarEstadoGpt, 30000); // 🔁 verifica GPT

    return () => {
      clearInterval(intervalData);
      clearInterval(intervalPing);
    };
  }, []);

  const renderGptStatus = () => {
    if (estadoGpt === "ok") return <span className="text-green-600">🟢 GPT disponible</span>;
    if (estadoGpt === "error") return <span className="text-red-600">🔴 GPT no disponible</span>;
    return <span className="text-yellow-600">🟡 Verificando conexión con GPT...</span>;
  };

  return (
    <main className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">📈 Dashboard de Scalping</h1>
      <p className="text-sm text-gray-400">Actualizado: {timestamp}</p>
      <p className="text-sm">{renderGptStatus()}</p>

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
