const PDFDocument = require("pdfkit");

const AZUL = "#2563EB";
const GRIS = "#6B7280";
const TINTA = "#1F2937";

// Arma y envía un PDF directo a la respuesta HTTP (streaming, sin guardar
// archivos temporales en disco). `dibujar` recibe el documento ya con el
// encabezado de PractiLink puesto, para que cada reporte solo se preocupe
// de su propio contenido.
function generarPDF(res, { titulo, nombreArchivo, dibujar }) {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
  doc.pipe(res);

  // Encabezado con la marca
  doc.fillColor(AZUL).fontSize(20).font("Helvetica-Bold").text("PractiLink", 40, 40);
  doc.fillColor(TINTA).fontSize(14).font("Helvetica-Bold").text(titulo, 40, 66);
  doc.fillColor(GRIS).fontSize(9).font("Helvetica")
    .text(`Generado el ${new Date().toLocaleString("es-MX")}`, 40, 86);
  doc.moveTo(40, 104).lineTo(555, 104).strokeColor("#E5E7EB").stroke();
  doc.moveDown(2);
  doc.y = 116;

  dibujar(doc);

  doc.fontSize(8).fillColor(GRIS).text(
    "© " + new Date().getFullYear() + " PractiLink. Reporte generado automáticamente.",
    40, 800, { align: "center", width: 515 }
  );

  doc.end();
}

// Tabla simple (encabezados + filas de texto), usada por varios reportes.
function dibujarTabla(doc, { columnas, filas }) {
  const inicioX = 40;
  const anchoTotal = 515;
  const anchoCol = anchoTotal / columnas.length;
  let y = doc.y + 6;

  doc.font("Helvetica-Bold").fontSize(9).fillColor(TINTA);
  columnas.forEach((col, i) => doc.text(col, inicioX + i * anchoCol, y, { width: anchoCol - 6 }));
  y += 16;
  doc.moveTo(inicioX, y).lineTo(inicioX + anchoTotal, y).strokeColor("#E5E7EB").stroke();
  y += 6;

  doc.font("Helvetica").fontSize(8.5).fillColor(TINTA);
  filas.forEach((fila) => {
    if (y > 760) { doc.addPage(); y = 50; }
    let alturaFila = 14;
    fila.forEach((celda, i) => {
      const alto = doc.heightOfString(String(celda ?? "—"), { width: anchoCol - 6 });
      alturaFila = Math.max(alturaFila, alto);
    });
    fila.forEach((celda, i) => {
      doc.text(String(celda ?? "—"), inicioX + i * anchoCol, y, { width: anchoCol - 6 });
    });
    y += alturaFila + 8;
  });
  doc.y = y;
}

module.exports = { generarPDF, dibujarTabla };
