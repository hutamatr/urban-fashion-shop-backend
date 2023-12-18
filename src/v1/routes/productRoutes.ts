import { Router } from 'express';

import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/productController';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { productValidation } from '../../validations/productValidation';

const router = Router();

router.get('/', getProducts);

router.get('/:productId', getProduct);

router.post(
  '/',
  authMiddleware,
  validate(productValidation),

  createProduct
);

router.put(
  '/:productId',
  authMiddleware,
  validate(productValidation),
  updateProduct
);

router.delete('/:productId', authMiddleware, deleteProduct);

export default router;
