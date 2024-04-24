import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { CustomError } from '../utils/custom-error';

export default function errorMiddleware(
  error: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = error.statusCode;
  let message = [error.message];

  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    message = validationError.details.map((err) => err.message);
  }

  res
    .status(status as number)
    .json({ status: 'error', statusCode: status, message });
}
