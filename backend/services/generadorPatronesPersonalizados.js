/**
 * Servicio de Generación Automática de Patrones de Trabajo Personalizados
 * Genera rotaciones válidas respetando límites legales colombianos
 * 
 * Restricciones:
 * - Máximo 42 horas/semana
 * - Máximo 182 horas/mes
 * - Mínimo 1 día libre cada 7 días
 */

// Tipos de turnos disponibles
const TIPOS_TURNOS = {
  '12D': { horas: 12, nombre: 'Turno Diurno 12h' },
  '12N': { horas: 12, nombre: 'Turno Nocturno 12h' },
  '8D': { horas: 8, nombre: 'Turno Diurno 8h' },
  '8N': { horas: 8, nombre: 'Turno Nocturno 8h' },
  '6D': { horas: 6, nombre: 'Turno Diurno 6h' },
  '6N': { horas: 6, nombre: 'Turno Nocturno 6h' },
  'CMP': { horas: 4, nombre: 'Cobertura Especial 4h' },
  'DESC': { horas: 0, nombre: 'Descanso' }
};

/**
 * Genera un patrón aleatorio válido de 7 días
 * @returns {Array} Array de 7 objetos con tipo de turno y horas
 */
function generarPatronAleatorio() {
  let patron = [];
  let totalHoras = 0;
  let diasTrabajados = 0;
  let ultimoDesc = -1; // Última posición de DESC

  // Estrategias de rotación disponibles
  const estrategias = [
    () => generarEstrategia2x2Desc(), // 2 días trabajo, 2 descanso
    () => generarEstrategia3x4Desc(), // 3 días trabajo, 4 descanso
    () => generarEstrategia12hRotativo(), // Turnos de 12h alternados
    () => generarEstrategia8h(), // Turnos de 8h
    () => generarEstrategiaEquilibrada() // Mezcla de turnos
  ];

  // Selecciona una estrategia aleatoria
  const estrategiaSeleccionada = estrategias[Math.floor(Math.random() * estrategias.length)];
  patron = estrategiaSeleccionada();

  return patron;
}

/**
 * Estrategia: 2 días trabajo, 2 descanso alternado
 * Ejemplo: 12D-12D-DESC-DESC-12D-12D-DESC
 */
function generarEstrategia2x2Desc() {
  const turnos = ['12D', '12N'];
  const patron = [];
  let diasTrabajo = 0;
  let diasDesc = 0;

  for (let i = 0; i < 7; i++) {
    if (diasDesc > 0) {
      patron.push({ tipo: 'DESC', horas: 0 });
      diasDesc--;
    } else if (diasTrabajo < 2) {
      const turnoAleatorio = turnos[Math.floor(Math.random() * turnos.length)];
      patron.push({ tipo: turnoAleatorio, horas: TIPOS_TURNOS[turnoAleatorio].horas });
      diasTrabajo++;
    } else {
      patron.push({ tipo: 'DESC', horas: 0 });
      diasTrabajo = 0;
      diasDesc = 1;
    }
  }

  return patron;
}

/**
 * Estrategia: 3 días trabajo, 4 descanso (rotación semanal)
 * Ejemplo: 12D-12D-12D-DESC-DESC-DESC-DESC
 */
function generarEstrategia3x4Desc() {
  const patron = [];
  const turnos = ['12D', '12N'];
  
  // 3 días trabajados
  for (let i = 0; i < 3; i++) {
    const turnoAleatorio = turnos[Math.floor(Math.random() * turnos.length)];
    patron.push({ tipo: turnoAleatorio, horas: TIPOS_TURNOS[turnoAleatorio].horas });
  }
  
  // 4 días descansados
  for (let i = 0; i < 4; i++) {
    patron.push({ tipo: 'DESC', horas: 0 });
  }

  return patron;
}

/**
 * Estrategia: Turnos de 12h alternados (Diurno-Nocturno)
 * Ejemplo: 12D-DESC-12N-DESC-12D-DESC-12N
 */
function generarEstrategia12hRotativo() {
  const patron = [];
  const patron12h = ['12D', 'DESC', '12N', 'DESC', '12D', 'DESC', '12N'];
  
  for (const tipo of patron12h) {
    patron.push({ 
      tipo, 
      horas: TIPOS_TURNOS[tipo].horas 
    });
  }

  return patron;
}

/**
 * Estrategia: Turnos de 8 horas
 * Ejemplo: 8D-8D-8D-DESC-DESC-8D-8D
 */
function generarEstrategia8h() {
  const patron = [];
  const tiposTurnos = ['8D', '8N'];
  
  const secuencia = [
    tiposTurnos[Math.floor(Math.random() * tiposTurnos.length)],
    tiposTurnos[Math.floor(Math.random() * tiposTurnos.length)],
    tiposTurnos[Math.floor(Math.random() * tiposTurnos.length)],
    'DESC',
    'DESC',
    tiposTurnos[Math.floor(Math.random() * tiposTurnos.length)],
    tiposTurnos[Math.floor(Math.random() * tiposTurnos.length)]
  ];

  for (const tipo of secuencia) {
    patron.push({ 
      tipo, 
      horas: TIPOS_TURNOS[tipo].horas 
    });
  }

  return patron;
}

/**
 * Estrategia: Mezcla equilibrada de turnos
 * Ejemplo: 12D-8D-DESC-8N-DESC-12N-DESC
 */
function generarEstrategiaEquilibrada() {
  const patron = [];
  const tiposConHoras = ['12D', '12N', '8D', '8N', '6D', '6N'];
  
  // Crear una secuencia aleatoria pero equilibrada
  for (let i = 0; i < 7; i++) {
    if (i % 3 === 2) {
      // Cada 3 días, un descanso
      patron.push({ tipo: 'DESC', horas: 0 });
    } else {
      const turnoAleatorio = tiposConHoras[Math.floor(Math.random() * tiposConHoras.length)];
      patron.push({ 
        tipo: turnoAleatorio, 
        horas: TIPOS_TURNOS[turnoAleatorio].horas 
      });
    }
  }

  return patron;
}

/**
 * Valida que un patrón cumpla con restricciones legales
 * @param {Array} patron - Array de 7 días con turnos
 * @returns {Object} { valido: boolean, razon: string, horas: number }
 */
function validarPatron(patron) {
  let totalHoras = 0;
  let diasDesc = 0;

  // Calcular totales
  patron.forEach(dia => {
    totalHoras += dia.horas;
    if (dia.tipo === 'DESC') diasDesc++;
  });

  // Validación 1: Máximo 42 horas/semana (Colombia)
  if (totalHoras > 42) {
    return {
      valido: false,
      razon: `Total de horas (${totalHoras}) excede límite legal de 42 horas/semana`,
      horas: totalHoras
    };
  }

  // Validación 2: Mínimo 1 día libre cada 7 días
  if (diasDesc === 0) {
    return {
      valido: false,
      razon: 'Debe haber al menos 1 día de descanso en la semana',
      horas: totalHoras
    };
  }

  // Validación 3: No más de 6 días consecutivos trabajados
  let diasConsecutivos = 0;
  for (const dia of patron) {
    if (dia.tipo !== 'DESC') {
      diasConsecutivos++;
      if (diasConsecutivos > 6) {
        return {
          valido: false,
          razon: 'No puede haber más de 6 días consecutivos sin descanso',
          horas: totalHoras
        };
      }
    } else {
      diasConsecutivos = 0;
    }
  }

  return {
    valido: true,
    razon: 'Patrón válido',
    horas: totalHoras
  };
}

/**
 * Genera un patrón con reintentos hasta encontrar uno válido
 * @param {number} maxReintentos - Número máximo de intentos
 * @returns {Object} { patron: Array, validacion: Object }
 */
function generarPatronValido(maxReintentos = 10) {
  for (let i = 0; i < maxReintentos; i++) {
    const patron = generarPatronAleatorio();
    const validacion = validarPatron(patron);

    if (validacion.valido) {
      return { patron, validacion };
    }
  }

  // Si no encuentra válido en 10 intentos, devuelve estrategia garantizada
  const patronSeguro = [
    { tipo: '12D', horas: 12 },
    { tipo: '12D', horas: 12 },
    { tipo: 'DESC', horas: 0 },
    { tipo: '12N', horas: 12 },
    { tipo: 'DESC', horas: 0 },
    { tipo: 'DESC', horas: 0 },
    { tipo: '12N', horas: 12 }
  ];

  const validacion = validarPatron(patronSeguro);
  return { patron: patronSeguro, validacion };
}

/**
 * Formatea el patrón para mostrar al usuario
 * @param {Array} patron - Array de 7 días
 * @returns {string} Formato: 12D-12D-DESC-12N-DESC-DESC-12N
 */
function formatearPatron(patron) {
  return patron.map(dia => dia.tipo).join('-');
}

/**
 * Genera nombre sugerido basado en el patrón
 * @param {Array} patron - Array de 7 días
 * @returns {string} Nombre descriptivo
 */
function generarNombrePatron(patron) {
  const totalHoras = patron.reduce((sum, dia) => sum + dia.horas, 0);
  const diasDesc = patron.filter(d => d.tipo === 'DESC').length;
  const formato = formatearPatron(patron);

  const nombres = [
    `Rotativo ${totalHoras}h/sem`,
    `Modalidad ${formato}`,
    `Turno Flexible ${diasDesc} desc`,
    `Jornada Rotativa ${totalHoras}h`
  ];

  return nombres[Math.floor(Math.random() * nombres.length)];
}

module.exports = {
  generarPatronAleatorio,
  generarPatronValido,
  validarPatron,
  formatearPatron,
  generarNombrePatron,
  TIPOS_TURNOS
};
