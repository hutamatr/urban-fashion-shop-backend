import { NextFunction, Request, Response } from 'express';

import Role from '../models/roleModel';
import User from '../models/userModel';
import errorHandler from '../../utils/errorHandler';

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
