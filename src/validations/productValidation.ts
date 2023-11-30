import { z as zod } from 'zod';

/* The code is defining a validation schema using the Zod library for a product object. */
export const productValidation = zod.object({
  body: zod.object({
    title: zod
      .string({
        required_error: 'Product title is required',
        invalid_type_error: 'Product title must be a string',
      })
      .trim()
      .min(5, { message: 'Product title must be 5 or more characters long' })
      .max(150, {
        message: 'Product title must less than 150 characters',
      }),
    description: zod
      .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string',
      })
      .trim()
      .min(10, {
        message: 'Product description must be 10 or more characters long',
      })
      .max(500, {
        message: 'Product description must less than 500 characters',
      }),
    price: zod
      .number({
        required_error: 'Price is required',
        invalid_type_error: 'Price must be a number',
      })
      .nonnegative({
        message: 'Price cannot be negative',
      })
      .min(1, { message: 'Price must be greater than 0' }),
    quantity: zod
      .number({
        required_error: 'Quantity is required',
        invalid_type_error: 'Quantity must be a number',
      })
      .nonnegative({
        message: 'Quantity cannot be negative',
      })
      .min(1, { message: 'Quantity must be greater than 0' }),
  }),
});
