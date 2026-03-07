import { useState } from 'react';
import {
  distribucionPoissonCompleta,
  calcularMediaPoisson,
  calcularDesviacionEstandarPoisson,
  calcularSesgoPoisson,
  calcularCurtosisPoisson,
  probabilidadPoisson,
  puedeUsarPoisson,
  probabilidadAcumuladaPoisson,
  probabilidadComplementariaPoisson
} from '../utilidades/poisson';
import ComponenteResultados from './ComponenteResultados';
import ComponenteGrafico from './ComponenteGrafico';

export default function ComponentePoisson({ onVolverAlCalculador }: { onVolverAlCalculador: () => void }) {
  const [n, setN] = useState<number>(100);
  const [p, setP] = useState<number>(0.05);
  const [k, setK] = useState<number>(0);
  const [lambda, setLambda] = useState<number>(5);
  const [usarLambdaDirecto, setUsarLambdaDirecto] = useState<boolean>(false);
  const [resultados, setResultados] = useState<any>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [mensajeError, setMensajeError] = useState<string>('');

  const modoDeUso = usarLambdaDirecto ? 'lambda' : 'parametros';
  const lambdaCalculada = usarLambdaDirecto ? lambda : n * p;

  const handleCalcular = () => {
    setMensajeError('');
    
    // Validaciones
    if (!usarLambdaDirecto) {
      if (n < 1) {
        setMensajeError('n (número de ensayos) debe ser mayor a 0');
        return;
      }
      if (p < 0 || p > 1) {
        setMensajeError('p (probabilidad de éxito) debe estar entre 0 y 1');
        return;
      }
      if (!puedeUsarPoisson(n, p)) {
        setMensajeError(
          `No se puede usar Poisson con estos parámetros:\n\n` +
          `n = ${n}, p = ${p}\n` +
          `λ (media) = n × p = ${lambdaCalculada.toFixed(4)}\n\n` +
          `Para usar Poisson se requiere:\n` +
          `• p < 0.10\n` +
          `• λ < 10)\n\n` +
          `Se recomienda usar la distribución BINOMIAL en su lugar.`
        );
        return;
      }
    } else {
      if (lambda <= 0) {
        setMensajeError('λ (lambda) debe ser mayor a 0');
        return;
      }
    }

    if (k < 0 || !Number.isInteger(k)) {
      setMensajeError('k debe ser un número entero no negativo');
      return;
    }

    try {
      const distribucion = distribucionPoissonCompleta(lambdaCalculada);
      const probK = probabilidadPoisson(lambdaCalculada, k);
      const probAcumulada = probabilidadAcumuladaPoisson(lambdaCalculada, k);
      const probComplementaria = probabilidadComplementariaPoisson(lambdaCalculada, k);
      const media = calcularMediaPoisson(lambdaCalculada);
      const desviacion = calcularDesviacionEstandarPoisson(lambdaCalculada);
      const sesgo = calcularSesgoPoisson(lambdaCalculada);
      const curtosis = calcularCurtosisPoisson(lambdaCalculada);

      setResultados({
        n: usarLambdaDirecto ? null : n,
        p: usarLambdaDirecto ? null : p,
        lambda: lambdaCalculada,
        k,
        esPoisson: true,
        modoDeUso,
        distribucion,
        probK,
        probAcumulada,
        probComplementaria,
        media,
        desviacion,
        sesgo,
        curtosis
      });

      setMostrarResultados(true);
    } catch (error: any) {
      setMensajeError(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-[#9D4EDD]">
            Distribución de Poisson
          </h1>
          <button
            onClick={onVolverAlCalculador}
            className="bg-[#312c2c] text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
          >
            ← Volver a Menú Principal
          </button>
        </div>

        <p className="text-center text-gray-600 mb-8 text-lg">
          Calcula la probabilidad de eventos raros usando la distribución de Poisson
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de parámetros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD] space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#9D4EDD] mb-4">1. Seleccionar Modo</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border-2 border-[#3A86FF] rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <input
                      type="radio"
                      checked={!usarLambdaDirecto}
                      onChange={() => setUsarLambdaDirecto(false)}
                      className="w-4 h-4 cursor-pointer accent-[#3A86FF]"
                    />
                    <span className="font-semibold text-gray-700">Usar n y p</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border-2 border-[#9D4EDD] rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <input
                      type="radio"
                      checked={usarLambdaDirecto}
                      onChange={() => setUsarLambdaDirecto(true)}
                      className="w-4 h-4 cursor-pointer accent-[#9D4EDD]"
                    />
                    <span className="font-semibold text-gray-700">Usar λ directamente</span>
                  </label>
                </div>
              </div>

              {!usarLambdaDirecto ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      n (Número de Ensayos):
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={n}
                      onChange={(e) => setN(Number(e.target.value))}
                      className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Debe ser mayor a 0</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      p (Probabilidad de Éxito):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={p}
                      onChange={(e) => setP(Number(e.target.value))}
                      className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Debe estar entre 0 y 1 (idealmente menor a 0.10)</p>
                  </div>

                  <div className="p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-semibold text-gray-700">
                      λ (Parámetro calculado):
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{lambdaCalculada.toFixed(4)}</p>
                    <p className="text-xs text-gray-600 mt-1">λ = n × p = {n} × {p}</p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    λ (Lambda - Parámetro de Poisson):
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.1"
                    value={lambda}
                    onChange={(e) => setLambda(Number(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-[#9D4EDD] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deve ser mayor a 0 (media de eventos esperados)</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  k (Número de Eventos):
                </label>
                <input
                  type="number"
                  min="0"
                  value={k}
                  onChange={(e) => setK(Number(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                />
                <p className="text-xs text-gray-500 mt-1">Entero no negativo: cuántos eventos ocurren</p>
              </div>

              {mensajeError && (
                <div className="p-4 bg-red-100 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm text-red-700 whitespace-pre-line">{mensajeError}</p>
                </div>
              )}

              <button
                onClick={handleCalcular}
                className="w-full bg-[#9D4EDD] text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
              >
                Calcular Distribución de Poisson
              </button>
            </div>
          </div>

          {/* Panel de resultados */}
          <div className="lg:col-span-2">
            {!mostrarResultados ? (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center border-l-4 border-[#3A86FF]">
                <p className="text-gray-500 text-lg">
                  Configura los parámetros y haz clic en "Calcular Distribución de Poisson"
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <ComponenteResultados resultados={resultados} />
                <ComponenteGrafico datos={resultados.distribucion} k={k} p={p} />
              </div>
            )}
          </div>
        </div>

        {/* Información sobre Poisson */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
          <h2 className="text-2xl font-bold text-[#9D4EDD] mb-4">ℹ️ Información sobre la Distribución de Poisson</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-[#3A86FF] mb-2">¿Cuándo usar Poisson?</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Eventos raros e independientes</li>
                <li>• Probabilidad pequeña (p {"<"} 0.10)</li>
                <li>• Media pequeña (λ {"<"} 10)</li>
                <li>• Número de llamadas, errores, accidentes</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-bold text-[#9D4EDD] mb-2">Características</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Media = Varianza = λ</li>
                <li>• Desviación = √λ</li>
                <li>• Sesgo = 1/√λ (siempre positivo)</li>
                <li>• Curtosis = 1/λ (siempre positiva)</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-bold text-yellow-600 mb-2">Fórmula</h3>
              <p className="text-sm text-gray-700 font-mono">P(X = k) = (e^(-λ) × λ^k) / k!</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-bold text-green-600 mb-2">Validación Automática</h3>
              <p className="text-sm text-gray-700">El programa verifica si es posible usar Poisson y sugiere Binomial si no aplica.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
