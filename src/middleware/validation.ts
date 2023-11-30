import { NextFunction, Request, Response } from 'express';

import {
  signInValidation,
  signUpValidation,
} from '../validations/authValidation';
import { productValidation } from '../validations/productValidation';

/**
 * The `validate` function is a middleware that validates the request body, query parameters, and route
 * parameters against a given schema and passes the request to the next middleware if the validation is
 * successful, otherwise it throws an error.
 * @param {typeof productValidation | typeof signUpValidation} schema - The `schema` parameter is a
 * validation schema that can be either `productValidation` or `signUpValidation`. It is used to
 * validate the request body, query parameters, and route parameters.
 * @returns the result of calling the `next()` function.
 */
export const validate =
  (
    schema:
      | typeof productValidation
      | typeof signUpValidation
      | typeof signInValidation
  ) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (!error.statusCode) {
        error.statusCode = 403;
      }

      next(error);
    }
  };
