const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const filePath = path.resolve(__dirname, '..', 'seeds', 'usuarios_import.sql');
const outPath = path.resolve(__dirname, '..', 'seeds', 'usuarios_import.updated.sql');
const updatesOut = path.resolve(__dirname, '..', 'seeds', 'usuarios_update_passwords.sql');

if (!fs.existsSync(filePath)) {
  console.error('Input file not found:', filePath);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const insertRegex = /INSERT INTO usuarios \([^\)]+\) VALUES \(([^)]+)\);/gmi;
let match;
let out = content;
const updates = [];

while ((match = insertRegex.exec(content)) !== null) {
  const values = match[1];
  // split by comma but keep quoted strings
  const parts = values.match(/'(?:[^'\\]|\\.)*'|NULL|[^,]+/g).map(s => s.trim());
  // columns order in this dump: id,empresa_id,correo,primer_nombre,segundo_nombre,primer_apellido,segundo_apellido,contrasena,telefono,activo,creado_en,actualizado_en
  const id = parts[0].replace(/^'/, '').replace(/'$/, '');
  const primer_apellido_raw = parts[5].replace(/^'/, '').replace(/'$/, '');
  const existingHash = parts[7].replace(/^'/, '').replace(/'$/, '');

  const plain = (String(primer_apellido_raw).trim().toLowerCase() || '') + '123';
  const newHash = bcrypt.hashSync(plain, 12);
  const matches = bcrypt.compareSync(plain, existingHash);
  if (!matches) {
    // replace only this hash occurrence in the output (first occurrence of existingHash inside the matched INSERT)
    const escapedExisting = existingHash.replace(/[$()*+.?[\\\]^{}|]/g, '\\$&');
    out = out.replace(new RegExp(escapedExisting), newHash);
    updates.push(`UPDATE usuarios SET contrasena = '${newHash}' WHERE id = ${id};`);
    console.log(`Updated id=${id} (${primer_apellido_raw})`);
  }
}

fs.writeFileSync(outPath, out, 'utf8');
fs.writeFileSync(updatesOut, updates.join('\n'), 'utf8');

console.log('Done. Wrote updated SQL to', outPath);
console.log('Wrote per-user UPDATEs to', updatesOut);
