import { useState } from 'react'
import PerfilEmpresa from './PerfilEmpresa'
import PerfilesYProfesiones from './PerfilesYProfesiones'
import ModalidadesTurnos from './ModalidadesTurnos'
import CatalogoDeTurnos from './CatalogoDeTurnos'
import EstructuraOrganizacional from './EstructuraOrganizacional'
import PlantillasCobertura from './PlantillasCobertura'
import GestionUsuarios from './GestionUsuarios'
import '../AdminEmpresa.css'

export default function AdminEmpresaDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('perfil')
  
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

  return (
    <div className="admin-empresa-dashboard">
      <div className="dashboard-nav">
        <div className="user-info">
          <span className="user-name">👤 {userName}</span>
          <span className={`user-role rol-${userRoleId}`}>{userRole}</span>
        </div>
        <button
          className={`tab-btn ${activeTab === 'perfil' ? 'active' : ''}`}
          onClick={() => setActiveTab('perfil')}
        >
          🏢 Perfil Empresa
        </button>
        <button
          className={`tab-btn ${activeTab === 'profesiones' ? 'active' : ''}`}
          onClick={() => setActiveTab('profesiones')}
        >
          👥 Perfiles/Profesiones
        </button>
        <button
          className={`tab-btn ${activeTab === 'modalidades' ? 'active' : ''}`}
          onClick={() => setActiveTab('modalidades')}
        >
          🔄 Modalidades Turnos
        </button>
        <button
          className={`tab-btn ${activeTab === 'catalogo' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalogo')}
        >
          📅 Catálogo Turnos
        </button>
        <button
          className={`tab-btn ${activeTab === 'estructura' ? 'active' : ''}`}
          onClick={() => setActiveTab('estructura')}
        >
          🏗️ Estructura Org.
        </button>
        <button
          className={`tab-btn ${activeTab === 'cobertura' ? 'active' : ''}`}
          onClick={() => setActiveTab('cobertura')}
        >
          📊 Plantillas Cobertura
        </button>
        <button
          className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          👤 Gestión Usuarios
        </button>
        <button className="tab-btn logout-btn" onClick={onLogout}>
          🚪 Salir
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'perfil' && <PerfilEmpresa />}
        {activeTab === 'profesiones' && <PerfilesYProfesiones />}
        {activeTab === 'modalidades' && <ModalidadesTurnos />}
        {activeTab === 'catalogo' && <CatalogoDeTurnos />}
        {activeTab === 'estructura' && <EstructuraOrganizacional />}
        {activeTab === 'cobertura' && <PlantillasCobertura />}
        {activeTab === 'usuarios' && <GestionUsuarios />}
      </div>
    </div>
  )
}
