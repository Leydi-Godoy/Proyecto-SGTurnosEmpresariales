const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../auth');

// Helper function: Log actions to audit table
async function logAction(empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles = {}) {
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO registros_auditoria (empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles, creado_en) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, JSON.stringify(detalles)]
    );
    connection.release();
  } catch (error) {
    console.error('Error logging action:', error);
  }
}

// Helper function: Check company access for multi-tenant security
function checkCompanyAccess(userRole, userCompany, requestedCompany) {
  // Super Admin (1) can access any company
  if (userRole === 1) return true;
  // Others can only access their own company
  return userCompany === requestedCompany;
}

// Helper function: Validate time format (HH:MM:SS)
function isValidTimeFormat(time) {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  return regex.test(time);
}

// Helper function: Calculate duration in minutes from start and end time
function calculateDuration(startTime, endTime) {
  const [startHour, startMin, startSec] = startTime.split(':').map(Number);
  const [endHour, endMin, endSec] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  let duration = endMinutes - startMinutes;
  if (duration < 0) {
    // Handle overnight shifts
    duration += 24 * 60;
  }
  return duration;
}

// ============================================
// PHASE 2: Shift Templates (Plantillas) CRUD
// ============================================

// 2.1 CREATE Shift Template
// POST /api/plantillas-turno
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { empresa_id, nombre, tipo, hora_inicio, hora_fin, es_nocturno, patron_recurrencia, descripcion, es_personalizada, patron_rotativo, duracion_base } = req.body;
    const userId = req.auth.Id_usuario;
    const userRole = req.auth.Id_rol;
    const userCompany = req.auth.empresa_id;

    // Validation: Required fields
    if (!empresa_id || !nombre) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: empresa_id, nombre',
        details: {
          empresa_id: empresa_id ? 'OK' : 'Requerido',
          nombre: nombre ? 'OK' : 'Requerido'
        }
      });
    }

    // Si es personalizada, requiere patron_rotativo
    if (es_personalizada && !patron_rotativo) {
      return res.status(400).json({
        error: 'Para modalidades personalizadas se requiere patron_rotativo'
      });
    }

    // Si es fija, requiere hora_inicio y hora_fin
    if (!es_personalizada && (!hora_inicio || !hora_fin)) {
      return res.status(400).json({
        error: 'Para modalidades fijas se requieren hora_inicio y hora_fin',
        details: {
          hora_inicio: hora_inicio ? 'OK' : 'Requerido',
          hora_fin: hora_fin ? 'OK' : 'Requerido'
        }
      });
    }

    // Authorization: Only AdminEmpresa (2) or Super Admin (1) can create
    if (userRole !== 1 && userRole !== 2) {
      return res.status(403).json({
        error: 'Acceso denegado: Solo Admin Empresa o Super Admin pueden crear plantillas'
      });
    }

    // Company Access Control: Verify user can access this company
    if (!checkCompanyAccess(userRole, userCompany, empresa_id)) {
      return res.status(403).json({
        error: 'Acceso denegado: No tiene permiso para esta empresa',
        empresa_id: empresa_id,
        su_empresa: userCompany
      });
    }

    // Validation: Time format (solo si no es personalizada)
    let duracion_minutos = null;
    if (!es_personalizada) {
      if (!isValidTimeFormat(hora_inicio)) {
        return res.status(400).json({
          error: 'Formato de hora_inicio inválido. Use HH:MM:SS',
          valor_recibido: hora_inicio
        });
      }

      if (!isValidTimeFormat(hora_fin)) {
        return res.status(400).json({
          error: 'Formato de hora_fin inválido. Use HH:MM:SS',
          valor_recibido: hora_fin
        });
      }

      // Calculate duration in minutes
      duracion_minutos = calculateDuration(hora_inicio, hora_fin);

      if (duracion_minutos <= 0) {
        return res.status(400).json({
          error: 'La hora de fin debe ser posterior a la hora de inicio',
          hora_inicio,
          hora_fin
        });
      }
    }

    // Validation: Empresa exists
    const connection = await pool.getConnection();
    const empresas = await connection.query('SELECT id FROM empresas WHERE id = ?', [empresa_id]);
    
    if (empresas.length === 0) {
      connection.release();
      return res.status(404).json({
        error: 'Empresa no encontrada',
        empresa_id
      });
    }

    // Create shift template
    const result = await connection.query(
      `INSERT INTO plantillas_turno (
        empresa_id, nombre, tipo, descripcion, hora_inicio, hora_fin, duracion_minutos, duracion_base,
        es_nocturno, patron_recurrencia, es_personalizada, patron_rotativo, creado_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        empresa_id, 
        nombre, 
        tipo || 'FIJO', 
        descripcion || null,
        hora_inicio || null, 
        hora_fin || null, 
        duracion_minutos, 
        duracion_base || null,
        es_nocturno || false, 
        patron_recurrencia || null,
        es_personalizada || false,
        es_personalizada && patron_rotativo ? JSON.stringify(patron_rotativo) : null
      ]
    );

    const plantillaId = result.insertId;

    // Audit log
    await logAction(empresa_id, userId, 'crear_plantilla_turno', 'plantillas_turno', plantillaId, {
      nombre,
      hora_inicio,
      hora_fin,
      es_nocturno
    });

    // Fetch and return created template
    const plantillas = await connection.query(
      'SELECT id, empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, es_nocturno, patron_recurrencia, creado_en FROM plantillas_turno WHERE id = ?',
      [plantillaId]
    );

    connection.release();

    return res.status(201).json({
      mensaje: 'Plantilla creada exitosamente',
      plantilla: plantillas[0]
    });

  } catch (error) {
    console.error('Error creating shift template:', error);
    return res.status(500).json({
      error: 'Error al crear plantilla de turno',
      details: error.message
    });
  }
});

// 2.2 LIST Shift Templates
// GET /api/plantillas-turno?empresa_id=1
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { empresa_id } = req.query;
    const userRole = req.auth.Id_rol;
    const userCompany = req.auth.empresa_id;

    // Validation: empresa_id required
    if (!empresa_id) {
      return res.status(400).json({
        error: 'Parámetro requerido: empresa_id',
        ejemplo: '/api/plantillas-turno?empresa_id=1'
      });
    }

    // Company Access Control
    if (!checkCompanyAccess(userRole, userCompany, parseInt(empresa_id))) {
      return res.status(403).json({
        error: 'Acceso denegado: No tiene permiso para esta empresa'
      });
    }

    const connection = await pool.getConnection();

    // Verify empresa exists
    const empresas = await connection.query('SELECT id FROM empresas WHERE id = ?', [empresa_id]);
    if (empresas.length === 0) {
      connection.release();
      return res.status(404).json({
        error: 'Empresa no encontrada',
        empresa_id
      });
    }

    // Get all templates for this company
    const plantillas = await connection.query(
      `SELECT 
        id, empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, 
        es_nocturno, patron_recurrencia, creado_en 
      FROM plantillas_turno 
      WHERE empresa_id = ? 
      ORDER BY nombre ASC`,
      [empresa_id]
    );

    connection.release();

    return res.status(200).json({
      total: plantillas.length,
      plantillas: plantillas
    });

  } catch (error) {
    console.error('Error listing shift templates:', error);
    return res.status(500).json({
      error: 'Error al obtener plantillas de turno',
      details: error.message
    });
  }
});

// 2.3 GET Single Shift Template
// GET /api/plantillas-turno/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.Id_rol;
    const userCompany = req.user.empresa_id;

    const connection = await pool.getConnection();

    // Get template
    const plantillas = await connection.query(
      `SELECT id, empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, 
              es_nocturno, patron_recurrencia, creado_en 
       FROM plantillas_turno 
       WHERE id = ?`,
      [id]
    );

    if (plantillas.length === 0) {
      connection.release();
      return res.status(404).json({
        error: 'Plantilla no encontrada',
        id
      });
    }

    const plantilla = plantillas[0];

    // Company Access Control
    if (!checkCompanyAccess(userRole, userCompany, plantilla.empresa_id)) {
      connection.release();
      return res.status(403).json({
        error: 'Acceso denegado: No tiene permiso para esta plantilla'
      });
    }

    // Count number of shifts using this template
    const shifts = await connection.query(
      'SELECT COUNT(*) as total FROM instancias_turno WHERE plantilla_id = ?',
      [id]
    );

    connection.release();

    return res.status(200).json({
      plantilla: {
        ...plantilla,
        usos: shifts[0].total  // How many shifts use this template
      }
    });

  } catch (error) {
    console.error('Error fetching shift template:', error);
    return res.status(500).json({
      error: 'Error al obtener plantilla de turno',
      details: error.message
    });
  }
});

// 2.4 UPDATE Shift Template
// PUT /api/plantillas-turno/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, hora_inicio, hora_fin, es_nocturno, patron_recurrencia } = req.body;
    const userId = req.user.Id_usuario;
    const userRole = req.user.Id_rol;
    const userCompany = req.user.empresa_id;

    // Authorization: Only AdminEmpresa (2) or Super Admin (1)
    if (userRole !== 1 && userRole !== 2) {
      return res.status(403).json({
        error: 'Acceso denegado: Solo Admin Empresa o Super Admin pueden editar plantillas'
      });
    }

    const connection = await pool.getConnection();

    // Get existing template
    const plantillas = await connection.query(
      'SELECT * FROM plantillas_turno WHERE id = ?',
      [id]
    );

    if (plantillas.length === 0) {
      connection.release();
      return res.status(404).json({
        error: 'Plantilla no encontrada',
        id
      });
    }

    const plantilla = plantillas[0];

    // Company Access Control
    if (!checkCompanyAccess(userRole, userCompany, plantilla.empresa_id)) {
      connection.release();
      return res.status(403).json({
        error: 'Acceso denegado: No tiene permiso para esta plantilla'
      });
    }

    // Build update object
    const updates = {};
    const values = [];
    let updateSQL = 'UPDATE plantillas_turno SET ';
    let updateFields = [];

    if (nombre !== undefined) {
      updates.nombre = nombre;
      updateFields.push('nombre = ?');
      values.push(nombre);
    }

    if (hora_inicio !== undefined) {
      if (!isValidTimeFormat(hora_inicio)) {
        connection.release();
        return res.status(400).json({
          error: 'Formato de hora_inicio inválido. Use HH:MM:SS',
          valor_recibido: hora_inicio
        });
      }
      updates.hora_inicio = hora_inicio;
      updateFields.push('hora_inicio = ?');
      values.push(hora_inicio);
    }

    if (hora_fin !== undefined) {
      if (!isValidTimeFormat(hora_fin)) {
        connection.release();
        return res.status(400).json({
          error: 'Formato de hora_fin inválido. Use HH:MM:SS',
          valor_recibido: hora_fin
        });
      }
      updates.hora_fin = hora_fin;
      updateFields.push('hora_fin = ?');
      values.push(hora_fin);
    }

    // If times changed, recalculate duration
    const finalStartTime = hora_inicio || plantilla.hora_inicio;
    const finalEndTime = hora_fin || plantilla.hora_fin;
    const duracion_minutos = calculateDuration(finalStartTime, finalEndTime);

    if (duracion_minutos <= 0) {
      connection.release();
      return res.status(400).json({
        error: 'La hora de fin debe ser posterior a la hora de inicio',
        hora_inicio: finalStartTime,
        hora_fin: finalEndTime
      });
    }

    updateFields.push('duracion_minutos = ?');
    values.push(duracion_minutos);

    if (es_nocturno !== undefined) {
      updates.es_nocturno = es_nocturno;
      updateFields.push('es_nocturno = ?');
      values.push(es_nocturno);
    }

    if (patron_recurrencia !== undefined) {
      updates.patron_recurrencia = patron_recurrencia;
      updateFields.push('patron_recurrencia = ?');
      values.push(patron_recurrencia);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({
        error: 'No hay campos para actualizar'
      });
    }

    updateSQL += updateFields.join(', ') + ' WHERE id = ?';
    values.push(id);

    await connection.query(updateSQL, values);

    // Audit log
    await logAction(plantilla.empresa_id, userId, 'actualizar_plantilla_turno', 'plantillas_turno', id, updates);

    // Fetch and return updated template
    const updated = await connection.query(
      'SELECT id, empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, es_nocturno, patron_recurrencia, creado_en FROM plantillas_turno WHERE id = ?',
      [id]
    );

    connection.release();

    return res.status(200).json({
      mensaje: 'Plantilla actualizada exitosamente',
      plantilla: updated[0]
    });

  } catch (error) {
    console.error('Error updating shift template:', error);
    return res.status(500).json({
      error: 'Error al actualizar plantilla de turno',
      details: error.message
    });
  }
});

// 2.5 DELETE Shift Template
// DELETE /api/plantillas-turno/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.Id_usuario;
    const userRole = req.user.Id_rol;
    const userCompany = req.user.empresa_id;

    // Authorization: Only AdminEmpresa (2) or Super Admin (1)
    if (userRole !== 1 && userRole !== 2) {
      return res.status(403).json({
        error: 'Acceso denegado: Solo Admin Empresa o Super Admin pueden eliminar plantillas'
      });
    }

    const connection = await pool.getConnection();

    // Get existing template
    const plantillas = await connection.query(
      'SELECT * FROM plantillas_turno WHERE id = ?',
      [id]
    );

    if (plantillas.length === 0) {
      connection.release();
      return res.status(404).json({
        error: 'Plantilla no encontrada',
        id
      });
    }

    const plantilla = plantillas[0];

    // Company Access Control
    if (!checkCompanyAccess(userRole, userCompany, plantilla.empresa_id)) {
      connection.release();
      return res.status(403).json({
        error: 'Acceso denegado: No tiene permiso para esta plantilla'
      });
    }

    // Check if template is in use (has shifts)
    const shifts = await connection.query(
      'SELECT COUNT(*) as total FROM instancias_turno WHERE plantilla_id = ?',
      [id]
    );

    if (shifts[0].total > 0) {
      connection.release();
      return res.status(400).json({
        error: 'No se puede eliminar: Esta plantilla tiene turnos asociados',
        turnos_asociados: shifts[0].total
      });
    }

    // Delete the template
    await connection.query('DELETE FROM plantillas_turno WHERE id = ?', [id]);

    // Audit log
    await logAction(plantilla.empresa_id, userId, 'eliminar_plantilla_turno', 'plantillas_turno', id, {
      nombre: plantilla.nombre,
      razon: 'Eliminación manual'
    });

    connection.release();

    return res.status(200).json({
      mensaje: 'Plantilla eliminada exitosamente',
      id
    });

  } catch (error) {
    console.error('Error deleting shift template:', error);
    return res.status(500).json({
      error: 'Error al eliminar plantilla de turno',
      details: error.message
    });
  }
});

module.exports = router;
