import { Router } from 'express';

import {
  createWishlist,
  deleteWishlist,
  getWishlist,
  getWishlists,
} from '../controllers/wishlist.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getWishlists);

router.get('/:productId', authMiddleware, getWishlist);

router.post('/', authMiddleware, createWishlist);

router.delete('/:productId', authMiddleware, deleteWishlist);

export default router;
