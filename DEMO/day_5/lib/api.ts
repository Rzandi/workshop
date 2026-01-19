// API client for backend integration (Day 5)
// Consume NestJS backend endpoints

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';

// Types
export interface ContractState {
  value: string;
  message: string;
  owner: string;
}

export interface ValueUpdatedEvent {
  blockNumber: string;
  value: string;
  txHash: string;
}

// 🔹 Fetch current contract state from backend
export async function fetchContractState(): Promise<ContractState> {
  const res = await fetch(`${BACKEND_URL}/blockchain/value`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// 🔹 Fetch ValueUpdated events from backend
export async function fetchEvents(
  fromBlock: number,
  toBlock: number
): Promise<ValueUpdatedEvent[]> {
  const res = await fetch(`${BACKEND_URL}/blockchain/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromBlock, toBlock }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Backend error: ${res.status}`);
  }

  return res.json();
}
