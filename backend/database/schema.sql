-- =========================================================
-- PractiLink - Esquema de base de datos MySQL 8
-- =========================================================
CREATE DATABASE IF NOT EXISTS practilink CHARACTER SET utf8mb4;
USE practilink;

CREATE TABLE usuarios (
  id_usuario        INT AUTO_INCREMENT PRIMARY KEY,
  correo            VARCHAR(150) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  rol               ENUM('estudiante','empresa','administrador') NOT NULL,
  correo_verificado BOOLEAN NOT NULL DEFAULT FALSE,
  estatus           ENUM('activo','suspendido','eliminado') NOT NULL DEFAULT 'activo',
  intentos_fallidos INT NOT NULL DEFAULT 0,
  bloqueado_hasta   DATETIME NULL,
  fecha_creacion    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Nota: universidad/carrera se guardan como texto libre en este prototipo por
-- simplicidad. RD-05 (catálogos administrables) queda documentado como mejora futura
-- en el README, para no acoplar el modelo a tablas de catálogo aún no expuestas por la API.
CREATE TABLE estudiantes (
  id_estudiante   INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL UNIQUE,
  nombre_completo VARCHAR(150) NOT NULL,
  universidad     VARCHAR(150) NULL,
  carrera         VARCHAR(150) NULL,
  semestre        INT NULL,
  promedio        DECIMAL(3,1) NULL,
  foto_url        VARCHAR(255) NULL,
  porcentaje_perfil INT NOT NULL DEFAULT 0,
  experiencia_laboral JSON NULL COMMENT 'Arreglo de {puesto, empresa, periodo, descripcion}',
  cv_url VARCHAR(255) NULL,
  cv_nombre_original VARCHAR(255) NULL,
  fecha_creacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE empresas (
  id_empresa       INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario       INT NOT NULL UNIQUE,
  nombre_empresa   VARCHAR(150) NOT NULL,
  rfc              VARCHAR(13) NOT NULL,
  giro             VARCHAR(100) NULL,
  responsable      VARCHAR(150) NULL,
  telefono         VARCHAR(20) NULL,
  logo_url         VARCHAR(255) NULL,
  estatus_validacion ENUM('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  motivo_rechazo   VARCHAR(255) NULL,
  fecha_creacion   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE administradores (
  id_admin        INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL UNIQUE,
  nombre_completo VARCHAR(150) NOT NULL,
  nivel_permiso   ENUM('superadministrador','soporte','moderador') NOT NULL DEFAULT 'soporte',
  fecha_creacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE cvs (
  id_cv            INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante    INT NOT NULL,
  url_archivo_s3   VARCHAR(255) NOT NULL,
  version          INT NOT NULL DEFAULT 1,
  estatus_analisis ENUM('pendiente','procesando','completado','error') NOT NULL DEFAULT 'pendiente',
  perfil_extraido_json JSON NULL,
  fecha_creacion   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE
);

CREATE TABLE habilidades (
  id_habilidad  INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  nombre        VARCHAR(100) NOT NULL,
  tipo          ENUM('tecnica','software','certificacion','idioma') NOT NULL,
  nivel         VARCHAR(50) NULL,
  institucion   VARCHAR(150) NULL,
  fecha         DATE NULL,
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE
);

CREATE TABLE vacantes (
  id_vacante        INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa        INT NOT NULL,
  titulo            VARCHAR(150) NOT NULL,
  area              VARCHAR(100) NULL,
  modalidad         ENUM('presencial','remoto','hibrido') NOT NULL,
  ubicacion         VARCHAR(150) NULL,
  carrera_solicitada VARCHAR(150) NULL,
  requisitos        TEXT NULL,
  horario           VARCHAR(100) NULL,
  duracion_meses    INT NULL,
  apoyo_economico   DECIMAL(10,2) NULL,
  beneficios        TEXT NULL,
  estatus           ENUM('borrador','publicada','pausada','cerrada') NOT NULL DEFAULT 'borrador',
  fecha_expiracion  DATE NULL,
  reportada         BOOLEAN NOT NULL DEFAULT FALSE,
  motivo_reporte    VARCHAR(255) NULL,
  fecha_creacion    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE
);

CREATE TABLE postulaciones (
  id_postulacion    INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante     INT NOT NULL,
  id_vacante        INT NOT NULL,
  estatus           ENUM('en_revision','evaluacion_pendiente','entrevista_programada','aceptado','rechazado') NOT NULL DEFAULT 'en_revision',
  matching_score    DECIMAL(5,2) NULL,
  notas_internas    TEXT NULL,
  fecha_entrevista  DATETIME NULL,
  modalidad_entrevista ENUM('presencial','videollamada') NULL,
  enlace_videollamada VARCHAR(255) NULL,
  notas_entrevista  VARCHAR(255) NULL,
  entrevista_confirmada BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_postulacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unico_estudiante_vacante (id_estudiante, id_vacante),
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
  FOREIGN KEY (id_vacante) REFERENCES vacantes(id_vacante) ON DELETE RESTRICT
);

CREATE TABLE examenes (
  id_examen      INT AUTO_INCREMENT PRIMARY KEY,
  id_postulacion INT NOT NULL,
  tipo           ENUM('tecnico','no_tecnico') NOT NULL,
  tiempo_limite_min INT NOT NULL DEFAULT 30,
  finalizado     BOOLEAN NOT NULL DEFAULT FALSE,
  preguntas_json JSON NOT NULL,
  respuestas_json JSON NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_postulacion) REFERENCES postulaciones(id_postulacion) ON DELETE CASCADE
);

CREATE TABLE resultados_examen (
  id_resultado   INT AUTO_INCREMENT PRIMARY KEY,
  id_examen      INT NOT NULL UNIQUE,
  puntaje_global DECIMAL(5,2) NOT NULL,
  fortalezas     TEXT NULL,
  areas_mejora   TEXT NULL,
  nivel_compatibilidad VARCHAR(50) NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_examen) REFERENCES examenes(id_examen) ON DELETE CASCADE
);

CREATE TABLE notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  tipo            VARCHAR(50) NOT NULL,
  mensaje         VARCHAR(255) NOT NULL,
  leido           BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_creacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE mensajes (
  id_mensaje         INT AUTO_INCREMENT PRIMARY KEY,
  id_postulacion     INT NOT NULL,
  id_usuario_emisor  INT NOT NULL,
  contenido          TEXT NOT NULL,
  fecha_creacion     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_postulacion) REFERENCES postulaciones(id_postulacion) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario_emisor) REFERENCES usuarios(id_usuario)
);

CREATE TABLE bitacora_auditoria (
  id_log         INT AUTO_INCREMENT PRIMARY KEY,
  id_admin       INT NOT NULL,
  accion         VARCHAR(150) NOT NULL,
  detalle        TEXT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_admin) REFERENCES administradores(id_admin)
);

CREATE INDEX idx_vacantes_busqueda ON vacantes (modalidad, estatus, ubicacion);
CREATE INDEX idx_postulaciones_estatus ON postulaciones (estatus);

-- RD-05: catálogos administrables (universidades, carreras) - gestionados por el admin (RF-A18)
CREATE TABLE catalogo_universidades (
  id_universidad INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE catalogo_carreras (
  id_carrera INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE
);

-- RF-A12: parámetros configurables del módulo de IA (clave/valor simple)
CREATE TABLE configuracion_ia (
  clave VARCHAR(100) PRIMARY KEY,
  valor VARCHAR(255) NOT NULL,
  descripcion VARCHAR(255) NULL,
  fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO configuracion_ia (clave, valor, descripcion) VALUES
('peso_carrera', '30', 'Puntos otorgados si la carrera del estudiante coincide con la solicitada'),
('peso_promedio', '20', 'Puntos máximos otorgados según el promedio académico'),
('puntaje_base', '50', 'Puntaje base de matching antes de aplicar ponderaciones'),
('dificultad_examenes', 'media', 'Nivel de dificultad de los exámenes generados (baja/media/alta)');

-- RF-E32: vacantes guardadas como favoritas por el estudiante
CREATE TABLE favoritos (
  id_favorito   INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  id_vacante    INT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unico_favorito (id_estudiante, id_vacante),
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
  FOREIGN KEY (id_vacante) REFERENCES vacantes(id_vacante) ON DELETE CASCADE
);

-- RF-A22: avisos generales visibles para estudiantes y/o empresas
CREATE TABLE avisos (
  id_aviso INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  dirigido_a ENUM('todos','estudiantes','empresas') NOT NULL DEFAULT 'todos',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plantillas_correo (
  clave VARCHAR(60) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  asunto VARCHAR(200) NOT NULL,
  cuerpo TEXT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
