import { Router } from 'express';

import {
  createWishlist,
  deleteWishlist,
  getWishlist,
  getWishlistsByUser,
} from '../controllers/wishlist.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/:userId', authMiddleware, getWishlistsByUser);

router.get('/:productId', authMiddleware, getWishlist);

router.post('/', authMiddleware, createWishlist);

router.delete('/:productId', authMiddleware, deleteWishlist);

export default router;
