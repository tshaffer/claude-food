import { Router, type IRouter } from 'express';
import { UserModel } from '../models/User.js';
import type { CreateUserRequest } from '@claude-food/domain';

const router: IRouter = Router();

// GET /api/users
router.get('/', async (_req, res) => {
  const users = await UserModel.find().sort({ name: 1 }).lean();
  res.json(users.map(u => ({ id: u._id, name: u.name })));
});

// POST /api/users
router.post('/', async (req, res) => {
  const { name } = req.body as CreateUserRequest;
  const existing = await UserModel.findOne({ name });
  if (existing) {
    res.status(409).json({ error: 'Username already exists' });
    return;
  }
  const user = await UserModel.create({ name });
  res.status(201).json({ id: user._id, name: user.name });
});

export default router;
