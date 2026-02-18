import React, { useState } from 'react';
import {
  distribucionBinomialCompleta,
  calcularMedia,
  calcularDesviacionEstandar,
  calcularDesviacionEstandarFinita,
  calcularFactorCorreccion,
  calcularSesgo,
  calcularCurtosis,
  esPopulacionInfinita,
  probabilidadBinomial,
  probabilidadRango,
  esHipergeometica
} from '../utilidades/distribucionBinomial';
import {
  distribucionHipergeometricaCompleta,
  probabilidadHipergeometrica,
  probabilidadRangoHipergeometrica,
  calcularMediaHipergeometrica,
  calcularDesviacionEstandarHipergeometrica,
  calcularSesgoHipergeometrica,
  calcularCurtosisHipergeometrica
} from '../utilidades/hipergeometrica';
import ComponenteResultados from './ComponenteResultados';
import ComponenteGrafico from './ComponenteGrafico';
import ComponentePasosCalculo from './ComponentePasosCalculo';

export default function ComponenteFormulario() {
  const [n, setN] = useState<number>(10);
  const [p, setP] = useState<number>(0.5);
  const [N, setN_poblacion] = useState<number>();
  const [M, setM] = useState<number>();
  const [k, setK] = useState<number>(5);
  const [k2, setK2] = useState<number>();
  const [mostrarPasos, setMostrarPasos] = useState(false);
  const [resultados, setResultados] = useState<any>(null);

  const handleCalcular = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Determinar si usar hipergeométrica o binomial
      const usarHipergeometrica = !esHipergeometica(n, N);

      if (n < 1 || n > N!) {
        alert('El tamaño de la muestra (n) debe estar entre 1 y N');
        return;
      }

      if (k < 0 || k > n) {
        alert('k debe estar entre 0 y n');
        return;
      }
      
      if (usarHipergeometrica) {
        // Validar que M esté definido
        if (M === undefined || M === null) {
          alert('Para distribución hipergeométrica, debes especificar el número de éxitos en la población (M)');
          return;
        }
        if (M > N! || M < 0) {
          alert('M debe estar entre 0 y N');
          return;
        }
        
        // Calcular distribución hipergeométrica completa
        const distribucion = distribucionHipergeometricaCompleta(N!, M, n);
        
        // Determinar si se calcula rango o valor puntual
        let probK;
        let rango = null;
        
        if (k2 !== undefined && k2 !== null && k2 >= k) {
          // Calcular rango
          rango = probabilidadRangoHipergeometrica(N!, M, n, k, k2);
          probK = probabilidadHipergeometrica(N!, M, n, k);
        } else {
          // Calcular valor puntual
          probK = probabilidadHipergeometrica(N!, M, n, k);
        }
        
        // Calcular media
        const media = calcularMediaHipergeometrica(N!, M, n);
        
        // Calcular desviación estándar
        const desviacion = calcularDesviacionEstandarHipergeometrica(N!, M, n);
        
        // Calcular sesgo
        const sesgo = calcularSesgoHipergeometrica(N!, M, n);
        
        // Calcular curtosis
        const curtosis = calcularCurtosisHipergeometrica(N!, M, n);
        
        setResultados({
          n,
          M,
          N,
          k,
          k2,
          esHipergeometrica: true,
          distribucion,
          probK,
          rango,
          media,
          desviacion,
          sesgo,
          curtosis
        });
      } else {
        // Usar distribución binomial
        const infinita = esPopulacionInfinita(n, N);
        
        // Calcular distribución completa
        const distribucion = distribucionBinomialCompleta(n, p);
        
        // Determinar si se calcula rango o valor puntual
        let probK;
        let rango = null;
        
        if (k2 !== undefined && k2 !== null && k2 >= k) {
          // Calcular rango
          rango = probabilidadRango(n, k, k2, p);
          probK = probabilidadBinomial(n, k, p);
        } else {
          // Calcular valor puntual
          probK = probabilidadBinomial(n, k, p);
        }
        
        // Calcular media
        const media = calcularMedia(n, p, N);
        
        // Calcular desviación estándar
        let desviacion;
        if (infinita) {
          desviacion = calcularDesviacionEstandar(n, p);
        } else {
          desviacion = calcularDesviacionEstandarFinita(n, p, N!);
        }
        
        // Calcular factor de corrección (si es población finita)
        let factorCorreccion = null;
        if (!infinita && N) {
          factorCorreccion = calcularFactorCorreccion(n, N);
        }
        
        // Calcular sesgo
        const sesgo = calcularSesgo(n, p, N);
        
        // Calcular curtosis
        const curtosis = calcularCurtosis(n, p, N);
        
        setResultados({
          n,
          p,
          N,
          k,
          k2,
          infinita,
          esHipergeometrica: false,
          distribucion,
          probK,
          rango,
          media,
          desviacion,
          factorCorreccion,
          sesgo,
          curtosis
        });
      }
      
      setMostrarPasos(false);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold text-[#9D4EDD] mb-2 text-center">
          Calculadora de Distribución {!esHipergeometica(n, N) && N ? 'Hipergeométrica' : 'Binomial'}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {!esHipergeometica(n, N) && N 
            ? 'Calcula probabilidades y estadísticas usando la distribución hipergeométrica' 
            : 'Calcula probabilidades y estadísticas usando la distribución binomial'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-1">
            <form onSubmit={handleCalcular} className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
              <h2 className="text-2xl font-bold text-[#9D4EDD] mb-6">Parámetros</h2>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Tamaño de la población (N):
                </label>
                <input
                  type="number"
                  min="1"
                  value={N || ''}
                  onChange={(e) => setN_poblacion(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder=""
                  className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                />
                <p className="text-sm text-gray-500 mt-1">Dejar en blanco para población infinita (Binomial)</p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Número de ensayos/muestra (n):
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={n}
                  onChange={(e) => setN(Number(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                />
              </div>

              {N && !esHipergeometica(n, N) && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Cantidad de éxitos en la población (M):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={N}
                    value={M || ''}
                    onChange={(e) => setM(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border-2 border-[#9D4EDD] rounded-lg focus:outline-none focus:border-[#9D4EDD] bg-yellow-50"
                  />
                  <p className="text-sm text-[#9D4EDD] mt-1 font-semibold">Requerido para distribución hipergeométrica</p>
                </div>
              )}

              {esHipergeometica(n, N) && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Probabilidad de éxito (p):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.0001"
                    value={p}
                    onChange={(e) => setP(Number(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                  />
                  <p className="text-sm text-gray-500 mt-1">Valor entre 0 y 1</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Número de éxitos (k) para cálculo específico:
                </label>
                <input
                  type="number"
                  min="0"
                  max={n}
                  value={k}
                  onChange={(e) => setK(Number(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                />
                <p className="text-xs text-gray-500 mt-1">Valor puntual: P(X = k)</p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Rango hasta k₂ (opcional):
                </label>
                <input
                  type="number"
                  min={k}
                  max={n}
                  value={k2 || ''}
                  onChange={(e) => setK2(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Dejar en blanco para cálculo puntual"
                  className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                />
                <p className="text-xs text-gray-500 mt-1">Rango: P(k ≤ X ≤ k₂)</p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#312c2c] text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
              >
                Calcular
              </button>
            </form>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2">
            {resultados ? (
              <div className="space-y-6">
                <ComponenteResultados resultados={resultados} />
                
                <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
                  <button
                    onClick={() => setMostrarPasos(!mostrarPasos)}
                    className="w-full bg-[#312c2c] text-white font-bold py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    {mostrarPasos ? 'Ocultar' : 'Ver'} Pasos del Cálculo
                  </button>
                  
                  {mostrarPasos && resultados.probK && (
                    <ComponentePasosCalculo pasos={resultados.probK.pasos} />
                  )}
                </div>

                <ComponenteGrafico datos={resultados.distribucion} k={k} k2={k2} rango={resultados.rango} p={p} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center border-l-4 border-[#3A86FF]">
                <p className="text-gray-500 text-lg">
                  Completa los parámetros y haz clic en "Calcular" para ver los resultados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
