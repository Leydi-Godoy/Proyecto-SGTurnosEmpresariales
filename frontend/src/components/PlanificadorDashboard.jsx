import { useState } from 'react'
import PlanificadorHome from './PlanificadorHome'
import PlantillasTurnos from './PlantillasTurnos'
import MallasTurnos from './MallasTurnos'
import AsignacionTurnos from './AsignacionTurnos'
import ReportesPlanificador from './ReportesPlanificador'

export default function PlanificadorDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('inicio')

  return (
    <div className="planificador-dashboard">
      <div className="dashboard-nav">
        <button
          className={`tab-btn ${activeTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveTab('inicio')}
        >
          🏠 Inicio
        </button>
        <button
          className={`tab-btn ${activeTab === 'plantillas' ? 'active' : ''}`}
          onClick={() => setActiveTab('plantillas')}
        >
          📋 Plantillas
        </button>
        <button
          className={`tab-btn ${activeTab === 'mallas' ? 'active' : ''}`}
          onClick={() => setActiveTab('mallas')}
        >
          📅 Mallas
        </button>
        <button
          className={`tab-btn ${activeTab === 'asignacion' ? 'active' : ''}`}
          onClick={() => setActiveTab('asignacion')}
        >
          ⚡ Asignación
        </button>
        <button
          className={`tab-btn ${activeTab === 'reportes' ? 'active' : ''}`}
          onClick={() => setActiveTab('reportes')}
        >
          📊 Reportes
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'inicio' && <PlanificadorHome onLogout={onLogout} />}
        {activeTab === 'plantillas' && <PlantillasTurnos />}
        {activeTab === 'mallas' && <MallasTurnos />}
        {activeTab === 'asignacion' && <AsignacionTurnos />}
        {activeTab === 'reportes' && <ReportesPlanificador />}
      </div>
    </div>
  )
}
