import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { formatAddress } from '../utils/validation';

interface Transaction {
  hash: string;
  type: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  domain?: string;
  delegate?: string;
}

export function TransactionHistory() {
  const chainId = useChainId();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`transactionHistory_${chainId}`);
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, [chainId]);

  useEffect(() => {
    localStorage.setItem(`transactionHistory_${chainId}`, JSON.stringify(transactions));
  }, [transactions, chainId]);

  const getExplorerUrl = (txHash: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      11155111: 'https://sepolia.etherscan.io/tx/',
      31337: '#',
    };
    return `${explorers[chainId] || 'https://etherscan.io/tx/'}${txHash}`;
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all transaction history?')) {
      setTransactions([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
          <p className="text-sm text-gray-600">
            View your recent transactions and their status
          </p>
        </div>
        {transactions.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear History
          </button>
        )}
      </div>

      {transactions.length > 0 ? (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="space-y-3">
            {transactions
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((tx) => (
                <div
                  key={tx.hash}
                  className="p-4 bg-white rounded-md border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{tx.type}</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {tx.domain && (
                    <div className="text-sm text-gray-600 mb-1">
                      Domain: {tx.domain}
                    </div>
                  )}
                  {tx.delegate && (
                    <div className="text-sm text-gray-600 mb-1">
                      Delegate: {formatAddress(tx.delegate)}
                    </div>
                  )}
                  <a
                    href={getExplorerUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-mono"
                  >
                    {formatAddress(tx.hash, 10, 8)}
                  </a>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-gray-500">
          No transactions yet. Your transaction history will appear here.
        </div>
      )}
    </div>
  );
}

export function addTransactionToHistory(
  hash: string,
  type: string,
  chainId: number,
  domain?: string,
  delegate?: string
) {
  const saved = localStorage.getItem(`transactionHistory_${chainId}`);
  const transactions: Transaction[] = saved ? JSON.parse(saved) : [];
  
  transactions.push({
    hash,
    type,
    timestamp: Date.now(),
    status: 'pending',
    domain,
    delegate,
  });
  
  localStorage.setItem(`transactionHistory_${chainId}`, JSON.stringify(transactions));
}

export function updateTransactionStatus(
  hash: string,
  status: 'success' | 'failed',
  chainId: number
) {
  const saved = localStorage.getItem(`transactionHistory_${chainId}`);
  const transactions: Transaction[] = saved ? JSON.parse(saved) : [];
  
  const index = transactions.findIndex(tx => tx.hash === hash);
  if (index !== -1) {
    transactions[index].status = status;
    localStorage.setItem(`transactionHistory_${chainId}`, JSON.stringify(transactions));
  }
}

