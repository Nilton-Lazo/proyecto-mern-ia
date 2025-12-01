// tests/backend/auth.middleware.test.js

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const auth = require('../../src/backend/middlewares/auth');

// helper de respuesta mock
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('middleware auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secreto-test';
  });

  test('responde 401 si no hay Authorization', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'No autorizado' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('responde 401 si el token es inválido (jwt.verify lanza error)', async () => {
    const req = {
      headers: { authorization: 'Bearer token-malo' },
    };
    const res = mockRes();
    const next = jest.fn();

    // simulamos que jwt.verify falla
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token inválido' }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});