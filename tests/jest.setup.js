jest.mock('ollama', () => ({
        Ollama: jest.fn().mockImplementation(() => ({
        generate: jest.fn(async () => ({ response: 'mock' }))
    }))
}), { virtual: true });

// ===== MOCK ROBUSTO DE PDFKIT =====
// Garantiza que la respuesta HTTP se cierre y Supertest termine el request.
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => {
    let resRef = null;

    function safe(fn) {
      try { fn(); } catch (_) {}
    }

    const api = {
      pipe: jest.fn((res) => {
        resRef = res;
      }),
      text: jest.fn().mockReturnThis(),
      fillColor: jest.fn().mockReturnThis(),
      fontSize: jest.fn().mockReturnThis(),
      list: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      moveTo: jest.fn().mockReturnThis(),
      lineTo: jest.fn().mockReturnThis(),
      strokeColor: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      addPage: jest.fn().mockReturnThis(),
      end: jest.fn(() => {
        if (!resRef) return;
        // Asegura headers y cuerpo antes de cerrar
        safe(() => resRef.flushHeaders && resRef.flushHeaders());
        safe(() => resRef.write && resRef.write('MOCK_PDF'));
        safe(() => resRef.end && resRef.end());
      })
    };

    return api;
  });
}, { virtual: true });


// ===== MOCK GLOBAL PARA MONGOOSE =====
jest.mock('mongoose', () => ({
  Schema: class MockSchema {},
  model: jest.fn().mockImplementation(() => ({})),
  models: {},
  modelNames: jest.fn(),
  connect: jest.fn(),
  connection: { on: jest.fn() }
}), { virtual: true });
