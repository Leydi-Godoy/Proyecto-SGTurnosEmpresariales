const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../auth');
const generadorMallas = require('../services/generadorMallas');
const generadorAsignaciones = require('../services/generadorAsignaciones');

/**
 * ==========================================
 * MÓDULO: Rutas del Planificador
 * ==========================================
 * Gestiona las operaciones del rol "Planificador"
 * - Generación automática de mallas
 * - Asignación de turnos
 * - Gestión de cobertura
 * - Reportes operativos
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Log action to audit table
 */
async function logAction(empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles = {}) {
  try {
    await pool.query(
      `INSERT INTO registros_auditoria (empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles, creado_en)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, JSON.stringify(detalles)]
    );
  } catch (error) {
    console.error('Error logging action:', error);
  }
}

/**
 * Check if user is Planificador (role 4) or higher
 */
function isPlanificador(userRole) {
  return userRole === 1 || userRole === 2 || userRole === 4; // Super Admin, Admin Empresa, Planificador
}

/**
 * Check company access
 */
function checkCompanyAccess(userRole, userCompany, requestedCompany) {
  if (userRole === 1) return true; // Super Admin
  return userCompany === requestedCompany;
}

// ============================================================================
// ENDPOINT 1: Generar Malla Automáticamente
// ============================================================================
/**
 * POST /api/planificador/generar-malla
 * 
 * Genera automáticamente un calendario de turnos basado en:
 * - Configuración de malla (plantillas, cantidad empleados)
 * - Período (fecha inicio, cantidad de semanas)
 * - Tipo de distribución (equilibrada o personalizada)
 * 
 * Request body:
 * {
 *   "empresa_id": 1,
 *   "configuracion_id": 5,
 *   "fecha_inicio": "2026-10-01",
 *   "cantidad_semanas": 4,
 *   "tipo_distribucion": "equilibrada",
 *   "pautas_seleccionadas": [1, 2, 3]  // opcional: filtrar por plantillas específicas
 * }
 * 
 * Response:
 * {
 *   "exito": true,
 *   "totalInstancias": 80,
 *   "periodo": { "fechaInicio": "2026-10-01", "cantidadSemanas": 4, "fechaFin": "2026-10-28" },
 *   "resumenLegal": { "esValido": true, ... }
 * }
 */
router.post('/generar-malla', authenticateToken, async (req, res) => {
  try {
    const {
      empresa_id,
      configuracion_id,
      fecha_inicio,
      cantidad_semanas,
      tipo_distribucion = 'equilibrada',
      pautas_seleccionadas
    } = req.body;

    const userId = req.auth.Id_usuario;
    const userRole = req.auth.Id_rol;
    const userCompany = req.auth.empresa_id;

    // ✅ VALIDACIÓN 1: Permisos de rol
    if (!isPlanificador(userRole)) {
      return res.status(403).json({
        error: 'Acceso denegado: solo Planificadores o superiores pueden generar mallas'
      });
    }

    // ✅ VALIDACIÓN 2: Acceso a empresa
    if (!checkCompanyAccess(userRole, userCompany, empresa_id)) {
      return res.status(403).json({
        error: 'No tienes acceso a esta empresa'
      });
    }

    // ✅ VALIDACIÓN 3: Campos requeridos
    if (!empresa_id || !configuracion_id || !fecha_inicio || !cantidad_semanas) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        campos: {
          empresa_id: empresa_id ? '✓' : 'Requerido',
          configuracion_id: configuracion_id ? '✓' : 'Requerido',
          fecha_inicio: fecha_inicio ? '✓' : 'Requerido',
          cantidad_semanas: cantidad_semanas ? '✓' : 'Requerido'
        }
      });
    }

    // ✅ VALIDACIÓN 4: Verificar que la configuración existe y pertenece a la empresa
    const [configs] = await pool.query(
      'SELECT * FROM configuraciones_malla WHERE id = ? AND empresa_id = ? AND activo = TRUE',
      [configuracion_id, empresa_id]
    );

    if (configs.length === 0) {
      return res.status(404).json({
        error: 'Configuración no encontrada o no está activa'
      });
    }

    // ✅ VALIDACIÓN 5: Verificar que haya empleados en la empresa
    const [empleados] = await pool.query(
      'SELECT COUNT(*) as cantidad FROM empleados WHERE empresa_id = ? AND estado = "activo"',
      [empresa_id]
    );

    if (empleados[0].cantidad < configs[0].cantidad_empleados) {
      return res.status(400).json({
        error: `No hay suficientes empleados activos`,
        detalle: {
          requeridos: configs[0].cantidad_empleados,
          disponibles: empleados[0].cantidad
        }
      });
    }

    // ✅ LLAMAR AL GENERADOR DE MALLAS
    const resultado = await generadorMallas.generarMalla({
      configuracionId: configuracion_id,
      empresaId: empresa_id,
      fechaInicio: fecha_inicio,
      cantidadSemanas: cantidad_semanas,
      usuarioId: userId,
      tipoDistribucion: tipo_distribucion,
      pautasSeleccionadas: pautas_seleccionadas
    });

    // ✅ REGISTRAR EN AUDITORÍA
    await logAction(
      empresa_id,
      userId,
      'generar_malla_automatica',
      'instancias_turno',
      configuracion_id,
      {
        totalInstancias: resultado.totalInstancias,
        periodo: resultado.periodo,
        tipoDistribucion
      }
    );

    return res.status(201).json({
      exito: true,
      mensaje: 'Malla generada exitosamente',
      datos: resultado
    });

  } catch (error) {
    console.error('Error generando malla:', error);

    return res.status(500).json({
      error: 'Error al generar malla',
      detalle: error.message
    });
  }
});

// ============================================================================
// ENDPOINT 2: Listar Mallas (Instancias de Turnos)
// ============================================================================
/**
 * GET /api/planificador/mallas
 * 
 * Lista todas las mallas generadas de una empresa
 * 
 * Query params:
 *   - empresa_id: ID de empresa
 *   - estado: 'vigente', 'finalizada', 'borrador' (opcional)
 *   - configuracion_id: Filtrar por configuración (opcional)
 */
router.get('/mallas', authenticateToken, async (req, res) => {
  try {
    const empresa_id = req.query.empresa_id || req.auth.empresa_id;
    const userRole = req.auth.Id_rol;
    const userCompany = req.auth.empresa_id;

    // ✅ VALIDACIÓN: Permisos y acceso
    if (!isPlanificador(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (!checkCompanyAccess(userRole, userCompany, empresa_id)) {
      return res.status(403).json({ error: 'No tienes acceso a esta empresa' });
    }

    // Obtener configuraciones de malla con detalles
    const [mallas] = await pool.query(
      `SELECT 
         cm.id,
         cm.nombre,
         cm.cantidad_empleados,
         cm.horas_por_semana,
         cm.horas_por_mes,
         cm.tipo_distribucion,
         COUNT(DISTINCT it.id) as total_instancias,
         MIN(it.fecha) as fecha_inicio,
         MAX(it.fecha) as fecha_fin,
         cm.activo,
         cm.creado_en
       FROM configuraciones_malla cm
       LEFT JOIN instancias_turno it ON cm.id = it.plantilla_id
       WHERE cm.empresa_id = ?
       GROUP BY cm.id
       ORDER BY cm.creado_en DESC`,
      [empresa_id]
    );

    return res.json({
      total: mallas.length,
      mallas
    });

  } catch (error) {
    console.error('Error listando mallas:', error);
    return res.status(500).json({
      error: 'Error al obtener mallas'
    });
  }
});

// ============================================================================
// ENDPOINT 3: Obtener Detalles de una Malla
// ============================================================================
/**
 * GET /api/planificador/mallas/:id
 * 
 * Obtiene los detalles completos de una malla (configuración e instancias)
 */
router.get('/mallas/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.auth.Id_rol;
    const userCompany = req.auth.empresa_id;

    // ✅ VALIDACIÓN: Permisos
    if (!isPlanificador(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener configuración
    const [configs] = await pool.query(
      `SELECT cm.*, e.nombre as empresa_nombre
       FROM configuraciones_malla cm
       JOIN empresas e ON cm.empresa_id = e.id
       WHERE cm.id = ?`,
      [id]
    );

    if (configs.length === 0) {
      return res.status(404).json({ error: 'Malla no encontrada' });
    }

    const config = configs[0];

    // ✅ VALIDACIÓN: Acceso a empresa
    if (!checkCompanyAccess(userRole, userCompany, config.empresa_id)) {
      return res.status(403).json({ error: 'No tienes acceso a esta malla' });
    }

    // Obtener turnos de la configuración
    const [turnos] = await pool.query(
      `SELECT cmt.id, cmt.plantilla_id, cmt.orden, cmt.duracion_horas, pt.nombre, pt.hora_inicio, pt.hora_fin
       FROM configuraciones_malla_turnos cmt
       JOIN plantillas_turno pt ON cmt.plantilla_id = pt.id
       WHERE cmt.configuracion_id = ?
       ORDER BY cmt.orden ASC`,
      [id]
    );

    // Obtener instancias generadas
    const [instancias] = await pool.query(
      `SELECT it.id, it.fecha, it.inicio_fecha_hora, it.fin_fecha_hora, 
              pt.nombre as turno_nombre, COUNT(DISTINCT at.id) as asignaciones
       FROM instancias_turno it
       JOIN plantillas_turno pt ON it.plantilla_id = pt.id
       LEFT JOIN asignaciones_turno at ON it.id = at.instancia_turno_id
       WHERE it.plantilla_id = ?
       GROUP BY it.id
       ORDER BY it.fecha ASC
       LIMIT 100`,
      [id]
    );

    return res.json({
      configuracion: config,
      turnos,
      instancias: {
        total: instancias.length,
        datos: instancias
      }
    });

  } catch (error) {
    console.error('Error obteniendo detalles de malla:', error);
    return res.status(500).json({
      error: 'Error al obtener detalles de la malla'
    });
  }
});

// ============================================================================
// ENDPOINT 4: Asignar Turno a Empleado
// ============================================================================
/**
 * POST /api/planificador/asignar-turno
 * 
 * Asigna un empleado a una instancia de turno
 * 
 * Request body:
 * {
 *   "empresa_id": 1,
 *   "instancia_turno_id": 45,
 *   "empleado_id": 12
 * }
 */
router.post('/asignar-turno', authenticateToken, async (req, res) => {
  try {
    const { empresa_id, instancia_turno_id, empleado_id } = req.body;
    const userId = req.auth.Id_usuario;
    const userRole = req.auth.Id_rol;
    const userCompany = req.auth.empresa_id;

    // ✅ VALIDACIÓN: Permisos
    if (!isPlanificador(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // ✅ VALIDACIÓN: Acceso a empresa
    if (!checkCompanyAccess(userRole, userCompany, empresa_id)) {
      return res.status(403).json({ error: 'No tienes acceso a esta empresa' });
    }

    // ✅ VALIDACIÓN: Campos requeridos
    if (!instancia_turno_id || !empleado_id) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: instancia_turno_id, empleado_id'
      });
    }

    // Verificar que la instancia de turno existe
    const [instancias] = await pool.query(
      'SELECT * FROM instancias_turno WHERE id = ?',
      [instancia_turno_id]
    );

    if (instancias.length === 0) {
      return res.status(404).json({ error: 'Instancia de turno no encontrada' });
    }

    // Verificar que el empleado existe y es de la empresa
    const [empleados] = await pool.query(
      'SELECT * FROM empleados WHERE id = ? AND empresa_id = ? AND estado = "activo"',
      [empleado_id, empresa_id]
    );

    if (empleados.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado o no activo' });
    }

    // Verificar que no ya está asignado
    const [existente] = await pool.query(
      'SELECT * FROM asignaciones_turno WHERE instancia_turno_id = ? AND empleado_id = ? AND estado != "cancelada"',
      [instancia_turno_id, empleado_id]
    );

    if (existente.length > 0) {
      return res.status(400).json({
        error: 'El empleado ya está asignado a este turno'
      });
    }

    // Crear asignación
    const [result] = await pool.query(
      `INSERT INTO asignaciones_turno (instancia_turno_id, empleado_id, estado, asignado_por, asignado_en)
       VALUES (?, ?, ?, ?, NOW())`,
      [instancia_turno_id, empleado_id, 'asignada', userId]
    );

    // Registrar en auditoría
    await logAction(
      empresa_id,
      userId,
      'asignar_turno_empleado',
      'asignaciones_turno',
      result.insertId,
      {
        instancia_turno_id,
        empleado_id
      }
    );

    return res.status(201).json({
      exito: true,
      mensaje: 'Turno asignado exitosamente',
      asignacion_id: result.insertId
    });

  } catch (error) {
    console.error('Error asignando turno:', error);
    return res.status(500).json({
      error: 'Error al asignar turno'
    });
  }
});

// ============================================================================
// ENDPOINT 5: Ver Cobertura (Resumen de Asignaciones)
// ============================================================================
/**
 * GET /api/planificador/cobertura
 * 
 * Obtiene el resumen de cobertura para un período
 * 
 * Query params:
 *   - empresa_id: ID de empresa
 *   - fecha_inicio: formato YYYY-MM-DD
 *   - fecha_fin: formato YYYY-MM-DD
 */
router.get('/cobertura', authenticateToken, async (req, res) => {
  try {
    const { empresa_id, fecha_inicio, fecha_fin } = req.query;
    const userRole = req.auth.Id_rol;
    const userCompany = req.auth.empresa_id;

    // ✅ VALIDACIÓN
    if (!isPlanificador(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (!checkCompanyAccess(userRole, userCompany, empresa_id)) {
      return res.status(403).json({ error: 'No tienes acceso a esta empresa' });
    }

    // Obtener cobertura por día
    const [cobertura] = await pool.query(
      `SELECT 
         DATE(it.fecha) as fecha,
         pt.nombre as tipo_turno,
         COUNT(DISTINCT it.id) as total_instancias,
         COUNT(DISTINCT CASE WHEN at.estado = 'confirmada' THEN at.id END) as asignadas,
         COUNT(DISTINCT CASE WHEN at.estado IS NULL THEN it.id END) as sin_asignar,
         ROUND((COUNT(DISTINCT CASE WHEN at.estado = 'confirmada' THEN at.id END) / COUNT(DISTINCT it.id)) * 100, 2) as porcentaje_cobertura
       FROM instancias_turno it
       JOIN plantillas_turno pt ON it.plantilla_id = pt.id
       LEFT JOIN asignaciones_turno at ON it.id = at.instancia_turno_id AND at.estado = 'confirmada'
       WHERE it.empresa_id = ?
       ${fecha_inicio ? 'AND it.fecha >= ?' : ''}
       ${fecha_fin ? 'AND it.fecha <= ?' : ''}
       GROUP BY DATE(it.fecha), pt.id
       ORDER BY it.fecha ASC`,
      fecha_inicio && fecha_fin ? [empresa_id, fecha_inicio, fecha_fin] : [empresa_id]
    );

    // Resumen general
    const [resumen] = await pool.query(
      `SELECT 
         COUNT(DISTINCT it.id) as total_instancias,
         COUNT(DISTINCT CASE WHEN at.estado = 'confirmada' THEN at.id END) as total_asignadas,
         COUNT(DISTINCT CASE WHEN at.estado IS NULL THEN it.id END) as total_sin_asignar,
         ROUND((COUNT(DISTINCT CASE WHEN at.estado = 'confirmada' THEN at.id END) / COUNT(DISTINCT it.id)) * 100, 2) as cobertura_general
       FROM instancias_turno it
       LEFT JOIN asignaciones_turno at ON it.id = at.instancia_turno_id AND at.estado = 'confirmada'
       WHERE it.empresa_id = ?
       ${fecha_inicio ? 'AND it.fecha >= ?' : ''}
       ${fecha_fin ? 'AND it.fecha <= ?' : ''}`,
      fecha_inicio && fecha_fin ? [empresa_id, fecha_inicio, fecha_fin] : [empresa_id]
    );

    return res.json({
      resumen: resumen[0],
      detalles_por_dia: cobertura
    });

  } catch (error) {
    console.error('Error obteniendo cobertura:', error);
    return res.status(500).json({
      error: 'Error al obtener cobertura'
    });
  }
});

// ENDPOINT 6: Asignar automaticamente empleados a turnos
router.post('/asignar-automaticamente', authenticateToken, async (req, res) => {
  try {
    const { empresa_id, malla_id, criterios = {} } = req.body;
    const userId = req.auth.Id_usuario;
    const userRole = req.auth.Id_rol;
    const userCompany = req.auth.empresa_id;

    if (!isPlanificador(userRole)) {
      return res.status(403).json({
        error: 'Acceso denegado: solo Planificadores o superiores pueden asignar turnos'
      });
    }

    if (!checkCompanyAccess(userRole, userCompany, empresa_id)) {
      return res.status(403).json({
        error: 'No tiene acceso a esta empresa'
      });
    }

    if (!empresa_id || !malla_id) {
      return res.status(400).json({
        error: 'Parametros requeridos: empresa_id, malla_id'
      });
    }

    const resultado = await generadorAsignaciones.asignarAutomaticamente({
      mallaId: malla_id,
      empresaId: empresa_id,
      usuarioId: userId,
      criterios
    });

    await logAction(
      empresa_id,
      userId,
      'ASIGNACION_AUTOMATICA',
      'mallas_turnos',
      malla_id,
      {
        asignaciones_realizadas: resultado.asignacionesRealizadas,
        turnos_sin_asignar: resultado.turnosSinAsignar,
        criterios_utilizados: criterios
      }
    );

    return res.json({
      exito: true,
      asignacionesRealizadas: resultado.asignacionesRealizadas,
      turnosSinAsignar: resultado.turnosSinAsignar,
      porcentajeCobertura: resultado.resumen?.porcentajeCobertura || '0%',
      detalles: resultado.detalles,
      advertencias: resultado.advertencias,
      resumen: resultado.resumen
    });

  } catch (error) {
    console.error('Error en asignacion automatica:', error);
    return res.status(500).json({
      error: 'Error al asignar automaticamente',
      mensaje: error.message
    });
  }
});

// ENDPOINT 7: Obtener empleados elegibles para un turno
router.get('/empleados-elegibles/:instancia_id', authenticateToken, async (req, res) => {
  try {
    const { instancia_id } = req.params;
    const { considerarEspecialidades = true, empleadosExcluir = '' } = req.query;
    const empresa_id = req.auth.empresa_id;
    const userRole = req.auth.Id_rol;

    if (!isPlanificador(userRole)) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const idsExcluir = empleadosExcluir
      ? empleadosExcluir.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
      : [];

    const empleados = await generadorAsignaciones.obtenerEmpleadosElegibles({
      instanciaId: parseInt(instancia_id),
      empresaId: empresa_id,
      empleadosExcluir: idsExcluir,
      considerarEspecialidades: considerarEspecialidades === 'true'
    });

    return res.json({
      empleados
    });

  } catch (error) {
    console.error('Error obteniendo empleados elegibles:', error);
    return res.status(500).json({
      error: 'Error al obtener empleados elegibles',
      mensaje: error.message
    });
  }
});

// ENDPOINT 8: Asignar empleado especifico a turno manual
router.post('/asignar-empleado-manual', authenticateToken, async (req, res) => {
  try {
    const { empresa_id, instancia_turno_id, empleado_id, notas = '' } = req.body;
    const userId = req.auth.Id_usuario;
    const userRole = req.auth.Id_rol;
    const userCompany = req.auth.empresa_id;

    if (!isPlanificador(userRole)) {
      return res.status(403).json({
        error: 'Acceso denegado: solo Planificadores o superiores'
      });
    }

    if (!checkCompanyAccess(userRole, userCompany, empresa_id)) {
      return res.status(403).json({
        error: 'No tiene acceso a esta empresa'
      });
    }

    if (!instancia_turno_id || !empleado_id) {
      return res.status(400).json({
        error: 'Parametros requeridos: instancia_turno_id, empleado_id'
      });
    }

    const [instancias] = await pool.query(
      `SELECT it.id FROM instancias_turno it
       JOIN plantillas_turno pt ON it.plantilla_id = pt.id
       WHERE it.id = ? AND pt.empresa_id = ?`,
      [instancia_turno_id, empresa_id]
    );

    if (instancias.length === 0) {
      return res.status(404).json({
        error: 'Instancia de turno no encontrada'
      });
    }

    const [empleados] = await pool.query(
      `SELECT id FROM empleados WHERE id = ? AND empresa_id = ?`,
      [empleado_id, empresa_id]
    );

    if (empleados.length === 0) {
      return res.status(404).json({
        error: 'Empleado no encontrado'
      });
    }

    const [asignacionesExistentes] = await pool.query(
      `SELECT id FROM asignaciones_turno 
       WHERE instancia_turno_id = ? AND empleado_id = ?`,
      [instancia_turno_id, empleado_id]
    );

    if (asignacionesExistentes.length > 0) {
      return res.status(409).json({
        error: 'El empleado ya esta asignado a este turno'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO asignaciones_turno 
       (instancia_turno_id, empleado_id, asignado_por, estado, asignado_en)
       VALUES (?, ?, ?, 'confirmado', NOW())`,
      [instancia_turno_id, empleado_id, userId]
    );

    await logAction(
      empresa_id,
      userId,
      'ASIGNACION_MANUAL_EMPLEADO',
      'asignaciones_turno',
      result.insertId,
      {
        instancia_turno_id,
        empleado_id,
        notas
      }
    );

    return res.json({
      exito: true,
      asignacion_id: result.insertId,
      mensaje: 'Empleado asignado correctamente al turno'
    });

  } catch (error) {
    console.error('Error en asignacion manual:', error);
    return res.status(500).json({
      error: 'Error al asignar empleado',
      mensaje: error.message
    });
  }
});

// ENDPOINT 9: Obtener resumen de asignaciones por empleado
router.get('/resumen-asignaciones-empleado/:empleado_id', authenticateToken, async (req, res) => {
  try {
    const { empleado_id } = req.params;
    const {
      fecha_inicio = new Date().toISOString().split('T')[0],
      fecha_fin = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    } = req.query;
    const empresa_id = req.auth.empresa_id;
    const userRole = req.auth.Id_rol;

    if (!isPlanificador(userRole)) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const [empleados] = await pool.query(
      `SELECT e.id, e.especialidad_id,
              CONCAT_WS(' ', u.primer_nombre, u.primer_apellido) as nombre
       FROM empleados e
       LEFT JOIN usuarios u ON e.usuario_id = u.id
       WHERE e.id = ? AND e.empresa_id = ?`,
      [empleado_id, empresa_id]
    );

    if (empleados.length === 0) {
      return res.status(404).json({
        error: 'Empleado no encontrado'
      });
    }

    const [asignaciones] = await pool.query(
      `SELECT 
         it.fecha,
         TIME_FORMAT(it.inicio_timestamp, '%H:%i') as hora_inicio,
         TIME_FORMAT(it.fin_timestamp, '%H:%i') as hora_fin,
         pt.duracion_minutos,
         at.estado,
         pt.nombre as turno_nombre
       FROM asignaciones_turno at
       JOIN instancias_turno it ON at.instancia_turno_id = it.id
       JOIN plantillas_turno pt ON it.plantilla_id = pt.id
       WHERE at.empleado_id = ? 
       AND it.fecha BETWEEN ? AND ?
       ORDER BY it.fecha ASC`,
      [empleado_id, fecha_inicio, fecha_fin]
    );

    const totalMinutos = asignaciones.reduce((sum, a) => sum + (a.duracion_minutos || 0), 0);
    const totalAsignaciones = asignaciones.length;
    const semanasDiferencia = Math.ceil((new Date(fecha_fin) - new Date(fecha_inicio)) / (7 * 24 * 60 * 60 * 1000)) || 1;

    return res.json({
      empleado: empleados[0],
      asignaciones,
      estadisticas: {
        total_asignaciones: totalAsignaciones,
        total_minutos: totalMinutos,
        total_horas: (totalMinutos / 60).toFixed(2),
        promedio_asignaciones_por_semana: (totalAsignaciones / semanasDiferencia).toFixed(2)
      },
      periodo: {
        fecha_inicio,
        fecha_fin
      }
    });

  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    return res.status(500).json({
      error: 'Error al obtener resumen de asignaciones',
      mensaje: error.message
    });
  }
});

module.exports = router;
