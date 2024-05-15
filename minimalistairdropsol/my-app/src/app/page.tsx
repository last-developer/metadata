'use client';

import { useState } from 'react';

export default function Home() {
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const requestAirdrop = async (network: 'devnet' | 'testnet') => {
    if (!address) {
      setMessage('Please enter a Solana address.');
      return;
    }

    setLoading(true);
    setMessage(''); // Clear previous messages

    try {
      const response = await fetch(`/api/airdrop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient: address, network }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Airdrop successful! Transaction ID: ${data.txId}`);
      } else {
        setMessage(`Airdrop failed: ${data.error}`);
      }
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error occurred';
      setMessage(`Airdrop failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4">
      <h1 className="text-4xl font-bold mb-4">Sol Airdrop</h1>
      <p className="mb-4">Enter your Solana address to receive 1 SOL</p>
      <input
        type="text"
        className="px-4 py-2 mb-4 border border-gray-300 rounded-md text-black"
        placeholder="Enter Solana address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => requestAirdrop('devnet')}
          disabled={loading}
        >
          {loading ? '...' : 'Devnet Airdrop'}
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md"
          onClick={() => requestAirdrop('testnet')}
          disabled={loading}
        >
          {loading ? '...' : 'Testnet Airdrop'}
        </button>
      </div>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
