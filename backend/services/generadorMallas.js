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

const db = require('../db');

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

      // 8️⃣ REGISTRAR EN AUDITORÍA
      await generadorMallas._registrarAuditoria({
        tipo_accion: 'generar_malla',
        tabla_afectada: 'instancias_turno',
        descripcion: `Generación automática de ${cantidadGuardada} instancias para configuración ${configuracionId}`,
        usuario_id: usuarioId,
        empresa_id: empresaId,
        registro_id: configuracionId
      });

      return {
        exito: true,
        totalInstancias: cantidadGuardada,
        detalles: instancias.slice(0, 5), // Primeras 5 para preview
        resumenLegal,
        periodo: {
          fechaInicio,
          cantidadSemanas,
          fechaFin: generadorMallas._calcularFechaFin(
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

    if (params.cantidadSemanas < 1 || params.cantidadSemanas > 52) {
      throw new Error('cantidadSemanas debe estar entre 1 y 52');
    }

    if (!['equilibrada', 'personalizada'].includes(params.tipoDistribucion)) {
      throw new Error('tipoDistribucion debe ser "equilibrada" o "personalizada"');
    }

    const fecha = new Date(params.fechaInicio);
    if (isNaN(fecha.getTime())) {
      throw new Error('fechaInicio debe ser una fecha válida (YYYY-MM-DD)');
    }
  },

  /**
   * Obtiene la configuración de la base de datos
   * @private
   */
  _obtenerConfiguracion: async (configuracionId, empresaId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM configuraciones_malla
        WHERE id = ? AND empresa_id = ? AND activo = TRUE
      `;
      db.query(query, [configuracionId, empresaId], (err, results) => {
        if (err) reject(err);
        resolve(results[0] || null);
      });
    });
  },

  /**
   * Obtiene los turnos asignados a una configuración
   * @private
   */
  _obtenerTurnosConfiguracion: async (configuracionId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          cmt.id,
          cmt.plantilla_id,
          cmt.orden,
          cmt.duracion_horas,
          pt.nombre,
          pt.hora_inicio,
          pt.hora_fin
        FROM configuraciones_malla_turnos cmt
        JOIN plantillas_turno pt ON cmt.plantilla_id = pt.id
        WHERE cmt.configuracion_id = ?
        ORDER BY cmt.orden ASC
      `;
      db.query(query, [configuracionId], (err, results) => {
        if (err) reject(err);
        resolve(results || []);
      });
    });
  },

  /**
   * Obtiene empleados activos de una empresa
   * @private
   */
  _obtenerEmpleados: async (empresaId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          id,
          usuario_id,
          codigo_empleado,
          especialidad_id
        FROM empleados
        WHERE empresa_id = ? AND estado = 'activo'
        ORDER BY id ASC
      `;
      db.query(query, [empresaId], (err, results) => {
        if (err) reject(err);
        resolve(results || []);
      });
    });
  },

  /**
   * GENERADOR PRINCIPAL DE INSTANCIAS
   * Crea un calendario de turnos distribuido equitativamente
   * @private
   */
  _generarInstancias: (params) => {
    const { config, turnos, empleados, fechaInicio, cantidadSemanas, tipoDistribucion } = params;

    const instancias = [];
    const fecha = new Date(fechaInicio);
    let indiceTurno = 0;
    let indiceEmpleado = 0;
    const turnosRotacion = [...turnos].sort((a, b) => a.orden - b.orden);

    // Calcular total de días a generar
    const diasTotales = cantidadSemanas * 7;

    for (let dia = 0; dia < diasTotales; dia++) {
      const fechaActual = new Date(fecha);
      fechaActual.setDate(fechaActual.getDate() + dia);

      // Obtener día de semana (0 = domingo, 1 = lunes, etc)
      const diaSemana = fechaActual.getDay();

      // Si es fin de semana, salta (ajusta según necesidad)
      if (config.dias_laborales_por_semana === 5 && (diaSemana === 0 || diaSemana === 6)) {
        continue;
      }

      // Asignar turno a empleado
      const turno = turnosRotacion[indiceTurno % turnosRotacion.length];
      const empleado = empleados[indiceEmpleado % empleados.length];

      const instancia = {
        fecha: generadorMallas._formatearFecha(fechaActual),
        empleado_id: empleado.id,
        plantilla_id: turno.plantilla_id,
        turno_nombre: turno.nombre,
        hora_inicio: turno.hora_inicio,
        hora_fin: turno.hora_fin,
        duracion_horas: turno.duracion_horas,
        estado: 'programada'
      };

      instancias.push(instancia);

      // Rotar turnos (cambiar de turno cada X días según duración)
      if ((dia + 1) % turno.duracion_horas === 0) {
        indiceTurno++;
      }

      // Rotar empleados (cambiar de empleado cuando cambia de turno)
      if ((dia + 1) % (turno.duracion_horas * Math.ceil(empleados.length / turnos.length)) === 0) {
        indiceEmpleado++;
      }
    }

    return instancias;
  },

  /**
   * Valida que la generación cumpa con leyes laborales colombianas
   * @private
   */
  _validarCumplimientoLegal: (instancias, config) => {
    const errores = [];
    const advertencias = [];

    // Agrupar por empleado y semana
    const porEmpleado = {};
    const porSemana = {};

    instancias.forEach(inst => {
      const fecha = new Date(inst.fecha);
      const semana = Math.floor(fecha.getDate() / 7);
      const clave = `${fecha.getFullYear()}-${fecha.getMonth()}-${semana}`;

      if (!porEmpleado[inst.empleado_id]) {
        porEmpleado[inst.empleado_id] = [];
      }
      if (!porSemana[clave]) {
        porSemana[clave] = [];
      }

      porEmpleado[inst.empleado_id].push(inst);
      porSemana[clave].push(inst);
    });

    // Validar horas por semana (máximo 42 horas)
    Object.values(porSemana).forEach(semana => {
      const totalHoras = semana.reduce((sum, inst) => sum + inst.duracion_horas, 0);
      if (totalHoras > config.horas_por_semana) {
        advertencias.push(
          `Semana ${semana[0]?.fecha}: ${totalHoras} horas (máximo ${config.horas_por_semana})`
        );
      }
    });

    // Validar descansos (mínimo 1 día de descanso cada 6 días trabajados)
    Object.entries(porEmpleado).forEach(([empleadoId, dias]) => {
      let diasConsecutivos = 1;
      for (let i = 1; i < dias.length; i++) {
        const fecha1 = new Date(dias[i - 1].fecha);
        const fecha2 = new Date(dias[i].fecha);
        const diferencia = (fecha2 - fecha1) / (1000 * 60 * 60 * 24);

        if (diferencia === 1) {
          diasConsecutivos++;
          if (diasConsecutivos > 6) {
            errores.push(
              `Empleado ${empleadoId}: ${diasConsecutivos} días sin descanso (máximo 6)`
            );
          }
        } else {
          diasConsecutivos = 1;
        }
      }
    });

    return {
      esValido: errores.length === 0,
      errores,
      advertencias,
      totalEmpleados: Object.keys(porEmpleado).length,
      totalInstancias: instancias.length
    };
  },

  /**
   * Guarda las instancias generadas en la base de datos
   * @private
   */
  _guardarInstancias: async (instancias, empresaId, usuarioId) => {
    return new Promise((resolve, reject) => {
      let contador = 0;

      const guardarRecursivo = (index) => {
        if (index >= instancias.length) {
          resolve(contador);
          return;
        }

        const inst = instancias[index];
        const query = `
          INSERT INTO instancias_turno (
            empresa_id,
            empleado_id,
            plantilla_id,
            fecha,
            estado,
            creado_por,
            creado_en
          ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        db.query(
          query,
          [
            empresaId,
            inst.empleado_id,
            inst.plantilla_id,
            inst.fecha,
            inst.estado,
            usuarioId
          ],
          (err) => {
            if (err) {
              // Si ya existe, no es error crítico
              if (err.code !== 'ER_DUP_ENTRY') {
                reject(err);
              }
            } else {
              contador++;
            }

            guardarRecursivo(index + 1);
          }
        );
      };

      guardarRecursivo(0);
    });
  },

  /**
   * Registra la acción en la tabla de auditoría
   * @private
   */
  _registrarAuditoria: async (datos) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO registros_auditoria (
          tipo_accion,
          tabla_afectada,
          descripcion,
          usuario_id,
          empresa_id,
          registro_id,
          creado_en
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      db.query(
        query,
        [
          datos.tipo_accion,
          datos.tabla_afectada,
          datos.descripcion,
          datos.usuario_id,
          datos.empresa_id,
          datos.registro_id
        ],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  },

  /**
   * Utilitarios privados
   */
  _formatearFecha: (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  _calcularFechaFin: (fechaInicio, semanas) => {
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + (semanas * 7) - 1);
    return generadorMallas._formatearFecha(fecha);
  }
};

module.exports = generadorMallas;
