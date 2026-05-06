// ComponenteModuloDatos.tsx - ACTUALIZADO
import { useEffect, useState } from 'react';
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
import {
  distribucionPoissonCompleta,
  probabilidadPoisson,
  calcularMediaPoisson,
  calcularDesviacionEstandarPoisson,
  calcularSesgoPoisson,
  calcularCurtosisPoisson
} from '../utilidades/poisson';
import ComponenteResultados from './ComponenteResultados';
import ComponenteGrafico from './ComponenteGrafico';
import TablaComparativaPoisson from './TablaComparativaPoisson';
import { supabase } from '../supabaseClient';

export default function ComponenteModuloDatos({ onVolverAlCalculador }: { onVolverAlCalculador: () => void }) {
  const [datosSupabase, setDatosSupabase] = useState<any[]>([]);
  const [columnasDisponibles, setColumnasDisponibles] = useState<string[]>([]);
  const [columnaSeleccionada, setColumnaSeleccionada] = useState<string>('');
  const [columnaSeleccionada2, setColumnaSeleccionada2] = useState<string>('');
  const [frecuencias2D, setFrecuencias2D] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [valoresSeleccionados, setValoresSeleccionados] = useState<Set<string>>(new Set());
  const [valoresSeleccionados2, setValoresSeleccionados2] = useState<Set<string>>(new Set());
  const [N, setN] = useState<number>();
  const [K, setK] = useState<number>();
  const [n, setN_muestra] = useState<number>(10);
  const [x, setX] = useState<number>(0);
  const [resultados, setResultados] = useState<any>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [usarPoissonApproximacion, setUsarPoissonApproximacion] = useState(false);
  const [simulaciones, setSimulaciones] = useState<any[]>([]);
  const [simulacionSeleccionada, setSimulacionSeleccionada] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [noSimulacion] = useState([
    { id: 1, texto: "Escenario 1" },
    { id: 2, texto: "Escenario 2" },
    { id: 3, texto: "Escenario 3" }
  ]);
  const tablas: Record<string, string> = {
    "1": "tbEscenario1",
    "2": "tbEscenario2",
    "3": "tbEscenario3"
  };
  const [noSimulacionSeleccionada, setNoSimulacionSeleccionada] = useState<string>('');

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('tbSimulacion')
        .select('*');

      if (error) {
        console.error(error);
      } else {
        setSimulaciones(data || []);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (
          simulacionSeleccionada.length > 0 &&
          noSimulacionSeleccionada.length > 0
        ) {
          const tableName = tablas[noSimulacionSeleccionada];

          if (!tableName) return;

          const data = await fetchAllRows(
            tableName,
            Number(simulacionSeleccionada)
          );

          // Guardar datos y extraer columnas disponibles
          setDatosSupabase(data);
          if (data.length > 0) {
            const columnas = Object.keys(data[0]);
            setColumnasDisponibles(columnas);
          }
          
          // Resetear selecciones
          setColumnaSeleccionada('');
          setColumnaSeleccionada2('');
          setFrecuencias2D({});
          setValoresSeleccionados(new Set());
          setValoresSeleccionados2(new Set());
          setK(undefined);
          setMostrarResultados(false);
          setErrorMessage('');
        }

        // Traer simulaciones
        const { data, error } = await supabase
          .from('tbSimulacion')
          .select('*');

        if (error) {
          console.error(error);
        } else {
          setSimulaciones(data || []);
        }
      } catch (err) {
        console.error("Error general:", err);
      }
    };

    fetchData();
    console.log("Datos: ", datosSupabase);
  }, [simulacionSeleccionada, noSimulacionSeleccionada]);

  const fetchAllRows = async (tableName: string, idSim: number) => {
    const pageSize = 1000;
    let from = 0;
    let allRows: any[] = [];

    while (true) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('idSimulacion', idSim)
        .range(from, from + pageSize - 1);

      if (error) throw error;

      if (!data || data.length === 0) break;

      allRows = [...allRows, ...data];

      if (data.length < pageSize) break;

      from += pageSize;
    }

    return allRows;
  };

  // Seleccionar columnas y calcular frecuencias bivariadas
  const handleSeleccionarColumnas = (col1: string, col2: string) => {
    if (datosSupabase.length === 0) return;

    setColumnaSeleccionada(col1);
    setColumnaSeleccionada2(col2);

    // Calcular frecuencias bivariadas
    const freq2D: { [key: string]: { [key: string]: number } } = {};
    
    datosSupabase.forEach(registro => {
      const valor1 = String(registro[col1] || 'N/A');
      const valor2 = String(registro[col2] || 'N/A');
      
      if (!freq2D[valor1]) {
        freq2D[valor1] = {};
      }
      freq2D[valor1][valor2] = (freq2D[valor1][valor2] || 0) + 1;
    });

    setFrecuencias2D(freq2D);
    setN(datosSupabase.length);
    setValoresSeleccionados(new Set());
    setValoresSeleccionados2(new Set());
    setK(undefined);
    setMostrarResultados(false);
    setErrorMessage('');
  };

  // Seleccionar valores de ambas variables
  const handleToggleValor = (valor: string, esSegundaColumna: boolean = false) => {
    let nuevosValores1 = valoresSeleccionados;
    let nuevosValores2 = valoresSeleccionados2;

    if (esSegundaColumna) {
      nuevosValores2 = new Set(valoresSeleccionados2);
      if (nuevosValores2.has(valor)) {
        nuevosValores2.delete(valor);
      } else {
        nuevosValores2.add(valor);
      }
      setValoresSeleccionados2(nuevosValores2);
    } else {
      nuevosValores1 = new Set(valoresSeleccionados);
      if (nuevosValores1.has(valor)) {
        nuevosValores1.delete(valor);
      } else {
        nuevosValores1.add(valor);
      }
      setValoresSeleccionados(nuevosValores1);
    }

    // Calcular K inmediatamente con los nuevos valores
    let totalK = 0;
    nuevosValores1.forEach(v1 => {
      if (frecuencias2D[v1]) {
        nuevosValores2.forEach(v2 => {
          totalK += frecuencias2D[v1][v2] || 0;
        });
      }
    });
    setK(totalK > 0 ? totalK : undefined);
    setErrorMessage('');
  };

  // Validar si hay problemas con los parámetros que puedan causar NaN
  const validarParametros = (N: number, K: number, n: number, x: number, usarHiper: boolean): string | null => {
    // Validaciones básicas
    if (K === 0) {
      return "K = 0: No hay registros que cumplan la condición de éxito. Selecciona al menos un valor que represente éxito.";
    }

    if (K > N) {
      return "Error: K (éxitos en población) no puede ser mayor que N (tamaño de población).";
    }

    // Validaciones para hipergeométrica
    if (usarHiper) {
      const kMin = Math.max(0, n - (N - K));
      const kMax = Math.min(n, K);
      
      if (x < kMin || x > kMax) {
        return `Para distribución hipergeométrica con N=${N}, K=${K}, n=${n}:\nx debe estar entre ${kMin} y ${kMax}`;
      }

      // Advertencia de factoriales grandes
      if (N > 170) {
        //return "N muy grande (>170): Los cálculos de factorial pueden producir valores infinitos. Considera usar aproximación binomial o Poisson.";
      }
    }

    // Validaciones para binomial
    if (!usarHiper) {
      if (x < 0 || x > n) {
        return `Para distribución binomial: x debe estar entre 0 y n (${n})`;
      }

      const p = K / N;
      if (p === 0 || p === 1) {
        return "La probabilidad p es 0 o 1. Esto puede causar problemas en los cálculos de varianza y sesgo.";
      }
    }

    return null; // Sin errores
  };

  // Calcular probabilidades
  const handleCalcular = () => {
    setErrorMessage('');

    if (!columnaSeleccionada || !columnaSeleccionada2) {
      setErrorMessage('Por favor selecciona ambas columnas primero');
      return;
    }

    if (!valoresSeleccionados || !valoresSeleccionados2 || valoresSeleccionados.size === 0 || valoresSeleccionados2.size === 0) {
      setErrorMessage('Por favor selecciona al menos un valor de cada columna');
      return;
    }

    if (N === undefined || K === undefined) {
      console.log("N:", N, "K:", K);
      setErrorMessage('Por favor selecciona al menos un valor que cumpla la condición de éxito');
      return;
    }

    if (n < 1 || n > N) {
      setErrorMessage('El tamaño de la muestra (n) debe estar entre 1 y N');
      return;
    }

    // Determinar si usar hipergeométrica o binomial
    const usarHipergeometrica = esHipergeometica(n, N);

    // Validar parámetros antes de calcular
    const errorValidacion = validarParametros(N, K, n, x, usarHipergeometrica);
    if (errorValidacion) {
      setErrorMessage(errorValidacion);
      return;
    }

    try {
      // Determinar si usar hipergeométrica o binomial
      const p = K / N; // Probabilidad estimada

      console.log("=== PARÁMETROS DE CÁLCULO ===");
      console.log("N:", N, "K:", K, "n:", n, "x:", x);
      console.log("p (K/N):", p);
      console.log("esHipergeometica(n, N):", esHipergeometica(n, N));
      console.log("usarHipergeometrica:", esHipergeometica(n, N));

      if (usarHipergeometrica) {
        // Hipergeométrica
        console.log(">>> Usando HIPERGEOMÉTRICA");
        const distribucion = distribucionHipergeometricaCompleta(N, K, n);
        const probX = probabilidadHipergeometrica(N, K, n, x);
        const probAcumulada = probabilidadAcumuladaHipergeometrica(N, K, n, x);
        const probComplementaria = probabilidadComplementariaHipergeometrica(N, K, n, x);
        const media = calcularMediaHipergeometrica(N, K, n);
        const desviacion = calcularDesviacionEstandarHipergeometrica(N, K, n);
        const sesgo = calcularSesgoHipergeometrica(N, K, n);
        const curtosis = calcularCurtosisHipergeometrica(N, K, n);

        console.log("probX:", probX);
        console.log("distribución:", distribucion.slice(0, 3));

        // Calcular Poisson como aproximación si está activado
        let distribucionPoisson = null;
        let probKPoisson = null;
        let mediaPoisson = null;
        let desviacionPoisson = null;
        let sesgoPoisson = null;
        let curtosisPoisson = null;
        
        if (usarPoissonApproximacion) {
          const lambda = n * (K / N);
          distribucionPoisson = distribucionPoissonCompleta(lambda);
          probKPoisson = probabilidadPoisson(lambda, x);
          mediaPoisson = calcularMediaPoisson(lambda);
          desviacionPoisson = calcularDesviacionEstandarPoisson(lambda);
          sesgoPoisson = calcularSesgoPoisson(lambda);
          curtosisPoisson = calcularCurtosisPoisson(lambda);
        }

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
          columna1: columnaSeleccionada,
          columna2: columnaSeleccionada2,
          valoresSeleccionados1: Array.from(valoresSeleccionados),
          valoresSeleccionados2: Array.from(valoresSeleccionados2),
          p: null,
          usarPoissonApproximacion,
          distribucionPoisson,
          probKPoisson,
          mediaPoisson,
          desviacionPoisson,
          sesgoPoisson,
          curtosisPoisson
        });
      } else {
        // Binomial
        console.log(">>> Usando BINOMIAL");
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

        console.log("probX:", probX);
        console.log("distribución:", distribucion.slice(0, 3));

        // Calcular Poisson como aproximación si está activado
        let distribucionPoisson = null;
        let probKPoisson = null;
        let mediaPoisson = null;
        let desviacionPoisson = null;
        let sesgoPoisson = null;
        let curtosisPoisson = null;
        
        if (usarPoissonApproximacion) {
          const lambda = n * p;
          distribucionPoisson = distribucionPoissonCompleta(lambda);
          probKPoisson = probabilidadPoisson(lambda, x);
          mediaPoisson = calcularMediaPoisson(lambda);
          desviacionPoisson = calcularDesviacionEstandarPoisson(lambda);
          sesgoPoisson = calcularSesgoPoisson(lambda);
          curtosisPoisson = calcularCurtosisPoisson(lambda);
        }

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
          columna1: columnaSeleccionada,
          columna2: columnaSeleccionada2,
          valoresSeleccionados1: Array.from(valoresSeleccionados),
          valoresSeleccionados2: Array.from(valoresSeleccionados2),
          usarPoissonApproximacion,
          distribucionPoisson,
          probKPoisson,
          mediaPoisson,
          desviacionPoisson,
          sesgoPoisson,
          curtosisPoisson
        });
      }

      setMostrarResultados(true);
    } catch (error: any) {
      console.error("Error en cálculo:", error);
      setErrorMessage(`Error en el cálculo: ${error.message}\n\nEsto puede deberse a valores muy grandes que exceden los límites de cálculo. Intenta con valores más pequeños o usa aproximación de Poisson.`);
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
          Carga datos desde Supabase, selecciona dos columnas y analiza su relación mediante distribuciones probabilísticas
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD] mb-8">
          {/* Seleccionar Simulación */}
          {simulaciones && (
            <div>
              <h3 className="text-lg font-bold text-[#9D4EDD] mb-3">Seleccionar Simulación:</h3>
              <select
                value={simulacionSeleccionada}
                onChange={(e) => setSimulacionSeleccionada(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
              >
                <option value="">-- Selecciona una Simulación --</option>

                {simulaciones.map((sim) => (
                  <option key={sim.idSimulacion} value={sim.idSimulacion}>
                    {`Período: ${sim.tipoSimulacion} - Duración: ${sim.duracion} - Horas: ${sim.horas} - Fecha: ${formatearFecha(sim.fecha)}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Seleccionar Tabla */}
          {noSimulacion && (
            <div>
              <h3 className="text-lg font-bold text-[#9D4EDD] mb-3">Seleccionar No. de Escenario:</h3>
              <select
                value={noSimulacionSeleccionada}
                onChange={(e) => setNoSimulacionSeleccionada(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
              >
                <option value="">-- Selecciona el Número de la Escenario --</option>

                {noSimulacion.map((sim) => (
                  <option key={sim.id} value={sim.id}>
                    {sim.texto}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Botón para mostrar/ocultar tabla de datos */}
        {datosSupabase.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setMostrarTabla(!mostrarTabla)}
              className="w-full bg-[#3A86FF] text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
            >
              {mostrarTabla ? 'Ocultar' : 'Mostrar'} Tabla de Datos Cargados ({datosSupabase.length} registros)
            </button>

            {mostrarTabla && (
              <div className="mt-4 bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
                <h3 className="text-xl font-bold text-[#3A86FF] mb-4">Datos Cargados desde Supabase</h3>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-[#3A86FF] text-white">
                      <tr>
                        <th className="px-4 py-2 text-left font-bold">#</th>
                        <th className="px-4 py-2 text-left font-bold">Día</th>
                        <th className="px-4 py-2 text-left font-bold">Clientes</th>
                        <th className="px-4 py-2 text-left font-bold">Entrada</th>
                        <th className="px-4 py-2 text-left font-bold">Atendida</th>
                        <th className="px-4 py-2 text-left font-bold">Salida</th>
                        <th className="px-4 py-2 text-left font-bold">Cola</th>
                        <th className="px-4 py-2 text-left font-bold">Total</th>
                        <th className="px-4 py-2 text-left font-bold">Producto</th>
                        <th className="px-4 py-2 text-left font-bold">Costo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosSupabase.map((row, idx) => (
                        <tr 
                          key={idx}
                          className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}
                        >
                          <td className="px-4 py-2 font-semibold text-gray-600">{idx + 1}</td>
                          <td className="px-4 py-2 font-semibold text-gray-600">{row.dia}</td>
                          <td className="px-4 py-2 font-semibold text-gray-600">{row.no_clientes}</td>
                          <td className="px-4 py-2 font-semibold text-gray-600">{row.entrada}</td>
                          <td className="px-4 py-2 font-semibold text-gray-600">{row.atendida}</td>
                          <td className="px-4 py-2 font-semibold text-gray-600">{row.salida}</td>
                          <td className="px-4 py-2 font-semibold text-gray-600">{row.cola}</td>
                          <td className="px-4 py-2 font-semibold text-gray-600">{row.total}</td>
                          <td className="px-4 py-2 font-semibold text-gray-600">{row.producto}</td>
                          <td className="px-4 py-2 font-semibold text-gray-600">Q{row.costo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de configuración */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD] space-y-6">
              {/* Seleccionar dos columnas */}
              {datosSupabase.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#9D4EDD] mb-4">1. Seleccionar Columnas</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Primera Variable (ej: Día):
                    </label>
                    <select
                      value={columnaSeleccionada}
                      onChange={(e) => {
                        if (columnaSeleccionada2 && e.target.value !== columnaSeleccionada2) {
                          handleSeleccionarColumnas(e.target.value, columnaSeleccionada2);
                        } else if (!columnaSeleccionada2) {
                          setColumnaSeleccionada(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                    >
                      <option value="">-- Selecciona columna --</option>
                      {columnasDisponibles.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Segunda Variable (ej: Producto):
                    </label>
                    <select
                      value={columnaSeleccionada2}
                      onChange={(e) => {
                        if (columnaSeleccionada && e.target.value !== columnaSeleccionada) {
                          handleSeleccionarColumnas(columnaSeleccionada, e.target.value);
                        } else if (!columnaSeleccionada) {
                          setColumnaSeleccionada2(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                    >
                      <option value="">-- Selecciona columna --</option>
                      {columnasDisponibles.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Seleccionar valores de ambas columnas */}
              {columnaSeleccionada && columnaSeleccionada2 && (
                <div>
                  <h3 className="text-lg font-bold text-[#9D4EDD] mb-3">2. Seleccionar Valores que Cumplen Condición</h3>

                  <div className="mb-4 p-3 bg-green-100 rounded-lg border-l-4 border-green-500">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ✓ N (Tamaño de Población):
                    </label>
                    <div className="text-3xl font-bold text-green-600">{N}</div>
                    <p className="text-xs text-gray-600 mt-1">Registros totales cargados</p>
                  </div>

                  {/* Valores de primera columna */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valores de {columnaSeleccionada}:
                    </label>
                    <div className="bg-yellow-50 border-2 border-[#9D4EDD] rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                      {Object.keys(frecuencias2D).length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay valores disponibles</p>
                      ) : (
                        Object.keys(frecuencias2D).map(valor => (
                          <label key={valor} className="flex items-center gap-2 p-1 hover:bg-yellow-100 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={valoresSeleccionados.has(valor)}
                              onChange={() => handleToggleValor(valor, false)}
                              className="w-4 h-4 cursor-pointer accent-[#9D4EDD]"
                            />
                            <span className="text-sm font-semibold text-gray-700 flex-1">{valor}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Valores de segunda columna */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valores de {columnaSeleccionada2}:
                    </label>
                    <div className="bg-yellow-50 border-2 border-[#9D4EDD] rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                      {Object.keys(frecuencias2D).length === 0 ? (
                        <p className="text-gray-500 text-sm">Selecciona valores de la primera columna primero</p>
                      ) : (
                        Array.from(new Set(Object.values(frecuencias2D).flatMap(obj => Object.keys(obj)))).map(valor => (
                          <label key={valor} className="flex items-center gap-2 p-1 hover:bg-yellow-100 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={valoresSeleccionados2.has(valor)}
                              onChange={() => handleToggleValor(valor, true)}
                              className="w-4 h-4 cursor-pointer accent-[#9D4EDD]"
                            />
                            <span className="text-sm font-semibold text-gray-700 flex-1">{valor}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  {K !== undefined && valoresSeleccionados.size > 0 && valoresSeleccionados2.size > 0 && (
                    <div className="mb-4 p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        K (Cantidad de Registros que Cumplen):
                      </label>
                      <div className="text-3xl font-bold text-blue-600">{K}</div>
                      <p className="text-xs text-gray-600 mt-1">
                        Registros donde {columnaSeleccionada} ∈ {JSON.stringify(Array.from(valoresSeleccionados))} Y {columnaSeleccionada2} ∈ {JSON.stringify(Array.from(valoresSeleccionados2))}
                      </p>
                    </div>
                  )}

                  {/* Parámetros de cálculo */}
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
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      x (Éxitos Esperados):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={n}
                      value={x}
                      onChange={(e) => setX(Number(e.target.value))}
                      className="w-full px-3 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
                    />
                  </div>

                  {/* Checkbox Poisson */}
                  <div className="mb-6 p-4 bg-cyan-50 rounded-lg border-2 border-cyan-300">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={usarPoissonApproximacion}
                        onChange={(e) => setUsarPoissonApproximacion(e.target.checked)}
                        className="w-5 h-5 cursor-pointer accent-[#9D4EDD]"
                      />
                      <span className="font-semibold text-gray-700">Comparar con Poisson como aproximación</span>
                    </label>
                    <p className="text-xs text-gray-600 mt-2">
                      Muestra resultados paralelos de la distribución de Poisson para comparación
                    </p>
                  </div>

                  {/* Mensaje de error */}
                  {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <p className="text-sm font-semibold text-red-700 whitespace-pre-wrap">{errorMessage}</p>
                    </div>
                  )}

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
            {datosSupabase.length === 0 ? (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center border-l-4 border-[#3A86FF]">
                <p className="text-gray-500 text-lg">
                  Selecciona una simulación y escenario para cargar los datos
                </p>
              </div>
            ) : !columnaSeleccionada || !columnaSeleccionada2 ? (
              <div className="bg-white rounded-lg shadow-xl p-8 text-center border-l-4 border-[#3A86FF]">
                <p className="text-gray-500 text-lg">
                  Selecciona ambas columnas para analizar
                </p>
              </div>
            ) : mostrarResultados ? (
              <div className="space-y-6">
                <ComponenteResultados resultados={resultados} />
                <ComponenteGrafico datos={resultados.distribucion} k={x} p={resultados.p || resultados.M / resultados.N} />
                <TablaComparativaPoisson resultados={resultados} />
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
      </div>
    </div>
  );
}