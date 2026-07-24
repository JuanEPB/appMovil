CREATE DATABASE IF NOT EXISTS `pharmacontrol`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `pharmacontrol`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `venta_detalle`;
DROP TABLE IF EXISTS `venta`;
DROP TABLE IF EXISTS `historial_importaciones`;
DROP TABLE IF EXISTS `historial_exportacion`;
DROP TABLE IF EXISTS `medicamentos`;
DROP TABLE IF EXISTS `proveedores`;
DROP TABLE IF EXISTS `categorias`;
DROP TABLE IF EXISTS `usuarios`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `categorias` (
  `nombre` varchar(100) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `proveedores` (
  `nombre` varchar(100) NOT NULL,
  `contacto` varchar(100) NOT NULL,
  `direccion` text NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `usuarios` (
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `rol` enum('admin','usuario') NOT NULL DEFAULT 'usuario',
  `email` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_usuarios_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `medicamentos` (
  `nombre` varchar(100) NOT NULL,
  `lote` varchar(50) NOT NULL,
  `caducidad` date NOT NULL,
  `stock` int(11) NOT NULL,
  `precio` float NOT NULL,
  `proveedorId` int(11) DEFAULT NULL,
  `categoriaId` int(11) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `FK_medicamentos_proveedor` (`proveedorId`),
  KEY `FK_medicamentos_categoria` (`categoriaId`),
  CONSTRAINT `FK_medicamentos_categoria`
    FOREIGN KEY (`categoriaId`) REFERENCES `categorias` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_medicamentos_proveedor`
    FOREIGN KEY (`proveedorId`) REFERENCES `proveedores` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `venta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `total` decimal(10,2) NOT NULL,
  `usuarioId` int(11) DEFAULT NULL,
  `fecha` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_venta_usuario` (`usuarioId`),
  CONSTRAINT `FK_venta_usuario`
    FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `venta_detalle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `ventaId` int(11) DEFAULT NULL,
  `medicamentoId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_venta_detalle_venta` (`ventaId`),
  KEY `FK_venta_detalle_medicamento` (`medicamentoId`),
  CONSTRAINT `FK_venta_detalle_medicamento`
    FOREIGN KEY (`medicamentoId`) REFERENCES `medicamentos` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_venta_detalle_venta`
    FOREIGN KEY (`ventaId`) REFERENCES `venta` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `historial_exportacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `documento` text NOT NULL,
  `usuarioId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_historial_exportacion_usuario` (`usuarioId`),
  CONSTRAINT `FK_historial_exportacion_usuario`
    FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `historial_importaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `usuario_id` int(11) DEFAULT NULL,
  `medicamento_id` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `detalles` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_historial_importaciones_usuario` (`usuario_id`),
  KEY `FK_historial_importaciones_medicamento` (`medicamento_id`),
  CONSTRAINT `FK_historial_importaciones_medicamento`
    FOREIGN KEY (`medicamento_id`) REFERENCES `medicamentos` (`id`)
    ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_historial_importaciones_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
    ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categorias` (`nombre`, `id`) VALUES
('MATERIAL DE CURACION', 1),
('DROGUERIA', 2),
('GENERICO', 3),
('DERMATOLOGIA', 4),
('VITAMINAS', 5);

INSERT INTO `proveedores` (`nombre`, `contacto`, `direccion`, `id`) VALUES
('Farmacias del Ahorro', 'Telefono: 800-100-3456, Email: contacto@farmaciasdemo.com', 'Avenida Insurgentes Sur 2345, Ciudad de Mexico', 1),
('Farmacias Guadalajara', 'Telefono: 800-999-1234, Email: atencion@farmaciasg.demo', 'Calle 5 de Febrero 678, Guadalajara', 2),
('Farmacias Similares', 'Telefono: 800-777-8888, Email: contacto@similares.demo', 'Avenida Revolucion 1020, Ciudad de Mexico', 3),
('Laboratorios Pisa', 'Telefono: 55-5531-9876, Email: info@pisalabs.demo', 'Calle Montevideo 567, Ciudad de Mexico', 4),
('Sanofi Mexico', 'Telefono: 800-123-4567, Email: info@sanofi.demo', 'Paseo de la Reforma 1234, Ciudad de Mexico', 5);

INSERT INTO `usuarios` (`nombre`, `apellido`, `rol`, `email`, `contraseña`, `id`) VALUES
('Admin', 'Demo', 'admin', 'admin@pharmacontrol.demo', '$2b$10$KIXrJpD7KN4BQybMP1xav.j55cGfJBHk9GXMPMqpwcZyirPXUM9Hm', 1),
('user', 'demo', 'usuario', 'user@example.com', 'ea2e15f6537370c4e42e6f7d736efce5ddb28e08c880faff6a5d68ae34708161', 2);

INSERT INTO `medicamentos`
(`nombre`, `lote`, `caducidad`, `stock`, `precio`, `proveedorId`, `categoriaId`, `id`) VALUES
('GENOPRAZOL 20 MG CAP', '650240036415', '2026-12-31', 20, 85, 1, 3, 1),
('TABCIN NOCHE 12 CAPS', '7501008499702', '2026-12-31', 12, 65, 2, 2, 2),
('THERAFLU RESFRIADO SEVERO 10 SOBRES', '7501065000835', '2026-12-31', 5, 120, 3, 2, 3),
('JERINGA 5ML VERDE', '7501073025493', '2027-06-15', 47, 8, 1, 1, 4),
('CUBREBOCAS TRICAPA ADULTO', '1015', '2027-06-15', 248, 2.5, 1, 1, 5),
('CAFIASPIRINA 500/30MG 40TABS', '7501008433676', '2026-11-20', 43, 95, 2, 2, 6),
('CEFTRIAXONA SOL. INYECTABLE 1G', '7501349022461', '2026-08-15', 3, 150, 4, 3, 7),
('VITAMINA C 1G 20 TABS', 'VIT-2026-01', '2028-01-10', 38, 89, 5, 5, 8);

INSERT INTO `venta` (`id`, `total`, `usuarioId`, `fecha`) VALUES
(1, 300.00, 1, current_timestamp(6)),
(2, 155.00, 1, current_timestamp(6));

INSERT INTO `venta_detalle` (`id`, `cantidad`, `precioUnitario`, `ventaId`, `medicamentoId`) VALUES
(1, 2, 150.00, 1, 7),
(2, 1, 85.00, 2, 1),
(3, 1, 70.00, 2, 2);

INSERT INTO `historial_exportacion` (`fecha`, `documento`, `usuarioId`) VALUES
(current_timestamp(), 'reporte_inventario_demo.pdf', 1),
(current_timestamp(), 'venta_demo_001.json', 1);

INSERT INTO `historial_importaciones`
(`usuario_id`, `medicamento_id`, `cantidad`, `detalles`) VALUES
(1, 1, 20, 'Carga inicial demo'),
(1, 5, 248, 'Carga inicial demo');
