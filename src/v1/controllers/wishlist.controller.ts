import { NextFunction, Request, Response } from 'express';

import Product from '../models/product.model';
import Wishlist from '../models/wishlist.model';
import { CustomError } from '../../utils/custom-error';
import errorHandler from '../../utils/error-handler';

interface IRequestBody {
  product_id: number;
}

/**
 * The function `getWishlists` retrieves wishlists associated with a user and includes the products in
 * each wishlist.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status,
 * headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function getWishlistsByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    const wishlists = await Wishlist.findAll({
      where: { user_id: userId },
      paranoid: false,
      include: [
        {
          model: Product,
          attributes: [
            'id',
            'title',
            'description',
            'image_url',
            'price',
            'discount_percentage',
            'discounted_price',
            'stock_quantity',
            'category_id',
            'created_at',
            'updated_at',
            'deleted_at',
          ],
          paranoid: false,
        },
      ],
    });

    if (!wishlists) {
      const error = new CustomError(
        404,
        'Failed to get wishlist, wishlist not found!'
      );
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Wishlists retrieved successfully',
      wishlists: wishlists,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get wishlist, try again later!', next);
  }
}

/**
 * The function `getWishlist` retrieves a wishlist item for a specific product and user, and returns it
 * as a JSON response.
 * @param {Request} req - The `req` parameter is the request object, which contains information about
 * the HTTP request made by the client.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status
 * code, headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function getWishlist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.productId;
    const userId = req.userId;

    const wishlist = await Wishlist.findOne({
      where: { product_id: productId, user_id: userId },
      include: [
        {
          model: Product,
          attributes: [
            'id',
            'title',
            'description',
            'image_url',
            'price',
            'discount_percentage',
            'discounted_price',
          ],
        },
      ],
    });

    if (!wishlist) {
      const error = new CustomError(404, 'Wishlist not found!');
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Wishlist retrieved successfully',
      wishlist: wishlist,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to create wishlist, try again later!', next);
  }
}

/**
 * The function `createWishlist` creates a new wishlist for a user with a specified product, and
 * returns the created wishlist with product details.
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server.
 * It contains information such as the request method, headers, query parameters, and body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It is responsible for setting the status code, headers, and sending the
 * response body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function createWishlist(
  req: Request<object, object, IRequestBody, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const productId = req.body.product_id;

    const wishlist = await Wishlist.findOne({
      where: { product_id: productId, user_id: userId },
    });

    if (wishlist) {
      const error = new CustomError(422, 'Wishlist already exists!');
      throw error;
    }

    const createdWishlist = await Wishlist.create({
      user_id: userId as number,
      product_id: productId,
    });

    if (!createdWishlist) {
      const error = new CustomError(422, 'Failed to create wishlist!');
      throw error;
    }

    const wishlistData = await Wishlist.findOne({
      where: { id: createdWishlist.dataValues.id },
      include: [
        {
          model: Product,
          attributes: [
            'id',
            'title',
            'description',
            'image_url',
            'price',
            'discount_percentage',
            'discounted_price',
          ],
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      message: 'Create wishlist successfully!',
      wishlist: wishlistData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to create wishlist, try again later!', next);
  }
}

/**
 * The function `deleteWishlist` is an asynchronous function that deletes a wishlist item based on the
 * user ID and product ID provided in the request parameters.
 * @param {Request} req - The `req` parameter is the request object that contains information about the
 * HTTP request made by the client. It includes properties such as headers, query parameters, request
 * body, and user authentication details.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It contains methods and properties for setting the response status, headers, and
 * body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function deleteWishlist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const productId = req.params.productId;

    const deletedWishlist = await Wishlist.destroy({
      where: { user_id: userId, product_id: productId },
    });

    if (deletedWishlist <= 0) {
      const error = new CustomError(
        404,
        'Failed to delete wishlist, wishlist not found!'
      );
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Delete wishlist successfully!',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to delete wishlist, try again later!', next);
  }
}
