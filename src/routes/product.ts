import { Router } from 'express';

const router = Router();

router.get('/', (req, res, _next) => {
  res.status(200).json({
    message: 'products',
  });
});

export default router;
