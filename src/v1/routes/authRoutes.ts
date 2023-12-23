import { Router } from 'express';

import {
  signInAdminHandler,
  signUpAdminHandler,
} from '../controllers/authAdminController';
import {
  signInUserHandler,
  signOutHandler,
  signUpUserHandler,
} from '../controllers/authController';
import { validate } from '../../middleware/validation';
import {
  signInValidation,
  signUpValidation,
} from '../../validations/authValidation';

const router = Router();

router.post('/signup', validate(signUpValidation), signUpUserHandler);

router.post('/signin', validate(signInValidation), signInUserHandler);

router.post('/signout', signOutHandler);

router.post('/admin/signup', validate(signUpValidation), signUpAdminHandler);

router.post('/admin/signin', validate(signInValidation), signInAdminHandler);

export default router;
