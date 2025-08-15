# MAV Token Faucet

A React frontend for claiming MAV tokens on Base L2 network.

## Features

- 🔗 Wallet connection (MetaMask, Base Wallet)
- 🌐 Base L2 network detection and switching
- 💰 Real-time claimable token balance
- 🎯 One-click token claiming
- 📊 Transaction history tracking
- 📱 Fully responsive design

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure contract address:**
   Set your contract address using environment variables:
   ```bash
   # Create .env file
   echo "VITE_REACT_APP_FAUCET_ADDRESS=0xYourActualFaucetContractAddress" > .env
   ```
   
   Or update the environment variable `VITE_REACT_APP_FAUCET_ADDRESS` with your deployed contract address.

3. **Run development server:**
   ```bash
   npm run dev
   ```

## Deployment

This app is configured for static deployment on Netlify:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to Netlify or connect your GitHub repository.

The `netlify.toml` file ensures proper SPA routing.

## Environment Variables

Optional environment variables for RPC fallback:

- `VITE_REACT_APP_BASE_RPC` - Base L2 RPC URL (defaults to public RPC)
- `VITE_REACT_APP_FAUCET_ADDRESS` - Your deployed MAV faucet contract address

## Smart Contract Integration

The app interacts with a MAV faucet contract that must implement:

- `claimable(address wallet)` - Returns claimable token amount
- `claim()` - Claims tokens for the connected wallet
- `Claimed` event - Emitted when tokens are claimed

Make sure to set the `VITE_REACT_APP_FAUCET_ADDRESS` environment variable with your deployed contract address before deployment.