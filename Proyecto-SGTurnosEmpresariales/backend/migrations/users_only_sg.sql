-- users_only_sg.sql
-- Extracted from sgturnos_usuario.sql — contains only the `usuario` table schema and data
-- Domain replacements: @paliacare.com / @palicare.com -> @sgturnos.com
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `Id_usuario` bigint(20) NOT NULL,
  `primer_nombre` varchar(255) DEFAULT NULL,
  `segundo_nombre` varchar(255) DEFAULT NULL,
  `primer_apellido` varchar(255) DEFAULT NULL,
  `segundo_apellido` varchar(255) DEFAULT NULL,
  `Id_rol` varchar(20) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `activo` bit(1) DEFAULT NULL,
  `desactivado_por` bigint(20) DEFAULT NULL,
  `fecha_desactivacion` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `usuario` (`Id_usuario`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `Id_rol`, `correo`, `contrasena`, `activo`, `desactivado_por`, `fecha_desactivacion`) VALUES
(11122, 'Veronica', 'Luciana', 'Lara', 'Carranza', 'ter04', 'veeronicalara@sgturnos.com', '$2a$10$IHM1AjyuK1hUiWk2q5w.IeSEQwNFXZEDUsBiMOYMYPyljSzZJeV4O', b'1', NULL, NULL),
(10203040, 'Rosa', 'Magnolia', 'Jimenez', 'Tafur', 'aux01', 'rosajimenez@sgturnos.com', '$2a$10$YAfJTQYrMA7fgq9cgLDHzuEJOUYYuGvuqjB6e2ftjq2lDKn8Yclva', b'1', NULL, NULL),
(10293847, 'Oscar', 'Santiago', 'Campos', 'Ovalle', 'enf02', 'oscarcampos@sgturnos.com', '$2a$10$Y3GPZabXmyCJLLkqd983I.mL8uo1bPPhfOxt0ReIJXlYF3PB0/Agy', b'1', NULL, NULL),
(10439581, 'Beatriz', 'Ana', 'Mendoza', 'Trump', 'aux01', 'beatrizmendoza@sgturnos.com', '$2a$10$kRJI55eFNMGsS.ag4rI6uOKLXt7F/oacvh4Aw4etQGN1suhxNF5YW', b'1', NULL, NULL),
(12233445, 'Victor', 'Pablo', 'Guerrero', 'Libano', 'aux01', 'victorguerrero@sgturnos.com', '$2a$10$3Da9r4DxVgTd/t1US2EXj.EF0aPmLChw0vxn4hYBHZ8cYVJ8JGv9C', b'1', NULL, NULL),
(13579246, 'Pedro', 'camilo', 'Sanchez', 'tolosa', 'aux01', 'pedrosanchez@sgturnos.com', '$2a$10$YD.edb1arvvEjZ8O.ApKCegPsYShbwtmPUeSiCEsEQMNvl9P44MYW', b'1', NULL, NULL),
(14142135, 'Isabel', 'Alejandra', 'Muñoz', 'Aguilar', 'aux01', 'isabelmunoz@sgturnos.com', '$2a$10$5PxOIdz7asNl9W41njt7Cema0XsOS3.XBSErKUTfG0ymWtPIFkdfC', b'1', NULL, NULL),
(16180339, 'Miguel', 'Camilo', 'Ruiz', 'Treller', 'aux01', 'miguelruiz@sgturnos.com', '$2a$10$aiITjeKihgUKdCavsXFKR.HC7K.je/mwCpYz9roPiN9ZayOFYD6Ye', b'1', NULL, NULL),
(20304050, 'Fernando', 'Luis', 'Luna', 'Rayo', 'enf02', 'fernandoluna@sgturnos.com', '$2a$10$dWhc/c9LQDFm7a1MnUoGgu87/ww5hnLzkNchluKKwpNWTFnz3JPIG', b'1', NULL, NULL),
(24681357, 'Laura', 'andrea', 'Ramirez', 'valles', 'aux01', 'lauraramirez@sgturnos.com', '$2a$10$gGDzWVApRqcjHhD4tNxqxemRdFHhSslRiCnjT2DEdireesMrvA8C.', b'1', NULL, NULL),
(27182818, 'Elena', 'sofia', 'Vargas', 'Brush', 'aux01', 'elenavargas@sgturnos.com', '$2a$10$nfrqYk4puP7zT1sCf2KfROCGQcIlUyoDDinpIjsL5ohdrq0K7XI.W', b'1', NULL, NULL),
(29979245, 'Patricia', 'Nenitza', 'Navarro', 'Palma', 'aux01', 'patricianavarro@sgturnos.com', '$2a$10$t9K8h67b7BKi/uRHgJpfye8RPsiVIzaRAv76pTDF6fFnqnEJKf.0e', b'1', NULL, NULL),
(30405060, 'Eduardo', 'Felipe', 'Soto', 'Cardozo', 'enf02', 'eduardosoto@sgturnos.com', '$2a$10$CQSqjiWLvG9HZyxDQ.pSuetdIyVwJRRxaaLUP0LUhUata4nM3.6ay', b'1', NULL, NULL),
(31415926, 'Diego', 'David', 'Torres', 'Gomez', 'aux01', 'diegotorres@sgturnos.com', '$2a$10$CX7R9U13RgiVV26dX/mDj.RpY7yUG.7OBx.rX0OwxUKRByMIvSXl6', b'1', NULL, NULL),
(40506070, 'Alberto', 'Emiro', 'Cruz', 'Hunt', 'enf02', 'albertocruz@sgturnos.com', '$2a$10$Zu31VHcgBANrq8FxXrpYbOV2tDU0mtLMVJXs44RDyj2BkRHG1vY8e', b'1', NULL, NULL),
(44455566, 'Paula', 'Gabriela', 'Molina', 'Terrence', 'ter04', 'paulamolina@sgturnos.com', '$2a$10$nqZO3K1m2o.JLm3gQZ7uhuBt0yUwa..H/8Sx8I7tUIS16P1bIzwAi', b'1', NULL, NULL);