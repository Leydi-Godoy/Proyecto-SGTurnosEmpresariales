import { useState } from 'react'
import HomePanel from './HomePanel'
import CalendarTurns from './CalendarTurns'
import Novedades from './Novedades'
import EditProfile from './EditProfile'

export default function EmpleadoDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('inicio')

  return (
    <div className="empleado-dashboard">
      <HomePanel onLogout={onLogout} />
      
      <section className="empleado-modules">
        {/* MODULO 1: INICIO - HOME PANEL */}
        {activeTab === 'inicio' && (
          <div className="module">
            <section className="panel dashboard-intro">
              <div className="intro-content">
                <h2>Panel de Control</h2>
                <p>Bienvenido a tu panel de empleado. Aquí puedes acceder a tus turnos, solicitar cambios y administrar tu perfil.</p>
                <div className="quick-actions">
                  <button className="quick-action-btn" onClick={() => setActiveTab('calendario')}>
                    <span className="icon">📅</span>
                    <span>Ver Turnos</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveTab('novedades')}>
                    <span className="icon">📝</span>
                    <span>Mis Solicitudes</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveTab('perfil')}>
                    <span className="icon">⚙️</span>
                    <span>Mi Perfil</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* MODULO 2: CALENDARIO Y TURNOS */}
        {activeTab === 'calendario' && (
          <div className="module">
            <CalendarTurns />
            <button className="back-button" onClick={() => setActiveTab('inicio')}>
              ← Volver al inicio
            </button>
          </div>
        )}

        {/* MODULO 3: NOVEDADES Y SOLICITUDES */}
        {activeTab === 'novedades' && (
          <div className="module">
            <Novedades />
            <button className="back-button" onClick={() => setActiveTab('inicio')}>
              ← Volver al inicio
            </button>
          </div>
        )}

        {/* MODULO 4: EDITAR PERFIL Y DATOS */}
        {activeTab === 'perfil' && (
          <div className="module">
            <EditProfile />
            <button className="back-button" onClick={() => setActiveTab('inicio')}>
              ← Volver al inicio
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
