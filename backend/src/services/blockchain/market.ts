// backend/src/services/blockchain/market.ts
// Market contract interaction service

import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
} from '@stellar/stellar-sdk';
import { BaseBlockchainService } from './base.js';
import { logger } from '../../utils/logger.js';

export interface MarketActionResult {
  txHash: string;
}

export class MarketBlockchainService extends BaseBlockchainService {
  constructor() {
    super('MarketBlockchainService');
  }

  /**
   * Resolve a market on the blockchain
   * @param marketContractAddress - The contract address of the market
   * @returns Transaction hash
   */
  async resolveMarket(
    marketContractAddress: string
  ): Promise<MarketActionResult> {
    if (!this.adminKeypair) {
      throw new Error(
        'ADMIN_WALLET_SECRET not configured - cannot sign transactions'
      );
    }
    try {
      const contract = new Contract(marketContractAddress);
      const sourceAccount = await this.rpcServer.getAccount(
        this.adminKeypair.publicKey()
      );

      const builtTransaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('resolve_market'))
        .setTimeout(30)
        .build();

      const preparedTransaction =
        await this.rpcServer.prepareTransaction(builtTransaction);
      preparedTransaction.sign(this.adminKeypair);

      const response =
        await this.rpcServer.sendTransaction(preparedTransaction);

      if (response.status === 'PENDING') {
        const txHash = response.hash;
        // Use unified retry logic from BaseBlockchainService
        await this.waitForTransaction(txHash, 'resolveMarket', {
          marketContractAddress,
        });
        return { txHash };
      } else {
        throw new Error(`Transaction failed: ${response.status}`);
      }
    } catch (error) {
      logger.error('Market.resolve_market() error', { error });
      throw new Error(
        `Failed to resolve market on blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Claim winnings for a user
   */
  async claimWinnings(
    marketContractAddress: string,
    userPublicKey: string
  ): Promise<MarketActionResult> {
    if (!this.adminKeypair) {
      throw new Error(
        'ADMIN_WALLET_SECRET not configured - cannot sign transactions'
      );
    }
    try {
      const contract = new Contract(marketContractAddress);
      const sourceAccount = await this.rpcServer.getAccount(
        this.adminKeypair.publicKey()
      );

      const builtTransaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'claim_winnings',
            nativeToScVal(userPublicKey, { type: 'address' })
          )
        )
        .setTimeout(30)
        .build();

      const preparedTransaction =
        await this.rpcServer.prepareTransaction(builtTransaction);
      preparedTransaction.sign(this.adminKeypair);

      const response =
        await this.rpcServer.sendTransaction(preparedTransaction);

      if (response.status === 'PENDING') {
        const txHash = response.hash;
        // Use unified retry logic from BaseBlockchainService
        await this.waitForTransaction(txHash, 'claimWinnings', {
          marketContractAddress,
          userPublicKey,
        });
        return { txHash };
      } else {
        throw new Error(`Transaction failed: ${response.status}`);
      }
    } catch (error) {
      logger.error('Market.claim_winnings() error', { error });
      throw new Error(
        `Failed to claim winnings on blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  /**
   * Commit a prediction on the blockchain
   * @param marketContractAddress - The contract address of the market
   * @param userPublicKey - The user's public key
   * @param commitmentHash - The hash of the prediction commitment
   * @returns Transaction hash
   */
  async commitPrediction(
    marketContractAddress: string,
    userPublicKey: string,
    commitmentHash: string
  ): Promise<MarketActionResult> {
    if (!this.adminKeypair) {
      throw new Error(
        'ADMIN_WALLET_SECRET not configured - cannot sign transactions'
      );
    }
    try {
      const contract = new Contract(marketContractAddress);
      const sourceAccount = await this.rpcServer.getAccount(
        this.adminKeypair.publicKey()
      );

      const builtTransaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'commit',
            nativeToScVal(userPublicKey, { type: 'address' }),
            nativeToScVal(commitmentHash, { type: 'bytes' })
          )
        )
        .setTimeout(30)
        .build();

      const preparedTransaction =
        await this.rpcServer.prepareTransaction(builtTransaction);
      preparedTransaction.sign(this.adminKeypair);

      const response =
        await this.rpcServer.sendTransaction(preparedTransaction);

      if (response.status === 'PENDING') {
        const txHash = response.hash;
        await this.waitForTransaction(txHash, 'commitPrediction', {
          marketContractAddress,
          userPublicKey,
          commitmentHash,
        });
        return { txHash };
      } else {
        throw new Error(`Transaction failed: ${response.status}`);
      }
    } catch (error) {
      logger.error('Market.commit() error', { error });
      throw new Error(
        `Failed to commit prediction on blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Reveal a prediction on the blockchain
   * @param marketContractAddress - The contract address of the market
   * @param userPublicKey - The user's public key
   * @param prediction - The actual prediction value
   * @param salt - The salt used in the commitment
   * @returns Transaction hash
   */
  async revealPrediction(
    marketContractAddress: string,
    userPublicKey: string,
    prediction: number,
    salt: string
  ): Promise<MarketActionResult> {
    if (!this.adminKeypair) {
      throw new Error(
        'ADMIN_WALLET_SECRET not configured - cannot sign transactions'
      );
    }
    try {
      const contract = new Contract(marketContractAddress);
      const sourceAccount = await this.rpcServer.getAccount(
        this.adminKeypair.publicKey()
      );

      const builtTransaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          contract.call(
            'reveal',
            nativeToScVal(userPublicKey, { type: 'address' }),
            nativeToScVal(prediction, { type: 'u32' }),
            nativeToScVal(salt, { type: 'bytes' })
          )
        )
        .setTimeout(30)
        .build();

      const preparedTransaction =
        await this.rpcServer.prepareTransaction(builtTransaction);
      preparedTransaction.sign(this.adminKeypair);

      const response =
        await this.rpcServer.sendTransaction(preparedTransaction);

      if (response.status === 'PENDING') {
        const txHash = response.hash;
        await this.waitForTransaction(txHash, 'revealPrediction', {
          marketContractAddress,
          userPublicKey,
          prediction,
        });
        return { txHash };
      } else {
        throw new Error(`Transaction failed: ${response.status}`);
      }
    } catch (error) {
      logger.error('Market.reveal() error', { error });
      throw new Error(
        `Failed to reveal prediction on blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get market state from the blockchain (read-only query)
   * @param marketContractAddress - The contract address of the market
   * @returns Market state data
   */
  async getMarketState(marketContractAddress: string): Promise<any> {
    if (!this.adminKeypair) {
      throw new Error(
        'ADMIN_WALLET_SECRET not configured - cannot query market state'
      );
    }
    try {
      const contract = new Contract(marketContractAddress);

      const sourceAccount = await this.rpcServer.getAccount(
        this.adminKeypair.publicKey()
      );

      const builtTransaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('get_market_state'))
        .setTimeout(30)
        .build();

      const simulationResponse =
        await this.rpcServer.simulateTransaction(builtTransaction);

      if (
        simulationResponse.results &&
        simulationResponse.results.length > 0
      ) {
        const result = simulationResponse.results[0];
        return result.retval;
      } else {
        throw new Error('No results returned from simulation');
      }
    } catch (error) {
      logger.error('Market.get_market_state() error', { error });
      throw new Error(
        `Failed to get market state from blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const marketBlockchainService = new MarketBlockchainService();