'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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

// Loading Skeleton Component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />
);

// Error Alert Component
const ErrorAlert = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-red-900/20 border border-red-700/50">
    <span className="text-red-400 text-lg">⚠️</span>
    <div className="flex-1">
      <p className="text-sm text-red-400">{message}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

// Success Toast Component
const SuccessToast = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-900/30 border border-green-700/50 animate-fade-in">
    <span className="text-green-400 text-lg">✅</span>
    <p className="text-sm text-green-400">{message}</p>
  </div>
);

export default function Page() {
  // 🔹 WALLET STATE
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting, error: connectError } = useConnect();
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
    error: directReadError,
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
  const { writeContract, data: txHash, isPending: isWriting, error: writeError } = useWriteContract();
  
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
      setEventsError('Please enter both From Block and To Block');
      return;
    }
    
    const from = Number(fromBlock);
    const to = Number(toBlock);
    
    if (to - from > 2048) {
      setEventsError('Block range cannot exceed 2048 blocks');
      return;
    }
    
    if (from > to) {
      setEventsError('From Block must be less than To Block');
      return;
    }
    
    setIsLoadingEvents(true);
    setEventsError(null);
    try {
      const data = await fetchEvents(from, to);
      setEvents(data);
      if (data.length === 0) {
        setEventsError('No events found in this block range');
      }
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // 🔹 AUTO-REFRESH: Load backend data on mount
  useEffect(() => {
    if (useBackendAPI) {
      loadFromBackend();
    }
  }, [useBackendAPI, loadFromBackend]);

  // 🔹 AUTO-REFRESH: After transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
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
  const readError = useBackendAPI ? backendError : (directReadError ? directReadError.message : null);

  // 🔹 UI
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white">
      
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔺</span>
            <span className="font-bold">Day 5 dApp</span>
          </div>
          <Link 
            href="/api-docs" 
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors"
          >
            📡 API Docs
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto p-4 space-y-5">
        
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Full Stack dApp
          </h1>
          <p className="text-sm text-gray-500 mt-1">Avalanche Indonesia Short Course</p>
        </div>

        {/* 🔹 READ MODE TOGGLE */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
          <button
            onClick={() => setUseBackendAPI(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !useBackendAPI 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
            }`}
          >
            🔗 Direct RPC
          </button>
          <button
            onClick={() => setUseBackendAPI(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              useBackendAPI 
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' 
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
            }`}
          >
            📡 Backend API
          </button>
        </div>

        {/* 🔹 WALLET CONNECT */}
        <div className="p-4 rounded-2xl bg-gray-800/30 border border-gray-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400 font-medium">Step 1: Connect Wallet</p>
            {isConnected && (
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            )}
          </div>
          
          {connectError && (
            <ErrorAlert message={connectError.message} />
          )}
          
          {!isConnected ? (
            <button
              onClick={() => connect({ connector: injected() })}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <><span className="animate-spin">⏳</span> Connecting...</>
              ) : (
                <><span>🦊</span> Connect Wallet</>
              )}
            </button>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50">
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="font-mono text-xs text-green-400">{address?.slice(0,6)}...{address?.slice(-4)}</p>
              </div>
              <button
                onClick={() => disconnect()}
                className="px-3 py-1.5 text-xs text-red-400 border border-red-700/50 rounded-lg hover:bg-red-900/20 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* 🔹 READ CONTRACT */}
        <div className="p-4 rounded-2xl bg-gray-800/30 border border-gray-700/50 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400 font-medium">Step 2: Read Contract</p>
            <span className={`text-xs px-2 py-1 rounded-full ${useBackendAPI ? 'bg-green-900/50 text-green-400 border border-green-700/50' : 'bg-cyan-900/50 text-cyan-400 border border-cyan-700/50'}`}>
              {useBackendAPI ? '📡 Backend' : '🔗 Direct'}
            </span>
          </div>

          {readError && (
            <ErrorAlert 
              message={readError} 
              onRetry={() => useBackendAPI ? loadFromBackend() : refetchValue()}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-gray-900/50">
              <p className="text-xs text-gray-500 mb-1">Current Value</p>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold text-cyan-400">{displayValue ?? '—'}</p>
              )}
            </div>
            <div className="p-3 rounded-xl bg-gray-900/50">
              <p className="text-xs text-gray-500 mb-1">Current Message</p>
              {isLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <p className="text-sm font-medium text-purple-400 break-words">{displayMessage || '(empty)'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Owner: {isLoading ? (
                <Skeleton className="inline-block h-4 w-24" />
              ) : (
                <span className="font-mono text-gray-400">{displayOwner ? `${String(displayOwner).slice(0,6)}...${String(displayOwner).slice(-4)}` : '—'}</span>
              )}
            </div>
            <button
              onClick={() => useBackendAPI ? loadFromBackend() : (refetchValue(), refetchMessage())}
              disabled={isLoading}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span> Refresh
            </button>
          </div>
        </div>

        {/* 🔹 WRITE CONTRACT */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-700/30 space-y-3">
          <p className="text-sm text-gray-300 font-medium">Step 3: Update Contract</p>

          {writeError && (
            <ErrorAlert message={writeError.message} />
          )}

          <input
            type="number"
            placeholder="Enter new value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-900/70 border border-gray-700 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />

          <input
            type="text"
            placeholder="Enter new message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-900/70 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
          />

          <button
            onClick={handleSetBoth}
            disabled={isWriting || isConfirming || !isConnected || (!inputValue && !inputMessage)}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isWriting ? (
              <><span className="animate-spin">⏳</span> Sending...</>
            ) : isConfirming ? (
              <><span className="animate-spin">⏳</span> Confirming...</>
            ) : (
              <><span>🚀</span> Set Value & Message</>
            )}
          </button>

          {!isConnected && (
            <p className="text-xs text-yellow-500 text-center">⚠️ Connect wallet to send transaction</p>
          )}

          {isConfirmed && (
            <SuccessToast message="Transaction confirmed! Data refreshed." />
          )}
        </div>

        {/* 🔹 EVENT HISTORY */}
        <div className="p-4 rounded-2xl bg-gray-800/30 border border-gray-700/50 space-y-3">
          <p className="text-sm text-gray-400 font-medium">📜 Event History</p>
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="From Block"
              value={fromBlock}
              onChange={(e) => setFromBlock(e.target.value)}
              className="p-2.5 rounded-xl bg-gray-900/70 border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            />
            <input
              type="number"
              placeholder="To Block"
              value={toBlock}
              onChange={(e) => setToBlock(e.target.value)}
              className="p-2.5 rounded-xl bg-gray-900/70 border border-gray-700 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
          
          <button
            onClick={loadEvents}
            disabled={isLoadingEvents}
            className="w-full py-2.5 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 rounded-xl text-sm font-medium disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isLoadingEvents ? (
              <><span className="animate-spin">⏳</span> Loading...</>
            ) : (
              <><span>📜</span> Fetch Events</>
            )}
          </button>

          {eventsError && (
            <div className={`text-sm p-2 rounded-lg text-center ${
              eventsError.includes('No events') 
                ? 'text-yellow-400 bg-yellow-900/20' 
                : 'text-red-400 bg-red-900/20'
            }`}>
              {eventsError}
            </div>
          )}

          {events.length > 0 && (
            <div className="overflow-x-auto rounded-xl bg-gray-900/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-700">
                    <th className="text-left p-2">Block</th>
                    <th className="text-left p-2">Value</th>
                    <th className="text-left p-2">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, idx) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-2 text-cyan-400">{event.blockNumber}</td>
                      <td className="p-2 text-purple-400">{event.value}</td>
                      <td className="p-2 font-mono text-gray-400">
                        <a 
                          href={`https://testnet.snowtrace.io/tx/${event.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-cyan-400 transition-colors"
                        >
                          {event.txHash.slice(0, 8)}...
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {events.length === 0 && !isLoadingEvents && !eventsError && (
            <p className="text-xs text-gray-600 text-center py-2">Enter block range and click Fetch</p>
          )}
        </div>

        {/* 🔹 FOOTER */}
        <footer className="text-center space-y-2 pt-4 pb-8">
          <p className="text-xs text-gray-600">
            Contract: <code className="text-cyan-400/70">{CONTRACT_ADDRESS.slice(0,10)}...{CONTRACT_ADDRESS.slice(-6)}</code>
          </p>
          <p className="text-xs text-gray-700">Muhammad Fikri Rezandi | 231011402149</p>
        </footer>

      </div>
    </main>
  );
}
