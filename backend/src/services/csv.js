// Genera un CSV a partir de un arreglo de filas y lo envía como descarga.
// Se le antepone el BOM de UTF-8 (\uFEFF) porque Excel, si no lo encuentra,
// asume la codificación local de Windows y rompe los acentos/ñ (se ve como
// "sÃ­" en vez de "sí").
function enviarCSV(res, { filas, nombreArchivo }) {
  const csv = filas.map((fila) => fila.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=${nombreArchivo}`);
  return res.send("\uFEFF" + csv);
}

module.exports = { enviarCSV };
