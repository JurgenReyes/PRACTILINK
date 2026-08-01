-- =========================================================
-- PractiLink - Datos de ejemplo (seed)
-- Contraseña para TODAS las cuentas de ejemplo: Demo1234!
-- =========================================================
SET SQL_SAFE_UPDATES = 0;
USE practilink;

-- Limpieza (permite correr este script varias veces sin duplicar)
DELETE FROM postulaciones;
DELETE FROM vacantes;
DELETE FROM habilidades;
DELETE FROM estudiantes;
DELETE FROM empresas;
DELETE FROM usuarios WHERE correo IN (
  'contacto@techsolutions.com','rh@datacorp.mx','reclutamiento@softquality.com','contacto@innovatx.com',
  'jose.martinez@alumnos.mx','maria.gonzalez@alumnos.mx','luis.ramirez@alumnos.mx','andrea.lopez@alumnos.mx'
);

-- Hash bcrypt de la contraseña "Demo1234!" para todas las cuentas de ejemplo
SET @hash = '$2a$10$rGxWbgF1BQj4DfSZYaU3tO4MoUdI06hRr/B9s4G7nk8y7oW/Manl2';

-- =========================================================
-- EMPRESAS (ya validadas/aprobadas, listas para publicar vacantes)
-- =========================================================
INSERT INTO usuarios (correo, password_hash, rol, correo_verificado, fecha_creacion, fecha_modificacion)
VALUES ('contacto@techsolutions.com', @hash, 'empresa', true, NOW(), NOW());
SET @u_tech = LAST_INSERT_ID();
INSERT INTO empresas (id_usuario, nombre_empresa, rfc, giro, responsable, telefono, estatus_validacion, fecha_creacion, fecha_modificacion)
VALUES (@u_tech, 'Tech Solutions', 'TSO900101AB1', 'Tecnología', 'Carlos Mendoza', '5511122233', 'aprobada', NOW(), NOW());
SET @emp_tech = LAST_INSERT_ID();

INSERT INTO usuarios (correo, password_hash, rol, correo_verificado, fecha_creacion, fecha_modificacion)
VALUES ('rh@datacorp.mx', @hash, 'empresa', true, NOW(), NOW());
SET @u_data = LAST_INSERT_ID();
INSERT INTO empresas (id_usuario, nombre_empresa, rfc, giro, responsable, telefono, estatus_validacion, fecha_creacion, fecha_modificacion)
VALUES (@u_data, 'DataCorp', 'DCO910202CD2', 'Análisis de datos', 'Fernanda Ruiz', '3312233445', 'aprobada', NOW(), NOW());
SET @emp_data = LAST_INSERT_ID();

INSERT INTO usuarios (correo, password_hash, rol, correo_verificado, fecha_creacion, fecha_modificacion)
VALUES ('reclutamiento@softquality.com', @hash, 'empresa', true, NOW(), NOW());
SET @u_soft = LAST_INSERT_ID();
INSERT INTO empresas (id_usuario, nombre_empresa, rfc, giro, responsable, telefono, estatus_validacion, fecha_creacion, fecha_modificacion)
VALUES (@u_soft, 'SoftQuality', 'SQU920303EF3', 'Aseguramiento de calidad de software', 'Roberto Salas', '5544433221', 'aprobada', NOW(), NOW());
SET @emp_soft = LAST_INSERT_ID();

-- Una empresa aún pendiente de validación (para probar el panel de administrador)
INSERT INTO usuarios (correo, password_hash, rol, correo_verificado, fecha_creacion, fecha_modificacion)
VALUES ('contacto@innovatx.com', @hash, 'empresa', true, NOW(), NOW());
INSERT INTO empresas (id_usuario, nombre_empresa, rfc, giro, responsable, telefono, estatus_validacion, fecha_creacion, fecha_modificacion)
VALUES (LAST_INSERT_ID(), 'InnovaTX', 'INN930404GH4', 'Marketing digital', 'Paola Ibarra', '5566677788', 'pendiente', NOW(), NOW());

-- =========================================================
-- VACANTES
-- =========================================================
INSERT INTO vacantes (id_empresa, titulo, area, modalidad, ubicacion, carrera_solicitada, requisitos, horario, duracion_meses, apoyo_economico, beneficios, estatus, fecha_expiracion, fecha_creacion, fecha_modificacion)
VALUES
(@emp_tech, 'Desarrollador Frontend - Prácticas', 'Tecnología', 'presencial', 'Monterrey, N.L.', 'Ingeniería en Sistemas',
 'Conocimientos de HTML, CSS, JavaScript y React. Ganas de aprender y trabajar en equipo.', 'Lunes a viernes 9:00-14:00', 6, 4000.00,
 'Seguro médico, horario flexible, posibilidad de contratación', 'publicada', DATE_ADD(CURDATE(), INTERVAL 60 DAY), NOW(), NOW()),

(@emp_data, 'Analista de Datos - Estadía', 'Datos', 'hibrido', 'Guadalajara, Jal.', 'Ingeniería en Sistemas',
 'Conocimientos de SQL, Excel avanzado y nociones de Python. Pensamiento analítico.', 'Lunes a viernes 10:00-15:00', 4, 5000.00,
 'Vales de despensa, capacitación constante', 'publicada', DATE_ADD(CURDATE(), INTERVAL 45 DAY), NOW(), NOW()),

(@emp_soft, 'QA Tester - Residencia', 'Calidad de software', 'presencial', 'CDMX', 'Ingeniería en Sistemas',
 'Atención al detalle, conocimientos básicos de pruebas de software y control de versiones (Git).', 'Lunes a viernes 9:00-17:00', 6, 6000.00,
 'Comedor, transporte, seguro médico', 'publicada', DATE_ADD(CURDATE(), INTERVAL 30 DAY), NOW(), NOW()),

(@emp_tech, 'Soporte Técnico TI - Prácticas', 'Tecnología', 'remoto', 'Remoto', 'Ingeniería en Sistemas',
 'Conocimientos básicos de redes y sistemas operativos Windows/Linux.', 'Lunes a viernes 8:00-13:00', 3, 3000.00,
 'Horario flexible, 100% remoto', 'publicada', DATE_ADD(CURDATE(), INTERVAL 40 DAY), NOW(), NOW()),

(@emp_data, 'Científico de Datos Jr. - Egresados', 'Datos', 'hibrido', 'Guadalajara, Jal.', 'Ingeniería en Sistemas',
 'Recién egresado con conocimientos de Python, pandas y machine learning básico.', 'Lunes a viernes 9:00-18:00', NULL, 12000.00,
 'Prestaciones de ley, seguro de gastos médicos mayores', 'publicada', DATE_ADD(CURDATE(), INTERVAL 90 DAY), NOW(), NOW());

-- =========================================================
-- ESTUDIANTES
-- =========================================================
INSERT INTO usuarios (correo, password_hash, rol, correo_verificado, fecha_creacion, fecha_modificacion)
VALUES ('jose.martinez@alumnos.mx', @hash, 'estudiante', true, NOW(), NOW());
SET @u_jose = LAST_INSERT_ID();
INSERT INTO estudiantes (id_usuario, nombre_completo, universidad, carrera, semestre, promedio, porcentaje_perfil, fecha_creacion, fecha_modificacion)
VALUES (@u_jose, 'José Martínez', 'Universidad Tecnológica', 'Ingeniería en Desarrollo de Software', 8, 9.2, 90, NOW(), NOW());
SET @est_jose = LAST_INSERT_ID();
INSERT INTO habilidades (id_estudiante, nombre, tipo, nivel, institucion, fecha) VALUES
(@est_jose, 'Python', 'tecnica', NULL, NULL, NULL),
(@est_jose, 'JavaScript', 'tecnica', NULL, NULL, NULL),
(@est_jose, 'React', 'tecnica', NULL, NULL, NULL),
(@est_jose, 'SQL', 'tecnica', NULL, NULL, NULL),
(@est_jose, 'Inglés', 'idioma', 'avanzado', NULL, NULL);

INSERT INTO usuarios (correo, password_hash, rol, correo_verificado, fecha_creacion, fecha_modificacion)
VALUES ('maria.gonzalez@alumnos.mx', @hash, 'estudiante', true, NOW(), NOW());
SET @u_maria = LAST_INSERT_ID();
INSERT INTO estudiantes (id_usuario, nombre_completo, universidad, carrera, semestre, promedio, porcentaje_perfil, fecha_creacion, fecha_modificacion)
VALUES (@u_maria, 'María González', 'Universidad Autónoma', 'Ingeniería en Sistemas', 7, 8.8, 85, NOW(), NOW());
SET @est_maria = LAST_INSERT_ID();

INSERT INTO usuarios (correo, password_hash, rol, correo_verificado, fecha_creacion, fecha_modificacion)
VALUES ('luis.ramirez@alumnos.mx', @hash, 'estudiante', true, NOW(), NOW());
SET @u_luis = LAST_INSERT_ID();
INSERT INTO estudiantes (id_usuario, nombre_completo, universidad, carrera, semestre, promedio, porcentaje_perfil, fecha_creacion, fecha_modificacion)
VALUES (@u_luis, 'Luis Ramírez', 'Tecnológico de Monterrey', 'Ingeniería en Tecnologías de la Información', 6, 8.1, 70, NOW(), NOW());
SET @est_luis = LAST_INSERT_ID();

INSERT INTO usuarios (correo, password_hash, rol, correo_verificado, fecha_creacion, fecha_modificacion)
VALUES ('andrea.lopez@alumnos.mx', @hash, 'estudiante', true, NOW(), NOW());
SET @u_andrea = LAST_INSERT_ID();
INSERT INTO estudiantes (id_usuario, nombre_completo, universidad, carrera, semestre, promedio, porcentaje_perfil, fecha_creacion, fecha_modificacion)
VALUES (@u_andrea, 'Andrea López', 'UNAM', 'Ingeniería en Computación', 9, 9.5, 95, NOW(), NOW());
SET @est_andrea = LAST_INSERT_ID();

-- =========================================================
-- POSTULACIONES (para ver estatus distintos y matching en el dashboard)
-- =========================================================
SET @vac_frontend = (SELECT id_vacante FROM vacantes WHERE titulo = 'Desarrollador Frontend - Prácticas' LIMIT 1);
SET @vac_datos    = (SELECT id_vacante FROM vacantes WHERE titulo = 'Analista de Datos - Estadía' LIMIT 1);
SET @vac_qa       = (SELECT id_vacante FROM vacantes WHERE titulo = 'QA Tester - Residencia' LIMIT 1);

INSERT INTO postulaciones (id_estudiante, id_vacante, estatus, matching_score, fecha_postulacion, fecha_modificacion) VALUES
(@est_maria,  @vac_datos,    'evaluacion_pendiente',  85.00, NOW(), NOW()),
(@est_luis,   @vac_qa,       'en_revision',           78.00, NOW(), NOW()),
(@est_andrea, @vac_frontend, 'aceptado',               91.00, NOW(), NOW()),
(@est_maria,  @vac_frontend, 'rechazado',              60.00, NOW(), NOW());

-- Postulación de José con entrevista ya programada, para ver el calendario
-- de /entrevistas con datos de ejemplo.
INSERT INTO postulaciones
  (id_estudiante, id_vacante, estatus, matching_score, fecha_entrevista, modalidad_entrevista, enlace_videollamada, notas_entrevista, entrevista_confirmada, fecha_postulacion, fecha_modificacion)
VALUES
  (@est_jose, @vac_frontend, 'entrevista_programada', 92.00,
   DATE_ADD(NOW(), INTERVAL 3 DAY), 'videollamada', 'https://meet.google.com/practilink-demo',
   'Trae ejemplos de proyectos en React.', false, NOW(), NOW());

SELECT 'Datos de ejemplo insertados correctamente' AS resultado;
