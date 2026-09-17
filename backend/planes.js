const express = require('express')
const { pool } = require('./db')
const { authenticateToken } = require('./auth')

const router = express.Router()

router.use(authenticateToken)

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, caracteristicas, precio, creado_en, actualizado_en FROM planes ORDER BY id ASC'
    )

    const plans = rows.map(plan => ({
      ...plan,
      caracteristicas: (() => {
        if (!plan.caracteristicas) return []
        if (typeof plan.caracteristicas === 'string') {
          try {
            return JSON.parse(plan.caracteristicas)
          } catch (error) {
            return { descripcion: plan.caracteristicas }
          }
        }
        return plan.caracteristicas
      })()
    }))

    res.json(plans)
  } catch (error) {
    console.error('planes list error', error)
    res.status(500).json({ error: 'No se pudieron cargar los planes' })
  }
})

module.exports = router
