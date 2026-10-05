const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../auth');

/**
 * MÓDULO: Configuración de Malla de Turnos
 * ========================================
 * Gestiona la configuración de mallas de turnos por empresa.
 * Una "malla" define:
 *   - Cantidad de empleados
 *   - Horas legales por semana/mes
 *   - Cantidad de turnos y su tipo
 *   - Tipo de distribución (equilibrada o personalizada)
 * 
 * Roles autorizados: Super Admin (1), Admin Empresa (2)
 */

/**
 * Registra las acciones en la tabla de auditoría
 * @param {number} empresa_id - ID de la empresa
 * @param {number} usuario_id - ID del usuario que realizó la acción
 * @param {string} accion - Tipo de acción (CREATE, UPDATE, DELETE, etc)
 * @param {string} tabla - Tabla afectada
 * @param {number} id_objetivo - ID del registro afectado
 * @param {object} detalles - Detalles adicionales de la acción
 */
async function logAction(empresa_id, usuario_id, accion, tabla, id_objetivo, detalles = {}) {
  try {
    await pool.query(
      'INSERT INTO registros_auditoria (empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles, creado_en) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [empresa_id, usuario_id, accion, tabla, id_objetivo, JSON.stringify(detalles)]
    );
  } catch (error) {
    console.error('Error registrando acción en auditoría:', error);
  }
}

/**
 * Verifica si el usuario tiene permisos de administrador de empresa
 * @param {number} userRole - ID del rol del usuario
 * @returns {boolean} true si es Super Admin (1) o Admin Empresa (2)
 */
function isAdminEmpresa(userRole) {
  return ['1', '2', 'super_admin', 'supad1', 'admin_empresa', 'ademp2'].includes(String(userRole).trim().toLowerCase());
}

function isSuperAdmin(userRole) {
  return ['1', 'super_admin', 'supad1'].includes(String(userRole).trim().toLowerCase());
}

function isPlanificador(userRole) {
  return ['3', 'plani3', 'planificador'].includes(String(userRole).trim().toLowerCase());
}

function canReadConfiguracionesMalla(userRole) {
  return isAdminEmpresa(userRole) || isPlanificador(userRole);
}

function getUserRole(auth) {
  return auth.Id_rol ?? auth.role;
}

function getUserId(auth) {
  return auth.Id_usuario ?? auth.id;
}

async function validarTurnosEmpresa(empresaId, turnos) {
  if (!Array.isArray(turnos) || turnos.length === 0) {
    return { error: 'Agrega al menos un turno a la configuración' };
  }

  const normalizados = [];
  const ids = new Set();
  for (const turno of turnos) {
    const plantillaId = Number(turno.plantilla_id);
    const orden = Number(turno.orden);
    const duracionHoras = Number(turno.duracion_horas);
    if (!Number.isInteger(plantillaId) || plantillaId <= 0 || ids.has(plantillaId)
      || !Number.isInteger(orden) || orden < 1
      || !Number.isInteger(duracionHoras) || duracionHoras < 1 || duracionHoras > 24) {
      return { error: 'Cada turno debe tener una plantilla distinta, orden y duración válida entre 1 y 24 horas' };
    }
    ids.add(plantillaId);
    normalizados.push({ plantilla_id: plantillaId, orden, duracion_horas: duracionHoras });
  }

  const [plantillas] = await pool.query(
    'SELECT id FROM plantillas_turno WHERE empresa_id = ? AND activo = 1 AND id IN (?)',
    [empresaId, [...ids]]
  );
  if (plantillas.length !== ids.size) {
    return { error: 'Una o más plantillas no existen, están inactivas o pertenecen a otra empresa' };
  }

  return { turnos: normalizados };
}

const CONFIGURACION_MALLA_CON_USUARIOS = `
  SELECT cm.*,
          COALESCE(NULLIF(TRIM(CONCAT_WS(' ', actualizador.primer_nombre, actualizador.segundo_nombre, actualizador.primer_apellido, actualizador.segundo_apellido)), ''), actualizador.correo) AS actualizado_por_nombre,
          COALESCE(NULLIF(TRIM(CONCAT_WS(' ', creador.primer_nombre, creador.segundo_nombre, creador.primer_apellido, creador.segundo_apellido)), ''), creador.correo) AS creado_por_nombre
  FROM configuraciones_malla cm
        LEFT JOIN usuarios actualizador ON actualizador.id = cm.actualizado_por AND actualizador.empresa_id = cm.empresa_id
        LEFT JOIN usuarios creador ON creador.id = cm.creado_por AND creador.empresa_id = cm.empresa_id`;

/**
 * ENDPOINT 1: GET /api/configuraciones-malla
 * ============================================
 * Lista todas las configuraciones de malla de una empresa
 * 
 * Query params:
 *   - empresa_id (opcional): ID de empresa (por defecto, la del usuario)
 * 
 * Respuesta:
 *   {
 *     total: number,
 *     configuraciones: [
 *       { id, nombre, cantidad_empleados, horas_por_semana, horas_por_mes, 
 *         turnos_mensuales_empleado, activo, creado_en }
 *     ]
 *   }
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userRole = getUserRole(req.auth);
    if (!canReadConfiguracionesMalla(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const empresaId = isSuperAdmin(userRole)
      ? Number(req.query.empresa_id || req.auth.empresa_id)
      : req.auth.empresa_id;
    if (!empresaId) return res.status(400).json({ error: 'No se pudo determinar la empresa' });

    const [configuraciones] = await pool.query(
      `${CONFIGURACION_MALLA_CON_USUARIOS}
       WHERE cm.empresa_id = ? AND cm.activo = 1 ORDER BY cm.creado_en DESC`,
      [empresaId]
    );

    res.json({ total: configuraciones.length, configuraciones });
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    res.status(500).json({ error: 'Error al obtener configuraciones' });
  }
});

/**
 * ENDPOINT 2: GET /api/configuraciones-malla/:id
 * ===============================================
 * Obtiene una configuración completa incluyendo sus turnos asociados
 * 
 * Parámetros:
 *   - id: ID de la configuración de malla
 * 
 * Respuesta:
 *   {
 *     id, nombre, cantidad_empleados, horas_por_semana, horas_por_mes,
 *     turnos_mensuales_empleado, tipo_distribucion, descripcion, activo, creado_en,
 *     turnos: [{ plantilla_id, nombre_turno, orden, duracion_horas }]
 *   }
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = getUserRole(req.auth);

    if (!canReadConfiguracionesMalla(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener configuración
    const query = isSuperAdmin(userRole)
      ? `${CONFIGURACION_MALLA_CON_USUARIOS} WHERE cm.id = ?`
      : `${CONFIGURACION_MALLA_CON_USUARIOS} WHERE cm.id = ? AND cm.empresa_id = ?`;
    const params = isSuperAdmin(userRole) ? [id] : [id, req.auth.empresa_id];
    const [configs] = await pool.query(query, params);

    if (configs.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    // Obtener turnos asociados
    const [turnos] = await pool.query(
      `SELECT cmt.id, cmt.plantilla_id, pt.nombre, pt.hora_inicio, pt.hora_fin, cmt.duracion_horas, cmt.orden
       FROM configuraciones_malla_turnos cmt
       JOIN plantillas_turno pt ON cmt.plantilla_id = pt.id
       WHERE cmt.configuracion_id = ?
       ORDER BY cmt.orden ASC`,
      [id]
    );

    const config = configs[0];
    config.turnos = turnos;

    res.json(config);
  } catch (error) {
    console.error('Error fetching configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// 3. POST - Crear configuración de malla
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, cantidad_empleados, horas_por_semana, horas_por_mes, dias_laborales_por_semana, turnos_mensuales_empleado, tipo_distribucion, descripcion, turnos } = req.body;
    const empresaId = req.auth.empresa_id;
    const userId = getUserId(req.auth);
    const userRole = getUserRole(req.auth);

    if (!isAdminEmpresa(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado: solo Admin Empresa o Super Admin pueden crear configuraciones' });
    }

    if (!empresaId || !nombre || !cantidad_empleados || !turnos_mensuales_empleado) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const validacionTurnos = await validarTurnosEmpresa(empresaId, turnos);
    if (validacionTurnos.error) return res.status(400).json({ error: validacionTurnos.error });

    const connection = await pool.getConnection();
    let configId;
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        `INSERT INTO configuraciones_malla (empresa_id, nombre, descripcion, cantidad_empleados, horas_por_semana, horas_por_mes, dias_laborales_por_semana, turnos_mensuales_empleado, tipo_distribucion, creado_por)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [empresaId, nombre, descripcion || null, cantidad_empleados, horas_por_semana || 42, horas_por_mes || 182, dias_laborales_por_semana || 6, turnos_mensuales_empleado, tipo_distribucion || 'equilibrada', userId]
      );
      configId = result.insertId;
      for (const turno of validacionTurnos.turnos) {
        await connection.query(
          `INSERT INTO configuraciones_malla_turnos (configuracion_id, plantilla_id, orden, duracion_horas)
           VALUES (?, ?, ?, ?)`,
          [configId, turno.plantilla_id, turno.orden, turno.duracion_horas]
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    await logAction(empresaId, userId, 'crear_configuracion_malla', 'configuraciones_malla', configId, {
      nombre, cantidad_empleados, turnos_mensuales_empleado
    });

    const [savedConfigs] = await pool.query(
      `${CONFIGURACION_MALLA_CON_USUARIOS} WHERE cm.id = ? AND cm.empresa_id = ?`,
      [configId, empresaId]
    );
    res.status(201).json({ configuracion: savedConfigs[0], message: 'Configuración creada exitosamente' });
  } catch (error) {
    console.error('Error creating configuración:', error);
    res.status(500).json({ error: 'Error al crear configuración' });
  }
});

// 4. PUT - Actualizar configuración
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cantidad_empleados, horas_por_semana, horas_por_mes, dias_laborales_por_semana, turnos_mensuales_empleado, tipo_distribucion, descripcion, turnos } = req.body;
    const userId = getUserId(req.auth);
    const userRole = getUserRole(req.auth);

    if (!isAdminEmpresa(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener configuración actual
    const configQuery = isSuperAdmin(userRole)
      ? 'SELECT * FROM configuraciones_malla WHERE id = ?'
      : 'SELECT * FROM configuraciones_malla WHERE id = ? AND empresa_id = ?';
    const configParams = isSuperAdmin(userRole) ? [id] : [id, req.auth.empresa_id];
    const [configs] = await pool.query(configQuery, configParams);
    if (configs.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const config = configs[0];

    const validacionTurnos = turnos === undefined
      ? null
      : await validarTurnosEmpresa(config.empresa_id, turnos);
    if (validacionTurnos?.error) return res.status(400).json({ error: validacionTurnos.error });

    // Actualizar
    const updateFields = [];
    const updateValues = [];
    
    if (nombre !== undefined) { updateFields.push('nombre = ?'); updateValues.push(nombre); }
    if (cantidad_empleados !== undefined) { updateFields.push('cantidad_empleados = ?'); updateValues.push(cantidad_empleados); }
    if (horas_por_semana !== undefined) { updateFields.push('horas_por_semana = ?'); updateValues.push(horas_por_semana); }
    if (horas_por_mes !== undefined) { updateFields.push('horas_por_mes = ?'); updateValues.push(horas_por_mes); }
    if (dias_laborales_por_semana !== undefined) { updateFields.push('dias_laborales_por_semana = ?'); updateValues.push(dias_laborales_por_semana); }
    if (turnos_mensuales_empleado !== undefined) { updateFields.push('turnos_mensuales_empleado = ?'); updateValues.push(turnos_mensuales_empleado); }
    if (tipo_distribucion !== undefined) { updateFields.push('tipo_distribucion = ?'); updateValues.push(tipo_distribucion); }
    if (descripcion !== undefined) { updateFields.push('descripcion = ?'); updateValues.push(descripcion); }

    updateFields.push('actualizado_por = ?');
    updateValues.push(userId, id, config.empresa_id);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(`UPDATE configuraciones_malla SET ${updateFields.join(', ')} WHERE id = ? AND empresa_id = ?`, updateValues);
      if (validacionTurnos) {
        await connection.query('DELETE FROM configuraciones_malla_turnos WHERE configuracion_id = ?', [id]);
        for (const turno of validacionTurnos.turnos) {
          await connection.query(
            `INSERT INTO configuraciones_malla_turnos (configuracion_id, plantilla_id, orden, duracion_horas)
             VALUES (?, ?, ?, ?)`,
            [id, turno.plantilla_id, turno.orden, turno.duracion_horas]
          );
        }
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    await logAction(config.empresa_id, userId, 'actualizar_configuracion_malla', 'configuraciones_malla', id, {
      nombre, cantidad_empleados, turnos_mensuales_empleado
    });

    const [savedConfigs] = await pool.query(
      `${CONFIGURACION_MALLA_CON_USUARIOS} WHERE cm.id = ? AND cm.empresa_id = ?`,
      [id, config.empresa_id]
    );
    res.json({ configuracion: savedConfigs[0], message: 'Configuración actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// 5. DELETE - Eliminar configuración
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req.auth);
    const userRole = getUserRole(req.auth);

    if (!isAdminEmpresa(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [configs] = await pool.query('SELECT * FROM configuraciones_malla WHERE id = ?', [id]);
    if (configs.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const config = configs[0];

    // Soft-delete: no borramos físicamente la configuración ni sus turnos
    // (eso es responsabilidad exclusiva del Planificador al borrar el
    // calendario generado). Aquí solo la desactivamos para que deje de
    // aparecer disponible, preservando el historial/datos.
    await pool.query('UPDATE configuraciones_malla SET activo = 0 WHERE id = ?', [id]);

    await logAction(config.empresa_id, userId, 'desactivar_configuracion_malla', 'configuraciones_malla', id, {});

    res.json({ message: 'Configuración desactivada exitosamente' });
  } catch (error) {
    console.error('Error deleting configuración:', error);
    res.status(500).json({ error: 'Error al eliminar configuración' });
  }
});

/**
 * ENDPOINT 6: POST /api/configuraciones-malla/:id/generar
 * ========================================================
 * Genera automáticamente un calendario de turnos basado en la configuración
 * 
 * Requiere:
 *   - Autenticación JWT ✓
 *   - Rol: Super Admin (1) o Admin Empresa (2)
 *   - La configuración debe tener turnos asignados
 * 
 * Body (JSON):
 * {
 *   "fechaInicio": "2026-10-01",      // Fecha de inicio (YYYY-MM-DD)
 *   "cantidadSemanas": 4,             // Semanas a generar (1-52)
 *   "tipoDistribucion": "equilibrada" // "equilibrada" o "personalizada"
 * }
 * 
 * Response: {
 *   "exito": true,
 *   "totalInstancias": 96,
 *   "periodo": {
 *     "fechaInicio": "2026-10-01",
 *     "cantidadSemanas": 4,
 *     "fechaFin": "2026-10-28"
 *   },
 *   "resumenLegal": {
 *     "esValido": true,
 *     "errores": [],
 *     "advertencias": [],
 *     "totalEmpleados": 12,
 *     "totalInstancias": 96
 *   }
 * }
 */
router.post('/:id/generar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaInicio, cantidadSemanas, tipoDistribucion, pautasSeleccionadas } = req.body;
    const userId = getUserId(req.auth);
    const userRole = getUserRole(req.auth);
    const empresaId = req.auth.empresa_id;

    // Validar permisos
    if (!isAdminEmpresa(userRole)) {
      return res.status(403).json({ error: 'No tienes permisos para generar mallas' });
    }

    // Validar parámetros
    if (!fechaInicio || !cantidadSemanas || !tipoDistribucion) {
      return res.status(400).json({ 
        error: 'Faltan parámetros: fechaInicio, cantidadSemanas, tipoDistribucion' 
      });
    }

    if (!pautasSeleccionadas || pautasSeleccionadas.length === 0) {
      return res.status(400).json({ 
        error: 'Debe seleccionar al menos una pauta base (modalidad)' 
      });
    }

    // Obtener configuración
    const [configs] = await pool.query(
      'SELECT * FROM configuraciones_malla WHERE id = ? AND empresa_id = ? AND activo = TRUE',
      [id, empresaId]
    );

    if (configs.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const config = configs[0];

    // Validar que la configuración tenga turnos asignados
    const [turnos] = await pool.query(
      'SELECT COUNT(*) as count FROM configuraciones_malla_turnos WHERE configuracion_id = ?',
      [id]
    );

    if (turnos[0].count === 0) {
      return res.status(400).json({ 
        error: 'La configuración no tiene turnos asignados' 
      });
    }

    // Llamar al servicio de generación, pasando pautasSeleccionadas
    const generadorMallas = require('../services/generadorMallas');
    const resultado = await generadorMallas.generarMalla({
      configuracionId: id,
      empresaId,
      fechaInicio,
      cantidadSemanas,
      usuarioId: userId,
      tipoDistribucion,
      pautasSeleccionadas: pautasSeleccionadas
    });

    // Registrar en auditoría
    await logAction(
      empresaId,
      userId,
      'generar_malla_automatica',
      'configuraciones_malla',
      id,
      {
        fechaInicio,
        cantidadSemanas,
        totalInstancias: resultado.totalInstancias,
        tipoDistribucion,
        pautasSeleccionadas: pautasSeleccionadas.length
      }
    );

    res.json({
      exito: true,
      totalInstancias: resultado.totalInstancias,
      periodo: resultado.periodo,
      resumenLegal: resultado.resumenLegal
    });

  } catch (error) {
    console.error('Error generando malla:', error);
    res.status(500).json({ error: error.message || 'Error al generar malla' });
  }
});

module.exports = router;
