import { NextFunction, Request, Response } from 'express';

import Role from '../models/role.model';
import errorHandler from '../../utils/error-handler';

interface IRequestBody {
  name: string;
}

/**
 * The function `getRoles` retrieves all roles and sends them as a JSON response, handling any errors
 * that occur.
 * @param {Request} _req - The `_req` parameter is of type `Request` and represents the incoming HTTP
 * request object.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status
 * code, headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function getRoles(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const roles = await Role.findAll();

    if (!roles) {
      const error: IError = new Error('Failed to get roles, roles not found!');
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Roles retrieved successfully',
      roles,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get roles, try again later!', next);
  }
}

/**
 * The function `createRole` creates a new role with the given name and returns a success message along
 * with the created role data, or throws an error if the role creation fails.
 * @param req - The `req` parameter is an object representing the HTTP request made to the server. It
 * contains information such as the request headers, request body, request method, and request URL.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status
 * code, headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function createRole(
  req: Request<object, object, IRequestBody, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const roleName = req.body.name;

    const createdRole = await Role.create({ role_name: roleName });

    if (!createdRole) {
      const error: IError = new Error('Failed to create role!');
      error.statusCode = 422;
      throw error;
    }

    res.status(201).json({
      status: 'success',
      message: 'Create role successfully!',
      role: createdRole.dataValues,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to create new role, try again later!', next);
  }
}
