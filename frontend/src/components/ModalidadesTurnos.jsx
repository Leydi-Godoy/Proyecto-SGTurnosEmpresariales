import { useState, useEffect } from 'react'

export default function ModalidadesTurnos() {
  const [modalidades, setModalidades] = useState([])

  useEffect(() => {
    // Mock data
    setModalidades([
      {
        id: 1,
        tipo: '8 Horas Fijo',
        duracion_base: 8,
        pausa_incluida: true,
        duracion_pausa: 60,
        pausa_remunerada: true,
        activo: true,
        descripcion: 'Turno de 8 horas con pausa de almuerzo de 1 hora'
      },
      {
        id: 2,
        tipo: '12 Horas Fijo',
        duracion_base: 12,
        pausa_incluida: true,
        duracion_pausa: 60,
        pausa_remunerada: true,
        activo: true,
        descripcion: 'Turno de 12 horas con pausa de almuerzo de 1 hora'
      },
      {
        id: 3,
        tipo: '6 Horas Fijo',
        duracion_base: 6,
        pausa_incluida: false,
        duracion_pausa: 0,
        pausa_remunerada: false,
        activo: true,
        descripcion: 'Turno de 6 horas sin pausa'
      },
      {
        id: 4,
        tipo: 'Rotativo 7-14 días',
        duracion_base: 8,
        pausa_incluida: true,
        duracion_pausa: 60,
        pausa_remunerada: true,
        activo: false,
        descripcion: 'Sistema rotativo con ciclo de 7 días trabajo, 7 días descanso'
      }
    ])
  }, [])

  const handleToggle = (id) => {
    setModalidades(prev => prev.map(m =>
      m.id === id ? { ...m, activo: !m.activo } : m
    ))
  }

  return (
    <div className="modalidades-turnos-panel">
      <div className="panel-header">
        <h2>Modalidades de Turnos</h2>
        <p className="subtitle">Configura los tipos de turnos disponibles en tu empresa</p>
      </div>

      <div className="info-banner">
        <p>Las modalidades activas estaran disponibles para crear mallas de turnos</p>
      </div>

      <div className="modalidades-list">
        {modalidades.map(modalidad => (
          <div key={modalidad.id} className={`modalidad-card ${modalidad.activo ? 'activo' : 'inactivo'}`}>
            <div className="modalidad-header">
              <div>
                <h3>{modalidad.tipo}</h3>
                <p className="descripcion">{modalidad.descripcion}</p>
              </div>
              <div className="toggle-container">
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={modalidad.activo}
                    onChange={() => handleToggle(modalidad.id)}
                  />
                  <span className="slider"></span>
                </label>
                <span className="status-label">
                  {modalidad.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div className="modalidad-detalles">
              <div className="detalle-item">
                <span className="detalle-label">Duración Base:</span>
                <span className="detalle-valor">{modalidad.duracion_base}h</span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Pausa:</span>
                <span className="detalle-valor">
                  {modalidad.pausa_incluida ? `${modalidad.duracion_pausa}min` : 'No incluida'}
                </span>
              </div>
              <div className="detalle-item">
                <span className="detalle-label">Pausa Remunerada:</span>
                <span className="detalle-valor">
                  {modalidad.pausa_remunerada ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h3>Modalidades Predeterminadas</h3>
        <p>Estas modalidades vienen configuradas por defecto. Puedes activarlas o desactivarlas según tu necesidad.</p>
        <ul>
          <li><strong>8 Horas Fijo:</strong> Ideal para jornadas de oficina (Ej: 6-14, 14-22, 22-6)</li>
          <li><strong>12 Horas Fijo:</strong> Para operaciones continuas o turnos extendidos</li>
          <li><strong>6 Horas Fijo:</strong> Para turnos cortos o jornadas compartidas</li>
          <li><strong>Rotativo:</strong> Ciclos de rotación (7 trabajo / 7 descanso, etc.)</li>
        </ul>
      </div>
    </div>
  )
}
