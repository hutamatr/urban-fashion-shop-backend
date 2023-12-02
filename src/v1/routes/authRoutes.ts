import { Router } from 'express';

import {
  signInHandler,
  signOutHandler,
  signUpHandler,
} from '../controllers/authController';
import { validate } from '../../middleware/validation';
import {
  signInValidation,
  signUpValidation,
} from '../../validations/authValidation';

const router = Router();

router.post('/signup', validate(signUpValidation), signUpHandler);

router.post('/signin', validate(signInValidation), signInHandler);

router.post('/signout', signOutHandler);

export default router;
