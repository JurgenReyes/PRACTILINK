FROM mysql:8.0

# La base ya viene con esquema + datos de ejemplo + cuenta admin.
# El contenedor oficial de MySQL ejecuta automáticamente cualquier
# script .sql colocado aquí, pero solo la PRIMERA vez que se crea
# el volumen de datos (si el volumen ya existe, no se re-ejecuta).
COPY practilink_dump_completo.sql /docker-entrypoint-initdb.d/01-practilink.sql
