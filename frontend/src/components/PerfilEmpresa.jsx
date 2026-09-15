import { useState, useEffect } from 'react'

export default function PerfilEmpresa() {
  // Obtener información del usuario logueado
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const userName = user?.nombre || 'Usuario'
  
  // Convertir ID de rol a nombre
  const getRolNombre = (id) => {
    const roles = {
      '1': 'Super Administrador',
      '2': 'Admin Empresa',
      '3': 'Planificador',
      '4': 'Supervisor',
      '5': 'Empleado',
      'super_admin': 'Super Administrador',
      'admin': 'Admin Empresa',
      'planificador': 'Planificador',
      'supervisor': 'Supervisor',
      'empleado': 'Empleado',
      'user': 'Empleado'
    }
    return roles[String(id)] || 'Desconocido'
  }
  
  const userRoleValue = user?.Id_rol || user?.rol || '5'
  const userRole = getRolNombre(userRoleValue)
  const userRoleId = userRoleValue

  const [empresa, setEmpresa] = useState(null)
  const [editando, setEditando] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    pais: '',
    zona_horaria: '',
    moneda: 'COP',
    contacto: '',
    email_notificaciones: '',
    descripcion: ''
  })
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    // Mock data
    setEmpresa({
      id: 1,
      nombre: 'TechCorp Solutions',
      pais: 'Colombia',
      zona_horaria: 'America/Bogota',
      moneda: 'COP',
      contacto: 'Carlos Mendoza',
      email_notificaciones: 'admin@techcorp.com',
      descripcion: 'Empresa de soluciones tecnológicas'
    })
    setFormData({
      nombre: 'TechCorp Solutions',
      pais: 'Colombia',
      zona_horaria: 'America/Bogota',
      moneda: 'COP',
      contacto: 'Carlos Mendoza',
      email_notificaciones: 'admin@techcorp.com',
      descripcion: 'Empresa de soluciones tecnológicas'
    })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGuardar = () => {
    setEmpresa(formData)
    setEditando(false)
    setMensaje('✅ Cambios guardados correctamente')
    setTimeout(() => setMensaje(''), 3000)
  }

  if (!empresa) return <div className="loading">Cargando...</div>

  return (
    <div className="perfil-empresa-panel">
      <div className="user-banner">
        <div className="user-info-section">
          <span className="user-label">Sesión activa:</span>
          <span className="user-display-name">{userName}</span>
          <span className={`user-display-role rol-${userRoleId}`}>{userRole}</span>
        </div>
      </div>

      <div className="panel-header">
        <h2>🏢 Perfil de Empresa</h2>
        <p className="subtitle">Información base de tu empresa</p>
      </div>

      {mensaje && (
        <div className="success-message">{mensaje}</div>
      )}

      <div className="perfil-contenido">
        <div className="perfil-info-grid">
          {!editando ? (
            <>
              <div className="info-card">
                <label>Nombre Empresa</label>
                <p className="info-value">{empresa.nombre}</p>
              </div>
              <div className="info-card">
                <label>País</label>
                <p className="info-value">{empresa.pais}</p>
              </div>
              <div className="info-card">
                <label>Zona Horaria</label>
                <p className="info-value">{empresa.zona_horaria}</p>
              </div>
              <div className="info-card">
                <label>Moneda</label>
                <p className="info-value">{empresa.moneda}</p>
              </div>
              <div className="info-card">
                <label>Contacto Principal</label>
                <p className="info-value">{empresa.contacto}</p>
              </div>
              <div className="info-card">
                <label>Email Notificaciones</label>
                <p className="info-value">{empresa.email_notificaciones}</p>
              </div>
              <div className="info-card full-width">
                <label>Descripción</label>
                <p className="info-value">{empresa.descripcion}</p>
              </div>

              <div className="motor-politicas-info full-width">
                <div className="info-header">
                  <h3>⚙️ Motor de Políticas y Reglas de Negocio</h3>
                  <p className="subtitle-small">Las siguientes secciones configuran cómo funciona tu empresa</p>
                </div>
                <div className="politicas-list">
                  <div className="politica-item">
                    <span className="politica-icon">2️⃣</span>
                    <div>
                      <strong>Perfiles y Profesiones</strong>
                      <p>Define los roles de tu empresa (Vigilante, Doctor, Operario, etc.)</p>
                    </div>
                  </div>
                  <div className="politica-item">
                    <span className="politica-icon">3️⃣</span>
                    <div>
                      <strong>Modalidades de Turnos</strong>
                      <p>Configura tipos de turnos (8h, 12h, 6h, Rotativos, Fijos)</p>
                    </div>
                  </div>
                  <div className="politica-item">
                    <span className="politica-icon">4️⃣</span>
                    <div>
                      <strong>Catálogo de Turnos</strong>
                      <p>Define turnos estándar (Mañana 6-14, Tarde 14-22, Noche 22-6)</p>
                    </div>
                  </div>
                  <div className="politica-item">
                    <span className="politica-icon">5️⃣</span>
                    <div>
                      <strong>Estructura Organizacional</strong>
                      <p>Crea Sedes, Departamentos y Áreas de tu empresa</p>
                    </div>
                  </div>
                  <div className="politica-item">
                    <span className="politica-icon">6️⃣</span>
                    <div>
                      <strong>Plantillas de Cobertura</strong>
                      <p>Especifica cantidad mínima de personal por turno y área</p>
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn-editar full-width" onClick={() => setEditando(true)}>
                ✏️ Editar Información
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Nombre Empresa</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre de tu empresa"
                />
              </div>
              <div className="form-group">
                <label>País</label>
                <select name="pais" value={formData.pais} onChange={handleChange}>
                  <option value="">Seleccionar país</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="México">México</option>
                  <option value="Perú">Perú</option>
                  <option value="Venezuela">Venezuela</option>
                </select>
              </div>
              <div className="form-group">
                <label>Zona Horaria</label>
                <select name="zona_horaria" value={formData.zona_horaria} onChange={handleChange}>
                  <option value="America/Bogota">America/Bogota (UTC-5)</option>
                  <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires (UTC-3)</option>
                  <option value="America/Santiago">America/Santiago (UTC-3)</option>
                  <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Moneda</label>
                <select name="moneda" value={formData.moneda} onChange={handleChange}>
                  <option value="COP">COP (Peso Colombiano)</option>
                  <option value="ARS">ARS (Peso Argentino)</option>
                  <option value="CLP">CLP (Peso Chileno)</option>
                  <option value="MXN">MXN (Peso Mexicano)</option>
                  <option value="USD">USD (Dólar)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contacto Principal</label>
                <input
                  type="text"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleChange}
                  placeholder="Nombre del contacto"
                />
              </div>
              <div className="form-group">
                <label>Email Notificaciones</label>
                <input
                  type="email"
                  name="email_notificaciones"
                  value={formData.email_notificaciones}
                  onChange={handleChange}
                  placeholder="email@empresa.com"
                />
              </div>
              <div className="form-group full-width">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción breve de tu empresa"
                  rows="4"
                />
              </div>

              <div className="action-buttons full-width">
                <button className="btn-guardar" onClick={handleGuardar}>
                  💾 Guardar Cambios
                </button>
                <button className="btn-cancelar" onClick={() => setEditando(false)}>
                  ❌ Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
