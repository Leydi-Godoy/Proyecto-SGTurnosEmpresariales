const express = require('express')
const { pool } = require('../db')
const { authenticateToken } = require('../auth')

const router = express.Router()
const ADMIN_EMPRESA_ROLES = new Set(['2', 'admin', 'adminempresa', 'admin_empresa', 'admin empresa'])

router.use(authenticateToken, (req, res, next) => {
  const role = String(req.auth?.role || req.auth?.Id_rol || '').trim().toLowerCase()
  if (!ADMIN_EMPRESA_ROLES.has(role)) {
    return res.status(403).json({ error: 'adminempresa role required' })
  }
  next()
})

async function getEmpresaId(req) {
  const tokenCompanyId = Number(req.auth?.empresa_id)
  if (tokenCompanyId) return tokenCompanyId

  const userId = Number(req.auth?.id || req.auth?.Id_usuario)
  if (!userId) return 0

  const [rows] = await pool.query('SELECT empresa_id FROM usuarios WHERE id = ? LIMIT 1', [userId])
  return Number(rows[0]?.empresa_id || 0)
}

router.get('/', async (req, res) => {
  try {
    const empresaId = await getEmpresaId(req)
    if (!empresaId) return res.status(403).json({ error: 'empresa asociada requerida' })

    const [rows] = await pool.query(
      `SELECT id, empresa_id, nombre, direccion, zona_horaria, creado_en
       FROM sedes
       WHERE empresa_id = ?
       ORDER BY nombre ASC, id ASC`,
      [empresaId],
    )
    return res.json(rows)
  } catch (error) {
    console.error('company locations list error', error)
    return res.status(500).json({ error: 'could not list locations' })
  }
})

router.post('/', async (req, res) => {
  const nombre = String(req.body?.nombre || '').trim()
  const direccion = String(req.body?.direccion || '').trim()
  const zonaHoraria = String(req.body?.zona_horaria || '').trim()

  if (!nombre) return res.status(400).json({ error: 'nombre is required' })
  if (nombre.length > 255) return res.status(400).json({ error: 'nombre must be 255 characters or fewer' })
  if (direccion.length > 512) return res.status(400).json({ error: 'direccion must be 512 characters or fewer' })
  if (zonaHoraria.length > 64) return res.status(400).json({ error: 'zona_horaria must be 64 characters or fewer' })

  try {
    const empresaId = await getEmpresaId(req)
    if (!empresaId) return res.status(403).json({ error: 'empresa asociada requerida' })

    const [companies] = await pool.query('SELECT id FROM empresas WHERE id = ? LIMIT 1', [empresaId])
    if (!companies[0]) return res.status(403).json({ error: 'empresa asociada no válida' })

    const [result] = await pool.query(
      `INSERT INTO sedes (empresa_id, nombre, direccion, zona_horaria)
       VALUES (?, ?, ?, ?)`,
      [empresaId, nombre, direccion || null, zonaHoraria || null],
    )
    const [rows] = await pool.query(
      `SELECT id, empresa_id, nombre, direccion, zona_horaria, creado_en
       FROM sedes WHERE id = ? AND empresa_id = ?`,
      [result.insertId, empresaId],
    )
    return res.status(201).json(rows[0])
  } catch (error) {
    console.error('company location create error', error)
    return res.status(500).json({ error: 'could not create location' })
  }
})

module.exports = router