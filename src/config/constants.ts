// Base L2 Network Configuration
export const BASE_L2_CHAIN_ID = 8453; // Base Mainnet
export const BASE_L2_RPC_URL = 'https://mainnet.base.org';

// Contract Configuration
export const MAV_FAUCET_CONTRACT_ADDRESS = import.meta.env.VITE_REACT_APP_FAUCET_ADDRESS || '0x1234567890123456789012345678901234567890'; // Replace with actual deployed contract address
export const MAV_TOKEN_DECIMALS = 18;

// Network Details
export const BASE_L2_NETWORK = {
  chainId: `0x${BASE_L2_CHAIN_ID.toString(16)}`,
  chainName: 'Base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [BASE_L2_RPC_URL],
  blockExplorerUrls: ['https://basescan.org'],
};