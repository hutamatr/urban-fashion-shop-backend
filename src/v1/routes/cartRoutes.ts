import { Router } from 'express';

import {
  createCart,
  deleteCart,
  getCart,
  updateCart,
} from '../controllers/cartController';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { cartValidation } from '../../validations/cartValidation';

const router = Router();

router.get('/', authMiddleware, getCart);

router.post('/', authMiddleware, validate(cartValidation), createCart);

router.put('/:productId', authMiddleware, updateCart);

router.delete('/:productId', authMiddleware, deleteCart);

export default router;
