const http = require('http');

// Credenciales de prueba - Planificador
const PLANIFICADOR_EMAIL = 'dantegebel@sgturnos.com';
const PLANIFICADOR_PASS = 'password123';
const BASE_URL = 'http://localhost:3001/api';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DE ENDPOINTS\n');
  
  let token = null;

  try {
    // TEST 1: Login
    console.log('TEST 1️⃣  - Login como Planificador');
    const loginRes = await makeRequest('POST', '/auth/login', {
      correo: PLANIFICADOR_EMAIL,
      contrasena: PLANIFICADOR_PASS
    });
    
    if (loginRes.status === 200 && loginRes.body.token) {
      token = loginRes.body.token;
      console.log('✅ Login exitoso');
      console.log(`   Usuario: ${loginRes.body.usuario.nombre}`);
      console.log(`   Rol: ${loginRes.body.usuario.id_rol}\n`);
    } else {
      console.log('❌ Login fallido:', loginRes.body);
      process.exit(1);
    }

    // TEST 2: GET Plantillas
    console.log('TEST 2️⃣  - Obtener Plantillas');
    const plantillasRes = await makeRequest('GET', '/plantillas-turno', null, token);
    if (plantillasRes.status === 200) {
      console.log(`✅ Plantillas obtenidas: ${plantillasRes.body.length} registros\n`);
    } else {
      console.log('❌ Error:', plantillasRes.body);
    }

    // TEST 3: GET Turnos
    console.log('TEST 3️⃣  - Obtener Turnos');
    const turnosRes = await makeRequest('GET', '/turnos', null, token);
    if (turnosRes.status === 200) {
      console.log(`✅ Turnos obtenidos: ${turnosRes.body.length} registros\n`);
    } else {
      console.log('❌ Error:', turnosRes.body);
    }

    // TEST 4: Crear Plantilla
    console.log('TEST 4️⃣  - Crear nueva Plantilla');
    const newPlantilla = {
      empresa_id: 1,
      nombre: 'Turno Mañana Test',
      hora_inicio: '08:00:00',
      hora_fin: '16:00:00',
      duracion_minutos: 480,
      es_nocturno: 0,
      patron_recurrencia: 'diario'
    };
    const createPlantillaRes = await makeRequest('POST', '/plantillas-turno', newPlantilla, token);
    if (createPlantillaRes.status === 201) {
      console.log(`✅ Plantilla creada con ID: ${createPlantillaRes.body.id}\n`);
    } else {
      console.log('❌ Error:', createPlantillaRes.body);
    }

    // TEST 5: Crear Turno (Instancia)
    console.log('TEST 5️⃣  - Crear Instancia de Turno');
    const newTurno = {
      plantilla_id: 1,
      fecha: '2026-09-20',
      inicio_fecha_hora: '2026-09-20 08:00:00',
      fin_fecha_hora: '2026-09-20 16:00:00',
      sede_id: 1
    };
    const createTurnoRes = await makeRequest('POST', '/turnos', newTurno, token);
    if (createTurnoRes.status === 201) {
      console.log(`✅ Turno creado con ID: ${createTurnoRes.body.id}\n`);
    } else {
      console.log('❌ Error:', createTurnoRes.body);
    }

    console.log('✅ TODAS LAS PRUEBAS COMPLETADAS\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runTests();
