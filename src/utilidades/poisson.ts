// Funciones para calcular la distribución de Poisson

/**
 * Calcula el factorial de un número
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
 * Calcula e (número de Euler) elevado a una potencia
 */
export const potencia_e = (exponente: number): number => {
  return Math.exp(exponente);
};

/**
 * Valida si se puede usar Poisson como aproximación de Binomial
 * Condiciones:
 * - Probabilidad de éxito (p) < 0.10
 * - Media (n*p) < 10
 * 
 * @param n - número de ensayos
 * @param p - probabilidad de éxito
 * @returns boolean indicando si es válido usar Poisson
 */
export const puedeUsarPoisson = (n: number, p: number): boolean => {
  if (p >= 0.10) {
    return false; // p debe ser menor a 0.10
  }
  
  const media = n * p;
  if (media >= 10) {
    return false; // media debe ser menor a 10
  }
  
  return true;
};

/**
 * Calcula la probabilidad de exactamente k eventos usando Poisson
 * Fórmula: P(X = k) = (e^(-λ) × λ^k) / k!
 * 
 * @param lambda - parámetro de Poisson (media)
 * @param k - número de eventos
 * @returns objeto con los pasos y resultado
 */
export const probabilidadPoisson = (lambda: number, k: number) => {
  if (lambda <= 0) throw new Error('Lambda debe ser mayor a 0');
  if (k < 0) throw new Error('k debe ser mayor o igual a 0');

  const pasos = [];

  // Paso 1: Calcular e^(-λ)
  const e_negativo_lambda = potencia_e(-lambda);
  pasos.push({
    nombre: 'e elevado a -λ',
    formula: `e^(-${lambda})`,
    resultado: e_negativo_lambda,
    explicacion: `e elevado a -${lambda} = ${e_negativo_lambda.toFixed(8)}`
  });

  // Paso 2: Calcular λ^k
  const lambda_elevado_k = Math.pow(lambda, k);
  pasos.push({
    nombre: 'Lambda elevado a k',
    formula: `${lambda}^${k}`,
    resultado: lambda_elevado_k,
    explicacion: `${lambda} elevado a ${k} = ${lambda_elevado_k.toFixed(8)}`
  });

  // Paso 3: Calcular k!
  const k_factorial = factorial(k);
  pasos.push({
    nombre: 'k factorial',
    formula: `${k}!`,
    resultado: k_factorial,
    explicacion: `${k}! = ${k_factorial}`
  });

  // Paso 4: Calcular la probabilidad
  const probabilidad = (e_negativo_lambda * lambda_elevado_k) / k_factorial;
  pasos.push({
    nombre: 'Probabilidad Final',
    formula: `P(X = ${k}) = (e^(-${lambda}) × ${lambda}^${k}) / ${k}!`,
    resultado: probabilidad,
    explicacion: `(${e_negativo_lambda.toFixed(8)} × ${lambda_elevado_k.toFixed(8)}) / ${k_factorial} = ${probabilidad.toFixed(8)}`
  });

  return {
    probabilidad,
    pasos,
    lambda,
    k
  };
};

/**
 * Calcula la distribución de Poisson completa para todos los valores de k
 */
export const distribucionPoissonCompleta = (lambda: number, kmaxManual?: number) => {
  const resultados = [];
  
  // Determinar kmax: hasta 99% de probabilidad acumulada o máximo 50 valores
  let probabilidadAcumulada = 0;
  let kmax = Math.ceil(lambda + 3 * Math.sqrt(lambda)); // Regla práctica
  if (kmaxManual) kmax = kmaxManual;
  
  for (let k = 0; k <= kmax; k++) {
    const calculo = probabilidadPoisson(lambda, k);
    probabilidadAcumulada += calculo.probabilidad;
    resultados.push({
      k,
      probabilidad: calculo.probabilidad,
      porcentaje: calculo.probabilidad * 100,
      acumulada: probabilidadAcumulada,
      porcentajeAcumulado: probabilidadAcumulada * 100
    });
    
    // Detener si ya acumulamos suficiente probabilidad
    if (probabilidadAcumulada > 0.995) break;
  }
  
  return resultados;
};

/**
 * Calcula la media de la distribución de Poisson
 * E(X) = λ
 */
export const calcularMediaPoisson = (lambda: number) => {
  const media = lambda;
  
  const pasos = [
    {
      nombre: 'Media de la Distribución de Poisson',
      formula: 'E(X) = λ',
      resultado: media,
      explicacion: `E(X) = ${lambda}`
    }
  ];
  
  return {
    valor: media,
    pasos
  };
};

/**
 * Calcula la varianza de la distribución de Poisson
 * Var(X) = λ
 */
export const calcularVarianzaPoisson = (lambda: number) => {
  const varianza = lambda;
  
  const pasos = [
    {
      nombre: 'Varianza de la Distribución de Poisson',
      formula: 'Var(X) = λ',
      resultado: varianza,
      explicacion: `Var(X) = ${lambda}`
    }
  ];
  
  return {
    valor: varianza,
    pasos
  };
};

/**
 * Calcula la desviación estándar de la distribución de Poisson
 * σ = √λ
 */
export const calcularDesviacionEstandarPoisson = (lambda: number) => {
  const varianza = lambda;
  const desviacionEstandar = Math.sqrt(varianza);
  
  return {
    valor: desviacionEstandar,
    varianza,
    pasos: [
      {
        nombre: 'Varianza',
        formula: 'Var(X) = λ',
        resultado: varianza,
        explicacion: `Var(X) = ${lambda}`
      },
      {
        nombre: 'Desviación Estándar',
        formula: 'σ = √λ',
        resultado: desviacionEstandar,
        explicacion: `√${lambda} = ${desviacionEstandar.toFixed(6)}`
      }
    ]
  };
};

/**
 * Calcula el sesgo de la distribución de Poisson
 * Fórmula: γ = 1 / √λ
 */
export const calcularSesgoPoisson = (lambda: number) => {
  if (lambda <= 0) throw new Error('Lambda debe ser mayor a 0');
  
  const sesgo = 1 / Math.sqrt(lambda);
  
  const pasos = [
    {
      nombre: 'Cálculo del Sesgo',
      formula: 'γ = 1 / √λ',
      resultado: sesgo,
      explicacion: `1 / √${lambda} = ${sesgo.toFixed(6)}`
    }
  ];
  
  const clasificacion = clasificarSesgoPoisson(sesgo);
  
  return {
    valor: sesgo,
    clasificacion,
    pasos
  };
};

/**
 * Clasifica el sesgo de Poisson
 */
export const clasificarSesgoPoisson = (sesgo: number): string => {
  // En Poisson, el sesgo siempre es positivo (1/√λ > 0)
  // pero disminuye conforme λ aumenta
  if (sesgo > 0.5) {
    return 'Sesgo Positivo - Distribución fuertemente asimétrica a la derecha (λ pequeño)';
  } else if (sesgo > 0.1) {
    return 'Sesgo Positivo - Distribución moderadamente asimétrica a la derecha (λ moderado)';
  } else {
    return 'Sesgo Positivo - Distribución débilmente asimétrica, aproximándose a la simetría (λ grande)';
  }
};

/**
 * Calcula la curtosis de la distribución de Poisson
 * Fórmula: κ = 1 / λ
 */
export const calcularCurtosisPoisson = (lambda: number) => {
  if (lambda <= 0) throw new Error('Lambda debe ser mayor a 0');
  
  const curtosis = 1 / lambda;
  
  const pasos = [
    {
      nombre: 'Cálculo de la Curtosis',
      formula: 'κ = 1 / λ',
      resultado: curtosis,
      explicacion: `1 / ${lambda} = ${curtosis.toFixed(6)}`
    }
  ];
  
  const clasificacion = clasificarCurtosisPoisson(curtosis);
  
  return {
    valor: curtosis,
    clasificacion,
    pasos
  };
};

/**
 * Clasifica la curtosis de Poisson
 * En Poisson, la curtosis es siempre positiva (1/λ > 0)
 */
export const clasificarCurtosisPoisson = (curtosis: number): string => {
  // En Poisson, curtosis = 1/λ, siempre positiva
  // A mayor λ, menor curtosis (se acerca a mesocúrtica)
  const threshold = 0.1;
  
  if (curtosis > threshold) {
    return 'Leptocúrtica (Curva Elevada - Colas pesadas, λ pequeño)';
  } else {
    return 'Aproximadamente Mesocúrtica o Platicúrtica (Campana más plana, λ grande)';
  }
};

/**
 * Calcula la probabilidad acumulada de Poisson
 * P(X ≤ k) = Σ P(X = i) para i desde 0 hasta k
 */
export const probabilidadAcumuladaPoisson = (lambda: number, k: number) => {
  if (k < 0) throw new Error('k debe ser mayor o igual a 0');
  
  let probabilidadTotal = 0;
  const detalles = [];
  
  for (let i = 0; i <= k; i++) {
    const calculo = probabilidadPoisson(lambda, i);
    probabilidadTotal += calculo.probabilidad;
    detalles.push({
      k: i,
      probabilidad: calculo.probabilidad,
      porcentaje: calculo.probabilidad * 100,
      acumulada: probabilidadTotal,
      porcentajeAcumulado: probabilidadTotal * 100
    });
  }
  
  return {
    k,
    probabilidadAcumulada: probabilidadTotal,
    porcentajeAcumulado: probabilidadTotal * 100,
    detalles,
    pasos: [
      {
        nombre: 'Probabilidad Acumulada',
        formula: `P(X ≤ ${k}) = Σ P(X=i) para i=0 a ${k}`,
        resultado: probabilidadTotal,
        explicacion: `Suma acumulada de ${detalles.length} probabilidades = ${probabilidadTotal.toFixed(6)}`
      }
    ]
  };
};

/**
 * Calcula la probabilidad complementaria de Poisson
 * P(X > k) = 1 - P(X ≤ k)
 */
export const probabilidadComplementariaPoisson = (lambda: number, k: number) => {
  const acumulada = probabilidadAcumuladaPoisson(lambda, k);
  const probabilidadComplementaria = 1 - acumulada.probabilidadAcumulada;
  
  return {
    k,
    probabilidadComplementaria,
    porcentajeComplementario: probabilidadComplementaria * 100,
    probabilidadAcumulada: acumulada.probabilidadAcumulada,
    pasos: [
      {
        nombre: 'Probabilidad Complementaria',
        formula: `P(X > ${k}) = 1 - P(X ≤ ${k})`,
        resultado: probabilidadComplementaria,
        explicacion: `1 - ${acumulada.probabilidadAcumulada.toFixed(6)} = ${probabilidadComplementaria.toFixed(6)}`
      }
    ]
  };
};
