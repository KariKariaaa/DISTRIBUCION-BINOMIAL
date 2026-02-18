// Funciones para calcular la distribución hipergeométrica

/**
 * Calcula el factorial de un número
 * Fórmula: n! = n × (n-1) × (n-2) × ... × 1
 */
export const factorial = (n: number): number => {
  if (n < 0) throw new Error('El factorial no está definido para números negativos');
  if (n === 0 || n === 1) return 1;
  
  let resultado = 1;
  for (let i = 2; i <= n; i++) {
    resultado *= i;
  }
  return resultado;
};

/**
 * Calcula el coeficiente binomial C(n, k)
 * Fórmula: C(n, k) = n! / (k! × (n-k)!)
 */
export const coeficienteBinomial = (n: number, k: number): number => {
  if (k > n || k < 0) throw new Error('k debe ser menor o igual a n y mayor o igual a 0');
  
  const numerador = factorial(n);
  const denominador = factorial(k) * factorial(n - k);
  
  return numerador / denominador;
};

/**
 * Calcula la probabilidad hipergeométrica para exactamente k éxitos
 * Fórmula: P(X = k) = [C(M, k) × C(N-M, n-k)] / C(N, n)
 * 
 * @param N - tamaño total de la población
 * @param M - número de elementos de éxito en la población
 * @param n - tamaño de la muestra
 * @param k - número de éxitos deseados en la muestra
 * @returns objeto con los pasos y resultado
 */
export const probabilidadHipergeometrica = (N: number, M: number, n: number, k: number) => {
  // Validaciones
  if (M > N || M < 0) throw new Error('M debe estar entre 0 y N');
  if (n > N || n < 0) throw new Error('n debe estar entre 0 y N');
  if (k > M || k < 0) throw new Error('k debe estar entre 0 y M');
  if (k > n) throw new Error('k debe estar entre 0 y n');
  if ((n - k) > (N - M)) throw new Error('No hay suficientes elementos sin éxito en la población para la muestra');
  
  const pasos = [];
  
  // Paso 1: Calcular C(M, k)
  const cMk = coeficienteBinomial(M, k);
  pasos.push({
    nombre: 'Coeficiente C(M, k)',
    formula: `C(${M}, ${k}) = ${M}! / (${k}! × ${M - k}!)`,
    resultado: cMk,
    explicacion: `${M}! = ${factorial(M)}, ${k}! = ${factorial(k)}, ${M - k}! = ${factorial(M - k)}`
  });
  
  // Paso 2: Calcular C(N-M, n-k)
  const cNMnk = coeficienteBinomial(N - M, n - k);
  pasos.push({
    nombre: 'Coeficiente C(N-M, n-k)',
    formula: `C(${N - M}, ${n - k}) = ${N - M}! / (${n - k}! × ${(N - M) - (n - k)}!)`,
    resultado: cNMnk,
    explicacion: `${N - M}! = ${factorial(N - M)}, ${n - k}! = ${factorial(n - k)}, ${(N - M) - (n - k)}! = ${factorial((N - M) - (n - k))}`
  });
  
  // Paso 3: Calcular C(N, n)
  const cNn = coeficienteBinomial(N, n);
  pasos.push({
    nombre: 'Coeficiente C(N, n)',
    formula: `C(${N}, ${n}) = ${N}! / (${n}! × ${N - n}!)`,
    resultado: cNn,
    explicacion: `${N}! = ${factorial(N)}, ${n}! = ${factorial(n)}, ${N - n}! = ${factorial(N - n)}`
  });
  
  // Paso 4: Calcular la probabilidad
  const probabilidad = (cMk * cNMnk) / cNn;
  pasos.push({
    nombre: 'Probabilidad Final',
    formula: `P(X = ${k}) = [C(${M}, ${k}) × C(${N - M}, ${n - k})] / C(${N}, ${n})`,
    resultado: probabilidad,
    explicacion: `(${cMk} × ${cNMnk}) / ${cNn} = ${probabilidad}`
  });
  
  return {
    probabilidad,
    pasos,
    N,
    M,
    n,
    k
  };
};

/**
 * Calcula la distribución hipergeométrica completa para todos los valores de k
 */
export const distribucionHipergeometricaCompleta = (N: number, M: number, n: number) => {
  const resultados = [];
  const kMin = Math.max(0, n - (N - M));
  const kMax = Math.min(n, M);
  
  for (let k = kMin; k <= kMax; k++) {
    const calculo = probabilidadHipergeometrica(N, M, n, k);
    resultados.push({
      k,
      probabilidad: calculo.probabilidad,
      porcentaje: calculo.probabilidad * 100
    });
  }
  
  return resultados;
};

/**
 * Calcula la media de la distribución hipergeométrica
 * Fórmula: E(X) = n × (M / N)
 */
export const calcularMediaHipergeometrica = (N: number, M: number, n: number) => {
  const media = n * (M / N);
  
  const pasos = [
    {
      nombre: 'Media de la Distribución Hipergeométrica',
      formula: 'E(X) = n × (M / N)',
      resultado: media,
      explicacion: `${n} × (${M} / ${N}) = ${media.toFixed(6)}`
    }
  ];
  
  return {
    valor: media,
    pasos
  };
};

/**
 * Calcula la varianza de la distribución hipergeométrica
 * Fórmula: Var(X) = n × (M/N) × ((N-M)/N) × ((N-n)/(N-1))
 */
export const calcularVarianzaHipergeometrica = (N: number, M: number, n: number) => {
  const p = M / N;
  const q = (N - M) / N;
  const factorFinitud = (N - n) / (N - 1);
  const varianza = n * p * q * factorFinitud;
  
  const pasos = [
    {
      nombre: 'Probabilidad de Éxito',
      formula: 'p = M / N',
      resultado: p,
      explicacion: `${M} / ${N} = ${p.toFixed(6)}`
    },
    {
      nombre: 'Probabilidad de Fracaso',
      formula: 'q = (N - M) / N',
      resultado: q,
      explicacion: `(${N} - ${M}) / ${N} = ${q.toFixed(6)}`
    },
    {
      nombre: 'Factor de Finitud',
      formula: 'Factor = (N - n) / (N - 1)',
      resultado: factorFinitud,
      explicacion: `(${N} - ${n}) / (${N} - 1) = ${factorFinitud.toFixed(6)}`
    },
    {
      nombre: 'Varianza',
      formula: 'Var(X) = n × p × q × Factor',
      resultado: varianza,
      explicacion: `${n} × ${p.toFixed(6)} × ${q.toFixed(6)} × ${factorFinitud.toFixed(6)} = ${varianza.toFixed(6)}`
    }
  ];
  
  return {
    valor: varianza,
    pasos
  };
};

/**
 * Calcula la desviación estándar de la distribución hipergeométrica
 * σ = √Var(X)
 */
export const calcularDesviacionEstandarHipergeometrica = (N: number, M: number, n: number) => {
  const p = M / N;
  const q = (N - M) / N;
  const factorFinitud = (N - n) / (N - 1);
  const varianza = n * p * q * factorFinitud;
  const desviacionEstandar = Math.sqrt(varianza);
  
  const pasos = [
    {
      nombre: 'Varianza',
      formula: 'Var(X) = n × (M/N) × ((N-M)/N) × ((N-n)/(N-1))',
      resultado: varianza,
      explicacion: `${varianza.toFixed(6)}`
    },
    {
      nombre: 'Desviación Estándar',
      formula: 'σ = √Var(X)',
      resultado: desviacionEstandar,
      explicacion: `√${varianza.toFixed(6)} = ${desviacionEstandar.toFixed(6)}`
    }
  ];
  
  return {
    valor: desviacionEstandar,
    varianza,
    pasos
  };
};

/**
 * Calcula el sesgo de la distribución hipergeométrica
 * Fórmula: γ = (N - 2M) × √(N-1) / ((N-2) × √(n × (M/N) × ((N-M)/N) × (N-n)))
 */
export const calcularSesgoHipergeometrica = (N: number, M: number, n: number) => {
  const p = M / N;
  const q = (N - M) / N;
  
  const numerador = (N - 2 * M) * Math.sqrt(N - 1);
  const denominador = (N - 2) * Math.sqrt(n * p * q * (N - n));
  const sesgo = numerador / denominador;
  
  const pasos = [
    {
      nombre: 'Cálculo del Sesgo Hipergeométrico',
      formula: 'γ = (N - 2M) × √(N-1) / ((N-2) × √(n × p × q × (N-n)))',
      resultado: sesgo,
      explicacion: `(${N} - 2×${M}) × √(${N}-1) / ((${N}-2) × √(...)) = ${sesgo.toFixed(6)}`
    }
  ];
  
  const clasificacion = clasificarSesgo(sesgo);
  
  return {
    valor: sesgo,
    clasificacion,
    pasos
  };
};

/**
 * Clasifica el sesgo como negativo, neutro o positivo
 */
export const clasificarSesgo = (sesgo: number): string => {
  const threshold = 0.05;
  
  if (Math.abs(sesgo) < threshold) {
    return 'Sesgo Neutro (Distribución Simétrica)';
  } else if (sesgo < 0) {
    return 'Sesgo Negativo (Asimetría a la Izquierda)';
  } else {
    return 'Sesgo Positivo (Asimetría a la Derecha)';
  }
};

/**
 * Clasifica la curtosis como Platicúrtica, Mesocúrtica o Leptocúrtica
 */
export const clasificarCurtosis = (curtosis: number): string => {
  const threshold = 0.1;
  
  if (curtosis < -threshold) {
    return 'Platicúrtica (Curva Aplanada - Curtosis Negativa)';
  } else if (Math.abs(curtosis) <= threshold) {
    return 'Mesocúrtica (Campana de Gauss - Curtosis Cero)';
  } else {
    return 'Leptocúrtica (Curva Elevada - Curtosis Positiva)';
  }
};

/**
 * Calcula la curtosis de la distribución hipergeométrica
 */
export const calcularCurtosisHipergeometrica = (N: number, M: number, n: number) => {
  const p = M / N;
  const q = (N - M) / N;
  const factor = (N - n) / (N - 1);
  const varianza = n * p * q * factor;
  
  // Fórmula simplificada de curtosis para hipergeométrica
  const numerador = (N - 1) * (N * N * (N - 1) + N * (N + 1) * (6 * n - 6) - 18 * n * (N - n) - 6 * M * (N - M) * (N - 2 * n));
  const denominador = n * p * q * (N - 2) * (N - 3) * (N - n) * varianza;
  
  let curtosis = 0;
  if (denominador !== 0) {
    curtosis = numerador / denominador;
  }
  
  const pasos = [
    {
      nombre: 'Cálculo de la Curtosis Hipergeométrica',
      formula: 'κ = (Fórmula compleja para hipergeométrica)',
      resultado: curtosis,
      explicacion: `Curtosis = ${curtosis.toFixed(6)}`
    }
  ];
  
  const clasificacion = clasificarCurtosis(curtosis);
  
  return {
    valor: curtosis,
    clasificacion,
    pasos
  };
};

/**
 * Calcula la probabilidad para un rango de valores de k
 * Fórmula: P(k1 ≤ X ≤ k2) = Σ P(X=k) para k desde k1 hasta k2
 */
export const probabilidadRangoHipergeometrica = (N: number, M: number, n: number, k1: number, k2: number) => {
  if (k1 > k2) throw new Error('k1 debe ser menor o igual a k2');
  
  const kMin = Math.max(0, n - (N - M));
  const kMax = Math.min(n, M);
  
  if (k1 < kMin || k2 > kMax) throw new Error(`k debe estar entre ${kMin} y ${kMax}`);
  
  let probabilidadTotal = 0;
  const detalles = [];
  
  for (let k = k1; k <= k2; k++) {
    const calculo = probabilidadHipergeometrica(N, M, n, k);
    probabilidadTotal += calculo.probabilidad;
    detalles.push({
      k,
      probabilidad: calculo.probabilidad,
      porcentaje: calculo.probabilidad * 100
    });
  }
  
  return {
    probabilidad: probabilidadTotal,
    k1,
    k2,
    detalles,
    pasos: [
      {
        nombre: 'Probabilidad de Rango',
        formula: `P(${k1} ≤ X ≤ ${k2}) = Σ P(X=k) para k=${k1} a ${k2}`,
        resultado: probabilidadTotal,
        explicacion: `Suma de probabilidades: ${detalles.map(d => d.probabilidad.toFixed(6)).join(' + ')} = ${probabilidadTotal}`
      }
    ]
  };
};
