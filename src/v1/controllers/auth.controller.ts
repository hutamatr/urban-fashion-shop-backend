import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

import ResetPassword from '../models/reset-password.model';
import Role from '../models/role.model';
import User from '../models/user.model';
import {
  accessTokenExpiresIn,
  accessTokenSecret,
  env,
  feBaseURL,
  refreshTokenExpiredIn,
  refreshTokenSecret,
} from '../../utils/constants';
import errorHandler from '../../utils/error-handler';
import { comparePassword, hashPassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import sendEmail from '../../utils/send-email';

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
      sameSite: 'none',
      secure: env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: 'success',
      message: 'Signup new user successfully!',
      access_token: accessToken,
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

    const getRole = await Role.findOne({ where: { role_name: 'user' } });

    const roleId = getRole?.dataValues?.id;

    const user = await User.findOne({ where: { email, role_id: roleId } });

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
      sameSite: 'none',
      secure: env === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      message: 'Signin user successfully!',
      access_token: accessToken,
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
      sameSite: 'none',
      secure: env === 'production',
    });

    res
      .status(200)
      .json({ status: 'success', message: 'Signout successfully' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to signout, try again later!', next);
  }
}

/**
 * The above function is an async handler for changing a user's password, which verifies the current
 * password, hashes the new password, and updates the user's password in the database.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and request body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It contains methods and properties for setting the response status, headers, and
 * body. In this code, `res.status(200).json()` is used to send a JSON response with a success message
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing the current one.
 */
export async function changePasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const currentPassword = req.body.current_password;
    const newPassword = req.body.new_password;

    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      const error: IError = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }

    const verifyCurrentPassword = await comparePassword(
      currentPassword,
      user.dataValues.password
    );

    if (!verifyCurrentPassword) {
      const error: IError = new Error('Incorrect Password!');
      error.statusCode = 401;
      throw error;
    }

    const hashedNewPassword = await hashPassword(newPassword);

    user.set({
      password: hashedNewPassword,
    });

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully!',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to change password, try again later!', next);
  }
}

/**
 * The `resetPasswordLinkHandler` function handles the logic for generating and sending a reset
 * password link to a user's email.
 * @param {Request} req - The `req` parameter is the request object, which contains information about
 * the incoming HTTP request, such as the request headers, request body, and request parameters.
 * @param {Response} res - The `res` parameter is the response object that is used to send a response
 * back to the client. It contains methods and properties that allow you to set the response status,
 * headers, and body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function after completing a specific task.
 */
export async function resetPasswordLinkHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const email = req.body.email;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      const error: IError = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }

    let resetPasswordToken;

    resetPasswordToken = await ResetPassword.findOne({
      where: { user_id: user.dataValues.id },
    });

    if (!resetPasswordToken) {
      resetPasswordToken = await ResetPassword.create({
        user_id: user.dataValues.id,
        token: crypto.randomBytes(32).toString('hex'),
      });
    }

    const link = `${feBaseURL}/reset-password/${user.dataValues.id}/${resetPasswordToken.dataValues.token}`;
    await sendEmail(user.dataValues.email, 'Reset Password', link);

    res.status(200).json({
      status: 'success',
      message: 'Reset password link sent to your email!',
      token: resetPasswordToken.dataValues.token,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(
      error,
      'Failed to send reset password link, try again later!',
      next
    );
  }
}

/**
 * The function `resetPasswordHandler` is an asynchronous function that handles the reset password
 * functionality by verifying the user and token, updating the user's password, and returning a success
 * message.
 * @param {Request} req - The `req` parameter is an object that represents the HTTP request made to the
 * server. It contains information such as the request headers, request body, request method, request
 * URL, and request parameters.
 * @param {Response} res - The `res` parameter is the response object that is used to send the response
 * back to the client. It contains methods and properties that allow you to set the response status,
 * headers, and body. In this code, `res.status(200).json(...)` is used to set the response status
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function resetPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.userId;
    const resetPasswordToken = req.params.token;
    const newPassword = req.body.new_password;

    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      const error: IError = new Error('Invalid link or expired!');
      error.statusCode = 400;
      throw error;
    }

    const token = await ResetPassword.findOne({
      where: { user_id: user.dataValues.id, token: resetPasswordToken },
    });

    if (!token) {
      const error: IError = new Error('Invalid link or expired!');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await hashPassword(newPassword);

    user.set({
      password: hashedPassword,
    });

    await user.save();
    await token.destroy({ force: true });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully!',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to reset password, try again later!', next);
  }
}
