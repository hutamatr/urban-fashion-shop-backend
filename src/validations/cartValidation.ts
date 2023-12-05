import { z as zod } from 'zod';

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
