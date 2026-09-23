-- Actualizar datos faltantes en la tabla empresas
-- Empresas 1-8 con datos completos

UPDATE empresas SET 
  nit = '900123456-1',
  pais = 'Colombia',
  ciudad = 'Bogotá',
  contacto = 'María García López',
  correo = 'contacto@empresa-demo.com',
  telefono = '3101234567'
WHERE id = 1;

UPDATE empresas SET 
  nit = '900234567-1',
  pais = 'Colombia',
  ciudad = 'Bogotá',
  contacto = 'Juan Martínez Pérez',
  correo = 'contacto@comercial-norte.com',
  telefono = '3102345678'
WHERE id = 2;

UPDATE empresas SET 
  nit = '900345678-1',
  pais = 'Colombia',
  ciudad = 'Medellín',
  contacto = 'Carlos Rodríguez Silva',
  correo = 'contacto@tienda-local.com',
  telefono = '3103456789'
WHERE id = 3;

UPDATE empresas SET 
  nit = '900456789-1',
  pais = 'Colombia',
  ciudad = 'Cali',
  contacto = 'Ana González Ruiz',
  correo = 'contacto@servicios-vecinos.com',
  telefono = '3104567890'
WHERE id = 4;

UPDATE empresas SET 
  nit = '900567890-1',
  pais = 'Estados Unidos',
  ciudad = 'Nueva York',
  contacto = 'Robert Johnson',
  correo = 'contact@oficina-pyme.com',
  telefono = '+1-212-555-0100'
WHERE id = 5;

UPDATE empresas SET 
  nit = '900678901-1',
  pais = 'España',
  ciudad = 'Madrid',
  contacto = 'Fernando García López',
  correo = 'contacto@solutions-medio.com',
  telefono = '+34-91-5550100'
WHERE id = 6;

UPDATE empresas SET 
  nit = '900789012-1',
  pais = 'Chile',
  ciudad = 'Santiago',
  contacto = 'José Ramírez Flores',
  correo = 'contacto@operaciones-sur.com',
  telefono = '+56-2-25550100'
WHERE id = 7;

UPDATE empresas SET 
  nit = '900890123-1',
  pais = 'Reino Unido',
  ciudad = 'Londres',
  contacto = 'Michael Smith',
  correo = 'contact@corporativo-premium.com',
  telefono = '+44-20-75550100'
WHERE id = 8;
