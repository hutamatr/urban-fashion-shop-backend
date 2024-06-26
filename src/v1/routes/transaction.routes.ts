import { Router } from 'express';

import {
  cancelTransaction,
  createTransaction,
  deleteTransactionFromDB,
  getAllTransactionByUser,
  getTransactionById,
  getTransactionsByStatus,
  transactionNotification,
  updateTransactionStatus,
} from '../controllers/transaction.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getTransactionsByStatus);
router.get('/user', authMiddleware, getAllTransactionByUser);
router.get('/:transactionId', authMiddleware, getTransactionById);
router.post('/', authMiddleware, createTransaction);
router.post('/cancel', authMiddleware, cancelTransaction);
router.post('/notification', transactionNotification);
router.put('/:transactionId', authMiddleware, updateTransactionStatus);
router.delete('/:transactionId', authMiddleware, deleteTransactionFromDB);

export default router;
