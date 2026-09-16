-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-09-2026 a las 04:32:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sgturnos_empresariales`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `departamento`
--

CREATE TABLE `departamento` (
  `Id_departamento` varchar(50) NOT NULL,
  `nombre_departamento` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `departamento`
--

INSERT INTO `departamento` (`Id_departamento`, `nombre_departamento`, `created_at`, `updated_at`) VALUES
('D003', 'Administración', '2026-08-24 18:39:37', '2026-08-24 18:39:37'),
('GENERAL', 'General', '2026-08-24 18:39:37', '2026-08-24 18:39:37'),
('HR01', 'Recursos Humanos', '2026-08-24 18:39:37', '2026-08-24 18:39:37'),
('IT01', 'Tecnologías de la Información', '2026-08-24 18:39:37', '2026-08-24 18:39:37'),
('LOG01', 'Logística', '2026-08-24 18:39:37', '2026-08-24 18:39:37'),
('OPS01', 'Operaciones', '2026-08-24 18:39:37', '2026-08-24 18:39:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `Id_rol` varchar(50) NOT NULL,
  `rol` varchar(255) NOT NULL,
  `Id_departamento` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`Id_rol`, `rol`, `Id_departamento`, `created_at`, `updated_at`) VALUES
('ademp2', 'Administrador Empresa', 'D003', '2026-08-24 18:39:37', '2026-08-24 18:39:37'),
('emple5', 'Empleado', 'GENERAL', '2026-08-24 18:39:37', '2026-08-24 18:39:37'),
('plani3', 'Planificador', 'HR01', '2026-08-24 18:39:37', '2026-08-24 18:39:37'),
('supad1', 'Super Administrador', 'D003', '2026-08-24 18:39:37', '2026-08-24 18:39:37'),
('supvi4', 'Supervisor', 'OPS01', '2026-08-24 18:39:37', '2026-08-24 18:39:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

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

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`Id_usuario`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `Id_rol`, `correo`, `contrasena`, `activo`, `desactivado_por`, `fecha_desactivacion`) VALUES
(11122, 'Veronica', 'Luciana', 'Lara', 'Carranza', 'supvi4', 'veeronicalara@sgturnos.com', '$2a$10$IHM1AjyuK1hUiWk2q5w.IeSEQwNFXZEDUsBiMOYMYPyljSzZJeV4O', b'1', NULL, NULL),
(10203040, 'Rosa', 'Magnolia', 'Jimenez', 'Tafur', 'supad1', 'rosajimenez@sgturnos.com', '$2a$10$YAfJTQYrMA7fgq9cgLDHzuEJOUYYuGvuqjB6e2ftjq2lDKn8Yclva', b'1', NULL, NULL),
(10293847, 'Oscar', 'Santiago', 'Campos', 'Ovalle', 'plani3', 'oscarcampos@sgturnos.com', '$2a$10$Y3GPZabXmyCJLLkqd983I.mL8uo1bPPhfOxt0ReIJXlYF3PB0/Agy', b'1', NULL, NULL),
(10439581, 'Beatriz', 'Ana', 'Mendoza', 'Trump', 'plani3', 'beatrizmendoza@sgturnos.com', '$2a$10$kRJI55eFNMGsS.ag4rI6uOKLXt7F/oacvh4Aw4etQGN1suhxNF5YW', b'1', NULL, NULL),
(12233445, 'Victor', 'Pablo', 'Guerrero', 'Libano', 'ademp2', 'victorguerrero@sgturnos.com', '$2a$10$3Da9r4DxVgTd/t1US2EXj.EF0aPmLChw0vxn4hYBHZ8cYVJ8JGv9C', b'1', NULL, NULL),
(13579246, 'Pedro', 'camilo', 'Sanchez', 'tolosa', 'emple5', 'pedrosanchez@sgturnos.com', '$2a$10$YD.edb1arvvEjZ8O.ApKCegPsYShbwtmPUeSiCEsEQMNvl9P44MYW', b'1', NULL, NULL),
(14142135, 'Isabel', 'Alejandra', 'Muñoz', 'Aguilar', 'emple5', 'isabelmunoz@sgturnos.com', '$2a$10$5PxOIdz7asNl9W41njt7Cema0XsOS3.XBSErKUTfG0ymWtPIFkdfC', b'1', NULL, NULL),
(16180339, 'Miguel', 'Camilo', 'Ruiz', 'Treller', 'emple5', 'miguelruiz@sgturnos.com', '$2a$10$aiITjeKihgUKdCavsXFKR.HC7K.je/mwCpYz9roPiN9ZayOFYD6Ye', b'1', NULL, NULL),
(20304050, 'Fernando', 'Luis', 'Luna', 'Rayo', 'emple5', 'fernandoluna@sgturnos.com', '$2a$10$dWhc/c9LQDFm7a1MnUoGgu87/ww5hnLzkNchluKKwpNWTFnz3JPIG', b'1', NULL, NULL),
(24681357, 'Laura', 'andrea', 'Ramirez', 'valles', 'emple5', 'lauraramirez@sgturnos.com', '$2a$10$gGDzWVApRqcjHhD4tNxqxemRdFHhSslRiCnjT2DEdireesMrvA8C.', b'1', NULL, NULL),
(27182818, 'Elena', 'sofia', 'Vargas', 'Brush', 'emple5', 'elenavargas@sgturnos.com', '$2a$10$nfrqYk4puP7zT1sCf2KfROCGQcIlUyoDDinpIjsL5ohdrq0K7XI.W', b'1', NULL, NULL),
(29979245, 'Patricia', 'Nenitza', 'Navarro', 'Palma', 'emple5', 'patricianavarro@sgturnos.com', '$2a$10$t9K8h67b7BKi/uRHgJpfye8RPsiVIzaRAv76pTDF6fFnqnEJKf.0e', b'1', NULL, NULL),
(30405060, 'Eduardo', 'Felipe', 'Soto', 'Cardozo', 'emple5', 'eduardosoto@sgturnos.com', '$2a$10$CQSqjiWLvG9HZyxDQ.pSuetdIyVwJRRxaaLUP0LUhUata4nM3.6ay', b'1', NULL, NULL),
(31415926, 'Diego', 'David', 'Torres', 'Gomez', 'emple5', 'diegotorres@sgturnos.com', '$2a$10$CX7R9U13RgiVV26dX/mDj.RpY7yUG.7OBx.rX0OwxUKRByMIvSXl6', b'1', NULL, NULL),
(40506070, 'Alberto', 'Emiro', 'Cruz', 'Hunt', 'emple5', 'albertocruz@sgturnos.com', '$2a$10$Zu31VHcgBANrq8FxXrpYbOV2tDU0mtLMVJXs44RDyj2BkRHG1vY8e', b'1', NULL, NULL),
(44455566, 'Paula', 'Gabriela', 'Molina', 'Terrence', 'supvi4', 'paulamolina@sgturnos.com', '$2a$10$nqZO3K1m2o.JLm3gQZ7uhuBt0yUwa..H/8Sx8I7tUIS16P1bIzwAi', b'1', NULL, NULL),
(48273377, 'Dante', 'jose', 'Gebel', 'Urrutia', 'ademp2', 'dantegebel@sgturnos.com', '$2a$10$cCJszHYq4bxqP4NpcVTUj.6y3HIy08ytT88xOoeKqLZ2qnHeF3qE6', b'1', NULL, NULL),
(50288419, 'Teresa', 'Maria', 'Castro', 'Lopez', 'emple5', 'teresacastro@sgturnos.com', '$2a$10$NzACUW/LzgC4p9CE/6/PAeiPOH8JlqzB2iSJCLsJF07IQmQUichu6', b'1', NULL, NULL),
(55667788, 'Olga', 'Shakira', 'Espinoza', 'Castrol', 'emple5', 'olgaespinoza@sgturnos.com', '$2a$10$iUn2X7gAXow0zGxMNUiLq.8XgZ3qBV3X9EHukvJa8BAOZlPuXP4.G', b'1', NULL, NULL),
(56473829, 'Lucia', 'Daniela', 'Valdez', 'Florez', 'emple5', 'luciavaldez@sgturnos.com', '$2a$10$3mDIpyByKryCXroGt22Dr.hxYAHW81gE3f8f7JBMw4CGYi4JX8bb.', b'1', NULL, NULL),
(57721566, 'Javier', 'Francisco', 'Moreno', 'Daza', 'emple5', 'javiermoreno@sgturnos.com', '$2a$10$wfENnIV/yqAE5jdTnIM01eypOhap7iizV7nSZtlg4vLtk51ONoa7m', b'1', NULL, NULL),
(60708090, 'Monica', 'Lucia', 'Paredes', 'Camargo', 'emple5', 'monicaparedes@sgturnos.com', '$2a$10$ImuS8JAqAcd5DblvFikgI.nRV8mE21z6kxB2X1eYx6kIb8BI0ZZli', b'1', NULL, NULL),
(66677788, 'Claudia', 'Marcela', 'Quintana', 'Fajardo', 'emple5', 'claudiaquintana@sgturnos.com', '$2a$10$SQFtk0oyeyO9rPB8l91oSusFNKj4ftaIQifPN7Jx9miWLVgFcDsoS', b'1', NULL, NULL),
(66778899, 'Sofia', '', 'Hernandez', '', 'emple5', 'sofiahernandez@sgturnos.com', '$2a$10$D01M3KS5V0VZOzU1KeEixOWYHIPo1h7jk0Lc88.iJ/hHCP1eCETMq', b'1', NULL, NULL),
(69314718, 'Francisco', 'Javier', 'Romero', 'Caldas', 'emple5', 'franciscoromero@sgturnos.com', '$2a$10$DvZSsMSnaSiYrVWKfHXehOuugtlRkXWwznm94fWE2tqkQOmsEjKge', b'1', NULL, NULL),
(70809010, 'Gabriela', 'Filipa', 'Vega', 'Alarcon', 'emple5', 'gabrielavega@sgturnos.com', '$2a$10$QEHZLj/KvQNdFuQ6m4Ki2eHLVqrCd.1veEyKWbR8fVi9O18k9Bzta', b'1', NULL, NULL),
(71828182, 'Carmen', 'Isabelina', 'Diaz', 'Capera', 'emple5', 'carmendiaz@sgturnos.com', '$2a$10$s.hPW18IoIK1zPKsH9HVJuiEy6P4vcvB1wGLCcIxzMDEXtne2Ar3q', b'1', NULL, NULL),
(73205080, 'Antonio', 'Jose', 'Ortega', 'Finch', 'emple5', 'antonioortega@sgturnos.com', '$2a$10$brX45l6kCHJ/Xh7QqKIAFOxmF.4h2zg/7nmSc9YXs3HNjKko5Uqk6', b'1', NULL, NULL),
(77788899, 'Ricardo', 'Hasam', 'Peña', 'Gareca', 'emple5', 'ricardopena@sgturnos.com', '$2a$10$PsnH6RWCvtZQET4Oq/t53.03eTuvwW1N0xB5oIIebh7oU5YliEQHq', b'1', NULL, NULL),
(80101476, 'Edisson', 'Andrés', 'Taborda', 'Reyes', 'emple5', 'edissontaborda@sgturnos.com', '$2a$10$TNNqfKXw.NYc5GwJiJ5pB.k1Sdfam8Jqt95GTyLvd0DfR18HZvcV6', b'1', NULL, NULL),
(80901020, 'Silvia', 'Maria', 'Rios', 'Patarroyo', 'emple5', 'silviarios@sgturnos.com', '$2a$10$YmJ8efEggP8Hvpej5iG3c.JwuaPKUYAjEbMmsGxYqH4UBeHZmES0W', b'1', NULL, NULL),
(82012513, 'Natalia', 'Nikol', 'Flores', 'Catalan', 'emple5', 'nataliaflores@sgturnos.com', '$2a$10$7ro72rdd9DJfWcDFfvcUw.PHCtjk2ub3AIRvVaxLxQH3px1JfCGva', b'1', NULL, NULL),
(83147098, 'Roberto', 'Carlos', 'Silva', 'Clark', 'emple5', 'robertosilva@sgturnos.com', '$2a$10$s2uJYDIqq12zxnNaiVOI1.4pw.xx2zAAX5hlP.ZH9xVosoOybnbdq', b'1', NULL, NULL),
(87654321, 'Maria', '', 'Lopez', '', 'emple5', 'marialopez@sgturnos.com', '$2a$10$YYlRBL3pXwM8KxM6GN2y8O/Tpmi.vCCGu90oSjDFxnOmGV6fqWk5C', b'1', NULL, NULL),
(95462288, 'Susana', 'cintia', 'Ruiz', 'Cruz', 'emple5', 'susanaruiz@sgturnos.com', '$2a$10$WpWzNV2ulDIxfnRO0LwiGujZ.pkitwDsKYjRJSt7Gf20ULKTHazhO', b'1', NULL, NULL),
(95957217, 'Sergio', 'Andres', 'Reyes', 'Segura', 'emple5', 'sergioreyes@sgturnos.com', '$2a$10$CNxu0OYd0fzgms0Hhxiy7OINV64sPQEfWbzFswCgO1z4yto8CHdCi', b'1', NULL, NULL),
(99001122, 'Raul', 'Antonio', 'Medina', 'Gutierrez', 'emple5', 'raulmedina@sgturnos.com', '$2a$10$Ii/CaDoYxrNKpWBaQdy9WubXzhIOTU61jXOFflMInDjaXz69iFr.K', b'1', NULL, NULL),
(99887766, 'Ana', '', 'Gomez', '', 'emple5', 'anagomez@sgturnos.com', '$2a$10$7ehScPjUkObumabNAr3bCOseXXjgXJfKtvN1SgL3CI0kjrq3g6KBW', b'1', NULL, NULL),
(99900011, 'Esteban', 'Pablo', 'Salinas', 'Morgan', 'emple5', 'estebansalinas@sgturnos.com', '$2a$10$.UY4efOQR7.dFPKLE.oTnO8oQeU9Xvcd/6ts8DWG4h.afwVCX4SmS', b'1', NULL, NULL),
(123456123, 'kenshin', 'goku', 'kido', 'himura', 'emple5', 'kenshinkido@sgturnos.com', '$2a$10$6IipnATgZaFQPV0aQrYW0OAbfAMLx1LDjBoHwX9dk8QrNcJZCLkWu', b'1', NULL, NULL),
(1090807123, 'Leonardo', 'Ramiro', 'Dicaprio', 'Sosavita', 'emple5', 'leonardodicaprio@sgturnos.com', '$2a$10$MnVM3sKAkRI0yj2mWTi8xeci.zvkbD5/Y937LDJottrD/SvQR/Hwq', b'1', NULL, NULL),
(1101101101, 'Yuliy', 'Paola', 'Daza', 'Oviedo', 'emple5', 'yuliydaza@sgturnos.com', '$2a$10$kQ/V.vkCHYq..xPW5/a2feZouwN.j5K/8kzgSkDNosVUBTooeQQQC', b'1', NULL, NULL),
(1101246975, 'Ramon', 'Federico', 'Jirafales', 'Barriga', 'emple5', 'ramonjirafales@sgturnos.com', '$2a$10$9vt7ko0cSPABvQZ1.Om3Tekmqj37FWjFZ5cQtXPYJFeVzGQuTBWpa', b'1', NULL, NULL),
(1102102101, 'Melissa', 'Andrea', 'Solano', 'Patiño', 'emple5', 'melissasolano@sgturnos.com', '$2a$10$dr/bUSh2EYUeeNbYqNtQuOHD.YXwsJofP5e2Q7GEHONKSUcW8qsVq', b'1', NULL, NULL),
(1103103101, 'Angelica', 'Milena', 'Prada', 'Cañón', 'emple5', 'angelicaprada@sgturnos.com', '$2a$10$21A6rXqQFXZ9gFYX.Wqs9uFbV847yBlRDF0acrOh75Ayh7PhA7pEe', b'1', NULL, NULL),
(1104104101, 'Jesús', 'Daniel', 'Beltrán', 'Rodríguez', 'emple5', 'jesusbeltran@sgturnos.com', '$2a$10$NVlLIr1vOfQqebqW7aZmC.SHOGsUYhUw.yBWaWmVeaxPIyFqALeku', b'1', NULL, NULL),
(1104774847, 'Leydi', 'Cecilia', 'Godoy', 'Ortiz', 'emple5', 'leydigodoy@sgturnos.com', '$2a$10$D3Yu77JIOqBCG6uMz9fdOubRZwAbLSQR0oRSIyeA6t7Jipbqnmxky', b'1', NULL, NULL),
(1105105104, 'Carlos', 'Andrés', 'Rodríguez', 'Ochoa', 'emple5', 'carlosrodriguez@sgturnos.com', '$2a$10$aGwJ5dRA.yJVEESep6UJQuJ2idQemauoDK5ZQaZirJZyQXqWYaY/2', b'1', NULL, NULL),
(1107107107, 'Jenny', 'Andrea', 'Martinez', 'Heredia', 'emple5', 'jennymartinez@sgturnos.com', '$2a$10$ItlJPq9yAWRaQVti1z55re/rJQT60oVVRHwL4dQTpXl4W8lt44wYO', b'1', NULL, NULL),
(1108108104, 'María', 'Camila', 'Barajas', 'López', 'emple5', 'mariabarajas@sgturnos.com', '$2a$10$lc1T7Qt/tFr0d4wuB2pREOyP4.h7U/wzgaXIKs586Nkym9h6DL/S2', b'1', NULL, NULL),
(1109109101, 'Armando', 'Stiven', 'Silva', 'Rodríguez', 'emple5', 'armandosilva@sgturnos.com', '$2a$10$fM9JpEYEV5v4moKFowlgZu9w1xT26/S6CYhgbuaZ4mE9kP/CrQ0ia', b'1', NULL, NULL),
(1110101110, 'Mónica', 'Patricia', 'Pinilla', 'Castro', 'emple5', 'monicapinilla@sgturnos.com', '$2a$10$YAHt9viHu9Dowld6r0qHye6utBzgYd7z4RkVHIj506DYZNF2btjye', b'1', NULL, NULL),
(1110110111, 'Camila', 'Andrea', 'Vergara', 'Caro', 'emple5', 'camilavergara@sgturnos.com', '$2a$10$7P3iAyrE1d4gwuchyCbyZ.3d279vUqzN43KpqpNA3hfQyAKea86iq', b'1', NULL, NULL),
(1110110112, 'Andrés', 'Felipe', 'Castro', 'Polo', 'emple5', 'andrescastro@sgturnos.com', '$2a$10$yKym7PQ5V3g8Yo3xv8mc8uew5y1BugU3otGujoocLNGtqzMm1IsTi', b'1', NULL, NULL),
(1110110113, 'Julia', 'Fernanda', 'Araujo', 'Henao', 'emple5', 'juliaaraujo@sgturnos.com', '$2a$10$UZG/0uk/oOjv4Ch.lsJfbOr0ucygCFr9v8M74ezKO6DOsHLBDGyKm', b'1', NULL, NULL),
(1110110114, 'Juana', 'Carolina', 'López', 'Montes', 'emple5', 'juanalopez@sgturnos.com', '$2a$10$wwnvmlh6pg5EzKGXE6uEFub5MLousNCWjHAQ74b2eO1DVYhS9stP6', b'1', NULL, NULL),
(1110110115, 'Daniela', 'Carolina', 'Carvajal', 'Rio', 'emple5', 'danielacarvajal@sgturnos.com', '$2a$10$hJP/KUXFzjoukzcS114lP.6WcwZpHlnw.2pPMUa67RNTAXTAxUzuu', b'1', NULL, NULL),
(1110110116, 'Verónica', 'Sofia', 'Cantor', 'Jiménez', 'emple5', 'veronicacantor@sgturnos.com', '$2a$10$crhPEt/e3cIrKyH4dm4FGu4lXFP4pcJrwRtm3sAbsKJc6qr71x.Kq', b'1', NULL, NULL),
(1110110117, 'Carla', 'Antonia', 'Muñoz', 'Álvarez', 'emple5', 'carlamunoz@sgturnos.com', '$2a$10$BjW0NXOa6i5oR0R7s8/hNe7Pf97knUJhixwVnbEdQynhSHk.Cn3NS', b'1', NULL, NULL),
(1110110118, 'Patricia', NULL, 'Paternina', NULL, 'emple5', 'patriciapaternina@sgturnos.com', '$2a$10$u/aKSP6Mx3hroVnsi1Con.OxFjlFwcd./oXbAEl1p.KMWaFxou/jq', b'1', NULL, NULL),
(1110110142, 'Yajaira', 'Paola', 'Rangel', 'Roa', 'emple5', 'yajairarangel@sgturnos.com', '$2a$10$dX5yc0PZGKyLlg1pllcV2ujmEIuJOTErIGmH0c92XBqPJnj/OEVb6', b'1', NULL, NULL),
(1434389742, 'aioria', 'de', 'leo', 'kido', 'emple5', 'aioriadeleo@sgturnos.com', '$2a$10$/IG9ZP8dd07SBlmG51fyiuBmsixQlc62mKQSlO5V7/nq302zDmtoS', b'1', NULL, NULL),
(6546341122, 'Coni', 'luz', 'Camelo', 'Frias', 'emple5', 'conicamelo@sgturnos.com', '$2a$10$iv735ZIxOIGiL86ozIJ0TuN/XmHKToMytAKI03pnM5/nfGOwcxH5m', b'1', NULL, NULL),
(9686711199, 'miranda', 'catrina', 'fula', 'cortez', 'emple5', 'mirandafula@sgturnos.com', '$2a$10$80SSuls.kHWtfcuKHx41guP69.R.uioTETw9Vkxtpd7Q5pfe3Un2O', b'1', NULL, NULL),
(123123456321, 'saga', 'de', 'geminis', 'kido', 'emple5', 'sagageminis@sgturnos.com', '$2a$10$ybtHsLQJkvfSj8kLCzH2g.fAh7lDaw0SMgMimBcAiw9T10qRodM5.', b'1', NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `departamento`
--
ALTER TABLE `departamento`
  ADD PRIMARY KEY (`Id_departamento`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`Id_rol`),
  ADD KEY `idx_rol_departamento` (`Id_departamento`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`Id_usuario`),
  ADD KEY `fk_usuario_rol` (`Id_rol`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `rol`
--
ALTER TABLE `rol`
  ADD CONSTRAINT `fk_rol_departamento` FOREIGN KEY (`Id_departamento`) REFERENCES `departamento` (`Id_departamento`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
