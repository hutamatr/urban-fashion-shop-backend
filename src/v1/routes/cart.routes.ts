import { Router } from 'express';

import {
  createCart,
  deleteCart,
  getCartsByUser,
  updateCart,
} from '../controllers/cart.controller';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { cartValidation } from '../../validations/cart.validation';

const router = Router();

router.get('/', authMiddleware, getCartsByUser);

router.post('/', authMiddleware, validate(cartValidation), createCart);

router.put('/:productId', authMiddleware, updateCart);

router.delete('/:productId', authMiddleware, deleteCart);

export default router;
