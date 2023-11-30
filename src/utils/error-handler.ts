import { NextFunction } from 'express';
import { ValidationError as SequelizeValidationError } from 'sequelize';

import { IError } from '../middleware/error';

/**
 * The errorHandler function handles errors by setting a default status code and updating the error
 * message if it is a SequelizeValidationError.
 * @param {IError} error - The `error` parameter is an object that represents the error that occurred.
 * It may contain properties such as `statusCode` to indicate the HTTP status code of the error, and
 * `message` to provide a description of the error.
 * @param {string} message - The `message` parameter is a string that represents the custom error
 * message that you want to assign to the error object if it is an instance of
 * `SequelizeValidationError`.
 * @param {NextFunction} next - The `next` parameter is a function that is used to pass control to the
 * next middleware function in the request-response cycle. It is typically used to handle errors and
 * move on to the next error-handling middleware.
 */
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
