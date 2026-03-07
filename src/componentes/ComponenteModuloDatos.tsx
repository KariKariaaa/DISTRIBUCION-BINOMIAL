import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  distribucionBinomialCompleta,
  calcularMedia,
  calcularDesviacionEstandar,
  calcularDesviacionEstandarFinita,
  calcularSesgo,
  calcularCurtosis,
  esPopulacionInfinita,
  probabilidadBinomial,
  esHipergeometica,
  probabilidadAcumuladaBinomial,
  probabilidadComplementariaBinomial
} from '../utilidades/distribucionBinomial';
import {
  distribucionHipergeometricaCompleta,
  probabilidadHipergeometrica,
  calcularMediaHipergeometrica,
  calcularDesviacionEstandarHipergeometrica,
  calcularSesgoHipergeometrica,
  calcularCurtosisHipergeometrica,
  probabilidadAcumuladaHipergeometrica,
  probabilidadComplementariaHipergeometrica
} from '../utilidades/hipergeometrica';
import ComponenteResultados from './ComponenteResultados';
import ComponenteGrafico from './ComponenteGrafico';

interface DatosArchivo {
  encabezados: string[];
  datos: string[][];
}

export default function ComponenteModuloDatos({ onVolverAlCalculador }: { onVolverAlCalculador: () => void }) {
  const [datosArchivo, setDatosArchivo] = useState<DatosArchivo | null>(null);
  const [columnasDisponibles, setColumnasDisponibles] = useState<string[]>([]);
  const [columnaSeleccionada, setColumnaSeleccionada] = useState<string>('');
  const [frecuencias, setFrecuencias] = useState<{ [key: string]: number }>({});
  const [valoresSeleccionados, setValoresSeleccionados] = useState<Set<string>>(new Set());
  const [N, setN] = useState<number>();
  const [K, setK] = useState<number>();
  const [n, setN_muestra] = useState<number>(10);
  const [x, setX] = useState<number>(0);
  const [resultados, setResultados] = useState<any>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Cargar archivo
  const handleCargarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        let datos: DatosArchivo | null = null;

        if (archivo.name.endsWith('.xlsx') || archivo.name.endsWith('.xls')) {
          // Leer Excel
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
          
          if (json.length > 0) {
            const encabezados = (json[0] as string[]) || [];
            const filas = json.slice(1).filter(fila => fila && (fila as unknown[]).length > 0) as string[][];

            if (filas.length === 0) {
              alert('El archivo Excel está vacío (sin datos después del encabezado)');
              return;
            }

            datos = { encabezados, datos: filas };
          }
        } else if (archivo.name.endsWith('.csv')) {
          // Leer CSV
          const texto = event.target?.result as string;
          Papa.parse(texto, {
            header: false,
            complete: (results) => {
              const filas = results.data as string[][];
              console.log("Esto intenta mostrar ", filas)
              if (filas.length > 0) {
                const encabezados = filas[0];
                const resto = filas.slice(1).filter(fila => fila && fila.length > 0);

                if (resto.length === 0) {
                  alert('El archivo CSV está vacío (sin datos después del encabezado)');
                  return;
                }

                setDatosArchivo({ encabezados, datos: resto });
                setColumnasDisponibles(encabezados);
              }
            },
            error: (error: any) => {
              alert(`Error al leer CSV: ${error.message}`);
            }
          });
          return;
        } else {
          alert('Por favor selecciona un archivo .xlsx, .xls o .csv');
          return;
        }

        if (datos) {
          setDatosArchivo(datos);
          setColumnasDisponibles(datos.encabezados);
          setFrecuencias({});
          setColumnaSeleccionada('');
        }
      } catch (error: any) {
        alert(`Error al leer archivo: ${error.message}`);
      }
    };

    if (archivo.name.endsWith('.csv')) {
      reader.readAsText(archivo);
    } else {
      reader.readAsArrayBuffer(archivo);
    }
  };

  // Seleccionar columna y calcular frecuencias
  const handleSeleccionarColumna = (columna: string) => {
    if (!datosArchivo) return;

    setColumnaSeleccionada(columna);

    // Encontrar el índice de la columna
    const indiceColumna = datosArchivo.encabezados.indexOf(columna);
    if (indiceColumna === -1) {
      alert('Columna no encontrada');
      return;
    }

    // Calcular frecuencias
    const freq: { [key: string]: number } = {};
    datosArchivo.datos.forEach(fila => {
      const valor = fila[indiceColumna] || 'N/A';
      freq[valor] = (freq[valor] || 0) + 1;
    });

    // N es el total de filas
    const totalFilas = datosArchivo.datos.length;
    setN(totalFilas);
    setFrecuencias(freq);
    setValoresSeleccionados(new Set());
    setK(undefined);
    setMostrarResultados(false);
  };

  // Seleccionar múltiples valores de éxito y calcular K automáticamente
  const handleToggleValor = (valor: string) => {
    const nuevosValores = new Set(valoresSeleccionados);
    if (nuevosValores.has(valor)) {
      nuevosValores.delete(valor);
    } else {
      nuevosValores.add(valor);
    }
    setValoresSeleccionados(nuevosValores);
    
    // Calcular K como suma de frecuencias de valores seleccionados
    let totalK = 0;
    nuevosValores.forEach(v => {
      totalK += frecuencias[v] || 0;
    });
    setK(totalK > 0 ? totalK : undefined);
  };

  // Calcular probabilidades
  const handleCalcular = () => {
    if (!columnaSeleccionada || Object.keys(frecuencias).length === 0) {
      alert('Por favor selecciona una columna primero');
      return;
    }

    if (N === undefined || K === undefined || valoresSeleccionados.size === 0) {
      alert('Por favor selecciona al menos un valor que cumpla la condición de éxito');
      return;
    }

    if (n < 1 || n > N) {
      alert('El tamaño de la muestra (n) debe estar entre 1 y N');
      return;
    }

    // Validación para hipergeométrica
    const usarHipergeometrica = !esHipergeometica(n, N);
    if (usarHipergeometrica) {
      // En hipergeométrica, k debe estar en un rango válido
      const kMin = Math.max(0, n - (N - K));
      const kMax = Math.min(n, K);
      
      if (x < kMin || x > kMax) {
        alert(
          `❌ Valor inválido para x\n\n` +
          `Con estos parámetros:\n` +
          `N = ${N}, M = ${K}, n = ${n}\n\n` +
          `x debe estar entre ${kMin} y ${kMax}\n\n` +
          `Por qué: Con una población de ${N} elementos, ${K} éxitos y ${N - K} fracasos,\n` +
          `si tomas una muestra de ${n} elementos, el número de éxitos\n` +
          `debe estar entre ${kMin} y ${kMax}.`
        );
        return;
      }
    } else {
      // Para binomial, x debe estar entre 0 y n
      if (x < 0 || x > n) {
        alert('x debe estar entre 0 y n');
        return;
      }
    }

    try {
      // Determinar si usar hipergeométrica o binomial
      const p = K / N; // Probabilidad estimada

      if (usarHipergeometrica) {
        // Hipergeométrica
        const distribucion = distribucionHipergeometricaCompleta(N, K, n);
        const probX = probabilidadHipergeometrica(N, K, n, x);
        const probAcumulada = probabilidadAcumuladaHipergeometrica(N, K, n, x);
        const probComplementaria = probabilidadComplementariaHipergeometrica(N, K, n, x);
        const media = calcularMediaHipergeometrica(N, K, n);
        const desviacion = calcularDesviacionEstandarHipergeometrica(N, K, n);
        const sesgo = calcularSesgoHipergeometrica(N, K, n);
        const curtosis = calcularCurtosisHipergeometrica(N, K, n);

        setResultados({
          n,
          M: K,
          N,
          k: x,
          esHipergeometrica: true,
          distribucion,
          probK: probX,
          probAcumulada,
          probComplementaria,
          media,
          desviacion,
          sesgo,
          curtosis,
          columna: columnaSeleccionada,
          frecuencias,
          valoresSeleccionados: Array.from(valoresSeleccionados),
          p: null
        });
      } else {
        // Binomial
        const infinita = esPopulacionInfinita(n, N);
        const distribucion = distribucionBinomialCompleta(n, p);
        const probX = probabilidadBinomial(n, x, p);
        const probAcumulada = probabilidadAcumuladaBinomial(n, x, p);
        const probComplementaria = probabilidadComplementariaBinomial(n, x, p);
        const media = calcularMedia(n, p, N);
        let desviacion;
        if (infinita) {
          desviacion = calcularDesviacionEstandar(n, p);
        } else {
          desviacion = calcularDesviacionEstandarFinita(n, p, N);
        }
        const sesgo = calcularSesgo(n, p, N);
        const curtosis = calcularCurtosis(n, p, N);

        setResultados({
          n,
          p,
          N,
          k: x,
          infinita,
          esHipergeometrica: false,
          distribucion,
          probK: probX,
          probAcumulada,
          probComplementaria,
          media,
          desviacion,
          sesgo,
          curtosis,
          columna: columnaSeleccionada,
          frecuencias,
          valoresSeleccionados: Array.from(valoresSeleccionados)
        });
      }

      setMostrarResultados(true);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-[#9D4EDD]">
            Módulo de Datos
          </h1>
          <button
            onClick={onVolverAlCalculador}
            className="bg-[#312c2c] text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
          >
            ← Volver a Calculadora de Distribución
          </button>
        </div>

        <p className="text-center text-gray-600 mb-8 text-lg">
          Carga datos desde Excel o CSV, selecciona una columna y aplica distribuciones probabilísticas
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de carga */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD] space-y-6">
              {/* Carga de archivo */}
              <div>
                <h2 className="text-2xl font-bold text-[#9D4EDD] mb-4">1. Cargar Archivo</h2>
                <div className="border-2 border-dashed border-[#3A86FF] rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 transition">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleCargarArchivo}
                    className="hidden"
                    id="cargarArchivo"
                  />
                  <label htmlFor="cargarArchivo" className="cursor-pointer">
                    <p className="text-sm text-gray-600 mb-2">📁 Arrastra o selecciona Excel/CSV</p>
                    <p className="text-xs text-gray-500">(.xlsx, .xls o .csv)</p>
                  </label>
                </div>
                {datosArchivo && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg border-l-4 border-green-500">
                    <p className="text-green-700 font-semibold">✓ Archivo cargado</p>
                    <p className="text-sm text-green-600">{datosArchivo.datos.length} filas</p>
                  </div>
                )}
              </div>

              {/* Seleccionar columna */}
              {datosArchivo && (
                <div>
                  <h3 className="text-lg font-bold text-[#9D4EDD] mb-3">2. Seleccionar Columna</h3>
                  <select
                    value={columnaSeleccionada}
                    onChange={(e) => handleSeleccionarColumna(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                  >
                    <option value="">-- Selecciona una columna --</option>
                    {columnasDisponibles.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Parámetros */}
              {columnaSeleccionada && (
                <div>
                  <h3 className="text-lg font-bold text-[#9D4EDD] mb-3">3. Definir Éxito y Calcular Parámetros</h3>

                  <div className="mb-4 p-3 bg-green-100 rounded-lg border-l-4 border-green-500">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ✓ N (Tamaño de Población):
                    </label>
                    <div className="text-3xl font-bold text-green-600">{N}</div>
                    <p className="text-xs text-gray-600 mt-1">Calculado automáticamente: {N} filas</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Selecciona qué valores son "Éxito" o "Cumplen la condición":
                    </label>
                    <div className="bg-yellow-50 border-2 border-[#9D4EDD] rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                      {Object.keys(frecuencias).length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay valores disponibles</p>
                      ) : (
                        Object.keys(frecuencias).map(valor => (
                          <label key={valor} className="flex items-center gap-3 p-2 hover:bg-yellow-100 rounded cursor-pointer transition">
                            <input
                              type="checkbox"
                              checked={valoresSeleccionados.has(valor)}
                              onChange={() => handleToggleValor(valor)}
                              className="w-4 h-4 cursor-pointer accent-[#9D4EDD]"
                            />
                            <span className="text-sm font-semibold text-gray-700 flex-1">
                              {valor}
                            </span>
                            <span className="text-xs bg-[#9D4EDD] text-white px-2 py-1 rounded">
                              {frecuencias[valor]} registros
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ✓ Seleccionados: {valoresSeleccionados.size === 0 ? 'Ninguno' : Array.from(valoresSeleccionados).join(', ')}
                    </p>
                  </div>

                  {K !== undefined && valoresSeleccionados.size > 0 && (
                    <div className="mb-4 p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ✓ K (Cantidad de Éxitos):
                      </label>
                      <div className="text-3xl font-bold text-blue-600">{K}</div>
                      <p className="text-xs text-gray-600 mt-1">
                        Calculado automáticamente: {K} de {N} cumplen con {valoresSeleccionados.size === 1 ? 'el valor' : 'los valores'} [{Array.from(valoresSeleccionados).join(', ')}]
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      n (Tamaño de Muestra):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={N || 100}
                      value={n}
                      onChange={(e) => setN_muestra(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cuántos elementos vas a verificar (menor o igual a N)</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      x (Éxitos Deseados):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={n}
                      value={x}
                      onChange={(e) => setX(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cuántos registros que cumplen la condición esperas encontrar en la muestra</p>
                  </div>

                  <button
                    onClick={handleCalcular}
                    className="w-full bg-[#9D4EDD] text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
                  >
                    Calcular Probabilidad
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel de resultados */}
          <div className="lg:col-span-2">
            {!datosArchivo ? (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center border-l-4 border-[#3A86FF]">
                <p className="text-gray-500 text-lg">
                  Carga un archivo para comenzar
                </p>
              </div>
            ) : !columnaSeleccionada ? (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center border-l-4 border-[#3A86FF]">
                <p className="text-gray-500 text-lg">
                  Selecciona una columna para analizar
                </p>
              </div>
            ) : mostrarResultados ? (
              <div className="space-y-6">
                <ComponenteResultados resultados={resultados} />
                <ComponenteGrafico datos={resultados.distribucion} k={x} p={resultados.p || resultados.M / resultados.N} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center border-l-4 border-[#3A86FF]">
                <p className="text-gray-500 text-lg">
                  Completa los parámetros y haz clic en "Calcular Probabilidad"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de datos */}
        {datosArchivo && (
          <div className="mt-8 bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
            <h2 className="text-2xl font-bold text-[#3A86FF] mb-4">Datos Cargados</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#3A86FF] text-white">
                    {datosArchivo.encabezados.map((encabezado, idx) => (
                      <th key={idx} className="border px-4 py-3 text-left font-bold">
                        {encabezado}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datosArchivo.datos.slice(0, 10).map((fila, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {fila.map((celda, idx2) => (
                        <td key={idx2} className="border px-4 py-2">
                          {celda}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Mostrando 10 primeras filas de {datosArchivo.datos.length}
            </p>
          </div>
        )}

        {/* Tabla de frecuencias */}
        {columnaSeleccionada && Object.keys(frecuencias).length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD]">
            <h2 className="text-2xl font-bold text-[#9D4EDD] mb-4">Frecuencias - {columnaSeleccionada}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(frecuencias).map(([valor, freq]) => (
                <div key={valor} className="bg-linear-to-br from-[#E0AAFF] to-[#90E0FF] rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-700 font-semibold">{valor}</p>
                  <p className="text-3xl font-bold text-[#9D4EDD]">{freq}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    {((freq / datosArchivo!.datos.length) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
