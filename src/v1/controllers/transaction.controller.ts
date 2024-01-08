import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';

import Cart from '../models/cart.model';
import CartItem from '../models/cart-item.model';
import Product from '../models/product.model';
import Transaction, { ITransaction } from '../models/transaction.model';
import TransactionItem from '../models/transaction-item.model';
import User from '../models/user.model';
import {
  CANCELED,
  feBaseURL,
  midtransApiURL,
  midtransServerKey,
  PAID,
  PENDING_PAYMENT,
  shippingFlatRate,
} from '../../utils/constants';
import errorHandler from '../../utils/error-handler';

/**
 * The `createTransaction` function creates a transaction for a user, including updating user
 * information, retrieving the user's cart and cart items, generating a transaction ID, calculating the
 * total price, and making a request to the Midtrans API to create the transaction.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It contains methods and properties for manipulating the response, such as
 * setting the status code, headers, and sending the response body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing a specific task.
 */
export async function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const address = req.body.address;
    const phoneNumber = req.body.phone_number;
    const city = req.body.city;
    const postalCode = req.body.postal_code;
    const authString = btoa(`${midtransServerKey}:`);

    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      const error: IError = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }

    user.set({
      first_name: firstName,
      last_name: lastName,
      address,
      phone_number: phoneNumber,
      city,
      postal_code: postalCode,
    });

    await user.save();

    const userCart = await Cart.findOne({
      where: { user_id: userId },
      attributes: ['id', 'user_id', 'total_price'],
      include: [
        {
          model: Product,
          as: 'products',
          attributes: [
            'id',
            'title',
            'image_url',
            'price',
            'discount_percentage',
            'discounted_price',
          ],
          through: {
            attributes: ['quantity'],
          },
        },
      ],
    });

    if (!userCart) {
      const error: IError = new Error('Cart not found!');
      error.statusCode = 404;
      throw error;
    }

    const userCartItem = await CartItem.findAll({
      where: { cart_id: userCart.dataValues.id },
    });

    if (!userCartItem) {
      const error: IError = new Error('Cart item not found!');
      error.statusCode = 404;
      throw error;
    }

    const transaction_id = `UFS-${nanoid(4)}-${nanoid(8)}`;
    const gross_amount = userCart.dataValues.total_price + shippingFlatRate;
    const shippingItems = {
      id: 'SHIPPING',
      price: shippingFlatRate,
      quantity: 1,
      name: 'Shipping',
    };
    const userCartItems: {
      id: number | string;
      price: number;
      quantity: number;
      name: string;
    }[] = userCart.products!.map((product) => ({
      id: product.id,
      price:
        product.discount_percentage > 0
          ? product.discounted_price
          : product.price,
      quantity: product.cart_item.quantity,
      name: product.title,
    }));

    const midtransPayload = {
      transaction_details: {
        order_id: transaction_id,
        gross_amount,
      },
      credit_card: {
        secure: true,
      },
      item_details: [...userCartItems, shippingItems],
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        phone: phoneNumber,
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          email: user.email,
          phone: phoneNumber,
          address: address,
          city: city,
          postal_code: postalCode,
          country_code: 'IDN',
        },
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          email: user.email,
          phone: phoneNumber,
          address: address,
          city: city,
          postal_code: postalCode,
          country_code: 'IDN',
        },
      },
      callbacks: {
        finish: `${feBaseURL}/order-status?transaction_id=${transaction_id}`,
        error: `${feBaseURL}/order-status?transaction_id=${transaction_id}`,
        pending: `${feBaseURL}/order-status?transaction_id=${transaction_id}`,
      },
    };

    const response = await fetch(`${midtransApiURL}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    if (response.status !== 201) {
      const error: IError = new Error(await response.text());
      error.statusCode = response.status;
      throw error;
    }

    const data: IMidtransResponse = await response.json();

    const transaction = await Transaction.create({
      id: transaction_id,
      user_id: userId as number,
      total_price: gross_amount,
      status: PENDING_PAYMENT,
      snap_token: data.token,
      snap_redirect_url: data.redirect_url,
      payment_method: 'Midtrans',
    });

    if (!transaction?.id) {
      const error: IError = new Error('Failed to create transaction!');
      error.statusCode = 404;
      throw error;
    }

    userCart.products?.forEach(async (item) => {
      await TransactionItem.create({
        transaction_id,
        product_id: item.id,
        quantity: item.cart_item.quantity,
      });
    });

    await userCart.destroy();
    userCartItem.forEach(async (item) => {
      await item.destroy();
    });

    res.status(201).json({
      status: 'success',
      message: 'Transaction created successfully',
      data: {
        id: transaction_id,
        status: PENDING_PAYMENT,
        first_name: firstName,
        last_name: lastName,
        products: userCart.products,
        snap_token: data.token,
        snap_redirect_url: data.redirect_url,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, error.message, next);
  }
}

/**
 * The function `getTransactions` retrieves transactions based on the status provided, and includes
 * transaction items and associated products, but only if the user is an admin.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status,
 * headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function getTransactions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isAdmin = req.isAdmin;
    const statusTransaction = req.body.status;

    if (!isAdmin) {
      const error: IError = new Error('Not authorized!');
      error.statusCode = 401;
      throw error;
    }

    const transactions = await Transaction.findAll({
      where: {
        status: statusTransaction,
      },
      include: [
        {
          model: TransactionItem,
          attributes: ['id', 'quantity', 'created_at', 'updated_at'],
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'image_url', 'price'],
            },
          ],
        },
      ],
    });

    if (!transactions) {
      const error: IError = new Error('Transactions not found!');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Transactions fetched successfully',
      data: transactions,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get transaction, try again later!', next);
  }
}

/**
 * The function `getTransactionById` retrieves a transaction by its ID, including its associated
 * transaction items and products, and returns it as a JSON response.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status,
 * headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function getTransactionById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const transactionId = req.params.transaction_id;

    const transaction = await Transaction.findOne({
      where: { id: transactionId, user_id: userId },
      include: [
        {
          model: TransactionItem,
          attributes: ['id', 'quantity', 'created_at', 'updated_at'],
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'image_url', 'price'],
            },
          ],
        },
      ],
    });

    if (!transaction) {
      const error: IError = new Error('Transaction not found!');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Transaction fetched successfully',
      data: transaction,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get transaction, try again later!', next);
  }
}

/**
 * The function updates the status of a transaction and sends a response with the updated transaction
 * data.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It contains methods and properties for setting the response status, headers, and
 * body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function updateTransactionStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const transactionId = req.params.transaction_id;
    const status = req.body.status;

    const transaction = await Transaction.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      const error: IError = new Error('Transaction not found!');
      error.statusCode = 404;
      throw error;
    }

    transaction.set({ status });

    await transaction.save();

    res.status(200).json({
      status: 'success',
      message: 'Transaction status updated successfully',
      data: transaction,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to update transaction, try again later!', next);
  }
}

/**
 * The function `updateStatusByMidtrans` updates the status of a transaction based on the notification
 * received from the Midtrans payment gateway.
 * @param {ITransaction} transaction - The `transaction` parameter is an object of type `ITransaction`,
 * which represents a transaction in your system. It likely contains information such as the
 * transaction ID, status, and payment method.
 * @param {IMidtransNotification} data - The `data` parameter is an object that contains the
 * notification data received from Midtrans. It includes the following properties:
 * @returns an object with two properties: "status" and "data". The "status" property indicates the
 * status of the update operation, which can be either "success" or "error". The "data" property
 * contains the updated transaction object if the update operation is successful.
 */
async function updateStatusByMidtrans(
  transaction: ITransaction,
  data: IMidtransNotification
) {
  const hash = crypto
    .createHash('sha512')
    .update(
      `${transaction.id}${data?.status_code}${data?.gross_amount}${midtransServerKey}`
    )
    .digest('hex');

  if (data?.signature_key !== hash) {
    return {
      status: 'error',
      message: 'Invalid Signature Key',
    };
  }

  const transactionStatus = data?.transaction_status;
  const fraudStatus = data?.fraud_status;

  if (transactionStatus == 'capture') {
    if (fraudStatus == 'accept') {
      transaction.set({ status: PAID, payment_method: data?.payment_type });
    }
  } else if (transactionStatus == 'settlement') {
    transaction.set({ status: PAID, payment_method: data?.payment_type });
  } else if (
    transactionStatus == 'cancel' ||
    transactionStatus == 'deny' ||
    transactionStatus == 'expire'
  ) {
    transaction.set({ status: CANCELED });
  } else if (transactionStatus == 'pending') {
    transaction.set({ status: PENDING_PAYMENT });
  }

  await transaction.save();

  return {
    status: 'success',
    data: transaction,
  };
}

/**
 * The function `transactionNotification` handles a transaction notification received from Midtrans and
 * updates the status of the corresponding transaction in the database.
 * @param {Request} req - The `req` parameter is the request object that contains information about the
 * incoming HTTP request. It includes details such as the request headers, query parameters, and
 * request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send a response
 * back to the client. It contains methods and properties that allow you to control the response, such
 * as setting the status code, headers, and sending the response body.
 * @param {NextFunction} _next - The `_next` parameter is a function that represents the next
 * middleware function in the request-response cycle. It is used to pass control to the next middleware
 * function.
 */
export async function transactionNotification(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const data: IMidtransNotification = req.body;

  const transaction = await Transaction.findOne({
    where: { id: data?.order_id },
  });

  if (transaction) {
    updateStatusByMidtrans(transaction, data).then((result) => {
      // eslint-disable-next-line no-console
      console.log('result', result);
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'OK',
  });
}