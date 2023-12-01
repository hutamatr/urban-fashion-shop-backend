import { z as zod } from 'zod';

/* The code is defining a validation schema using the Zod library for a product object. */
export const categoryValidation = zod.object({
  body: zod.object({
    name: zod
      .string({
        required_error: 'Category name is required',
        invalid_type_error: 'Category name must be a string',
      })
      .trim()
      .min(5, { message: 'Category name must be 5 or more characters long' })
      .max(100, {
        message: 'Category name must less than 100 characters',
      }),
  }),
});
