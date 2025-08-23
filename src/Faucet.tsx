import React from "react";
import { Header } from "./components/Header";
import { WalletConnection } from "./components/WalletConnection";
import { TokenClaim } from "./components/TokenClaim";
import { TransactionHistory } from "./components/TransactionHistory";
import { useWallet } from "./hooks/useWallet";
import { useFaucet } from "./hooks/useFaucet";

export default function Faucet() {
  // Add token to MetaMask
  const importToken = async () => {
    if (!window.ethereum) return alert("MetaMask not found");
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: import.meta.env.VITE_REACT_APP_MAVTOKEN_ADDRESS || "YOUR_MAV_TOKEN_ADDRESS",
            symbol: "MAV",
            decimals: 18,
            image: "https://i.imgur.com/E50synK.jpeg"
          }
        }
      });
    } catch (err) {
      alert("Could not add token");
    }
  };
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
      <button style={{ background: "#333", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", marginBottom: 12, cursor: "pointer" }} onClick={importToken}>
        Import MAV Token to MetaMask
      </button>
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
