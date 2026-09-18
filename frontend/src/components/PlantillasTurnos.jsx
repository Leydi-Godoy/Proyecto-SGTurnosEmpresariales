import { useEffect, useState } from 'react'

export default function PlantillasTurnos() {
  const [plantillas, setPlantillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    hora_inicio: '09:00:00',
    hora_fin: '17:00:00',
    patron_recurrencia: 'lunes_a_viernes',
  })

  const token = localStorage.getItem('token')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      
      if (parsedUser?.empresa_id && token) {
        loadPlantillas(parsedUser.empresa_id)
      }
    }
  }, [token])

  async function loadPlantillas(empresaId) {
    try {
      setLoading(true)
      const res = await fetch(
        `http://localhost:3001/api/plantillas-turno?empresa_id=${empresaId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (!res.ok) throw new Error('Error cargando plantillas')
      
      const data = await res.json()
      setPlantillas(data.plantillas || [])
    } catch (err) {
      console.error('Error:', err)
      setError('Error al cargar plantillas')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.nombre || !form.hora_inicio || !form.hora_fin) {
      setError('Nombre y horarios son obligatorios')
      return
    }

    const userData = localStorage.getItem('user')
    if (!userData) {
      setError('Error: No hay sesión activa')
      return
    }

    const user = JSON.parse(userData)
    if (!user?.empresa_id) {
      setError('Error: No se encontró la empresa del usuario')
      return
    }

    try {
      const url = editingId
        ? `http://localhost:3001/api/plantillas-turno/${editingId}`
        : `http://localhost:3001/api/plantillas-turno`
      
      const method = editingId ? 'PUT' : 'POST'
      
      const payloadData = {
        empresa_id: parseInt(user.empresa_id),
        nombre: form.nombre,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        patron_recurrencia: form.patron_recurrencia || null
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payloadData)
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || err.details || 'Error procesando solicitud')
      }

      const data = await res.json()
      
      if (editingId) {
        setPlantillas(plantillas.map(p => p.id === editingId ? data.plantilla : p))
        setSuccess('Plantilla actualizada exitosamente')
      } else {
        setPlantillas([...plantillas, data.plantilla])
        setSuccess('Plantilla creada exitosamente')
      }

      setForm({ nombre: '', hora_inicio: '09:00:00', hora_fin: '17:00:00', patron_recurrencia: 'lunes_a_viernes' })
      setShowForm(false)
      setEditingId(null)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    }
  }

  function handleEdit(plantilla) {
    setForm(plantilla)
    setEditingId(plantilla.id)
    setShowForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) return

    try {
      const res = await fetch(
        `http://localhost:3001/api/plantillas-turno/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error eliminando plantilla')
      }

      setPlantillas(plantillas.filter(p => p.id !== id))
      setSuccess('Plantilla eliminada')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    }
  }

  return (
    <section className="panel plantillas-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Gestión</span>
          <h2>Plantillas de Turnos</h2>
        </div>
        <button
          className={`button-primary ${showForm ? 'active' : ''}`}
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setForm({ nombre: '', hora_inicio: '09:00:00', hora_fin: '17:00:00', es_nocturno: false, patron_recurrencia: 'lunes_a_viernes' })
          }}
        >
          {showForm ? 'Cancelar' : '➕ Nueva Plantilla'}
        </button>
      </div>

      {error && <div className="feedback error">{error}</div>}
      {success && <div className="feedback success">{success}</div>}

      {showForm && (
        <form className="plantilla-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la plantilla</label>
            <input
              id="nombre"
              type="text"
              required
              placeholder="Ej: Turno Matutino"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hora_inicio">Hora de inicio (HH:MM:SS)</label>
              <input
                id="hora_inicio"
                type="time"
                required
                value={form.hora_inicio.substring(0, 5)}
                onChange={(e) => {
                  if (e.target.value) {
                    setForm({ ...form, hora_inicio: e.target.value + ':00' })
                  }
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="hora_fin">Hora de fin (HH:MM:SS)</label>
              <input
                id="hora_fin"
                type="time"
                required
                value={form.hora_fin.substring(0, 5)}
                onChange={(e) => {
                  if (e.target.value) {
                    setForm({ ...form, hora_fin: e.target.value + ':00' })
                  }
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="patron_recurrencia">Patrón de recurrencia</label>
            <select
              id="patron_recurrencia"
              value={form.patron_recurrencia}
              onChange={(e) => setForm({ ...form, patron_recurrencia: e.target.value })}
            >
              <option value="lunes_a_viernes">Lunes a Viernes</option>
              <option value="completo">Todos los días</option>
              <option value="fines_de_semana">Fines de semana</option>
            </select>
          </div>

          <div className="form-actions">
            <button className="button-primary" type="submit">
              {editingId ? 'Guardar cambios' : 'Crear plantilla'}
            </button>
            <button
              className="button-secondary"
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setForm({ nombre: '', hora_inicio: '09:00:00', hora_fin: '17:00:00', es_nocturno: false, patron_recurrencia: 'lunes_a_viernes' })
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="plantillas-list">
        {loading ? (
          <p className="loading-message">Cargando plantillas…</p>
        ) : plantillas.length === 0 ? (
          <div className="empty-state">
            <p>No hay plantillas. Crea una para comenzar.</p>
          </div>
        ) : (
          <div className="plantillas-grid">
            {plantillas.map((plantilla) => (
              <div key={plantilla.id} className="plantilla-item">
                <div className="plantilla-header">
                  <h3>{plantilla.nombre}</h3>
                  {plantilla.es_nocturno && <span className="badge nocturno">🌙 Nocturno</span>}
                </div>

                <div className="plantilla-info">
                  <p>
                    <span className="info-label">Horario:</span>
                    {plantilla.hora_inicio.substring(0, 5)} - {plantilla.hora_fin.substring(0, 5)}
                  </p>
                  <p>
                    <span className="info-label">Duración:</span>
                    {plantilla.duracion_minutos} minutos
                  </p>
                  <p>
                    <span className="info-label">Patrón:</span>
                    {plantilla.patron_recurrencia || 'No especificado'}
                  </p>
                </div>

                <div className="plantilla-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(plantilla)}
                    title="Editar plantilla"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(plantilla.id)}
                    title="Eliminar plantilla"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
