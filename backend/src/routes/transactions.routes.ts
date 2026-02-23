// Transaction routes - route definitions for transaction history
import { Router } from 'express';
import { transactionsController } from '../controllers/transactions.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/transactions/:userId - Get transaction history with filters and pagination
router.get('/:userId', authMiddleware, transactionsController.getTransactionHistory);

export default router;
