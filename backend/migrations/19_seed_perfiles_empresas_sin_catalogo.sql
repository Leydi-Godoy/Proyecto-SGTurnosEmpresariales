-- Completa el catalogo existente en empresas que aun no tienen perfiles.
-- No crea tablas nuevas ni modifica perfiles ya asignados.
INSERT INTO especialidades (empresa_id, codigo, nombre, descripcion)
SELECT empresa.id, catalogo.codigo, catalogo.nombre, catalogo.descripcion
FROM empresas empresa
CROSS JOIN (
  SELECT codigo, MIN(nombre) AS nombre, MIN(descripcion) AS descripcion
  FROM especialidades
  GROUP BY codigo
) catalogo
WHERE NOT EXISTS (
  SELECT 1
  FROM especialidades existente
  WHERE existente.empresa_id = empresa.id
);
