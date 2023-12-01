import { NextFunction, Request, Response } from 'express';

import Category from '../models/categoryModel';
import { IError } from '../../middleware/error';
import errorHandler from '../../utils/errorHandler';

interface IRequestParams {
  categoryId: string;
}

interface IRequestBody {
  name: string;
}

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = await Category.findAll();

    if (!categories) {
      const error: IError = new Error('Failed to get categories!');
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({ categories });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get categories, try again later!', next);
  }
}

export async function getCategory(
  req: Request<IRequestParams, object, object, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryId = req.params.categoryId;

    const category = await Category.findOne({ where: { id: categoryId } });

    if (!category) {
      const error: IError = new Error(
        'Failed to get category, category not found!'
      );
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({ category });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get category, try again later!', next);
  }
}

export async function createCategory(
  req: Request<object, object, IRequestBody, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryName = req.body.name;

    const createdCategory = await Category.create({
      name: categoryName,
    });

    if (!createdCategory) {
      const error: IError = new Error('Failed to create category!');
      error.statusCode = 422;
      throw error;
    }

    res.status(201).json({
      message: 'Create category successfully!',
      category: createdCategory.dataValues,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to create category, try again later!', next);
  }
}

export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryName = req.body.name;
    const categoryId = req.params.categoryId;
    const updatedAt = new Date().toISOString();

    const category = await Category.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      const error: IError = new Error(
        'Failed to update category, category not found!'
      );
      error.statusCode = 422;
      throw error;
    }

    category.set({
      name: categoryName,
      updated_at: updatedAt,
    });

    const updatedCategory = await category.save();

    if (!updatedCategory) {
      const error: IError = new Error('Failed to update category!');
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({
      message: 'Update category successfully!',
      category: updatedCategory,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to update category, try again later!', next);
  }
}

export async function deleteCategory(
  req: Request<IRequestParams, object, object, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryId = req.params.categoryId;

    const deletedCategory = await Category.destroy({
      where: { id: categoryId },
    });

    if (deletedCategory <= 0) {
      const error: IError = new Error(
        'Failed to delete category, category not found!'
      );
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: 'Delete category successfully!',
      deleted: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to delete category, try again later!', next);
  }
}
