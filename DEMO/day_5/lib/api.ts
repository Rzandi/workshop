// API client for blockchain data
// Uses internal API routes (same Vercel deployment)

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

// 🔹 Fetch current contract state from API route
export async function fetchContractState(): Promise<ContractState> {
  const res = await fetch('/api/blockchain/value', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${res.status}`);
  }

  return res.json();
}

// 🔹 Fetch ValueUpdated events from API route
export async function fetchEvents(
  fromBlock: number,
  toBlock: number
): Promise<ValueUpdatedEvent[]> {
  const res = await fetch('/api/blockchain/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromBlock, toBlock }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${res.status}`);
  }

  return res.json();
}
