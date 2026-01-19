// API Route: POST /api/blockchain/events
// Returns ValueUpdated event history with block range

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';

const CONTRACT_ADDRESS = (process.env.CONTRACT_ADDRESS || '0x29be1a8eb7494a93470e07ed2e61cae0b4c7603b') as `0x${string}`;
const RPC_URL = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
const MAX_BLOCK_RANGE = 2048;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromBlock, toBlock } = body;

    // Validate input
    if (typeof fromBlock !== 'number' || typeof toBlock !== 'number') {
      return NextResponse.json(
        { error: 'fromBlock and toBlock must be numbers' },
        { status: 400 }
      );
    }

    // Validate block range
    if (toBlock - fromBlock > MAX_BLOCK_RANGE) {
      return NextResponse.json(
        { error: `Block range tidak boleh lebih dari ${MAX_BLOCK_RANGE} blocks. Range kamu: ${toBlock - fromBlock}` },
        { status: 400 }
      );
    }

    const client = createPublicClient({
      chain: avalancheFuji,
      transport: http(RPC_URL, { timeout: 15_000 }),
    });

    const events = await client.getLogs({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'ValueUpdated',
        inputs: [{ name: 'newValue', type: 'uint256', indexed: false }],
      },
      fromBlock: BigInt(fromBlock),
      toBlock: BigInt(toBlock),
    });

    const formattedEvents = events.map((event) => ({
      blockNumber: event.blockNumber?.toString() ?? '0',
      value: event.args.newValue?.toString() ?? '0',
      txHash: event.transactionHash ?? '',
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Blockchain events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events from blockchain' },
      { status: 503 }
    );
  }
}
