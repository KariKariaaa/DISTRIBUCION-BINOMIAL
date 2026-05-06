interface TablaPoissonProps {
  resultados: any;
}

export default function TablaComparativaPoisson({ resultados }: TablaPoissonProps) {
  const {
    k,
    esHipergeometrica,
    probK,
    probKPoisson,
    media,
    mediaPoisson,
    desviacion,
    desviacionPoisson,
    sesgo,
    sesgoPoisson,
    curtosis,
    curtosisPoisson,
    distribucion,
    distribucionPoisson,
    distribucionPoisson: poissonData,
  } = resultados;

  if (!resultados.usarPoissonApproximacion || !distribucionPoisson) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-cyan-500 space-y-6">
      <h3 className="text-2xl font-bold text-cyan-600 mb-6">
        Tabla Comparativa: {esHipergeometrica ? 'Hipergeométrica' : 'Binomial'} y Poisson
      </h3>

      {/* Tabla de Probabilidades Puntuales */}
      <div>
        <h4 className="text-lg font-bold text-gray-700 mb-4">
          Comparación: P(X = {k})
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                <th className="border px-4 py-3 text-left font-bold">Métrica</th>
                <th className="border px-4 py-3 text-center font-bold">
                  {esHipergeometrica ? 'Hipergeométrica' : 'Binomial'}
                </th>
                <th className="border px-4 py-3 text-center font-bold">Poisson</th>
                <th className="border px-4 py-3 text-center font-bold">Diferencia</th>
                <th className="border px-4 py-3 text-center font-bold">Error %</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-50 hover:bg-blue-100 transition">
                <td className="border px-4 py-2 font-semibold text-gray-700">Probabilidad Puntual</td>
                <td className="border px-4 py-2 text-center font-mono">{probK.probabilidad.toFixed(8)}</td>
                <td className="border px-4 py-2 text-center font-mono text-cyan-600">{probKPoisson.probabilidad.toFixed(8)}</td>
                <td className="border px-4 py-2 text-center font-mono">
                  {(Math.abs(probK.probabilidad - probKPoisson.probabilidad)).toFixed(8)}
                </td>
                <td className="border px-4 py-2 text-center font-bold text-orange-600">
                  {probK.probabilidad !== 0
                    ? ((Math.abs(probK.probabilidad - probKPoisson.probabilidad) / probK.probabilidad) * 100).toFixed(3)
                    : 'N/A'}
                  %
                </td>
              </tr>
              <tr className="bg-green-50 hover:bg-green-100 transition">
                <td className="border px-4 py-2 font-semibold text-gray-700">Media (E[X])</td>
                <td className="border px-4 py-2 text-center font-mono">{media.valor.toFixed(6)}</td>
                <td className="border px-4 py-2 text-center font-mono text-cyan-600">{mediaPoisson.valor.toFixed(6)}</td>
                <td className="border px-4 py-2 text-center font-mono">
                  {(Math.abs(media.valor - mediaPoisson.valor)).toFixed(6)}
                </td>
                <td className="border px-4 py-2 text-center font-bold text-orange-600">
                  {media.valor !== 0
                    ? ((Math.abs(media.valor - mediaPoisson.valor) / media.valor) * 100).toFixed(3)
                    : 'N/A'}
                  %
                </td>
              </tr>
              <tr className="bg-purple-50 hover:bg-purple-100 transition">
                <td className="border px-4 py-2 font-semibold text-gray-700">Desviación Estándar</td>
                <td className="border px-4 py-2 text-center font-mono">{desviacion.valor.toFixed(6)}</td>
                <td className="border px-4 py-2 text-center font-mono text-cyan-600">{desviacionPoisson.valor.toFixed(6)}</td>
                <td className="border px-4 py-2 text-center font-mono">
                  {(Math.abs(desviacion.valor - desviacionPoisson.valor)).toFixed(6)}
                </td>
                <td className="border px-4 py-2 text-center font-bold text-orange-600">
                  {desviacion.valor !== 0
                    ? ((Math.abs(desviacion.valor - desviacionPoisson.valor) / desviacion.valor) * 100).toFixed(3)
                    : 'N/A'}
                  %
                </td>
              </tr>
              <tr className="bg-yellow-50 hover:bg-yellow-100 transition">
                <td className="border px-4 py-2 font-semibold text-gray-700">Sesgo (γ)</td>
                <td className="border px-4 py-2 text-center font-mono">{sesgo.valor.toFixed(6)}</td>
                <td className="border px-4 py-2 text-center font-mono text-cyan-600">{sesgoPoisson.valor.toFixed(6)}</td>
                <td className="border px-4 py-2 text-center font-mono">
                  {(Math.abs(sesgo.valor - sesgoPoisson.valor)).toFixed(6)}
                </td>
                <td className="border px-4 py-2 text-center font-bold text-orange-600">
                  {sesgo.valor !== 0
                    ? ((Math.abs(sesgo.valor - sesgoPoisson.valor) / Math.abs(sesgo.valor)) * 100).toFixed(3)
                    : 'N/A'}
                  %
                </td>
              </tr>
              <tr className="bg-pink-50 hover:bg-pink-100 transition">
                <td className="border px-4 py-2 font-semibold text-gray-700">Curtosis (κ)</td>
                <td className="border px-4 py-2 text-center font-mono">{curtosis.valor.toFixed(6)}</td>
                <td className="border px-4 py-2 text-center font-mono text-cyan-600">{curtosisPoisson.valor.toFixed(6)}</td>
                <td className="border px-4 py-2 text-center font-mono">
                  {(Math.abs(curtosis.valor - curtosisPoisson.valor)).toFixed(6)}
                </td>
                <td className="border px-4 py-2 text-center font-bold text-orange-600">
                  {curtosis.valor !== 0
                    ? ((Math.abs(curtosis.valor - curtosisPoisson.valor) / Math.abs(curtosis.valor)) * 100).toFixed(3)
                    : 'N/A'}
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de Distribuciones Completas */}
      <div>
        <h4 className="text-lg font-bold text-gray-700 mb-4">
          Distribuciones Completas
        </h4>
        <div className="overflow-y-auto max-h-96 border-2 border-cyan-300 rounded-lg">
          <table className="w-full text-sm">
            <thead className="sticky top-0">
              <tr className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                <th className="px-3 py-2 text-left font-bold">k</th>
                <th className="px-3 py-2 text-center font-bold">{esHipergeometrica ? 'Hipergeo.' : 'Binomial'}</th>
                <th className="px-3 py-2 text-center font-bold">%</th>
                <th className="px-3 py-2 text-center font-bold">Poisson</th>
                <th className="px-3 py-2 text-center font-bold">%</th>
                <th className="px-3 py-2 text-center font-bold">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {distribucion.map((dato: any, idx: number) => {
                const poissonDato = distribucionPoisson[idx];
                if (!poissonDato) return null;
                
                const isK = dato.k === k;
                const diferencia = Math.abs(dato.probabilidad - poissonDato.probabilidad);
                
                return (
                  <tr
                    key={dato.k}
                    className={`border-b transition ${
                      isK
                        ? 'bg-cyan-100 font-bold border-cyan-500'
                        : idx % 2 === 0
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-2 text-center">{isK && '► '}{dato.k}</td>
                    <td className="px-3 py-2 text-center font-mono text-sm">{dato.probabilidad.toFixed(8)}</td>
                    <td className="px-3 py-2 text-center font-mono text-xs">{dato.porcentaje.toFixed(4)}%</td>
                    <td className="px-3 py-2 text-center font-mono text-sm text-cyan-600">{poissonDato.probabilidad.toFixed(8)}</td>
                    <td className="px-3 py-2 text-center font-mono text-xs text-cyan-600">{poissonDato.porcentaje.toFixed(4)}%</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-orange-500">{diferencia.toFixed(8)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notas de Aproximación
      <div className="p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-500 space-y-2">
        <p className="font-bold text-cyan-700">📝 Notas sobre la Aproximación:</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <span className="font-semibold">Error %:</span> Porcentaje de diferencia respecto al valor original</li>
          <li>• <span className="font-semibold">Filas resaltadas en cyan:</span> Corresponden a k = {k}</li>
          <li>• <span className="font-semibold">Mejor aproximación:</span> Cuando n es grande y p es pequeño (p &lt; 0.10)</li>
          <li>• <span className="font-semibold">Validez:</span> La aproximación de Poisson es válida cuando λ = n×p &lt; 10</li>
        </ul>
      </div> */}
    </div>
  );
}
