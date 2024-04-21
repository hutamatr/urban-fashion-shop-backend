import { NextFunction, Request, Response } from 'express';

import Role from '../models/role.model';
import User from '../models/user.model';
import {
  accessTokenExpiresIn,
  accessTokenSecret,
  adminCode,
  env,
  refreshTokenExpiredIn,
  refreshTokenSecret,
} from '../../utils/constants';
import errorHandler from '../../utils/error-handler';
import { comparePassword, hashPassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';

/**
 * The `signUpAdminHandler` function handles the signup process for a new admin user, including
 * validation, role assignment, password hashing, token generation, and response handling.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, body, and query parameters.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for setting the response status,
 * headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
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

    const hashedPassword = await hashPassword(password);
    let roleId;
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
      secure: env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: 'success',
      message: 'Signup new admin successfully!',
      access_token: accessToken,
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

/**
 * The `signInAdminHandler` function handles the sign-in process for an admin user, including
 * authentication, generating access and refresh tokens, and returning the user information.
 * @param {Request} req - The `req` parameter is the request object that contains information about the
 * HTTP request made to the server, such as the request headers, body, and URL parameters.
 * @param {Response} res - The `res` parameter is the response object that is used to send a response
 * back to the client. It contains methods and properties that allow you to set the response status,
 * headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
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
      secure: env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      message: 'Signin admin successfully!',
      access_token: accessToken,
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
