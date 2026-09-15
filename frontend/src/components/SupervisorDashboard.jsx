import { useState } from 'react'
import SupervisorHome from './SupervisorHome'
import NovedadesAprobacion from './NovedadesAprobacion'
import MiEquipo from './MiEquipo'
import ReportesSupervisor from './ReportesSupervisor'

export default function SupervisorDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('inicio')

  return (
    <div className="supervisor-dashboard">
      <div className="dashboard-nav">
        <button
          className={`tab-btn ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          🏠 Inicio
        </button>
        <button
          className={`tab-btn ${activeTab === 'aprobaciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('aprobaciones')}
        >
          ✓ Aprobaciones
        </button>
        <button
          className={`tab-btn ${activeTab === 'equipo' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipo')}
        >
          👥 Mi Equipo
        </button>
        <button
          className={`tab-btn ${activeTab === 'reportes' ? 'active' : ''}`}
          onClick={() => setActiveTab('reportes')}
        >
          📊 Reportes
        </button>
        <button className="tab-btn logout-btn" onClick={onLogout}>
          🚪 Salir
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'inicio' && <SupervisorHome />}
        {activeTab === 'aprobaciones' && <NovedadesAprobacion />}
        {activeTab === 'equipo' && <MiEquipo />}
        {activeTab === 'reportes' && <ReportesSupervisor />}
      </div>
    </div>
  )
}
