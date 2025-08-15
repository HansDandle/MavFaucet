import React from 'react';
import { Wallet, AlertTriangle, CheckCircle } from 'lucide-react';

interface WalletConnectionProps {
  address: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork: () => void;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  address,
  isConnected,
  isCorrectNetwork,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={onConnect}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
        >
          <Wallet size={24} />
          Connect Wallet
        </button>
        <p className="text-gray-600 text-sm text-center mt-3">
          Connect your MetaMask or Base Wallet to claim MAV tokens
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {formatAddress(address!)}
              </p>
              <div className="flex items-center gap-2">
                {isCorrectNetwork ? (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm text-green-600">Base L2</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} className="text-amber-500" />
                    <span className="text-sm text-amber-600">Wrong Network</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onDisconnect}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {!isCorrectNetwork && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-amber-600" />
            <p className="font-medium text-amber-800">Wrong Network</p>
          </div>
          <p className="text-amber-700 text-sm mb-3">
            Please switch to Base L2 network to use the MAV faucet.
          </p>
          <button
            onClick={onSwitchNetwork}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Switch to Base L2
          </button>
        </div>
      )}
    </div>
  );
};