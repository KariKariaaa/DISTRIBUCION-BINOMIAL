interface ResultadosProps {
  resultados: any;
}

export default function ComponenteResultados({ resultados }: ResultadosProps) {
  const { n, p, M, N, k, k2, infinita, esHipergeometrica, probK, rango, media, desviacion, factorCorreccion, sesgo, curtosis } = resultados;

  return (
    <div className="space-y-4">
      {/* Información de población */}
      <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
        <h3 className="text-xl font-bold text-[#9D4EDD] mb-4">Información de la Población / Muestra</h3>
        <div className="grid grid-cols-2 gap-4">
          {esHipergeometrica ? (
            <>
              <div className="bg-yellow-100 rounded-lg p-4">
                <p className="text-gray-700 text-sm">Distribución</p>
                <p className="text-xl font-bold text-[#9D4EDD]">Hipergeométrica</p>
              </div>
              {N && (
                <div className="rounded-lg p-4">
                  <p className="text-gray-700 text-sm">Tamaño de Población (N)</p>
                  <p className="text-xl font-bold text-[#9D4EDD]">{N}</p>
                </div>
              )}
              {M !== undefined && (
                <div className="rounded-lg p-4 bg-yellow-50">
                  <p className="text-gray-700 text-sm">Éxitos en Población (M)</p>
                  <p className="text-xl font-bold text-[#9D4EDD]">{M}</p>
                </div>
              )}
              <div className="rounded-lg p-4">
                <p className="text-gray-700 text-sm">Tamaño de Muestra (n)</p>
                <p className="text-xl font-bold text-[#9D4EDD]">{n}</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-lilaClaro rounded-lg p-4">
                <p className="text-gray-700 text-sm">Tipo de Población</p>
                <p className="text-xl font-bold text-[#9D4EDD]">
                  {infinita ? '∞ Infinita' : '⊙ Finita'}
                </p>
              </div>
              {N && (
                <div className="rounded-lg p-4">
                  <p className="text-gray-700 text-sm">Tamaño de Población (N)</p>
                  <p className="text-xl font-bold text-[#9D4EDD]">{N}</p>
                </div>
              )}
              <div className="rounded-lg p-4">
                <p className="text-gray-700 text-sm">Tamaño de Muestra (n)</p>
                <p className="text-xl font-bold text-[#9D4EDD]">{n}</p>
              </div>
              <div className="rounded-lg p-4">
                <p className="text-gray-700 text-sm">Probabilidad Éxito (p)</p>
                <p className="text-xl font-bold text-[#9D4EDD]">{(p * 100).toFixed(1)}%</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Probabilidad para k específico */}
      <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
        {rango ? (
          <div>
            <h3 className="text-xl font-bold text-[#3A86FF] mb-4">
              Probabilidad P({k} ≤ X ≤ {k2})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-6 text-[#3A86FF]">
                <p className="text-sm opacity-90">Rango Completo</p>
                <p className="text-4xl font-bold">{(rango.probabilidad * 100).toFixed(4)}%</p>
                <p className="text-lg mt-2">Decimal: {rango.probabilidad.toFixed(6)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 text-[#3A86FF]">
                <p className="text-sm opacity-90">Puntual P(X = {k})</p>
                <p className="text-2xl font-bold">{(probK.probabilidad * 100).toFixed(4)}%</p>
                <p className="text-sm mt-2">Decimal: {probK.probabilidad.toFixed(6)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold text-[#3A86FF] mb-4">
              Probabilidad P(X = {k})
            </h3>
            <div className="rounded-lg p-6 text-[#3A86FF]">
              <p className="text-sm opacity-90">Resultado</p>
              <p className="text-4xl font-bold">{(probK.probabilidad * 100).toFixed(4)}%</p>
              <p className="text-lg mt-2">Decimal: {probK.probabilidad.toFixed(6)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-2 gap-4">
        {/* Media */}
        <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
          <h3 className="text-lg font-bold text-[#9D4EDD] mb-4">Media (Esperanza)</h3>
          <div className=" rounded-lg p-4">
            <p className="text-sm text-gray-700">{esHipergeometrica ? 'E(X) = n × (M/N)' : 'E(X) = n × p'}</p>
            <p className="text-3xl font-bold text-[#9D4EDD] mt-2">{media.valor.toFixed(4)}</p>
          </div>
        </div>

        {/* Desviación Estándar */}
        <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
          <h3 className="text-lg font-bold text-[#3A86FF] mb-4">Desviación Estándar</h3>
          <div className="rounded-lg p-4">
            <p className="text-sm text-gray-700">σ = √(Varianza)</p>
            <p className="text-3xl font-bold text-[#3A86FF] mt-2">{desviacion.valor.toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* Factor de Corrección (si es población finita en binomial) */}
      {factorCorreccion && !esHipergeometrica && (
        <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#FFA500]">
          <h3 className="text-lg font-bold text-[#FFA500] mb-4">Factor de Corrección (Población Finita)</h3>
          <div className="bg-purple-100 rounded-lg p-4">
            <p className="text-sm text-gray-700">FC = (N - n) / (N - 1)</p>
            <p className="text-3xl font-bold text-[#FFA500] mt-2">{factorCorreccion.valor.toFixed(6)}</p>
            <p className="text-xs text-gray-600 mt-2">Este factor se aplica para ajustar el muestreo sin reemplazo</p>
          </div>
        </div>
      )}

      {/* Sesgo y Curtosis */}
      <div className="grid grid-cols-2 gap-4">
        {/* Sesgo */}
        <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
          <h3 className="text-lg font-bold text-[#3A86FF] mb-4">Sesgo (Skewness)</h3>
          <div className="rounded-lg p-4">
            <p className="text-sm text-gray-700">{esHipergeometrica ? 'γ (Hipergeométrica)' : 'γ = (1 - 2p) / √(Varianza)'}</p>
            <p className="text-3xl font-bold text-[#3A86FF] mt-2">{sesgo.valor.toFixed(6)}</p>
            <div className="mt-3 p-2 bg-white rounded border-l-4 border-[#3A86FF]">
              <p className="text-sm font-bold text-[#3A86FF]">{sesgo.clasificacion}</p>
            </div>
          </div>
        </div>

        {/* Curtosis */}
        <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
          <h3 className="text-lg font-bold text-[#9D4EDD] mb-4">Curtosis (Kurtosis)</h3>
          <div className="rounded-lg p-4">
            <p className="text-sm text-gray-700">{esHipergeometrica ? 'κ (Hipergeométrica)' : 'κ = (1 - 6p(1-p)) / Varianza'}</p>
            <p className="text-3xl font-bold text-[#9D4EDD] mt-2">{curtosis.valor.toFixed(6)}</p>
            <div className="mt-3 p-2 bg-white rounded border-l-4 border-[#9D4EDD]">
              <p className="text-sm font-bold text-[#9D4EDD]">{curtosis.clasificacion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interpretación */}
      <div className="bg-white rounded-lg p-6 border-l-4 border-[#9D4EDD]">
        <h4 className="text-lg font-bold text-lila mb-3">Interpretación de Resultados</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <p><span className="font-semibold text-[#FFA500]">Sesgo:</span> {sesgo.clasificacion}</p>
          <p><span className="font-semibold text-[#3A86FF]">Curtosis:</span> {curtosis.clasificacion}</p>
          <p className="text-xs text-gray-600 mt-4">
            {esHipergeometrica 
              ? 'Análisis para distribución HIPERGEOMÉTRICA (sin reemplazo)' 
              : infinita 
                ? 'Análisis para población INFINITA' 
                : 'Análisis para población FINITA (con factor de corrección)'}
          </p>
        </div>
      </div>
    </div>
  );
}
