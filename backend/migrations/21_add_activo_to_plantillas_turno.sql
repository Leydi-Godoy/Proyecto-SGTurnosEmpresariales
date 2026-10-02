ALTER TABLE plantillas_turno
  ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1 AFTER es_nocturno;