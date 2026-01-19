import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createPublicClient, http, PublicClient } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { SIMPLE_STORAGE_ABI, CONTRACT_ADDRESS } from './simple-storage.abi';

@Injectable()
export class BlockchainService {
  private client: PublicClient;
  private contractAddress: `0x${string}`;

  constructor() {
    const rpcUrl = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
    const contractAddr = process.env.CONTRACT_ADDRESS || CONTRACT_ADDRESS;
    
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http(rpcUrl, {
        timeout: 10_000,
      }),
    });
    this.contractAddress = contractAddr as `0x${string}`;
  }

  // 🔹 Read latest value + message + owner
  async getLatestValue() {
    try {
      const value = await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'getValue',
      });

      const message = await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'message',
      });

      const owner = await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'owner',
      });

      return {
        value: String(value),
        message: String(message),
        owner: String(owner),
      };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Read ValueUpdated events with block range
  async getValueUpdatedEvents(fromBlock: number, toBlock: number) {
    // Validate block range (max 2048 blocks)
    const MAX_BLOCK_RANGE = 2048;
    if (toBlock - fromBlock > MAX_BLOCK_RANGE) {
      throw new BadRequestException(
        `Block range tidak boleh lebih dari ${MAX_BLOCK_RANGE} blocks. Range kamu: ${toBlock - fromBlock}`,
      );
    }

    try {
      const events = await this.client.getLogs({
        address: this.contractAddress,
        event: {
          type: 'event',
          name: 'ValueUpdated',
          inputs: [{ name: 'newValue', type: 'uint256', indexed: false }],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      return events.map((event) => ({
        blockNumber: event.blockNumber?.toString() ?? '0',
        value: event.args.newValue?.toString() ?? '0',
        txHash: event.transactionHash ?? '',
      }));
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Centralized RPC Error Handler
  private handleRpcError(error: unknown): never {
    const message = error instanceof Error ? error.message.toLowerCase() : '';

    if (message.includes('timeout')) {
      throw new ServiceUnavailableException(
        'RPC timeout. Silakan coba beberapa saat lagi.',
      );
    }

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed')
    ) {
      throw new ServiceUnavailableException(
        'Tidak dapat terhubung ke blockchain RPC.',
      );
    }

    throw new InternalServerErrorException(
      'Terjadi kesalahan saat membaca data blockchain.',
    );
  }
}
