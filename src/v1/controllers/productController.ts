import { NextFunction, Request, Response } from 'express';

import Product from '../models/productModel';
import { IError } from '../../middleware/error';
import errorHandler from '../../utils/error-handler';

interface RequestParams {
  productId: string;
}

// interface ResponseBody {}

interface RequestBody {
  title: string;
  description: string;
  price: number;
  quantity: number;
}

interface RequestQuery {
  limit: string;
  skip: string;
}

/**
 * The function `getProducts` retrieves a list of products with pagination support and returns the
 * products, total count, skip value, and limit value in the response.
 * @param req - The `req` parameter is an object representing the HTTP request. It contains information
 * such as the request method, headers, query parameters, and body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It is responsible for setting the status code, headers, and sending the
 * response body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function getProducts(
  req: Request<object, object, object, RequestQuery>,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = +req.query.limit;
    const skip = +req.query.skip || 0;
    let products: unknown[];

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
 * The function `getProduct` retrieves a product from the database based on the provided product ID and
 * returns it as a JSON response, or throws an error if the product is not found.
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server.
 * It contains information such as the request method, headers, query parameters, request body, and
 * route parameters.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It is responsible for setting the status code, headers, and sending the
 * response body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function getProduct(
  req: Request<RequestParams, object, object, object>,
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
 * The function `postProduct` is an asynchronous function that handles the creation of a new product by
 * extracting the necessary data from the request body, creating a new product using the extracted
 * data, and sending a response with the created product if successful.
 * @param req - The `req` parameter is an object representing the HTTP request made to the server. It
 * contains information such as the request headers, request body, request method, and request URL.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It is responsible for setting the status code, headers, and sending the
 * response body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function postProduct(
  req: Request<object, object, RequestBody, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const quantity = req.body.quantity;

    const createdProduct = await Product.create({
      title,
      description,
      price,
      quantity,
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
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server.
 * It contains information such as the request method, request headers, request parameters, and request
 * body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It is responsible for setting the status code, headers, and sending the
 * response body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function updateProduct(
  req: Request<RequestParams, object, RequestBody, object>,
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
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server.
 * It contains information such as the request method, request headers, request parameters, and request
 * body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status
 * code, headers, and body. In this code, `res.status(200)` is used to set the response status code to
 * 200
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function deleteProduct(
  req: Request<RequestParams, object, RequestBody, object>,
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
