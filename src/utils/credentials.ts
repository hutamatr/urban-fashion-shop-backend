import { NextFunction, Request, Response } from 'express';

import { allowedOrigins } from './cors';

export function credentials(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
}
