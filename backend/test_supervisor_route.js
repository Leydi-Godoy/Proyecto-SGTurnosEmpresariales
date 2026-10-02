try {
  const supervisorRouter = require('./routes/supervisor.js')
  console.log('✅ Supervisor router cargado correctamente')
  console.log('Tipo:', typeof supervisorRouter)
  console.log('Stack:', supervisorRouter.stack ? `${supervisorRouter.stack.length} rutas` : 'No stack')
} catch (e) {
  console.error('❌ Error al cargar supervisor router:')
  console.error(e.message)
  console.error(e.stack)
}
