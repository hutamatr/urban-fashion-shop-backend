import { NextFunction, Request, Response } from 'express';

import { accessTokenSecret } from '../utils/constants';
import { CustomError } from '../utils/custom-error';
import { verifyToken } from '../utils/jwt';
import Role from '../v1/models/role.model';
import User from '../v1/models/user.model';

/**
 * The `authMiddleware` function is an asynchronous middleware function that checks for a valid
 * authorization token in the request header, verifies the token, and sets the user ID and credential
 * in the request object before calling the next middleware function or handling any errors.
 * @param {Request} req - The `req` parameter is an object representing the HTTP request received by
 * the server. It contains information about the request such as headers, query parameters, request
 * body, etc.
 * @param {Response} _res - The `_res` parameter is of type `Response`, which represents the HTTP
 * response that will be sent back to the client. It is not being used in the `authMiddleware`
 * function, so it is prefixed with an underscore (_) to indicate that it is a unused parameter.
 * @param {NextFunction} next - The `next` parameter is a function that is called to pass control to
 * the next middleware function in the chain. It is typically used to move to the next middleware
 * function or to the route handler function.
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
      const error = new CustomError(401, 'Not Authenticated');
      throw error;
    }

    const accessToken = tokenHeader.split(' ')[1];
    const credential = await verifyToken(
      accessToken,
      accessTokenSecret as string
    );

    if (!credential) {
      const error = new CustomError(401, 'Invalid Token');
      throw error;
    }

    const user = await User.findOne({
      where: {
        id: credential.id,
        email: credential.email,
      },
    });

    req.user = user;
    req.userId = credential.id;

    let roleId;

    const getRoles = await Role.findOne({ where: { role_name: 'admin' } });

    if (!getRoles) {
      const createRole = await Role.create({ role_name: 'admin' });
      if (!createRole) {
        const error = new CustomError(422, 'Failed to create role');
        throw error;
      }
      roleId = createRole.dataValues.id;
    } else {
      roleId = getRoles?.dataValues?.id;
    }

    if (user?.dataValues.role_id === roleId) {
      req.isAdmin = true;
    }

    next();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
}
