import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'

function App() {
  const [health, setHealth] = useState(null)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ ok: false }))
  }, [])

  const [users, setUsers] = useState([])
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
    setUser(nextUser)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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

  if (!user) return <div className="auth-wrap"><div className="brand-mark">SG</div><h1 className="app-title">SGTurnos Empresariales</h1><p className="subtitle">Gestión de turnos, personas y operaciones</p><Login onLogin={handleLogin} /></div>

  return <main className="dashboard">
    <header className="dashboard-header"><div><span className="eyebrow">Panel de control</span><h1>Hola, {user.nombre || 'Administrador'}</h1></div><button className="button-secondary" type="button" onClick={logout}>Cerrar sesión</button></header>
    <section className="status-row"><div><span className="status-dot" /> API {health?.ok ? 'conectada' : 'sin respuesta'}</div><div>Rol: <strong>{user.Id_rol || 'Usuario'}</strong></div></section>
    <section className="dashboard-grid"><article className="panel panel-accent"><span className="eyebrow">Usuarios registrados</span><strong className="metric">{users.length}</strong><p>Personas disponibles para asignar turnos.</p></article><article className="panel"><span className="eyebrow">Siguiente módulo</span><h2>Gestión de turnos</h2><p>La base está lista para construir departamentos, horarios y asignaciones.</p></article></section>
    <section className="panel users-panel"><div className="panel-heading"><div><span className="eyebrow">Directorio</span><h2>Usuarios del sistema</h2></div><button className="button-primary" type="button" onClick={() => setShowCreateUser((visible) => !visible)}>Nuevo usuario</button></div>{showCreateUser && <form className="create-user" onSubmit={createUser}><input aria-label="Nombre completo" placeholder="Nombre completo" required value={newUser.fullName} onChange={(event) => setNewUser({ ...newUser, fullName: event.target.value })} /><input aria-label="Correo" type="email" placeholder="Correo" required value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} /><input aria-label="Contraseña" type="password" placeholder="Contraseña" minLength="8" required value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} /><button className="button-primary" type="submit">Guardar</button></form>}{userError && <p className="feedback">{userError}</p>}<div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Estado</th></tr></thead><tbody>{users.map((item) => <tr key={item.id}><td>{item.full_name}</td><td>{item.email}</td><td><span className="active-label">Activo</span></td></tr>)}{users.length === 0 && <tr><td colSpan="3">No hay usuarios visibles. Ejecuta la migración inicial.</td></tr>}</tbody></table></div></section>
  </main>
}

export default App
