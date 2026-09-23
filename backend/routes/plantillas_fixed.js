const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../auth');

// Helper function: Log actions to audit table
async function logAction(empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles = {}) {
  try {
    await pool.query(
      'INSERT INTO registros_auditoria (empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles, creado_en) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, JSON.stringify(detalles)]
    );
  } catch (error) {
    console.error('Error logging action:', error);
  }
}

// Helper function: Check company access for multi-tenant security
function checkCompanyAccess(userRole, userCompany, requestedCompany) {
  if (userRole === 1) return true;
  return userCompany === requestedCompany;
}

// Helper function: Validate time format (HH:MM:SS)
function isValidTimeFormat(time) {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  return regex.test(time);
}

// Helper function: Calculate duration in minutes
function calculateDuration(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  let duration = endMinutes - startMinutes;
  if (duration < 0) {
    duration += 24 * 60;
  }
  return duration;
}

// 2.1 CREATE Shift Template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { empresa_id, nombre, hora_inicio, hora_fin, es_nocturno, patron_recurrencia } = req.body;
    const userId = req.user.Id_usuario;
    const userRole = req.user.Id_rol;
    const userCompany = req.user.empresa_id;

    if (!empresa_id || !nombre || !hora_inicio || !hora_fin) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: empresa_id, nombre, hora_inicio, hora_fin'
      });
    }

    if (userRole !== 1 && userRole !== 2) {
      return res.status(403).json({
        error: 'Acceso denegado: Solo Admin Empresa o Super Admin pueden crear plantillas'
      });
    }

    if (!checkCompanyAccess(userRole, userCompany, empresa_id)) {
      return res.status(403).json({
        error: 'Acceso denegado: No tiene permiso para esta empresa'
      });
    }

    if (!isValidTimeFormat(hora_inicio) || !isValidTimeFormat(hora_fin)) {
      return res.status(400).json({
        error: 'Formato de hora inválido. Use HH:MM:SS'
      });
    }

    const duracion_minutos = calculateDuration(hora_inicio, hora_fin);
    if (duracion_minutos <= 0) {
      return res.status(400).json({
        error: 'La hora de fin debe ser posterior a la hora de inicio'
      });
    }

    const [empresas] = await pool.query('SELECT id FROM empresas WHERE id = ?', [empresa_id]);
    if (empresas.length === 0) {
      return res.status(404).json({
        error: 'Empresa no encontrada'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO plantillas_turno (
        empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, 
        es_nocturno, patron_recurrencia, creado_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, es_nocturno || false, patron_recurrencia || null]
    );

    const plantillaId = result.insertId;

    await logAction(empresa_id, userId, 'crear_plantilla_turno', 'plantillas_turno', plantillaId, {
      nombre,
      hora_inicio,
      hora_fin,
      es_nocturno
    });

    const [plantillas] = await pool.query(
      'SELECT id, empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, es_nocturno, patron_recurrencia, creado_en FROM plantillas_turno WHERE id = ?',
      [plantillaId]
    );

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
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { empresa_id } = req.query;
    const userRole = req.user.Id_rol;
    const userCompany = req.user.empresa_id;

    if (!empresa_id) {
      return res.status(400).json({
        error: 'Parámetro requerido: empresa_id'
      });
    }

    if (!checkCompanyAccess(userRole, userCompany, parseInt(empresa_id))) {
      return res.status(403).json({
        error: 'Acceso denegado: No tiene permiso para esta empresa'
      });
    }

    const [empresas] = await pool.query('SELECT id FROM empresas WHERE id = ?', [empresa_id]);
    if (empresas.length === 0) {
      return res.status(404).json({
        error: 'Empresa no encontrada'
      });
    }

    const [plantillas] = await pool.query(
      `SELECT id, empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, 
              es_nocturno, patron_recurrencia, creado_en 
       FROM plantillas_turno 
       WHERE empresa_id = ? 
       ORDER BY nombre ASC`,
      [empresa_id]
    );

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
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.Id_rol;
    const userCompany = req.user.empresa_id;

    const [plantillas] = await pool.query(
      `SELECT id, empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, 
              es_nocturno, patron_recurrencia, creado_en 
       FROM plantillas_turno 
       WHERE id = ?`,
      [id]
    );

    if (plantillas.length === 0) {
      return res.status(404).json({
        error: 'Plantilla no encontrada'
      });
    }

    const plantilla = plantillas[0];

    if (!checkCompanyAccess(userRole, userCompany, plantilla.empresa_id)) {
      return res.status(403).json({
        error: 'Acceso denegado: No tiene permiso para esta plantilla'
      });
    }

    const [shifts] = await pool.query(
      'SELECT COUNT(*) as total FROM instancias_turno WHERE plantilla_id = ?',
      [id]
    );

    return res.status(200).json({
      plantilla: {
        ...plantilla,
        usos: shifts[0].total
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
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, hora_inicio, hora_fin, es_nocturno, patron_recurrencia } = req.body;
    const userId = req.user.Id_usuario;
    const userRole = req.user.Id_rol;
    const userCompany = req.user.empresa_id;

    if (userRole !== 1 && userRole !== 2) {
      return res.status(403).json({
        error: 'Acceso denegado: Solo Admin Empresa o Super Admin pueden editar plantillas'
      });
    }

    const [plantillas] = await pool.query(
      'SELECT * FROM plantillas_turno WHERE id = ?',
      [id]
    );

    if (plantillas.length === 0) {
      return res.status(404).json({
        error: 'Plantilla no encontrada'
      });
    }

    const plantilla = plantillas[0];

    if (!checkCompanyAccess(userRole, userCompany, plantilla.empresa_id)) {
      return res.status(403).json({
        error: 'Acceso denegado: No tiene permiso para esta plantilla'
      });
    }

    const updates = {};
    const values = [];
    let updateFields = [];

    if (nombre !== undefined) {
      updateFields.push('nombre = ?');
      values.push(nombre);
      updates.nombre = nombre;
    }

    if (hora_inicio !== undefined) {
      if (!isValidTimeFormat(hora_inicio)) {
        return res.status(400).json({
          error: 'Formato de hora_inicio inválido. Use HH:MM:SS'
        });
      }
      updateFields.push('hora_inicio = ?');
      values.push(hora_inicio);
      updates.hora_inicio = hora_inicio;
    }

    if (hora_fin !== undefined) {
      if (!isValidTimeFormat(hora_fin)) {
        return res.status(400).json({
          error: 'Formato de hora_fin inválido. Use HH:MM:SS'
        });
      }
      updateFields.push('hora_fin = ?');
      values.push(hora_fin);
      updates.hora_fin = hora_fin;
    }

    const finalStartTime = hora_inicio || plantilla.hora_inicio;
    const finalEndTime = hora_fin || plantilla.hora_fin;
    const duracion_minutos = calculateDuration(finalStartTime, finalEndTime);

    if (duracion_minutos <= 0) {
      return res.status(400).json({
        error: 'La hora de fin debe ser posterior a la hora de inicio'
      });
    }

    updateFields.push('duracion_minutos = ?');
    values.push(duracion_minutos);

    if (es_nocturno !== undefined) {
      updateFields.push('es_nocturno = ?');
      values.push(es_nocturno);
      updates.es_nocturno = es_nocturno;
    }

    if (patron_recurrencia !== undefined) {
      updateFields.push('patron_recurrencia = ?');
      values.push(patron_recurrencia);
      updates.patron_recurrencia = patron_recurrencia;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No hay campos para actualizar'
      });
    }

    values.push(id);
    const updateSQL = 'UPDATE plantillas_turno SET ' + updateFields.join(', ') + ' WHERE id = ?';

    await pool.query(updateSQL, values);

    await logAction(plantilla.empresa_id, userId, 'actualizar_plantilla_turno', 'plantillas_turno', id, updates);

    const [updated] = await pool.query(
      'SELECT id, empresa_id, nombre, hora_inicio, hora_fin, duracion_minutos, es_nocturno, patron_recurrencia, creado_en FROM plantillas_turno WHERE id = ?',
      [id]
    );

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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.Id_usuario;
    const userRole = req.user.Id_rol;
    const userCompany = req.user.empresa_id;

    if (userRole !== 1 && userRole !== 2) {
      return res.status(403).json({
        error: 'Acceso denegado: Solo Admin Empresa o Super Admin pueden eliminar plantillas'
      });
    }

    const [plantillas] = await pool.query(
      'SELECT * FROM plantillas_turno WHERE id = ?',
      [id]
    );

    if (plantillas.length === 0) {
      return res.status(404).json({
        error: 'Plantilla no encontrada'
      });
    }

    const plantilla = plantillas[0];

    if (!checkCompanyAccess(userRole, userCompany, plantilla.empresa_id)) {
      return res.status(403).json({
        error: 'Acceso denegado: No tiene permiso para esta plantilla'
      });
    }

    const [shifts] = await pool.query(
      'SELECT COUNT(*) as total FROM instancias_turno WHERE plantilla_id = ?',
      [id]
    );

    if (shifts[0].total > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar: Esta plantilla tiene turnos asociados',
        turnos_asociados: shifts[0].total
      });
    }

    await pool.query('DELETE FROM plantillas_turno WHERE id = ?', [id]);

    await logAction(plantilla.empresa_id, userId, 'eliminar_plantilla_turno', 'plantillas_turno', id, {
      nombre: plantilla.nombre,
      razon: 'Eliminación manual'
    });

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
