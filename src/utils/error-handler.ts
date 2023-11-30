import { NextFunction } from 'express';
import { ValidationError as SequelizeValidationError } from 'sequelize';

import { IError } from '../middleware/error';

export default function errorHandler(
  error: IError,
  message: string,
  next: NextFunction
) {
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  if (error instanceof SequelizeValidationError) {
    error.message = message;
  }

  next(error);
}
