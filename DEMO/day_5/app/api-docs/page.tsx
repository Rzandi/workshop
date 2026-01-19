'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function APIDocsPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: object) => {
    setLoading(true);
    setTestResult(null);
    setActiveEndpoint(endpoint);
    const startTime = Date.now();
    
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setResponseTime(Date.now() - startTime);
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponseTime(Date.now() - startTime);
      setTestResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white">
      
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔺</span>
            <span className="font-bold text-lg">Avalanche dApp API</span>
          </div>
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            ← Back to App
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700/50 rounded-full text-green-400 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            API Online
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            API Documentation
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            REST API untuk membaca data dari Smart Contract di Avalanche Fuji Testnet
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Base URL</p>
            <code className="text-green-400 text-sm break-all">
              {typeof window !== 'undefined' ? window.location.origin : ''}/api
            </code>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Network</p>
            <p className="text-cyan-400 text-sm">Avalanche Fuji (C-Chain)</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Contract</p>
            <code className="text-purple-400 text-sm">0x29be...603b</code>
          </div>
        </div>

        {/* Endpoints Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center text-sm">📋</span>
            Endpoints
          </h2>

          {/* GET /api/blockchain/value */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50 overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-md shadow-lg shadow-green-600/20">
                  GET
                </span>
                <code className="text-gray-200 font-mono">/api/blockchain/value</code>
              </div>
              
              <p className="text-gray-400 text-sm">
                Mengambil state terkini dari smart contract: <strong>value</strong>, <strong>message</strong>, dan <strong>owner</strong>.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Response Schema</p>
                  <pre className="p-3 bg-black/40 rounded-lg text-xs text-gray-300 overflow-x-auto border border-gray-800">
{`{
  "value": "string",
  "message": "string", 
  "owner": "string (address)"
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Example Response</p>
                  <pre className="p-3 bg-black/40 rounded-lg text-xs text-green-400 overflow-x-auto border border-gray-800">
{`{
  "value": "42",
  "message": "Hello Avalanche",
  "owner": "0x1234...5678"
}`}
                  </pre>
                </div>
              </div>

              <button
                onClick={() => testEndpoint('/api/blockchain/value')}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg text-sm font-medium disabled:opacity-50 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"
              >
                {loading && activeEndpoint === '/api/blockchain/value' ? (
                  <><span className="animate-spin">⏳</span> Loading...</>
                ) : (
                  <><span>▶</span> Execute</>
                )}
              </button>
            </div>
          </div>

          {/* POST /api/blockchain/events */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50 overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-bold rounded-md shadow-lg shadow-yellow-600/20">
                  POST
                </span>
                <code className="text-gray-200 font-mono">/api/blockchain/events</code>
              </div>
              
              <p className="text-gray-400 text-sm">
                Mengambil history event <strong>ValueUpdated</strong> berdasarkan block range (max 2048 blocks).
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Request Body</p>
                  <pre className="p-3 bg-black/40 rounded-lg text-xs text-yellow-400 overflow-x-auto border border-gray-800">
{`{
  "fromBlock": 40000000,
  "toBlock": 40001000
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Response (Array)</p>
                  <pre className="p-3 bg-black/40 rounded-lg text-xs text-green-400 overflow-x-auto border border-gray-800">
{`[{
  "blockNumber": "40000500",
  "value": "42",
  "txHash": "0xabc..."
}]`}
                  </pre>
                </div>
              </div>

              <button
                onClick={() => testEndpoint('/api/blockchain/events', 'POST', { fromBlock: 40000000, toBlock: 40001000 })}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg text-sm font-medium disabled:opacity-50 transition-all shadow-lg shadow-yellow-600/20 flex items-center gap-2"
              >
                {loading && activeEndpoint === '/api/blockchain/events' ? (
                  <><span className="animate-spin">⏳</span> Loading...</>
                ) : (
                  <><span>▶</span> Execute</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Response Panel */}
        {testResult && (
          <div className="rounded-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-700/50 overflow-hidden">
            <div className="px-5 py-3 bg-black/30 border-b border-cyan-700/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <span>📤</span> Response
              </h3>
              {responseTime && (
                <span className="text-xs text-gray-500">{responseTime}ms</span>
              )}
            </div>
            <pre className="p-5 overflow-x-auto text-sm text-green-400 max-h-80">
              {testResult}
            </pre>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center space-y-3 pt-8 border-t border-gray-800">
          <div className="flex items-center justify-center gap-4 text-sm">
            <a 
              href="https://testnet.snowtrace.io/address/0x29be1a8eb7494a93470e07ed2e61cae0b4c7603b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              📄 View Contract
            </a>
            <span className="text-gray-700">•</span>
            <a 
              href="https://docs.avax.network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 flex items-center gap-1"
            >
              📚 Avalanche Docs
            </a>
          </div>
          <p className="text-xs text-gray-600">Muhammad Fikri Rezandi | 231011402149</p>
        </footer>

      </div>
    </main>
  );
}
