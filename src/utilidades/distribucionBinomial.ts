// Funciones para calcular la distribución binomial

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
 * Verifica si la población es infinita
 * Es infinita cuando:
 * - La muestra no excede el 5% de la población (n/N <= 0.05)
 * - No existe población (N = null/undefined)
 */
export const esPopulacionInfinita = (tamanioMuestra: number, tamanioParenta?: number): boolean => {
  if (tamanioParenta === undefined || tamanioParenta === null) {
    return true; // No existe población
  }
  
  const porcentaje = tamanioMuestra / tamanioParenta;
  return porcentaje <= 0.05;
};

/**
 * Calcula la probabilidad de exactamente k éxitos en n ensayos
 * Fórmula: P(X = k) = C(n, k) × p^k × (1-p)^(n-k)
 * 
 * @param n - número de ensayos
 * @param k - número de éxitos deseados
 * @param p - probabilidad de éxito en cada ensayo
 * @returns objeto con los pasos y resultado
 */
export const probabilidadBinomial = (n: number, k: number, p: number) => {
  if (p < 0 || p > 1) throw new Error('La probabilidad debe estar entre 0 y 1');
  if (k > n || k < 0) throw new Error('k debe estar entre 0 y n');
  
  const pasos = [];
  
  // Paso 1: Calcular el coeficiente binomial
  const coeficiente = coeficienteBinomial(n, k);
  pasos.push({
    nombre: 'Coeficiente Binomial C(n, k)',
    formula: `C(${n}, ${k}) = ${n}! / (${k}! × ${n - k}!)`,
    resultado: coeficiente,
    explicacion: `${n}! = ${factorial(n)}, ${k}! = ${factorial(k)}, ${n - k}! = ${factorial(n - k)}`
  });
  
  // Paso 2: Calcular p^k
  const pElevadoK = Math.pow(p, k);
  pasos.push({
    nombre: 'Probabilidad de éxito elevada a k',
    formula: `p^k = ${p}^${k}`,
    resultado: pElevadoK,
    explicacion: `${p} elevado a ${k}`
  });
  
  // Paso 3: Calcular (1-p)^(n-k)
  const q = 1 - p;
  const qElevadoNMenosK = Math.pow(q, n - k);
  pasos.push({
    nombre: 'Probabilidad de fracaso elevada a (n-k)',
    formula: `(1-p)^(n-k) = ${q}^${n - k}`,
    resultado: qElevadoNMenosK,
    explicacion: `${q} elevado a ${n - k}`
  });
  
  // Paso 4: Multiplicar todos los componentes
  const probabilidad = coeficiente * pElevadoK * qElevadoNMenosK;
  pasos.push({
    nombre: 'Probabilidad Final',
    formula: `P(X = ${k}) = C(${n}, ${k}) × p^${k} × (1-p)^${n - k}`,
    resultado: probabilidad,
    explicacion: `${coeficiente} × ${pElevadoK} × ${qElevadoNMenosK}`
  });
  
  return {
    probabilidad,
    pasos,
    n,
    k,
    p
  };
};

/**
 * Calcula la distribución binomial completa para todos los valores de k
 */
export const distribucionBinomialCompleta = (n: number, p: number) => {
  const resultados = [];
  
  for (let k = 0; k <= n; k++) {
    const calculo = probabilidadBinomial(n, k, p);
    resultados.push({
      k,
      probabilidad: calculo.probabilidad,
      porcentaje: calculo.probabilidad * 100
    });
  }
  
  return resultados;
};

/**
 * Calcula la media de la distribución binomial
 * Para población infinita: E(X) = n × p
 * Para población finita: es la misma E(X) = n × p
 */
export const calcularMedia = (n: number, p: number, N?: number) => {
  const media = n * p;
  const esFinita = N !== undefined && N !== null;
  
  const pasos = [
    {
      nombre: 'Media de la Distribución Binomial',
      formula: 'E(X) = n × p',
      resultado: media,
      explicacion: `${n} × ${p} = ${media}`
    }
  ];
  
  if (esFinita) {
    pasos.push({
      nombre: 'Nota',
      formula: 'La media es igual tanto para población finita como infinita',
      resultado: media,
      explicacion: `E(X) = ${media} (sin cambios por tipo de población)`
    });
  }
  
  return {
    valor: media,
    esFinita,
    pasos
  };
};

/**
 * Calcula la varianza de la distribución binomial
 * Para población infinita: Var(X) = n × p × (1-p)
 */
export const calcularVarianza = (n: number, p: number) => {
  const q = 1 - p;
  const varianza = n * p * q;
  
  return {
    valor: varianza,
    pasos: [
      {
        nombre: 'Varianza',
        formula: 'Var(X) = n × p × (1-p)',
        resultado: varianza,
        explicacion: `${n} × ${p} × ${q} = ${varianza}`
      }
    ]
  };
};

/**
 * Calcula la desviación estándar de la distribución binomial
 * Para población infinita: σ = √(n × p × (1-p))
 */
export const calcularDesviacionEstandar = (n: number, p: number) => {
  const q = 1 - p;
  const varianza = n * p * q;
  const desviacionEstandar = Math.sqrt(varianza);
  
  return {
    valor: desviacionEstandar,
    pasos: [
      {
        nombre: 'Varianza',
        formula: 'Var(X) = n × p × (1-p)',
        resultado: varianza,
        explicacion: `${n} × ${p} × ${q} = ${varianza}`
      },
      {
        nombre: 'Desviación Estándar',
        formula: 'σ = √(n × p × (1-p))',
        resultado: desviacionEstandar,
        explicacion: `√${varianza} = ${desviacionEstandar}`
      }
    ]
  };
};

/**
 * Calcula la desviación estándar para población finita (sin reemplazo)
 * Fórmula: σ = √(n × p × (1-p) × ((N-n)/(N-1)))
 */
export const calcularDesviacionEstandarFinita = (n: number, p: number, N: number) => {
  const q = 1 - p;
  const varianza = n * p * q;
  const factorCorrecion = (N - n) / (N - 1);
  const varianzaFinita = varianza * factorCorrecion;
  const desviacionEstandar = Math.sqrt(varianzaFinita);
  
  return {
    valor: desviacionEstandar,
    varianza: varianzaFinita,
    pasos: [
      {
        nombre: 'Varianza (población infinita)',
        formula: 'Var(X) = n × p × (1-p)',
        resultado: varianza,
        explicacion: `${n} × ${p} × ${q} = ${varianza}`
      },
      {
        nombre: 'Factor de Corrección',
        formula: '(N-n)/(N-1)',
        resultado: factorCorrecion,
        explicacion: `(${N}-${n})/(${N}-1) = ${factorCorrecion}`
      },
      {
        nombre: 'Varianza (población finita)',
        formula: 'Var(X)_finita = Var(X) × factor',
        resultado: varianzaFinita,
        explicacion: `${varianza} × ${factorCorrecion} = ${varianzaFinita}`
      },
      {
        nombre: 'Desviación Estándar',
        formula: 'σ = √(Var(X)_finita)',
        resultado: desviacionEstandar,
        explicacion: `√${varianzaFinita} = ${desviacionEstandar}`
      }
    ]
  };
};

/**
 * Calcula el factor de corrección para población finita
 * Fórmula: FC = (N-n)/(N-1)
 */
export const calcularFactorCorreccion = (n: number, N: number) => {
  if (N <= n) throw new Error('El tamaño de la población (N) debe ser mayor que el tamaño de la muestra (n)');
  
  const factorCorrecion = (N - n) / (N - 1);
  
  return {
    valor: factorCorrecion,
    pasos: [
      {
        nombre: 'Factor de Corrección para Población Finita',
        formula: 'FC = (N - n) / (N - 1)',
        resultado: factorCorrecion,
        explicacion: `(${N} - ${n}) / (${N} - 1) = ${factorCorrecion}`
      },
      {
        nombre: 'Interpretación',
        formula: 'Factor de corrección',
        resultado: factorCorrecion,
        explicacion: `Este factor se multiplica por la varianza. Valores cercanos a 1 indican poca corrección (muestra pequeña respecto a población)`
      }
    ]
  };
};

/**
 * Calcula el sesgo (skewness) de la distribución binomial
 * Fórmula infinita: γ = (1 - 2p) / √(n*p*(1-p))
 */
export const calcularSesgo = (n: number, p: number, N?: number) => {
  const q = 1 - p;
  const varianza = n * p * q;
  const desviacion = Math.sqrt(varianza);
  const sesgo = (1 - 2 * p) / desviacion;
  
  const esFinita = N !== undefined && N !== null;
  
  const pasos = [
    {
      nombre: 'Cálculo del Sesgo',
      formula: 'γ = (1 - 2p) / √(n*p*(1-p))',
      resultado: sesgo,
      explicacion: `(1 - 2×${p}) / √${varianza} = ${sesgo.toFixed(6)}`
    }
  ];
  
  const clasificacion = clasificarSesgo(sesgo);
  
  return {
    valor: sesgo,
    esFinita,
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
 * Calcula la curtosis (kurtosis) de la distribución binomial
 * Fórmula: κ = (1 - 6*p*(1-p)) / (n*p*(1-p))
 */
export const calcularCurtosis = (n: number, p: number, N?: number) => {
  const q = 1 - p;
  const varianza = n * p * q;
  const curtosis = (1 - 6 * p * q) / varianza;
  
  const esFinita = N !== undefined && N !== null;
  
  const pasos = [
    {
      nombre: 'Cálculo de la Curtosis',
      formula: 'κ = (1 - 6*p*(1-p)) / (n*p*(1-p))',
      resultado: curtosis,
      explicacion: `(1 - 6×${p}×${q}) / ${varianza} = ${curtosis.toFixed(6)}`
    }
  ];
  
  const clasificacion = clasificarCurtosis(curtosis);
  
  return {
    valor: curtosis,
    esFinita,
    clasificacion,
    pasos
  };
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
