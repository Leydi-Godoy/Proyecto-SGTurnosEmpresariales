import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'
import ResetPassword from './PasswordReset'
import EmpleadoDashboard from './components/EmpleadoDashboard'
import PlanificadorDashboard from './components/PlanificadorDashboard'
import SupervisorDashboard from './components/SupervisorDashboard'
import AdminEmpresaDashboard from './components/AdminEmpresaDashboard'
import SuperAdminDashboard from './components/SuperAdminDashboard'

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000
const LAST_ACTIVITY_KEY = 'sgturnos:lastActivity'

function App() {
  const [health, setHealth] = useState(null)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ ok: false }))
  }, [])

  useEffect(() => {
    if (!user) return undefined

    const clearStoredSession = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem(LAST_ACTIVITY_KEY)
    }

    const expireSession = () => {
      clearStoredSession()
      setUser(null)
      setUsers([])
    }

    const registerActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
    }

    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0)
    if (lastActivity && Date.now() - lastActivity >= INACTIVITY_LIMIT_MS) {
      expireSession()
      return undefined
    }

    registerActivity()
    const activityEvents = ['pointerdown', 'keydown', 'mousemove', 'scroll', 'touchstart']
    activityEvents.forEach(eventName => window.addEventListener(eventName, registerActivity, { passive: true }))

    const inactivityTimer = window.setInterval(() => {
      const currentLastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now())
      if (Date.now() - currentLastActivity >= INACTIVITY_LIMIT_MS) expireSession()
    }, 1000)

    const handleBackNavigation = () => {
      expireSession()
    }
    window.history.pushState({ sgturnosSession: true }, '', window.location.href)
    window.addEventListener('popstate', handleBackNavigation)

    const handlePageExit = () => {
      clearStoredSession()
    }
    window.addEventListener('pagehide', handlePageExit)
    window.addEventListener('beforeunload', handlePageExit)

    return () => {
      window.clearInterval(inactivityTimer)
      activityEvents.forEach(eventName => window.removeEventListener(eventName, registerActivity))
      window.removeEventListener('popstate', handleBackNavigation)
      window.removeEventListener('pagehide', handlePageExit)
      window.removeEventListener('beforeunload', handlePageExit)
    }
  }, [user])

  const [userError, setUserError] = useState('')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '' })

  useEffect(() => {
    if (!user) return
    fetch('/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'No se pudieron cargar los usuarios')
        setUsers(data)
      })
      .catch((error) => setUserError(error.message))
  }, [user])

  function handleLogin(nextUser) {
    localStorage.setItem('user', JSON.stringify(nextUser))
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
    setUser(nextUser)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem(LAST_ACTIVITY_KEY)
    setUser(null)
    setUsers([])
  }

  async function createUser(event) {
    event.preventDefault()
    setUserError('')
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(newUser),
    })
    const data = await response.json()
    if (!response.ok) return setUserError(data.error || 'No se pudo crear el usuario')
    setUsers((currentUsers) => [{ id: data.id, full_name: data.fullName, email: data.email, is_active: 1 }, ...currentUsers])
    setNewUser({ fullName: '', email: '', password: '' })
    setShowCreateUser(false)
  }

  if (window.location.pathname === '/restablecer-contrasena') return <div className="auth-wrap"><h1 className="app-title">SGTurnos Empresariales</h1><p className="subtitle">Recuperación segura de acceso</p><ResetPassword /></div>

  if (!user) return <div className="auth-wrap"><h1 className="app-title">SGTurnos Empresariales</h1><p className="subtitle">Gestión de turnos, personas y operaciones</p><Login onLogin={handleLogin} /></div>

  // Detectar si es empleado por Id_rol (puede ser número o string)
  const rolStr = String(user.Id_rol || '').toLowerCase().trim()
  
  // Detectar si es super admin (rol 1: super_admin)
  const isSuperAdmin = ['super_admin', 'superadmin', 'developer', '1', 'admin'].includes(rolStr) || user.Id_rol === 1
  
  // Detectar si es empleado (rol 5: emple5, empleado)
  const isEmpleado = ['emple5', 'empleado', 'employee', '5'].includes(rolStr) || user.Id_rol === 5
  
  // Detectar si es planificador (rol 3: plani3)
  const isPlanificador = ['plani3', 'planificador', 'scheduler', '3'].includes(rolStr) || user.Id_rol === 3

  // Detectar si es supervisor (rol 4: supvi4)
  const isSupervisor = ['supvi4', 'supervisor', 'supervisor', '4'].includes(rolStr) || user.Id_rol === 4

  // Detectar si es admin empresa (rol 2: ademp2)
  const isAdminEmpresa = ['ademp2', 'admin', 'admin_empresa', '2'].includes(rolStr) || user.Id_rol === 2

  if (isSuperAdmin) return <SuperAdminDashboard onLogout={logout} />

  if (isEmpleado) return <EmpleadoDashboard onLogout={logout} />
  
  if (isPlanificador) return <PlanificadorDashboard onLogout={logout} />

  if (isSupervisor) return <SupervisorDashboard onLogout={logout} />

  if (isAdminEmpresa) return <AdminEmpresaDashboard onLogout={logout} />

  return <main className="dashboard">
    <header className="dashboard-header"><div><span className="eyebrow">Panel de control</span><h1>Hola, {user.nombre || 'Administrador'}</h1></div><button className="button-secondary" type="button" onClick={logout}>Cerrar sesión</button></header>
    <section className="status-row"><div><span className="status-dot" /> API {health?.ok ? 'conectada' : 'sin respuesta'}</div><div>Rol: <strong>{user.Id_rol || 'Usuario'}</strong></div></section>
    <section className="dashboard-grid"><article className="panel panel-accent"><span className="eyebrow">Usuarios registrados</span><strong className="metric">{users.length}</strong><p>Personas disponibles para asignar turnos.</p></article><article className="panel"><span className="eyebrow">Siguiente módulo</span><h2>Gestión de turnos</h2><p>La base está lista para construir departamentos, horarios y asignaciones.</p></article></section>
    <section className="panel users-panel"><div className="panel-heading"><div><span className="eyebrow">Directorio</span><h2>Usuarios del sistema</h2></div><button className="button-primary" type="button" onClick={() => setShowCreateUser((visible) => !visible)}>Nuevo usuario</button></div>{showCreateUser && <form className="create-user" onSubmit={createUser}><input aria-label="Nombre completo" placeholder="Nombre completo" required value={newUser.fullName} onChange={(event) => setNewUser({ ...newUser, fullName: event.target.value })} /><input aria-label="Correo" type="email" placeholder="Correo" required value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} /><input aria-label="Contraseña" type="password" placeholder="Contraseña" minLength="8" required value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} /><button className="button-primary" type="submit">Guardar</button></form>}{userError && <p className="feedback">{userError}</p>}<div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Estado</th></tr></thead><tbody>{users.map((item) => <tr key={item.id}><td>{item.full_name}</td><td>{item.email}</td><td><span className="active-label">Activo</span></td></tr>)}{users.length === 0 && <tr><td colSpan="3">No hay usuarios visibles. Ejecuta la migración inicial.</td></tr>}</tbody></table></div></section>
  </main>
}

export default App
