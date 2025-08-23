import React from "react";
import { Header } from "./components/Header";
import { WalletConnection } from "./components/WalletConnection";
import { TokenClaim } from "./components/TokenClaim";
import { TransactionHistory } from "./components/TransactionHistory";
import { useWallet } from "./hooks/useWallet";
import { useFaucet } from "./hooks/useFaucet";

export default function Faucet() {
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
    <div>
      <Header />
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
  );
}
