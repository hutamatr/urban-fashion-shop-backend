import { Router } from 'express';

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '../controllers/category.controller';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import { categoryValidation } from '../../validations/category.validation';

const router = Router();

router.get('/', getCategories);

router.get('/:categoryId', getCategory);

router.post('/', authMiddleware, validate(categoryValidation), createCategory);

router.put(
  '/:categoryId',
  authMiddleware,
  validate(categoryValidation),
  updateCategory
);

router.delete('/:categoryId', authMiddleware, deleteCategory);

export default router;
