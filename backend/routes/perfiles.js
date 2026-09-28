const express = require('express')
const { pool } = require('../db')
const { authenticateToken } = require('../auth')

const router = express.Router()

router.use(authenticateToken)

async function getEmpresaId(req) {
  const tokenCompanyId = Number(req.auth?.empresa_id)
  if (tokenCompanyId) return tokenCompanyId

  const userId = req.auth?.id || req.auth?.Id_usuario
  if (!userId) return 0
  const [rows] = await pool.query('SELECT empresa_id FROM usuarios WHERE id = ? LIMIT 1', [userId])
  return Number(rows[0]?.empresa_id || 0)
}

router.get('/', async (req, res) => {
  const empresaId = await getEmpresaId(req)
  if (!empresaId) return res.status(403).json({ error: 'empresa asociada requerida' })

  try {
    let [rows] = await pool.query(
      `SELECT id, empresa_id, codigo, nombre, descripcion
       FROM especialidades
       WHERE empresa_id = ? OR empresa_id IS NULL
       ORDER BY nombre ASC, id ASC`,
      [empresaId],
    )

    // Companies without their own catalog can reuse the existing catalog.
    if (!rows.length) {
      [rows] = await pool.query(
        `SELECT MIN(id) AS id, MIN(empresa_id) AS empresa_id,
                MIN(codigo) AS codigo, nombre, MIN(descripcion) AS descripcion
         FROM especialidades
         GROUP BY nombre
         ORDER BY nombre ASC, id ASC`,
      )
    }
    return res.json(rows)
  } catch (error) {
    console.error('profiles list error', error)
    return res.status(500).json({ error: 'profiles table is not ready' })
  }
})

router.post('/', async (req, res) => {
  const empresaId = await getEmpresaId(req)
  const especialidadId = Number(req.body?.especialidad_id || 0)
  const nombre = String(req.body?.nombre || '').trim()
  const descripcion = String(req.body?.descripcion || '').trim()
  const codigo = String(req.body?.codigo || nombre)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

  if (!empresaId) return res.status(403).json({ error: 'empresa asociada requerida' })

  if (especialidadId) {
    try {
      const [existingRows] = await pool.query(
        `SELECT id, empresa_id, codigo, nombre, descripcion
         FROM especialidades
         WHERE id = ? AND (empresa_id = ? OR empresa_id IS NULL)
         LIMIT 1`,
        [especialidadId, empresaId],
      )
      const especialidad = existingRows[0]
      if (!especialidad) return res.status(404).json({ error: 'especialidad no disponible para esta empresa' })
      if (Number(especialidad.empresa_id) === empresaId) return res.json(especialidad)

      const [companyRows] = await pool.query(
        `SELECT id, empresa_id, codigo, nombre, descripcion
         FROM especialidades
         WHERE empresa_id = ? AND (codigo = ? OR LOWER(nombre) = LOWER(?))
         LIMIT 1`,
        [empresaId, especialidad.codigo, especialidad.nombre],
      )
      if (companyRows[0]) return res.json(companyRows[0])

      const [result] = await pool.query(
        `INSERT INTO especialidades (empresa_id, codigo, nombre, descripcion)
         VALUES (?, ?, ?, ?)`,
        [empresaId, especialidad.codigo, especialidad.nombre, especialidad.descripcion || null],
      )
      const [rows] = await pool.query(
        'SELECT id, empresa_id, codigo, nombre, descripcion FROM especialidades WHERE id = ?',
        [result.insertId],
      )
      return res.status(201).json(rows[0])
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'profile already exists for this company' })
      console.error('profile association error', error)
      return res.status(500).json({ error: 'could not associate profile' })
    }
  }

  if (!nombre) return res.status(400).json({ error: 'nombre is required' })
  if (!codigo) return res.status(400).json({ error: 'codigo is required' })

  try {
    const [duplicates] = await pool.query(
      `SELECT id FROM especialidades
       WHERE empresa_id = ? AND (LOWER(nombre) = LOWER(?) OR codigo = ?)
       LIMIT 1`,
      [empresaId, nombre, codigo],
    )
    if (duplicates[0]) return res.status(409).json({ error: 'profile already exists for this company' })

    const [result] = await pool.query(
      `INSERT INTO especialidades (empresa_id, codigo, nombre, descripcion)
       VALUES (?, ?, ?, ?)`,
      [empresaId, codigo, nombre, descripcion || null],
    )
    const [rows] = await pool.query('SELECT id, empresa_id, codigo, nombre, descripcion FROM especialidades WHERE id = ?', [result.insertId])
    return res.status(201).json(rows[0])
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'profile already exists for this company' })
    console.error('profile create error', error)
    return res.status(500).json({ error: 'could not create profile' })
  }
})

module.exports = router
