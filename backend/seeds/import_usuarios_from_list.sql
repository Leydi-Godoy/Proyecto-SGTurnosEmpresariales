-- Seed: import_usuarios_from_list.sql
-- Importa usuarios desde una lista, crea roles si faltan y asigna roles a usuarios.
-- Las contraseñas se generan como SHA2(primer_apellido + '123', 512).

START TRANSACTION;

-- Asegurar existencia de la empresa demo
INSERT INTO planes (nombre, caracteristicas, precio)
SELECT 'Free', JSON_OBJECT('max_empleados', 10), 0.00
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM planes WHERE nombre = 'Free');

INSERT INTO empresas (nombre, zona_horaria, plan_id)
SELECT 'Demo Corp', 'America/Argentina/Buenos_Aires', p.id
FROM planes p
WHERE p.nombre = 'Free' AND NOT EXISTS (SELECT 1 FROM empresas WHERE nombre = 'Demo Corp');

-- Crear roles de referencia (si no existen)
INSERT IGNORE INTO roles (nombre, descripcion)
VALUES
  ('supvi4', 'Supervisor nivel 4'),
  ('supad1', 'Supervisor administrador 1'),
  ('plani3', 'Planificador nivel 3'),
  ('ademp2', 'Administrador de empleados 2'),
  ('emple5', 'Empleado nivel 5');

-- Insertar usuarios (reutilizando datos proporcionados). Usamos INSERT IGNORE para evitar duplicados.

INSERT IGNORE INTO usuarios (id, empresa_id, correo, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, nombre_completo, telefono, esta_activo)
VALUES
  (11122, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'veeronicalara@sgturnos.com', SHA2(CONCAT('Lara','123'),512), 'Veronica','Luciana','Lara','Carranza','Veronica Luciana Lara Carranza', NULL, 1),
  (10203040, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'rosajimenez@sgturnos.com', SHA2(CONCAT('Jimenez','123'),512), 'Rosa','Magnolia','Jimenez','Tafur','Rosa Magnolia Jimenez Tafur', NULL, 1),
  (10293847, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'oscarcampos@sgturnos.com', SHA2(CONCAT('Campos','123'),512), 'Oscar','Santiago','Campos','Ovalle','Oscar Santiago Campos Ovalle', NULL, 1),
  (10439581, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'beatrizmendoza@sgturnos.com', SHA2(CONCAT('Mendoza','123'),512), 'Beatriz','Ana','Mendoza','Trump','Beatriz Ana Mendoza Trump', NULL, 1),
  (12233445, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'victorguerrero@sgturnos.com', SHA2(CONCAT('Guerrero','123'),512), 'Victor','Pablo','Guerrero','Libano','Victor Pablo Guerrero Libano', NULL, 1),
  (13579246, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'pedrosanchez@sgturnos.com', SHA2(CONCAT('Sanchez','123'),512), 'Pedro','Camilo','Sanchez','Tolosa','Pedro Camilo Sanchez Tolosa', NULL, 1),
  (14142135, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'isabelmunoz@sgturnos.com', SHA2(CONCAT('Muñoz','123'),512), 'Isabel','Alejandra','Muñoz','Aguilar','Isabel Alejandra Muñoz Aguilar', NULL, 1),
  (16180339, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'miguelruiz@sgturnos.com', SHA2(CONCAT('Ruiz','123'),512), 'Miguel','Camilo','Ruiz','Treller','Miguel Camilo Ruiz Treller', NULL, 1),
  (20304050, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'fernandoluna@sgturnos.com', SHA2(CONCAT('Luna','123'),512), 'Fernando','Luis','Luna','Rayo','Fernando Luis Luna Rayo', NULL, 1),
  (24681357, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'lauraramirez@sgturnos.com', SHA2(CONCAT('Ramirez','123'),512), 'Laura','Andrea','Ramirez','Valles','Laura Andrea Ramirez Valles', NULL, 1),
  (27182818, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'elenavargas@sgturnos.com', SHA2(CONCAT('Vargas','123'),512), 'Elena','Sofia','Vargas','Brush','Elena Sofia Vargas Brush', NULL, 1),
  (29979245, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'patricianavarro@sgturnos.com', SHA2(CONCAT('Navarro','123'),512), 'Patricia','Nenitza','Navarro','Palma','Patricia Nenitza Navarro Palma', NULL, 1),
  (30405060, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'eduardosoto@sgturnos.com', SHA2(CONCAT('Soto','123'),512), 'Eduardo','Felipe','Soto','Cardozo','Eduardo Felipe Soto Cardozo', NULL, 1),
  (31415926, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'diegotorres@sgturnos.com', SHA2(CONCAT('Torres','123'),512), 'Diego','David','Torres','Gomez','Diego David Torres Gomez', NULL, 1),
  (40506070, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'albertocruz@sgturnos.com', SHA2(CONCAT('Cruz','123'),512), 'Alberto','Emiro','Cruz','Hunt','Alberto Emiro Cruz Hunt', NULL, 1),
  (44455566, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'paulamolina@sgturnos.com', SHA2(CONCAT('Molina','123'),512), 'Paula','Gabriela','Molina','Terrence','Paula Gabriela Molina Terrence', NULL, 1),
  (48273377, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'dantegebel@sgturnos.com', SHA2(CONCAT('Gebel','123'),512), 'Dante','Jose','Gebel','Urrutia','Dante Jose Gebel Urrutia', NULL, 1),
  (50288419, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'teresacastro@sgturnos.com', SHA2(CONCAT('Castro','123'),512), 'Teresa','Maria','Castro','Lopez','Teresa Maria Castro Lopez', NULL, 1),
  (55667788, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'olgaespinoza@sgturnos.com', SHA2(CONCAT('Espinoza','123'),512), 'Olga','Shakira','Espinoza','Castrol','Olga Shakira Espinoza Castrol', NULL, 1),
  (56473829, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'luciavaldez@sgturnos.com', SHA2(CONCAT('Valdez','123'),512), 'Lucia','Daniela','Valdez','Florez','Lucia Daniela Valdez Florez', NULL, 1),
  (57721566, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'javiermoreno@sgturnos.com', SHA2(CONCAT('Moreno','123'),512), 'Javier','Francisco','Moreno','Daza','Javier Francisco Moreno Daza', NULL, 1),
  (60708090, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'monicaparedes@sgturnos.com', SHA2(CONCAT('Paredes','123'),512), 'Monica','Lucia','Paredes','Camargo','Monica Lucia Paredes Camargo', NULL, 1),
  (66677788, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'claudiaquintana@sgturnos.com', SHA2(CONCAT('Quintana','123'),512), 'Claudia','Marcela','Quintana','Fajardo','Claudia Marcela Quintana Fajardo', NULL, 1),
  (66778899, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'sofiahernandez@sgturnos.com', SHA2(CONCAT('Hernandez','123'),512), 'Sofia',NULL,'Hernandez',NULL,'Sofia Hernandez', NULL, 1),
  (69314718, (SELECT id FROM empresas WHERE nombre = 'Demo Corp'), 'franciscoromero@sgturnos.com', SHA2(CONCAT('Romero','123'),512), 'Francisco','Javier','Romero','Caldas','Francisco Javier Romero Caldas', NULL, 1);

-- Asignar roles según el código proporcionado (Id_rol)
-- Mapeo ejemplo tomado de la lista: supvi4, supad1, plani3, ademp2, emple5

-- Para cada usuario, insertar la relación usuario_roles basada en email y rol.nombre
INSERT IGNORE INTO usuario_roles (usuario_id, rol_id, alcance)
SELECT u.id, r.id, 'empresa'
FROM usuarios u JOIN roles r ON r.nombre = 'supvi4'
WHERE u.email IN ('veeronicalara@sgturnos.com','paulamolina@sgturnos.com');

INSERT IGNORE INTO usuario_roles (usuario_id, rol_id, alcance)
SELECT u.id, r.id, 'empresa'
FROM usuarios u JOIN roles r ON r.nombre = 'supad1'
WHERE u.email IN ('rosajimenez@sgturnos.com');

INSERT IGNORE INTO usuario_roles (usuario_id, rol_id, alcance)
SELECT u.id, r.id, 'empresa'
FROM usuarios u JOIN roles r ON r.nombre = 'plani3'
WHERE u.email IN ('oscarcampos@sgturnos.com','beatrizmendoza@sgturnos.com');

INSERT IGNORE INTO usuario_roles (usuario_id, rol_id, alcance)
SELECT u.id, r.id, 'empresa'
FROM usuarios u JOIN roles r ON r.nombre = 'ademp2'
WHERE u.email IN ('victorguerrero@sgturnos.com','dantegebel@sgturnos.com');

-- El resto como 'emple5'
INSERT IGNORE INTO usuario_roles (usuario_id, rol_id, alcance)
SELECT u.id, r.id, 'empresa'
FROM usuarios u JOIN roles r ON r.nombre = 'emple5'
WHERE u.email IN (
  'pedrosanchez@sgturnos.com','isabelmunoz@sgturnos.com','miguelruiz@sgturnos.com',
  'fernandoluna@sgturnos.com','lauraramirez@sgturnos.com','elenavargas@sgturnos.com',
  'patricianavarro@sgturnos.com','eduardosoto@sgturnos.com','diegotorres@sgturnos.com',
  'albertocruz@sgturnos.com','teresacastro@sgturnos.com','olgaespinoza@sgturnos.com',
  'luciavaldez@sgturnos.com','javiermoreno@sgturnos.com','monicaparedes@sgturnos.com',
  'claudiaquintana@sgturnos.com','sofiahernandez@sgturnos.com','franciscoromero@sgturnos.com'
);

COMMIT;

-- NOTA: Revisa los hashes y pruebas en un entorno seguro. Puedes cambiar el algoritmo de hash según tu política (bcrypt recomendado en producción).
