-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: practilink
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administradores`
--

DROP TABLE IF EXISTS `administradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administradores` (
  `id_admin` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `nivel_permiso` enum('superadministrador','soporte','moderador') NOT NULL DEFAULT 'soporte',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_admin`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `administradores_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administradores`
--

LOCK TABLES `administradores` WRITE;
/*!40000 ALTER TABLE `administradores` DISABLE KEYS */;
INSERT INTO `administradores` VALUES (1,9,'Admin Principal','superadministrador','2026-07-07 16:49:13');
/*!40000 ALTER TABLE `administradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avisos`
--

DROP TABLE IF EXISTS `avisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos` (
  `id_aviso` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `dirigido_a` enum('todos','estudiantes','empresas') NOT NULL DEFAULT 'todos',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_aviso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avisos`
--

LOCK TABLES `avisos` WRITE;
/*!40000 ALTER TABLE `avisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `avisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bitacora_auditoria`
--

DROP TABLE IF EXISTS `bitacora_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora_auditoria` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `id_admin` int NOT NULL,
  `accion` varchar(150) NOT NULL,
  `detalle` text,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `id_admin` (`id_admin`),
  CONSTRAINT `bitacora_auditoria_ibfk_1` FOREIGN KEY (`id_admin`) REFERENCES `administradores` (`id_admin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora_auditoria`
--

LOCK TABLES `bitacora_auditoria` WRITE;
/*!40000 ALTER TABLE `bitacora_auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `bitacora_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogo_carreras`
--

DROP TABLE IF EXISTS `catalogo_carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogo_carreras` (
  `id_carrera` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  PRIMARY KEY (`id_carrera`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogo_carreras`
--

LOCK TABLES `catalogo_carreras` WRITE;
/*!40000 ALTER TABLE `catalogo_carreras` DISABLE KEYS */;
/*!40000 ALTER TABLE `catalogo_carreras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogo_universidades`
--

DROP TABLE IF EXISTS `catalogo_universidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogo_universidades` (
  `id_universidad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  PRIMARY KEY (`id_universidad`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogo_universidades`
--

LOCK TABLES `catalogo_universidades` WRITE;
/*!40000 ALTER TABLE `catalogo_universidades` DISABLE KEYS */;
/*!40000 ALTER TABLE `catalogo_universidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_ia`
--

DROP TABLE IF EXISTS `configuracion_ia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_ia` (
  `clave` varchar(100) NOT NULL,
  `valor` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_ia`
--

LOCK TABLES `configuracion_ia` WRITE;
/*!40000 ALTER TABLE `configuracion_ia` DISABLE KEYS */;
INSERT INTO `configuracion_ia` VALUES ('dificultad_examenes','media','Nivel de dificultad de los exámenes generados (baja/media/alta)','2026-07-07 16:48:12'),('peso_carrera','30','Puntos otorgados si la carrera del estudiante coincide con la solicitada','2026-07-07 16:48:12'),('peso_promedio','20','Puntos máximos otorgados según el promedio académico','2026-07-07 16:48:12'),('puntaje_base','50','Puntaje base de matching antes de aplicar ponderaciones','2026-07-07 16:48:12');
/*!40000 ALTER TABLE `configuracion_ia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cvs`
--

DROP TABLE IF EXISTS `cvs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cvs` (
  `id_cv` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `url_archivo_s3` varchar(255) NOT NULL,
  `version` int NOT NULL DEFAULT '1',
  `estatus_analisis` enum('pendiente','procesando','completado','error') NOT NULL DEFAULT 'pendiente',
  `perfil_extraido_json` json DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cv`),
  KEY `id_estudiante` (`id_estudiante`),
  CONSTRAINT `cvs_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cvs`
--

LOCK TABLES `cvs` WRITE;
/*!40000 ALTER TABLE `cvs` DISABLE KEYS */;
/*!40000 ALTER TABLE `cvs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresas`
--

DROP TABLE IF EXISTS `empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresas` (
  `id_empresa` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `nombre_empresa` varchar(150) NOT NULL,
  `rfc` varchar(13) NOT NULL,
  `giro` varchar(100) DEFAULT NULL,
  `responsable` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `estatus_validacion` enum('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  `motivo_rechazo` varchar(255) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_empresa`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `empresas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresas`
--

LOCK TABLES `empresas` WRITE;
/*!40000 ALTER TABLE `empresas` DISABLE KEYS */;
INSERT INTO `empresas` VALUES (1,1,'Tech Solutions','TSO900101AB1','Tecnología','Carlos Mendoza','5511122233','aprobada',NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(2,2,'DataCorp','DCO910202CD2','Análisis de datos','Fernanda Ruiz','3312233445','aprobada',NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(3,3,'SoftQuality','SQU920303EF3','Aseguramiento de calidad de software','Roberto Salas','5544433221','aprobada',NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(4,4,'InnovaTX','INN930404GH4','Marketing digital','Paola Ibarra','5566677788','pendiente',NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12');
/*!40000 ALTER TABLE `empresas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiantes`
--

DROP TABLE IF EXISTS `estudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiantes` (
  `id_estudiante` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `universidad` varchar(150) DEFAULT NULL,
  `carrera` varchar(150) DEFAULT NULL,
  `semestre` int DEFAULT NULL,
  `promedio` decimal(3,1) DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `porcentaje_perfil` int NOT NULL DEFAULT '0',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estudiante`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `estudiantes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes`
--

LOCK TABLES `estudiantes` WRITE;
/*!40000 ALTER TABLE `estudiantes` DISABLE KEYS */;
INSERT INTO `estudiantes` VALUES (1,5,'José Martínez','Universidad Tecnológica','Ingeniería en Desarrollo de Software',8,9.2,NULL,90,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(2,6,'María González','Universidad Autónoma','Ingeniería en Sistemas',7,8.8,NULL,85,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(3,7,'Luis Ramírez','Tecnológico de Monterrey','Ingeniería en Tecnologías de la Información',6,8.1,NULL,70,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(4,8,'Andrea López','UNAM','Ingeniería en Computación',9,9.5,NULL,95,'2026-07-07 16:48:12','2026-07-07 16:48:12');
/*!40000 ALTER TABLE `estudiantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examenes`
--

DROP TABLE IF EXISTS `examenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examenes` (
  `id_examen` int NOT NULL AUTO_INCREMENT,
  `id_postulacion` int NOT NULL,
  `tipo` enum('tecnico','no_tecnico') NOT NULL,
  `tiempo_limite_min` int NOT NULL DEFAULT '30',
  `finalizado` tinyint(1) NOT NULL DEFAULT '0',
  `preguntas_json` json NOT NULL,
  `respuestas_json` json DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_examen`),
  KEY `id_postulacion` (`id_postulacion`),
  CONSTRAINT `examenes_ibfk_1` FOREIGN KEY (`id_postulacion`) REFERENCES `postulaciones` (`id_postulacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examenes`
--

LOCK TABLES `examenes` WRITE;
/*!40000 ALTER TABLE `examenes` DISABLE KEYS */;
/*!40000 ALTER TABLE `examenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoritos`
--

DROP TABLE IF EXISTS `favoritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoritos` (
  `id_favorito` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_vacante` int NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_favorito`),
  UNIQUE KEY `unico_favorito` (`id_estudiante`,`id_vacante`),
  KEY `id_vacante` (`id_vacante`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE,
  CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`id_vacante`) REFERENCES `vacantes` (`id_vacante`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritos`
--

LOCK TABLES `favoritos` WRITE;
/*!40000 ALTER TABLE `favoritos` DISABLE KEYS */;
/*!40000 ALTER TABLE `favoritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `habilidades`
--

DROP TABLE IF EXISTS `habilidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `habilidades` (
  `id_habilidad` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('tecnica','software','certificacion','idioma') NOT NULL,
  `nivel` varchar(50) DEFAULT NULL,
  `institucion` varchar(150) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  PRIMARY KEY (`id_habilidad`),
  KEY `id_estudiante` (`id_estudiante`),
  CONSTRAINT `habilidades_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `habilidades`
--

LOCK TABLES `habilidades` WRITE;
/*!40000 ALTER TABLE `habilidades` DISABLE KEYS */;
INSERT INTO `habilidades` VALUES (1,1,'Python','tecnica',NULL,NULL,NULL),(2,1,'JavaScript','tecnica',NULL,NULL,NULL),(3,1,'React','tecnica',NULL,NULL,NULL),(4,1,'SQL','tecnica',NULL,NULL,NULL),(5,1,'Inglés','idioma','avanzado',NULL,NULL);
/*!40000 ALTER TABLE `habilidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes`
--

DROP TABLE IF EXISTS `mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes` (
  `id_mensaje` int NOT NULL AUTO_INCREMENT,
  `id_postulacion` int NOT NULL,
  `id_usuario_emisor` int NOT NULL,
  `contenido` text NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_mensaje`),
  KEY `id_postulacion` (`id_postulacion`),
  KEY `id_usuario_emisor` (`id_usuario_emisor`),
  CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`id_postulacion`) REFERENCES `postulaciones` (`id_postulacion`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`id_usuario_emisor`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes`
--

LOCK TABLES `mensajes` WRITE;
/*!40000 ALTER TABLE `mensajes` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `mensaje` varchar(255) NOT NULL,
  `leido` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postulaciones`
--

DROP TABLE IF EXISTS `postulaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postulaciones` (
  `id_postulacion` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_vacante` int NOT NULL,
  `estatus` enum('en_revision','evaluacion_pendiente','entrevista_programada','aceptado','rechazado') NOT NULL DEFAULT 'en_revision',
  `matching_score` decimal(5,2) DEFAULT NULL,
  `notas_internas` text,
  `fecha_entrevista` datetime DEFAULT NULL,
  `modalidad_entrevista` enum('presencial','videollamada') DEFAULT NULL,
  `notas_entrevista` varchar(255) DEFAULT NULL,
  `entrevista_confirmada` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_postulacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_postulacion`),
  UNIQUE KEY `unico_estudiante_vacante` (`id_estudiante`,`id_vacante`),
  KEY `id_vacante` (`id_vacante`),
  KEY `idx_postulaciones_estatus` (`estatus`),
  CONSTRAINT `postulaciones_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE CASCADE,
  CONSTRAINT `postulaciones_ibfk_2` FOREIGN KEY (`id_vacante`) REFERENCES `vacantes` (`id_vacante`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postulaciones`
--

LOCK TABLES `postulaciones` WRITE;
/*!40000 ALTER TABLE `postulaciones` DISABLE KEYS */;
INSERT INTO `postulaciones` VALUES (1,1,1,'entrevista_programada',92.00,NULL,NULL,NULL,NULL,0,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(2,2,2,'evaluacion_pendiente',85.00,NULL,NULL,NULL,NULL,0,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(3,3,3,'en_revision',78.00,NULL,NULL,NULL,NULL,0,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(4,4,1,'aceptado',91.00,NULL,NULL,NULL,NULL,0,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(5,2,1,'rechazado',60.00,NULL,NULL,NULL,NULL,0,'2026-07-07 16:48:12','2026-07-07 16:48:12');
/*!40000 ALTER TABLE `postulaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resultados_examen`
--

DROP TABLE IF EXISTS `resultados_examen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultados_examen` (
  `id_resultado` int NOT NULL AUTO_INCREMENT,
  `id_examen` int NOT NULL,
  `puntaje_global` decimal(5,2) NOT NULL,
  `fortalezas` text,
  `areas_mejora` text,
  `nivel_compatibilidad` varchar(50) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_resultado`),
  UNIQUE KEY `id_examen` (`id_examen`),
  CONSTRAINT `resultados_examen_ibfk_1` FOREIGN KEY (`id_examen`) REFERENCES `examenes` (`id_examen`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultados_examen`
--

LOCK TABLES `resultados_examen` WRITE;
/*!40000 ALTER TABLE `resultados_examen` DISABLE KEYS */;
/*!40000 ALTER TABLE `resultados_examen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `correo` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('estudiante','empresa','administrador') NOT NULL,
  `correo_verificado` tinyint(1) NOT NULL DEFAULT '0',
  `estatus` enum('activo','suspendido','eliminado') NOT NULL DEFAULT 'activo',
  `intentos_fallidos` int NOT NULL DEFAULT '0',
  `bloqueado_hasta` datetime DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'contacto@techsolutions.com','$2a$10$rGxWbgF1BQj4DfSZYaU3tO4MoUdI06hRr/B9s4G7nk8y7oW/Manl2','empresa',1,'activo',0,NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(2,'rh@datacorp.mx','$2a$10$rGxWbgF1BQj4DfSZYaU3tO4MoUdI06hRr/B9s4G7nk8y7oW/Manl2','empresa',1,'activo',0,NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(3,'reclutamiento@softquality.com','$2a$10$rGxWbgF1BQj4DfSZYaU3tO4MoUdI06hRr/B9s4G7nk8y7oW/Manl2','empresa',1,'activo',0,NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(4,'contacto@innovatx.com','$2a$10$rGxWbgF1BQj4DfSZYaU3tO4MoUdI06hRr/B9s4G7nk8y7oW/Manl2','empresa',1,'activo',0,NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(5,'jose.martinez@alumnos.mx','$2a$10$rGxWbgF1BQj4DfSZYaU3tO4MoUdI06hRr/B9s4G7nk8y7oW/Manl2','estudiante',1,'activo',0,NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(6,'maria.gonzalez@alumnos.mx','$2a$10$rGxWbgF1BQj4DfSZYaU3tO4MoUdI06hRr/B9s4G7nk8y7oW/Manl2','estudiante',1,'activo',0,NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(7,'luis.ramirez@alumnos.mx','$2a$10$rGxWbgF1BQj4DfSZYaU3tO4MoUdI06hRr/B9s4G7nk8y7oW/Manl2','estudiante',1,'activo',0,NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(8,'andrea.lopez@alumnos.mx','$2a$10$rGxWbgF1BQj4DfSZYaU3tO4MoUdI06hRr/B9s4G7nk8y7oW/Manl2','estudiante',1,'activo',0,NULL,'2026-07-07 16:48:12','2026-07-07 16:48:12'),(9,'admin@practilink.com','$2a$10$.ts8KcKCTmTfMFaDlfjxjOU3tZI3V0IoRZIYkHF6ZbOTJF8kljZMm','administrador',1,'activo',0,NULL,'2026-07-07 16:49:13','2026-07-07 16:49:13');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacantes`
--

DROP TABLE IF EXISTS `vacantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacantes` (
  `id_vacante` int NOT NULL AUTO_INCREMENT,
  `id_empresa` int NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `area` varchar(100) DEFAULT NULL,
  `modalidad` enum('presencial','remoto','hibrido') NOT NULL,
  `ubicacion` varchar(150) DEFAULT NULL,
  `carrera_solicitada` varchar(150) DEFAULT NULL,
  `requisitos` text,
  `horario` varchar(100) DEFAULT NULL,
  `duracion_meses` int DEFAULT NULL,
  `apoyo_economico` decimal(10,2) DEFAULT NULL,
  `beneficios` text,
  `estatus` enum('borrador','publicada','pausada','cerrada') NOT NULL DEFAULT 'borrador',
  `fecha_expiracion` date DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_vacante`),
  KEY `id_empresa` (`id_empresa`),
  KEY `idx_vacantes_busqueda` (`modalidad`,`estatus`,`ubicacion`),
  CONSTRAINT `vacantes_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacantes`
--

LOCK TABLES `vacantes` WRITE;
/*!40000 ALTER TABLE `vacantes` DISABLE KEYS */;
INSERT INTO `vacantes` VALUES (1,1,'Desarrollador Frontend - Prácticas','Tecnología','presencial','Monterrey, N.L.','Ingeniería en Sistemas','Conocimientos de HTML, CSS, JavaScript y React. Ganas de aprender y trabajar en equipo.','Lunes a viernes 9:00-14:00',6,4000.00,'Seguro médico, horario flexible, posibilidad de contratación','publicada','2026-09-05','2026-07-07 16:48:12','2026-07-07 16:48:12'),(2,2,'Analista de Datos - Estadía','Datos','hibrido','Guadalajara, Jal.','Ingeniería en Sistemas','Conocimientos de SQL, Excel avanzado y nociones de Python. Pensamiento analítico.','Lunes a viernes 10:00-15:00',4,5000.00,'Vales de despensa, capacitación constante','publicada','2026-08-21','2026-07-07 16:48:12','2026-07-07 16:48:12'),(3,3,'QA Tester - Residencia','Calidad de software','presencial','CDMX','Ingeniería en Sistemas','Atención al detalle, conocimientos básicos de pruebas de software y control de versiones (Git).','Lunes a viernes 9:00-17:00',6,6000.00,'Comedor, transporte, seguro médico','publicada','2026-08-06','2026-07-07 16:48:12','2026-07-07 16:48:12'),(4,1,'Soporte Técnico TI - Prácticas','Tecnología','remoto','Remoto','Ingeniería en Sistemas','Conocimientos básicos de redes y sistemas operativos Windows/Linux.','Lunes a viernes 8:00-13:00',3,3000.00,'Horario flexible, 100% remoto','publicada','2026-08-16','2026-07-07 16:48:12','2026-07-07 16:48:12'),(5,2,'Científico de Datos Jr. - Egresados','Datos','hibrido','Guadalajara, Jal.','Ingeniería en Sistemas','Recién egresado con conocimientos de Python, pandas y machine learning básico.','Lunes a viernes 9:00-18:00',NULL,12000.00,'Prestaciones de ley, seguro de gastos médicos mayores','publicada','2026-10-05','2026-07-07 16:48:12','2026-07-07 16:48:12');
/*!40000 ALTER TABLE `vacantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'practilink'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-07 17:18:08
