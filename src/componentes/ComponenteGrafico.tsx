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

interface DatosGrafico {
  k: number;
  probabilidad: number;
  porcentaje: number;
}

interface ComponenteGraficoProps {
  datos: DatosGrafico[];
  k: number;
  p: number;
}

export default function ComponenteGrafico({ datos, k, p }: ComponenteGraficoProps) {
  const maxProbabilidad = Math.max(...datos.map(d => d.probabilidad));
  
  // Encontrar el rango de k a mostrar (máximo 25 barras para mejor visualización)
  const inicio = Math.max(0, k - 5);
  const fin = Math.min(datos.length - 1, k + 15);
  const datosVisibles = datos.slice(inicio, fin + 1).map((d) => ({
    ...d,
    nombre: `X=${d.k}`,
  }));

  const coloresBarras = datosVisibles.map((d) => (d.k === k ? '#9D4EDD' : '#3A86FF'));

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
                {datosVisibles.map((entry, index) => (
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
          <h4 className="text-lg font-bold text-[#9D4EDD] mb-3">Tabla Completa de Valores</h4>
          <div className="overflow-y-auto max-h-96 border-2 border-[#9D4EDD] rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-[#9D4EDD] text-white">
                  <th className="px-4 py-3 text-left font-bold">X (éxitos)</th>
                  <th className="px-4 py-3 text-center font-bold">Probabilidad</th>
                  <th className="px-4 py-3 text-right font-bold">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((dato, idx) => (
                  <tr
                    key={dato.k}
                    className={`border-b transition ${
                      dato.k === k
                        ? 'bg-[#E0AAFF] font-bold'
                        : idx % 2 === 0
                        ? 'bg-gray-50'
                        : 'bg-white'
                    } hover:bg-[#E0AAFF]/30`}
                  >
                    <td className="px-4 py-2">
                      {dato.k === k ? '► ' : ''}{dato.k}
                    </td>
                    <td className="px-4 py-2 text-center font-mono">{dato.probabilidad.toFixed(8)}</td>
                    <td className="px-4 py-2 text-right">{dato.porcentaje.toFixed(4)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Información */}
        <div className="bg-white border-l-4 border-[#3A86FF] rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-[#9D4EDD]">Barra destacada:</span> Representa el valor de X seleccionado ({k}).
            <br />
            <span className="font-bold text-[#9D4EDD]">Suma total:</span> Todas las probabilidades suman exactamente 100%.
          </p>
        </div>
      </div>
    </div>
  );
}
