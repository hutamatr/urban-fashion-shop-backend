import { NextFunction, Request, Response } from 'express';

import Product from '../models/productModel';
import Wishlist from '../models/wishlistModel';
import { IError } from '../../middleware/error';
import errorHandler from '../../utils/errorHandler';

interface IRequestBody {
  product_id: number;
}

export async function getWishlists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    const wishlists = await Wishlist.findAll({
      where: { user_id: userId },
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

    if (!wishlists) {
      const error: IError = new Error(
        'Failed to get wishlist, wishlist not found!'
      );
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({ wishlists: wishlists });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get wishlist, try again later!', next);
  }
}

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
      const error: IError = new Error('Wishlist not found!');
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({ wishlist: wishlist });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to create wishlist, try again later!', next);
  }
}

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
      const error: IError = new Error('Wishlist already exists!');
      error.statusCode = 422;
      throw error;
    }

    const createdWishlist = await Wishlist.create({
      user_id: userId as number,
      product_id: productId,
    });

    if (!createdWishlist) {
      const error: IError = new Error('Failed to create wishlist!');
      error.statusCode = 422;
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
      message: 'Create wishlist successfully!',
      wishlist: wishlistData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to create wishlist, try again later!', next);
  }
}

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
      const error: IError = new Error(
        'Failed to delete wishlist, wishlist not found!'
      );
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({
      message: 'Delete wishlist successfully!',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to delete wishlist, try again later!', next);
  }
}
