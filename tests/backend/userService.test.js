// ejemplo directo del servicio sin mocks externos
const UserService = require('../../src/backend/services/userService');

describe('userService', () => {
  test('getAll devuelve lista', async () => {
    const users = await UserService.getAll();
    expect(Array.isArray(users)).toBe(true);
    expect(users[0]).toHaveProperty('id');
  });

  test('getById devuelve usuario por id', async () => {
    const user = await UserService.getById(1);
    expect(user).toEqual(expect.objectContaining({ id: 1 }));
  });

  test('getById undefined si no existe', async () => {
    const user = await UserService.getById(999);
    expect(user).toBeUndefined();
  });
});