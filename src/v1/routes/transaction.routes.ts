import { Router } from 'express';

import {
  createTransaction,
  getTransactionById,
  getTransactions,
  transactionNotification,
  updateTransactionStatus,
} from '../controllers/transaction.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getTransactions);
router.get('/:transactionId', authMiddleware, getTransactionById);
router.post('/', authMiddleware, createTransaction);
router.put('/:transactionId', authMiddleware, updateTransactionStatus);
router.post('/notification', transactionNotification);

export default router;
