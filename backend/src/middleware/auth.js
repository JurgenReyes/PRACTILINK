const jwt = require("jsonwebtoken");

/**
 * Verifica el JWT enviado en el header Authorization: Bearer <token>
 * y añade el payload decodificado (id_usuario, rol) a req.usuario.
 * RNF-14: autenticación basada en tokens con expiración configurable.
 */
function requiereAutenticacion(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/** Restringe el acceso a uno o varios roles: requiereRol("empresa","administrador") */
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: "No tienes permisos para esta acción" });
    }
    next();
  };
}

module.exports = { requiereAutenticacion, requiereRol };
