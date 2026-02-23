// Transaction controller - handles transaction history requests
import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service.js';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { logger } from '../utils/logger.js';

export class TransactionsController {
  private transactionService: TransactionService;

  constructor(transactionService?: TransactionService) {
    this.transactionService = transactionService || new TransactionService();
  }

  getTransactionHistory = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const authenticatedUserId = (req as any).user?.userId;

      // Verify user can only access their own transactions
      if (userId !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Cannot access other users transactions',
        });
      }

      // Extract query parameters
      const {
        type,
        status,
        startDate,
        endDate,
        page = '1',
        limit = '20',
      } = req.query;

      // Build filters
      const filters: any = {};

      if (type && Object.values(TransactionType).includes(type as TransactionType)) {
        filters.type = type as TransactionType;
      }

      if (status && Object.values(TransactionStatus).includes(status as TransactionStatus)) {
        filters.status = status as TransactionStatus;
      }

      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }

      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }

      // Validate pagination
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

      const result = await this.transactionService.getTransactionHistory(
        userId,
        filters,
        { page: pageNum, limit: limitNum }
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error fetching transaction history', { error });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch transaction history',
      });
    }
  };
}

export const transactionsController = new TransactionsController();
