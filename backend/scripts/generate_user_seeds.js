const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const outPath = path.join(__dirname, '..', 'seeds', 'usuarios_import.sql');
const empresaId = 1; // ajustar si se necesita otro id
const saltRounds = 12;

const users = [
  { id: 11122, primer_nombre: 'Veronica', segundo_nombre: 'Luciana', primer_apellido: 'Lara', segundo_apellido: 'Carranza', correo: 'veeronicalara@sgturnos.com' },
  { id: 10203040, primer_nombre: 'Rosa', segundo_nombre: 'Magnolia', primer_apellido: 'Jimenez', segundo_apellido: 'Tafur', correo: 'rosajimenez@sgturnos.com' },
  { id: 10293847, primer_nombre: 'Oscar', segundo_nombre: 'Santiago', primer_apellido: 'Campos', segundo_apellido: 'Ovalle', correo: 'oscarcampos@sgturnos.com' },
  { id: 10439581, primer_nombre: 'Beatriz', segundo_nombre: 'Ana', primer_apellido: 'Mendoza', segundo_apellido: 'Trump', correo: 'beatrizmendoza@sgturnos.com' },
  { id: 12233445, primer_nombre: 'Victor', segundo_nombre: 'Pablo', primer_apellido: 'Guerrero', segundo_apellido: 'Libano', correo: 'victorguerrero@sgturnos.com' },
  { id: 13579246, primer_nombre: 'Pedro', segundo_nombre: 'camilo', primer_apellido: 'Sanchez', segundo_apellido: 'tolosa', correo: 'pedrosanchez@sgturnos.com' },
  { id: 14142135, primer_nombre: 'Isabel', segundo_nombre: 'Alejandra', primer_apellido: 'Muñoz', segundo_apellido: 'Aguilar', correo: 'isabelmunoz@sgturnos.com' },
  { id: 16180339, primer_nombre: 'Miguel', segundo_nombre: 'Camilo', primer_apellido: 'Ruiz', segundo_apellido: 'Treller', correo: 'miguelruiz@sgturnos.com' },
  { id: 20304050, primer_nombre: 'Fernando', segundo_nombre: 'Luis', primer_apellido: 'Luna', segundo_apellido: 'Rayo', correo: 'fernandoluna@sgturnos.com' },
  { id: 24681357, primer_nombre: 'Laura', segundo_nombre: 'andrea', primer_apellido: 'Ramirez', segundo_apellido: 'valles', correo: 'lauraramirez@sgturnos.com' },
  { id: 27182818, primer_nombre: 'Elena', segundo_nombre: 'sofia', primer_apellido: 'Vargas', segundo_apellido: 'Brush', correo: 'elenavargas@sgturnos.com' },
  { id: 29979245, primer_nombre: 'Patricia', segundo_nombre: 'Nenitza', primer_apellido: 'Navarro', segundo_apellido: 'Palma', correo: 'patricianavarro@sgturnos.com' },
  { id: 30405060, primer_nombre: 'Eduardo', segundo_nombre: 'Felipe', primer_apellido: 'Soto', segundo_apellido: 'Cardozo', correo: 'eduardosoto@sgturnos.com' },
  { id: 31415926, primer_nombre: 'Diego', segundo_nombre: 'David', primer_apellido: 'Torres', segundo_apellido: 'Gomez', correo: 'diegotorres@sgturnos.com' },
  { id: 40506070, primer_nombre: 'Alberto', segundo_nombre: 'Emiro', primer_apellido: 'Cruz', segundo_apellido: 'Hunt', correo: 'albertocruz@sgturnos.com' },
  { id: 44455566, primer_nombre: 'Paula', segundo_nombre: 'Gabriela', primer_apellido: 'Molina', segundo_apellido: 'Terrence', correo: 'paulamolina@sgturnos.com' },
  { id: 48273377, primer_nombre: 'Dante', segundo_nombre: 'jose', primer_apellido: 'Gebel', segundo_apellido: 'Urrutia', correo: 'dantegebel@sgturnos.com' },
  { id: 50288419, primer_nombre: 'Teresa', segundo_nombre: 'Maria', primer_apellido: 'Castro', segundo_apellido: 'Lopez', correo: 'teresacastro@sgturnos.com' },
  { id: 55667788, primer_nombre: 'Olga', segundo_nombre: 'Shakira', primer_apellido: 'Espinoza', segundo_apellido: 'Castrol', correo: 'olgaespinoza@sgturnos.com' },
  { id: 56473829, primer_nombre: 'Lucia', segundo_nombre: 'Daniela', primer_apellido: 'Valdez', segundo_apellido: 'Florez', correo: 'luciavaldez@sgturnos.com' },
  { id: 57721566, primer_nombre: 'Javier', segundo_nombre: 'Francisco', primer_apellido: 'Moreno', segundo_apellido: 'Daza', correo: 'javiermoreno@sgturnos.com' },
  { id: 60708090, primer_nombre: 'Monica', segundo_nombre: 'Lucia', primer_apellido: 'Paredes', segundo_apellido: 'Camargo', correo: 'monicaparedes@sgturnos.com' },
  { id: 66677788, primer_nombre: 'Claudia', segundo_nombre: 'Marcela', primer_apellido: 'Quintana', segundo_apellido: 'Fajardo', correo: 'claudiaquintana@sgturnos.com' },
  { id: 66778899, primer_nombre: 'Sofia', segundo_nombre: 'Hernandez', primer_apellido: null, segundo_apellido: null, correo: 'sofiahernandez@sgturnos.com' },
  { id: 69314718, primer_nombre: 'Francisco', segundo_nombre: 'Javier', primer_apellido: 'Romero', segundo_apellido: 'Caldas', correo: 'franciscoromero@sgturnos.com' },
  { id: 70809010, primer_nombre: 'Gabriela', segundo_nombre: 'Filipa', primer_apellido: 'Vega', segundo_apellido: 'Alarcon', correo: 'gabrielavega@sgturnos.com' },
  { id: 71828182, primer_nombre: 'Carmen', segundo_nombre: 'Isabelina', primer_apellido: 'Diaz', segundo_apellido: 'Capera', correo: 'carmendiaz@sgturnos.com' },
  { id: 73205080, primer_nombre: 'Antonio', segundo_nombre: 'Jose', primer_apellido: 'Ortega', segundo_apellido: 'Finch', correo: 'antonioortega@sgturnos.com' },
  { id: 77788899, primer_nombre: 'Ricardo', segundo_nombre: 'Hasam', primer_apellido: 'Peña', segundo_apellido: 'Gareca', correo: 'ricardopena@sgturnos.com' },
  { id: 80101476, primer_nombre: 'Edisson', segundo_nombre: 'Andrés', primer_apellido: 'Taborda', segundo_apellido: 'Reyes', correo: 'edissontaborda@sgturnos.com' },
  { id: 80901020, primer_nombre: 'Silvia', segundo_nombre: 'Maria', primer_apellido: 'Rios', segundo_apellido: 'Patarroyo', correo: 'silviarios@sgturnos.com' },
  { id: 82012513, primer_nombre: 'Natalia', segundo_nombre: 'Nikol', primer_apellido: 'Flores', segundo_apellido: 'Catalan', correo: 'nataliaflores@sgturnos.com' },
  { id: 83147098, primer_nombre: 'Roberto', segundo_nombre: 'Carlos', primer_apellido: 'Silva', segundo_apellido: 'Clark', correo: 'robertosilva@sgturnos.com' },
  { id: 87654321, primer_nombre: 'Maria', segundo_nombre: null, primer_apellido: 'Lopez', segundo_apellido: null, correo: 'marialopez@sgturnos.com' },
  { id: 95462288, primer_nombre: 'Susana', segundo_nombre: 'cintia', primer_apellido: 'Ruiz', segundo_apellido: 'Cruz', correo: 'susanaruiz@sgturnos.com' },
  { id: 95957217, primer_nombre: 'Sergio', segundo_nombre: 'Andres', primer_apellido: 'Reyes', segundo_apellido: 'Segura', correo: 'sergioreyes@sgturnos.com' },
  { id: 99001122, primer_nombre: 'Raul', segundo_nombre: 'Antonio', primer_apellido: 'Medina', segundo_apellido: 'Gutierrez', correo: 'raulmedina@sgturnos.com' },
  { id: 99887766, primer_nombre: 'Ana', segundo_nombre: 'Gomez', primer_apellido: null, segundo_apellido: null, correo: 'anagomez@sgturnos.com' },
  { id: 99900011, primer_nombre: 'Esteban', segundo_nombre: 'Pablo', primer_apellido: 'Salinas', segundo_apellido: 'Morgan', correo: 'estebansalinas@sgturnos.com' },
  { id: 123456123, primer_nombre: 'kenshin', segundo_nombre: 'goku', primer_apellido: 'kido', segundo_apellido: 'himura', correo: 'kenshinkido@sgturnos.com' },
  { id: 1090807123, primer_nombre: 'Leonardo', segundo_nombre: 'Ramiro', primer_apellido: 'Dicaprio', segundo_apellido: 'Sosavita', correo: 'leonardodicaprio@sgturnos.com' },
  { id: 1101101101, primer_nombre: 'Yuliy', segundo_nombre: 'Paola', primer_apellido: 'Daza', segundo_apellido: 'Oviedo', correo: 'yuliydaza@sgturnos.com' },
  { id: 1101246975, primer_nombre: 'Ramon', segundo_nombre: 'Federico', primer_apellido: 'Jirafales', segundo_apellido: 'Barriga', correo: 'ramonjirafales@sgturnos.com' },
  { id: 1102102101, primer_nombre: 'Melissa', segundo_nombre: 'Andrea', primer_apellido: 'Solano', segundo_apellido: 'Patiño', correo: 'melissasolano@sgturnos.com' },
  { id: 1103103101, primer_nombre: 'Angelica', segundo_nombre: 'Milena', primer_apellido: 'Prada', segundo_apellido: 'Cañón', correo: 'angelicaprada@sgturnos.com' },
  { id: 1104104101, primer_nombre: 'Jesús', segundo_nombre: 'Daniel', primer_apellido: 'Beltrán', segundo_apellido: 'Rodríguez', correo: 'jesusbeltran@sgturnos.com' },
  { id: 1104774847, primer_nombre: 'Leydi', segundo_nombre: 'Cecilia', primer_apellido: 'Godoy', segundo_apellido: 'Ortiz', correo: 'leydigodoy@sgturnos.com' },
  { id: 1105105104, primer_nombre: 'Carlos', segundo_nombre: 'Andrés', primer_apellido: 'Rodríguez', segundo_apellido: 'Ochoa', correo: 'carlosrodriguez@sgturnos.com' },
  { id: 1107107107, primer_nombre: 'Jenny', segundo_nombre: 'Andrea', primer_apellido: 'Martinez', segundo_apellido: 'Heredia', correo: 'jennymartinez@sgturnos.com' },
  { id: 1108108104, primer_nombre: 'María', segundo_nombre: 'Camila', primer_apellido: 'Barajas', segundo_apellido: 'López', correo: 'mariabarajas@sgturnos.com' },
  { id: 1109109101, primer_nombre: 'Armando', segundo_nombre: 'Stiven', primer_apellido: 'Silva', segundo_apellido: 'Rodríguez', correo: 'armandosilva@sgturnos.com' },
  { id: 1110101110, primer_nombre: 'Mónica', segundo_nombre: 'Patricia', primer_apellido: 'Pinilla', segundo_apellido: 'Castro', correo: 'monicapinilla@sgturnos.com' },
  { id: 1110110111, primer_nombre: 'Camila', segundo_nombre: 'Andrea', primer_apellido: 'Vergara', segundo_apellido: 'Caro', correo: 'camilavergara@sgturnos.com' },
  { id: 1110110112, primer_nombre: 'Andrés', segundo_nombre: 'Felipe', primer_apellido: 'Castro', segundo_apellido: 'Polo', correo: 'andrescastro@sgturnos.com' },
  { id: 1110110113, primer_nombre: 'Julia', segundo_nombre: 'Fernanda', primer_apellido: 'Araujo', segundo_apellido: 'Henao', correo: 'juliaaraujo@sgturnos.com' },
  { id: 1110110114, primer_nombre: 'Juana', segundo_nombre: 'Carolina', primer_apellido: 'López', segundo_apellido: 'Montes', correo: 'juanalopez@sgturnos.com' },
  { id: 1110110115, primer_nombre: 'Daniela', segundo_nombre: 'Carolina', primer_apellido: 'Carvajal', segundo_apellido: 'Rio', correo: 'danielacarvajal@sgturnos.com' },
  { id: 1110110116, primer_nombre: 'Verónica', segundo_nombre: 'Sofia', primer_apellido: 'Cantor', segundo_apellido: 'Jiménez', correo: 'veronicacantor@sgturnos.com' },
  { id: 1110110117, primer_nombre: 'Carla', segundo_nombre: 'Antonia', primer_apellido: 'Muñoz', segundo_apellido: 'Álvarez', correo: 'carlamunoz@sgturnos.com' },
  { id: 1110110118, primer_nombre: 'Patricia', segundo_nombre: null, primer_apellido: 'Paternina', segundo_apellido: null, correo: 'patriciapaternina@sgturnos.com' },
  { id: 1110110142, primer_nombre: 'Yajaira', segundo_nombre: 'Paola', primer_apellido: 'Rangel', segundo_apellido: 'Roa', correo: 'yajairarangel@sgturnos.com' },
  { id: 1434389742, primer_nombre: 'aioria', segundo_nombre: 'de', primer_apellido: 'leo', segundo_apellido: 'kido', correo: 'aioriadeleo@sgturnos.com' },
  { id: 6546341122, primer_nombre: 'Coni', segundo_nombre: 'luz', primer_apellido: 'Camelo', segundo_apellido: 'Frias', correo: 'conicamelo@sgturnos.com' },
  { id: 9686711199, primer_nombre: 'miranda', segundo_nombre: 'catrina', primer_apellido: 'fula', segundo_apellido: 'cortez', correo: 'mirandafula@sgturnos.com' },
  { id: 123123456321, primer_nombre: 'saga', segundo_nombre: 'de', primer_apellido: 'geminis', segundo_apellido: 'kido', correo: 'sagageminis@sgturnos.com' }
];

function sqlEscape(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

const lines = [];
lines.push('-- Seed generado automáticamente: usuarios_import.sql');
lines.push('-- Contraseñas: primer_apellido + "123" (bcrypt hashes)');
lines.push('START TRANSACTION;');

for (const u of users) {
  const apellido = u.primer_apellido || '';
  const plain = apellido + '123';
  const hash = bcrypt.hashSync(plain, saltRounds);
  const telefono = null;
  const activo = 1;
  const creado = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const actualizado = creado;

  const cols = ['id','empresa_id','correo','primer_nombre','segundo_nombre','primer_apellido','segundo_apellido','contrasena','telefono','activo','creado_en','actualizado_en'];
  const vals = [
    u.id,
    empresaId,
    u.correo.toLowerCase(),
    u.primer_nombre,
    u.segundo_nombre,
    u.primer_apellido,
    u.segundo_apellido,
    hash,
    telefono,
    activo,
    creado,
    actualizado
  ].map(sqlEscape);

  lines.push(`INSERT INTO usuarios (${cols.join(',')}) VALUES (${vals.join(',')});`);
}

lines.push('COMMIT;');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log('Wrote', outPath);
