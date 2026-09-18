-- Sincroniza la tabla usuario_roles a partir de usuarios.Id_rol
-- Ejecutar después de `roles_alter.sql` y `usuarios_postprocess.sql`.

START TRANSACTION;

INSERT INTO usuario_roles (usuario_id, rol_id, alcance, creado_en)
SELECT u.id, r.id,
       CASE WHEN u.Id_rol = 'supad1' THEN 'global' ELSE 'empresa' END,
       NOW()
FROM usuarios u
JOIN rol r ON r.codigo = u.Id_rol
WHERE u.correo LIKE '%@sgturnos.com'
ON DUPLICATE KEY UPDATE creado_en = VALUES(creado_en);

COMMIT;

-- Verificaciones sugeridas:
-- SELECT r.codigo, COUNT(*) FROM usuario_roles ur JOIN rol r ON ur.rol_id = r.id GROUP BY r.codigo;
-- SELECT u.id, u.correo, u.empresa_id, u.Id_rol, r.nombre FROM usuarios u LEFT JOIN rol r ON r.codigo = u.Id_rol WHERE u.correo IN ('leydigodoy@sgturnos.com','edissontaborda@sgturnos.com');
