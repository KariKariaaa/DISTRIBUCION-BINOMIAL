import React, { useState } from 'react';
import {
  distribucionBinomialCompleta,
  calcularMedia,
  calcularDesviacionEstandar,
  calcularDesviacionEstandarFinita,
  esPopulacionInfinita,
  probabilidadBinomial
} from '../utilidades/distribucionBinomial';
import ComponenteResultados from './ComponenteResultados';
import ComponenteGrafico from './ComponenteGrafico';
import ComponentePasosCalculo from './ComponentePasosCalculo';

export default function ComponenteFormulario() {
  const [n, setN] = useState<number>(10);
  const [p, setP] = useState<number>(0.5);
  const [N, setN_poblacion] = useState<number>();
  const [k, setK] = useState<number>(5);
  const [mostrarPasos, setMostrarPasos] = useState(false);
  const [resultados, setResultados] = useState<any>(null);

  const handleCalcular = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const infinita = esPopulacionInfinita(n, N);
      
      // Calcular distribución completa
      const distribucion = distribucionBinomialCompleta(n, p);
      
      // Calcular probabilidad para k específico
      const probK = probabilidadBinomial(n, k, p);
      
      // Calcular media
      const media = calcularMedia(n, p);
      
      // Calcular desviación estándar
      let desviacion;
      if (infinita) {
        desviacion = calcularDesviacionEstandar(n, p);
      } else {
        desviacion = calcularDesviacionEstandarFinita(n, p, N!);
      }
      
      setResultados({
        n,
        p,
        N,
        k,
        infinita,
        distribucion,
        probK,
        media,
        desviacion
      });
      
      setMostrarPasos(false);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold text-[#9D4EDD] mb-2 text-center">
          Calculadora de Distribución Binomial
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Calcula probabilidades y estadísticas usando la distribución binomial
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-1">
            <form onSubmit={handleCalcular} className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
              <h2 className="text-2xl font-bold text-[#9D4EDD] mb-6">Parámetros</h2>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Número de ensayos (n):
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

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Probabilidad de éxito (p):
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
                <p className="text-sm text-gray-500 mt-1">Valor entre 0 y 1</p>
              </div>

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
                <p className="text-sm text-gray-500 mt-1">Dejar en blanco para población infinita</p>
              </div>

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

                <ComponenteGrafico datos={resultados.distribucion} k={k} p={p} />
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
