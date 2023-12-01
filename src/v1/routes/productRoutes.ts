import { Router } from 'express';

import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/productController';
import { validate } from '../../middleware/validation';
import { productValidation } from '../../validations/productValidation';

const router = Router();

router.get('/', getProducts);

router.get('/:productId', getProduct);

router.post('/', validate(productValidation), createProduct);

router.put('/:productId', validate(productValidation), updateProduct);

router.delete('/:productId', deleteProduct);

export default router;
