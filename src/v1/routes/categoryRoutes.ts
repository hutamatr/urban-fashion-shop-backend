import { Router } from 'express';

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '../controllers/categoryController';
import { validate } from '../../middleware/validation';
import { categoryValidation } from '../../validations/categoryValidation';

const router = Router();

router.get('/', getCategories);

router.get('/:categoryId', getCategory);

router.post('/', validate(categoryValidation), createCategory);

router.put('/:categoryId', validate(categoryValidation), updateCategory);

router.delete('/:categoryId', deleteCategory);

export default router;
