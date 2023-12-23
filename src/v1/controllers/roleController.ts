import { NextFunction, Request, Response } from 'express';

import Role from '../models/roleModel';
import { IError } from '../../middleware/error';
import errorHandler from '../../utils/errorHandler';

interface IRequestBody {
  name: string;
}

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

    res.status(200).json({ roles });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get roles, try again later!', next);
  }
}

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
      message: 'Create role successfully!',
      role: createdRole.dataValues,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to create new role, try again later!', next);
  }
}
