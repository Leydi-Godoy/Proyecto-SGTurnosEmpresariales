import { useEffect, useState } from 'react'

export default function MiEquipo() {
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)

  useEffect(() => {
    const loadEmpleados = () => {
    setLoading(true)
    const mockEmpleados = [
      {
        id: 1,
        nombre_completo: 'Juan Pérez',
        email: 'juan.perez@example.com',
        telefono: '3001234567',
        especialidad: 'Atención al cliente',
        estado: 'activo',
        fecha_ingreso: '2024-01-15',
        turnos_asignados: 8,
        novedades_pendientes: 1,
        porcentaje_asistencia: 95,
      },
      {
        id: 2,
        nombre_completo: 'María López',
        email: 'maria.lopez@example.com',
        telefono: '3001234568',
        especialidad: 'Operaciones',
        estado: 'activo',
        fecha_ingreso: '2023-06-20',
        turnos_asignados: 8,
        novedades_pendientes: 0,
        porcentaje_asistencia: 98,
      },
      {
        id: 3,
        nombre_completo: 'Carlos García',
        email: 'carlos.garcia@example.com',
        telefono: '3001234569',
        especialidad: 'Ventas',
        estado: 'activo',
        fecha_ingreso: '2024-03-10',
        turnos_asignados: 6,
        novedades_pendientes: 2,
        porcentaje_asistencia: 92,
      },
      {
        id: 4,
        nombre_completo: 'Ana Rodríguez',
        email: 'ana.rodriguez@example.com',
        telefono: '3001234570',
        especialidad: 'Soporte técnico',
        estado: 'licencia',
        fecha_ingreso: '2023-09-12',
        turnos_asignados: 0,
        novedades_pendientes: 0,
        porcentaje_asistencia: 88,
      },
    ]
    setEmpleados(mockEmpleados)
    setLoading(false)
    }
    loadEmpleados()
  }, [])

  const empleadosFiltrados = empleados.filter((emp) => {
    const matchSearch =
      emp.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = filtroEstado === 'todos' || emp.estado === filtroEstado
    return matchSearch && matchEstado
  })

  const getEstadoColor = (estado) => {
    const colores = {
      activo: '#22c55e',
      inactivo: '#ef4444',
      licencia: '#f59e0b',
      permiso: '#06b6d4',
    }
    return colores[estado] || '#6b7280'
  }

  return (
    <section className="panel mi-equipo-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Gestión</span>
          <h2>Mi Equipo</h2>
        </div>
        <div className="header-stats">
          <span className="stat-badge">Total: {empleados.length}</span>
        </div>
      </div>

      <div className="filtros-equipo">
        <div className="form-group">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="filtro-estado">Estado</label>
          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="licencia">En Licencia</option>
            <option value="permiso">En Permiso</option>
          </select>
        </div>
      </div>

      <div className="empleados-contenido">
        {loading ? (
          <p className="loading-message">Cargando equipo…</p>
        ) : empleadosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>No hay empleados que mostrar.</p>
          </div>
        ) : (
          <div className="empleados-grid">
            {empleadosFiltrados.map((empleado) => (
              <div
                key={empleado.id}
                className={`empleado-card empleado-${empleado.estado}`}
                onClick={() => setEmpleadoSeleccionado(empleado.id)}
              >
                <div className="empleado-header">
                  <div className="empleado-avatar">
                    {empleado.nombre_completo.charAt(0)}
                  </div>
                  <div className="empleado-info">
                    <h4>{empleado.nombre_completo}</h4>
                    <p className="especialidad">{empleado.especialidad}</p>
                  </div>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getEstadoColor(empleado.estado) }}
                  >
                    {empleado.estado}
                  </span>
                </div>

                <div className="empleado-stats">
                  <div className="stat">
                    <span className="label">Turnos</span>
                    <span className="value">{empleado.turnos_asignados}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Asistencia</span>
                    <span className="value">{empleado.porcentaje_asistencia}%</span>
                  </div>
                  <div className="stat">
                    <span className="label">Novedades</span>
                    <span className="value pending">{empleado.novedades_pendientes}</span>
                  </div>
                </div>

                {empleadoSeleccionado === empleado.id && (
                  <div className="empleado-detalles">
                    <div className="detalles-content">
                      <div className="detalle-row">
                        <span className="label">📧 Email:</span>
                        <span className="value">{empleado.email}</span>
                      </div>
                      <div className="detalle-row">
                        <span className="label">📱 Teléfono:</span>
                        <span className="value">{empleado.telefono}</span>
                      </div>
                      <div className="detalle-row">
                        <span className="label">📅 Ingreso:</span>
                        <span className="value">
                          {new Intl.DateTimeFormat('es-CO').format(
                            new Date(empleado.fecha_ingreso)
                          )}
                        </span>
                      </div>
                      <div className="detalle-row">
                        <span className="label">📊 Asistencia:</span>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${empleado.porcentaje_asistencia}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="acciones-equipo">
                      <button className="btn-accion btn-contacto">✉️ Contactar</button>
                      <button className="btn-accion btn-reportes">📊 Ver Reportes</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
