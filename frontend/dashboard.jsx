import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [contexto, setContexto] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/contexto");
      const data = await res.json();
      setContexto(data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">📊 Análisis de Mercado GPT</h1>
      {contexto ? (
        <div className="space-y-2">
          <p><strong>Resumen:</strong> {contexto.resumen}</p>
          <p><strong>Riesgo:</strong> {contexto.riesgo}</p>
          <p><strong>Recomendación:</strong> {contexto.recomendacion}</p>
        </div>
      ) : (
        <p>Cargando análisis...</p>
      )}
    </div>
  );
}