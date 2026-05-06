/**
 * Utilidades para Teoría de Colas - Modelo M/M/1
 * M: Arribos Poisson (Markoviano)
 * M: Servicio Exponencial (Markoviano)
 * 1: Un servidor
 */

export interface ParametrosColaas {
  lambda: number; // Tasa de llegada (clientes/unidad de tiempo)
  mu: number; // Tasa de servicio (clientes/unidad de tiempo)
}

export interface ResultadosColaas {
  lambda: number;
  mu: number;
  rho: number; // Factor de utilización (λ/μ)
  p0: number; // Probabilidad de que el sistema esté vacío
  ls: number; // Número promedio en el sistema
  lq: number; // Número promedio en la cola
  ws: number; // Tiempo promedio en el sistema
  wq: number; // Tiempo promedio en la cola
  pn: { n: number; probabilidad: number }[]; // Probabilidades Pn para n = 0 a 20
  pasos: any[];
}

/**
 * Calcula el factor de utilización (ρ)
 * ρ = λ / μ
 * Debe ser < 1 para que el sistema sea estable
 */
export const calcularRho = (lambda: number, mu: number) => {
  if (lambda >= mu) {
    throw new Error('La tasa de llegada (λ) debe ser menor que la tasa de servicio (μ)');
  }
  return lambda / mu;
};

/**
 * Calcula p0: Probabilidad de que el sistema esté desocupado
 * p0 = 1 - ρ
 */
export const calcularP0 = (rho: number) => {
  return 1 - rho;
};

/**
 * Calcula Pn: Probabilidad de que haya exactamente n clientes en el sistema
 * Pn = ρ^n × p0
 */
export const calcularPn = (n: number, rho: number, p0: number) => {
  return Math.pow(rho, n) * p0;
};

/**
 * Calcula Ls: Número promedio de clientes en el sistema
 * Ls = λ / (μ - λ) = ρ / (1 - ρ)
 */
export const calcularLs = (lambda: number, mu: number, rho: number) => {
  return rho / (1 - rho);
};

/**
 * Calcula Lq: Número promedio de clientes en la cola
 * Lq = λ² / (μ × (μ - λ)) = ρ² / (1 - ρ)
 */
export const calcularLq = (lambda: number, mu: number, rho: number) => {
  return Math.pow(rho, 2) / (1 - rho);
};

/**
 * Calcula Ws: Tiempo promedio en el sistema
 * Ws = 1 / (μ - λ)
 */
export const calcularWs = (lambda: number, mu: number) => {
  return 1 / (mu - lambda);
};

/**
 * Calcula Wq: Tiempo promedio en la cola
 * Wq = λ / (μ × (μ - λ))
 */
export const calcularWq = (lambda: number, mu: number) => {
  return lambda / (mu * (mu - lambda));
};

/**
 * Calcula todos los parámetros de la teoría de colas
 */
export const calcularParametrosColaas = (lambda: number, mu: number): ResultadosColaas => {
  if (lambda <= 0 || mu <= 0) {
    throw new Error('λ y μ deben ser mayores que 0');
  }

  if (lambda >= mu) {
    throw new Error('λ debe ser menor que μ para que el sistema sea estable');
  }

  const pasos = [];

  // Calcular ρ
  const rho = calcularRho(lambda, mu);
  pasos.push({
    nombre: 'Factor de Utilización',
    formula: 'ρ = λ / μ',
    valor: rho,
    explicacion: `${lambda} / ${mu} = ${rho.toFixed(6)}`
  });

  // Calcular p0
  const p0 = calcularP0(rho);
  pasos.push({
    nombre: 'Probabilidad de Sistema Desocupado',
    formula: 'p₀ = 1 - ρ',
    valor: p0,
    explicacion: `1 - ${rho.toFixed(6)} = ${p0.toFixed(6)}`
  });

  // Calcular Ls
  const ls = calcularLs(lambda, mu, rho);
  pasos.push({
    nombre: 'Número Promedio en el Sistema',
    formula: 'Ls = ρ / (1 - ρ)',
    valor: ls,
    explicacion: `${rho.toFixed(6)} / ${(1 - rho).toFixed(6)} = ${ls.toFixed(6)}`
  });

  // Calcular Lq
  const lq = calcularLq(lambda, mu, rho);
  pasos.push({
    nombre: 'Número Promedio en la Cola',
    formula: 'Lq = ρ² / (1 - ρ)',
    valor: lq,
    explicacion: `${Math.pow(rho, 2).toFixed(6)} / ${(1 - rho).toFixed(6)} = ${lq.toFixed(6)}`
  });

  // Calcular Ws (en unidades de tiempo)
  const ws = calcularWs(lambda, mu);
  pasos.push({
    nombre: 'Tiempo Promedio en el Sistema',
    formula: 'Ws = 1 / (μ - λ)',
    valor: ws,
    explicacion: `1 / (${mu} - ${lambda}) = ${ws.toFixed(6)}`
  });

  // Calcular Wq (en unidades de tiempo)
  const wq = calcularWq(lambda, mu);
  pasos.push({
    nombre: 'Tiempo Promedio en la Cola',
    formula: 'Wq = λ / (μ × (μ - λ))',
    valor: wq,
    explicacion: `${lambda} / (${mu} × ${mu - lambda}) = ${wq.toFixed(6)}`
  });

  // Calcular Pn para n = 0 a 20
  const pn = [];
  for (let n = 0; n <= 20; n++) {
    const probabilidad = calcularPn(n, rho, p0);
    pn.push({
      n,
      probabilidad
    });
  }

  return {
    lambda,
    mu,
    rho,
    p0,
    ls,
    lq,
    ws,
    wq,
    pn,
    pasos
  };
};

/**
 * Genera datos para gráfico 1: Pn vs n (probabilidad de n clientes)
 */
export const generarDatosGraficoPn = (resultados: ResultadosColaas) => {
  return resultados.pn.map(item => ({
    n: item.n,
    probabilidad: item.probabilidad,
    porcentaje: item.probabilidad * 100
  }));
};

/**
 * Genera datos para gráfico 2: Ls vs ρ (longitud de cola vs utilización)
 * Variando λ/μ desde 0.1 hasta 0.95
 */
export const generarDatosGraficoLsVsRho = (mu: number) => {
  const datos = [];
  for (let rho = 0.1; rho <= 0.95; rho += 0.05) {
    const lambda = rho * mu;
    const ls = rho / (1 - rho);
    datos.push({
      rho: rho.toFixed(2),
      rhonumerico: rho,
      ls: ls.toFixed(2)
    });
  }
  return datos;
};

/**
 * Interpreta los resultados en lenguaje natural
 */
export const interpretarResultados = (resultados: ResultadosColaas): string[] => {
  const interpretaciones = [];

  interpretaciones.push(
    `El sistema está ocupado el ${(resultados.rho * 100).toFixed(2)}% del tiempo.`
  );

  interpretaciones.push(
    `La probabilidad de que NO haya clientes esperando es ${(resultados.p0 * 100).toFixed(2)}%.`
  );

  interpretaciones.push(
    `En promedio, hay ${resultados.ls.toFixed(4)} clientes en el sistema.`
  );

  interpretaciones.push(
    `En promedio, hay ${resultados.lq.toFixed(4)} clientes esperando en la cola.`
  );

  interpretaciones.push(
    `Cada cliente pasa ${resultados.ws.toFixed(4)} unidades de tiempo en el sistema.`
  );

  interpretaciones.push(
    `Cada cliente espera ${resultados.wq.toFixed(4)} unidades de tiempo en la cola.`
  );

  const distribucionAlta = resultados.pn.filter(p => p.probabilidad > 0.05).length;
  interpretaciones.push(
    `La distribución de clientes es ${distribucionAlta <= 5 ? 'concentrada' : 'dispersa'} (${distribucionAlta} valores con probabilidad > 5%).`
  );

  return interpretaciones;
};
