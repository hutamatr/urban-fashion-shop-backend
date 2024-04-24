import { NextFunction } from 'express';
import { ValidationError as SequelizeValidationError } from 'sequelize';

import { CustomError } from './custom-error';

export default function errorHandler(
  error: CustomError,
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
