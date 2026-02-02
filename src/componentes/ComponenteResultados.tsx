interface ResultadosProps {
  resultados: any;
}

export default function ComponenteResultados({ resultados }: ResultadosProps) {
  const { n, p, N, k, infinita, probK, media, desviacion } = resultados;

  return (
    <div className="space-y-4">
      {/* Información de población */}
      <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
        <h3 className="text-xl font-bold text-[#9D4EDD] mb-4">Información de la Población</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg p-4">
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
          <div className=" rounded-lg p-4">
            <p className="text-gray-700 text-sm">Tamaño de Muestra (n)</p>
            <p className="text-xl font-bold text-[#9D4EDD]">{n}</p>
          </div>
          <div className=" rounded-lg p-4">
            <p className="text-gray-700 text-sm">Probabilidad Éxito (p)</p>
            <p className="text-xl font-bold text-[#9D4EDD]">{(p * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Probabilidad para k específico */}
      <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
        <h3 className="text-xl font-bold text-[#3A86FF] mb-4">
          Probabilidad P(X = {k})
        </h3>
        <div className="rounded-lg p-6 text-[#3A86FF]">
          <p className="text-sm opacity-90">Resultado</p>
          <p className="text-4xl font-bold">{(probK.probabilidad * 100).toFixed(4)}%</p>
          <p className="text-lg mt-2">Decimal: {probK.probabilidad.toFixed(6)}</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        {/* Media */}
        <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
          <h3 className="text-lg font-bold text-[#9D4EDD] mb-4">Media (Esperanza)</h3>
          <div className=" rounded-lg p-4">
            <p className="text-sm text-gray-700">E(X) = n × p</p>
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
    </div>
  );
}
