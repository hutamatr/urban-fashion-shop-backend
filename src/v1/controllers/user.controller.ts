import { NextFunction, Request, Response } from 'express';

import Role from '../models/role.model';
import User from '../models/user.model';
import errorHandler from '../../utils/error-handler';

/**
 * The above function is an asynchronous function that retrieves users from a database based on certain
 * criteria and returns the users along with the total count, skip value, and limit value in the
 * response.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status,
 * headers, and body. In this code, it is used to send the JSON response containing the users, total
 * count, skip, and
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = Number(req.query.limit);
    const skip = Number(req.query.skip) || 0;
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
      const error: IError = new Error('Not authorized!');
      error.statusCode = 401;
      throw error;
    }

    let users;

    if (limit > 0 && skip >= 0) {
      users = await User.findAll({
        where: { role_id: 1 },
        offset: skip,
        limit: limit,
        attributes: [
          'id',
          'first_name',
          'last_name',
          'email',
          'address',
          'phone_number',
          'created_at',
          'updated_at',
          'deleted_at',
        ],
        include: [
          {
            model: Role,
            attributes: ['id', 'role_name'],
          },
        ],
      });
    } else {
      users = await User.findAll({
        where: { role_id: 1 },
        attributes: [
          'id',
          'first_name',
          'last_name',
          'email',
          'address',
          'phone_number',
          'created_at',
          'updated_at',
          'deleted_at',
        ],
        include: [
          {
            model: Role,
            attributes: ['id', 'role_name'],
          },
        ],
      });
    }

    if (!users) {
      const error: IError = new Error('Failed to get users!');
      error.statusCode = 422;
      throw error;
    }

    const total = await User.count({ where: { role_id: 1 } });

    res.status(200).json({ users, total, skip, limit: users.length });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get users, try again later!', next);
  }
}

/**
 * The function `getUser` retrieves a user from the database based on the provided user ID and returns
 * the user's information along with a success message.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status
 * code, headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    const user = await User.findOne({
      where: { id: userId },
      attributes: [
        'id',
        'first_name',
        'last_name',
        'email',
        'city',
        'postal_code',
        'address',
        'phone_number',
        'created_at',
        'updated_at',
        'deleted_at',
      ],
      include: [
        {
          model: Role,
          attributes: ['id', 'role_name'],
        },
      ],
    });

    if (!user) {
      const error: IError = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ user, message: 'User fetched successfully!' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get user, try again later!', next);
  }
}

/**
 * The updateUser function updates a user's information in a database based on the provided request
 * data.
 * @param {Request} req - The `req` parameter is the request object that contains information about the
 * HTTP request made by the client. It includes properties such as the request headers, request body,
 * request method, and request URL.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It contains methods and properties for manipulating the response, such as
 * setting the status code, sending JSON data, or redirecting the client to another URL.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function updateUser(
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
    });

    await user.save();

    res.status(200).json({ user, message: 'User updated successfully!' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to update user, try again later!', next);
  }
}

/**
 * The deleteUser function is an asynchronous function that deletes a user from the database if the
 * requesting user is an admin, otherwise it throws an error.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status
 * code, headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.userId;
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
      const error: IError = new Error('Not authorized!');
      error.statusCode = 401;
      throw error;
    }

    const deletedUser = await User.destroy({
      where: { id: userId },
    });

    if (deletedUser <= 0) {
      const error: IError = new Error('Failed to delete user, user not found!');
      error.statusCode = 422;
      throw error;
    }

    res
      .status(200)
      .json({ deleted: true, message: 'User deleted successfully!' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to delete user, try again later!', next);
  }
}
