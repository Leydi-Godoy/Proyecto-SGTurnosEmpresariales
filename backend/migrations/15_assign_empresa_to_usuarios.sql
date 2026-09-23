-- Verificar usuarios sin empresa_id
SELECT id, correo, empresa_id FROM usuarios WHERE empresa_id IS NULL LIMIT 10;

-- Asignar empresa_id = 3 a todos los usuarios sin empresa
UPDATE usuarios SET empresa_id = 3 WHERE empresa_id IS NULL;

-- Verificar que se actualizó
SELECT id, correo, empresa_id FROM usuarios WHERE correo = 'olgaespinoza@sgturnos.com';
