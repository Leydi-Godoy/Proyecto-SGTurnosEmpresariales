const express = require('express')
const { pool } = require('../db')
const { authenticateToken } = require('../auth')

const router = express.Router()
const ADMIN_ROLES = new Set(['1', '2', 'admin', 'adminempresa', 'admin_empresa', 'admin empresa', 'super_admin', 'superadmin'])
const TURNOS = {
  Mañana: { horaInicio: '06:00:00', horaFin: '14:00:00', esNocturno: 0 },
  Tarde: { horaInicio: '14:00:00', horaFin: '22:00:00', esNocturno: 0 },
  Noche: { horaInicio: '22:00:00', horaFin: '06:00:00', esNocturno: 1 }
}

router.use(authenticateToken, (req, res, next) => {
  const role = String(req.auth?.role || req.auth?.Id_rol || '').trim().toLowerCase()
  if (!ADMIN_ROLES.has(role)) return res.status(403).json({ error: 'adminempresa role required' })
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

function parsePayload(body) {
  const sedeId = Number(body?.sede_id)
  const turno = String(body?.turno || '')
  const horario = TURNOS[turno]
  const requisitos = body?.requerimientos

  if (!Number.isSafeInteger(sedeId) || sedeId < 1) return { error: 'sede_id is required' }
  if (!horario) return { error: 'turno is invalid' }
  if (!Array.isArray(requisitos) || requisitos.length === 0) return { error: 'at least one requirement is required' }

  const seenSpecialties = new Set()
  const requerimientos = []
  for (const item of requisitos) {
    const especialidadId = Number(item?.especialidad_id)
    const cantidad = Number(item?.cantidad)
    if (!Number.isSafeInteger(especialidadId) || especialidadId < 1) return { error: 'especialidad_id is invalid' }
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) return { error: 'cantidad must be a positive integer' }
    if (seenSpecialties.has(especialidadId)) return { error: 'duplicate especialidad_id' }
    seenSpecialties.add(especialidadId)
    requerimientos.push({ especialidadId, cantidad })
  }

  return { sedeId, turno, horario, requerimientos }
}

async function validateCompanyReferences(connection, empresaId, payload) {
  const [sedes] = await connection.query(
    'SELECT id FROM sedes WHERE id = ? AND empresa_id = ? LIMIT 1',
    [payload.sedeId, empresaId],
  )
  if (!sedes[0]) return 'La sede no pertenece a esta empresa.'

  const ids = payload.requerimientos.map(item => item.especialidadId)
  const [especialidades] = await connection.query(
    'SELECT id FROM especialidades WHERE id IN (?) AND (empresa_id = ? OR empresa_id IS NULL)',
    [ids, empresaId],
  )
  if (especialidades.length !== ids.length) return 'Una o más especialidades no están disponibles para esta empresa.'
  return null
}

async function insertRequerimientos(connection, plantillaId, requerimientos) {
  const values = requerimientos.map(item => [plantillaId, item.especialidadId, item.cantidad])
  await connection.query(
    'INSERT INTO plantilla_turno_requerimientos (plantilla_id, especialidad_id, cantidad_usuarios) VALUES ?',
    [values],
  )
}

function agruparPlantillas(rows) {
  const plantillas = new Map()
  for (const row of rows) {
    let plantilla = plantillas.get(row.id)
    if (!plantilla) {
      plantilla = {
        id: row.id,
        empresa_id: row.empresa_id,
        sede_id: row.sede_id,
        sede: row.sede,
        turno: row.nombre,
        hora_inicio: row.hora_inicio,
        hora_fin: row.hora_fin,
        creado_en: row.creado_en,
        requerimientos: []
      }
      plantillas.set(row.id, plantilla)
    }
    if (row.especialidad_id) {
      plantilla.requerimientos.push({
        especialidad_id: row.especialidad_id,
        perfil: row.especialidad,
        cantidad: row.cantidad_usuarios
      })
    }
  }
  return [...plantillas.values()]
}

async function getPlantilla(empresaId, plantillaId) {
  const [rows] = await pool.query(
    `SELECT pt.id, pt.empresa_id, pt.sede_id, s.nombre AS sede, pt.nombre,
            pt.hora_inicio, pt.hora_fin, pt.creado_en,
            r.especialidad_id, e.nombre AS especialidad, r.cantidad_usuarios
     FROM plantillas_turno pt
     JOIN sedes s ON s.id = pt.sede_id AND s.empresa_id = pt.empresa_id
     LEFT JOIN plantilla_turno_requerimientos r ON r.plantilla_id = pt.id
     LEFT JOIN especialidades e ON e.id = r.especialidad_id
     WHERE pt.empresa_id = ? AND pt.id = ?
     ORDER BY e.nombre ASC`,
    [empresaId, plantillaId],
  )
  return agruparPlantillas(rows)[0] || null
}

router.get('/', async (req, res) => {
  try {
    const empresaId = await getEmpresaId(req)
    if (!empresaId) return res.status(403).json({ error: 'empresa asociada requerida' })

    const [rows] = await pool.query(
      `SELECT pt.id, pt.empresa_id, pt.sede_id, s.nombre AS sede, pt.nombre,
              pt.hora_inicio, pt.hora_fin, pt.creado_en,
              r.especialidad_id, e.nombre AS especialidad, r.cantidad_usuarios
       FROM plantillas_turno pt
       JOIN sedes s ON s.id = pt.sede_id AND s.empresa_id = pt.empresa_id
       LEFT JOIN plantilla_turno_requerimientos r ON r.plantilla_id = pt.id
       LEFT JOIN especialidades e ON e.id = r.especialidad_id
       WHERE pt.empresa_id = ? AND pt.sede_id IS NOT NULL
       ORDER BY pt.creado_en DESC, pt.id DESC, e.nombre ASC`,
      [empresaId],
    )
    return res.json(agruparPlantillas(rows))
  } catch (error) {
    console.error('coverage templates list error', error)
    return res.status(500).json({ error: 'could not list coverage templates' })
  }
})

router.post('/', async (req, res) => {
  const empresaId = await getEmpresaId(req)
  if (!empresaId) return res.status(403).json({ error: 'empresa asociada requerida' })

  const payload = parsePayload(req.body)
  if (payload.error) return res.status(400).json({ error: payload.error })

  let connection
  try {
    connection = await pool.getConnection()
    const referenceError = await validateCompanyReferences(connection, empresaId, payload)
    if (referenceError) return res.status(400).json({ error: referenceError })

    await connection.beginTransaction()
    const { horario } = payload
    const duracionMinutos = 480
    const [result] = await connection.query(
      `INSERT INTO plantillas_turno
       (empresa_id, sede_id, nombre, hora_inicio, hora_fin, duracion_minutos, es_nocturno, tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'FIJO')`,
      [empresaId, payload.sedeId, payload.turno, horario.horaInicio, horario.horaFin, duracionMinutos, horario.esNocturno],
    )
    await insertRequerimientos(connection, result.insertId, payload.requerimientos)
    await connection.commit()

    const plantilla = await getPlantilla(empresaId, result.insertId)
    return res.status(201).json(plantilla)
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('coverage template create error', error)
    return res.status(500).json({ error: 'could not create coverage template' })
  } finally {
    if (connection) connection.release()
  }
})

router.put('/:id', async (req, res) => {
  const empresaId = await getEmpresaId(req)
  const plantillaId = Number(req.params.id)
  if (!empresaId) return res.status(403).json({ error: 'empresa asociada requerida' })
  if (!Number.isSafeInteger(plantillaId) || plantillaId < 1) return res.status(400).json({ error: 'id is invalid' })

  const payload = parsePayload(req.body)
  if (payload.error) return res.status(400).json({ error: payload.error })

  let connection
  try {
    connection = await pool.getConnection()
    const [existing] = await connection.query(
      'SELECT id FROM plantillas_turno WHERE id = ? AND empresa_id = ? AND sede_id IS NOT NULL LIMIT 1',
      [plantillaId, empresaId],
    )
    if (!existing[0]) return res.status(404).json({ error: 'coverage template not found' })

    const [shifts] = await connection.query('SELECT COUNT(*) AS total FROM instancias_turno WHERE plantilla_id = ?', [plantillaId])
    if (Number(shifts[0].total) > 0) {
      return res.status(409).json({ error: 'No se puede editar una plantilla que ya tiene turnos creados.' })
    }

    const referenceError = await validateCompanyReferences(connection, empresaId, payload)
    if (referenceError) return res.status(400).json({ error: referenceError })

    await connection.beginTransaction()
    const { horario } = payload
    await connection.query(
      `UPDATE plantillas_turno
       SET sede_id = ?, nombre = ?, hora_inicio = ?, hora_fin = ?, duracion_minutos = ?, es_nocturno = ?
       WHERE id = ? AND empresa_id = ?`,
      [payload.sedeId, payload.turno, horario.horaInicio, horario.horaFin, 480, horario.esNocturno, plantillaId, empresaId],
    )
    await connection.query('DELETE FROM plantilla_turno_requerimientos WHERE plantilla_id = ?', [plantillaId])
    await insertRequerimientos(connection, plantillaId, payload.requerimientos)
    await connection.commit()

    return res.json(await getPlantilla(empresaId, plantillaId))
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('coverage template update error', error)
    return res.status(500).json({ error: 'could not update coverage template' })
  } finally {
    if (connection) connection.release()
  }
})

router.delete('/:id', async (req, res) => {
  const empresaId = await getEmpresaId(req)
  const plantillaId = Number(req.params.id)
  if (!empresaId) return res.status(403).json({ error: 'empresa asociada requerida' })
  if (!Number.isSafeInteger(plantillaId) || plantillaId < 1) return res.status(400).json({ error: 'id is invalid' })

  try {
    const [existing] = await pool.query(
      'SELECT id FROM plantillas_turno WHERE id = ? AND empresa_id = ? AND sede_id IS NOT NULL LIMIT 1',
      [plantillaId, empresaId],
    )
    if (!existing[0]) return res.status(404).json({ error: 'coverage template not found' })

    const [shifts] = await pool.query('SELECT COUNT(*) AS total FROM instancias_turno WHERE plantilla_id = ?', [plantillaId])
    if (Number(shifts[0].total) > 0) {
      return res.status(409).json({ error: 'No se puede eliminar una plantilla que ya tiene turnos asociados.' })
    }

    await pool.query('DELETE FROM plantillas_turno WHERE id = ? AND empresa_id = ?', [plantillaId, empresaId])
    return res.status(204).end()
  } catch (error) {
    console.error('coverage template delete error', error)
    return res.status(500).json({ error: 'could not delete coverage template' })
  }
})

module.exports = router