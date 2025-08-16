import React from 'react';
import { Droplets } from 'lucide-react';

export const Header: React.FC<{ onAbout?: () => void }> = ({ onAbout }) => {
  return (
    <header className="text-center mb-12">
      <div className="flex flex-col items-center justify-center gap-3 mb-6">
  <img src="https://i.imgur.com/E50synK.jpeg" alt="Lion Cart" className="rounded-full shadow-lg w-24 h-24 object-cover mb-2" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-800 bg-clip-text text-transparent">
          MAV Faucet
        </h1>
      </div>
      <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Claim your free MAV tokens on Base L2. DiamondPaw Mavs get the lion's share.
      </p>
      <div className="mt-4 inline-flex items-center gap-2 bg-emerald-900 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        Powered by Base L2
        <button className="ml-4 underline text-blue-400 hover:text-blue-300" onClick={onAbout}>
          About
        </button>
      </div>
    </header>
  );
};