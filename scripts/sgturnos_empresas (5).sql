-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-09-2026 a las 19:51:52
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
-- Estructura de tabla para la tabla `configuraciones_malla`
--

CREATE TABLE `configuraciones_malla` (
  `id` int(11) NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(255) NOT NULL COMMENT 'Nombre de la malla (ej: Malla 2x12h)',
  `descripcion` text DEFAULT NULL COMMENT 'Descripción detallada de la configuración',
  `cantidad_empleados` int(11) NOT NULL COMMENT 'Cantidad de empleados que cubre esta malla',
  `horas_por_semana` int(11) DEFAULT 42 COMMENT 'Horas laborales por semana (Colombia: 42)',
  `horas_por_mes` int(11) DEFAULT 182 COMMENT 'Horas laborales por mes (Colombia: 182)',
  `dias_laborales_por_semana` int(11) DEFAULT 5 COMMENT 'Días de trabajo por semana',
  `turnos_mensuales_empleado` int(11) NOT NULL COMMENT 'Cantidad de turnos mensuales que hace cada empleado (Ej: 20)',
  `tipo_distribucion` enum('equilibrada','personalizada') DEFAULT NULL COMMENT 'Tipo de distribución: automática o manual',
  `activo` tinyint(1) DEFAULT 1,
  `creado_por` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID del usuario que creó',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_por` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID del usuario que actualizó',
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Almacena las configuraciones de malla de turnos por empresa';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuraciones_malla_turnos`
--

CREATE TABLE `configuraciones_malla_turnos` (
  `id` int(11) NOT NULL,
  `configuracion_id` int(11) NOT NULL COMMENT 'ID de la configuración de malla',
  `plantilla_id` bigint(20) UNSIGNED NOT NULL COMMENT 'ID de la plantilla de turno',
  `orden` int(11) NOT NULL COMMENT 'Orden de rotación (1, 2, 3...)',
  `duracion_horas` int(11) NOT NULL COMMENT 'Horas del turno (8, 12, etc)',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relación M2M entre configuraciones y plantillas de turno';

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
(41, 123123456321, 1, 'EMP1_123123456321', 2, NULL, '2026-09-14', 'activo', '2026-09-15 00:40:51'),
(42, 123123456323, 9, 'EMP9_123123456323', NULL, NULL, NULL, 'activo', '2026-09-23 17:11:12'),
(43, 123123456324, 11, 'EMP11_123123456324', NULL, NULL, NULL, 'activo', '2026-09-23 17:11:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `nit` varchar(50) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `contacto` varchar(150) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `zona_horaria` varchar(64) DEFAULT 'UTC',
  `plan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `nombre`, `nit`, `pais`, `ciudad`, `contacto`, `correo`, `telefono`, `activo`, `zona_horaria`, `plan_id`, `creado_en`, `actualizado_en`) VALUES
(1, 'Empresa Demo 1', '900123456-1', 'Colombia', 'Bogotá', 'María García López', 'contacto@empresa-demo.com', '3101234567', 1, 'America/Bogota', 1, '2026-09-14 21:20:32', '2026-09-18 20:30:01'),
(2, 'Comercial Norte', '900234567-1', 'Colombia', 'Bogotá', 'Juan Martínez Pérez', 'contacto@comercial-norte.com', '3102345678', 1, 'America/Chicago', 1, '2026-09-14 21:20:32', '2026-09-18 20:27:45'),
(3, 'Tienda Local', '900345678-1', 'Colombia', 'Medellín', 'Carlos Rodríguez Silva', 'contacto@tienda-local.com', '3103456789', 1, 'America/Argentina/Buenos_Aires', 1, '2026-09-14 21:20:32', '2026-09-18 20:27:45'),
(4, 'Servicios Vecinos', '900456789-1', 'Colombia', 'Cali', 'Ana González Ruiz', 'contacto@servicios-vecinos.com', '3104567890', 1, 'America/Bogota', 1, '2026-09-14 21:20:32', '2026-09-18 20:27:45'),
(5, 'Oficina Pyme', '900567890-1', 'Estados Unidos', 'Nueva York', 'Robert Johnson', 'contact@oficina-pyme.com', '+1-212-555-0100', 1, 'America/New_York', 1, '2026-09-14 21:20:32', '2026-09-18 20:27:45'),
(6, 'Solutions Medio', '900678901-1', 'España', 'Madrid', 'Fernando García López', 'contacto@solutions-medio.com', '+34-91-5550100', 1, 'Europe/Madrid', 2, '2026-09-14 21:20:32', '2026-09-18 20:27:45'),
(7, 'Operaciones Sur', '900789012-1', 'Chile', 'Santiago', 'José Ramírez Flores', 'contacto@operaciones-sur.com', '+56-2-25550100', 1, 'America/Santiago', 2, '2026-09-14 21:20:32', '2026-09-18 20:27:45'),
(8, 'Corporativo Premium', '900890123-1', 'Reino Unido', 'Londres', 'Michael Smith', 'contact@corporativo-premium.com', '+44-20-75550100', 1, 'Europe/London', 3, '2026-09-14 21:20:32', '2026-09-18 20:27:45'),
(9, 'Novatech S.A.', '900888777-1', 'Colombia', 'Bogotá', 'Carlor Fernando Araujo', 'araujo@novatech.com', '3009998887', 1, 'America/Bogota', 2, '2026-09-16 23:10:08', '2026-09-17 03:39:32'),
(10, 'Fedora Inc.', '900567345-1', 'Colombia', 'Bogotá', 'Elton Jhon Gil', 'elton@fedora.com', '3006665544', 1, 'America/Bogota', 1, '2026-09-17 03:17:06', '2026-09-17 03:41:28'),
(11, 'Italo SAS', '900666555-1', 'Colombia', 'Bogotá', 'Andres lopez', 'lopez@italo.com', '3124145443', 1, 'America/Bogota', 1, '2026-09-17 03:30:39', '2026-09-17 03:40:28');

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
(82, 8, 'monitoreo_cctv', 'Monitoreo CCTV', 'Vigilancia por cámaras y monitoreo remoto', '2026-09-14 23:46:07'),
(83, 1, 'MEDICO', 'Médico', 'Médico general', '2026-09-23 17:03:17'),
(84, 1, 'ENFERMERA', 'Enfermera', 'Profesional de enfermería', '2026-09-23 17:03:17'),
(85, 1, 'AUX_ENF', 'Auxiliar de Enfermería', 'Apoyo en atención al paciente', '2026-09-23 17:03:17'),
(86, 1, 'ADMIN', 'Administrativo', 'Personal administrativo y recepción', '2026-09-23 17:03:17'),
(87, 2, 'EJECUTIVO', 'Ejecutivo de Ventas', 'Atención a clientes y ventas', '2026-09-23 17:03:17'),
(88, 2, 'SUPERVISOR', 'Supervisor', 'Supervisión de equipo', '2026-09-23 17:03:17'),
(89, 2, 'ADMIN', 'Administrativo', 'Soporte administrativo', '2026-09-23 17:03:17'),
(90, 3, 'RECEPCIONISTA', 'Recepcionista', 'Atención en recepción', '2026-09-23 17:03:17'),
(91, 3, 'SUPERVISOR', 'Supervisor', 'Supervisión de recepción', '2026-09-23 17:03:17'),
(92, 3, 'ADMIN', 'Administrativo', 'Tareas administrativas', '2026-09-23 17:03:17'),
(93, 4, 'VIGILANTE', 'Vigilante', 'Personal de vigilancia', '2026-09-23 17:03:17'),
(94, 4, 'JEFE_TURNO', 'Jefe de Turno', 'Supervisión de vigilancia', '2026-09-23 17:03:17'),
(95, 4, 'ADMIN', 'Administrativo', 'Personal administrativo', '2026-09-23 17:03:17'),
(96, 5, 'LIMPIADOR', 'Limpiador', 'Servicios de limpieza', '2026-09-23 17:03:17'),
(97, 5, 'SUPERVISOR', 'Supervisor', 'Supervisión de limpieza', '2026-09-23 17:03:17'),
(98, 6, 'TECNICO', 'Técnico de Mantenimiento', 'Mantenimiento preventivo y correctivo', '2026-09-23 17:03:17'),
(99, 6, 'JEFE_MANT', 'Jefe de Mantenimiento', 'Supervisión de mantenimiento', '2026-09-23 17:03:17'),
(100, 6, 'ADMIN', 'Administrativo', 'Personal administrativo', '2026-09-23 17:03:17'),
(101, 7, 'PSICOLOGO', 'Psicólogo', 'Consulta psicológica', '2026-09-23 17:03:17'),
(102, 7, 'ESPECIALISTA', 'Especialista', 'Psicólogo especialista', '2026-09-23 17:03:17'),
(103, 7, 'ADMIN', 'Administrativo', 'Personal administrativo', '2026-09-23 17:03:17'),
(104, 8, 'MONITOR', 'Monitor de CCTV', 'Vigilancia por cámaras', '2026-09-23 17:03:17'),
(105, 8, 'SUPERVISOR', 'Supervisor', 'Supervisión de monitoreo', '2026-09-23 17:03:17'),
(106, 8, 'TECNICO', 'Técnico', 'Soporte técnico de sistemas', '2026-09-23 17:03:17');

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
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `tipo` varchar(50) DEFAULT 'FIJO' COMMENT 'FIJO o PERSONALIZADO',
  `descripcion` text DEFAULT NULL COMMENT 'Descripción de la modalidad',
  `duracion_base` int(11) DEFAULT NULL COMMENT 'Duración base en horas',
  `es_personalizada` tinyint(1) DEFAULT 0 COMMENT 'Si es 1, es modalidad personalizada',
  `patron_rotativo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Patrón de rotación JSON' CHECK (json_valid(`patron_rotativo`)),
  `especialidad_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `plantillas_turno`
--

INSERT INTO `plantillas_turno` (`id`, `empresa_id`, `nombre`, `hora_inicio`, `hora_fin`, `duracion_minutos`, `es_nocturno`, `patron_recurrencia`, `creado_en`, `tipo`, `descripcion`, `duracion_base`, `es_personalizada`, `patron_rotativo`, `especialidad_id`) VALUES
(1, 3, 'Turno Día', '09:00:00', '17:00:00', 480, 0, 'lunes_a_viernes', '2026-09-18 22:32:57', 'FIJO', NULL, NULL, 0, NULL, NULL),
(2, 3, 'Turno Noche', '19:00:00', '07:00:00', 720, 0, 'lunes_a_viernes', '2026-09-18 22:36:46', 'FIJO', NULL, NULL, 0, NULL, NULL);

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

--
-- Volcado de datos para la tabla `registros_auditoria`
--

INSERT INTO `registros_auditoria` (`id`, `empresa_id`, `usuario_id`, `accion`, `tabla_objetivo`, `id_objetivo`, `detalles`, `creado_en`) VALUES
(1, 3, 55667788, 'crear_plantilla_turno', 'plantillas_turno', 1, '{\"nombre\":\"Turno matutino\",\"hora_inicio\":\"09:00:00\",\"hora_fin\":\"17:00:00\"}', '2026-09-18 22:32:57'),
(2, 3, 55667788, 'actualizar_plantilla_turno', 'plantillas_turno', 1, '{\"nombre\":\"Turno Día\",\"hora_inicio\":\"09:00:00\",\"hora_fin\":\"17:00:00\",\"patron_recurrencia\":\"lunes_a_viernes\"}', '2026-09-18 22:34:29'),
(3, 3, 55667788, 'crear_plantilla_turno', 'plantillas_turno', 2, '{\"nombre\":\"Turno Noche\",\"hora_inicio\":\"19:00:00\",\"hora_fin\":\"07:00:00\"}', '2026-09-18 22:36:46');

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
-- Estructura de tabla para la tabla `tokens_restablecimiento_contraseña`
--

CREATE TABLE `tokens_restablecimiento_contraseña` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `usuario_id_legado` int(11) DEFAULT NULL,
  `hash_token` varchar(64) NOT NULL,
  `expira_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `utilizado_en` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `empresa_id` bigint(20) UNSIGNED NOT NULL,
  `documento` varchar(50) DEFAULT NULL,
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

INSERT INTO `usuarios` (`id`, `empresa_id`, `documento`, `correo`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `contrasena`, `telefono`, `activo`, `esta_activo`, `creado_en`, `actualizado_en`, `id_rol`) VALUES
(11122, 1, '1022334455', 'veronicalara@sgturnos.com', 'Veronica', 'Luciana', 'Lara', 'Carranza', '$2a$12$NKJesdn2mmCLr8jR6ZaoNuKDcK1vAHqAcN2I7e/hRl4lMM8oYh7dW', NULL, 1, 1, '2026-09-15 00:00:07', '2026-09-18 20:39:49', 2),
(10203040, 2, '1023445566', 'rosajimenez@sgturnos.com', 'Rosa', 'Magnolia', 'Jimenez', 'Tafur', '$2a$12$0eBi7KhzCDAphEcIoH0bT.86L1t48lO0WDWueapKQ3nu328ljttHG', NULL, 1, 1, '2026-09-15 00:00:08', '2026-09-18 20:39:49', 2),
(10293847, 3, '1024556677', 'oscarcampos@sgturnos.com', 'Oscar', 'Santiago', 'Campos', 'Ovalle', '$2a$12$dFwLrgrckIAQf3L3OsY12O9u0Tjephmz7h5kDciDNr4c61GfXoZL6', NULL, 1, 1, '2026-09-15 00:00:08', '2026-09-18 20:39:49', 2),
(10439581, 4, '1025667788', 'beatrizmendoza@sgturnos.com', 'Beatriz', 'Ana', 'Mendoza', 'Trump', '$2a$12$67jPgk80hS4fzRFVzYGwTOoQ7c3sE90fbx4xE5Tige2E1KiCiCoHO', NULL, 1, 1, '2026-09-15 00:00:09', '2026-09-18 20:39:49', 2),
(12233445, 5, '1026778899', 'victorguerrero@sgturnos.com', 'Victor', 'Pablo', 'Guerrero', 'Libano', '$2a$12$ejQC7rQC3Q.LS0cWYhqsGejPsOIoU4SnWU/jL.C2ouI56ymZXUOKq', NULL, 1, 1, '2026-09-15 00:00:09', '2026-09-18 20:39:49', 2),
(13579246, 6, '1027889900', 'pedrosanchez@sgturnos.com', 'Pedro', 'Camilo', 'Sanchez', 'Tolosa', '$2a$12$Wnw7c6WyiJ67/j1MPvHleOGUSIIokcAq98L98n.7YWc4EtJNRJTDq', NULL, 1, 1, '2026-09-15 00:00:10', '2026-09-18 20:39:49', 2),
(14142135, 7, '1028990011', 'isabelmunoz@sgturnos.com', 'Isabel', 'Alejandra', 'Muñoz', 'Aguilar', '$2a$12$eluTSsqVh7vNsKHzB8gxXOcJ6PdkLKgK4b2AqUR5AHi2CSKXLQVDm', NULL, 1, 1, '2026-09-15 00:00:10', '2026-09-18 20:39:49', 2),
(16180339, 8, '1029001122', 'miguelruiz@sgturnos.com', 'Miguel', 'Camilo', 'Ruiz', 'Treller', '$2a$12$6ReIcMtXMM.zerDzeoXvjOdjSy.CV7cBSLGVDVF50HH01kIF5T2Ku', NULL, 1, 1, '2026-09-15 00:00:10', '2026-09-18 20:39:49', 2),
(20304050, 1, '1030112233', 'fernandoluna@sgturnos.com', 'Fernando', 'Luis', 'Luna', 'Rayo', '$2a$12$3x.jIXjnYQMVqGWacONNWulHO8w9OhCoJ4bc96S6DbcA6qFAsMThy', NULL, 1, 1, '2026-09-15 00:00:11', '2026-09-18 20:39:49', 4),
(24681357, 2, '1031223344', 'lauraramirez@sgturnos.com', 'Laura', 'Andrea', 'Ramirez', 'Valles', '$2a$12$CdpjaksSNDybzV2FRT/E8.FpqUYV/KDOmMLFl5x1qsREOyoTnDxEa', NULL, 1, 1, '2026-09-15 00:00:12', '2026-09-18 20:39:49', 4),
(27182818, 3, '1032334455', 'elenavargas@sgturnos.com', 'Elena', 'Sofia', 'Vargas', 'Brush', '$2a$12$EsGIctWgqrTmyIMZJyLChOldBRxyHTGiXZCiSjFBZgR9PwFtbxrAC', NULL, 1, 1, '2026-09-15 00:00:12', '2026-09-18 20:39:49', 4),
(29979245, 4, '1033445566', 'patricianavarro@sgturnos.com', 'Patricia', 'Nenitza', 'Navarro', 'Palma', '$2a$12$WIP5nrIzWfME1ljKAOwjE.YBlu/Xwjm5HJIzzoHeEvye9T2Z1VLl.', NULL, 1, 1, '2026-09-15 00:00:13', '2026-09-18 20:39:49', 4),
(30405060, 5, '1034556677', 'eduardosoto@sgturnos.com', 'Eduardo', 'Felipe', 'Soto', 'Cardozo', '$2a$12$ps.Mv07N65gs8jWMrQMAt.ME2E1dFtv/8mHFU2ZtwEvwxKRBlV2ii', NULL, 1, 1, '2026-09-15 00:00:13', '2026-09-18 20:39:49', 4),
(31415926, 6, '1035667788', 'diegotorres@sgturnos.com', 'Diego', 'David', 'Torres', 'Gomez', '$2a$12$oQBCa0M9.vgj3kv210k2g.ov1I65XQP4AuKotzFsZz0bS/17ZZDr.', NULL, 1, 1, '2026-09-15 00:00:13', '2026-09-18 20:39:49', 4),
(40506070, 7, '1036778899', 'albertocruz@sgturnos.com', 'Alberto', 'Emiro', 'Cruz', 'Hunt', '$2a$12$U.wagz1PBEN9ZyrJB/vyHuEmnXWfs2s3raOj5rAUbHSGTAxcqNwtK', NULL, 1, 1, '2026-09-15 00:00:14', '2026-09-18 20:39:49', 4),
(44455566, 8, '1037889900', 'paulamolina@sgturnos.com', 'Paula', 'Gabriela', 'Molina', 'Terrence', '$2a$12$oJyIp234zvp9/mW2TI0uhO3M1o5qRxifyavzju/OVgpOcArDJk7La', NULL, 1, 1, '2026-09-15 00:00:14', '2026-09-18 20:39:49', 4),
(48273377, 1, '1038990011', 'dantegebel@sgturnos.com', 'Dante', 'jose', 'Gebel', 'Urrutia', '$2a$12$O3h3thfvnLyvGn0pYEafPeMWcY.A7P3pBe.wOeCoiIa2xBtskYqCe', NULL, 1, 1, '2026-09-15 00:00:15', '2026-09-18 20:39:49', 3),
(50288419, 2, '1039001122', 'teresacastro@sgturnos.com', 'Teresa', 'Maria', 'Castro', 'Lopez', '$2a$12$Xd4GisLa5Eq3CmsX92C/IeYeDI/VM6DUhBozfjiXa4s5cHGYWNq2m', NULL, 1, 1, '2026-09-15 00:00:15', '2026-09-18 20:39:49', 3),
(55667788, 3, '1040112233', 'olgaespinoza@sgturnos.com', 'Olga', 'Shakira', 'Espinoza', 'Castrol', '$2a$12$Ti35e4LCsTnWVDoFEuWbNO2sztasU7iI4G/B8mnW8lokcP5Bmu6Be', NULL, 1, 1, '2026-09-15 00:00:16', '2026-09-18 20:39:49', 3),
(56473829, 4, '1041223344', 'luciavaldez@sgturnos.com', 'Lucia', 'Daniela', 'Valdez', 'Florez', '$2a$12$97f5NlS7/XcTnp2PROtU6e23NMT4qfYkqmm7YOWVAAsXRhZPL1hvq', NULL, 1, 1, '2026-09-15 00:00:16', '2026-09-18 20:39:49', 3),
(57721566, 5, '1042334455', 'javiermoreno@sgturnos.com', 'Javier', 'Francisco', 'Moreno', 'Daza', '$2a$12$ITAVKBLePr.eIdYHZUAQhuFb8FYp2K/BVT1dGXmupaqIXcYIZz34m', NULL, 1, 1, '2026-09-15 00:00:17', '2026-09-18 20:39:49', 3),
(60708090, 6, '1043445566', 'monicaparedes@sgturnos.com', 'Monica', 'Lucia', 'Paredes', 'Camargo', '$2a$12$dr5NAJzNQOHfiIJsqRCBnOm/VwjxHHOdF4zdGMHiubWjhPVUVyuQ6', NULL, 1, 1, '2026-09-15 00:00:17', '2026-09-18 20:39:49', 3),
(66677788, 7, '1044556677', 'claudiaquintana@sgturnos.com', 'Claudia', 'Marcela', 'Quintana', 'Fajardo', '$2a$12$0.SntBBwx2Wfix2m2NPMrutaKIPmVsokFtyYQjf3m1pJcUNeSNgr.', NULL, 1, 1, '2026-09-15 00:00:17', '2026-09-18 20:39:49', 3),
(66778899, 8, '1045667788', 'sofiahernandez@sgturnos.com', 'Sofia', '', 'Hernandez', NULL, '$2a$12$i/kIcOGPrTwF.S1EqXd13eAwSN3wCmGTEOkBTsPWmRYm7E1jNE8gG', NULL, 1, 1, '2026-09-15 00:00:18', '2026-09-18 20:39:49', 3),
(69314718, 1, '1046778899', 'franciscoromero@sgturnos.com', 'Francisco', 'Javier', 'Romero', 'Caldas', '$2a$12$lvRAA3KBDd5dc6Y5lHCAWezJJHvpwxlqYz5iRt9iAYdVe89x.uv7a', NULL, 1, 1, '2026-09-15 00:00:18', '2026-09-18 20:39:49', 5),
(70809010, 2, '1047889900', 'gabrielavega@sgturnos.com', 'Gabriela', 'Filipa', 'Vega', 'Alarcon', '$2a$12$P26jtxt.kIWaGN7pZnV4MON4v60YzaS0AJst4R6WA4WHNqd2vEh5u', NULL, 1, 1, '2026-09-15 00:00:19', '2026-09-18 20:39:49', 5),
(71828182, 3, '1048990011', 'carmendiaz@sgturnos.com', 'Carmen', 'Isabelina', 'Diaz', 'Capera', '$2a$12$/g./CD/lQ5B02ZmwratHE.DUCR90DshbfzwvR.ZKjekh4pSMqLx3K', NULL, 1, 1, '2026-09-15 00:00:19', '2026-09-18 20:39:49', 5),
(73205080, 4, '1049001122', 'antonioortega@sgturnos.com', 'Antonio', 'Jose', 'Ortega', 'Finch', '$2a$12$WrX0aGU9Us0mgJBPk7i9KOOPi2iSJ2xBZK3qgT2ZUSqJgQZRd1JJ2', NULL, 1, 1, '2026-09-15 00:00:20', '2026-09-18 20:39:49', 5),
(77788899, 5, '1050112233', 'ricardopena@sgturnos.com', 'Ricardo', 'Hasam', 'Peña', 'Gareca', '$2a$12$SaxsS6QcGvIHCKuMhxGiquEB6B3RsxqeFFG7zSD17daTxrPd43NB.', NULL, 1, 1, '2026-09-15 00:00:20', '2026-09-18 20:39:49', 5),
(80101476, 6, NULL, 'edissontaborda@sgturnos.com', 'Edisson', 'Andrés', 'Taborda', 'Reyes', '$2a$12$t.2hb75S2PO4KXTj8N2KzORQt8rUwc62z4jAMY9e6nrEqeygZM5.S', NULL, 1, 1, '2026-09-15 00:00:21', '2026-09-15 12:02:59', 1),
(80901020, 7, '1051223344', 'silviarios@sgturnos.com', 'Silvia', 'Maria', 'Rios', 'Patarroyo', '$2a$12$5XDtzRy9YNGJ4RD.6qCJpuqicHuh11cVdxwxyqEUEtpQmx0vsKpD.', NULL, 1, 1, '2026-09-15 00:00:21', '2026-09-18 20:39:49', 5),
(82012513, 8, '1052334455', 'nataliaflores@sgturnos.com', 'Natalia', 'Nikol', 'Flores', 'Catalan', '$2a$12$HttC3JV.YwO6Z/w6UJsQIOjqIjLIRSwz6e/82p8uMrg1po3MRsskW', NULL, 1, 1, '2026-09-15 00:00:21', '2026-09-18 20:39:49', 5),
(83147098, 1, '1053445566', 'robertosilva@sgturnos.com', 'Roberto', 'Carlos', 'Silva', 'Clark', '$2a$12$Ec/A0sSOOPKgmbEqZa7xWeoHxDBFb7y.jbjUcoWrxkfztK85WU5WC', NULL, 1, 1, '2026-09-15 00:00:22', '2026-09-18 20:39:49', 5),
(87654321, 2, '1054556677', 'marialopez@sgturnos.com', 'Maria', NULL, 'Lopez', NULL, '$2a$12$cQqplzP0s71MQamY2iEdJOxfcL57DAURQQLyZdEtj3vQYE59916fa', NULL, 1, 1, '2026-09-15 00:00:22', '2026-09-18 20:39:49', 5),
(95462288, 3, '1055667788', 'susanaruiz@sgturnos.com', 'Susana', 'cintia', 'Ruiz', 'Cruz', '$2a$12$D5iytk.R9L6vsgxBjYPGleX6lRGvxEqZrHMUcECM7WWhLrQbTWdEO', NULL, 1, 1, '2026-09-15 00:00:23', '2026-09-18 20:39:49', 5),
(95957217, 4, '1056778899', 'sergioreyes@sgturnos.com', 'Sergio', 'Andres', 'Reyes', 'Segura', '$2a$12$Z84LxXJigibCljZzYB3/GeFHM/fcE0/tLthOJI8LI6kMgANA6AGau', NULL, 1, 1, '2026-09-15 00:00:23', '2026-09-18 20:39:49', 5),
(99001122, 5, '1057889900', 'raulmedina@sgturnos.com', 'Raul', 'Antonio', 'Medina', 'Gutierrez', '$2a$12$.7Iuk4T15b7OMNhYbUSkWu8kwwPENxUzflQbbQXavm3zbgYrRLzfG', NULL, 1, 1, '2026-09-15 00:00:24', '2026-09-18 20:39:49', 5),
(99887766, 6, '1058990011', 'anagomez@sgturnos.com', 'Ana', 'Gomez', 'Gomez', NULL, '$2a$12$uU0KNDQuFfRvSkNtmjZZM.TUEPfpZnUP6kQrtP124bRD10Y4qncwm', NULL, 1, 1, '2026-09-15 00:00:24', '2026-09-18 20:39:49', 5),
(99900011, 7, '1059001122', 'estebansalinas@sgturnos.com', 'Esteban', 'Pablo', 'Salinas', 'Morgan', '$2a$12$jVvL51Z3Gs7KBfzA1iu3BumCTOxgJyRr7IvJCrTsXYm4Ng2WuD5PC', NULL, 1, 1, '2026-09-15 00:00:25', '2026-09-18 20:39:49', 5),
(123456123, 8, '1060112233', 'kenshinkido@sgturnos.com', 'Kenshin', 'Goku', 'Kido', 'Himura', '$2a$12$x3E5YTcLIKPnSDoRuDcMAu1VIquKk8v2FeiiJWavQKQDqDhtjIOGC', NULL, 1, 1, '2026-09-15 00:00:25', '2026-09-18 20:39:49', 5),
(1090807123, 1, '1061223344', 'leonardodicaprio@sgturnos.com', 'Leonardo', 'Ramiro', 'Dicaprio', 'Sosavita', '$2a$12$eV0jZr0lEUJKeF.0s3HbqOMCtdXZ95XjBbCXMFvVMklT.UZG97he2', NULL, 1, 1, '2026-09-15 00:00:25', '2026-09-18 20:39:49', 5),
(1101101101, 2, '1062334455', 'yuliydaza@sgturnos.com', 'Yuliy', 'Paola', 'Daza', 'Oviedo', '$2a$12$I5KZ8LPR.3brpXgclWmgR.KxjO49hbePI4WR7AGjAkx4TNpwJ3bRa', NULL, 1, 1, '2026-09-15 00:00:26', '2026-09-18 20:39:49', 5),
(1101246975, 3, '1063445566', 'ramonjirafales@sgturnos.com', 'Ramon', 'Federico', 'Jirafales', 'Barriga', '$2a$12$Kn11crZ91HHPSk1V9N7NdeFqHaYyf/e0Puq7leeID0ilec3O4.Stm', NULL, 1, 1, '2026-09-15 00:00:26', '2026-09-18 20:39:49', 5),
(1102102101, 4, '1064556677', 'melissasolano@sgturnos.com', 'Melissa', 'Andrea', 'Solano', 'Patiño', '$2a$12$gy/Zf/i9j3kuS3ClpMb9nuoqq62Mlmff.HwGH/fbq/ibJ4ksS6ZFy', NULL, 1, 1, '2026-09-15 00:00:27', '2026-09-18 20:39:49', 5),
(1103103101, 5, '1065667788', 'angelicaprada@sgturnos.com', 'Angelica', 'Milena', 'Prada', 'Cañón', '$2a$12$j4kezMnhHL6A5HyuzRH9me5dVgQAtQkSRQ61qVlz.ixMLkqeB2HmG', NULL, 1, 1, '2026-09-15 00:00:27', '2026-09-18 20:39:49', 5),
(1104104101, 6, '1066778899', 'jesusbeltran@sgturnos.com', 'Jesús', 'Daniel', 'Beltrán', 'Rodríguez', '$2a$12$sasqPIMXRLOIeqieG15ar.wFPRvOlUNwjTl0QMqsrj9/5QUgsQ9G.', NULL, 1, 1, '2026-09-15 00:00:28', '2026-09-18 20:39:49', 5),
(1104774847, 7, '1067889900', 'leydigodoy@sgturnos.com', 'Leydi', 'Cecilia', 'Godoy', 'Ortiz', '$2a$12$kV8rHyebd9TL0884au/eO.optpcg8LIcr7aSnQrKpiYZ6GT.PlnRW', NULL, 1, 1, '2026-09-15 00:00:28', '2026-09-18 20:39:49', 1),
(1105105104, 8, '1068990011', 'carlosrodriguez@sgturnos.com', 'Carlos', 'Andrés', 'Rodríguez', 'Ochoa', '$2a$12$zPInPqXFbWNvvVIVGNxNcOwkudbT4YNTIJLYjtCoVCmE4sDNr5Yqm', NULL, 1, 1, '2026-09-15 00:00:28', '2026-09-18 20:39:49', 5),
(1107107107, 1, '1069001122', 'jennymartinez@sgturnos.com', 'Jenny', 'Andrea', 'Martinez', 'Heredia', '$2a$12$oTKO4fppna4dhn3PQEgWwuEwYsy5TxShmgJHQzGboGXxuEizHEKZi', NULL, 1, 1, '2026-09-15 00:00:29', '2026-09-18 20:39:49', 5),
(1108108104, 2, '1070112233', 'mariabarajas@sgturnos.com', 'María', 'Camila', 'Barajas', 'López', '$2a$12$stN6Abs8aeKK8HAKnWCgXOya4HNOSbEIT4e4txw505YldYZzorFZO', NULL, 1, 1, '2026-09-15 00:00:29', '2026-09-18 20:39:49', 5),
(1109109101, 3, '1071223344', 'armandosilva@sgturnos.com', 'Armando', 'Stiven', 'Silva', 'Rodríguez', '$2a$12$UueRt/DXQLAougwUGkBY2OKW1Amz5Ftcohj9prf8KBNmRKlomk0rG', NULL, 1, 1, '2026-09-15 00:00:30', '2026-09-18 20:39:49', 5),
(1110101110, 4, '1072334455', 'monicapinilla@sgturnos.com', 'Mónica', 'Patricia', 'Pinilla', 'Castro', '$2a$12$RTVIZUK8QfdgyeTPS8uno.MDadVmygh/CjBA0oYrfJEdtXz9N7Qjy', NULL, 1, 1, '2026-09-15 00:00:30', '2026-09-18 20:39:49', 5),
(1110110111, 5, '1073445566', 'camilavergara@sgturnos.com', 'Camila', 'Andrea', 'Vergara', 'Caro', '$2a$12$VZL8je/Z4SQeItTifLI1EeDS4/HNlbibwtH2qIc4O5r0QeGD34dpe', NULL, 1, 1, '2026-09-15 00:00:31', '2026-09-18 20:39:49', 5),
(1110110112, 6, '1074556677', 'andrescastro@sgturnos.com', 'Andrés', 'Felipe', 'Castro', 'Polo', '$2a$12$RBKSYUN7wKmO36zs4Gj8RO3Xf0yGe/oyhAgwIq8vRytvXUpLAgOTK', NULL, 1, 1, '2026-09-15 00:00:31', '2026-09-18 20:39:49', 5),
(1110110113, 7, '1075667788', 'juliaaraujo@sgturnos.com', 'Julia', 'Fernanda', 'Araujo', 'Henao', '$2a$12$hHqbf412TzewJawtus/L4.M4oHnfwN2XMYgmMO0WYImIAKyfacY5i', NULL, 1, 1, '2026-09-15 00:00:32', '2026-09-18 20:39:49', 5),
(1110110114, 8, '1076778899', 'juanalopez@sgturnos.com', 'Juana', 'Carolina', 'López', 'Montes', '$2a$12$HI7QhxgFjdGRaHN1HHIgbefLtyQFDpvw6Bw7Jpzxz.PJJ4UXrifZC', NULL, 1, 1, '2026-09-15 00:00:32', '2026-09-18 20:39:49', 5),
(1110110115, 1, '1077889900', 'danielacarvajal@sgturnos.com', 'Daniela', 'Carolina', 'Carvajal', 'Rio', '$2a$12$jrm4pRbzSVLvlQI3GWHmVeHs8lWdTqWpDTgNokZLi1LofyM3MoWRy', NULL, 1, 1, '2026-09-15 00:00:32', '2026-09-18 20:39:49', 5),
(1110110116, 2, '1078990011', 'veronicacantor@sgturnos.com', 'Verónica', 'Sofia', 'Cantor', 'Jiménez', '$2a$12$.rx5NxmHBE/r.zWMfFxY4ua6o3igHFXkenoZ/RGEJlLErmZ2TBC6.', NULL, 1, 1, '2026-09-15 00:00:33', '2026-09-18 20:39:49', 5),
(1110110117, 3, '1079001122', 'carlamunoz@sgturnos.com', 'Carla', 'Antonia', 'Muñoz', 'Álvarez', '$2a$12$umcBwsYiwvbWt19NQ68tWecODYICWsJkbO.ShfxdZ11Yga308bXOO', NULL, 1, 1, '2026-09-15 00:00:33', '2026-09-18 20:39:49', 5),
(1110110118, 4, '1080112233', 'patriciapaternina@sgturnos.com', 'Patricia', NULL, 'Paternina', NULL, '$2a$12$n7n9nr7by81smb1mfMRLfeGd4pjm3wZ8eTnUR15x19tAlWxNfJx5q', NULL, 1, 1, '2026-09-15 00:00:34', '2026-09-18 20:39:49', 5),
(1110110142, 5, '1081223344', 'yajairarangel@sgturnos.com', 'Yajaira', 'Paola', 'Rangel', 'Roa', '$2a$12$XhagGbcQ2Ta9fSrGd/sYYOHMnsy3TrRkqU2YJuw7na1O7ALZS0FO2', NULL, 1, 1, '2026-09-15 00:00:34', '2026-09-18 20:39:49', 5),
(1434389742, 6, '1082334455', 'aioriadeleo@sgturnos.com', 'Aioria', 'De', 'Leo', 'Kido', '$2a$12$gnHXeTRjyWjMgJSNTjyRfeLjhW8RbUvK.bKuh/KWvkkAJR0ZrBRnS', NULL, 1, 1, '2026-09-15 00:00:35', '2026-09-18 20:39:49', 5),
(6546341122, 7, '1083445566', 'conicamelo@sgturnos.com', 'Coni', 'Luz', 'Camelo', 'Frias', '$2a$12$xBP5A2PeEGw3sBJpj0f02.qgnm7T6l6nSIM3h5gIsgQjJXLMdnjhu', NULL, 1, 1, '2026-09-15 00:00:35', '2026-09-18 20:39:49', 5),
(9686711199, 8, '1084556677', 'mirandafula@sgturnos.com', 'Miranda', 'Catrina', 'Fula', 'Cortez', '$2a$12$3umu5fJ/AOb1JxGcGIjMGO.lhhZY5CMGvayk.ztGM9utqoIgT8gES', NULL, 1, 1, '2026-09-15 00:00:36', '2026-09-18 20:39:49', 5),
(123123456321, 1, '1085667788', 'sagageminis@sgturnos.com', 'Saga', 'De', 'Geminis', 'Kido', '$2a$12$xookV9Bgu0S2rp9VfNyqMe4GHCkiH9dHj/R9/KfOTN1KokaC4tt6a', NULL, 1, 1, '2026-09-15 00:00:36', '2026-09-18 20:39:49', 5),
(123123456323, 9, '1234465468', 'talero@novatech.com', 'Nikol', 'Mariana', 'Talero', 'Paez', '$2a$12$rZrm.U55qNA.1tpQgq.nXeIELjzqtV5rMRCLBfkPkf5yodqhCpzgi', NULL, 1, 1, '2026-09-17 03:55:45', NULL, 5),
(123123456324, 11, '167674545', 'cerati@italo.com', 'Gustavo', 'Andrés', 'Cerati', 'Suarez', '$2a$12$f0wEGuYRAs.FqTcl.3Hb3OrCkwSxHdCTctznxEYAXmxwwbgWmUNpe', NULL, 1, 1, '2026-09-17 04:52:06', NULL, 5);

--
-- Disparadores `usuarios`
--
DELIMITER $$
CREATE TRIGGER `crear_empleado_al_crear_usuario` AFTER INSERT ON `usuarios` FOR EACH ROW BEGIN
  IF EXISTS (
    SELECT 1 FROM usuario_roles 
    WHERE usuario_id = NEW.id AND rol_id = 5
  ) THEN
    INSERT IGNORE INTO empleados (usuario_id, empresa_id, codigo_empleado, estado, creado_en)
    VALUES (NEW.id, NEW.empresa_id, CONCAT('EMP', NEW.empresa_id, '_', NEW.id), 'activo', NOW());
  END IF;
END
$$
DELIMITER ;

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
(192, 123123456321, 5, 'global', '2026-09-15 04:15:03'),
(194, 123123456323, 5, 'empresa', '2026-09-17 03:55:45'),
(195, 123123456324, 5, 'empresa', '2026-09-17 04:52:06');

--
-- Disparadores `usuario_roles`
--
DELIMITER $$
CREATE TRIGGER `asignar_rol_empleado_crear_empleado` AFTER INSERT ON `usuario_roles` FOR EACH ROW BEGIN
  IF NEW.rol_id = 5 THEN
    INSERT IGNORE INTO empleados (usuario_id, empresa_id, codigo_empleado, estado, creado_en)
    SELECT id, empresa_id, CONCAT('EMP', empresa_id, '_', id), 'activo', NOW()
    FROM usuarios
    WHERE id = NEW.usuario_id;
  END IF;
END
$$
DELIMITER ;

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
-- Indices de la tabla `configuraciones_malla`
--
ALTER TABLE `configuraciones_malla`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_config_nombre_empresa` (`empresa_id`,`nombre`),
  ADD KEY `idx_configuraciones_empresa` (`empresa_id`),
  ADD KEY `idx_configuraciones_activo` (`activo`),
  ADD KEY `idx_config_empresa_activa` (`empresa_id`,`activo`);

--
-- Indices de la tabla `configuraciones_malla_turnos`
--
ALTER TABLE `configuraciones_malla_turnos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_config_turno_unique` (`configuracion_id`,`plantilla_id`),
  ADD KEY `idx_config_turno_configuracion` (`configuracion_id`),
  ADD KEY `idx_config_turno_plantilla` (`plantilla_id`);

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
  ADD KEY `idx_plantillas_empresa` (`empresa_id`),
  ADD KEY `idx_personalizada` (`es_personalizada`);

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
-- Indices de la tabla `tokens_restablecimiento_contraseña`
--
ALTER TABLE `tokens_restablecimiento_contraseña`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hash_token` (`hash_token`),
  ADD KEY `idx_hash_token` (`hash_token`),
  ADD KEY `idx_expira_en` (`expira_en`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_usuario_id_legado` (`usuario_id_legado`);

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
-- AUTO_INCREMENT de la tabla `configuraciones_malla`
--
ALTER TABLE `configuraciones_malla`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `configuraciones_malla_turnos`
--
ALTER TABLE `configuraciones_malla_turnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `registros_auditoria`
--
ALTER TABLE `registros_auditoria`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
-- AUTO_INCREMENT de la tabla `tokens_restablecimiento_contraseña`
--
ALTER TABLE `tokens_restablecimiento_contraseña`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123123456325;

--
-- AUTO_INCREMENT de la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=196;

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
-- Filtros para la tabla `configuraciones_malla`
--
ALTER TABLE `configuraciones_malla`
  ADD CONSTRAINT `configuraciones_malla_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `configuraciones_malla_turnos`
--
ALTER TABLE `configuraciones_malla_turnos`
  ADD CONSTRAINT `configuraciones_malla_turnos_ibfk_1` FOREIGN KEY (`configuracion_id`) REFERENCES `configuraciones_malla` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `configuraciones_malla_turnos_ibfk_2` FOREIGN KEY (`plantilla_id`) REFERENCES `plantillas_turno` (`id`) ON DELETE CASCADE;

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
