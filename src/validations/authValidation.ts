import { z as zod } from 'zod';

import User from '../v1/models/userModel';

/** The `signUpValidation` constant is an object that defines the validation schema for the sign-up
 * process. It uses the `zod` library to define the validation rules for the request body.
 **/
export const signUpValidation = zod.object({
  body: zod
    .object({
      email: zod
        .string({
          required_error: 'Email is required',
          invalid_type_error: 'Email must be a string',
        })
        .email({
          message: 'Email must be a valid email',
        })
        .refine(
          async (value) => {
            const userByEmail = await User.findOne({ where: { email: value } });
            return !userByEmail;
          },
          { message: 'User with this email already exist!' }
        ),
      password: zod
        .string({
          required_error: 'Password is required',
          invalid_type_error: 'Password must be a string',
        })
        .trim()
        .min(8, {
          message: 'Password must be at least 8 characters long',
        })
        .max(32, {
          message: 'Password must be less than 32 characters',
        })
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{6,12}$/,
          {
            message:
              'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
          }
        ),
      confirmPassword: zod
        .string({
          required_error: 'Confirm password is required',
          invalid_type_error: 'Confirm password must be a string',
        })
        .trim()
        .min(8, {
          message: 'Confirm password must be at least 8 characters long',
        })
        .max(32, {
          message: 'Confirm password must be less than 32 characters',
        }),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: 'The passwords did not match',
          path: ['confirmPassword'],
        });
      }
    }),
});

/** The `signInValidation` constant is an object that defines the validation schema for the sign-in
 * process. It uses the `zod` library to define the validation rules for the request body.
 **/
export const signInValidation = zod.object({
  body: zod.object({
    email: zod
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email({
        message: 'Email must be a valid email',
      })
      .refine(
        async (value) => {
          const userByEmail = await User.findOne({ where: { email: value } });
          return !!userByEmail;
        },
        { message: 'User with this email are not exist!' }
      ),
    password: zod
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      })
      .trim()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(32, { message: 'Password must be less than 32 characters' })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{6,12}$/,
        {
          message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        }
      ),
  }),
});
