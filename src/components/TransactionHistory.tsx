import React from 'react';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ClaimEvent } from '../types/contract';

interface TransactionHistoryProps {
  transactions: ClaimEvent[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
}) => {
  if (transactions.length === 0) {
    return null;
  }

  const getStatusIcon = (status: ClaimEvent['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
    }
  };

  const getStatusText = (status: ClaimEvent['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'success':
        return 'Success';
      case 'failed':
        return 'Failed';
    }
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(tx.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-700">
                      {formatHash(tx.hash)}
                    </span>
                    <a
                      href={`https://basescan.org/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{getStatusText(tx.status)}</span>
                    <span>•</span>
                    <span>{formatTime(tx.timestamp)}</span>
                    {tx.amount && (
                      <>
                        <span>•</span>
                        <span>{parseFloat(tx.amount).toFixed(6)} MAV</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};