// Transaction service - business logic for transaction history
import { prisma } from '../database/prisma.js';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { logger } from '../utils/logger.js';

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export class TransactionService {
  async getTransactionHistory(
    userId: string,
    filters: TransactionFilters = {},
    pagination: PaginationParams = {}
  ) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    if (filters.type) {
      where.txType = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // Execute query with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async recordTransaction(data: {
    userId: string;
    txType: TransactionType;
    amountUsdc: number;
    txHash: string;
    fromAddress: string;
    toAddress: string;
    status?: TransactionStatus;
  }) {
    try {
      const transaction = await prisma.transaction.create({
        data: {
          userId: data.userId,
          txType: data.txType,
          amountUsdc: data.amountUsdc,
          txHash: data.txHash,
          fromAddress: data.fromAddress,
          toAddress: data.toAddress,
          status: data.status || TransactionStatus.PENDING,
        },
      });

      logger.info('Transaction recorded', {
        transactionId: transaction.id,
        userId: data.userId,
        type: data.txType,
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to record transaction', { error, data });
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
