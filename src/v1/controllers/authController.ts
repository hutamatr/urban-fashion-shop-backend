import { NextFunction, Request, Response } from 'express';

import Role from '../models/roleModel';
import User from '../models/userModel';
import { IError } from '../../middleware/error';
import errorHandler from '../../utils/errorHandler';
import { comparePassword, hashPassword } from '../../utils/hash';
import {
  accessTokenExpiresIn,
  accessTokenSecret,
  generateToken,
  refreshTokenExpiredIn,
  refreshTokenSecret,
} from '../../utils/jwt';

interface IRequestParams {
  productId: string;
  rt: string;
}

interface IRequestBody {
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * The `signUpHandler` function handles the signup process for a user, including validating the
 * password, hashing it, creating a new user record, generating access and refresh tokens, setting a
 * refresh token cookie, and returning the user information and tokens in the response.
 * @param req - The `req` parameter is the request object that contains information about the incoming
 * HTTP request, such as headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It is an instance of the `Response` class from the Express framework.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function signUpUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (password !== confirmPassword) {
      const error: IError = new Error('Password not match!');
      error.statusCode = 422;
      throw error;
    }

    const hashedPassword = await hashPassword(password);
    let roleId;

    const getRole = await Role.findOne({ where: { role_name: 'user' } });
    roleId = getRole?.dataValues?.id;

    if (!getRole) {
      const newRole = await Role.create({ role_name: 'user' });
      roleId = newRole?.dataValues.id;
    }

    const userRoleId = roleId;

    const createdUser = await User.create({
      email,
      password: hashedPassword,
      role_id: userRoleId as number,
    });

    if (!createdUser) {
      const error: IError = new Error('Failed to signup, try again later!');
      error.statusCode = 422;
      throw error;
    }

    const {
      id,
      email: userEmail,
      created_at,
      updated_at,
    } = createdUser.dataValues;

    const accessToken = await generateToken(
      { id, email: userEmail },
      accessTokenSecret as string,
      accessTokenExpiresIn
    );

    const refreshToken = await generateToken(
      { id, email: userEmail },
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
      message: 'Signup new user successfully!',
      user: {
        id,
        email: userEmail,
        created_at,
        updated_at,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to signup new user, try again later!', next);
  }
}

/**
 * The `signInHandler` function handles the sign-in process for a user, including verifying the email
 * and password, generating access and refresh tokens, setting a refresh token cookie, and returning
 * the user information and access token in the response.
 * @param req - The `req` parameter is the request object that contains information about the incoming
 * HTTP request, such as headers, query parameters, and the request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It is an instance of the `Response` class from the Express framework.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function signInUserHandler(
  req: Request<object, object, IRequestBody, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      const error: IError = new Error(
        'User with this email could not be found!'
      );
      error.statusCode = 401;
      throw error;
    }

    const verifyPassword = await comparePassword(
      password,
      user.dataValues.password
    );

    if (!verifyPassword) {
      const error: IError = new Error('Incorrect Password!');
      error.statusCode = 401;
      throw error;
    }

    const { id, email: userEmail, created_at, updated_at } = user.dataValues;

    const accessToken = await generateToken(
      { id, email: userEmail },
      accessTokenSecret as string,
      accessTokenExpiresIn
    );

    const refreshToken = await generateToken(
      { id, email: userEmail },
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
      message: 'Signin user successfully!',
      user: {
        id,
        email: userEmail,
        created_at,
        updated_at,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to signin user, try again later!', next);
  }
}

/**
 * The signOutHandler function is responsible for handling the sign out process, clearing the refresh
 * token cookie and returning a success message.
 * @param req - The `req` parameter is an object representing the HTTP request received by the server.
 * It contains information such as the request method, headers, query parameters, request body, and
 * cookies.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It contains methods and properties for manipulating the response, such as
 * setting headers, sending data, and setting the status code.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 * @returns a response with a status code of 200 and a JSON object containing the properties "sign_out"
 * set to true and "message" set to "Signout successfully".
 */
export async function signOutHandler(
  req: Request<IRequestParams, object, object, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const refreshToken = req.cookies.rt;

    if (!refreshToken) {
      return res.sendStatus(204);
    }

    res.clearCookie('rt', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });

    res.status(200).json({ sign_out: true, message: 'Signout successfully' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to signout, try again later!', next);
  }
}
