import { useState, useEffect } from 'react'
import colombiaTerritorial from 'colombia-territorial'

const municipiosColombia = colombiaTerritorial.departamentos.flatMap(departamento =>
  departamento.municipios.map(municipio => municipio.nombre)
)
const ciudadesColombia = ['Bogotá', ...municipiosColombia.filter(ciudad => ciudad !== 'Bogotá')]

const ubicacionesPorRegion = [
  {
    region: 'América del Norte',
    paises: [
      { nombre: 'Canadá', ciudades: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa', 'Edmonton', 'Quebec City', 'Winnipeg', 'Halifax', 'Victoria'] },
      { nombre: 'Estados Unidos', ciudades: ['Nueva York', 'Los Ángeles', 'Chicago', 'Houston', 'Phoenix', 'Filadelfia', 'San Antonio', 'San Diego', 'Dallas', 'Miami'] },
      { nombre: 'México', ciudades: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Ciudad Juárez', 'Mérida', 'Querétaro', 'Cancún'] }
    ]
  },
  {
    region: 'América Central',
    paises: [
      { nombre: 'Belice', ciudades: ['Belmopán', 'Ciudad de Belice', 'San Ignacio', 'Orange Walk', 'Dangriga', 'Corozal', 'Punta Gorda', 'San Pedro', 'Benque Viejo del Carmen', 'Ladyville'] },
      { nombre: 'Costa Rica', ciudades: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Liberia', 'Puntarenas', 'Limón', 'San Isidro', 'Desamparados', 'San Carlos'] },
      { nombre: 'El Salvador', ciudades: ['San Salvador', 'Santa Ana', 'San Miguel', 'Soyapango', 'Santa Tecla', 'Mejicanos', 'Sonsonate', 'Apopa', 'Delgado', 'Ilopango'] },
      { nombre: 'Guatemala', ciudades: ['Ciudad de Guatemala', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'Escuintla', 'Antigua Guatemala', 'San Pedro Carchá', 'Cobán', 'Huehuetenango', 'Puerto Barrios'] },
      { nombre: 'Honduras', ciudades: ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'Choloma', 'Comayagua', 'Puerto Cortés', 'El Progreso', 'Villanueva', 'Choluteca', 'Juticalpa'] },
      { nombre: 'Nicaragua', ciudades: ['Managua', 'León', 'Masaya', 'Granada', 'Matagalpa', 'Chinandega', 'Estelí', 'Juigalpa', 'Jinotega', 'Rivas'] },
      { nombre: 'Panamá', ciudades: ['Ciudad de Panamá', 'San Miguelito', 'Colón', 'David', 'La Chorrera', 'Santiago de Veraguas', 'Chitré', 'Penonomé', 'Aguadulce', 'Arraiján'] }
    ]
  },
  {
    region: 'América del Sur',
    paises: [
      { nombre: 'Argentina', ciudades: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata', 'Salta', 'San Miguel de Tucumán', 'Santa Fe', 'Corrientes'] },
      { nombre: 'Bolivia', ciudades: ['La Paz', 'Santa Cruz de la Sierra', 'Cochabamba', 'Sucre', 'Oruro', 'Tarija', 'Potosí', 'Sacaba', 'Montero', 'Trinidad'] },
      { nombre: 'Brasil', ciudades: ['São Paulo', 'Río de Janeiro', 'Brasilia', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaos', 'Curitiba', 'Recife', 'Porto Alegre'] },
      { nombre: 'Chile', ciudades: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Iquique', 'Rancagua', 'Talca', 'Arica'] },
      { nombre: 'Colombia', ciudades: ciudadesColombia },
      { nombre: 'Ecuador', ciudades: ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Manta', 'Loja', 'Portoviejo', 'Ambato', 'Riobamba'] },
      { nombre: 'Guyana', ciudades: ['Georgetown', 'Linden', 'New Amsterdam', 'Anna Regina', 'Bartica', 'Corriverton', 'Rose Hall', 'Mahaica', 'Lethem', 'Mabaruma'] },
      { nombre: 'Paraguay', ciudades: ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá', 'Encarnación', 'Lambaré', 'Fernando de la Mora', 'Mariano Roque Alonso', 'Pedro Juan Caballero'] },
      { nombre: 'Perú', ciudades: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Cusco', 'Piura', 'Iquitos', 'Huancayo', 'Chimbote', 'Tacna'] },
      { nombre: 'Surinam', ciudades: ['Paramaribo', 'Lelydorp', 'Brokopondo', 'Nieuw Nickerie', 'Moengo', 'Albina', 'Groningen', 'Wageningen', 'Onverwacht', 'Totness'] },
      { nombre: 'Uruguay', ciudades: ['Montevideo', 'Salto', 'Ciudad de la Costa', 'Paysandú', 'Las Piedras', 'Rivera', 'Maldonado', 'Tacuarembó', 'Melo', 'Mercedes'] },
      { nombre: 'Venezuela', ciudades: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'Maturín', 'Barcelona', 'Puerto La Cruz', 'Cabimas'] }
    ]
  },
  {
    region: 'Europa',
    paises: [
      { nombre: 'España', ciudades: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Bilbao', 'Alicante', 'Murcia', 'Palma'] },
      { nombre: 'Portugal', ciudades: ['Lisboa', 'Oporto', 'Braga', 'Coímbra', 'Funchal', 'Aveiro', 'Setúbal', 'Amadora', 'Almada', 'Viseu'] },
      { nombre: 'Italia', ciudades: ['Roma', 'Milán', 'Nápoles', 'Turín', 'Palermo', 'Génova', 'Bolonia', 'Florencia', 'Venecia', 'Bari'] }
    ]
  }
]

const paises = ubicacionesPorRegion.flatMap(region => region.paises)

export default function GestionEmpresas() {
  const [empresas, setEmpresas] = useState([])
  const [planes, setPlanes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    pais: '',
    ciudad: '',
    zona_horaria: 'America/Bogota',
    plan_id: '1',
    contacto: '',
    email: '',
    telefono: '',
    activo: true
  })

  useEffect(() => {
    fetch('/api/empresas', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'No se pudieron cargar las empresas')
        setEmpresas(data.map(empresa => ({
          ...empresa,
          email: empresa.correo || empresa.email || '',
          activo: Boolean(Number(empresa.activo ?? 1)),
          usuarios: 0
        })))
      })
      .catch(error => setMensaje(`⚠️ ${error.message}`))

    fetch('/api/planes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'No se pudieron cargar los planes')
        setPlanes(data)
      })
      .catch(error => setMensaje(prev => prev ? `${prev} ⚠️ ${error.message}` : `⚠️ ${error.message}`))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'pais') {
      setFormData(prev => ({ ...prev, pais: value, ciudad: '' }))
      return
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validarForm = () => {
    if (!formData.nombre) return 'Nombre es requerido'
    if (!formData.nit) return 'NIT es requerido'
    if (!formData.pais) return 'País es requerido'
    if (!formData.ciudad) return 'Ciudad es requerido'
    if (!formData.zona_horaria) return 'La zona horaria es requerida'
    if (!formData.plan_id || !['1', '2', '3'].includes(String(formData.plan_id))) return 'El plan es requerido y debe ser 1, 2 o 3'
    if (!formData.contacto) return 'Contacto es requerido'
    if (!formData.email) return 'Email es requerido'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return 'Email inválido'

    if (!editando) {
      const nitExiste = empresas.some(e => e.nit === formData.nit)
      if (nitExiste) return 'Este NIT ya está registrado'
    }

    return null
  }

  const planSeleccionado = planes.find(plan => String(plan.id) === String(formData.plan_id)) || null

  const handleGuardar = async () => {
    const error = validarForm()
    if (error) return alert(error)

    const payload = {
      nombre: formData.nombre,
      nit: formData.nit,
      pais: formData.pais,
      ciudad: formData.ciudad,
      contacto: formData.contacto,
      correo: formData.email,
      telefono: formData.telefono,
      activo: formData.activo,
      zona_horaria: formData.zona_horaria,
      plan_id: Number(formData.plan_id)
    }

    if (editando) {
      const response = await fetch(`/api/empresas/${editando}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (!response.ok) return setMensaje(`⚠️ ${data.error || 'No se pudo actualizar la empresa'}`)

      setEmpresas(prev => prev.map(e =>
        e.id === editando
          ? { ...e, ...data, email: data.correo || formData.email, activo: Boolean(Number(data.activo ?? 1)), usuarios: e.usuarios || 0 }
          : e
      ))
      setMensaje('✅ Empresa actualizada correctamente')
      setEditando(null)
    } else {
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (!response.ok) return setMensaje(`⚠️ ${data.error || 'No se pudo crear la empresa'}`)
      setEmpresas(prev => [...prev, { ...data, ...payload, email: data.correo || formData.email, usuarios: 0 }])
      setMensaje('✅ Empresa creada correctamente')
    }

    setFormData({
      nombre: '',
      nit: '',
      pais: '',
      ciudad: '',
      zona_horaria: 'America/Bogota',
      plan_id: '1',
      contacto: '',
      email: '',
      telefono: '',
      activo: true
    })
    setShowForm(false)
    setTimeout(() => setMensaje(''), 3000)
  }

  const handleEditar = (empresa) => {
    setFormData({
      nombre: empresa.nombre,
      nit: empresa.nit,
      pais: empresa.pais,
      ciudad: empresa.ciudad,
      zona_horaria: empresa.zona_horaria || 'America/Bogota',
      plan_id: empresa.plan_id ? String(empresa.plan_id) : '1',
      contacto: empresa.contacto,
      email: empresa.email || empresa.correo || '',
      telefono: empresa.telefono,
      activo: empresa.activo !== undefined ? Boolean(Number(empresa.activo)) : true
    })
    setEditando(empresa.id)
    setShowForm(true)
  }

  const handleEliminar = (id) => {
    if (confirm('¿Eliminar esta empresa?')) {
      setEmpresas(prev => prev.filter(e => e.id !== id))
      setMensaje('✅ Empresa eliminada')
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const handleToggleActivo = (id) => {
    setEmpresas(prev => prev.map(e =>
      e.id === id ? { ...e, activo: !e.activo } : e
    ))
  }

  return (
    <div className="gestion-empresas-panel">
      <div className="panel-header">
        <h2>🏢 Gestión de Empresas</h2>
        <p className="subtitle">Crear, editar y gestionar todas las empresas del sistema</p>
      </div>

      {mensaje && (
        <div className="success-message">{mensaje}</div>
      )}

      <div className="toolbar">
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm)
            setEditando(null)
            setFormData({
              nombre: '',
              nit: '',
              pais: '',
              ciudad: '',
                zona_horaria: 'America/Bogota',
                plan_id: '1',
              contacto: '',
              email: '',
              telefono: '',
              activo: true
            })
          }}
        >
          {showForm ? '✕ Cancelar' : '➕ Nueva Empresa'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editando ? '✏️ Editar Empresa' : '➕ Crear Nueva Empresa'}</h3>
          <div className="form-grid">
            <label>
              Nombre de Empresa
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre completo"
              />
            </label>
            <label>
              NIT
              <input
                type="text"
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                placeholder="Ej: 900123456-1"
              />
            </label>
            <label>
              País
              <select
                name="pais"
                value={formData.pais}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un país</option>
                {ubicacionesPorRegion.map(region => (
                  <optgroup key={region.region} label={region.region}>
                    {region.paises.map(pais => (
                      <option key={pais.nombre} value={pais.nombre}>{pais.nombre}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label>
              Ciudad
              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                disabled={!formData.pais}
                required
              >
                <option value="">{formData.pais ? 'Selecciona una ciudad' : 'Selecciona primero un país'}</option>
                {paises.find(pais => pais.nombre === formData.pais)?.ciudades.map(ciudad => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </label>
            <label>
              Zona horaria de la empresa
              <select
                name="zona_horaria"
                value={formData.zona_horaria}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una zona horaria</option>
                <option value="America/Bogota">America/Bogota</option>
                <option value="America/Mexico_City">America/Mexico_City</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
                <option value="America/Santiago">America/Santiago</option>
                <option value="Europe/Madrid">Europe/Madrid</option>
                <option value="Europe/London">Europe/London</option>
                <option value="UTC">UTC</option>
              </select>
            </label>
            <label>
              Plan de la empresa
              <select
                name="plan_id"
                value={formData.plan_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un plan</option>
                {planes.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.nombre}</option>
                ))}
              </select>
            </label>

            <div className="plan-resumen">
              <strong>Características del plan</strong>
              {planSeleccionado ? (
                <div className="plan-card">
                  <h4>{planSeleccionado.nombre}</h4>
                  <ul>
                    {Array.isArray(planSeleccionado.caracteristicas)
                      ? planSeleccionado.caracteristicas.map((item, index) => <li key={index}>{item}</li>)
                      : planSeleccionado.caracteristicas && typeof planSeleccionado.caracteristicas === 'object'
                        ? Object.values(planSeleccionado.caracteristicas).map((item, index) => <li key={index}>{String(item)}</li>)
                        : <li>{String(planSeleccionado.caracteristicas || 'Sin características')}</li>
                  }
                  </ul>
                </div>
              ) : (
                <p>Selecciona un plan para ver sus características.</p>
              )}
            </div>
            <label>
              Contacto Principal
              <input
                type="text"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                placeholder="Nombre completo"
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contacto@empresa.com"
              />
            </label>
            <label>
              Teléfono
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+57 1 234 5678"
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              Empresa Activa
            </label>
          </div>
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleGuardar}>
              💾 Guardar
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowForm(false)
                setEditando(null)
              }}
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="empresas-tabla">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>NIT</th>
              <th>Ciudad</th>
              <th>Contacto</th>
              <th>Email</th>
              <th>Usuarios</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map(empresa => (
              <tr key={empresa.id} className={!empresa.activo ? 'inactivo' : ''}>
                <td><strong>{empresa.nombre}</strong></td>
                <td>{empresa.nit}</td>
                <td>{empresa.ciudad}</td>
                <td>{empresa.contacto}</td>
                <td>{empresa.email}</td>
                <td><span className="badge">{empresa.usuarios}</span></td>
                <td>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={empresa.activo}
                      onChange={() => handleToggleActivo(empresa.id)}
                      aria-label={`${empresa.activo ? 'Desactivar' : 'Activar'} ${empresa.nombre}`}
                    />
                    <span className={`toggle-track ${empresa.activo ? 'activo' : 'inactivo'}`} aria-hidden="true" />
                    <span className={`toggle-label ${empresa.activo ? 'activo' : 'inactivo'}`}>
                      <span className="toggle-status-dot" aria-hidden="true" />
                      {empresa.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </label>
                </td>
                <td>
                  <div className="acciones">
                    <button
                      className="btn-sm btn-edit"
                      onClick={() => handleEditar(empresa)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-sm btn-delete"
                      onClick={() => handleEliminar(empresa.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
