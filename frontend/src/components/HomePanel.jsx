import { useEffect, useState } from 'react'

export default function HomePanel({ onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((r) => r.json())
      .then((data) => {
        const userData = data.user || data
        setProfile(userData)
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <header className="home-panel"><p>Cargando perfil...</p></header>

  const fullName = profile 
    ? `${profile.primer_nombre || ''} ${profile.segundo_nombre || ''} ${profile.primer_apellido || ''} ${profile.segundo_apellido || ''}`.trim()
    : 'Empleado'

  const statusColor = profile?.activo ? '#22c55e' : '#ef4444'
  const statusText = profile?.activo ? 'Activo' : 'Inactivo'

  return (
    <header className="home-panel">
      <div className="panel-header-content">
        <div className="company-section">
          {profile?.empresa_logo ? (
            <img 
              alt="Logo empresa" 
              src={profile.empresa_logo} 
              className="company-logo" 
              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block' }}
            />
          ) : null}
          <div className="brand-mark" style={{ display: profile?.empresa_logo ? 'none' : 'grid' }}>
            {profile?.empresa_sigla || 'SG'}
          </div>
          
          <div className="welcome-section">
            <h1>Hola, {fullName}</h1>
            <p className="empresa-name">{profile?.empresa_nombre || 'Empresa'}</p>
          </div>
        </div>

        <div className="status-info">
          <div className="status-item">
            <span className="label">Rol</span>
            <span className="value badge-rol">{profile?.Id_rol || 'Empleado'}</span>
          </div>
          <div className="status-item">
            <span className="label">Estado</span>
            <span className="value" style={{ color: statusColor }}>
              <span className="status-dot" style={{ backgroundColor: statusColor }}></span>
              {statusText}
            </span>
          </div>
        </div>
      </div>

      <div className="actions">
        <button onClick={onLogout} className="button-logout">
          <span>Cerrar sesión</span>
        </button>
      </div>
    </header>
  )
}
