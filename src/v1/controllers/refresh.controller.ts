import { NextFunction, Request, Response } from 'express';

import {
  accessTokenExpiresIn,
  accessTokenSecret,
  refreshTokenSecret,
} from '../../utils/constants';
import errorHandler from '../../utils/error-handler';
import { generateToken, verifyToken } from '../../utils/jwt';

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
    const refreshToken = req.cookies.rt;

    if (!refreshToken) {
      const error: IError = new Error('Not Authenticated');
      error.statusCode = 401;
      throw error;
    }

    const verifiedToken = await verifyToken(
      refreshToken,
      refreshTokenSecret as string
    );

    if (!verifiedToken) {
      const error: IError = new Error('Refresh token expired or invalid');
      error.statusCode = 401;
      throw error;
    }

    const generatedNewToken = await generateToken(
      {
        id: verifiedToken.id,
        email: verifiedToken.email,
      },
      accessTokenSecret as string,
      accessTokenExpiresIn
    );

    res.status(200).json({
      access_token: generatedNewToken,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, 'Failed to get refresh token, try again later!', next);
  }
}
