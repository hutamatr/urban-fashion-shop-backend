import { NextFunction, Request, Response } from 'express';

import Role from '../models/roleModel';
import User from '../models/userModel';
import {
  accessTokenExpiresIn,
  accessTokenSecret,
  adminCode,
  refreshTokenExpiredIn,
  refreshTokenSecret,
} from '../../utils/constants';
import errorHandler from '../../utils/errorHandler';
import { comparePassword, hashPassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';

export async function signUpAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const adminCodeClient = req.body.adminCode;

    if (adminCodeClient !== adminCode) {
      const error: IError = new Error('Admin code not match!');
      error.statusCode = 422;
      throw error;
    }

    if (password !== confirmPassword) {
      const error: IError = new Error('Password not match!');
      error.statusCode = 422;
      throw error;
    }

    let roleId;
    const hashedPassword = await hashPassword(password);
    const getRoles = await Role.findOne({ where: { role_name: 'admin' } });
    roleId = getRoles?.dataValues?.id;

    if (!getRoles) {
      const newRole = await Role.create({ role_name: 'admin' });
      roleId = newRole?.dataValues.id;
    }

    const adminRoleId = roleId;

    const createdAdmin = await User.create({
      email,
      password: hashedPassword,
      role_id: adminRoleId as number,
    });

    if (!createdAdmin) {
      const error: IError = new Error('Failed to signup, try again later!');
      error.statusCode = 422;
      throw error;
    }

    const {
      id,
      email: adminEmail,
      created_at,
      updated_at,
    } = createdAdmin.dataValues;

    const accessToken = await generateToken(
      { id, email: adminEmail },
      accessTokenSecret as string,
      accessTokenExpiresIn
    );

    const refreshToken = await generateToken(
      { id, email: adminEmail },
      refreshTokenSecret as string,
      refreshTokenExpiredIn
    );

    res.cookie('rt', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      access_token: accessToken,
      message: 'Signup new admin successfully!',
      user: {
        id,
        email: adminEmail,
        created_at,
        updated_at,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to signup new admin, try again later!', next);
  }
}

export async function signInAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const admin = await User.findOne({ where: { email } });

    const getRoles = await Role.findOne({ where: { role_name: 'admin' } });

    if (!admin) {
      const error: IError = new Error(
        'Admin with this email could not be found!'
      );
      error.statusCode = 401;
      throw error;
    }

    if (admin?.dataValues.role_id !== getRoles?.dataValues.id) {
      const error: IError = new Error(
        'You do not have permission to access this resource!'
      );
      error.statusCode = 401;
      throw error;
    }

    const verifyPassword = await comparePassword(
      password,
      admin.dataValues.password
    );

    if (!verifyPassword) {
      const error: IError = new Error('Incorrect Password!');
      error.statusCode = 401;
      throw error;
    }

    const { id, email: adminEmail, created_at, updated_at } = admin.dataValues;

    const accessToken = await generateToken(
      { id, email: adminEmail },
      accessTokenSecret as string,
      accessTokenExpiresIn
    );

    const refreshToken = await generateToken(
      { id, email: adminEmail },
      refreshTokenSecret as string,
      refreshTokenExpiredIn
    );

    res.cookie('rt', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      access_token: accessToken,
      message: 'Signin admin successfully!',
      user: {
        id,
        email: adminEmail,
        created_at,
        updated_at,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to signin admin, try again later!', next);
  }
}
