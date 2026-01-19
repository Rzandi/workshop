'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { CONTRACT_ADDRESS, SIMPLE_STORAGE_ABI } from '@/lib/contract';
import { fetchContractState, fetchEvents, ContractState, ValueUpdatedEvent } from '@/lib/api';

export default function Page() {
  // 🔹 WALLET STATE
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // 🔹 LOCAL STATE
  const [inputValue, setInputValue] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  
  // 🔹 READ MODE TOGGLE (Backend vs Direct)
  const [useBackendAPI, setUseBackendAPI] = useState(true);
  
  // 🔹 BACKEND API STATE
  const [backendData, setBackendData] = useState<ContractState | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  
  // 🔹 EVENT HISTORY STATE
  const [events, setEvents] = useState<ValueUpdatedEvent[]>([]);
  const [fromBlock, setFromBlock] = useState('');
  const [toBlock, setToBlock] = useState('');
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // 🔹 READ CONTRACT (Direct via wagmi)
  const {
    data: directValue,
    isLoading: isReadingValue,
    refetch: refetchValue,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
  });

  const {
    data: directMessage,
    isLoading: isReadingMessage,
    refetch: refetchMessage,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'message',
  });

  const { data: directOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'owner',
  });

  // 🔹 WRITE CONTRACT
  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract();
  
  // 🔹 WAIT FOR TRANSACTION
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // 🔹 FETCH FROM BACKEND API
  const loadFromBackend = useCallback(async () => {
    setIsLoadingBackend(true);
    setBackendError(null);
    try {
      const data = await fetchContractState();
      setBackendData(data);
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Failed to fetch from backend');
    } finally {
      setIsLoadingBackend(false);
    }
  }, []);

  // 🔹 FETCH EVENTS
  const loadEvents = async () => {
    if (!fromBlock || !toBlock) {
      setEventsError('Please enter both fromBlock and toBlock');
      return;
    }
    
    setIsLoadingEvents(true);
    setEventsError(null);
    try {
      const data = await fetchEvents(Number(fromBlock), Number(toBlock));
      setEvents(data);
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // 🔹 AUTO-REFRESH: Load backend data on mount and after transaction
  useEffect(() => {
    if (useBackendAPI) {
      loadFromBackend();
    }
  }, [useBackendAPI, loadFromBackend]);

  // 🔹 AUTO-REFRESH: After transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      // Refresh both backend and direct data
      loadFromBackend();
      refetchValue();
      refetchMessage();
    }
  }, [isConfirmed, loadFromBackend, refetchValue, refetchMessage]);

  const handleSetBoth = async () => {
    if (!inputValue && !inputMessage) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_STORAGE_ABI,
      functionName: 'setValueAndMessage',
      args: [BigInt(inputValue || '0'), inputMessage || ''],
    });
  };

  // 🔹 DETERMINE DISPLAY VALUES
  const displayValue = useBackendAPI ? backendData?.value : directValue?.toString();
  const displayMessage = useBackendAPI ? backendData?.message : directMessage;
  const displayOwner = useBackendAPI ? backendData?.owner : directOwner;
  const isLoading = useBackendAPI ? isLoadingBackend : (isReadingValue || isReadingMessage);

  // 🔹 UI
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="w-full max-w-lg border border-gray-700 rounded-2xl p-6 space-y-6 bg-black/50 backdrop-blur-sm shadow-2xl">

        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          🔺 Day 5 – Full Stack dApp
        </h1>

        {/* 🔹 READ MODE TOGGLE */}
        <div className="flex items-center justify-center gap-4 p-3 rounded-xl bg-gray-800/30">
          <span className={`text-sm ${!useBackendAPI ? 'text-cyan-400' : 'text-gray-500'}`}>Direct RPC</span>
          <button
            onClick={() => setUseBackendAPI(!useBackendAPI)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              useBackendAPI ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                useBackendAPI ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${useBackendAPI ? 'text-green-400' : 'text-gray-500'}`}>Backend API</span>
        </div>

        {/* 🔹 WALLET CONNECT */}
        <div className="p-4 rounded-xl bg-gray-800/50 space-y-3">
          <p className="text-sm text-gray-400 font-medium">Step 1: Connect Wallet</p>
          
          {!isConnected ? (
            <button
              onClick={() => connect({ connector: injected() })}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : '🦊 Connect Wallet'}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Connected Address</p>
              <p className="font-mono text-xs break-all text-green-400">{address}</p>
              <button
                onClick={() => disconnect()}
                className="text-red-400 text-sm underline hover:text-red-300"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* 🔹 READ CONTRACT */}
        <div className="p-4 rounded-xl bg-gray-800/50 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400 font-medium">Step 2: Read Contract</p>
            <span className={`text-xs px-2 py-1 rounded ${useBackendAPI ? 'bg-green-900 text-green-400' : 'bg-cyan-900 text-cyan-400'}`}>
              {useBackendAPI ? '📡 Backend' : '🔗 Direct'}
            </span>
          </div>

          {backendError && useBackendAPI && (
            <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{backendError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Current Value</p>
              {isLoading ? (
                <p className="text-lg animate-pulse">Loading...</p>
              ) : (
                <p className="text-2xl font-bold text-cyan-400">{displayValue ?? '?'}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Message</p>
              {isLoading ? (
                <p className="text-lg animate-pulse">Loading...</p>
              ) : (
                <p className="text-sm font-medium text-purple-400 break-words">{displayMessage || '(empty)'}</p>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-600">
            Owner: <span className="font-mono">{displayOwner ? `${String(displayOwner).slice(0,6)}...${String(displayOwner).slice(-4)}` : '?'}</span>
          </div>

          <button
            onClick={() => {
              if (useBackendAPI) loadFromBackend();
              else { refetchValue(); refetchMessage(); }
            }}
            className="text-sm underline text-gray-400 hover:text-white"
          >
            🔄 Refresh
          </button>
        </div>

        {/* 🔹 WRITE CONTRACT */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border border-cyan-700/50 space-y-3">
          <p className="text-sm text-gray-300 font-medium">Step 3: Update Both (1 Transaction)</p>

          <input
            type="number"
            placeholder="Enter new value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-cyan-500 focus:outline-none transition-colors"
          />

          <input
            type="text"
            placeholder="Enter new message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
          />

          <button
            onClick={handleSetBoth}
            disabled={isWriting || isConfirming || !isConnected}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWriting ? '⏳ Sending...' : isConfirming ? '⏳ Confirming...' : '🚀 Set Value & Message'}
          </button>

          {isConfirmed && (
            <p className="text-sm text-green-400 text-center">✅ Transaction confirmed! Data refreshed.</p>
          )}
        </div>

        {/* 🔹 EVENT HISTORY */}
        <div className="p-4 rounded-xl bg-gray-800/50 space-y-3">
          <p className="text-sm text-gray-400 font-medium">📜 Event History (via Backend)</p>
          
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="From Block"
              value={fromBlock}
              onChange={(e) => setFromBlock(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="To Block"
              value={toBlock}
              onChange={(e) => setToBlock(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={loadEvents}
              disabled={isLoadingEvents}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm disabled:opacity-50"
            >
              {isLoadingEvents ? '...' : 'Fetch'}
            </button>
          </div>

          {eventsError && (
            <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{eventsError}</div>
          )}

          {events.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-700">
                    <th className="text-left py-2">Block</th>
                    <th className="text-left py-2">Value</th>
                    <th className="text-left py-2">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, idx) => (
                    <tr key={idx} className="border-b border-gray-800">
                      <td className="py-2 text-cyan-400">{event.blockNumber}</td>
                      <td className="py-2 text-purple-400">{event.value}</td>
                      <td className="py-2 font-mono text-gray-400">
                        {event.txHash.slice(0, 10)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {events.length === 0 && !isLoadingEvents && !eventsError && (
            <p className="text-xs text-gray-600 text-center">No events loaded. Enter block range and click Fetch.</p>
          )}
        </div>

        {/* 🔹 FOOTNOTE */}
        <p className="text-xs text-gray-500 text-center">
          Muhammad Fikri Rezandi | 231011402149
        </p>

      </div>
    </main>
  );
}
