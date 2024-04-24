import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import RefreshToken from '../models/refresh-token.model';
import User from '../models/user.model';
import {
  accessTokenExpiresIn,
  accessTokenSecret,
  refreshTokenSecret,
} from '../../utils/constants';
import { CustomError } from '../../utils/custom-error';
import errorHandler from '../../utils/error-handler';
import { generateToken } from '../../utils/jwt';

/**
 * The function `getRefreshToken` is an asynchronous function that handles the retrieval and
 * verification of a refresh token, and generates a new access token if the refresh token is valid.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as headers, query parameters, and body.
 * @param {Response} res - The `res` parameter is the response object that is used to send the HTTP
 * response back to the client. It contains methods and properties for manipulating the response, such
 * as setting the status code, headers, and sending the response body.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors or to
 * move on to the next middleware function in the chain.
 */
export async function getRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cookies = req.cookies;

    if (!cookies?.rt) {
      const error = new CustomError(401, 'Not Authenticated');
      throw error;
    }

    const refreshTokenCookie = cookies.rt;

    res.clearCookie('rt', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    const refreshTokenUser = await RefreshToken.findOne({
      where: { refresh_token: refreshTokenCookie },
    });

    // Detected refresh token reuse
    if (!refreshTokenUser) {
      jwt.verify(
        refreshTokenCookie,
        refreshTokenSecret as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (err: jwt.VerifyErrors | null, decoded: any) => {
          if (err) {
            const error = new CustomError(403, 'Token expired or invalid');
            throw error;
          }
          const user = await User.findOne({
            where: { email: decoded?.email },
          });

          if (!user) {
            const error = new CustomError(404, 'User does not exist');
            throw error;
          }

          await RefreshToken.destroy({ where: { user_id: user?.id } });
        }
      );
      const error = new CustomError(403, 'Token expired or invalid');
      throw error;
    }

    const user = await User.findOne({
      where: { id: refreshTokenUser?.dataValues?.user_id },
    });

    if (!user) {
      const error = new CustomError(404, 'User does not exist');
      throw error;
    }

    // Generate new access token and refresh token
    jwt.verify(
      refreshTokenUser.refresh_token,
      refreshTokenSecret as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          await RefreshToken.destroy({
            where: {
              user_id: user?.id,
              refresh_token: refreshTokenCookie,
            },
          });
        }

        if (err || user.email !== decoded?.email) {
          const error = new CustomError(404, 'User does not exist');
          throw error;
        }

        const newAccessToken = await generateToken(
          {
            id: user?.id,
            email: decoded?.email,
          },
          accessTokenSecret as string,
          accessTokenExpiresIn
        );

        const newRefreshToken = await generateToken(
          { email: decoded?.email },
          refreshTokenSecret as string,
          accessTokenExpiresIn
        );

        await RefreshToken.create({
          user_id: user?.id,
          refresh_token: newRefreshToken,
        });

        res.cookie('rt', newRefreshToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
          status: 'success',
          message: 'Access token generated successfully',
          access_token: newAccessToken,
        });
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get refresh token, try again later!', next);
  }
}
