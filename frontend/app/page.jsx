"use client";
import React, { useEffect, useState, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function Page() {
  // ──────────────────────────────────────────
  // Estado
  // ──────────────────────────────────────────
  const [validacion, setValidacion] = useState(null);
  const [contexto, setContexto] = useState(null);
  const [timestamp, setTimestamp] = useState("");
  const [senal, setSenal] = useState(null);
  const [error, setError] = useState(null);
  const [estadoGpt, setEstadoGpt] = useState("verificando");

  // ──────────────────────────────────────────
  // Refs para el gráfico
  // ──────────────────────────────────────────
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const lastTimestampRef = useRef("");

  // ──────────────────────────────────────────
  // Config back‑end
  // ──────────────────────────────────────────
  const BACKEND_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace("/api/index", "") || "";

  // ──────────────────────────────────────────
  // Fetch datos
  // ──────────────────────────────────────────
  const fetchData = async () => {
    const URL = `${BACKEND_BASE_URL}/api/index`;
    try {
      const res = await fetch(URL);
      const data = await res.json();

      // Solo refrescamos si hay datos nuevos
      if (data.timestamp && data.timestamp !== lastTimestampRef.current) {
        lastTimestampRef.current = data.timestamp;
        setTimestamp(data.timestamp);
        setValidacion(data.validacion || null);
        setContexto(data.contexto || null);
        setSenal(data.senal || null);
        setError(null);

        // ─── Actualizar gráfico ─────────────────────────────
        if (candleSeriesRef.current && data.senal?.velas_patrones) {
          // 1️⃣ Datos OHLC
          const candles = data.senal.velas_patrones.map((v) => ({
            time: Math.floor(new Date(v.time).getTime() / 1000),
            open: v.open,
            high: v.high,
            low: v.low,
            close: v.close,
          }));
          candleSeriesRef.current.setData(candles);

          // 2️⃣ Marcadores de patrones
          const markers = data.senal.velas_patrones
            .filter((v) => v.pattern && v.pattern !== "-")
            .map((v) => ({
              time: Math.floor(new Date(v.time).getTime() / 1000),
              position: v.tipo === "alcista" ? "belowBar" : "aboveBar",
              color: v.tipo === "alcista" ? "#4caf50" : "#f44336",
              shape: v.tipo === "alcista" ? "arrowUp" : "arrowDown",
              text: v.pattern,
            }));
          candleSeriesRef.current.setMarkers(markers);
        }
      } else {
        console.log("⏸️ Datos sin cambios");
      }
    } catch (err) {
      console.error("❌ Error al obtener datos:", err);
      setError("No se pudo conectar con el backend.");
    }
  };

  const verificarEstadoGpt = async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/ping`);
      if (!res.ok) throw new Error();
      await res.json();
      setEstadoGpt("ok");
    } catch {
      setEstadoGpt("error");
    }
  };

  // ──────────────────────────────────────────
  // Inicializar y refrescar datos
  // ──────────────────────────────────────────
  useEffect(() => {
    fetchData();
    verificarEstadoGpt();
    const intData = setInterval(fetchData, 15000);
    const intPing = setInterval(verificarEstadoGpt, 30000);
    return () => {
      clearInterval(intData);
      clearInterval(intPing);
    };
  }, []);

  // ──────────────────────────────────────────
  // Crear gráfico una vez montado
  // ──────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: { background: { color: "#fff" }, textColor: "#000" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
      crosshair: { mode: 0 },
      priceScale: { borderColor: "#ccc" },
      timeScale: {
        borderColor: "#ccc",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    candleSeriesRef.current = chartRef.current.addCandlestickSeries();

    // Ajustar tamaño automáticamente al re‑dimensionar
    const handleResize = () => {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartRef.current.remove();
    };
  }, []);

  // ──────────────────────────────────────────
  // Helpers UI
  // ──────────────────────────────────────────
  const gptStatus = () => {
    if (estadoGpt === "ok") return <span className="text-green-600">🟢 GPT disponible</span>;
    if (estadoGpt === "error") return <span className="text-red-600">🔴 GPT no disponible</span>;
    return <span className="text-yellow-600">🟡 Verificando GPT...</span>;
  };

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────
  return (
    <main className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">📈 Dashboard de Scalping</h1>
      <p className="text-sm text-gray-400">Actualizado: {timestamp}</p>
      <p className="text-sm">{gptStatus()}</p>

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
        <p className="italic text-yellow-600">No hay señal en la última vela, se muestra análisis de mercado.</p>
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

      {/* GRÁFICO */}
      <div>
        <h2 className="text-lg font-semibold">📉 Gráfico de Velas + Patrones</h2>
        <div ref={chartContainerRef} className="w-full border shadow rounded" />
      </div>
    </main>
  );
}
