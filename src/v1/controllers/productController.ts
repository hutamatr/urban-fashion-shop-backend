import { NextFunction, Request, Response } from 'express';

import Category from '../models/categoryModel';
import Product from '../models/productModel';
import { IError } from '../../middleware/error';
import errorHandler from '../../utils/errorHandler';

interface IRequestParams {
  productId: string;
}

interface IRequestBody {
  title: string;
  description: string;
  price: number;
  quantity: number;
  category_id: number;
}

interface IRequestQuery {
  limit: string;
  skip: string;
}

/**
 * The function `getProducts` retrieves a list of products with pagination support and returns the
 * products, total count, skip value, and limit value in the response.
 */
export async function getProducts(
  req: Request<object, object, object, IRequestQuery>,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = +req.query.limit;
    const skip = +req.query.skip || 0;
    let products;

    if (limit > 0 && skip > 0) {
      products = await Product.findAll({
        offset: skip,
        limit: limit,
      });
    } else {
      products = await Product.findAll();
    }

    if (!products) {
      const error: IError = new Error('Failed to get products!');
      error.statusCode = 422;
      throw error;
    }

    const total = await Product.count();

    res.status(200).json({ products, total, skip, limit: products?.length });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get products list, try again later!', next);
  }
}

/**
 * The function `getProduct` retrieves a product from the database based on the provided product ID * and returns it as a JSON response, or throws an error if the product is not found.
 */
export async function getProduct(
  req: Request<IRequestParams, object, object, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.productId;

    const product = await Product.findOne({ where: { id: productId } });

    if (!product) {
      const error: IError = new Error(
        'Failed to get product, product not found!'
      );
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({ product });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get product, try again later!', next);
  }
}

/**
 * The function `postProduct` is an asynchronous function that handles the creation of a
 * new product by extracting the necessary data from the request body, creating a new product using
 * the extracted data, and sending a response with the created product if successful.
 */
export async function createProduct(
  req: Request<object, object, IRequestBody, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const quantity = req.body.quantity;
    const categoryId = req.body.category_id;

    const findCategory = await Category.findOne({ where: { id: categoryId } });

    if (!findCategory) {
      const error: IError = new Error(
        'Failed to post product, category not found!'
      );
      error.statusCode = 422;
      throw error;
    }

    const createdProduct = await Product.create({
      title,
      description,
      price,
      quantity,
      category_id: findCategory.dataValues.id,
    });

    if (!createdProduct) {
      const error: IError = new Error('Failed to post product!');
      error.statusCode = 422;
      throw error;
    }

    res.status(201).json({
      message: 'Create product successfully!',
      product: createdProduct.dataValues,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to post new product, try again later!', next);
  }
}

/**
 * The function `updateProduct` updates a product in a database based on the provided request
 * parameters and body, and returns a response with the updated product.
 */
export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.productId;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const quantity = req.body.quantity;
    const updatedAt = new Date().toISOString();

    const product = await Product.findOne({ where: { id: productId } });

    if (!product) {
      const error: IError = new Error(
        'Failed to get product, product not found!'
      );
      error.statusCode = 404;
      throw error;
    }

    product.set({
      title,
      description,
      price,
      quantity,
      updated_at: updatedAt,
    });

    const updatedProduct = await product.save();

    if (!updatedProduct) {
      const error: IError = new Error('Failed to updated product');
      error.statusCode = 422;
      throw error;
    }

    res.status(201).json({
      message: 'Update product successfully!',
      product: updatedProduct,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to update product, try again later!', next);
  }
}

/**
 * The `deleteProduct` function is an asynchronous function that deletes a product from the database
 * and returns a success message if the deletion is successful.
 */
export async function deleteProduct(
  req: Request<IRequestParams, object, object, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.productId;

    const deletedProduct = await Product.destroy({ where: { id: productId } });

    if (deletedProduct <= 0) {
      const error: IError = new Error(
        'Failed to delete product, product not found!'
      );
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: 'Delete product successfully!',
      deleted: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to delete product, try again later!', next);
  }
}
