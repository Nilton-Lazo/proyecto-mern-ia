const request = require('supertest');
const app = require('../../src/backend/app');
const UserService = require('../../src/backend/services/userService');

// Mock del servicio
jest.mock('../../src/backend/services/userService');

describe('API /api/users', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/users devuelve todos', async () => {
    const fakeUsers = [{ id: 1, name: 'Daniel' }, { id: 2, name: 'María' }];
    UserService.getAll.mockResolvedValue(fakeUsers);

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeUsers);
    expect(UserService.getAll).toHaveBeenCalledTimes(1);
  });

  test('GET /api/users/:id devuelve por id', async () => {
    const fakeUser = { id: 1, name: 'Daniel' };
    UserService.getById.mockResolvedValue(fakeUser);

    const res = await request(app).get('/api/users/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeUser);
    expect(UserService.getById).toHaveBeenCalledWith('1');
  });

  test('GET /api/users/:id -> 404 si no existe', async () => {
    UserService.getById.mockResolvedValue(undefined);

    const res = await request(app).get('/api/users/99');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Usuario no encontrado' });
  });
});