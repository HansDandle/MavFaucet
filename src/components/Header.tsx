import React from 'react';
import { Droplets } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
          <Droplets size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          MAV Faucet
        </h1>
      </div>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
        Claim your free MAV tokens on Base L2. Connect your wallet and claim tokens instantly with zero gas fees.
      </p>
      <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        Powered by Base L2
      </div>
    </header>
  );
};