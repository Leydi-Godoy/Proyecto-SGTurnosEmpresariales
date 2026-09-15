import { useEffect, useState } from 'react'

export default function MallasTurnos() {
  const [mallas, setMallas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: '',
  })

  useEffect(() => {
    loadMallas()
  }, [])

  function loadMallas() {
    setLoading(true)
    // TODO: Cambiar por fetch real cuando API esté lista
    const mockMallas = [
      {
        id: 1,
        nombre: 'Malla Agosto 2026',
        fecha_inicio: '2026-08-01',
        fecha_fin: '2026-08-31',
        estado: 'publicada',
        turnos_totales: 120,
        turnos_asignados: 95,
        fecha_creacion: new Date().toISOString(),
      },
      {
        id: 2,
        nombre: 'Malla Septiembre 2026',
        fecha_inicio: '2026-09-01',
        fecha_fin: '2026-09-30',
        estado: 'borrador',
        turnos_totales: 150,
        turnos_asignados: 45,
        fecha_creacion: new Date().toISOString(),
      },
    ]
    setMallas(mockMallas)
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.nombre || !form.fecha_inicio || !form.fecha_fin) {
      setError('Nombre y fechas son obligatorios')
      return
    }

    if (new Date(form.fecha_inicio) >= new Date(form.fecha_fin)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    // TODO: Implementar POST/PUT cuando API esté lista
    setSuccess(editingId ? 'Malla actualizada' : 'Malla creada exitosamente')
    setForm({ nombre: '', fecha_inicio: '', fecha_fin: '', descripcion: '' })
    setShowForm(false)
    setEditingId(null)

    setTimeout(() => setSuccess(''), 3000)
  }

  function handleEdit(malla) {
    setForm(malla)
    setEditingId(malla.id)
    setShowForm(true)
  }

  function handleDelete(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta malla?')) {
      setMallas(mallas.filter((m) => m.id !== id))
      setSuccess('Malla eliminada')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  function handlePublish(id) {
    setMallas(
      mallas.map((m) =>
        m.id === id ? { ...m, estado: m.estado === 'publicada' ? 'borrador' : 'publicada' } : m
      )
    )
    setSuccess('Estado de malla actualizado')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <section className="panel mallas-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Gestión</span>
          <h2>Mallas de Turnos</h2>
        </div>
        <button
          className={`button-primary ${showForm ? 'active' : ''}`}
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setForm({ nombre: '', fecha_inicio: '', fecha_fin: '', descripcion: '' })
          }}
        >
          {showForm ? 'Cancelar' : '➕ Nueva Malla'}
        </button>
      </div>

      {error && <div className="feedback error">{error}</div>}
      {success && <div className="feedback success">{success}</div>}

      {showForm && (
        <form className="malla-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la malla</label>
            <input
              id="nombre"
              type="text"
              required
              placeholder="Ej: Malla Septiembre 2026"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_inicio">Fecha de inicio</label>
              <input
                id="fecha_inicio"
                type="date"
                required
                value={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_fin">Fecha de fin</label>
              <input
                id="fecha_fin"
                type="date"
                required
                value={form.fecha_fin}
                onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción (opcional)</label>
            <textarea
              id="descripcion"
              placeholder="Detalles sobre esta malla..."
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button className="button-primary" type="submit">
              {editingId ? 'Guardar cambios' : 'Crear malla'}
            </button>
            <button
              className="button-secondary"
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setForm({ nombre: '', fecha_inicio: '', fecha_fin: '', descripcion: '' })
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mallas-list">
        {loading ? (
          <p className="loading-message">Cargando mallas…</p>
        ) : mallas.length === 0 ? (
          <div className="empty-state">
            <p>No hay mallas. Crea una para comenzar.</p>
          </div>
        ) : (
          <div className="mallas-grid">
            {mallas.map((malla) => (
              <div key={malla.id} className={`malla-item malla-${malla.estado}`}>
                <div className="malla-header">
                  <h3>{malla.nombre}</h3>
                  <span className={`status-badge status-${malla.estado}`}>
                    {malla.estado === 'publicada' ? '✓ Publicada' : '📝 Borrador'}
                  </span>
                </div>

                <div className="malla-info">
                  <p>
                    <span className="info-label">Período:</span>
                    {new Intl.DateTimeFormat('es-CO').format(new Date(malla.fecha_inicio))} -{' '}
                    {new Intl.DateTimeFormat('es-CO').format(new Date(malla.fecha_fin))}
                  </p>
                  <p>
                    <span className="info-label">Turnos:</span>
                    {malla.turnos_asignados} / {malla.turnos_totales} asignados
                  </p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${(malla.turnos_asignados / malla.turnos_totales) * 100}%` }}
                    />
                  </div>
                </div>

                {malla.descripcion && <p className="malla-description">{malla.descripcion}</p>}

                <div className="malla-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(malla)}
                    title="Editar malla"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className={`action-btn ${malla.estado === 'publicada' ? 'unpublish' : 'publish'}`}
                    onClick={() => handlePublish(malla.id)}
                    title={malla.estado === 'publicada' ? 'Despublicar' : 'Publicar'}
                  >
                    {malla.estado === 'publicada' ? '🔒 Despublicar' : '🔓 Publicar'}
                  </button>
                  <button
                    className="action-btn view"
                    title="Ver detalles"
                  >
                    👁️ Ver
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(malla.id)}
                    title="Eliminar malla"
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
