const { Router } = require('express');
const UserService = require('../services/userService');

const router = Router();

router.get('/', async (_req, res) => {
  const users = await UserService.getAll();
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const user = await UserService.getById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
});

module.exports = router;