import { Router } from 'express';

import { getRefreshToken } from '../controllers/refresh.controller';

const router = Router();

router.get('/', getRefreshToken);

export default router;
