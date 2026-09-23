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
  return userRole === 1 || userRole === 2; // Super Admin o Admin Empresa
}

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
    const empresaId = req.query.empresa_id || req.auth.empresa_id;
    const userRole = req.auth.Id_rol;
    const userCompany = req.auth.empresa_id;

    // Validación: Solo admin de empresa puede ver configuraciones
    if (!isAdminEmpresa(userRole) && userCompany !== Number(empresaId)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [configuraciones] = await pool.query(
      'SELECT id, nombre, cantidad_empleados, horas_por_semana, horas_por_mes, turnos_mensuales_empleado, activo, creado_en FROM configuraciones_malla WHERE empresa_id = ? ORDER BY creado_en DESC',
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
    const userRole = req.user.Id_rol;

    if (!isAdminEmpresa(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener configuración
    const [configs] = await pool.query(
      'SELECT * FROM configuraciones_malla WHERE id = ?',
      [id]
    );

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
    const { empresa_id, nombre, cantidad_empleados, horas_por_semana, horas_por_mes, dias_laborales_por_semana, turnos_mensuales_empleado, tipo_distribucion, descripcion, turnos } = req.body;
    const userId = req.auth.Id_usuario;
    const userRole = req.auth.Id_rol;

    if (!isAdminEmpresa(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado: solo Admin Empresa o Super Admin pueden crear configuraciones' });
    }

    if (!empresa_id || !nombre || !cantidad_empleados || !turnos_mensuales_empleado) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Crear configuración
    const [result] = await pool.query(
      `INSERT INTO configuraciones_malla (empresa_id, nombre, cantidad_empleados, horas_por_semana, horas_por_mes, dias_laborales_por_semana, turnos_mensuales_empleado, tipo_distribucion, descripcion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [empresa_id, nombre, cantidad_empleados, horas_por_semana || 42, horas_por_mes || 182, dias_laborales_por_semana || 5, turnos_mensuales_empleado, tipo_distribucion || 'equilibrada', descripcion]
    );

    const configId = result.insertId;

    // Agregar turnos si se proporcionan
    if (turnos && Array.isArray(turnos) && turnos.length > 0) {
      for (const turno of turnos) {
        await pool.query(
          `INSERT INTO configuraciones_malla_turnos (configuracion_id, plantilla_id, orden, duracion_horas)
           VALUES (?, ?, ?, ?)`,
          [configId, turno.plantilla_id, turno.orden || 1, turno.duracion_horas]
        );
      }
    }

    await logAction(empresa_id, userId, 'crear_configuracion_malla', 'configuraciones_malla', configId, {
      nombre, cantidad_empleados, turnos_mensuales_empleado
    });

    res.status(201).json({
      id: configId,
      empresa_id,
      nombre,
      cantidad_empleados,
      turnos_mensuales_empleado,
      message: 'Configuración creada exitosamente'
    });
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
    const userId = req.auth.Id_usuario;
    const userRole = req.auth.Id_rol;

    if (!isAdminEmpresa(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener configuración actual
    const [configs] = await pool.query('SELECT * FROM configuraciones_malla WHERE id = ?', [id]);
    if (configs.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const config = configs[0];

    // Actualizar
    const updateFields = [];
    const updateValues = [];
    
    if (nombre) { updateFields.push('nombre = ?'); updateValues.push(nombre); }
    if (cantidad_empleados) { updateFields.push('cantidad_empleados = ?'); updateValues.push(cantidad_empleados); }
    if (horas_por_semana) { updateFields.push('horas_por_semana = ?'); updateValues.push(horas_por_semana); }
    if (horas_por_mes) { updateFields.push('horas_por_mes = ?'); updateValues.push(horas_por_mes); }
    if (dias_laborales_por_semana) { updateFields.push('dias_laborales_por_semana = ?'); updateValues.push(dias_laborales_por_semana); }
    if (turnos_mensuales_empleado) { updateFields.push('turnos_mensuales_empleado = ?'); updateValues.push(turnos_mensuales_empleado); }
    if (tipo_distribucion) { updateFields.push('tipo_distribucion = ?'); updateValues.push(tipo_distribucion); }
    if (descripcion !== undefined) { updateFields.push('descripcion = ?'); updateValues.push(descripcion); }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.query(`UPDATE configuraciones_malla SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    }

    // Actualizar turnos si se proporcionan
    if (turnos && Array.isArray(turnos)) {
      // Eliminar turnos existentes
      await pool.query('DELETE FROM configuraciones_malla_turnos WHERE configuracion_id = ?', [id]);
      
      // Agregar nuevos turnos
      for (const turno of turnos) {
        await pool.query(
          `INSERT INTO configuraciones_malla_turnos (configuracion_id, plantilla_id, orden, duracion_horas)
           VALUES (?, ?, ?, ?)`,
          [id, turno.plantilla_id, turno.orden || 1, turno.duracion_horas]
        );
      }
    }

    await logAction(config.empresa_id, userId, 'actualizar_configuracion_malla', 'configuraciones_malla', id, {
      nombre, cantidad_empleados, turnos_mensuales_empleado
    });

    res.json({ message: 'Configuración actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

// 5. DELETE - Eliminar configuración
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.Id_usuario;
    const userRole = req.auth.Id_rol;

    if (!isAdminEmpresa(userRole)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [configs] = await pool.query('SELECT * FROM configuraciones_malla WHERE id = ?', [id]);
    if (configs.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const config = configs[0];

    // Eliminar turnos asociados (cascada manual)
    await pool.query('DELETE FROM configuraciones_malla_turnos WHERE configuracion_id = ?', [id]);
    
    // Eliminar configuración
    await pool.query('DELETE FROM configuraciones_malla WHERE id = ?', [id]);

    await logAction(config.empresa_id, userId, 'eliminar_configuracion_malla', 'configuraciones_malla', id, {});

    res.json({ message: 'Configuración eliminada exitosamente' });
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
    const userId = req.auth.Id_usuario;
    const userRole = req.auth.Id_rol;
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
