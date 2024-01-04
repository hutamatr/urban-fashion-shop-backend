import { NextFunction, Request, Response } from 'express';

import {
  accessTokenExpiresIn,
  accessTokenSecret,
  refreshTokenSecret,
} from '../../utils/constants';
import errorHandler from '../../utils/errorHandler';
import { generateToken, verifyToken } from '../../utils/jwt';

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
