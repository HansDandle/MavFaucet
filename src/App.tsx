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

  // Vite environment variable usage example
  const FAUCET_ADDRESS = import.meta.env.VITE_REACT_APP_FAUCET_ADDRESS;

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

  const [showAbout, setShowAbout] = React.useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <Header onAbout={() => setShowAbout(true)} />

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

        <footer className="text-center mt-16 text-gray-400 text-sm">
          <p>
            Built for Base L2 • 
            <a 
              href="https://base.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 ml-1"
            >
              Learn more about Base
            </a>
            {' '}|{' '}
            <button className="text-emerald-400 hover:text-emerald-300 ml-1 underline" onClick={() => setShowAbout(true)}>
              About
            </button>
          </p>
        </footer>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-lg w-full text-gray-100 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl" onClick={() => setShowAbout(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">About MAV Faucet</h2>
            <div className="flex flex-col items-center space-y-4 text-base leading-relaxed">
              <img src="/Media/lionfaucet.jpg" alt="Lion Faucet" className="rounded-lg shadow-lg w-40 h-40 object-cover mb-2" />
              <p><strong>EVMavericks NFT:</strong> EVMavericks is a community-driven NFT project celebrating Ethereum and its ecosystem. Holders are active contributors to the Ethereum space and r/ethfinance.</p>
              <p><strong>r/ethfinance:</strong> The original subreddit for Ethereum finance, discussion, and community. Many EVMavericks originated here.</p>
              <p><strong>Migration to r/ethereum:</strong> The Ethereum community is moving to r/ethereum for broader reach and continued growth. Join us to stay updated and participate in the future of Ethereum!</p>
              <p>This faucet is built for EVMavericks and the Ethereum community to claim MAV tokens on Base L2.</p>
              <p>For more details, see the <a href="/README.md" target="_blank" className="text-blue-400 underline">project README</a>.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;