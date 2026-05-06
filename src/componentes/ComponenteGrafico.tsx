// ComponenteGrafico.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useState } from 'react';

interface DatosGrafico {
  k: number;
  probabilidad: number;
  porcentaje: number;
}

interface ComponenteGraficoProps {
  datos: DatosGrafico[];
  k: number;
  k2?: number;
  rango?: any;
  p: number;
}

export default function ComponenteGrafico({ datos, k, k2}: ComponenteGraficoProps) {
  const [factorExito, setFactorExito] = useState<number>(85.75);
  
  const maxProbabilidad = Math.max(...datos.map(d => d.probabilidad));
  
  // Calcular probabilidades acumuladas
  const datosConAcumulada = datos.map((dato, idx) => {
    const acumulada = datos.slice(0, idx + 1).reduce((sum, d) => sum + d.probabilidad, 0);
    return {
      ...dato,
      acumulada,
      porcentajeAcumulado: acumulada * 100
    };
  });

  // Encontrar el valor de X cuya probabilidad acumulada se aproxime más al factor de éxito
  const xMasProximo = datosConAcumulada.reduce((prev, current) => {
    const diffPrev = Math.abs(prev.porcentajeAcumulado - factorExito);
    const diffCurrent = Math.abs(current.porcentajeAcumulado - factorExito);
    return diffCurrent < diffPrev ? current : prev;
  });
  
  // Encontrar el rango de k a mostrar (máximo 25 barras para mejor visualización)
  const inicio = Math.max(0, (k2 || k) - 5);
  const fin = Math.min(datos.length - 1, (k2 || k) + 15);
  const datosVisibles = datosConAcumulada.slice(inicio, fin + 1).map((d) => ({
    ...d,
    nombre: `X=${d.k}`,
  }));

  const coloresBarras = datosVisibles.map((d) => {
    // Si hay rango, colorear todos los valores del rango
    if (k2 && d.k >= k && d.k <= k2) {
      return '#9D4EDD';
    }
    // Si no hay rango, solo colorear el k seleccionado
    if (!k2 && d.k === k) {
      return '#9D4EDD';
    }
    return '#3A86FF';
  });

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
      <h3 className="text-2xl font-bold text-[#9D4EDD] mb-6">Gráfico de Distribución</h3>
      
      <div className="space-y-6">
        {/* Gráfico principal */}
        <div className="bg-white rounded-lg p-4">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={datosVisibles} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="k"
                label={{ value: 'Número de Éxitos (X)', position: 'insideBottomRight', offset: -10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{ value: 'Probabilidad', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #9D4EDD',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [(value * 100).toFixed(4) + '%', 'Probabilidad']}
                labelFormatter={(label) => `X = ${label}`}
              />
              <Legend />
              <Bar dataKey="probabilidad" name="Probabilidad" radius={[8, 8, 0, 0]}>
                {datosVisibles.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={coloresBarras[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg p-4 text-center border-l-4 border-[#9D4EDD]">
            <p className="text-sm text-gray-700 font-semibold">Rango Mostrado</p>
            <p className="text-lg font-bold text-[#9D4EDD]">X: {inicio} a {fin}</p>
          </div>
          <div className="rounded-lg p-4 text-center border-l-4 border-[#3A86FF]">
            <p className="text-sm text-gray-700 font-semibold">Total de Eventos</p>
            <p className="text-lg font-bold text-[#3A86FF]">{datos.length}</p>
          </div>
          <div className="rounded-lg p-4 text-center border-l-4 border-yellow-500">
            <p className="text-sm text-gray-700 font-semibold">Máx. Probabilidad</p>
            <p className="text-lg font-bold text-yellow-600">{(maxProbabilidad * 100).toFixed(3)}%</p>
          </div>
        </div>

        {/* Tabla de valores completa */}
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-4 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <label className="text-sm font-bold text-gray-700">
              Factor de Éxito (% de aceptación):
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={factorExito}
              onChange={(e) => setFactorExito(parseFloat(e.target.value) || 0)}
              className="px-3 py-2 border-2 border-yellow-500 rounded-lg focus:outline-none focus:border-[#9D4EDD] w-24"
            />
            <span className="text-xs text-gray-600">
              ✓ X = {xMasProximo.k} se aproxima más ({xMasProximo.porcentajeAcumulado.toFixed(2)}%)
            </span>
          </div>

          <h4 className="text-lg font-bold text-[#9D4EDD] mb-3">Tabla Completa de Valores</h4>
          <div className="overflow-y-auto max-h-96 border-2 border-[#9D4EDD] rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-[#9D4EDD] text-white">
                  <th className="px-4 py-3 text-left font-bold">X (éxitos)</th>
                  <th className="px-4 py-3 text-center font-bold">Probabilidad</th>
                  <th className="px-4 py-3 text-right font-bold">Porcentaje</th>
                  <th className="px-4 py-3 text-right font-bold">Prob. Acumulada</th>
                  <th className="px-4 py-3 text-right font-bold">% Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {datosConAcumulada.map((dato, idx) => {
                  const isSelected = dato.k === k;
                  const isFactor = dato.k === xMasProximo.k;
                  
                  return (
                    <tr
                      key={dato.k}
                      className={`border-b transition ${
                        isSelected
                          ? 'bg-[#E0AAFF] font-bold'
                          : isFactor
                          ? 'bg-yellow-100 font-semibold'
                          : idx % 2 === 0
                          ? 'bg-gray-50'
                          : 'bg-white'
                      } hover:bg-[#E0AAFF]/30`}
                    >
                      <td className="px-4 py-2">
                        {isSelected && '► '}{isFactor && '* '}{dato.k}
                      </td>
                      <td className="px-4 py-2 text-center font-mono">{dato.probabilidad.toFixed(8)}</td>
                      <td className="px-4 py-2 text-right">{dato.porcentaje.toFixed(4)}%</td>
                      <td className="px-4 py-2 text-right font-mono">{dato.acumulada.toFixed(8)}</td>
                      <td className="px-4 py-2 text-right font-bold text-[#9D4EDD]">{dato.porcentajeAcumulado.toFixed(4)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Información */}
        <div className="bg-white border-l-4 border-[#3A86FF] rounded-lg p-4 space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-[#9D4EDD]">Barra destacada (►):</span> Representa el valor de X seleccionado ({k}).
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-bold text-yellow-600">Fila destacada (*):</span> Representa el valor de X cuya probabilidad acumulada se aproxima más al factor de éxito ({factorExito.toFixed(2)}%).
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-bold text-[#9D4EDD]">Suma total:</span> Todas las probabilidades suman exactamente 100%.
          </p>
        </div>
      </div>
    </div>
  );
}
