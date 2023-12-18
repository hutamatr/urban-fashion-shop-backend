import { Router } from 'express';

import { getRefreshToken } from '../controllers/refreshController';

const router = Router();

router.get('/', getRefreshToken);

export default router;
