const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB

function normalizeText(raw) {
  return (raw || '').replace(/\s+/g, ' ').trim();
}

function validateExtractedText(text) {
  if (!text || text.length < 30) {
    throw new Error(
      'No se pudo extraer texto del PDF. Puede estar protegido, ser solo imágenes o estar vacío. Pega el texto manualmente.'
    );
  }
}

/** pdf-parse v2.x — API basada en clase PDFParse */
async function extractWithV2(buffer) {
  const { PDFParse } = require('pdf-parse');
  if (!PDFParse) return null;

  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = normalizeText(result?.text);
    validateExtractedText(text);
    return {
      text,
      pages: result?.total || 1,
      charCount: text.length,
    };
  } finally {
    await parser.destroy().catch(() => {});
  }
}

/** pdf-parse v1.x — API: pdfParse(buffer) => { text, numpages } */
async function extractWithV1(buffer) {
  const mod = require('pdf-parse');
  const pdfParse = typeof mod === 'function' ? mod : mod.default;
  if (typeof pdfParse !== 'function') {
    throw new Error('No se pudo inicializar la extracción de PDF.');
  }

  const data = await pdfParse(buffer);
  const text = normalizeText(data.text);
  validateExtractedText(text);
  return {
    text,
    pages: data.numpages || 1,
    charCount: text.length,
  };
}

async function extractTextFromPdf(buffer) {
  if (!buffer || !buffer.length) {
    throw new Error('El archivo PDF está vacío.');
  }
  if (buffer.length > MAX_PDF_BYTES) {
    throw new Error('El PDF supera el tamaño máximo permitido (5 MB).');
  }

  try {
    require('pdf-parse');
  } catch {
    throw new Error('El servidor no tiene habilitada la extracción de PDF. Contacta al administrador.');
  }

  try {
    const v2 = await extractWithV2(buffer);
    if (v2) return v2;
    return await extractWithV1(buffer);
  } catch (err) {
    if (err.message?.includes('No se pudo extraer') || err.message?.includes('vacío') || err.message?.includes('5 MB')) {
      throw err;
    }
    throw new Error(err.message || 'No se pudo procesar el PDF.');
  }
}

module.exports = { extractTextFromPdf, MAX_PDF_BYTES };
