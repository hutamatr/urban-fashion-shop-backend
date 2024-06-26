import { NextFunction, Request, Response } from 'express';

import Category from '../models/category.model';
import { CustomError } from '../../utils/custom-error';
import errorHandler from '../../utils/error-handler';

interface IRequestBody {
  category_name: string;
}
interface IRequestQuery {
  limit: string;
  skip: string;
}

/**
 * The function `getCategories` retrieves a list of categories and sends it as a JSON response,
 * handling any errors that occur.
 * @param {Request} _req - The `_req` parameter is of type `Request` and represents the HTTP request
 * object. It contains information about the incoming request such as headers, query parameters, and
 * request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status
 * code, headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function getCategories(
  req: Request<object, object, object, IRequestQuery>,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = +req.query.limit;
    const skip = +req.query.skip || 0;
    let categories;

    if (limit > 0 && skip >= 0) {
      categories = await Category.findAll({
        offset: skip,
        limit: limit,
      });
    } else {
      categories = await Category.findAll();
    }

    if (!categories) {
      const error = new CustomError(422, 'Failed to get categories!');
      throw error;
    }

    const total = await Category.count();

    res.status(200).json({
      status: 'success',
      message: 'Categories fetched successfully',
      categories,
      total,
      skip,
      limit: categories?.length,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get categories, try again later!', next);
  }
}

/**
 * The function `getCategory` retrieves a category based on the provided category ID and sends it as a
 * JSON response, or throws an error if the category is not found.
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server.
 * It contains information such as the request method, headers, query parameters, request body, and
 * route parameters.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status
 * code, headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function getCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryId = req.params.categoryId;

    const category = await Category.findOne({ where: { id: categoryId } });

    if (!category) {
      const error = new CustomError(
        422,
        'Failed to get category, category not found!'
      );
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Category fetched successfully',
      category,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get category, try again later!', next);
  }
}

/**
 * The function `createCategory` creates a new category with the provided name and returns a success
 * message along with the created category data, or throws an error if the category creation fails.
 * @param req - The `req` parameter is an object representing the HTTP request made to the server. It
 * contains information such as the request method, headers, query parameters, and body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status
 * code, headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function createCategory(
  req: Request<object, object, IRequestBody, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryName = req.body.category_name;
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
      const error = new CustomError(401, 'Not authorized!');
      throw error;
    }

    const createdCategory = await Category.create({
      category_name: categoryName,
    });

    if (!createdCategory) {
      const error = new CustomError(422, 'Failed to create category!');
      throw error;
    }

    res.status(201).json({
      status: 'success',
      message: 'Create category successfully!',
      category: createdCategory.dataValues,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to create category, try again later!', next);
  }
}

/**
 * The function `updateCategory` updates a category's name and last updated timestamp in a database and
 * returns a success message with the updated category.
 * @param {Request} req - The `req` parameter is the request object that contains information about the
 * HTTP request made by the client. It includes properties such as the request headers, request body,
 * request method, request URL, etc.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status,
 * headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryName = req.body.category_name;
    const categoryId = req.params.categoryId;
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
      const error = new CustomError(401, 'Not authorized!');
      throw error;
    }

    const category = await Category.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      const error = new CustomError(
        404,
        'Failed to update category, category not found!'
      );
      throw error;
    }

    category.set({
      category_name: categoryName,
    });

    const updatedCategory = await category.save();

    if (!updatedCategory) {
      const error = new CustomError(422, 'Failed to update category!');
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Update category successfully!',
      category: updatedCategory,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to update category, try again later!', next);
  }
}

/**
 * The function `deleteCategory` is an asynchronous function that deletes a category based on the
 * provided category ID and returns a success message if the deletion is successful.
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server.
 * It contains information such as the request method, request headers, request body, and request
 * parameters.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status
 * code, headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categoryId = req.params.categoryId;
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
      const error = new CustomError(401, 'Not authorized!');
      throw error;
    }

    const deletedCategory = await Category.destroy({
      where: { id: categoryId },
    });

    if (deletedCategory <= 0) {
      const error = new CustomError(
        404,
        'Failed to delete category, category not found!'
      );
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Delete category successfully!',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to delete category, try again later!', next);
  }
}
