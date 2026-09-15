-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-09-2026 a las 06:24:56
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
-- Base de datos: `sgturnos_empresas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aprobaciones`
--

CREATE TABLE `aprobaciones` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `solicitud_id` bigint(20) UNSIGNED NOT NULL,
  `aprobador_id` bigint(20) UNSIGNED DEFAULT NULL,
  `decision` varchar(16) NOT NULL,
  `comentario` text DEFAULT NULL,
  `decidido_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignaciones_turno`
--

CREATE TABLE `asignaciones_turno` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `instancia_turno_id` bigint(20) UNSIGNED NOT NULL,
  `empleado_id` bigint(20) UNSIGNED NOT NULL,
  `asignado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `asignado_por` bigint(20) UNSIGNED DEFAULT NULL,
  `estado` varchar(32) NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disponibilidad`
--

CREATE TABLE `disponibilidad` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empleado_id` bigint(20) UNSIGNED NOT NULL,
  `dia_semana` tinyint(3) UNSIGNED NOT NULL,
  `desde_hora` time NOT NULL,
  `hasta_hora` time NOT NULL,
  `nota` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos_solicitud`
--

CREATE TABLE `documentos_solicitud` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `solicitud_id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `nombre_archivo` varchar(512) NOT NULL,
  `url_almacenamiento` varchar(2048) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED DEFAULT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `codigo_empleado` varchar(64) DEFAULT NULL,
  `especialidad_id` bigint(20) UNSIGNED DEFAULT NULL,
  `equipo_id` bigint(20) UNSIGNED DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `estado` varchar(32) NOT NULL DEFAULT 'activo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`id`, `usuario_id`, `empresa_id`, `codigo_empleado`, `especialidad_id`, `equipo_id`, `fecha_ingreso`, `estado`, `creado_en`) VALUES
(1, 69314718, 1, 'EMP1_69314718', 2, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(2, 70809010, 2, 'EMP2_70809010', 44, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(3, 71828182, 3, 'EMP3_71828182', 53, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(4, 73205080, 4, 'EMP4_73205080', 38, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(5, 77788899, 5, 'EMP5_77788899', 63, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(6, 80101476, 6, 'EMP6_80101476', 72, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(7, 80901020, 7, 'EMP7_80901020', 33, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(8, 82012513, 8, 'EMP8_82012513', 82, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(9, 83147098, 1, 'EMP1_83147098', 2, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(10, 87654321, 2, 'EMP2_87654321', 44, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(11, 95462288, 3, 'EMP3_95462288', 53, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(12, 95957217, 4, 'EMP4_95957217', 38, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(13, 99001122, 5, 'EMP5_99001122', 63, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(14, 99887766, 6, 'EMP6_99887766', 72, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(15, 99900011, 7, 'EMP7_99900011', 33, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(16, 123456123, 8, 'EMP8_123456123', 82, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(17, 1090807123, 1, 'EMP1_1090807123', 2, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(18, 1101101101, 2, 'EMP2_1101101101', 44, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(19, 1101246975, 3, 'EMP3_1101246975', 53, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(20, 1102102101, 4, 'EMP4_1102102101', 38, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(21, 1103103101, 5, 'EMP5_1103103101', 63, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(22, 1104104101, 6, 'EMP6_1104104101', 72, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(23, 1104774847, 7, 'EMP7_1104774847', 33, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(24, 1105105104, 8, 'EMP8_1105105104', 82, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(25, 1107107107, 1, 'EMP1_1107107107', 2, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(26, 1108108104, 2, 'EMP2_1108108104', 44, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(27, 1109109101, 3, 'EMP3_1109109101', 53, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(28, 1110101110, 4, 'EMP4_1110101110', 38, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(29, 1110110111, 5, 'EMP5_1110110111', 63, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(30, 1110110112, 6, 'EMP6_1110110112', 72, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(31, 1110110113, 7, 'EMP7_1110110113', 33, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(32, 1110110114, 8, 'EMP8_1110110114', 82, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(33, 1110110115, 1, 'EMP1_1110110115', 2, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(34, 1110110116, 2, 'EMP2_1110110116', 44, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(35, 1110110117, 3, 'EMP3_1110110117', 53, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(36, 1110110118, 4, 'EMP4_1110110118', 38, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(37, 1110110142, 5, 'EMP5_1110110142', 63, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(38, 1434389742, 6, 'EMP6_1434389742', 72, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(39, 6546341122, 7, 'EMP7_6546341122', 33, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(40, 9686711199, 8, 'EMP8_9686711199', 82, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(41, 123123456321, 1, 'EMP1_123123456321', 2, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `zona_horaria` varchar(64) DEFAULT 'UTC',
  `plan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `nombre`, `zona_horaria`, `plan_id`, `creado_en`, `actualizado_en`) VALUES
(1, 'Empresa Demo 1', 'America/Bogota', 1, '2026-09-14 21:20:32', '2026-09-14 21:20:32'),
(2, 'Comercial Norte', 'America/Chicago', 1, '2026-09-14 21:20:32', '2026-09-14 21:20:32'),
(3, 'Tienda Local', 'America/Argentina/Buenos_Aires', 1, '2026-09-14 21:20:32', '2026-09-14 21:20:32'),
(4, 'Servicios Vecinos', 'America/Bogota', 1, '2026-09-14 21:20:32', '2026-09-14 21:20:32'),
(5, 'Oficina Pyme', 'America/New_York', 1, '2026-09-14 21:20:32', '2026-09-14 21:20:32'),
(6, 'Solutions Medio', 'Europe/Madrid', 2, '2026-09-14 21:20:32', '2026-09-14 21:20:32'),
(7, 'Operaciones Sur', 'America/Santiago', 2, '2026-09-14 21:20:32', '2026-09-14 21:20:32'),
(8, 'Corporativo Premium', 'Europe/London', 3, '2026-09-14 21:20:32', '2026-09-14 21:20:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialidades`
--

CREATE TABLE `especialidades` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(128) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `especialidades`
--

INSERT INTO `especialidades` (`id`, `empresa_id`, `codigo`, `nombre`, `descripcion`, `creado_en`) VALUES
(2, 1, 'medicina_general', 'Medicina General', 'Atención primaria y consulta general', '2026-09-14 23:35:10'),
(33, 7, 'psicología', 'Psicología', 'Atención psicológica y terapias', '2026-09-14 23:46:07'),
(38, 4, 'vigilancia', 'Vigilancia', 'Personal de vigilancia y seguridad por turnos', '2026-09-14 23:46:07'),
(44, 2, 'call_center', 'Call Center', 'Atención telefónica 24/7, turnos rotativos', '2026-09-14 23:46:07'),
(53, 3, 'recepción', 'Recepción', 'Atención en recepción y control de visitas (turnos)', '2026-09-14 23:46:07'),
(63, 5, 'limpieza', 'Limpieza', 'Servicios de limpieza por turnos', '2026-09-14 23:46:07'),
(72, 6, 'mantenimiento', 'Mantenimiento', 'Tareas de mantenimiento preventivo y correctivo', '2026-09-14 23:46:07'),
(82, 8, 'monitoreo_cctv', 'Monitoreo CCTV', 'Vigilancia por cámaras y monitoreo remoto', '2026-09-14 23:46:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instancias_turno`
--

CREATE TABLE `instancias_turno` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plantilla_id` bigint(20) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `inicio_fecha_hora` datetime NOT NULL,
  `fin_fecha_hora` datetime NOT NULL,
  `sede_id` bigint(20) UNSIGNED DEFAULT NULL,
  `creado_por` bigint(20) UNSIGNED DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED DEFAULT NULL,
  `usuario_id` bigint(20) UNSIGNED DEFAULT NULL,
  `canal` varchar(16) NOT NULL,
  `carga` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`carga`)),
  `enviado_en` timestamp NULL DEFAULT NULL,
  `estado_envio` varchar(32) NOT NULL DEFAULT 'pendiente',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planes`
--

CREATE TABLE `planes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(128) NOT NULL,
  `caracteristicas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`caracteristicas`)),
  `precio` decimal(12,2) NOT NULL DEFAULT 0.00,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `planes`
--

INSERT INTO `planes` (`id`, `nombre`, `caracteristicas`, `precio`, `creado_en`, `actualizado_en`) VALUES
(1, 'Básico', '{\"descripcion\": \"Prueba 30 días; soporte básico; funciones esenciales\"}', 0.00, '2026-09-14 21:15:53', '2026-09-14 21:15:53'),
(2, 'Mediano', '{\"descripcion\": \"Funciones avanzadas; reportes; soporte estándar\"}', 49.90, '2026-09-14 21:15:53', '2026-09-14 21:15:53'),
(3, 'Premium', '{\"descripcion\": \"Integraciones; SLA; soporte prioritario\"}', 149.90, '2026-09-14 21:15:53', '2026-09-14 21:15:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plantillas_turno`
--

CREATE TABLE `plantillas_turno` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `duracion_minutos` int(10) UNSIGNED NOT NULL,
  `es_nocturno` tinyint(1) NOT NULL DEFAULT 0,
  `patron_recurrencia` varchar(128) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_auditoria`
--

CREATE TABLE `registros_auditoria` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED DEFAULT NULL,
  `usuario_id` bigint(20) UNSIGNED DEFAULT NULL,
  `accion` varchar(128) NOT NULL,
  `tabla_objetivo` varchar(128) DEFAULT NULL,
  `id_objetivo` bigint(20) UNSIGNED DEFAULT NULL,
  `detalles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalles`)),
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(64) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `codigo` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `creado_en`, `codigo`) VALUES
(1, 'Super Administrador', 'Acceso total', '2026-09-14 22:04:25', 'supad1'),
(2, 'Administrador de empresa', 'Administrador de la empresa', '2026-09-14 22:04:25', 'ademp2'),
(3, 'Planificador', 'Planificador de turnos', '2026-09-14 22:04:25', 'plani3'),
(4, 'Supervisor', 'Supervisor de la empresa', '2026-09-14 22:04:25', 'supvi4'),
(5, 'Empleado', 'Empleado estándar', '2026-09-14 22:04:25', 'emple5');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sedes`
--

CREATE TABLE `sedes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `direccion` varchar(512) DEFAULT NULL,
  `zona_horaria` varchar(64) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sedes`
--

INSERT INTO `sedes` (`id`, `empresa_id`, `nombre`, `direccion`, `zona_horaria`, `creado_en`) VALUES
(1, 1, 'Sede Central - Empresa 1', 'Calle Principal 100', NULL, '2026-09-14 23:29:16'),
(2, 2, 'Sede Central - Empresa 2', 'Av. Secundaria 200', NULL, '2026-09-14 23:29:16'),
(3, 3, 'Sede Central - Empresa 3', 'Calle 3 #45', NULL, '2026-09-14 23:29:16'),
(4, 4, 'Sede Central - Empresa 4', 'Av. 4 #88', NULL, '2026-09-14 23:29:16'),
(5, 5, 'Sede Central - Empresa 5', 'Calle 5 #12', NULL, '2026-09-14 23:29:16'),
(6, 6, 'Sede Central - Empresa 6', 'Av. 6 #34', NULL, '2026-09-14 23:29:16'),
(7, 7, 'Sede Central - Empresa 7', 'Calle 7 #56', NULL, '2026-09-14 23:29:16'),
(8, 8, 'Sede Central - Empresa 8', 'Av. 8 #78', NULL, '2026-09-14 23:29:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes_novedad`
--

CREATE TABLE `solicitudes_novedad` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empleado_id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `tipo` varchar(64) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `motivo` text DEFAULT NULL,
  `estado` varchar(32) NOT NULL DEFAULT 'pendiente',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `correo` varchar(320) NOT NULL,
  `primer_nombre` varchar(128) DEFAULT NULL,
  `segundo_nombre` varchar(128) DEFAULT NULL,
  `primer_apellido` varchar(128) DEFAULT NULL,
  `segundo_apellido` varchar(128) DEFAULT NULL,
  `contrasena` char(128) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `esta_activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `id_rol` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `empresa_id`, `correo`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `contrasena`, `telefono`, `activo`, `esta_activo`, `creado_en`, `actualizado_en`, `id_rol`) VALUES
(11122, 1, 'veeronicalara@sgturnos.com', 'Veronica', 'Luciana', 'Lara', 'Carranza', '$2a$12$3RPpJKn/z.abyP/AwuUtBunJdRDY6TsWd7B5kVLllgJsdWkq9S/jO', NULL, 1, 1, '2026-09-15 00:00:07', '2026-09-15 04:15:03', 2),
(10203040, 2, 'rosajimenez@sgturnos.com', 'Rosa', 'Magnolia', 'Jimenez', 'Tafur', '$2a$12$zFAcq9jhbRexIQ5pm1UGHug3HF3WOGgMwrKSHXm1L8NUSOOdTkl2a', NULL, 1, 1, '2026-09-15 00:00:08', '2026-09-15 04:15:03', 2),
(10293847, 3, 'oscarcampos@sgturnos.com', 'Oscar', 'Santiago', 'Campos', 'Ovalle', '$2a$12$x7GU8wHBTeIssv4c686vBeYNmYzVb5i/VBSTLP3phokAjc2hAtCHy', NULL, 1, 1, '2026-09-15 00:00:08', '2026-09-15 04:15:03', 2),
(10439581, 4, 'beatrizmendoza@sgturnos.com', 'Beatriz', 'Ana', 'Mendoza', 'Trump', '$2a$12$7DWr1OjF6cLVNEcWWDAtWOKL.ix2eXIfArmEa7.5fOmBd.hg00kd6', NULL, 1, 1, '2026-09-15 00:00:09', '2026-09-15 04:15:03', 2),
(12233445, 5, 'victorguerrero@sgturnos.com', 'Victor', 'Pablo', 'Guerrero', 'Libano', '$2a$12$SXq2bEEga.I4wwWI.VH28..ZV26/2S6bA0/.jySv9ZvOaornIov7W', NULL, 1, 1, '2026-09-15 00:00:09', '2026-09-15 04:15:03', 2),
(13579246, 6, 'pedrosanchez@sgturnos.com', 'Pedro', 'camilo', 'Sanchez', 'tolosa', '$2a$12$w6TlcuEG24eoi9ot6/BgP.SzNOOMMB5h1k0Or1NYYOphGCFGDdWP6', NULL, 1, 1, '2026-09-15 00:00:10', '2026-09-15 04:15:03', 2),
(14142135, 7, 'isabelmunoz@sgturnos.com', 'Isabel', 'Alejandra', 'Muñoz', 'Aguilar', '$2a$12$/A2Be2chORYzbn2yyj5No.GBzZJMyZx7i6PD3qTPsxZ4XLqZNb9KW', NULL, 1, 1, '2026-09-15 00:00:10', '2026-09-15 04:15:03', 2),
(16180339, 8, 'miguelruiz@sgturnos.com', 'Miguel', 'Camilo', 'Ruiz', 'Treller', '$2a$12$PPjTW3KwErKxuXcuz2v7ReJrHd4LUSS43bW43G/bVRU0fMOnZrjRi', NULL, 1, 1, '2026-09-15 00:00:10', '2026-09-15 04:15:03', 2),
(20304050, 1, 'fernandoluna@sgturnos.com', 'Fernando', 'Luis', 'Luna', 'Rayo', '$2a$12$s0rq1qrMhytl9N4NsE4D9ONQ7raKK6lf6McnHgUx4zbCtZXh/bgtC', NULL, 1, 1, '2026-09-15 00:00:11', '2026-09-15 04:15:03', 4),
(24681357, 2, 'lauraramirez@sgturnos.com', 'Laura', 'andrea', 'Ramirez', 'valles', '$2a$12$/zNGkTHY5mINUkIbO.hov.kFovGftnvDiNDWO4QyBNqVRZ0brrOkS', NULL, 1, 1, '2026-09-15 00:00:12', '2026-09-15 04:15:03', 4),
(27182818, 3, 'elenavargas@sgturnos.com', 'Elena', 'sofia', 'Vargas', 'Brush', '$2a$12$tokXpHEHeenTzbS97bBcWOYaypHAAxF.TjoAotMMPUaSqvZTr7/hK', NULL, 1, 1, '2026-09-15 00:00:12', '2026-09-15 04:15:03', 4),
(29979245, 4, 'patricianavarro@sgturnos.com', 'Patricia', 'Nenitza', 'Navarro', 'Palma', '$2a$12$ZVLFNdrMG4GsN2YiJl7soOoxE3j4jeNhSLNZnC1x9fX4U0xkCCIC2', NULL, 1, 1, '2026-09-15 00:00:13', '2026-09-15 04:15:03', 4),
(30405060, 5, 'eduardosoto@sgturnos.com', 'Eduardo', 'Felipe', 'Soto', 'Cardozo', '$2a$12$xxMaAYz51BZtroHzRGPIk.TZB1MY1hLEQL0LZH82Yoci41o3vmAJy', NULL, 1, 1, '2026-09-15 00:00:13', '2026-09-15 04:15:03', 4),
(31415926, 6, 'diegotorres@sgturnos.com', 'Diego', 'David', 'Torres', 'Gomez', '$2a$12$Zg326I5I6lL4HMOKu2EUdeR0cXVH4DoQhLL8WoEA0d1O9AXnI84J6', NULL, 1, 1, '2026-09-15 00:00:13', '2026-09-15 04:15:03', 4),
(40506070, 7, 'albertocruz@sgturnos.com', 'Alberto', 'Emiro', 'Cruz', 'Hunt', '$2a$12$gVaKUEzBxhBWd8mdDvYCke/nv.dwsTQ7BTUl/xT1YGnNoQIw/LO2m', NULL, 1, 1, '2026-09-15 00:00:14', '2026-09-15 04:15:03', 4),
(44455566, 8, 'paulamolina@sgturnos.com', 'Paula', 'Gabriela', 'Molina', 'Terrence', '$2a$12$mGBYmJJ31goCZBRr8gZT2eGje3gFrg72Efn.g07kTc4EF0J9Xyske', NULL, 1, 1, '2026-09-15 00:00:14', '2026-09-15 04:15:03', 4),
(48273377, 1, 'dantegebel@sgturnos.com', 'Dante', 'jose', 'Gebel', 'Urrutia', '$2a$12$EYw/.zG7umzilkLtDGi7zuyoJ43.5meuLMU/LUTGOmDX56ok4vPDO', NULL, 1, 1, '2026-09-15 00:00:15', '2026-09-15 04:15:03', 3),
(50288419, 2, 'teresacastro@sgturnos.com', 'Teresa', 'Maria', 'Castro', 'Lopez', '$2a$12$HnzrND/.AZHVnYZe3AxbB.mmeecSO9BH3O13a3Z1h9DexTPtmWl2i', NULL, 1, 1, '2026-09-15 00:00:15', '2026-09-15 04:15:03', 3),
(55667788, 3, 'olgaespinoza@sgturnos.com', 'Olga', 'Shakira', 'Espinoza', 'Castrol', '$2a$12$QpDH.d/y4mrkjWLUvyaygONDXOmKTd.y4IlXl//Nr8lVL4LDUyGEq', NULL, 1, 1, '2026-09-15 00:00:16', '2026-09-15 04:15:03', 3),
(56473829, 4, 'luciavaldez@sgturnos.com', 'Lucia', 'Daniela', 'Valdez', 'Florez', '$2a$12$PAS0wxRLEC/a7TTg8sxCS.smAhAAvgxuTHUgHqYVI6G65h5P4tgtW', NULL, 1, 1, '2026-09-15 00:00:16', '2026-09-15 04:15:03', 3),
(57721566, 5, 'javiermoreno@sgturnos.com', 'Javier', 'Francisco', 'Moreno', 'Daza', '$2a$12$lBkZYFG7QBvN654hPmWoa.X5hBzESOS3zMWtnAU1HgLXZNglzpRZi', NULL, 1, 1, '2026-09-15 00:00:17', '2026-09-15 04:15:03', 3),
(60708090, 6, 'monicaparedes@sgturnos.com', 'Monica', 'Lucia', 'Paredes', 'Camargo', '$2a$12$MKurtsuBRcMNmj9QT3PeSeQarnxN/Db9MT0rnL4KaLD20GFO.yTxe', NULL, 1, 1, '2026-09-15 00:00:17', '2026-09-15 04:15:03', 3),
(66677788, 7, 'claudiaquintana@sgturnos.com', 'Claudia', 'Marcela', 'Quintana', 'Fajardo', '$2a$12$bUAbdL3NmDFNL.miWGDgNOb3tk.JxdelbVCj8TPyaIyeztk7AlT.6', NULL, 1, 1, '2026-09-15 00:00:17', '2026-09-15 04:15:03', 3),
(66778899, 8, 'sofiahernandez@sgturnos.com', 'Sofia', 'Hernandez', NULL, NULL, '$2a$12$Q7dKbaW5niQ722S0lpu8auyZh1jLEDIWxpy.6k8P7uBVJ0Qt.4Bw2', NULL, 1, 1, '2026-09-15 00:00:18', '2026-09-15 04:15:03', 3),
(69314718, 1, 'franciscoromero@sgturnos.com', 'Francisco', 'Javier', 'Romero', 'Caldas', '$2a$12$P9GlrDClblq4yCKY9yQTcuGvgcIIwqTM3chfeTVdJfj6uwUZ2yli6', NULL, 1, 1, '2026-09-15 00:00:18', '2026-09-15 04:15:03', 5),
(70809010, 2, 'gabrielavega@sgturnos.com', 'Gabriela', 'Filipa', 'Vega', 'Alarcon', '$2a$12$SILIVH9d5GlI5KDyw4Ws.OHRcphQDdwaywJ2BoP2GJVj6NKhhmqPi', NULL, 1, 1, '2026-09-15 00:00:19', '2026-09-15 04:15:03', 5),
(71828182, 3, 'carmendiaz@sgturnos.com', 'Carmen', 'Isabelina', 'Diaz', 'Capera', '$2a$12$vzMeqNK2go0mcefNoMiDeugxsESeoEbjWTpg43UsfYGmmHcn/zSnW', NULL, 1, 1, '2026-09-15 00:00:19', '2026-09-15 04:15:03', 5),
(73205080, 4, 'antonioortega@sgturnos.com', 'Antonio', 'Jose', 'Ortega', 'Finch', '$2a$12$NOzjoXgcKyeQJO3Hr5L3Muhes5APyOQkRYvl4wDJoWYl/a7LuTyfG', NULL, 1, 1, '2026-09-15 00:00:20', '2026-09-15 04:15:03', 5),
(77788899, 5, 'ricardopena@sgturnos.com', 'Ricardo', 'Hasam', 'Peña', 'Gareca', '$2a$12$UgLz2gBsD8mXK2k4fLLvRusvab52vLSSkigBL5epwQ.J5a9u4fKxu', NULL, 1, 1, '2026-09-15 00:00:20', '2026-09-15 04:15:03', 5),
(80101476, 6, 'edissontaborda@sgturnos.com', 'Edisson', 'Andrés', 'Taborda', 'Reyes', '$2a$12$dpudrc8HDHEQz1PLZrdFhelilfHOr2jpyWYOXI8yQXkXvC.dUwLle', NULL, 1, 1, '2026-09-15 00:00:21', '2026-09-15 04:15:03', 1),
(80901020, 7, 'silviarios@sgturnos.com', 'Silvia', 'Maria', 'Rios', 'Patarroyo', '$2a$12$36JWw9KSK2xJsPvcnRUn5eXSsl57Yy.CjFn1H6AxZcninFdf/miRC', NULL, 1, 1, '2026-09-15 00:00:21', '2026-09-15 04:15:03', 5),
(82012513, 8, 'nataliaflores@sgturnos.com', 'Natalia', 'Nikol', 'Flores', 'Catalan', '$2a$12$NQq797u8hivUfOrX4yieRukC9Af02v9gOXVD6zk7FIY8l0rZp4Nge', NULL, 1, 1, '2026-09-15 00:00:21', '2026-09-15 04:15:03', 5),
(83147098, 1, 'robertosilva@sgturnos.com', 'Roberto', 'Carlos', 'Silva', 'Clark', '$2a$12$uC7glb.HqKWygnYxrtwza.GWylVD8NCpD0L9VHK8ApzmbKrGIfDZK', NULL, 1, 1, '2026-09-15 00:00:22', '2026-09-15 04:15:03', 5),
(87654321, 2, 'marialopez@sgturnos.com', 'Maria', NULL, 'Lopez', NULL, '$2a$12$/eUeLaca8x2dBuHq9N01qOatCOz6NA3jtyvVOuneO9Qc9Mjdtsjri', NULL, 1, 1, '2026-09-15 00:00:22', '2026-09-15 04:15:03', 5),
(95462288, 3, 'susanaruiz@sgturnos.com', 'Susana', 'cintia', 'Ruiz', 'Cruz', '$2a$12$Xcclpy1Y456Qzvwxg89bzOzjNq0wigp4l4oqrGA4pn0OxF/9yedN.', NULL, 1, 1, '2026-09-15 00:00:23', '2026-09-15 04:15:03', 5),
(95957217, 4, 'sergioreyes@sgturnos.com', 'Sergio', 'Andres', 'Reyes', 'Segura', '$2a$12$TgonPqIZEhXImDxK1LTDr.J7qeptluFOfWLtxGVF4fXcpMMYY1ctu', NULL, 1, 1, '2026-09-15 00:00:23', '2026-09-15 04:15:03', 5),
(99001122, 5, 'raulmedina@sgturnos.com', 'Raul', 'Antonio', 'Medina', 'Gutierrez', '$2a$12$mTTQ172UeQfKLx5sAhNKEucyDLxrLFQjjkxcUqPB85D32rslBTI06', NULL, 1, 1, '2026-09-15 00:00:24', '2026-09-15 04:15:03', 5),
(99887766, 6, 'anagomez@sgturnos.com', 'Ana', 'Gomez', NULL, NULL, '$2a$12$UpdUEbim4f4H3TNlVtiLfe6U.1Es7gRPv//mGsAsCk3MhcCRu6ucq', NULL, 1, 1, '2026-09-15 00:00:24', '2026-09-15 04:15:03', 5),
(99900011, 7, 'estebansalinas@sgturnos.com', 'Esteban', 'Pablo', 'Salinas', 'Morgan', '$2a$12$47hjDQBoGD5NPbXXe/7vC.zYGqvZ3brt.mHmNdZ3/lmmptmm.Wj.O', NULL, 1, 1, '2026-09-15 00:00:25', '2026-09-15 04:15:03', 5),
(123456123, 8, 'kenshinkido@sgturnos.com', 'kenshin', 'goku', 'kido', 'himura', '$2a$12$2iNa2wTHiiyB/Lebd7hpR.vpBgxm5A8Xrt5sFFN3JACYnaqpMIRRy', NULL, 1, 1, '2026-09-15 00:00:25', '2026-09-15 04:15:03', 5),
(1090807123, 1, 'leonardodicaprio@sgturnos.com', 'Leonardo', 'Ramiro', 'Dicaprio', 'Sosavita', '$2a$12$C1MYbzrUk9HqtBAfYlkPfOseWJtMn339r1m2bwbiqauqsJb.QVTke', NULL, 1, 1, '2026-09-15 00:00:25', '2026-09-15 04:15:03', 5),
(1101101101, 2, 'yuliydaza@sgturnos.com', 'Yuliy', 'Paola', 'Daza', 'Oviedo', '$2a$12$vdx40i5/v6PP6CpJq19nKugozI6wCSstq9oOhFh.u9WVxpiJEAE4q', NULL, 1, 1, '2026-09-15 00:00:26', '2026-09-15 04:15:03', 5),
(1101246975, 3, 'ramonjirafales@sgturnos.com', 'Ramon', 'Federico', 'Jirafales', 'Barriga', '$2a$12$UBjDLQPs1gH5DOKGLV7a9Omn6D1w0EQqYDIdXMb2Udq9/a7VVJ02O', NULL, 1, 1, '2026-09-15 00:00:26', '2026-09-15 04:15:03', 5),
(1102102101, 4, 'melissasolano@sgturnos.com', 'Melissa', 'Andrea', 'Solano', 'Patiño', '$2a$12$qCBWoZcc1LgG6jrjCuxbX.o2nEdWt7Hi37VSM40xypjxvKIKTdsP.', NULL, 1, 1, '2026-09-15 00:00:27', '2026-09-15 04:15:03', 5),
(1103103101, 5, 'angelicaprada@sgturnos.com', 'Angelica', 'Milena', 'Prada', 'Cañón', '$2a$12$kGcwWp4uoy7APw5SYR8UguzvyCvx5ycmIP7SwVf52q2xdcs.Y.iHm', NULL, 1, 1, '2026-09-15 00:00:27', '2026-09-15 04:15:03', 5),
(1104104101, 6, 'jesusbeltran@sgturnos.com', 'Jesús', 'Daniel', 'Beltrán', 'Rodríguez', '$2a$12$5ZcAu.Iy2VBjqQfb4pOnhOvUv2SWckOh1RhhrF0XlW4lPZmY616zW', NULL, 1, 1, '2026-09-15 00:00:28', '2026-09-15 04:15:03', 5),
(1104774847, 7, 'leydigodoy@sgturnos.com', 'Leydi', 'Cecilia', 'Godoy', 'Ortiz', '$2a$12$ZDZngrE0kera5EaNGE5Zpe.x17svZ874KWdxNnjvN46ZzEA.E90/u', NULL, 1, 1, '2026-09-15 00:00:28', '2026-09-15 04:15:03', 1),
(1105105104, 8, 'carlosrodriguez@sgturnos.com', 'Carlos', 'Andrés', 'Rodríguez', 'Ochoa', '$2a$12$G4JrOpEaHUGpbjaGpaAZ8Ox/aH9f3RfNRphuCPtaMMKI7D6tJntIC', NULL, 1, 1, '2026-09-15 00:00:28', '2026-09-15 04:15:03', 5),
(1107107107, 1, 'jennymartinez@sgturnos.com', 'Jenny', 'Andrea', 'Martinez', 'Heredia', '$2a$12$zGYNUkCEtphl/gUTqvVkuOYN8luY/yhH6lOUgab.ir3kqe/meOjyy', NULL, 1, 1, '2026-09-15 00:00:29', '2026-09-15 04:15:03', 5),
(1108108104, 2, 'mariabarajas@sgturnos.com', 'María', 'Camila', 'Barajas', 'López', '$2a$12$2hvdRLQND4vFM/JiWvXij.NT8pYislZFJStyQwcGkaPXiJ9PenDfW', NULL, 1, 1, '2026-09-15 00:00:29', '2026-09-15 04:15:03', 5),
(1109109101, 3, 'armandosilva@sgturnos.com', 'Armando', 'Stiven', 'Silva', 'Rodríguez', '$2a$12$XZI/Zxzpa2nY0Zg3FCbgb.5.QD5j5UOk6TmnW.qPs62kBPhgFc2jq', NULL, 1, 1, '2026-09-15 00:00:30', '2026-09-15 04:15:03', 5),
(1110101110, 4, 'monicapinilla@sgturnos.com', 'Mónica', 'Patricia', 'Pinilla', 'Castro', '$2a$12$dHfjc4803PLL6yQsuzV7yOvPW81lBHUe/WoailXqe6ek6hiEwMEey', NULL, 1, 1, '2026-09-15 00:00:30', '2026-09-15 04:15:03', 5),
(1110110111, 5, 'camilavergara@sgturnos.com', 'Camila', 'Andrea', 'Vergara', 'Caro', '$2a$12$xPbXmPG8YZcLQ8MeRucpSeyO1FD1y5wGSvXvJJxQepXglNW3/VKAi', NULL, 1, 1, '2026-09-15 00:00:31', '2026-09-15 04:15:03', 5),
(1110110112, 6, 'andrescastro@sgturnos.com', 'Andrés', 'Felipe', 'Castro', 'Polo', '$2a$12$c7Rrs73K.NuyTNC0VYyTvOh5AR9n01UcWi.NtRDwItFV3QtydDs4K', NULL, 1, 1, '2026-09-15 00:00:31', '2026-09-15 04:15:03', 5),
(1110110113, 7, 'juliaaraujo@sgturnos.com', 'Julia', 'Fernanda', 'Araujo', 'Henao', '$2a$12$mY8I9XULos2dynbVN0.kleeocWMPiy2pwYQfradclbV8nA0zxqara', NULL, 1, 1, '2026-09-15 00:00:32', '2026-09-15 04:15:03', 5),
(1110110114, 8, 'juanalopez@sgturnos.com', 'Juana', 'Carolina', 'López', 'Montes', '$2a$12$jQjFoxHeeCEeT4p2sAvFq.fBzMBKSeNvBYJ0ajCtmgK4KCmRxXpiq', NULL, 1, 1, '2026-09-15 00:00:32', '2026-09-15 04:15:03', 5),
(1110110115, 1, 'danielacarvajal@sgturnos.com', 'Daniela', 'Carolina', 'Carvajal', 'Rio', '$2a$12$84LXlkacW94rgDIk8ndiyeC6IQuPIt03yEpaBLso5XHvRSmfGiTJe', NULL, 1, 1, '2026-09-15 00:00:32', '2026-09-15 04:15:03', 5),
(1110110116, 2, 'veronicacantor@sgturnos.com', 'Verónica', 'Sofia', 'Cantor', 'Jiménez', '$2a$12$cUEvjzL5DEzQm6.OZguUFOYnzPIG/du1aRw7lTdHaeYLLDsxF4Hhe', NULL, 1, 1, '2026-09-15 00:00:33', '2026-09-15 04:15:03', 5),
(1110110117, 3, 'carlamunoz@sgturnos.com', 'Carla', 'Antonia', 'Muñoz', 'Álvarez', '$2a$12$8P6uJQ79v.mY6KukfuynJ./u5m1QSLDJIms6fiwL8B.uS0PnPFFyi', NULL, 1, 1, '2026-09-15 00:00:33', '2026-09-15 04:15:03', 5),
(1110110118, 4, 'patriciapaternina@sgturnos.com', 'Patricia', NULL, 'Paternina', NULL, '$2a$12$FZ/71pau2cZl/i7s.ipj4uMByDpDF7tS1ewOZ3bqRiGgsEjLKUpj.', NULL, 1, 1, '2026-09-15 00:00:34', '2026-09-15 04:15:03', 5),
(1110110142, 5, 'yajairarangel@sgturnos.com', 'Yajaira', 'Paola', 'Rangel', 'Roa', '$2a$12$c7i2CpZEQEdFvHsYLcb7MO4jvEKwI8A4Ua1GhXECUCkXXOlrKmJiu', NULL, 1, 1, '2026-09-15 00:00:34', '2026-09-15 04:15:03', 5),
(1434389742, 6, 'aioriadeleo@sgturnos.com', 'aioria', 'de', 'leo', 'kido', '$2a$12$SwBHjhKDxDXw7qU38LtIVexKwH2ttX.EFU1YTTy5TvirVcJyv9c1q', NULL, 1, 1, '2026-09-15 00:00:35', '2026-09-15 04:15:03', 5),
(6546341122, 7, 'conicamelo@sgturnos.com', 'Coni', 'luz', 'Camelo', 'Frias', '$2a$12$2ldqAf4jGnYIFjaQd1I7c.VJFBWl7yEp96ShnzerBtfXKK3fsucq2', NULL, 1, 1, '2026-09-15 00:00:35', '2026-09-15 04:15:03', 5),
(9686711199, 8, 'mirandafula@sgturnos.com', 'miranda', 'catrina', 'fula', 'cortez', '$2a$12$zPlf.gCzkuSncXiol3xjxetqsbabsqdROIpdKoiC4UKlCLNbSVwzW', NULL, 1, 1, '2026-09-15 00:00:36', '2026-09-15 04:15:03', 5),
(123123456321, 1, 'sagageminis@sgturnos.com', 'saga', 'de', 'geminis', 'kido', '$2a$12$xlwEUrbkpY1XATpTKRDtx.d8qtF3eRRnnr1ix0rS67DTd2BYLDFp6', NULL, 1, 1, '2026-09-15 00:00:36', '2026-09-15 04:15:03', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_roles`
--

CREATE TABLE `usuario_roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `rol_id` bigint(20) UNSIGNED NOT NULL,
  `alcance` varchar(32) NOT NULL DEFAULT 'empresa',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario_roles`
--

INSERT INTO `usuario_roles` (`id`, `usuario_id`, `rol_id`, `alcance`, `creado_en`) VALUES
(1, 11122, 2, 'empresa', '2026-09-14 22:10:54'),
(2, 10203040, 2, 'empresa', '2026-09-14 22:10:54'),
(3, 10293847, 2, 'empresa', '2026-09-14 22:10:54'),
(4, 10439581, 2, 'empresa', '2026-09-14 22:10:54'),
(5, 12233445, 2, 'empresa', '2026-09-14 22:10:54'),
(6, 13579246, 2, 'empresa', '2026-09-14 22:10:54'),
(7, 14142135, 2, 'empresa', '2026-09-14 22:10:54'),
(8, 16180339, 2, 'empresa', '2026-09-14 22:10:54'),
(9, 20304050, 4, 'empresa', '2026-09-14 22:10:54'),
(10, 24681357, 4, 'empresa', '2026-09-14 22:10:54'),
(11, 27182818, 4, 'empresa', '2026-09-14 22:10:54'),
(12, 29979245, 4, 'empresa', '2026-09-14 22:10:54'),
(13, 30405060, 4, 'empresa', '2026-09-14 22:10:54'),
(14, 31415926, 4, 'empresa', '2026-09-14 22:10:54'),
(15, 40506070, 4, 'empresa', '2026-09-14 22:10:54'),
(16, 44455566, 4, 'empresa', '2026-09-14 22:10:54'),
(17, 48273377, 3, 'empresa', '2026-09-14 22:10:54'),
(18, 50288419, 3, 'empresa', '2026-09-14 22:10:54'),
(19, 55667788, 3, 'empresa', '2026-09-14 22:10:54'),
(20, 56473829, 3, 'empresa', '2026-09-14 22:10:54'),
(21, 57721566, 3, 'empresa', '2026-09-14 22:10:54'),
(22, 60708090, 3, 'empresa', '2026-09-14 22:10:54'),
(23, 66677788, 3, 'empresa', '2026-09-14 22:10:54'),
(24, 66778899, 3, 'empresa', '2026-09-14 22:10:54'),
(25, 69314718, 5, 'empresa', '2026-09-14 22:10:54'),
(26, 70809010, 5, 'empresa', '2026-09-14 22:10:54'),
(27, 71828182, 5, 'empresa', '2026-09-14 22:10:54'),
(28, 73205080, 5, 'empresa', '2026-09-14 22:10:54'),
(29, 77788899, 5, 'empresa', '2026-09-14 22:10:54'),
(30, 80101476, 5, 'empresa', '2026-09-14 22:10:54'),
(31, 80901020, 5, 'empresa', '2026-09-14 22:10:54'),
(32, 82012513, 5, 'empresa', '2026-09-14 22:10:54'),
(33, 83147098, 5, 'empresa', '2026-09-14 22:10:54'),
(34, 87654321, 5, 'empresa', '2026-09-14 22:10:54'),
(35, 95462288, 5, 'empresa', '2026-09-14 22:10:54'),
(36, 95957217, 5, 'empresa', '2026-09-14 22:10:54'),
(37, 99001122, 5, 'empresa', '2026-09-14 22:10:54'),
(38, 99887766, 5, 'empresa', '2026-09-14 22:10:54'),
(39, 99900011, 5, 'empresa', '2026-09-14 22:10:54'),
(40, 123456123, 5, 'empresa', '2026-09-14 22:10:54'),
(41, 1090807123, 5, 'empresa', '2026-09-14 22:10:54'),
(42, 1101101101, 5, 'empresa', '2026-09-14 22:10:54'),
(43, 1101246975, 5, 'empresa', '2026-09-14 22:10:54'),
(44, 1102102101, 5, 'empresa', '2026-09-14 22:10:54'),
(45, 1103103101, 5, 'empresa', '2026-09-14 22:10:54'),
(46, 1104104101, 5, 'empresa', '2026-09-14 22:10:54'),
(47, 1104774847, 5, 'empresa', '2026-09-14 22:10:54'),
(48, 1105105104, 5, 'empresa', '2026-09-14 22:10:54'),
(49, 1107107107, 5, 'empresa', '2026-09-14 22:10:54'),
(50, 1108108104, 5, 'empresa', '2026-09-14 22:10:54'),
(51, 1109109101, 5, 'empresa', '2026-09-14 22:10:54'),
(52, 1110101110, 5, 'empresa', '2026-09-14 22:10:54'),
(53, 1110110111, 5, 'empresa', '2026-09-14 22:10:54'),
(54, 1110110112, 5, 'empresa', '2026-09-14 22:10:54'),
(55, 1110110113, 5, 'empresa', '2026-09-14 22:10:54'),
(56, 1110110114, 5, 'empresa', '2026-09-14 22:10:54'),
(57, 1110110115, 5, 'empresa', '2026-09-14 22:10:54'),
(58, 1110110116, 5, 'empresa', '2026-09-14 22:10:54'),
(59, 1110110117, 5, 'empresa', '2026-09-14 22:10:54'),
(60, 1110110118, 5, 'empresa', '2026-09-14 22:10:54'),
(61, 1110110142, 5, 'empresa', '2026-09-14 22:10:54'),
(62, 1434389742, 5, 'empresa', '2026-09-14 22:10:54'),
(63, 6546341122, 5, 'empresa', '2026-09-14 22:10:54'),
(64, 9686711199, 5, 'empresa', '2026-09-14 22:10:54'),
(65, 123123456321, 5, 'empresa', '2026-09-14 22:10:54'),
(128, 80101476, 1, 'global', '2026-09-15 00:23:54'),
(129, 1104774847, 1, 'global', '2026-09-15 00:23:54'),
(130, 11122, 2, 'global', '2026-09-15 04:15:03'),
(131, 10203040, 2, 'global', '2026-09-15 04:15:03'),
(132, 10293847, 2, 'global', '2026-09-15 04:15:03'),
(133, 10439581, 2, 'global', '2026-09-15 04:15:03'),
(134, 12233445, 2, 'global', '2026-09-15 04:15:03'),
(135, 13579246, 2, 'global', '2026-09-15 04:15:03'),
(136, 14142135, 2, 'global', '2026-09-15 04:15:03'),
(137, 16180339, 2, 'global', '2026-09-15 04:15:03'),
(138, 20304050, 4, 'global', '2026-09-15 04:15:03'),
(139, 24681357, 4, 'global', '2026-09-15 04:15:03'),
(140, 27182818, 4, 'global', '2026-09-15 04:15:03'),
(141, 29979245, 4, 'global', '2026-09-15 04:15:03'),
(142, 30405060, 4, 'global', '2026-09-15 04:15:03'),
(143, 31415926, 4, 'global', '2026-09-15 04:15:03'),
(144, 40506070, 4, 'global', '2026-09-15 04:15:03'),
(145, 44455566, 4, 'global', '2026-09-15 04:15:03'),
(146, 48273377, 3, 'global', '2026-09-15 04:15:03'),
(147, 50288419, 3, 'global', '2026-09-15 04:15:03'),
(148, 55667788, 3, 'global', '2026-09-15 04:15:03'),
(149, 56473829, 3, 'global', '2026-09-15 04:15:03'),
(150, 57721566, 3, 'global', '2026-09-15 04:15:03'),
(151, 60708090, 3, 'global', '2026-09-15 04:15:03'),
(152, 66677788, 3, 'global', '2026-09-15 04:15:03'),
(153, 66778899, 3, 'global', '2026-09-15 04:15:03'),
(154, 69314718, 5, 'global', '2026-09-15 04:15:03'),
(155, 70809010, 5, 'global', '2026-09-15 04:15:03'),
(156, 71828182, 5, 'global', '2026-09-15 04:15:03'),
(157, 73205080, 5, 'global', '2026-09-15 04:15:03'),
(158, 77788899, 5, 'global', '2026-09-15 04:15:03'),
(159, 80901020, 5, 'global', '2026-09-15 04:15:03'),
(160, 82012513, 5, 'global', '2026-09-15 04:15:03'),
(161, 83147098, 5, 'global', '2026-09-15 04:15:03'),
(162, 87654321, 5, 'global', '2026-09-15 04:15:03'),
(163, 95462288, 5, 'global', '2026-09-15 04:15:03'),
(164, 95957217, 5, 'global', '2026-09-15 04:15:03'),
(165, 99001122, 5, 'global', '2026-09-15 04:15:03'),
(166, 99887766, 5, 'global', '2026-09-15 04:15:03'),
(167, 99900011, 5, 'global', '2026-09-15 04:15:03'),
(168, 123456123, 5, 'global', '2026-09-15 04:15:03'),
(169, 1090807123, 5, 'global', '2026-09-15 04:15:03'),
(170, 1101101101, 5, 'global', '2026-09-15 04:15:03'),
(171, 1101246975, 5, 'global', '2026-09-15 04:15:03'),
(172, 1102102101, 5, 'global', '2026-09-15 04:15:03'),
(173, 1103103101, 5, 'global', '2026-09-15 04:15:03'),
(174, 1104104101, 5, 'global', '2026-09-15 04:15:03'),
(175, 1105105104, 5, 'global', '2026-09-15 04:15:03'),
(176, 1107107107, 5, 'global', '2026-09-15 04:15:03'),
(177, 1108108104, 5, 'global', '2026-09-15 04:15:03'),
(178, 1109109101, 5, 'global', '2026-09-15 04:15:03'),
(179, 1110101110, 5, 'global', '2026-09-15 04:15:03'),
(180, 1110110111, 5, 'global', '2026-09-15 04:15:03'),
(181, 1110110112, 5, 'global', '2026-09-15 04:15:03'),
(182, 1110110113, 5, 'global', '2026-09-15 04:15:03'),
(183, 1110110114, 5, 'global', '2026-09-15 04:15:03'),
(184, 1110110115, 5, 'global', '2026-09-15 04:15:03'),
(185, 1110110116, 5, 'global', '2026-09-15 04:15:03'),
(186, 1110110117, 5, 'global', '2026-09-15 04:15:03'),
(187, 1110110118, 5, 'global', '2026-09-15 04:15:03'),
(188, 1110110142, 5, 'global', '2026-09-15 04:15:03'),
(189, 1434389742, 5, 'global', '2026-09-15 04:15:03'),
(190, 6546341122, 5, 'global', '2026-09-15 04:15:03'),
(191, 9686711199, 5, 'global', '2026-09-15 04:15:03'),
(192, 123123456321, 5, 'global', '2026-09-15 04:15:03');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `aprobaciones`
--
ALTER TABLE `aprobaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_aprobaciones_solicitud` (`solicitud_id`),
  ADD KEY `idx_aprobaciones_aprobador` (`aprobador_id`);

--
-- Indices de la tabla `asignaciones_turno`
--
ALTER TABLE `asignaciones_turno`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_asignacion_instancia_empleado` (`instancia_turno_id`,`empleado_id`),
  ADD KEY `idx_asignaciones_instancia` (`instancia_turno_id`),
  ADD KEY `idx_asignaciones_empleado` (`empleado_id`),
  ADD KEY `fk_asignaciones_asignado_por` (`asignado_por`);

--
-- Indices de la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_disponibilidad_empleado` (`empleado_id`);

--
-- Indices de la tabla `documentos_solicitud`
--
ALTER TABLE `documentos_solicitud`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_documentos_solicitud` (`solicitud_id`),
  ADD KEY `idx_documentos_empresa` (`empresa_id`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_empleados_empresa_codigo` (`empresa_id`,`codigo_empleado`),
  ADD KEY `idx_empleados_usuario` (`usuario_id`),
  ADD KEY `idx_empleados_empresa` (`empresa_id`),
  ADD KEY `idx_empleados_especialidad` (`especialidad_id`);

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_empresas_plan` (`plan_id`);

--
-- Indices de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_especialidades_empresa_codigo` (`empresa_id`,`codigo`),
  ADD KEY `idx_especialidades_empresa` (`empresa_id`);

--
-- Indices de la tabla `instancias_turno`
--
ALTER TABLE `instancias_turno`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_instancias_plantilla` (`plantilla_id`),
  ADD KEY `idx_instancias_fecha` (`fecha`),
  ADD KEY `idx_instancias_sede` (`sede_id`),
  ADD KEY `fk_instancias_creado_por` (`creado_por`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notif_empresa` (`empresa_id`),
  ADD KEY `idx_notif_usuario` (`usuario_id`);

--
-- Indices de la tabla `planes`
--
ALTER TABLE `planes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_planes_nombre` (`nombre`);

--
-- Indices de la tabla `plantillas_turno`
--
ALTER TABLE `plantillas_turno`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_plantillas_empresa` (`empresa_id`);

--
-- Indices de la tabla `registros_auditoria`
--
ALTER TABLE `registros_auditoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_auditoria_empresa` (`empresa_id`),
  ADD KEY `idx_auditoria_usuario` (`usuario_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_roles_nombre` (`nombre`),
  ADD UNIQUE KEY `uq_roles_codigo` (`codigo`);

--
-- Indices de la tabla `sedes`
--
ALTER TABLE `sedes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sedes_empresa` (`empresa_id`);

--
-- Indices de la tabla `solicitudes_novedad`
--
ALTER TABLE `solicitudes_novedad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_solicitudes_empleado` (`empleado_id`),
  ADD KEY `idx_solicitudes_empresa` (`empresa_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuarios_empresa_correo` (`empresa_id`,`correo`),
  ADD KEY `idx_usuarios_empresa` (`empresa_id`),
  ADD KEY `idx_usuarios_correo` (`correo`);

--
-- Indices de la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario_rol_alcance` (`usuario_id`,`rol_id`,`alcance`),
  ADD KEY `idx_usuario_roles_usuario` (`usuario_id`),
  ADD KEY `idx_usuario_roles_rol` (`rol_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `aprobaciones`
--
ALTER TABLE `aprobaciones`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asignaciones_turno`
--
ALTER TABLE `asignaciones_turno`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `documentos_solicitud`
--
ALTER TABLE `documentos_solicitud`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT de la tabla `instancias_turno`
--
ALTER TABLE `instancias_turno`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `planes`
--
ALTER TABLE `planes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `plantillas_turno`
--
ALTER TABLE `plantillas_turno`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `registros_auditoria`
--
ALTER TABLE `registros_auditoria`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `sedes`
--
ALTER TABLE `sedes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `solicitudes_novedad`
--
ALTER TABLE `solicitudes_novedad`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123123456322;

--
-- AUTO_INCREMENT de la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=193;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `aprobaciones`
--
ALTER TABLE `aprobaciones`
  ADD CONSTRAINT `fk_aprobaciones_aprobador` FOREIGN KEY (`aprobador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aprobaciones_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_novedad` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `asignaciones_turno`
--
ALTER TABLE `asignaciones_turno`
  ADD CONSTRAINT `fk_asignaciones_asignado_por` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asignaciones_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asignaciones_instancia` FOREIGN KEY (`instancia_turno_id`) REFERENCES `instancias_turno` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  ADD CONSTRAINT `fk_disponibilidad_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `documentos_solicitud`
--
ALTER TABLE `documentos_solicitud`
  ADD CONSTRAINT `fk_documentos_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_documentos_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_novedad` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD CONSTRAINT `fk_empleados_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_empleados_especialidad` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_empleados_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD CONSTRAINT `fk_empresas_plan` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `especialidades`
--
ALTER TABLE `especialidades`
  ADD CONSTRAINT `fk_especialidades_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `instancias_turno`
--
ALTER TABLE `instancias_turno`
  ADD CONSTRAINT `fk_instancias_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_instancias_plantilla` FOREIGN KEY (`plantilla_id`) REFERENCES `plantillas_turno` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_instancias_sede` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `fk_notificaciones_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notificaciones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `plantillas_turno`
--
ALTER TABLE `plantillas_turno`
  ADD CONSTRAINT `fk_plantillas_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `registros_auditoria`
--
ALTER TABLE `registros_auditoria`
  ADD CONSTRAINT `fk_auditoria_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `sedes`
--
ALTER TABLE `sedes`
  ADD CONSTRAINT `fk_sedes_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `solicitudes_novedad`
--
ALTER TABLE `solicitudes_novedad`
  ADD CONSTRAINT `fk_solicitudes_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_solicitudes_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  ADD CONSTRAINT `fk_usuario_roles_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_roles_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
