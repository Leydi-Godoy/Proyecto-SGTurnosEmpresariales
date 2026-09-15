import { useState, useEffect } from 'react'

export default function AuditoriaLogs() {
  const [logs, setLogs] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroFecha, setFiltroFecha] = useState('todos')

  useEffect(() => {
    // Mock data - Logs de auditoría
    setLogs([
      {
        id: 1,
        timestamp: '2026-09-15 15:45:23',
        usuario: 'Miguel Camilo Ruiz',
        tipo: 'LOGIN',
        modulo: 'Autenticación',
        accion: 'Inicio de sesión exitoso',
        ip: '192.168.1.100',
        estado: 'Exitoso'
      },
      {
        id: 2,
        timestamp: '2026-09-15 15:40:15',
        usuario: 'Super Admin',
        tipo: 'CREAR',
        modulo: 'Empresas',
        accion: 'Se creó empresa: TechCorp Solutions',
        ip: '192.168.1.50',
        estado: 'Exitoso'
      },
      {
        id: 3,
        timestamp: '2026-09-15 15:35:42',
        usuario: 'Leydi Cecilia Godoy',
        tipo: 'EDITAR',
        modulo: 'Usuarios',
        accion: 'Se editó usuario: Miguel Camilo Ruiz',
        ip: '192.168.1.75',
        estado: 'Exitoso'
      },
      {
        id: 4,
        timestamp: '2026-09-15 15:30:08',
        usuario: 'Super Admin',
        tipo: 'ELIMINAR',
        modulo: 'Empresas',
        accion: 'Se eliminó empresa: Empresa Antigua S.A.',
        ip: '192.168.1.50',
        estado: 'Exitoso'
      },
      {
        id: 5,
        timestamp: '2026-09-15 14:25:33',
        usuario: 'Admin Empresa',
        tipo: 'ACCESO',
        modulo: 'Reportes',
        accion: 'Acceso a reportes de turnos',
        ip: '192.168.1.120',
        estado: 'Exitoso'
      },
      {
        id: 6,
        timestamp: '2026-09-14 16:15:47',
        usuario: 'Usuario Desconocido',
        tipo: 'LOGIN',
        modulo: 'Autenticación',
        accion: 'Intento fallido de inicio de sesión',
        ip: '203.45.67.89',
        estado: 'Error'
      },
      {
        id: 7,
        timestamp: '2026-09-14 15:50:22',
        usuario: 'Super Admin',
        tipo: 'CAMBIO',
        modulo: 'Configuracion',
        accion: 'Se cambio configuracion del sistema',
        ip: '192.168.1.50',
        estado: 'Exitoso'
      },
      {
        id: 8,
        timestamp: '2026-09-14 14:20:10',
        usuario: 'Planificador',
        tipo: 'CREAR',
        modulo: 'Turnos',
        accion: 'Se crearon 15 turnos para la proxima semana',
        ip: '192.168.1.105',
        estado: 'Exitoso'
      },
      {
        id: 9,
        timestamp: '2026-09-13 11:30:45',
        usuario: 'Super Admin',
        tipo: 'ELIMINAR',
        modulo: 'Usuarios',
        accion: 'Se elimino usuario: Empleado Temporal',
        ip: '192.168.1.50',
        estado: 'Exitoso'
      },
      {
        id: 10,
        timestamp: '2026-09-13 10:15:32',
        usuario: 'Admin Empresa',
        tipo: 'EDITAR',
        modulo: 'Empresa',
        accion: 'Se actualizo informacion de la empresa',
        ip: '192.168.1.110',
        estado: 'Exitoso'
      }
    ])
  }, [])

  const getTipoBadge = (tipo) => {
    const badges = {
      'LOGIN': 'badge-login',
      'CREAR': 'badge-crear',
      'EDITAR': 'badge-editar',
      'ELIMINAR': 'badge-eliminar',
      'ACCESO': 'badge-acceso',
      'CAMBIO': 'badge-cambio'
    }
    return badges[tipo] || 'badge-default'
  }

  const getEstadoBadge = (estado) => {
    return estado === 'Exitoso' ? 'badge-exitoso' : 'badge-error'
  }

  const logsFiltrados = logs.filter(log => {
    const cumpleTipo = filtroTipo === 'todos' || log.tipo === filtroTipo
    const cumpleFecha = filtroFecha === 'todos' || log.timestamp.includes(filtroFecha)
    return cumpleTipo && cumpleFecha
  })

  const tiposUnicos = [...new Set(logs.map(log => log.tipo))]

  return (
    <div className="auditoria-logs-panel">
      <div className="panel-header">
        <h2>📋 Registro de Auditoria</h2>
        <p className="subtitle">Historial completo de actividades del sistema</p>
      </div>

      <div className="filtros">
        <div className="filtro-group">
          <label>Tipo de Evento:</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los eventos</option>
            {tiposUnicos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Fecha:</label>
          <select value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}>
            <option value="todos">Todos los dias</option>
            <option value="2026-09-15">Hoy</option>
            <option value="2026-09-14">Ayer</option>
            <option value="2026-09-13">Hace 2 dias</option>
          </select>
        </div>
      </div>

      <div className="logs-tabla">
        <table>
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Usuario</th>
              <th>Tipo</th>
              <th>Modulo</th>
              <th>Accion</th>
              <th>IP</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {logsFiltrados.map(log => (
              <tr key={log.id} className={getEstadoBadge(log.estado)}>
                <td className="timestamp">
                  <span className="fecha">{log.timestamp}</span>
                </td>
                <td className="usuario">{log.usuario}</td>
                <td>
                  <span className={`badge ${getTipoBadge(log.tipo)}`}>
                    {log.tipo}
                  </span>
                </td>
                <td className="modulo">{log.modulo}</td>
                <td className="accion">{log.accion}</td>
                <td className="ip">
                  <code>{log.ip}</code>
                </td>
                <td>
                  <span className={`estado-badge ${log.estado.toLowerCase()}`}>
                    {log.estado === 'Exitoso' ? '✅' : '❌'} {log.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tabla-footer">
          Mostrando {logsFiltrados.length} de {logs.length} registros
        </p>
      </div>

      <div className="estadisticas-logs">
        <div className="seccion-header">
          <h3>📊 Estadísticas</h3>
        </div>
        <div className="stats-mini">
          <div className="stat-item">
            <span className="stat-label">Total de Eventos</span>
            <span className="stat-value">{logs.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Eventos Exitosos</span>
            <span className="stat-value">{logs.filter(l => l.estado === 'Exitoso').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Eventos con Error</span>
            <span className="stat-value">{logs.filter(l => l.estado === 'Error').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">IPs Unicas</span>
            <span className="stat-value">{new Set(logs.map(l => l.ip)).size}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
