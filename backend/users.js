const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');
const { authenticateToken } = require('./auth');

const router = express.Router();
const SUPER_ADMIN_ROLES = new Set(['super_admin', 'superadmin', 'subad1', 'developer', '1', 'super administrador', 'superadministrador']);
const COMPANY_ADMIN_ROLES = new Set(['2', 'ademp2', 'admin', 'admin_empresa', 'admin empresa']);

function isSuperAdmin(req) {
  const role = String(req.auth?.role || '').trim().toLowerCase();
  return SUPER_ADMIN_ROLES.has(role);
}

function isCompanyAdmin(req) {
  const role = String(req.auth?.role || '').trim().toLowerCase();
  return COMPANY_ADMIN_ROLES.has(role);
}

function requireUsersAccess(req, res, next) {
  if (!isSuperAdmin(req) && !isCompanyAdmin(req)) {
    return res.status(403).json({ error: 'admin role required' });
  }
  next();
}

router.use(authenticateToken, requireUsersAccess);

router.get('/', async (req, res) => {
  try {
    const companyFilter = isCompanyAdmin(req) ? 'WHERE u.empresa_id = ?' : '';
    const params = isCompanyAdmin(req) ? [Number(req.auth.empresa_id)] : [];
    const [rows] = await pool.query(
      `SELECT u.id, u.empresa_id, e.nombre AS empresa_nombre, u.correo AS email,
        u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
        u.documento, u.id_rol AS rol,
        CONCAT_WS(' ', u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido) AS full_name,
        u.activo AS is_active, u.creado_en AS created_at,
        emp.especialidad_id, esp.nombre AS especialidad_nombre
       FROM usuarios u
       LEFT JOIN empresas e ON e.id = u.empresa_id
       LEFT JOIN empleados emp ON emp.usuario_id = u.id AND emp.empresa_id = u.empresa_id
       LEFT JOIN especialidades esp ON esp.id = emp.especialidad_id AND esp.empresa_id = u.empresa_id
       ${companyFilter}
       ORDER BY u.id DESC`,
      params,
    );
    res.json(rows);
  } catch (error) {
    console.error('users list error', error);
    res.status(500).json({ error: 'users table is not ready' });
  }
});

router.get('/company', async (req, res) => {
  const empresaId = Number(req.auth?.empresa_id);
  if (!empresaId) return res.status(403).json({ error: 'empresa asociada requerida' });

  try {
    const [rows] = await pool.query('SELECT id, nombre FROM empresas WHERE id = ? LIMIT 1', [empresaId]);
    if (!rows[0]) return res.status(404).json({ error: 'empresa no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    console.error('company context error', error);
    res.status(500).json({ error: 'company table is not ready' });
  }
});

router.post('/', async (req, res) => {
  const {
    email,
    password,
    fullName,
    empresa_id: empresaId,
    primer_nombre: primerNombre,
    segundo_nombre: segundoNombre,
    primer_apellido: primerApellido,
    segundo_apellido: segundoApellido,
    documento,
    especialidad_id: especialidadId,
    especialidad_ids: especialidadIds,
    rol = 5,
    activo = true,
  } = req.body || {};

  const correo = String(email || '').trim().toLowerCase();
  const empresaIdNumero = isCompanyAdmin(req) ? Number(req.auth.empresa_id) : Number(empresaId);
  const rolNumero = isCompanyAdmin(req) ? 5 : Number(rol);
  const especialidadIdsNumero = Array.from(new Set(
    (Array.isArray(especialidadIds) ? especialidadIds : [especialidadId])
      .filter(Boolean)
      .map(Number)
      .filter(Number.isInteger),
  ));
  const especialidadIdNumero = especialidadIdsNumero[0] || null;
  const nombreCompleto = String(fullName || '').trim();
  const nombres = primerNombre || nombreCompleto.split(/\s+/)[0] || null;
  const apellido = primerApellido || (nombreCompleto.split(/\s+/).length > 1 ? nombreCompleto.split(/\s+/).at(-1) : null);
  const contrasena = String(password || '').trim() || `${String(apellido || '').replace(/\s+/g, '')}123`;

  if (!correo || !contrasena || (!nombreCompleto && !nombres) || !empresaIdNumero || !apellido) {
    return res.status(400).json({ error: 'email, primer apellido, nombre y empresa_id son requeridos' });
  }
  if (!Number.isInteger(rolNumero) || rolNumero < 1 || rolNumero > 5) {
    return res.status(400).json({ error: 'rol debe estar entre 1 y 5' });
  }
  if (isCompanyAdmin(req) && !especialidadIdsNumero.length) {
    return res.status(400).json({ error: 'especialidad es requerida' });
  }
  try {
    if (especialidadIdsNumero.length) {
      const placeholders = especialidadIdsNumero.map(() => '?').join(', ');
      const [specialtyRows] = await pool.query(
        `SELECT id FROM especialidades WHERE empresa_id = ? AND id IN (${placeholders})`,
        [empresaIdNumero, ...especialidadIdsNumero],
      );
      const validSpecialtyIds = new Set(specialtyRows.map(row => Number(row.id)));
      if (specialidadIdsNumero.some(id => !validSpecialtyIds.has(id))) {
        return res.status(400).json({ error: 'una especialidad no pertenece a la empresa' });
      }
    }

    const passwordHash = await bcrypt.hash(contrasena, 12);

    const [result] = await pool.query(
      `INSERT INTO usuarios
        (empresa_id, correo, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
         documento, contrasena, activo, esta_activo, creado_en, id_rol)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [empresaIdNumero, correo, nombres, segundoNombre || null, apellido, segundoApellido || null,
        documento ? String(documento).trim() : null, passwordHash, Number(Boolean(activo)), Number(Boolean(activo)), rolNumero],
    );

    await pool.query(
      `INSERT INTO usuario_roles (usuario_id, rol_id, alcance)
       VALUES (?, ?, 'empresa')
       ON DUPLICATE KEY UPDATE rol_id = VALUES(rol_id)`,
      [result.insertId, rolNumero],
    );

    // Si el rol es 5 (Empleado), crear automáticamente registro en tabla empleados
    if (rolNumero === 5) {
      const codigoEmpleado = `EMP${empresaIdNumero}_${result.insertId}`;
      await pool.query(
        `INSERT IGNORE INTO empleados
          (usuario_id, empresa_id, codigo_empleado, especialidad_id, estado, creado_en)
         VALUES (?, ?, ?, ?, 'activo', NOW())`,
        [result.insertId, empresaIdNumero, codigoEmpleado, especialidadIdNumero],
      ).catch(err => {
        console.warn('Advertencia al crear empleado:', err.message);
        // No fallar si hay error al crear empleado, el trigger lo hará
      });

      await pool.query(
        `INSERT IGNORE INTO empleado_especialidades (empleado_id, especialidad_id)
         SELECT id, ? FROM empleados WHERE usuario_id = ? AND empresa_id = ? LIMIT 1`,
        [especialidadIdNumero, result.insertId, empresaIdNumero],
      );
      if (especialidadIdsNumero.length > 1) {
        const [employeeRows] = await pool.query(
          'SELECT id FROM empleados WHERE usuario_id = ? AND empresa_id = ? LIMIT 1',
          [result.insertId, empresaIdNumero],
        );
        const employeeId = employeeRows[0]?.id;
        if (employeeId) {
          await pool.query(
            `INSERT IGNORE INTO empleado_especialidades (empleado_id, especialidad_id)
             VALUES ${especialidadIdsNumero.map(() => '(?, ?)').join(', ')}`,
            especialidadIdsNumero.flatMap(id => [employeeId, id]),
          );
        }
      }
    }

    res.status(201).json({
      id: result.insertId,
      empresa_id: empresaIdNumero,
      email: correo,
      fullName: [nombres, segundoNombre, apellido, segundoApellido].filter(Boolean).join(' '),
      documento: documento ? String(documento).trim() : null,
      rol: rolNumero,
      especialidad_id: especialidadIdNumero,
      especialidad_ids: especialidadIdsNumero,
      activo: Boolean(activo),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email already exists' });
    console.error('user create error', error);
    res.status(500).json({ error: 'could not create user' });
  }
});

router.put('/:id', async (req, res) => {
  const usuarioId = Number(req.params.id);
  const {
    email,
    password,
    empresa_id: empresaId,
    primer_nombre: primerNombre,
    segundo_nombre: segundoNombre,
    primer_apellido: primerApellido,
    segundo_apellido: segundoApellido,
    documento,
    rol = 5,
    activo = true,
  } = req.body || {};

  const correo = String(email || '').trim().toLowerCase();
  const empresaIdNumero = Number(empresaId);
  const rolNumero = Number(rol);
  const nombres = String(primerNombre || '').trim();
  const apellido = String(primerApellido || '').trim();

  if (!usuarioId || !correo || !nombres || !apellido || !empresaIdNumero) {
    return res.status(400).json({ error: 'id, email, nombre, primer apellido y empresa_id son requeridos' });
  }
  if (!Number.isInteger(rolNumero) || rolNumero < 1 || rolNumero > 5) {
    return res.status(400).json({ error: 'rol debe estar entre 1 y 5' });
  }

  try {
    const [duplicateRows] = await pool.query(
      'SELECT id FROM usuarios WHERE empresa_id = ? AND correo = ? AND id <> ? LIMIT 1',
      [empresaIdNumero, correo, usuarioId],
    );
    if (duplicateRows[0]) return res.status(409).json({ error: 'email already exists' });

    const values = [
      empresaIdNumero,
      correo,
      nombres,
      String(segundoNombre || '').trim() || null,
      apellido,
      String(segundoApellido || '').trim() || null,
      documento ? String(documento).trim() : null,
      Number(Boolean(activo)),
      Number(Boolean(activo)),
      rolNumero,
      usuarioId,
    ];
    let query = `UPDATE usuarios
      SET empresa_id = ?, correo = ?, primer_nombre = ?, segundo_nombre = ?,
          primer_apellido = ?, segundo_apellido = ?, documento = ?, activo = ?,
          esta_activo = ?, actualizado_en = CURRENT_TIMESTAMP, id_rol = ?
      WHERE id = ?`;

    if (String(password || '').trim()) {
      query = `UPDATE usuarios
        SET empresa_id = ?, correo = ?, primer_nombre = ?, segundo_nombre = ?,
            primer_apellido = ?, segundo_apellido = ?, documento = ?, activo = ?,
            esta_activo = ?, actualizado_en = CURRENT_TIMESTAMP, id_rol = ?, contrasena = ?
        WHERE id = ?`;
      values.splice(values.length - 1, 0, await bcrypt.hash(String(password).trim(), 12));
    }

    const [result] = await pool.query(query, values);
    if (!result.affectedRows) return res.status(404).json({ error: 'user not found' });

    res.json({
      id: usuarioId,
      empresa_id: empresaIdNumero,
      email: correo,
      primer_nombre: nombres,
      segundo_nombre: String(segundoNombre || '').trim() || null,
      primer_apellido: apellido,
      segundo_apellido: String(segundoApellido || '').trim() || null,
      documento: documento ? String(documento).trim() : null,
      rol: rolNumero,
      activo: Boolean(activo),
      fullName: [nombres, segundoNombre, apellido, segundoApellido].filter(Boolean).join(' '),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email already exists' });
    console.error('user update error', error);
    res.status(500).json({ error: 'could not update user' });
  }
});

module.exports = router;