const express = require('express')
const { pool } = require('./db')
const { authenticateToken } = require('./auth')

const router = express.Router()
const SUPER_ADMIN_ROLES = new Set(['super_admin', 'superadmin', 'subad1', 'admin', 'developer', '1', 'super administrador', 'superadministrador'])

router.use(authenticateToken, (req, res, next) => {
  const role = String(req.auth?.role || '').trim().toLowerCase()
  if (!SUPER_ADMIN_ROLES.has(role)) {
    return res.status(403).json({ error: 'super admin role required' })
  }
  next()
})

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, nit, pais, ciudad, contacto, correo, telefono, activo, zona_horaria, plan_id, creado_en, actualizado_en
       FROM empresas
       ORDER BY nombre ASC, id ASC`,
    )
    res.json(rows)
  } catch (error) {
    console.error('companies list error', error)
    res.status(500).json({ error: 'companies table is not ready' })
  }
})

router.post('/', async (req, res) => {
  const nombre = String(req.body?.nombre || '').trim()
  const nit = String(req.body?.nit || '').trim()
  const pais = String(req.body?.pais || '').trim()
  const ciudad = String(req.body?.ciudad || '').trim()
  const contacto = String(req.body?.contacto || '').trim()
  const correo = String(req.body?.correo || req.body?.email || '').trim()
  const telefono = String(req.body?.telefono || '').trim()
  const activo = req.body?.activo === undefined ? 1 : Number(Boolean(req.body.activo))
  const zonaHoraria = String(req.body?.zona_horaria || '').trim() || 'UTC'
  const planId = Number(req.body?.plan_id)

  if (!nombre) return res.status(400).json({ error: 'nombre is required' })
  if (!['1', '2', '3'].includes(String(planId))) return res.status(400).json({ error: 'plan_id is required and must be 1, 2 or 3' })

  try {
    const [result] = await pool.query(
      `INSERT INTO empresas (nombre, nit, pais, ciudad, contacto, correo, telefono, activo, zona_horaria, plan_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, nit || null, pais || null, ciudad || null, contacto || null, correo || null, telefono || null, activo, zonaHoraria, planId],
    )
    const [rows] = await pool.query(
      `SELECT id, nombre, nit, pais, ciudad, contacto, correo, telefono, activo, zona_horaria, plan_id, creado_en, actualizado_en
       FROM empresas WHERE id = ?`,
      [result.insertId],
    )
    res.status(201).json(rows[0])
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'company already exists' })
    console.error('company create error', error)
    res.status(500).json({ error: 'could not create company' })
  }
})

router.put('/:id', async (req, res) => {
  const empresaId = Number(req.params.id)
  if (!empresaId) return res.status(400).json({ error: 'id is required' })

  const nombre = String(req.body?.nombre || '').trim()
  const nit = String(req.body?.nit || '').trim()
  const pais = String(req.body?.pais || '').trim()
  const ciudad = String(req.body?.ciudad || '').trim()
  const contacto = String(req.body?.contacto || '').trim()
  const correo = String(req.body?.correo || req.body?.email || '').trim()
  const telefono = String(req.body?.telefono || '').trim()
  const activo = req.body?.activo === undefined ? 1 : Number(Boolean(req.body.activo))
  const zonaHoraria = String(req.body?.zona_horaria || '').trim() || 'UTC'
  const planId = Number(req.body?.plan_id)

  if (!nombre) return res.status(400).json({ error: 'nombre is required' })
  if (!['1', '2', '3'].includes(String(planId))) return res.status(400).json({ error: 'plan_id is required and must be 1, 2 or 3' })

  try {
    await pool.query(
      `UPDATE empresas
       SET nombre = ?, nit = ?, pais = ?, ciudad = ?, contacto = ?, correo = ?, telefono = ?, activo = ?, zona_horaria = ?, plan_id = ?, actualizado_en = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nombre, nit || null, pais || null, ciudad || null, contacto || null, correo || null, telefono || null, activo, zonaHoraria, planId, empresaId],
    )

    const [rows] = await pool.query(
      `SELECT id, nombre, nit, pais, ciudad, contacto, correo, telefono, activo, zona_horaria, plan_id, creado_en, actualizado_en
       FROM empresas WHERE id = ?`,
      [empresaId],
    )

    res.json(rows[0])
  } catch (error) {
    console.error('company update error', error)
    res.status(500).json({ error: 'could not update company' })
  }
})

module.exports = router