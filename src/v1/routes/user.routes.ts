import { Router } from 'express';

import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '../controllers/user.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getUsers);
router.get('/:userId', authMiddleware, getUser);
router.put('/:userId', authMiddleware, updateUser);
router.delete('/:userId', authMiddleware, deleteUser);

export default router;
