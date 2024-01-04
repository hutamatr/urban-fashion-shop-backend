import { Router } from 'express';

import {
  signInAdminHandler,
  signUpAdminHandler,
} from '../controllers/authAdminController';
import {
  changePasswordHandler,
  resetPasswordHandler,
  resetPasswordLinkHandler,
  signInUserHandler,
  signOutHandler,
  signUpUserHandler,
} from '../controllers/authController';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  changePasswordValidation,
  resetPasswordLinkValidation,
  resetPasswordValidation,
  signInValidation,
  signUpValidation,
} from '../../validations/authValidation';

const router = Router();

router.post('/signup', validate(signUpValidation), signUpUserHandler);

router.post('/signin', validate(signInValidation), signInUserHandler);

router.post('/signout', signOutHandler);

router.post('/admin/signup', validate(signUpValidation), signUpAdminHandler);

router.post('/admin/signin', validate(signInValidation), signInAdminHandler);

router.post(
  '/change-password',
  authMiddleware,
  validate(changePasswordValidation),
  changePasswordHandler
);

router.post(
  '/reset-password',
  validate(resetPasswordLinkValidation),
  resetPasswordLinkHandler
);

router.post(
  '/reset-password/:userId/:token',
  validate(resetPasswordValidation),
  resetPasswordHandler
);

export default router;
