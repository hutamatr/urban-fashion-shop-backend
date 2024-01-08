import { z as zod } from 'zod';

import { CANCELED, PAID, PENDING_PAYMENT } from '../utils/constants';

export const transactionValidation = zod.object({
  body: zod.object({
    total_price: zod
      .number({
        required_error: 'Total price is required',
        invalid_type_error: 'Total price must be a number',
      })
      .nonnegative('Total price cant be n negative'),
    status: zod.enum([PENDING_PAYMENT, CANCELED, PAID], {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be a string',
    }),
  }),
});

export const updateTransactionValidation = zod.object({
  body: zod.object({
    status: zod.enum([PENDING_PAYMENT, CANCELED, PAID], {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be a string',
    }),
  }),
});
