const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB

async function extractTextFromPdf(buffer) {
  if (!buffer || !buffer.length) {
    throw new Error('El archivo PDF está vacío.');
  }
  if (buffer.length > MAX_PDF_BYTES) {
    throw new Error('El PDF supera el tamaño máximo permitido (5 MB).');
  }

  let pdfParse;
  try {
    pdfParse = require('pdf-parse');
  } catch {
    throw new Error('El servidor no tiene habilitada la extracción de PDF. Contacta al administrador.');
  }

  const data = await pdfParse(buffer);
  const text = (data.text || '').replace(/\s+/g, ' ').trim();

  if (!text || text.length < 30) {
    throw new Error(
      'No se pudo extraer texto del PDF. Puede estar protegido, ser solo imágenes o estar vacío. Pega el texto manualmente.'
    );
  }

  return {
    text,
    pages: data.numpages || 1,
    charCount: text.length,
  };
}

module.exports = { extractTextFromPdf, MAX_PDF_BYTES };
