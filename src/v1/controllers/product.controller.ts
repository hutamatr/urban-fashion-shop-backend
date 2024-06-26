import { NextFunction, Request, Response } from 'express';

import Category from '../models/category.model';
import Product from '../models/product.model';
import {
  deleteImageFromStorage,
  imageUpload,
} from '../../database/firebase.storage';
import { firebaseStorageFolderEnv } from '../../utils/constants';
import { CustomError } from '../../utils/custom-error';
import errorHandler from '../../utils/error-handler';

interface IRequestParams {
  productId: string;
}

interface IRequestBody {
  title: string;
  description: string;
  price: string;
  stock_quantity: string;
  discount_percentage: string;
  category_id: string;
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

    if (limit > 0 && skip >= 0) {
      products = await Product.findAll({
        offset: skip,
        limit: limit,
        include: [
          {
            model: Category,
            attributes: ['id', 'category_name'],
          },
        ],
      });
    } else {
      products = await Product.findAll({
        include: [
          {
            model: Category,
            attributes: ['id', 'category_name'],
          },
        ],
      });
    }

    if (!products) {
      const error = new CustomError(422, 'Failed to get products!');
      throw error;
    }

    const total = await Product.count();

    res.status(200).json({
      status: 'success',
      message: 'Products retrieved successfully',
      products,
      total,
      skip,
      limit: products?.length,
    });
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
      const error = new CustomError(
        404,
        'Failed to get product, product not found!'
      );
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Product retrieved successfully',
      product,
    });
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
    const price = Number(req.body.price);
    const stockQuantity = Number(req.body.stock_quantity);
    const discountPercentage = Number(req.body.discount_percentage);
    const categoryId = Number(req.body.category_id);
    const file = req.file;
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
      const error = new CustomError(401, 'Not authorized!');
      throw error;
    }

    if (!file) {
      const error = new CustomError(422, 'Image is required!');
      throw error;
    }

    const findCategory = await Category.findOne({ where: { id: categoryId } });

    if (!findCategory) {
      const error = new CustomError(
        404,
        'Failed to post product, category not found!'
      );
      throw error;
    }

    const discountedPrice = price - price * (discountPercentage / 100);

    const { downloadURL } = await imageUpload(
      file,
      firebaseStorageFolderEnv() as string
    );

    const createdProduct = await Product.create({
      title,
      description,
      price,
      image_url: downloadURL,
      discount_percentage: discountPercentage,
      discounted_price: discountedPrice,
      stock_quantity: stockQuantity,
      category_id: findCategory.dataValues.id,
    });

    if (!createdProduct) {
      const error = new CustomError(422, 'Failed to post product!');
      throw error;
    }

    res.status(201).json({
      status: 'success',
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
    const price = Number(req.body.price);
    const discountPercentage = Number(req.body.discount_percentage);
    const stockQuantity = Number(req.body.stock_quantity);
    const file = req.file;
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
      const error = new CustomError(401, 'Not authorized!');
      throw error;
    }

    const product = await Product.findOne({ where: { id: productId } });

    if (!product) {
      const error = new CustomError(
        404,
        'Failed to get product, product not found!'
      );
      throw error;
    }

    const discountedPrice = price - price * (discountPercentage / 100);

    if (!file) {
      product.set({
        title,
        description,
        price,
        discount_percentage: discountPercentage,
        discounted_price: discountedPrice,
        stock_quantity: stockQuantity,
      });
    } else {
      const { downloadURL } = await imageUpload(
        file,
        firebaseStorageFolderEnv() as string
      );

      product.set({
        title,
        description,
        price,
        discount_percentage: discountPercentage,
        discounted_price: discountedPrice,
        stock_quantity: stockQuantity,
        image_url: downloadURL,
      });
    }

    const updatedProduct = await product.save();

    if (!updatedProduct) {
      const error = new CustomError(422, 'Failed to updated product');
      throw error;
    }

    res.status(201).json({
      status: 'success',
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
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.productId;
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
      const error = new CustomError(401, 'Not authorized!');
      throw error;
    }

    const product = await Product.findOne({ where: { id: productId } });

    await deleteImageFromStorage(
      product?.dataValues.image_url as string,
      firebaseStorageFolderEnv() as string
    );

    const deletedProduct = await Product.destroy({ where: { id: productId } });

    if (deletedProduct <= 0) {
      const error = new CustomError(
        404,
        'Failed to delete product, product not found!'
      );
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Delete product successfully!',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to delete product, try again later!', next);
  }
}
