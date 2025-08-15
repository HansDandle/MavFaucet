import React from 'react';
import { Header } from './components/Header';
import { WalletConnection } from './components/WalletConnection';
import { TokenClaim } from './components/TokenClaim';
import { TransactionHistory } from './components/TransactionHistory';
import { useWallet } from './hooks/useWallet';
import { useFaucet } from './hooks/useFaucet';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const {
    address,
    isConnected,
    isCorrectNetwork,
    provider,
    connectWallet,
    disconnectWallet,
    switchToBaseL2,
  } = useWallet();

  const {
    claimableAmount,
    isClaiming,
    isLoading,
    error,
    recentTransactions,
    claimTokens,
    fetchClaimableAmount,
  } = useFaucet(provider, address);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <Header />

        <div className="space-y-8">
          <WalletConnection
            address={address}
            isConnected={isConnected}
            isCorrectNetwork={isCorrectNetwork}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
            onSwitchNetwork={switchToBaseL2}
          />

          {isConnected && isCorrectNetwork && (
            <>
              <TokenClaim
                claimableAmount={claimableAmount}
                isClaiming={isClaiming}
                isLoading={isLoading}
                error={error}
                onClaim={claimTokens}
                onRefresh={fetchClaimableAmount}
              />

              <TransactionHistory transactions={recentTransactions} />
            </>
          )}
        </div>

        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>
            Built for Base L2 • 
            <a 
              href="https://base.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 ml-1"
            >
              Learn more about Base
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;