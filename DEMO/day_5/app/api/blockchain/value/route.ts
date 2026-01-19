// API Route: GET /api/blockchain/value
// Returns current value, message, and owner from smart contract

import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';

const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'message',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const CONTRACT_ADDRESS = (process.env.CONTRACT_ADDRESS || '0x29be1a8eb7494a93470e07ed2e61cae0b4c7603b') as `0x${string}`;
const RPC_URL = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

export async function GET() {
  try {
    const client = createPublicClient({
      chain: avalancheFuji,
      transport: http(RPC_URL, { timeout: 10_000 }),
    });

    const [value, message, owner] = await Promise.all([
      client.readContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'getValue',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'message',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'owner',
      }),
    ]);

    return NextResponse.json({
      value: String(value),
      message: String(message),
      owner: String(owner),
    });
  } catch (error) {
    console.error('Blockchain read error:', error);
    return NextResponse.json(
      { error: 'Failed to read from blockchain' },
      { status: 503 }
    );
  }
}
