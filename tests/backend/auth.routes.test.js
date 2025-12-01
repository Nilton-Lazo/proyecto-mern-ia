// tests/backend/auth.routes.test.js
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

// Mock SOLO del modelo User
jest.mock('../../src/backend/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

const User = require('../../src/backend/models/User');
const authRouter = require('../../src/backend/routes/auth');

// --- App Express solo con /api/auth --- //
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

let hashValido;

beforeAll(async () => {
  // Hash real de la contraseña "password-valida"
  hashValido = await bcrypt.hash('password-valida', 10);
});

describe('Rutas /api/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- REGISTER ---------- //
  describe('POST /api/auth/register', () => {
    test('registra usuario nuevo', async () => {
      User.findOne.mockResolvedValue(null); // no existe aún
      User.create.mockResolvedValue({
        _id: 'u1',
        nombres: 'Joel',
        role: 'student',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Joel',
          apellidos: 'Lazo',
          centroEstudios: 'UC',
          email: 'joel@gmail.com',
          password: 'password-valida',
          role: 'student',
        });

      expect(res.status).toBe(200);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'joel@gmail.com' });
      expect(User.create).toHaveBeenCalled();
      expect(res.body).toEqual(
        expect.objectContaining({
          ok: true,
          user: expect.objectContaining({
            id: 'u1',
            nombres: 'Joel',
            role: 'student',
          }),
        }),
      );
    });

    test('retorna 400 si el correo ya existe', async () => {
      User.findOne.mockResolvedValue({ _id: 'u1' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Joel',
          apellidos: 'Lazo',
          centroEstudios: 'UC',
          email: 'joel@gmail.com',
          password: 'password-valida',
          role: 'student',
        });

      expect(res.status).toBe(400);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'joel@gmail.com' });
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  // ---------- LOGIN ---------- //
  describe('POST /api/auth/login', () => {
    test('login correcto devuelve token y user', async () => {
      const fakeUser = {
        _id: 'u1',
        email: 'joel@gmail.com',
        passwordHash: hashValido,   // hash real de "password-valida"
        role: 'teacher',
        nombres: 'Joel',
        apellidos: 'Lazo',
      };
      User.findOne.mockResolvedValue(fakeUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joel@gmail.com',
          password: 'password-valida',
        });

      expect(res.status).toBe(200);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'joel@gmail.com' });

      // No nos casamos con el valor exacto del token, solo con que exista
      expect(res.body.ok).toBe(true);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user).toEqual(
        expect.objectContaining({
          id: 'u1',
          nombres: 'Joel',
          apellidos: 'Lazo',
          role: 'teacher',
        }),
      );
    });

    test('404 si el usuario no existe', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'no@existe.com',
          password: 'password-valida',
        });

      expect(res.status).toBe(404);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'no@existe.com' });
    });

    test('401 si la contraseña es incorrecta', async () => {
      const fakeUser = {
        _id: 'u1',
        email: 'joel@gmail.com',
        passwordHash: hashValido,
        role: 'teacher',
      };
      User.findOne.mockResolvedValue(fakeUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joel@gmail.com',
          password: 'otra-cosa',
        });

      expect(res.status).toBe(401);
    });
  });
});