/**
 * Protege endpoints internos usados por n8n.
 * Header requerido: x-n8n-api-key
 */
function n8nApiKeyRequired(req, res, next) {
  const expected = process.env.N8N_INTERNAL_API_KEY;
  if (!expected || expected === 'change_me') {
    return res.status(503).json({
      error: 'Automatización n8n no configurada. Define N8N_INTERNAL_API_KEY en .env',
    });
  }
  const provided = req.headers['x-n8n-api-key'];
  if (!provided || provided !== expected) {
    console.warn('API key inválida');
    return res.status(401).json({ error: 'API key inválida o ausente' });
  }
  next();
}

module.exports = n8nApiKeyRequired;
