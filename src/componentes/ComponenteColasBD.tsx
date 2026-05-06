// ComponenteModuloDatos.tsx - CORREGIDO
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** "HH:MM:SS" → minutos (número decimal) */
const timeStringToMinutes = (t: string): number => {
  if (!t) return 0;
  const parts = t.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60;
  if (parts.length === 2) return parts[0] + parts[1] / 60;
  return 0;
};

/** minutos → "MM:SS" */
const minutesToTimeFormat = (minutes: number): string => {
  if (!minutes || isNaN(minutes)) return '00:00';
  let mins = Math.floor(minutes);
  let secs = Math.round((minutes % 1) * 60);
  if (secs === 60) { mins += 1; secs = 0; }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-GT', { timeZone: 'America/Guatemala' });

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ScenarioMetrics {
  totalClients: number;
  totalPeople: number;
  totalRevenue: number;
  lambdaReal: number;
  muReal: number;
  rho: number;
  avgQueueTime: string;
  avgServiceTime: string;
  avgTotalTime: string;
  minQueueTime: string;
  maxQueueTime: string;
  avgOrderValue: number;
  isStable: boolean;
}

// ─── Cálculo de métricas ─────────────────────────────────────────────────────

const calculateScenarioMetrics = (
  rows: any[],
  totalHoursSimulated: number
): ScenarioMetrics => {
  if (!rows || rows.length === 0) {
    return {
      totalClients: 0, totalPeople: 0, totalRevenue: 0,
      lambdaReal: 0, muReal: 0, rho: 0,
      avgQueueTime: '00:00', avgServiceTime: '00:00', avgTotalTime: '00:00',
      minQueueTime: '00:00', maxQueueTime: '00:00',
      avgOrderValue: 0, isStable: false,
    };
  }

  const totalClients  = rows.length;
  const totalPeople   = rows.reduce((s, r) => s + (r.no_clientes ?? 0), 0);
  const totalRevenue  = rows.reduce((s, r) => s + (r.costo ?? 0), 0);
  const avgOrderValue = totalRevenue / totalClients;

  // tiempos en minutos — "atendida" es hora del día, NO duración
  // la duración de servicio se obtiene como: total - cola
  const queueTimes   = rows.map(r => timeStringToMinutes(r.cola));
  const totalTimes   = rows.map(r => timeStringToMinutes(r.total));
  const serviceTimes = rows.map((_, i) => totalTimes[i] - queueTimes[i]);

  const avgQueueTimeMin   = queueTimes.reduce((s, v) => s + v, 0) / totalClients;
  const avgServiceTimeMin = serviceTimes.reduce((s, v) => s + v, 0) / totalClients;
  const avgTotalTimeMin   = totalTimes.reduce((s, v) => s + v, 0) / totalClients;
  const minQueueTimeMin   = Math.min(...queueTimes);
  const maxQueueTimeMin   = Math.max(...queueTimes);

  const lambdaReal = totalClients / (totalHoursSimulated || 1);
  const muReal     = avgServiceTimeMin > 0 ? 60 / avgServiceTimeMin : 0;
  const rho        = muReal > 0 ? lambdaReal / muReal : 0;

  return {
    totalClients,
    totalPeople,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    lambdaReal: Number(lambdaReal.toFixed(2)),
    muReal: Number(muReal.toFixed(2)),
    rho: Number(rho.toFixed(4)),
    avgQueueTime:   minutesToTimeFormat(avgQueueTimeMin),
    avgServiceTime: minutesToTimeFormat(avgServiceTimeMin),
    avgTotalTime:   minutesToTimeFormat(avgTotalTimeMin),
    minQueueTime:   minutesToTimeFormat(minQueueTimeMin),
    maxQueueTime:   minutesToTimeFormat(maxQueueTimeMin),
    avgOrderValue:  Number(avgOrderValue.toFixed(2)),
    isStable: rho < 1,
  };
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ComponenteColasBD({
  onVolverAlCalculador,
}: {
  onVolverAlCalculador: () => void;
}) {
  const [simulaciones, setSimulaciones]                     = useState<any[]>([]);
  const [simulacionSeleccionada, setSimulacionSeleccionada] = useState<string>('');
  const [noSimulacionSeleccionada, setNoSimulacionSeleccionada] = useState<string>('');
  const [datosSupabase, setDatosSupabase]                   = useState<any[]>([]);
  const [mostrarTabla, setMostrarTabla]                     = useState(false);
  const [metrics, setMetrics]                               = useState<ScenarioMetrics | null>(null);

  const noSimulacion = [
    { id: '1', texto: 'Escenario 1' },
    { id: '2', texto: 'Escenario 2' },
    { id: '3', texto: 'Escenario 3' },
  ];

  const tablas: Record<string, string> = {
    '1': 'tbEscenario1',
    '2': 'tbEscenario2',
    '3': 'tbEscenario3',
  };

  // Cargar lista de simulaciones al montar
  useEffect(() => {
    supabase
      .from('tbSimulacion')
      .select('*')
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setSimulaciones(data || []);
      });
  }, []);

  // Cargar filas cuando cambia la selección
  useEffect(() => {
    if (!simulacionSeleccionada || !noSimulacionSeleccionada) return;

    const tableName = tablas[noSimulacionSeleccionada];
    if (!tableName) return;

    const fetchAllRows = async () => {
      const pageSize = 1000;
      let from = 0;
      let allRows: any[] = [];

      while (true) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('idSimulacion', Number(simulacionSeleccionada))
          .range(from, from + pageSize - 1);

        if (error) { console.error(error); break; }
        if (!data || data.length === 0) break;
        allRows = [...allRows, ...data];
        if (data.length < pageSize) break;
        from += pageSize;
      }

      setDatosSupabase(allRows);
      setMostrarTabla(false);

      const horasSimulacion =
        simulaciones.find(
          s => s.idSimulacion === Number(simulacionSeleccionada)
        )?.horas ?? 1;

      setMetrics(calculateScenarioMetrics(allRows, Number(horasSimulacion)));
    };

    fetchAllRows();
  }, [simulacionSeleccionada, noSimulacionSeleccionada, simulaciones]);

  const statusColor = metrics?.isStable ? '#27ae60' : '#e74c3c';
  const statusMsg   = metrics
    ? metrics.isStable
      ? `✓ Sistema Estable (ρ = ${(metrics.rho * 100).toFixed(1)}%)`
      : `✗ Sistema Inestable (ρ = ${(metrics.rho * 100).toFixed(1)}%)`
    : '';

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-8">
      <div className="max-w-5xl mx-auto">

        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#9D4EDD]">
            Módulo de Teoría de Colas (M/M/1)
          </h1>
          <button
            onClick={onVolverAlCalculador}
            className="bg-[#312c2c] text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
          >
            ← Volver a Calculadora
          </button>
        </div>

        <p className="text-center text-gray-600 mb-8 text-lg">
          Carga datos desde Supabase y analiza la simulación de teoría de colas
        </p>

        {/* Selectores */}
        <div className="grid grid-cols-2 gap-8 bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#9D4EDD] mb-8">
          <div>
            <h3 className="text-lg font-bold text-[#9D4EDD] mb-3">Seleccionar Simulación:</h3>
            <select
              value={simulacionSeleccionada}
              onChange={e => { setSimulacionSeleccionada(e.target.value); setDatosSupabase([]); setMetrics(null); }}
              className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
            >
              <option value="">-- Selecciona una Simulación --</option>
              {simulaciones.map(sim => (
                <option key={sim.idSimulacion} value={sim.idSimulacion}>
                  {`${sim.tipoSimulacion} — ${sim.duracion} — ${sim.horas}h — ${formatearFecha(sim.fecha)}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#9D4EDD] mb-3">Seleccionar Escenario:</h3>
            <select
              value={noSimulacionSeleccionada}
              onChange={e => { setNoSimulacionSeleccionada(e.target.value); setDatosSupabase([]); setMetrics(null); }}
              className="w-full px-4 py-2 border-2 border-[#3A86FF] rounded-lg focus:outline-none focus:border-[#9D4EDD]"
            >
              <option value="">-- Selecciona un Escenario --</option>
              {noSimulacion.map(s => (
                <option key={s.id} value={s.id}>{s.texto}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón tabla */}
        {datosSupabase.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setMostrarTabla(!mostrarTabla)}
              className="w-full bg-[#3A86FF] text-white font-bold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition"
            >
              {mostrarTabla ? 'Ocultar' : 'Mostrar'} Tabla de Datos ({datosSupabase.length} registros)
            </button>

            {mostrarTabla && (
              <div className="mt-4 bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#3A86FF]">
                <h3 className="text-xl font-bold text-[#3A86FF] mb-4">Datos Cargados desde Supabase</h3>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-[#3A86FF] text-white">
                      <tr>
                        {['#','Día','Clientes','Entrada','Atendida','Salida','Cola','Total','Producto','Costo'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-bold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datosSupabase.map((row, idx) => (
                        <tr key={idx} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}>
                          <td className="px-4 py-2">{idx + 1}</td>
                          <td className="px-4 py-2">{row.dia}</td>
                          <td className="px-4 py-2">{row.no_clientes}</td>
                          <td className="px-4 py-2">{row.entrada}</td>
                          <td className="px-4 py-2">{row.atendida}</td>
                          <td className="px-4 py-2">{row.salida}</td>
                          <td className="px-4 py-2">{row.cola}</td>
                          <td className="px-4 py-2">{row.total}</td>
                          <td className="px-4 py-2">{row.producto}</td>
                          <td className="px-4 py-2">Q{row.costo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Métricas del escenario seleccionado */}
        {metrics && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-[#cb691c]">
            <h3 className="text-2xl font-bold mb-4 text-[#cb691c]">
              Resultados — {noSimulacion.find(s => s.id === noSimulacionSeleccionada)?.texto}
            </h3>

            {/* Estado del sistema */}
            <div
              className="p-4 rounded-xl mb-6"
              style={{ backgroundColor: metrics.isStable ? '#f1f8f6' : '#fdeaea' }}
            >
              <p className="font-bold text-sm" style={{ color: statusColor }}>{statusMsg}</p>
              <p className="text-xs mt-2 text-gray-600">
                λ = {metrics.lambdaReal} clientes/hora &nbsp;|&nbsp; μ = {metrics.muReal} clientes/hora
              </p>
            </div>

            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Órdenes totales',            value: String(metrics.totalClients) },
                { label: 'Personas atendidas',         value: String(metrics.totalPeople) },
                { label: 'Ingresos totales',           value: `Q${metrics.totalRevenue.toFixed(2)}` },
                { label: 'Valor promedio por orden',   value: `Q${metrics.avgOrderValue.toFixed(2)}` },
                { label: 'Tasa de llegada (λ)',        value: `${metrics.lambdaReal} clientes/hora` },
                { label: 'Tasa de servicio (μ)',       value: `${metrics.muReal} clientes/hora` },
                { label: 'Utilización (ρ)',            value: `${(metrics.rho * 100).toFixed(1)}%` },
                { label: 'Tiempo promedio en cola',    value: metrics.avgQueueTime },
                { label: 'Tiempo promedio de servicio',value: metrics.avgServiceTime },
                { label: 'Tiempo promedio en sistema', value: metrics.avgTotalTime },
                { label: 'Tiempo mínimo en cola',      value: metrics.minQueueTime },
                { label: 'Tiempo máximo en cola',      value: metrics.maxQueueTime },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center p-3 rounded-lg bg-[#f0f0f0]"
                >
                  <span className="text-xs font-semibold text-[#6c341e]">{label}</span>
                  <span className="text-sm font-bold text-[#cb691c]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}