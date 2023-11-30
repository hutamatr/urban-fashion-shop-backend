import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

export interface IError extends Error {
  statusCode?: number;
}

/**
 * The errorMiddleware function handles errors and sends a JSON response with the error status code and
 * message.
 * @param {IError} error - The `error` parameter is an object that represents the error that occurred.
 * It typically contains information such as the error message, error code, and any additional details
 * about the error.
 * @param {Request} req - The `req` parameter represents the HTTP request object, which contains
 * information about the incoming request such as the request headers, query parameters, and request
 * body.
 * @param {Response} res - The `res` parameter is the response object in Express.js. It is used to send
 * the response back to the client.
 * @param {NextFunction} _next - The `_next` parameter is a function that represents the next
 * middleware function in the request-response cycle. It is used to pass control to the next middleware
 * function.
 */
export default function errorMiddleware(
  error: IError,
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
    .json({ error: true, statusCode: status, message });
}
