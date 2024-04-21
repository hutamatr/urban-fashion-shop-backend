import { NextFunction, Request, Response } from 'express';

import Cart from '../models/cart.model';
import CartItem from '../models/cart-item.model';
import Product from '../models/product.model';
import errorHandler from '../../utils/error-handler';

interface IRequestBody {
  product_id: number;
  quantity: number;
  price: number;
}

/**
 * The getCarts function retrieves the carts associated with a user, including the products in each
 * cart, and returns them as a response.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It contains methods and properties for manipulating the response, such as
 * setting the status code, headers, and sending the response body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function getCartByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params?.userId;

    const cart = await Cart.findOne({
      where: { user_id: userId },
      attributes: ['id', 'user_id', 'total_price'],
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
          ],
          through: {
            attributes: ['quantity'],
          },
        },
      ],
    });

    if (!cart?.dataValues) {
      res.status(200).json({
        cart: {
          id: null,
          user_id: null,
          total_price: 0,
          products: [],
        },
      });
    }

    const totalQuantity = await CartItem.sum('quantity', {
      where: {
        cart_id: cart?.dataValues.id,
      },
    });

    const totalProducts = await CartItem.count({
      where: {
        cart_id: cart?.dataValues.id,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Cart fetched successfully',
      cart,
      total_quantity: totalQuantity,
      total_products: totalProducts,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'failed to get cart, try again later!', next);
  }
}

/**
 * The function `createCart` adds a product to a user's cart, updating the quantity and total price if
 * the product already exists in the cart, or creating a new cart and cart item if it doesn't.
 * @param req - The `req` parameter is the request object that contains information about the incoming
 * HTTP request, such as headers, query parameters, and the request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It is responsible for setting the status code, headers, and sending the
 * response body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function createCart(
  req: Request<object, object, IRequestBody, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.body.product_id;
    const quantity = req.body.quantity;
    const userId = req.userId;

    const userCart = await Cart.findOne({ where: { user_id: userId } });

    const product = await Product.findOne({
      where: { id: productId },
    });

    let price: number;

    if ((product?.dataValues.discount_percentage as number) > 0) {
      price = product?.dataValues.discounted_price as number;
    } else {
      price = product?.dataValues.price as number;
    }

    if (userCart) {
      const cartItemProduct = await CartItem.findOne({
        where: { cart_id: userCart.dataValues.id, product_id: productId },
      });

      if (cartItemProduct) {
        const oldQuantity = cartItemProduct.dataValues.quantity;
        cartItemProduct.set({
          quantity: oldQuantity + quantity,
        });
        await cartItemProduct.save();
      } else {
        await CartItem.create({
          quantity,
          cart_id: userCart.dataValues.id,
          product_id: productId,
        });
      }

      const newTotalPrice = userCart.dataValues.total_price + price * quantity;

      userCart.set({
        total_price: newTotalPrice,
      });

      await userCart.save();

      res.status(201).json({
        status: 'success',
        message: 'Add product to cart successfully!',
      });
    } else {
      const createdNewCart = await Cart.create({
        user_id: userId as number,
        total_price: price * quantity,
      });

      if (!createdNewCart) {
        const error: IError = new Error('Failed add item to cart!');
        error.statusCode = 422;
        throw error;
      }

      const addedCartItem = await CartItem.create({
        cart_id: createdNewCart.dataValues.id,
        quantity: quantity,
        product_id: productId,
      });

      if (!addedCartItem) {
        const error: IError = new Error('Failed add item to cart!');
        error.statusCode = 422;
        throw error;
      }

      res.status(201).json({
        status: 'success',
        message: 'Add product to cart successfully!',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'failed to add item to cart, try again later!', next);
  }
}

/**
 * The function `updateCart` updates the quantity of a product in a user's cart and calculates the new
 * total price.
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server.
 * It contains information such as the request method, request headers, request parameters, and request
 * body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It is responsible for setting the status code, headers, and sending the response
 * body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing a specific task.
 */
export async function updateCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.productId;
    const minusQuantity = +req.body.minus;
    const plusQuantity = +req.body.plus;
    const userId = req.userId;

    const userCart = await Cart.findOne({ where: { user_id: userId } });

    const product = await Product.findOne({
      where: { id: productId },
    });

    let price: number;

    if ((product?.dataValues.discount_percentage as number) > 0) {
      price = product?.dataValues.discounted_price as number;
    } else {
      price = product?.dataValues.price as number;
    }

    // const price = product?.dataValues.price as number;
    const stock_quantity = product?.dataValues.stock_quantity as number;

    if (!userCart) {
      const error: IError = new Error('Cart not found!');
      error.statusCode = 422;
      throw error;
    }

    const cartItemProduct = await CartItem.findOne({
      where: { cart_id: userCart.dataValues.id, product_id: productId },
    });

    if (!cartItemProduct) {
      const error: IError = new Error('Cart item not found!');
      error.statusCode = 422;
      throw error;
    }

    const currentQuantity = cartItemProduct.dataValues.quantity;
    const currentTotalPrice = userCart.dataValues.total_price;
    let newTotalPrice;

    if (minusQuantity && plusQuantity) {
      const error: IError = new Error(
        'Quantity can not be both minus and plus!'
      );
      error.statusCode = 422;
      throw error;
    }

    if (minusQuantity) {
      if (currentQuantity <= 1 || currentQuantity - minusQuantity < 1) {
        const error: IError = new Error('Quantity not enough!');
        error.statusCode = 422;
        throw error;
      }

      newTotalPrice = currentTotalPrice - minusQuantity * price;

      cartItemProduct.set({
        quantity: currentQuantity - minusQuantity,
      });
    }
    if (plusQuantity) {
      if (currentQuantity + plusQuantity >= stock_quantity) {
        const error: IError = new Error(
          'Stock quantity of product not enough!'
        );
        error.statusCode = 422;
        throw error;
      }

      newTotalPrice = currentTotalPrice + plusQuantity * price;

      cartItemProduct.set({
        quantity: currentQuantity + plusQuantity,
      });
    }

    await cartItemProduct.save();

    if (cartItemProduct.dataValues.quantity === 0) {
      await cartItemProduct.destroy();
    }

    userCart.set({
      total_price: newTotalPrice,
    });

    await userCart.save();

    res.status(200).json({
      status: 'success',
      message: 'Update item to cart successfully!',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(
      error,
      'failed to update item to cart, try again later!',
      next
    );
  }
}

/**
 * The `deleteCart` function deletes a product from a cart and returns a success message if the
 * deletion is successful.
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server.
 * It contains information such as the request method, headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It contains methods and properties for setting the response status, headers, and
 * body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function deleteCart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const productId = req.params.productId;
    const userId = req.userId;

    const userCart = await Cart.findOne({ where: { user_id: userId } });
    const product = await Product.findOne({ where: { id: productId } });

    if (!userCart) {
      const error: IError = new Error('Cart not found!');
      error.statusCode = 404;
      throw error;
    }

    const cartItems = await CartItem.findOne({
      where: { cart_id: userCart.dataValues.id, product_id: productId },
    });

    if (!cartItems) {
      const error: IError = new Error('Product cart not found!');
      error.statusCode = 404;
      throw error;
    }

    let productPrice: number;

    if ((product?.dataValues.discount_percentage as number) > 0) {
      productPrice = product?.dataValues.discounted_price as number;
    } else {
      productPrice = product?.dataValues.price as number;
    }

    const currentQuantity = cartItems.dataValues.quantity;
    const currentTotalPrice = userCart.dataValues.total_price;

    const newTotalPrice = currentTotalPrice - currentQuantity * productPrice;

    const deletedCartProduct = await CartItem.destroy({
      where: {
        cart_id: userCart.dataValues.id,
        product_id: productId,
      },
    });

    if (deletedCartProduct <= 0) {
      const error: IError = new Error('Product cart not found!');
      error.statusCode = 404;
      throw error;
    }

    if (newTotalPrice > 0) {
      userCart.set({
        total_price: newTotalPrice,
      });

      await userCart.save();
    } else {
      await userCart.destroy();
    }

    res.status(200).json({
      status: 'success',
      message: 'Delete product from cart successfully!',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(
      error,
      'failed to delete product from cart, try again later!',
      next
    );
  }
}
