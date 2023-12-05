import { Router } from 'express';

import { createRole, getRoles } from '../controllers/roleController';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getRoles);

router.post('/', authMiddleware, createRole);

export default router;
