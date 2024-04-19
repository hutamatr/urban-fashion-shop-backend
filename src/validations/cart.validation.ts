import { z as zod } from 'zod';

/**
 * The code is defining a validation schema using the Zod library for a cart object.
 * The `cartValidation` constant is assigned the result of calling the `zod.object()`
 * function, which creates a new Zod object schema.
 **/
export const cartValidation = zod.object({
  body: zod.object({
    product_id: zod
      .number({
        required_error: 'Product id is required',
        invalid_type_error: 'Product id must be a number',
      })
      .nonnegative('Product id cant be a negative'),
    quantity: zod
      .number({
        required_error: 'Quantity is required',
        invalid_type_error: 'Quantity must be a number',
      })
      .nonnegative('Quantity cant be n negative'),
  }),
});
