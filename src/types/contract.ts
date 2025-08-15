export interface ClaimEvent {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  amount?: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  provider: any | null;
}

export interface FaucetState {
  claimableAmount: string;
  isClaiming: boolean;
  lastClaimHash: string | null;
  recentTransactions: ClaimEvent[];
}