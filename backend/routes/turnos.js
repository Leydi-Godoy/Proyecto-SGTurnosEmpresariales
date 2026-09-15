const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../auth');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Log action to audit table
 */
async function logAction(empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles) {
	try {
		await pool.query(
			`INSERT INTO registros_auditoria (empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, detalles)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			[empresa_id, usuario_id, accion, tabla_objetivo, id_objetivo, JSON.stringify(detalles || {})]
		);
	} catch (err) {
		console.error('Audit log error:', err.message);
	}
}

/**
 * Check if user belongs to company (unless Super Admin)
 */
function checkCompanyAccess(userRole, userCompany, requestCompany) {
	if (userRole === 1) return true; // Super Admin (role 1)
	return userCompany == requestCompany;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString) {
	return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !isNaN(Date.parse(dateString));
}

/**
 * Validate datetime format (YYYY-MM-DDTHH:MM:SS or ISO 8601)
 */
function isValidDateTime(dateTimeString) {
	return !isNaN(Date.parse(dateTimeString));
}

/**
 * Get employee count for shift (count of confirmados)
 */
async function getShiftStats(instancia_id) {
	try {
		const [rows] = await pool.query(
			`SELECT 
				COUNT(*) as total,
				SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
				SUM(CASE WHEN estado = 'asignado' THEN 1 ELSE 0 END) as asignados,
				SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes
			 FROM asignaciones_turno 
			 WHERE instancia_turno_id = ?`,
			[instancia_id]
		);
		return rows[0] || { total: 0, confirmados: 0, asignados: 0, pendientes: 0 };
	} catch (err) {
		return { total: 0, confirmados: 0, asignados: 0, pendientes: 0 };
	}
}

// ============================================================================
// ENDPOINT 1.1: Create Shift Instance
// ============================================================================
router.post('/', authenticateToken, async (req, res) => {
	const userId = req.user.Id_usuario;
	const userRole = req.user.Id_rol;
	const userCompany = req.user.empresa_id;

	// Only Planificador (role 3) can create turnos
	if (userRole != 3) {
		return res.status(403).json({ error: 'Solo Planificador puede crear turnos' });
	}

	const { plantilla_id, fecha, inicio_fecha_hora, fin_fecha_hora, sede_id, empresa_id } = req.body;

	// Validation
	if (!plantilla_id || !fecha || !inicio_fecha_hora || !fin_fecha_hora || !sede_id) {
		return res.status(400).json({
			error: 'Validation failed',
			details: {
				plantilla_id: !plantilla_id ? 'Required' : null,
				fecha: !fecha ? 'Required' : null,
				inicio_fecha_hora: !inicio_fecha_hora ? 'Required' : null,
				fin_fecha_hora: !fin_fecha_hora ? 'Required' : null,
				sede_id: !sede_id ? 'Required' : null
			}
		});
	}

	// Validate date format
	if (!isValidDate(fecha)) {
		return res.status(400).json({ error: 'fecha debe ser formato YYYY-MM-DD' });
	}

	// Validate datetimes
	if (!isValidDateTime(inicio_fecha_hora) || !isValidDateTime(fin_fecha_hora)) {
		return res.status(400).json({ error: 'Datetimes deben ser ISO 8601 format' });
	}

	// Get empresa_id from plantilla
	try {
		const [plantilla] = await pool.query(
			'SELECT empresa_id FROM plantillas_turno WHERE id = ?',
			[plantilla_id]
		);

		if (!plantilla[0]) {
			return res.status(404).json({ error: 'Plantilla not found' });
		}

		const empresaId = plantilla[0].empresa_id;

		// Check company access
		if (!checkCompanyAccess(userRole, userCompany, empresaId)) {
			return res.status(403).json({ error: 'Cannot access other companies' });
		}

		// Check if sede belongs to same company
		const [sede] = await pool.query(
			'SELECT id FROM sedes WHERE id = ? AND empresa_id = ?',
			[sede_id, empresaId]
		);

		if (!sede[0]) {
			return res.status(404).json({ error: 'Sede not found or belongs to different company' });
		}

		// Insert turno
		const [result] = await pool.query(
			`INSERT INTO instancias_turno 
			 (plantilla_id, fecha, inicio_fecha_hora, fin_fecha_hora, sede_id, creado_por, creado_en)
			 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
			[plantilla_id, fecha, inicio_fecha_hora, fin_fecha_hora, sede_id, userId]
		);

		// Log action
		await logAction(empresaId, userId, 'crear_turno', 'instancias_turno', result.insertId, {
			plantilla_id,
			fecha,
			inicio_fecha_hora,
			fin_fecha_hora,
			sede_id
		});

		// Get created turno with plantilla info
		const [createdTurno] = await pool.query(
			`SELECT 
				it.id,
				it.plantilla_id,
				pt.nombre as plantilla_nombre,
				it.fecha,
				it.inicio_fecha_hora,
				it.fin_fecha_hora,
				it.sede_id,
				s.nombre as sede_nombre,
				it.creado_por,
				it.creado_en
			 FROM instancias_turno it
			 JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			 JOIN sedes s ON it.sede_id = s.id
			 WHERE it.id = ?`,
			[result.insertId]
		);

		const stats = await getShiftStats(result.insertId);

		return res.status(201).json({
			...createdTurno[0],
			asignaciones_confirmadas: stats.confirmados,
			asignaciones_totales: stats.total
		});
	} catch (err) {
		console.error('Create turno error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

// ============================================================================
// ENDPOINT 1.2: List Shift Instances
// ============================================================================
router.get('/', authenticateToken, async (req, res) => {
	const userRole = req.user.Id_rol;
	const userCompany = req.user.empresa_id;

	const { empresa_id, fecha_desde, fecha_hasta, estado, limit = 100, offset = 0 } = req.query;

	// Check company access
	const reqEmpresa = empresa_id || userCompany;
	if (!checkCompanyAccess(userRole, userCompany, reqEmpresa)) {
		return res.status(403).json({ error: 'Cannot access other companies' });
	}

	try {
		let query = `
			SELECT 
				it.id,
				it.plantilla_id,
				pt.nombre as plantilla_nombre,
				it.fecha,
				it.inicio_fecha_hora,
				it.fin_fecha_hora,
				it.sede_id,
				s.nombre as sede_nombre,
				it.creado_por,
				it.creado_en,
				COUNT(DISTINCT CASE WHEN at.estado = 'confirmado' THEN at.id END) as asignaciones_confirmadas,
				COUNT(DISTINCT at.id) as asignaciones_totales
			FROM instancias_turno it
			JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			JOIN sedes s ON it.sede_id = s.id
			LEFT JOIN asignaciones_turno at ON it.id = at.instancia_turno_id
			WHERE pt.empresa_id = ?
		`;

		const params = [reqEmpresa];

		if (fecha_desde) {
			query += ` AND it.fecha >= ?`;
			params.push(fecha_desde);
		}

		if (fecha_hasta) {
			query += ` AND it.fecha <= ?`;
			params.push(fecha_hasta);
		}

		query += ` GROUP BY it.id ORDER BY it.fecha DESC, it.inicio_fecha_hora DESC LIMIT ? OFFSET ?`;
		params.push(parseInt(limit), parseInt(offset));

		const [turnos] = await pool.query(query, params);

		return res.json(turnos);
	} catch (err) {
		console.error('List turnos error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

// ============================================================================
// ENDPOINT 1.3: Get Shift Instance Details
// ============================================================================
router.get('/:id', authenticateToken, async (req, res) => {
	const userRole = req.user.Id_rol;
	const userCompany = req.user.empresa_id;
	const turnoId = req.params.id;

	try {
		// Get turno with plantilla and sede
		const [turno] = await pool.query(
			`SELECT 
				it.id,
				it.plantilla_id,
				it.fecha,
				it.inicio_fecha_hora,
				it.fin_fecha_hora,
				it.sede_id,
				it.creado_por,
				it.creado_en,
				pt.nombre as plantilla_nombre,
				pt.empresa_id,
				pt.hora_inicio,
				pt.hora_fin,
				pt.duracion_minutos,
				pt.es_nocturno,
				s.nombre as sede_nombre,
				s.direccion
			 FROM instancias_turno it
			 JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			 JOIN sedes s ON it.sede_id = s.id
			 WHERE it.id = ?`,
			[turnoId]
		);

		if (!turno[0]) {
			return res.status(404).json({ error: 'Turno not found' });
		}

		// Check company access
		if (!checkCompanyAccess(userRole, userCompany, turno[0].empresa_id)) {
			return res.status(403).json({ error: 'Cannot access other companies' });
		}

		// Get asignaciones with empleado info
		const [asignaciones] = await pool.query(
			`SELECT 
				at.id,
				at.empleado_id,
				u.primer_nombre,
				u.primer_apellido,
				CONCAT(u.primer_nombre, ' ', u.primer_apellido) as empleado_nombre,
				e.especialidad_id,
				esp.nombre as especialidad_nombre,
				at.estado,
				at.asignado_en,
				at.asignado_por
			 FROM asignaciones_turno at
			 JOIN empleados e ON at.empleado_id = e.id
			 JOIN usuarios u ON e.usuario_id = u.id
			 LEFT JOIN especialidades esp ON e.especialidad_id = esp.id
			 WHERE at.instancia_turno_id = ?
			 ORDER BY at.asignado_en DESC`,
			[turnoId]
		);

		// Get creator info
		const [creator] = await pool.query(
			`SELECT 
				u.id,
				u.primer_nombre,
				u.primer_apellido,
				CONCAT(u.primer_nombre, ' ', u.primer_apellido) as nombre,
				r.nombre as rol
			 FROM usuarios u
			 LEFT JOIN roles r ON u.id = (SELECT DISTINCT rol_id FROM usuario_roles WHERE usuario_id = u.id LIMIT 1)
			 WHERE u.id = ?`,
			[turno[0].creado_por]
		);

		return res.json({
			id: turno[0].id,
			plantilla_id: turno[0].plantilla_id,
			plantilla: {
				id: turno[0].plantilla_id,
				nombre: turno[0].plantilla_nombre,
				hora_inicio: turno[0].hora_inicio,
				hora_fin: turno[0].hora_fin,
				duracion_minutos: turno[0].duracion_minutos,
				es_nocturno: turno[0].es_nocturno
			},
			fecha: turno[0].fecha,
			inicio_fecha_hora: turno[0].inicio_fecha_hora,
			fin_fecha_hora: turno[0].fin_fecha_hora,
			sede_id: turno[0].sede_id,
			sede: {
				id: turno[0].sede_id,
				nombre: turno[0].sede_nombre,
				direccion: turno[0].direccion
			},
			creado_por: turno[0].creado_por,
			creador: creator[0] || null,
			creado_en: turno[0].creado_en,
			asignaciones: asignaciones
		});
	} catch (err) {
		console.error('Get turno error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

// ============================================================================
// ENDPOINT 1.4: Update Shift Instance
// ============================================================================
router.put('/:id', authenticateToken, async (req, res) => {
	const userId = req.user.Id_usuario;
	const userRole = req.user.Id_rol;
	const userCompany = req.user.empresa_id;
	const turnoId = req.params.id;

	// Only Planificador can update
	if (userRole != 3) {
		return res.status(403).json({ error: 'Solo Planificador puede actualizar turnos' });
	}

	const { inicio_fecha_hora, fin_fecha_hora, sede_id } = req.body;

	try {
		// Get current turno to verify company access
		const [turno] = await pool.query(
			`SELECT pt.empresa_id FROM instancias_turno it
			 JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			 WHERE it.id = ?`,
			[turnoId]
		);

		if (!turno[0]) {
			return res.status(404).json({ error: 'Turno not found' });
		}

		if (!checkCompanyAccess(userRole, userCompany, turno[0].empresa_id)) {
			return res.status(403).json({ error: 'Cannot access other companies' });
		}

		// Prepare update
		const updates = {};
		const params = [];

		if (inicio_fecha_hora) {
			if (!isValidDateTime(inicio_fecha_hora)) {
				return res.status(400).json({ error: 'inicio_fecha_hora must be ISO 8601 format' });
			}
			updates.inicio_fecha_hora = inicio_fecha_hora;
		}

		if (fin_fecha_hora) {
			if (!isValidDateTime(fin_fecha_hora)) {
				return res.status(400).json({ error: 'fin_fecha_hora must be ISO 8601 format' });
			}
			updates.fin_fecha_hora = fin_fecha_hora;
		}

		if (sede_id) {
			// Verify sede belongs to company
			const [sede] = await pool.query(
				'SELECT id FROM sedes WHERE id = ? AND empresa_id = ?',
				[sede_id, turno[0].empresa_id]
			);
			if (!sede[0]) {
				return res.status(404).json({ error: 'Sede not found' });
			}
			updates.sede_id = sede_id;
		}

		if (Object.keys(updates).length === 0) {
			return res.status(400).json({ error: 'No fields to update' });
		}

		let query = 'UPDATE instancias_turno SET ';
		const keys = Object.keys(updates);
		query += keys.map(k => `${k} = ?`).join(', ');
		query += ' WHERE id = ?';

		const values = [...Object.values(updates), turnoId];

		await pool.query(query, values);

		// Log action
		await logAction(turno[0].empresa_id, userId, 'actualizar_turno', 'instancias_turno', turnoId, updates);

		// Get updated turno
		const [updated] = await pool.query(
			`SELECT 
				it.id,
				it.plantilla_id,
				pt.nombre as plantilla_nombre,
				it.fecha,
				it.inicio_fecha_hora,
				it.fin_fecha_hora,
				it.sede_id,
				s.nombre as sede_nombre,
				it.creado_por,
				it.creado_en
			 FROM instancias_turno it
			 JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			 JOIN sedes s ON it.sede_id = s.id
			 WHERE it.id = ?`,
			[turnoId]
		);

		return res.json(updated[0]);
	} catch (err) {
		console.error('Update turno error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

// ============================================================================
// ENDPOINT 1.5: Delete Shift Instance
// ============================================================================
router.delete('/:id', authenticateToken, async (req, res) => {
	const userId = req.user.Id_usuario;
	const userRole = req.user.Id_rol;
	const userCompany = req.user.empresa_id;
	const turnoId = req.params.id;

	// Only Planificador can delete
	if (userRole != 3) {
		return res.status(403).json({ error: 'Solo Planificador puede eliminar turnos' });
	}

	try {
		// Get turno to verify company access
		const [turno] = await pool.query(
			`SELECT pt.empresa_id FROM instancias_turno it
			 JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			 WHERE it.id = ?`,
			[turnoId]
		);

		if (!turno[0]) {
			return res.status(404).json({ error: 'Turno not found' });
		}

		if (!checkCompanyAccess(userRole, userCompany, turno[0].empresa_id)) {
			return res.status(403).json({ error: 'Cannot access other companies' });
		}

		// Delete asignaciones first
		await pool.query('DELETE FROM asignaciones_turno WHERE instancia_turno_id = ?', [turnoId]);

		// Delete turno
		await pool.query('DELETE FROM instancias_turno WHERE id = ?', [turnoId]);

		// Log action
		await logAction(turno[0].empresa_id, userId, 'eliminar_turno', 'instancias_turno', turnoId, {});

		return res.json({ success: true, message: 'Turno eliminado' });
	} catch (err) {
		console.error('Delete turno error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

// ============================================================================
// ENDPOINT 1.6: Assign Employee to Shift
// ============================================================================
router.post('/:instancia_id/asignaciones', authenticateToken, async (req, res) => {
	const userId = req.user.Id_usuario;
	const userRole = req.user.Id_rol;
	const userCompany = req.user.empresa_id;
	const instanciaId = req.params.instancia_id;

	// Only Planificador (3) or Supervisor (4) can assign
	if (![3, 4].includes(parseInt(userRole))) {
		return res.status(403).json({ error: 'Solo Planificador o Supervisor pueden asignar turnos' });
	}

	const { empleado_id, estado = 'pendiente' } = req.body;

	if (!empleado_id) {
		return res.status(400).json({ error: 'empleado_id required' });
	}

	// Validate estado
	const validStates = ['pendiente', 'asignado', 'confirmado', 'rechazado', 'cambio_solicitado'];
	if (!validStates.includes(estado)) {
		return res.status(400).json({ error: `Invalid estado. Allowed: ${validStates.join(', ')}` });
	}

	try {
		// Verify turno exists and get company
		const [turnoData] = await pool.query(
			`SELECT pt.empresa_id FROM instancias_turno it
			 JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			 WHERE it.id = ?`,
			[instanciaId]
		);

		if (!turnoData[0]) {
			return res.status(404).json({ error: 'Turno not found' });
		}

		if (!checkCompanyAccess(userRole, userCompany, turnoData[0].empresa_id)) {
			return res.status(403).json({ error: 'Cannot access other companies' });
		}

		// Verify empleado exists and is activo
		const [empleado] = await pool.query(
			`SELECT e.id, e.usuario_id, e.especialidad_id, e.estado,
					u.primer_nombre, u.primer_apellido,
					CONCAT(u.primer_nombre, ' ', u.primer_apellido) as empleado_nombre,
					esp.nombre as especialidad_nombre
			 FROM empleados e
			 JOIN usuarios u ON e.usuario_id = u.id
			 LEFT JOIN especialidades esp ON e.especialidad_id = esp.id
			 WHERE e.id = ? AND e.empresa_id = ?`,
			[empleado_id, turnoData[0].empresa_id]
		);

		if (!empleado[0]) {
			return res.status(404).json({ error: 'Empleado not found in this company' });
		}

		if (empleado[0].estado !== 'activo') {
			return res.status(400).json({ error: 'Empleado is not active' });
		}

		// Check if already assigned
		const [existing] = await pool.query(
			'SELECT id FROM asignaciones_turno WHERE instancia_turno_id = ? AND empleado_id = ?',
			[instanciaId, empleado_id]
		);

		if (existing[0]) {
			return res.status(400).json({ error: 'Empleado already assigned to this turno' });
		}

		// Create asignacion
		const [result] = await pool.query(
			`INSERT INTO asignaciones_turno (instancia_turno_id, empleado_id, asignado_por, estado, asignado_en)
			 VALUES (?, ?, ?, ?, NOW())`,
			[instanciaId, empleado_id, userId, estado]
		);

		// Log action
		await logAction(turnoData[0].empresa_id, userId, 'asignar_turno', 'asignaciones_turno', result.insertId, {
			instancia_turno_id: instanciaId,
			empleado_id,
			estado
		});

		return res.status(201).json({
			id: result.insertId,
			instancia_turno_id: instanciaId,
			empleado_id,
			empleado_nombre: empleado[0].empleado_nombre,
			especialidad_id: empleado[0].especialidad_id,
			especialidad_nombre: empleado[0].especialidad_nombre,
			estado,
			asignado_en: new Date(),
			asignado_por: userId
		});
	} catch (err) {
		console.error('Create asignacion error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

// ============================================================================
// ENDPOINT 1.7: Get Shift Assignments
// ============================================================================
router.get('/:instancia_id/asignaciones', authenticateToken, async (req, res) => {
	const userRole = req.user.Id_rol;
	const userCompany = req.user.empresa_id;
	const instanciaId = req.params.instancia_id;

	try {
		// Verify turno exists and company access
		const [turnoData] = await pool.query(
			`SELECT pt.empresa_id FROM instancias_turno it
			 JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			 WHERE it.id = ?`,
			[instanciaId]
		);

		if (!turnoData[0]) {
			return res.status(404).json({ error: 'Turno not found' });
		}

		if (!checkCompanyAccess(userRole, userCompany, turnoData[0].empresa_id)) {
			return res.status(403).json({ error: 'Cannot access other companies' });
		}

		// Get asignaciones
		const [asignaciones] = await pool.query(
			`SELECT 
				at.id,
				at.empleado_id,
				u.primer_nombre,
				u.primer_apellido,
				CONCAT(u.primer_nombre, ' ', u.primer_apellido) as empleado_nombre,
				e.especialidad_id,
				esp.nombre as especialidad_nombre,
				e.estado as empleado_estado,
				at.estado,
				at.asignado_en,
				at.asignado_por
			 FROM asignaciones_turno at
			 JOIN empleados e ON at.empleado_id = e.id
			 JOIN usuarios u ON e.usuario_id = u.id
			 LEFT JOIN especialidades esp ON e.especialidad_id = esp.id
			 WHERE at.instancia_turno_id = ?
			 ORDER BY at.asignado_en DESC`,
			[instanciaId]
		);

		return res.json(asignaciones);
	} catch (err) {
		console.error('Get asignaciones error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

// ============================================================================
// ENDPOINT 1.8: Update Assignment Status
// ============================================================================
router.put('/:instancia_id/asignaciones/:asignacion_id', authenticateToken, async (req, res) => {
	const userId = req.user.Id_usuario;
	const userRole = req.user.Id_rol;
	const userCompany = req.user.empresa_id;
	const instanciaId = req.params.instancia_id;
	const asignacionId = req.params.asignacion_id;

	const { estado } = req.body;

	if (!estado) {
		return res.status(400).json({ error: 'estado required' });
	}

	const validStates = ['pendiente', 'asignado', 'confirmado', 'rechazado', 'cambio_solicitado'];
	if (!validStates.includes(estado)) {
		return res.status(400).json({ error: `Invalid estado. Allowed: ${validStates.join(', ')}` });
	}

	try {
		// Verify turno exists
		const [turnoData] = await pool.query(
			`SELECT pt.empresa_id FROM instancias_turno it
			 JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			 WHERE it.id = ?`,
			[instanciaId]
		);

		if (!turnoData[0]) {
			return res.status(404).json({ error: 'Turno not found' });
		}

		if (!checkCompanyAccess(userRole, userCompany, turnoData[0].empresa_id)) {
			return res.status(403).json({ error: 'Cannot access other companies' });
		}

		// Verify asignacion exists
		const [asignacion] = await pool.query(
			'SELECT * FROM asignaciones_turno WHERE id = ? AND instancia_turno_id = ?',
			[asignacionId, instanciaId]
		);

		if (!asignacion[0]) {
			return res.status(404).json({ error: 'Asignacion not found' });
		}

		// Update
		await pool.query(
			'UPDATE asignaciones_turno SET estado = ? WHERE id = ?',
			[estado, asignacionId]
		);

		// Log action
		await logAction(turnoData[0].empresa_id, userId, 'actualizar_asignacion', 'asignaciones_turno', asignacionId, {
			estado
		});

		// Get updated asignacion
		const [updated] = await pool.query(
			`SELECT 
				at.id,
				at.empleado_id,
				u.primer_nombre,
				u.primer_apellido,
				CONCAT(u.primer_nombre, ' ', u.primer_apellido) as empleado_nombre,
				e.especialidad_id,
				esp.nombre as especialidad_nombre,
				at.estado,
				at.asignado_en,
				at.asignado_por
			 FROM asignaciones_turno at
			 JOIN empleados e ON at.empleado_id = e.id
			 JOIN usuarios u ON e.usuario_id = u.id
			 LEFT JOIN especialidades esp ON e.especialidad_id = esp.id
			 WHERE at.id = ?`,
			[asignacionId]
		);

		return res.json(updated[0]);
	} catch (err) {
		console.error('Update asignacion error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

// ============================================================================
// ENDPOINT 1.9: Remove Assignment
// ============================================================================
router.delete('/:instancia_id/asignaciones/:asignacion_id', authenticateToken, async (req, res) => {
	const userId = req.user.Id_usuario;
	const userRole = req.user.Id_rol;
	const userCompany = req.user.empresa_id;
	const instanciaId = req.params.instancia_id;
	const asignacionId = req.params.asignacion_id;

	// Only Planificador can delete
	if (userRole != 3) {
		return res.status(403).json({ error: 'Solo Planificador puede eliminar asignaciones' });
	}

	try {
		// Verify turno exists
		const [turnoData] = await pool.query(
			`SELECT pt.empresa_id FROM instancias_turno it
			 JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			 WHERE it.id = ?`,
			[instanciaId]
		);

		if (!turnoData[0]) {
			return res.status(404).json({ error: 'Turno not found' });
		}

		if (!checkCompanyAccess(userRole, userCompany, turnoData[0].empresa_id)) {
			return res.status(403).json({ error: 'Cannot access other companies' });
		}

		// Verify and delete asignacion
		const [asignacion] = await pool.query(
			'SELECT * FROM asignaciones_turno WHERE id = ? AND instancia_turno_id = ?',
			[asignacionId, instanciaId]
		);

		if (!asignacion[0]) {
			return res.status(404).json({ error: 'Asignacion not found' });
		}

		await pool.query('DELETE FROM asignaciones_turno WHERE id = ?', [asignacionId]);

		// Log action
		await logAction(turnoData[0].empresa_id, userId, 'eliminar_asignacion', 'asignaciones_turno', asignacionId, {});

		return res.json({ success: true, message: 'Asignacion eliminada' });
	} catch (err) {
		console.error('Delete asignacion error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

// ============================================================================
// ENDPOINT 1.10: Employee List My Assigned Shifts
// ============================================================================
router.get('/empleado/mis-turnos', authenticateToken, async (req, res) => {
	const userId = req.user.Id_usuario;
	const userRole = req.user.Id_rol;

	// Only Empleado (5) can use this endpoint
	if (userRole != 5) {
		return res.status(403).json({ error: 'Solo Empleado puede ver sus turnos' });
	}

	const { estado, limit = 100, offset = 0 } = req.query;

	try {
		// Get empleado_id from user
		const [empleadoRow] = await pool.query(
			'SELECT id FROM empleados WHERE usuario_id = ?',
			[userId]
		);

		if (!empleadoRow[0]) {
			return res.status(404).json({ error: 'Employee record not found' });
		}

		const empleadoId = empleadoRow[0].id;

		// Build query
		let query = `
			SELECT 
				it.id,
				pt.nombre as plantilla_nombre,
				it.fecha,
				it.inicio_fecha_hora,
				it.fin_fecha_hora,
				s.nombre as sede_nombre,
				at.estado,
				at.id as asignacion_id,
				at.asignado_en,
				u.primer_nombre as creador_primer_nombre,
				u.primer_apellido as creador_primer_apellido,
				CONCAT(u.primer_nombre, ' ', u.primer_apellido) as creador_nombre
			FROM asignaciones_turno at
			JOIN instancias_turno it ON at.instancia_turno_id = it.id
			JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			JOIN sedes s ON it.sede_id = s.id
			JOIN usuarios u ON it.creado_por = u.id
			WHERE at.empleado_id = ?
		`;

		const params = [empleadoId];

		if (estado) {
			query += ` AND at.estado = ?`;
			params.push(estado);
		}

		query += ` ORDER BY it.fecha DESC, it.inicio_fecha_hora DESC LIMIT ? OFFSET ?`;
		params.push(parseInt(limit), parseInt(offset));

		const [turnos] = await pool.query(query, params);

		return res.json(turnos);
	} catch (err) {
		console.error('Get empleado turnos error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

// ============================================================================
// ENDPOINT 1.11: Employee Confirm/Reject Assignment
// ============================================================================
router.put('/empleado/:asignacion_id/confirmar', authenticateToken, async (req, res) => {
	const userId = req.user.Id_usuario;
	const userRole = req.user.Id_rol;
	const asignacionId = req.params.asignacion_id;

	// Only Empleado can confirm
	if (userRole != 5) {
		return res.status(403).json({ error: 'Solo Empleado puede confirmar turnos' });
	}

	const { estado } = req.body;

	if (!estado) {
		return res.status(400).json({ error: 'estado required' });
	}

	const validStates = ['confirmado', 'rechazado'];
	if (!validStates.includes(estado)) {
		return res.status(400).json({ error: `Empleado can only set estado to: ${validStates.join(', ')}` });
	}

	try {
		// Get asignacion
		const [asignacion] = await pool.query(
			`SELECT at.*, e.usuario_id, it.id as turno_id,
					pt.empresa_id
			 FROM asignaciones_turno at
			 JOIN empleados e ON at.empleado_id = e.id
			 JOIN instancias_turno it ON at.instancia_turno_id = it.id
			 JOIN plantillas_turno pt ON it.plantilla_id = pt.id
			 WHERE at.id = ?`,
			[asignacionId]
		);

		if (!asignacion[0]) {
			return res.status(404).json({ error: 'Asignacion not found' });
		}

		// Verify it's the right employee
		if (asignacion[0].usuario_id != userId) {
			return res.status(403).json({ error: 'Cannot confirm other employee\'s assignments' });
		}

		// Update estado
		await pool.query(
			'UPDATE asignaciones_turno SET estado = ? WHERE id = ?',
			[estado, asignacionId]
		);

		// Log action
		await logAction(asignacion[0].empresa_id, userId, 'empleado_confirmar_turno', 'asignaciones_turno', asignacionId, {
			estado
		});

		// Get updated asignacion
		const [updated] = await pool.query(
			`SELECT 
				at.id,
				at.empleado_id,
				u.primer_nombre,
				u.primer_apellido,
				CONCAT(u.primer_nombre, ' ', u.primer_apellido) as empleado_nombre,
				at.estado,
				at.asignado_en
			 FROM asignaciones_turno at
			 JOIN empleados e ON at.empleado_id = e.id
			 JOIN usuarios u ON e.usuario_id = u.id
			 WHERE at.id = ?`,
			[asignacionId]
		);

		return res.json(updated[0]);
	} catch (err) {
		console.error('Confirm assignment error:', err);
		return res.status(500).json({ error: 'Database error', details: err.message });
	}
});

module.exports = router;
