/**
 * Envuelve un handler async de Express para reenviar cualquier rechazo de
 * promesa al middleware de errores (`next(err)`). Sin esto, un error dentro
 * de un handler `async` (una consulta fallida, un campo inesperado, etc.)
 * queda como "unhandled rejection" y tira todo el proceso de Node en vez de
 * devolver un 500 solo a esa petición.
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Envuelve un Router de Express para que TODOS los handlers registrados con
 * get/post/put/delete/patch pasen automáticamente por asyncHandler, sin
 * tener que acordarse de aplicarlo manualmente en cada ruta.
 */
function wrapRouter(router) {
  for (const metodo of ["get", "post", "put", "delete", "patch"]) {
    const original = router[metodo].bind(router);
    router[metodo] = (path, ...handlers) =>
      original(path, ...handlers.map((h) => (typeof h === "function" ? asyncHandler(h) : h)));
  }
  return router;
}

module.exports = { asyncHandler, wrapRouter };
