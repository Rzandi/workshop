'use client';

import { useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { CONTRACT_ADDRESS, SIMPLE_STORAGE_ABI } from '@/lib/contract';

export default function Page() {

  // 🔹 WALLET STAT
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // 🔹 LOCAL STATE
  const [inputValue, setInputValue] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  // 🔹 READ CONTRACT
  const {
    data: value,
    isLoading: isReadingValue,
    refetch: refetchValue,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
  });

  const {
    data: message,
    isLoading: isReadingMessage,
    refetch: refetchMessage,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'message',
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'owner',
  });

  // 🔹 WRITE CONTRACT
  const { writeContract, isPending: isWriting } = useWriteContract();

  const handleSetBoth = async () => {
    if (!inputValue && !inputMessage) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_STORAGE_ABI,
      functionName: 'setValueAndMessage',
      args: [BigInt(inputValue || '0'), inputMessage || ''],
    });
  };

  // 🔹 UI
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="w-full max-w-md border border-gray-700 rounded-2xl p-6 space-y-6 bg-black/50 backdrop-blur-sm shadow-2xl">

        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          🔺 Day 3 – Avalanche dApp
        </h1>

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
          <p className="text-sm text-gray-400 font-medium">Step 2: Read Contract</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Current Value</p>
              {isReadingValue ? (
                <p className="text-lg">Loading...</p>
              ) : (
                <p className="text-2xl font-bold text-cyan-400">{value?.toString() ?? '?'}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Message</p>
              {isReadingMessage ? (
                <p className="text-lg">Loading...</p>
              ) : (
                <p className="text-sm font-medium text-purple-400 break-words">{message || '(empty)'}</p>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-600">
            Owner: <span className="font-mono">{owner ? `${owner.slice(0,6)}...${owner.slice(-4)}` : '?'}</span>
          </div>

          <button
            onClick={() => { refetchValue(); refetchMessage(); }}
            className="text-sm underline text-gray-400 hover:text-white"
          >
            🔄 Refresh
          </button>
        </div>

        {/* 🔹 WRITE CONTRACT - COMBINED */}
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
            disabled={isWriting || !isConnected}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWriting ? '⏳ Sending...' : '🚀 Set Value & Message'}
          </button>
        </div>

        {/* 🔹 FOOTNOTE */}
        <p className="text-xs text-gray-500 text-center">
          Muhammad Fikri Rezandi | 231011402149
        </p>

      </div>
    </main>
  );
}
