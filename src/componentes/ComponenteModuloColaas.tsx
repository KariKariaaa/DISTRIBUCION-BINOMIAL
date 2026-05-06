import React, { useState } from 'react';
import {
  calcularParametrosColaas,
  generarDatosGraficoPn,
  generarDatosGraficoLsVsRho,
  interpretarResultados
} from '../utilidades/teoriaColaas';

import type { ResultadosColaas } from '../utilidades/teoriaColaas';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function ComponenteModuloColaas({ onVolverAlCalculador }: { onVolverAlCalculador: () => void }) {
  const [lambda, setLambda] = useState<number>(2);
  const [mu, setMu] = useState<number>(3);
  const [resultados, setResultados] = useState<ResultadosColaas | null>(null);
  const [mostrarPasos, setMostrarPasos] = useState(false);

  const handleCalcular = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (lambda <= 0 || mu <= 0) {
        alert('λ y μ deben ser mayores que 0');
        return;
      }

      if (lambda >= mu) {
        alert('Error: λ debe ser menor que μ\n\nLa tasa de llegada debe ser menor que la tasa de servicio para que el sistema sea estable.');
        return;
      }

      const resultadosCalculo = calcularParametrosColaas(lambda, mu);
      setResultados(resultadosCalculo);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const datosGraficoPn = resultados ? generarDatosGraficoPn(resultados) : [];
  const datosGraficoLs = generarDatosGraficoLsVsRho(mu);
  const interpretaciones = resultados ? interpretarResultados(resultados) : [];

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-[#9D4EDD]">
            Teoría de Colas (M/M/1)
          </h1>
          <button
            onClick={onVolverAlCalculador}
            className="bg-[#312c2c] text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
          >
            ← Volver
          </button>
        </div>

        <p className="text-center text-gray-600 mb-8 text-lg">
          Análisis de sistemas de colas con un servidor, tiempos entre llegadas exponenciales y tiempos de servicio exponenciales
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de entrada */}
          <div className="lg:col-span-1">
            <form onSubmit={handleCalcular} className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD] space-y-6">
              <h2 className="text-2xl font-bold text-[#9D4EDD] mb-6">Parámetros</h2>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  λ (Tasa de Llegada):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={lambda}
                  onChange={(e) => setLambda(Number(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                />
                <p className="text-xs text-gray-500 mt-1">Clientes que llegan por unidad de tiempo</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  μ (Tasa de Servicio):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={mu}
                  onChange={(e) => setMu(Number(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                />
                <p className="text-xs text-gray-500 mt-1">Clientes servidos por unidad de tiempo</p>
              </div>

              {lambda > 0 && mu > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-[#3A86FF]">
                  <p className="text-sm font-semibold text-gray-700">Factor de Utilización (ρ):</p>
                  <p className="text-2xl font-bold text-[#3A86FF]">{(lambda / mu).toFixed(4)}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {lambda >= mu ? 'Inestable: λ ≥ μ' : `Estable: ${((lambda / mu) * 100).toFixed(1)}% ocupado`}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#312c2c] text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
              >
                Calcular
              </button>
            </form>
          </div>

          {/* Panel de resultados */}
          <div className="lg:col-span-2">
            {!resultados ? (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center border-l-4 border-[#3A86FF]">
                <p className="text-gray-500 text-lg">
                  Ingresa λ y μ, luego haz clic en "Calcular"
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tarjetas de resultados principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
                    <p className="text-sm text-gray-600">Ls (Sistema)</p>
                    <p className="text-3xl font-bold text-[#9D4EDD]">{resultados.ls.toFixed(4)}</p>
                    <p className="text-xs text-gray-500 mt-1">Clientes promedio</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
                    <p className="text-sm text-gray-600">Lq (Cola)</p>
                    <p className="text-3xl font-bold text-[#3A86FF]">{resultados.lq.toFixed(4)}</p>
                    <p className="text-xs text-gray-500 mt-1">Clientes esperando</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-600">Ws (Tiempo Sistema)</p>
                    <p className="text-3xl font-bold text-yellow-600">{resultados.ws.toFixed(4)}</p>
                    <p className="text-xs text-gray-500 mt-1">Unidades de tiempo</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-orange-500">
                    <p className="text-sm text-gray-600">Wq (Tiempo Cola)</p>
                    <p className="text-3xl font-bold text-orange-600">{resultados.wq.toFixed(4)}</p>
                    <p className="text-xs text-gray-500 mt-1">Unidades de tiempo</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-green-500">
                    <p className="text-sm text-gray-600">p₀ (Desocupado)</p>
                    <p className="text-3xl font-bold text-green-600">{(resultados.p0 * 100).toFixed(2)}%</p>
                    <p className="text-xs text-gray-500 mt-1">Probabilidad</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-red-500">
                    <p className="text-sm text-gray-600">ρ (Utilización)</p>
                    <p className="text-3xl font-bold text-red-600">{(resultados.rho * 100).toFixed(2)}%</p>
                    <p className="text-xs text-gray-500 mt-1">% ocupado</p>
                  </div>
                </div>

                {/* Interpretaciones */}
                <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
                  <h3 className="text-lg font-bold text-[#9D4EDD] mb-4">Interpretación</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {interpretaciones.map((interpretacion, idx) => (
                      <p key={idx} className="flex items-start">
                        <span className="mr-3">→</span>
                        <span>{interpretacion}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Ver pasos */}
                <button
                  onClick={() => setMostrarPasos(!mostrarPasos)}
                  className="w-full bg-[#3A86FF] text-white font-bold py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  {mostrarPasos ? 'Ocultar' : 'Ver'} Pasos de Cálculo
                </button>

                {mostrarPasos && (
                  <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
                    <h3 className="text-lg font-bold text-[#3A86FF] mb-4">Pasos de Cálculo</h3>
                    <div className="space-y-4">
                      {resultados.pasos.map((paso, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-[#9D4EDD]">
                          <p className="font-bold text-[#9D4EDD]">{paso.nombre}</p>
                          <p className="text-sm text-gray-600 mt-1">Fórmula: {paso.formula}</p>
                          <p className="text-sm text-gray-600">Cálculo: {paso.explicacion}</p>
                          <p className="text-lg font-bold text-[#3A86FF] mt-2">= {paso.valor.toFixed(6)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Gráficos */}
        {resultados && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico 1: Distribución Pn */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
              <h3 className="text-2xl font-bold text-[#9D4EDD] mb-6">Distribución Pn (Probabilidad de n clientes)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={datosGraficoPn}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="n"
                    label={{ value: 'Número de Clientes (n)', position: 'insideBottomRight', offset: -10 }}
                  />
                  <YAxis
                    label={{ value: 'Probabilidad', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value: any) => [(value * 100).toFixed(4) + '%', 'Probabilidad']}
                    labelFormatter={(label) => `n = ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="probabilidad" name="Pn" fill="#9D4EDD" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico 2: Ls vs ρ */}
            <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
              <h3 className="text-2xl font-bold text-[#3A86FF] mb-6">Longitud de Cola vs Factor de Utilización</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={datosGraficoLs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="rho"
                    label={{ value: 'ρ (Factor de Utilización)', position: 'insideBottomRight', offset: -10 }}
                  />
                  <YAxis
                    label={{ value: 'Ls (Clientes en Sistema)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    labelFormatter={(label) => `ρ = ${label}`}
                    formatter={(value) => [`${value} clientes`, 'Ls']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ls"
                    stroke="#3A86FF"
                    strokeWidth={3}
                    name="Ls"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-4">
                Este gráfico muestra cómo la longitud de la cola aumenta exponencialmente conforme la utilización se aproxima al 100%
              </p>
            </div>
          </div>
        )}

        {/* Tabla Pn */}
        {resultados && (
          <div className="mt-8 bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
            <h3 className="text-2xl font-bold text-[#9D4EDD] mb-4">Tabla de Probabilidades Pn</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#9D4EDD] text-white">
                    <th className="px-4 py-3 text-left font-bold">n (Clientes)</th>
                    <th className="px-4 py-3 text-center font-bold">Pn (Probabilidad)</th>
                    <th className="px-4 py-3 text-right font-bold">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.pn.map((item, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-4 py-2 font-bold">{item.n}</td>
                      <td className="px-4 py-2 text-center font-mono">{item.probabilidad.toFixed(8)}</td>
                      <td className="px-4 py-2 text-right">{(item.probabilidad * 100).toFixed(4)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
