/**
 * Algoritmo para generar cronograma de supervisores mineros
 */

// Estados posibles para cada supervisor
export const SUPERVISOR_STATES = {
  SUBIDA: 'S',
  INDUCCION: 'I',
  PERFORACION: 'P',
  BAJADA: 'B',
  DESCANSO: 'D',
  VACIO: '-'
};

/**
 * Calcula el cronograma completo
 * @param {number} trabajoDias - N días de trabajo (N del régimen NxM)
 * @param {number} descansoDias - M días de descanso (M del régimen NxM)
 * @param {number} induccionDias - Días de inducción (1-5)
 * @param {number} totalPerforacionDias - Total días de perforación requeridos
 * @returns {Object} Cronograma con schedule y validaciones
 */
export const generarCronograma = (trabajoDias, descansoDias, induccionDias, totalPerforacionDias) => {
  // Validar parámetros
  if (trabajoDias < induccionDias + 2) {
    throw new Error('Los días de trabajo deben ser mayores que los días de inducción + 2');
  }
  
  if (induccionDias < 1 || induccionDias > 5) {
    throw new Error('Los días de inducción deben estar entre 1 y 5');
  }
  
  // Calcular días de perforación por ciclo
  const perforacionPorCiclo = trabajoDias - induccionDias - 1; // -1 para el día de subida
  
  // Inicializar estructuras
  const schedule = {
    s1: [],
    s2: [],
    s3: [],
    dias: [],
    perforandoPorDia: []
  };
  
  // Calcular días totales necesarios (estimado)
  const ciclosNecesarios = Math.ceil(totalPerforacionDias / (perforacionPorCiclo * 2));
  const totalDias = ciclosNecesarios * (trabajoDias + descansoDias) + 30;
  
  // Paso 1: Generar cronograma para S1 (fijo según régimen)
  let dia = 0;
  let s1PerforacionAcumulada = 0;
  
  while (s1PerforacionAcumulada < totalPerforacionDias && schedule.s1.length < totalDias) {
    // Ciclo de trabajo
    schedule.s1.push(SUPERVISOR_STATES.SUBIDA);
    
    for (let i = 0; i < induccionDias; i++) {
      schedule.s1.push(SUPERVISOR_STATES.INDUCCION);
    }
    
    for (let i = 0; i < perforacionPorCiclo; i++) {
      schedule.s1.push(SUPERVISOR_STATES.PERFORACION);
      s1PerforacionAcumulada++;
      
      if (s1PerforacionAcumulada >= totalPerforacionDias) {
        // Si alcanzamos el total, terminar con bajada
        schedule.s1.push(SUPERVISOR_STATES.BAJADA);
        break;
      }
    }
    
    // Si no terminamos, agregar bajada y descanso
    if (s1PerforacionAcumulada < totalPerforacionDias) {
      schedule.s1.push(SUPERVISOR_STATES.BAJADA);
      
      // Días de descanso (restamos 2 para subida y bajada)
      for (let i = 0; i < descansoDias - 2; i++) {
        schedule.s1.push(SUPERVISOR_STATES.DESCANSO);
      }
    }
  }
  
  // Paso 2: Determinar cuándo debe entrar S3
  // S3 debe entrar para cubrir cuando S1 baje
  const s1PrimeraBajada = schedule.s1.findIndex(state => state === SUPERVISOR_STATES.BAJADA);
  const s3EntradaDia = Math.max(0, s1PrimeraBajada - induccionDias - 1);
  
  // Paso 3: Generar cronograma para S3
  let s3Index = 0;
  while (schedule.s3.length < schedule.s1.length) {
    if (s3Index < s3EntradaDia) {
      schedule.s3.push(SUPERVISOR_STATES.VACIO);
    } else {
      // Calcular posición en ciclo de S3
      const cicloPos = (s3Index - s3EntradaDia) % (trabajoDias + descansoDias);
      
      if (cicloPos === 0) {
        schedule.s3.push(SUPERVISOR_STATES.SUBIDA);
      } else if (cicloPos <= induccionDias) {
        schedule.s3.push(SUPERVISOR_STATES.INDUCCION);
      } else if (cicloPos < trabajoDias) {
        schedule.s3.push(SUPERVISOR_STATES.PERFORACION);
      } else if (cicloPos === trabajoDias) {
        schedule.s3.push(SUPERVISOR_STATES.BAJADA);
      } else {
        schedule.s3.push(SUPERVISOR_STATES.DESCANSO);
      }
    }
    s3Index++;
  }
  
  // Paso 4: Generar cronograma para S2 (ajustable)
  // S2 empieza con S1, pero se ajusta para cubrir huecos
  schedule.s2 = [...schedule.s1]; // Empezar igual que S1
  
  // Ajustar S2 para evitar solapamientos con S3
  for (let i = 0; i < schedule.s1.length; i++) {
    if (schedule.s1[i] === SUPERVISOR_STATES.PERFORACION && 
        schedule.s3[i] === SUPERVISOR_STATES.PERFORACION &&
        schedule.s2[i] === SUPERVISOR_STATES.PERFORACION) {
      // Evitar 3 perforando: hacer que S2 baje antes
      for (let j = Math.max(0, i - 2); j <= i; j++) {
        if (schedule.s2[j] === SUPERVISOR_STATES.PERFORACION) {
          schedule.s2[j] = SUPERVISOR_STATES.BAJADA;
          break;
        }
      }
    }
  }
  
  // Asegurar que siempre haya 2 perforando cuando S3 esté activo
  for (let i = s3EntradaDia; i < schedule.s1.length; i++) {
    const perforando = [
      schedule.s1[i],
      schedule.s2[i], 
      schedule.s3[i]
    ].filter(state => state === SUPERVISOR_STATES.PERFORACION).length;
    
    if (perforando === 1) {
      // Si solo hay 1 perforando, ajustar S2
      if (schedule.s2[i] !== SUPERVISOR_STATES.PERFORACION) {
        // Buscar dónde podemos hacer que S2 perfore
        for (let j = i; j < Math.min(i + 5, schedule.s1.length); j++) {
          if (schedule.s2[j] === SUPERVISOR_STATES.DESCANSO) {
            schedule.s2[j] = SUPERVISOR_STATES.PERFORACION;
            break;
          }
        }
      }
    }
  }
  
  // Generar array de días
  for (let i = 0; i < schedule.s1.length; i++) {
    schedule.dias.push(i);
    
    // Contar cuántos están perforando cada día
    const perforando = [
      schedule.s1[i],
      schedule.s2[i],
      schedule.s3[i]
    ].filter(state => state === SUPERVISOR_STATES.PERFORACION).length;
    
    schedule.perforandoPorDia.push(perforando);
  }
  
  // Validar el cronograma generado
  const errores = validarCronograma(schedule, s3EntradaDia);
  
  return {
    schedule,
    errores,
    s3EntradaDia,
    parametros: {
      trabajoDias,
      descansoDias,
      induccionDias,
      totalPerforacionDias,
      perforacionPorCiclo
    }
  };
};

/**
 * Valida el cronograma generado
 * @param {Object} schedule - Cronograma generado
 * @param {number} s3EntradaDia - Día en que S3 comienza
 * @returns {Array} Lista de errores encontrados
 */
const validarCronograma = (schedule, s3EntradaDia) => {
  const errores = [];
  
  for (let i = 0; i < schedule.s1.length; i++) {
    const perforando = schedule.perforandoPorDia[i];
    
    // Regla 1: Nunca 3 perforando
    if (perforando === 3) {
      errores.push({
        tipo: '3_PERFORANDO',
        dia: i,
        mensaje: `Día ${i}: 3 supervisores perforando simultáneamente`
      });
    }
    
    // Regla 2: Nunca 1 perforando cuando S3 está activo
    if (i >= s3EntradaDia && perforando === 1) {
      errores.push({
        tipo: '1_PERFORANDO',
        dia: i,
        mensaje: `Día ${i}: Solo 1 supervisor perforando (S3 ya está activo)`
      });
    }
    
    // Validar patrones inválidos para cada supervisor
    const supervisores = [
      {nombre: 'S1', estados: schedule.s1},
      {nombre: 'S2', estados: schedule.s2},
      {nombre: 'S3', estados: schedule.s3}
    ];
    
    supervisores.forEach(sup => {
      // Patrón S-S (subida consecutiva)
      if (i > 0 && sup.estados[i-1] === 'S' && sup.estados[i] === 'S') {
        errores.push({
          tipo: 'PATRON_INVALIDO',
          dia: i,
          supervisor: sup.nombre,
          mensaje: `${sup.nombre}: Subida consecutiva en día ${i}`
        });
      }
      
      // Patrón S-B (subida seguida de bajada sin perforar)
      if (i > 0 && sup.estados[i-1] === 'S' && sup.estados[i] === 'B') {
        errores.push({
          tipo: 'PATRON_INVALIDO',
          dia: i,
          supervisor: sup.nombre,
          mensaje: `${sup.nombre}: Subida seguida de bajada sin perforar en día ${i}`
        });
      }
    });
  }
  
  return errores;
};

/**
 * Obtiene el color correspondiente a cada estado
 * @param {string} estado - Estado del supervisor
 * @returns {string} Código hexadecimal del color
 */
export const obtenerColorEstado = (estado) => {
  switch (estado) {
    case SUPERVISOR_STATES.SUBIDA:
      return '#3B82F6'; // Azul
    case SUPERVISOR_STATES.INDUCCION:
      return '#F59E0B'; // Naranja
    case SUPERVISOR_STATES.PERFORACION:
      return '#10B981'; // Verde
    case SUPERVISOR_STATES.BAJADA:
      return '#EF4444'; // Rojo
    case SUPERVISOR_STATES.DESCANSO:
      return '#9CA3AF'; // Gris
    default:
      return '#FFFFFF'; // Blanco
  }
};

/**
 * Obtiene el nombre completo del estado
 * @param {string} estado - Abreviatura del estado
 * @returns {string} Nombre completo
 */
export const obtenerNombreEstado = (estado) => {
  switch (estado) {
    case SUPERVISOR_STATES.SUBIDA:
      return 'Subida';
    case SUPERVISOR_STATES.INDUCCION:
      return 'Inducción';
    case SUPERVISOR_STATES.PERFORACION:
      return 'Perforación';
    case SUPERVISOR_STATES.BAJADA:
      return 'Bajada';
    case SUPERVISOR_STATES.DESCANSO:
      return 'Descanso';
    default:
      return 'Vacío';
  }
};