import { Router } from 'express';

import {
  deleteProduct,
  getProduct,
  getProducts,
  postProduct,
  updateProduct,
} from '../controllers/productController';

const router = Router();

router.get('/', getProducts);

router.get('/:productId', getProduct);

router.post('/', postProduct);

router.put('/:productId', updateProduct);

router.delete('/:productId', deleteProduct);

export default router;
