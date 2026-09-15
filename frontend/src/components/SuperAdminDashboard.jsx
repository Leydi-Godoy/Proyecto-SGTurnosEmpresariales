import { useState } from 'react'
import DashboardReportes from './DashboardReportes'
import GestionEmpresas from './GestionEmpresas'
import GestionUsuariosGlobal from './GestionUsuariosGlobal'
import ConfiguracionGlobal from './ConfiguracionGlobal'
import AuditoriaLogs from './AuditoriaLogs'
import '../SuperAdmin.css'

export default function SuperAdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Obtener información del usuario logueado
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const userName = user?.nombre || 'Developer'

  return (
    <div className="super-admin-dashboard">
      <div className="dashboard-nav">
        <div className="user-info">
          <span className="user-name">👨‍💻 {userName}</span>
          <span className="user-role rol-1">Super Administrador</span>
        </div>
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'empresas' ? 'active' : ''}`}
          onClick={() => setActiveTab('empresas')}
        >
          🏢 Gestión de Empresas
        </button>
        <button
          className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          👥 Gestión de Usuarios
        </button>
        <button
          className={`tab-btn ${activeTab === 'configuracion' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuracion')}
        >
          ⚙️ Configuración
        </button>
        <button
          className={`tab-btn ${activeTab === 'auditoria' ? 'active' : ''}`}
          onClick={() => setActiveTab('auditoria')}
        >
          📋 Auditoría
        </button>
        <button
          className="tab-btn logout-btn"
          onClick={onLogout}
        >
          🚪 Salir
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'dashboard' && <DashboardReportes />}
        {activeTab === 'empresas' && <GestionEmpresas />}
        {activeTab === 'usuarios' && <GestionUsuariosGlobal />}
        {activeTab === 'configuracion' && <ConfiguracionGlobal />}
        {activeTab === 'auditoria' && <AuditoriaLogs />}
      </div>
    </div>
  )
}
