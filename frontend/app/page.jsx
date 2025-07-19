"use client";
import React, { useEffect, useState, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function Page() {
  const [validacion, setValidacion] = useState(null);
  const [contexto, setContexto] = useState(null);
  const [timestamp, setTimestamp] = useState("");
  const [senal, setSenal] = useState(null);
  const [error, setError] = useState(null);
  const [estadoGpt, setEstadoGpt] = useState("verificando");

  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const lastTimestampRef = useRef("");

  const BACKEND_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace("/api/index", "") || "";

  const fetchData = async () => {
    const BACKEND_URL = `${BACKEND_BASE_URL}/api/index`;
    try {
      const res = await fetch(BACKEND_URL);
      const data = await res.json();
      if (data.timestamp && data.timestamp !== lastTimestampRef.current) {
        lastTimestampRef.current = data.timestamp;
        setTimestamp(data.timestamp || "");
        setValidacion(data.validacion || null);
        setContexto(data.contexto || null);
        setSenal(data.senal || null);
        setError(null);

        // Actualizar gráfico de velas
        if (data.senal?.velas_patrones && candleSeriesRef.current) {
          const candles = data.senal.velas_patrones.map((v) => ({
            time: Math.floor(new Date(v.time).getTime() / 1000),
            open: v.open,
            high: v.high,
            low: v.low,
            close: v.close,
          }));
          candleSeriesRef.current.setData(candles);
        }
      } else {
        console.log("⏸️ Datos sin cambios, no se actualiza UI");
      }
    } catch (err) {
      console.error("❌ Error al obtener datos del backend:", err);
      setError("No se pudo conectar con el backend.");
    }
  };

  const verificarEstadoGpt = async () => {
    const PING_URL = `${BACKEND_BASE_URL}/api/ping`;
    try {
      const res = await fetch(PING_URL);
      if (!res.ok) throw new Error("Error de conexión");
      const data = await res.json();
      setEstadoGpt("ok");
    } catch (e) {
      setEstadoGpt("error");
    }
  };

  useEffect(() => {
    fetchData();
    verificarEstadoGpt();

    const intervalData = setInterval(fetchData, 15000);
    const intervalPing = setInterval(verificarEstadoGpt, 30000);

    return () => {
      clearInterval(intervalData);
      clearInterval(intervalPing);
    };
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Crear el gráfico
    chartInstanceRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
      crosshair: {
        mode: 0,
      },
      priceScale: {
        borderColor: "#ccc",
      },
      timeScale: {
        borderColor: "#ccc",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    candleSeriesRef.current = chartInstanceRef.current.addCandlestickSeries();

    return () => chartInstanceRef.current?.remove();
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

      {error && <div className="text-red-600 font-semibold">⚠️ {error}</div>}

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
        <p className="italic text-yellow-600">No hay señal en esta vela, pero se ha generado un análisis del mercado.</p>
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
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(senal, null, 2)}</pre>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold">📉 Gráfico de Velas</h2>
        <div ref={chartContainerRef} className="w-full border shadow rounded" />
      </div>
    </main>
  );
}
