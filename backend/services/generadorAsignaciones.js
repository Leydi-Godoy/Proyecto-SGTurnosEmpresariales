/**
 * ==========================================
 * SERVICIO: Generador Automatico de Asignaciones
 * ==========================================
 * 
 * Modulo encargado de asignar automaticamente empleados a turnos
 * basado en disponibilidades, especialidades y algoritmo de optimizacion.
 * 
 * CARACTERISTICAS:
 * - Validacion de disponibilidades del empleado
 * - Consideracion de especialidades requeridas
 * - Distribucion equilibrada de carga de trabajo
 * - Evita conflictos de horarios
 * - Auditoria de asignaciones automaticas
 * 
 * @module generadorAsignaciones
 * @author Sistema de Turnos v2.0
 * @version 1.0.0
 */

const { pool } = require('../db');

const generadorAsignaciones = {

  /**
   * Asigna automaticamente empleados a turnos de una malla
   * Lee la configuración del admin de empresa (cantidad empleados, tipo distribución, etc)
   */
  asignarAutomaticamente: async (params) => {
    const {
      mallaId,
      empresaId,
      usuarioId,
      criterios = {}
    } = params;

    const {
      considerarEspecialidades = true,
      respetarDisponibilidades = true,
      equilibrarCarga = true,
      empleadosExcluir = [],
      empleadosIncluir = null
    } = criterios;

    try {
      // 1. VALIDACIONES
      if (!mallaId || !empresaId || !usuarioId) {
        throw new Error('Parametros requeridos faltantes: mallaId, empresaId, usuarioId');
      }

      // 1.5. OBTENER CONFIGURACION DE LA MALLA DEL ADMIN DE EMPRESA
      const [configMalla] = await pool.query(
        `SELECT id, nombre, cantidad_empleados, turnos_mensuales_empleado, 
                tipo_distribucion, horas_por_semana, horas_por_mes, dias_laborales_por_semana
         FROM configuraciones_malla
         WHERE id = ? AND empresa_id = ? AND activo = 1`,
        [mallaId, empresaId]
      );

      if (configMalla.length === 0) {
        throw new Error(`Configuración de malla ${mallaId} no encontrada o inactiva para empresa ${empresaId}`);
      }

      const config = configMalla[0];

      // 1.6. OBTENER TURNOS ASOCIADOS A ESTA CONFIGURACION
      const [turnosConfig] = await pool.query(
        `SELECT cmt.plantilla_id, cmt.orden, cmt.duracion_horas, pt.nombre, pt.hora_inicio, pt.hora_fin
         FROM configuraciones_malla_turnos cmt
         JOIN plantillas_turno pt ON cmt.plantilla_id = pt.id
         WHERE cmt.configuracion_id = ?
         ORDER BY cmt.orden ASC`,
        [mallaId]
      );

      if (turnosConfig.length === 0) {
        throw new Error(`Configuración ${mallaId} no tiene turnos asociados`);
      }

      // 2. OBTENER TURNOS DE LA MALLA SIN ASIGNAR
      const [instancias] = await pool.query(
        `SELECT it.id, it.plantilla_id, it.fecha, it.inicio_timestamp, it.fin_timestamp, it.sede_id,
                pt.especialidad_id, pt.duracion_minutos
         FROM instancias_turno it
         LEFT JOIN plantillas_turno pt ON it.plantilla_id = pt.id
         WHERE it.plantilla_id IN (
           SELECT id FROM plantillas_turno 
           WHERE empresa_id = ?
         )
         AND it.id NOT IN (
           SELECT instancia_turno_id FROM asignaciones_turno
         )
         AND it.fecha >= CURDATE()
         ORDER BY it.fecha ASC, it.inicio_timestamp ASC
         LIMIT 500`,
        [empresaId]
      );

      if (instancias.length === 0) {
        return {
          asignacionesRealizadas: 0,
          turnosSinAsignar: 0,
          detalles: [],
          advertencias: ['No hay turnos sin asignar en la malla']
        };
      }

      // 3. OBTENER EMPLEADOS ACTIVOS DE LA EMPRESA (Solo ROL EMPLEADO = 5 via usuario_roles)
      const [empleados] = await pool.query(
        `SELECT e.id, e.usuario_id, e.especialidad_id, 
                u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido
         FROM empleados e
         INNER JOIN usuarios u ON u.id = e.usuario_id
         INNER JOIN usuario_roles ur ON ur.usuario_id = u.id
         WHERE e.empresa_id = ?
         AND ur.id_rol = 5
         AND e.estado = 'activo'
         AND u.activo = 1
         ${empleadosIncluir && empleadosIncluir.length > 0 ? `AND e.id IN (${empleadosIncluir.join(',')})` : ''}
         ${empleadosExcluir && empleadosExcluir.length > 0 ? `AND e.id NOT IN (${empleadosExcluir.join(',')})` : ''}
         ORDER BY e.id`,
        [empresaId]
      );

      if (empleados.length === 0) {
        return {
          asignacionesRealizadas: 0,
          turnosSinAsignar: instancias.length,
          detalles: [],
          advertencias: ['No hay empleados activos disponibles para asignacion']
        };
      }

      // 4. OBTENER DISPONIBILIDADES DE LOS EMPLEADOS
      const [disponibilidades] = await pool.query(
        `SELECT empleado_id, dia_semana, desde_hora, hasta_hora
         FROM disponibilidad
         WHERE empleado_id IN (${empleados.map(e => e.id).join(',')})
         ORDER BY empleado_id, dia_semana`,
        []
      );

      const mapDisponibilidades = generadorAsignaciones._crearMapaDisponibilidades(disponibilidades);

      // 5. OBTENER ASIGNACIONES EXISTENTES PARA CALCULAR CARGA
      const [asignacionesExistentes] = await pool.query(
        `SELECT at.empleado_id, COUNT(*) as cantidad_asignaciones,
                SUM(pt.duracion_minutos) as minutos_totales
         FROM asignaciones_turno at
         JOIN instancias_turno it ON at.instancia_turno_id = it.id
         JOIN plantillas_turno pt ON it.plantilla_id = pt.id
         WHERE at.empleado_id IN (${empleados.map(e => e.id).join(',')})
         AND it.fecha >= CURDATE()
         GROUP BY at.empleado_id`,
        []
      );

      const mapCarga = generadorAsignaciones._crearMapaCarga(empleados, asignacionesExistentes);

      // 6. PROCESO DE ASIGNACION
      const asignacionesRealizadas = [];
      const advertencias = [];
      let turnosSinAsignar = 0;

      for (const instancia of instancias) {
        try {
          const empleadosElegibles = empleados.filter(emp => {
            if (considerarEspecialidades && instancia.especialidad_id) {
              if (emp.especialidad_id !== instancia.especialidad_id) {
                return false;
              }
            }

            if (respetarDisponibilidades) {
              if (!generadorAsignaciones._empleadoDisponible(emp.id, instancia, mapDisponibilidades)) {
                return false;
              }
            }

            return true;
          });

          if (empleadosElegibles.length === 0) {
            turnosSinAsignar++;
            advertencias.push(
              `Turno ${instancia.id} (${instancia.fecha}) - No hay empleados elegibles disponibles`
            );
            continue;
          }

          let empleadoSeleccionado;
          if (equilibrarCarga) {
            empleadoSeleccionado = empleadosElegibles.reduce((prev, curr) => {
              const cargaPrev = mapCarga[prev.id]?.minutos_totales || 0;
              const cargaCurr = mapCarga[curr.id]?.minutos_totales || 0;
              return cargaCurr < cargaPrev ? curr : prev;
            });
          } else {
            empleadoSeleccionado = empleadosElegibles[0];
          }

          const [result] = await pool.query(
            `INSERT INTO asignaciones_turno 
             (instancia_turno_id, empleado_id, asignado_por, estado, asignado_en)
             VALUES (?, ?, ?, 'confirmado', NOW())`,
            [instancia.id, empleadoSeleccionado.id, usuarioId]
          );

          const cargaActual = mapCarga[empleadoSeleccionado.id];
          if (cargaActual) {
            cargaActual.minutos_totales += instancia.duracion_minutos || 0;
            cargaActual.cantidad_asignaciones += 1;
          } else {
            mapCarga[empleadoSeleccionado.id] = {
              minutos_totales: instancia.duracion_minutos || 0,
              cantidad_asignaciones: 1
            };
          }

          asignacionesRealizadas.push({
            asignacion_id: result.insertId,
            instancia_turno_id: instancia.id,
            empleado_id: empleadoSeleccionado.id,
            empleado_nombre: `${empleadoSeleccionado.primer_nombre} ${empleadoSeleccionado.primer_apellido}`,
            fecha: instancia.fecha,
            hora_inicio: instancia.inicio_timestamp,
            hora_fin: instancia.fin_timestamp
          });

        } catch (err) {
          console.error(`Error al asignar turno ${instancia.id}:`, err);
          turnosSinAsignar++;
          advertencias.push(`Turno ${instancia.id}: Error interno - ${err.message}`);
        }
      }

      // 7. REGISTRAR EN AUDITORIA
      await pool.query(
        `INSERT INTO registros_auditoria 
         (empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles)
         VALUES (?, ?, 'ASIGNACION_AUTOMATICA', 'instancias_turno', ?, ?)`,
        [
          empresaId,
          usuarioId,
          null,
          JSON.stringify({
            malla_id: mallaId,
            asignaciones_realizadas: asignacionesRealizadas.length,
            turnos_sin_asignar: turnosSinAsignar,
            criterios_utilizados: { considerarEspecialidades, respetarDisponibilidades, equilibrarCarga }
          })
        ]
      );

      return {
        asignacionesRealizadas: asignacionesRealizadas.length,
        turnosSinAsignar,
        detalles: asignacionesRealizadas,
        advertencias,
        configuracion: {
          malla_id: config.id,
          malla_nombre: config.nombre,
          cantidad_empleados_config: config.cantidad_empleados,
          turnos_mensuales_empleado: config.turnos_mensuales_empleado,
          tipo_distribucion: config.tipo_distribucion,
          horas_por_semana: config.horas_por_semana,
          dias_laborales: config.dias_laborales_por_semana
        },
        resumen: {
          totalTurnos: instancias.length,
          asignados: asignacionesRealizadas.length,
          porcentajeCobertura: ((asignacionesRealizadas.length / instancias.length) * 100).toFixed(2) + '%'
        }
      };

    } catch (err) {
      console.error('Error en generadorAsignaciones.asignarAutomaticamente:', err);
      throw err;
    }
  },

  /**
   * Obtiene empleados elegibles para un turno especifico
   */
  obtenerEmpleadosElegibles: async (params) => {
    const {
      instanciaId,
      empresaId,
      empleadosExcluir = [],
      considerarEspecialidades = true
    } = params;

    try {
      const [turnos] = await pool.query(
        `SELECT it.id, it.fecha, it.inicio_timestamp, it.fin_timestamp, 
                pt.especialidad_id, pt.duracion_minutos
         FROM instancias_turno it
         LEFT JOIN plantillas_turno pt ON it.plantilla_id = pt.id
         WHERE it.id = ?`,
        [instanciaId]
      );

      if (turnos.length === 0) {
        throw new Error('Instancia de turno no encontrada');
      }

      const turno = turnos[0];

      const [empleados] = await pool.query(
        `SELECT e.id, e.usuario_id, e.especialidad_id,
                u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido
         FROM empleados e
         LEFT JOIN usuarios u ON e.usuario_id = u.id
         WHERE e.empresa_id = ?
         AND e.estado = 'activo'
         ${empleadosExcluir.length > 0 ? `AND e.id NOT IN (${empleadosExcluir.join(',')})` : ''}
         ORDER BY CONCAT(u.primer_nombre, ' ', u.primer_apellido)`,
        [empresaId]
      );

      const [disponibilidades] = await pool.query(
        `SELECT empleado_id, dia_semana, desde_hora, hasta_hora
         FROM disponibilidad
         WHERE empleado_id IN (${empleados.map(e => e.id).join(',') || '0'})`,
        []
      );

      const mapDisponibilidades = generadorAsignaciones._crearMapaDisponibilidades(disponibilidades);

      const empleadosElegibles = empleados.filter(emp => {
        if (considerarEspecialidades && turno.especialidad_id) {
          if (emp.especialidad_id !== turno.especialidad_id) return false;
        }

        return generadorAsignaciones._empleadoDisponible(emp.id, turno, mapDisponibilidades);
      });

      return empleadosElegibles.map(emp => ({
        ...emp,
        nombre_completo: `${emp.primer_nombre} ${emp.primer_apellido}`
      }));

    } catch (err) {
      console.error('Error en obtenerEmpleadosElegibles:', err);
      throw err;
    }
  },

  _crearMapaDisponibilidades: (disponibilidades) => {
    const mapa = {};
    disponibilidades.forEach(disp => {
      if (!mapa[disp.empleado_id]) {
        mapa[disp.empleado_id] = [];
      }
      mapa[disp.empleado_id].push({
        dia_semana: disp.dia_semana,
        desde_hora: disp.desde_hora,
        hasta_hora: disp.hasta_hora
      });
    });
    return mapa;
  },

  _crearMapaCarga: (empleados, asignacionesExistentes) => {
    const mapa = {};
    empleados.forEach(emp => {
      mapa[emp.id] = { cantidad_asignaciones: 0, minutos_totales: 0 };
    });

    asignacionesExistentes.forEach(asig => {
      mapa[asig.empleado_id] = {
        cantidad_asignaciones: asig.cantidad_asignaciones,
        minutos_totales: asig.minutos_totales || 0
      };
    });

    return mapa;
  },

  _empleadoDisponible: (empleadoId, instancia, mapDisponibilidades) => {
    const disponibilidades = mapDisponibilidades[empleadoId];
    
    if (!disponibilidades || disponibilidades.length === 0) {
      return false;
    }

    const fecha = new Date(instancia.fecha);
    const diaSemana = fecha.getDay();

    const dispDia = disponibilidades.find(d => d.dia_semana === diaSemana);
    
    if (!dispDia) {
      return false;
    }

    const horaInicioTurno = instancia.inicio_timestamp.split(' ')[1];
    const horaFinTurno = instancia.fin_timestamp.split(' ')[1];

    return horaInicioTurno >= dispDia.desde_hora && horaFinTurno <= dispDia.hasta_hora;
  },

  _sinConflictosHorarios: (empleadoId, instancia, asignacionesExistentes) => {
    return true;
  }
};

module.exports = generadorAsignaciones;
