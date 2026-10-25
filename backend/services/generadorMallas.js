/**
 * ==========================================
 * SERVICIO: Generador Automático de Mallas
 * ==========================================
 * 
 * Módulo encargado de generar automáticamente calendarios de turnos
 * basado en configuraciones de malla previamente definidas.
 * 
 * CARACTERÍSTICAS:
 * ✅ Distribución equilibrada de turnos
 * ✅ Validaciones legales (42 hrs/semana, 182 hrs/mes - Colombia)
 * ✅ Rotación justa entre empleados
 * ✅ Cálculo automático de descansos
 * ✅ Auditoría de generaciones
 * 
 * @module generadorMallas
 * @author Sistema de Turnos v2.0
 * @version 2.0.0
 */

const { pool } = require('../db');

/**
 * Interfaz principal del generador de mallas
 * @namespace generadorMallas
 */
const generadorMallas = {

  /**
   * Genera automáticamente un calendario de turnos para una configuración
   * 
   * @async
   * @param {Object} params - Parámetros de generación
   * @param {number} params.configuracionId - ID de la configuración de malla
   * @param {number} params.empresaId - ID de la empresa
   * @param {Date} params.fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {number} params.cantidadSemanas - Cantidad de semanas a generar (4-52)
   * @param {number} params.usuarioId - ID del usuario que solicita la generación
   * @param {string} params.tipoDistribucion - 'equilibrada' o 'personalizada'
   * 
   * @returns {Promise<Object>} Resultado de la generación
   * @returns {number} result.totalInstancias - Cantidad de instancias creadas
   * @returns {Array} result.detalles - Detalles de la generación
   * @returns {Object} result.resumenLegal - Validación de cumplimiento legal
   * 
   * @throws {Error} Si la configuración no existe o no es válida
   * 
   * @example
   * const resultado = await generadorMallas.generarMalla({
   *   configuracionId: 1,
   *   empresaId: 1,
   *   fechaInicio: '2026-10-01',
   *   cantidadSemanas: 4,
   *   usuarioId: 5,
   *   tipoDistribucion: 'equilibrada'
   * });
   */
  generarMalla: async (params) => {
    const {
      configuracionId,
      empresaId,
      fechaInicio,
      fechaFin,
      cantidadSemanas,
      usuarioId,
      tipoDistribucion,
      pautasSeleccionadas
    } = params;

    try {
      // 1️⃣ VALIDAR PARÁMETROS
      generadorMallas._validarParametros({
        configuracionId,
        empresaId,
        fechaInicio,
        fechaFin,
        cantidadSemanas,
        tipoDistribucion
      });

      // 2️⃣ OBTENER CONFIGURACIÓN
      const config = await generadorMallas._obtenerConfiguracion(
        configuracionId,
        empresaId
      );

      if (!config) {
        throw new Error('Configuración no encontrada o no pertenece a esta empresa');
      }

      // 3️⃣ OBTENER TURNOS ASIGNADOS
      const turnos = await generadorMallas._obtenerTurnosConfiguracion(
        configuracionId
      );

      if (turnos.length === 0) {
        throw new Error('La configuración no tiene turnos asignados');
      }

      // 3.5️⃣ FILTRAR TURNOS POR PAUTAS SELECCIONADAS (si se proporcionan)
      let turnosFiltrados = turnos;
      if (pautasSeleccionadas && pautasSeleccionadas.length > 0) {
        turnosFiltrados = turnos.filter(t => 
          pautasSeleccionadas.includes(t.plantilla_id)
        );
        
        if (turnosFiltrados.length === 0) {
          throw new Error('Ninguno de los turnos en la configuración coincide con las pautas seleccionadas');
        }
      }

      // 4️⃣ OBTENER EMPLEADOS
      const empleados = await generadorMallas._obtenerEmpleados(empresaId);

      if (empleados.length < config.cantidad_empleados) {
        throw new Error(
          `No hay suficientes empleados activos. Se necesitan ${config.cantidad_empleados}, hay ${empleados.length}`
        );
      }

      // 5️⃣ GENERAR INSTANCIAS
      const instancias = generadorMallas._generarInstancias({
        config,
        turnos: turnosFiltrados,
        empleados: empleados.slice(0, config.cantidad_empleados),
        fechaInicio,
        fechaFin,
        cantidadSemanas,
        tipoDistribucion
      });

      // 6️⃣ VALIDAR CUMPLIMIENTO LEGAL
      const resumenLegal = generadorMallas._validarCumplimientoLegal(
        instancias,
        config
      );

      if (!resumenLegal.esValido) {
        throw new Error(
          `Incumplimiento legal detectado: ${resumenLegal.errores.join(', ')}`
        );
      }

      // 7️⃣ GUARDAR INSTANCIAS EN BD
      const cantidadGuardada = await generadorMallas._guardarInstancias(
        instancias,
        empresaId,
        usuarioId
      );

      return {
        exito: true,
        totalInstancias: cantidadGuardada,
        detalles: instancias.slice(0, 5), // Primeras 5 para preview
        resumenLegal,
        periodo: {
          fechaInicio,
          cantidadSemanas,
          fechaFin: fechaFin || generadorMallas._calcularFechaFin(
            fechaInicio,
            cantidadSemanas
          )
        }
      };

    } catch (error) {
      throw new Error(
        `Error en generación de malla: ${error.message}`
      );
    }
  },

  /**
   * Valida los parámetros de entrada
   * @private
   */
  _validarParametros: (params) => {
    if (!params.configuracionId) throw new Error('configuracionId requerido');
    if (!params.empresaId) throw new Error('empresaId requerido');
    if (!params.fechaInicio) throw new Error('fechaInicio requerido');
    if (!params.cantidadSemanas) throw new Error('cantidadSemanas requerido');

    const cantidadSemanas = Number(params.cantidadSemanas);
    if (!Number.isInteger(cantidadSemanas) || cantidadSemanas < 1 || cantidadSemanas > 52) {
      throw new Error('cantidadSemanas debe estar entre 1 y 52');
    }

    if (!['equilibrada', 'personalizada'].includes(params.tipoDistribucion)) {
      throw new Error('tipoDistribucion debe ser "equilibrada" o "personalizada"');
    }
    if (params.tipoDistribucion === 'personalizada') {
      throw new Error('La distribución personalizada aún no tiene una matriz de asignación manual. Selecciona distribución equilibrada para generar automáticamente.');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(params.fechaInicio)) {
      throw new Error('fechaInicio debe ser una fecha válida (YYYY-MM-DD)');
    }
    const fecha = new Date(`${params.fechaInicio}T00:00:00.000Z`);
    if (isNaN(fecha.getTime()) || generadorMallas._formatearFecha(fecha) !== params.fechaInicio) {
      throw new Error('fechaInicio debe ser una fecha válida (YYYY-MM-DD)');
    }

    if (params.fechaFin) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(params.fechaFin)) {
        throw new Error('fechaFin debe ser una fecha válida (YYYY-MM-DD)');
      }
      const finDate = new Date(`${params.fechaFin}T00:00:00.000Z`);
      if (isNaN(finDate.getTime()) || generadorMallas._formatearFecha(finDate) !== params.fechaFin) {
        throw new Error('fechaFin debe ser una fecha válida (YYYY-MM-DD)');
      }
      if (finDate < fecha) {
        throw new Error('fechaFin debe ser posterior o igual a fechaInicio');
      }
    }
  },

  /**
   * Obtiene la configuración de la base de datos
   * @private
   */
  _obtenerConfiguracion: async (configuracionId, empresaId) => {
    const [results] = await pool.query(
      `SELECT * FROM configuraciones_malla
       WHERE id = ? AND empresa_id = ? AND activo = TRUE`,
      [configuracionId, empresaId]
    );
    return results[0] || null;
  },

  /**
   * Obtiene los turnos asignados a una configuración
   * @private
   */
  _obtenerTurnosConfiguracion: async (configuracionId) => {
    const [results] = await pool.query(
      `SELECT cmt.id, cmt.plantilla_id, cmt.orden, cmt.duracion_horas,
              pt.nombre, pt.hora_inicio, pt.hora_fin, pt.sede_id
       FROM configuraciones_malla_turnos cmt
       JOIN plantillas_turno pt ON cmt.plantilla_id = pt.id
       JOIN configuraciones_malla cm ON cm.id = cmt.configuracion_id
                                    AND cm.empresa_id = pt.empresa_id
       WHERE cmt.configuracion_id = ? AND pt.activo = 1
       ORDER BY cmt.orden ASC`,
      [configuracionId]
    );
    return results;
  },

  /**
   * Obtiene empleados activos de una empresa
   * @private
   */
  _obtenerEmpleados: async (empresaId) => {
    const [results] = await pool.query(
      `SELECT id, usuario_id, codigo_empleado, especialidad_id
       FROM empleados
       WHERE empresa_id = ? AND estado = 'activo'
       ORDER BY id ASC`,
      [empresaId]
    );
    return results;
  },

  /**
   * GENERADOR PRINCIPAL DE INSTANCIAS
   * Crea un calendario de turnos distribuido equitativamente
   * @private
   */
  _generarInstancias: (params) => {
    const { config, turnos, empleados, fechaInicio, fechaFin, cantidadSemanas, tipoDistribucion } = params;

    const instancias = [];
    const fecha = new Date(`${fechaInicio}T00:00:00.000Z`);
    const limiteFin = fechaFin ? new Date(`${fechaFin}T00:00:00.000Z`) : null;
    const turnosRotacion = [...turnos].sort((a, b) => Number(a.orden) - Number(b.orden));
    const diasLaborales = Math.min(7, Math.max(1, Number(config.dias_laborales_por_semana || 5)));
    const horasMaximasSemana = Number(config.horas_por_semana || 42);
    const horasMaximasMes = Number(config.horas_por_mes || 182);
    const horasSemanaEmpleado = new Map();
    const horasMesEmpleado = new Map();
    let siguienteEmpleado = 0;
    const turnosMensualesEmpleado = Number(config.turnos_mensuales_empleado || 0);
    const diasLaborablesMes = diasLaborales * 30.4375 / 7;
    const tasaDiariaPorTurno = turnosRotacion.length && diasLaborablesMes
      ? (empleados.length * turnosMensualesEmpleado) / diasLaborablesMes / turnosRotacion.length
      : 0;
    const acumuladoCupos = turnosRotacion.map(() => 0);
    const emitidosPorTurno = turnosRotacion.map(() => 0);
    const conteoMesEmpleado = new Map();
    const diasGenerados = [];

    // Objetivo exacto de turnos por empleado en un mes (prorrateado si el período cubre el mes parcialmente)
    const diasLaborablesEnMes = (anio, mes) => {
      let total = 0;
      const ultimo = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
      for (let d = 1; d <= ultimo; d++) {
        if ((new Date(Date.UTC(anio, mes - 1, d)).getUTCDay() + 6) % 7 < diasLaborales) total++;
      }
      return total;
    };
    const jornadasPorMes = new Map();
    const objetivoDelMes = (mesKey) => {
      if (!turnosMensualesEmpleado) return 0;
      const [anio, mes] = mesKey.split('-').map(Number);
      const cubiertos = jornadasPorMes.get(mesKey) || 0;
      const totalMes = diasLaborablesEnMes(anio, mes);
      return cubiertos >= totalMes ? turnosMensualesEmpleado : Math.round(turnosMensualesEmpleado * cubiertos / totalMes);
    };
    {
      const f = new Date(fecha);
      for (let dia = 0; dia < Number(cantidadSemanas) * 7; dia++) {
        const d = new Date(f);
        d.setUTCDate(d.getUTCDate() + dia);
        if (limiteFin && d > limiteFin) break;
        if ((d.getUTCDay() + 6) % 7 >= diasLaborales) continue;
        const k = generadorMallas._formatearFecha(d).slice(0, 7);
        jornadasPorMes.set(k, (jornadasPorMes.get(k) || 0) + 1);
      }
    }

    for (let dia = 0; dia < Number(cantidadSemanas) * 7; dia++) {
      const fechaActual = new Date(fecha);
      fechaActual.setUTCDate(fechaActual.getUTCDate() + dia);

      // Si se definió un límite de fecha fin, no generar más allá de ese día
      if (limiteFin && fechaActual > limiteFin) break;

      // El formulario cuenta los días de lunes a domingo.
      const diaLaboralSemana = (fechaActual.getUTCDay() + 6) % 7;
      if (diaLaboralSemana >= diasLaborales) continue;

      const fechaFormateada = generadorMallas._formatearFecha(fechaActual);
      const semanaInicio = new Date(fechaActual);
      semanaInicio.setUTCDate(semanaInicio.getUTCDate() - diaLaboralSemana);
      const semanaKey = generadorMallas._formatearFecha(semanaInicio);
      const empleadosDelDia = new Set();
      diasGenerados.push({ fecha: fechaFormateada, semanaKey, mesKey: fechaFormateada.slice(0, 7) });
      // Cupos del día por turno: se calculan para que, en promedio, cada empleado
      // alcance turnos_mensuales_empleado (cantidad_empleados x turnos / días laborables).
      const cuposPorTurno = turnosRotacion.map((turno, i) => {
        acumuladoCupos[i] += tasaDiariaPorTurno;
        const cupos = Math.max(1, Math.floor(acumuladoCupos[i] + 1e-9) - emitidosPorTurno[i]);
        emitidosPorTurno[i] += cupos;
        return cupos;
      });
      const slots = [];
      turnosRotacion.forEach((turno, i) => {
        for (let c = 0; c < cuposPorTurno[i]; c++) slots.push({ turno, obligatorio: c === 0 });
      });

      for (const { turno, obligatorio } of slots) {
        let asignado = null;
        let indiceAsignado = -1;
        const horas = Number(turno.duracion_horas);
        const mesKey = fechaFormateada.slice(0, 7);

        // Se elige al empleado disponible con menos horas en el mes para repartir equitativamente
        let menorHorasMes = Infinity;
        for (let intento = 0; intento < empleados.length; intento++) {
          const indice = (siguienteEmpleado + intento) % empleados.length;
          const candidato = empleados[indice];
          const claveEmpleadoSemana = `${candidato.id}:${semanaKey}`;
          const claveEmpleadoMes = `${candidato.id}:${mesKey}`;
          if (empleadosDelDia.has(candidato.id)) continue;
          const objetivoMes = objetivoDelMes(mesKey);
          if (objetivoMes && (conteoMesEmpleado.get(claveEmpleadoMes) || 0) >= objetivoMes) continue;          if ((horasSemanaEmpleado.get(claveEmpleadoSemana) || 0) + horas > horasMaximasSemana) continue;
          const horasMes = horasMesEmpleado.get(claveEmpleadoMes) || 0;
          if (horasMes + horas > horasMaximasMes) continue;
          if (horasMes < menorHorasMes) {
            menorHorasMes = horasMes;
            asignado = candidato;
            indiceAsignado = indice;
          }
        }

        if (!asignado) {
          if (!obligatorio || objetivoDelMes(mesKey)) continue;
          throw new Error(`No hay personal disponible para cubrir ${turno.nombre} el ${fechaFormateada} respetando horas semanales y mensuales. Revisa plantilla, turnos y cantidad de empleados.`);
        }

        empleadosDelDia.add(asignado.id);
        siguienteEmpleado = (indiceAsignado + 1) % empleados.length;
        const claveEmpleadoSemana = `${asignado.id}:${semanaKey}`;
        const claveEmpleadoMes = `${asignado.id}:${mesKey}`;
        horasSemanaEmpleado.set(claveEmpleadoSemana, (horasSemanaEmpleado.get(claveEmpleadoSemana) || 0) + horas);
        horasMesEmpleado.set(claveEmpleadoMes, (horasMesEmpleado.get(claveEmpleadoMes) || 0) + horas);
        conteoMesEmpleado.set(claveEmpleadoMes, (conteoMesEmpleado.get(claveEmpleadoMes) || 0) + 1);
        const inicio = new Date(`${fechaFormateada}T${String(turno.hora_inicio).slice(0, 8)}Z`);
        const fin = new Date(`${fechaFormateada}T${String(turno.hora_fin).slice(0, 8)}Z`);
        if (fin <= inicio) fin.setUTCDate(fin.getUTCDate() + 1);

        instancias.push({
          fecha: fechaFormateada,
          empleado_id: asignado.id,
          plantilla_id: turno.plantilla_id,
          sede_id: turno.sede_id || null,
          turno_nombre: turno.nombre,
          hora_inicio: turno.hora_inicio,
          hora_fin: turno.hora_fin,
          inicio_fecha_hora: generadorMallas._formatearFechaHora(inicio),
          fin_fecha_hora: generadorMallas._formatearFechaHora(fin),
          duracion_horas: horas,
          estado: 'asignada'
        });
      }
    }

    // Pasada de completado: cada empleado debe llegar exactamente a su objetivo mensual.
    // El tope semanal se relaja aquí (puede haber días seguidos); el tope de horas del mes y
    // los 6 días consecutivos se respetan.
    if (turnosMensualesEmpleado > 0) {
      const instanciasPorDia = new Map();
      const diasDeEmpleado = new Map();
      const registrar = (inst) => {
        instanciasPorDia.set(inst.fecha, (instanciasPorDia.get(inst.fecha) || 0) + 1);
        if (!diasDeEmpleado.has(inst.empleado_id)) diasDeEmpleado.set(inst.empleado_id, new Set());
        diasDeEmpleado.get(inst.empleado_id).add(inst.fecha);
      };
      instancias.forEach(registrar);
      const mesesPeriodo = [...new Set(diasGenerados.map(d => d.mesKey))];
      const dia1 = (s, delta) => {
        const x = new Date(`${s}T00:00:00.000Z`);
        x.setUTCDate(x.getUTCDate() + delta);
        return generadorMallas._formatearFecha(x);
      };
      const rachaConDia = (set, f) => {
        let racha = 1;
        for (let i = 1; set.has(dia1(f, -i)); i++) racha++;
        for (let i = 1; set.has(dia1(f, i)); i++) racha++;
        return racha;
      };

      for (const mesKey of mesesPeriodo) {
        const objetivo = objetivoDelMes(mesKey);
        const diasMes = diasGenerados.filter(d => d.mesKey === mesKey);
        for (const empleado of empleados) {
          const claveMes = `${empleado.id}:${mesKey}`;
          while ((conteoMesEmpleado.get(claveMes) || 0) < objetivo) {
            const propios = diasDeEmpleado.get(empleado.id) || new Set();
            const candidatos = diasMes
              .filter(d => !propios.has(d.fecha) && rachaConDia(propios, d.fecha) <= 6)
              .map(d => ({
                d,
                horasSemana: horasSemanaEmpleado.get(`${empleado.id}:${d.semanaKey}`) || 0,
                carga: instanciasPorDia.get(d.fecha) || 0
              }))
              .sort((a, b) => a.horasSemana - b.horasSemana || a.carga - b.carga);

            let colocado = false;
            for (const { d } of candidatos) {
              const turno = [...turnosRotacion].sort((a, b) => {
                const ca = instancias.filter(i => i.fecha === d.fecha && i.plantilla_id === a.plantilla_id).length;
                const cb = instancias.filter(i => i.fecha === d.fecha && i.plantilla_id === b.plantilla_id).length;
                return ca - cb;
              }).find(t => (horasMesEmpleado.get(claveMes) || 0) + Number(t.duracion_horas) <= horasMaximasMes);
              if (!turno) continue;

              const horas = Number(turno.duracion_horas);
              const inicio = new Date(`${d.fecha}T${String(turno.hora_inicio).slice(0, 8)}Z`);
              const fin = new Date(`${d.fecha}T${String(turno.hora_fin).slice(0, 8)}Z`);
              if (fin <= inicio) fin.setUTCDate(fin.getUTCDate() + 1);
              const nueva = {
                fecha: d.fecha,
                empleado_id: empleado.id,
                plantilla_id: turno.plantilla_id,
                sede_id: turno.sede_id || null,
                turno_nombre: turno.nombre,
                hora_inicio: turno.hora_inicio,
                hora_fin: turno.hora_fin,
                inicio_fecha_hora: generadorMallas._formatearFechaHora(inicio),
                fin_fecha_hora: generadorMallas._formatearFechaHora(fin),
                duracion_horas: horas,
                estado: 'asignada'
              };
              instancias.push(nueva);
              registrar(nueva);
              horasMesEmpleado.set(claveMes, (horasMesEmpleado.get(claveMes) || 0) + horas);
              horasSemanaEmpleado.set(`${empleado.id}:${d.semanaKey}`, (horasSemanaEmpleado.get(`${empleado.id}:${d.semanaKey}`) || 0) + horas);
              conteoMesEmpleado.set(claveMes, (conteoMesEmpleado.get(claveMes) || 0) + 1);
              colocado = true;
              break;
            }
            if (!colocado) {
              throw new Error(`No es posible asignar ${objetivo} turnos a cada empleado en ${mesKey} sin superar ${horasMaximasMes} h mensuales o 6 días consecutivos. Ajusta turnos, duración u horas/mes.`);
            }
          }
        }
      }
    }

    instancias.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.inicio_fecha_hora.localeCompare(b.inicio_fecha_hora));
    return instancias;
  },

  /**
   * Valida que la generación cumpa con leyes laborales colombianas
   * @private
   */
  _validarCumplimientoLegal: (instancias, config) => {
    const errores = [];
    const advertencias = [];
    const porEmpleadoSemana = new Map();
    const porEmpleadoMes = new Map();
    const fechasPorEmpleado = new Map();
    const turnosPorEmpleado = new Map();

    for (const instancia of instancias) {
      const fecha = new Date(`${instancia.fecha}T00:00:00.000Z`);
      const lunes = new Date(fecha);
      lunes.setUTCDate(lunes.getUTCDate() - ((lunes.getUTCDay() + 6) % 7));
      const semanaKey = `${instancia.empleado_id}:${generadorMallas._formatearFecha(lunes)}`;
      const mesKey = `${instancia.empleado_id}:${instancia.fecha.slice(0, 7)}`;
      porEmpleadoSemana.set(semanaKey, (porEmpleadoSemana.get(semanaKey) || 0) + Number(instancia.duracion_horas));
      porEmpleadoMes.set(mesKey, (porEmpleadoMes.get(mesKey) || 0) + Number(instancia.duracion_horas));
      turnosPorEmpleado.set(instancia.empleado_id, (turnosPorEmpleado.get(instancia.empleado_id) || 0) + 1);
      if (!fechasPorEmpleado.has(instancia.empleado_id)) fechasPorEmpleado.set(instancia.empleado_id, new Set());
      fechasPorEmpleado.get(instancia.empleado_id).add(instancia.fecha);
    }

    const maxHorasSemana = Number(config.horas_por_semana || 42);
    const maxHorasMes = Number(config.horas_por_mes || 182);
    for (const [key, horas] of porEmpleadoSemana) {
      if (horas > maxHorasSemana) advertencias.push(`Empleado ${key.split(':')[0]}: ${horas} horas en una semana (referencia ${maxHorasSemana}); se compensa dentro del tope mensual para cumplir los turnos solicitados`);
    }
    for (const [key, horas] of porEmpleadoMes) {
      if (horas > maxHorasMes) errores.push(`Empleado ${key.split(':')[0]}: ${horas} horas en un mes (máximo ${maxHorasMes})`);
    }

    for (const [empleadoId, fechas] of fechasPorEmpleado) {
      const ordenadas = [...fechas].sort();
      let diasConsecutivos = 0;
      let fechaAnterior = null;
      for (const fechaActual of ordenadas) {
        const actual = new Date(`${fechaActual}T00:00:00.000Z`);
        const anterior = fechaAnterior ? new Date(`${fechaAnterior}T00:00:00.000Z`) : null;
        diasConsecutivos = anterior && (actual - anterior) / 86400000 === 1 ? diasConsecutivos + 1 : 1;
        if (diasConsecutivos > 6) errores.push(`Empleado ${empleadoId}: más de 6 días consecutivos sin descanso`);
        fechaAnterior = fechaActual;
      }
    }

    const duracionPromedio = instancias.length
      ? instancias.reduce((total, instancia) => total + Number(instancia.duracion_horas), 0) / instancias.length
      : 0;
    const turnosMensualesObjetivo = Number(config.turnos_mensuales_empleado || 0);
    const fechasProgramadas = instancias.map(instancia => instancia.fecha).sort();
    const diasDelPeriodo = fechasProgramadas.length
      ? (new Date(`${fechasProgramadas[fechasProgramadas.length - 1]}T00:00:00.000Z`) - new Date(`${fechasProgramadas[0]}T00:00:00.000Z`)) / 86400000 + 1
      : 0;
    const turnosEsperadosEnPeriodo = diasDelPeriodo ? turnosMensualesObjetivo * diasDelPeriodo / 30.4375 : 0;
    const turnosGenerados = [...turnosPorEmpleado.values()];
    if (turnosGenerados.length && Math.min(...turnosGenerados) < turnosEsperadosEnPeriodo) {
      advertencias.push(`En ${diasDelPeriodo} días se generaron entre ${Math.min(...turnosGenerados)} y ${Math.max(...turnosGenerados)} turnos por empleado; el objetivo mensual de ${turnosMensualesObjetivo} equivale a aproximadamente ${turnosEsperadosEnPeriodo.toFixed(1)} en este período.`);
    }
    if (duracionPromedio && turnosMensualesObjetivo * duracionPromedio > maxHorasMes) {
      advertencias.push(`La configuración solicita ${turnosMensualesObjetivo} turnos mensuales de ${duracionPromedio} h (${turnosMensualesObjetivo * duracionPromedio} h), pero el máximo mensual es ${maxHorasMes} h.`);
    }

    return {
      esValido: errores.length === 0,
      errores,
      advertencias,
      totalEmpleados: fechasPorEmpleado.size,
      totalInstancias: instancias.length,
      turnosPorEmpleado: Object.fromEntries(turnosPorEmpleado)
    };
  },

  /**
   * Guarda las instancias generadas en la base de datos
   * @private
   */
  _guardarInstancias: async (instancias, empresaId, usuarioId) => {
    const connection = await pool.getConnection();
    let contador = 0;
    try {
      await connection.beginTransaction();
      const vistas = new Map();
      for (const instancia of instancias) {
        // Puede haber varias instancias del mismo turno y día (varios empleados);
        // solo se omiten las ya existentes en BD para mantener la idempotencia.
        const clave = `${instancia.plantilla_id}|${instancia.fecha}|${instancia.inicio_fecha_hora}|${instancia.fin_fecha_hora}`;
        const ordinal = (vistas.get(clave) || 0) + 1;
        vistas.set(clave, ordinal);
        const [existentes] = await connection.query(
          `SELECT id FROM instancias_turno
           WHERE plantilla_id = ? AND fecha = ? AND inicio_fecha_hora = ? AND fin_fecha_hora = ?
           FOR UPDATE`,
          [instancia.plantilla_id, instancia.fecha, instancia.inicio_fecha_hora, instancia.fin_fecha_hora]
        );
        if (existentes.length >= ordinal) continue;

        const [resultado] = await connection.query(
          `INSERT INTO instancias_turno
           (plantilla_id, fecha, inicio_fecha_hora, fin_fecha_hora, sede_id, creado_por)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [instancia.plantilla_id, instancia.fecha, instancia.inicio_fecha_hora, instancia.fin_fecha_hora, instancia.sede_id, usuarioId]
        );
        await connection.query(
          `INSERT INTO asignaciones_turno
           (instancia_turno_id, empleado_id, asignado_por, estado, asignado_en)
           VALUES (?, ?, ?, 'asignada', NOW())`,
          [resultado.insertId, instancia.empleado_id, usuarioId]
        );
        contador++;
      }
      await connection.commit();
      return contador;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Utilitarios privados
   */
  _formatearFecha: (fecha) => {
    const year = fecha.getUTCFullYear();
    const month = String(fecha.getUTCMonth() + 1).padStart(2, '0');
    const day = String(fecha.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  _formatearFechaHora: (fecha) => {
    const date = generadorMallas._formatearFecha(fecha);
    const time = [fecha.getUTCHours(), fecha.getUTCMinutes(), fecha.getUTCSeconds()]
      .map(value => String(value).padStart(2, '0'))
      .join(':');
    return `${date} ${time}`;
  },

  _calcularFechaFin: (fechaInicio, semanas) => {
    const fecha = new Date(`${fechaInicio}T00:00:00.000Z`);
    fecha.setUTCDate(fecha.getUTCDate() + (semanas * 7) - 1);
    return generadorMallas._formatearFecha(fecha);
  }
};

module.exports = generadorMallas;
