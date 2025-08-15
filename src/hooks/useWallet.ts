import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { BASE_L2_CHAIN_ID, BASE_L2_NETWORK } from '../config/constants';
import { WalletState } from '../types/contract';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isCorrectNetwork: false,
    provider: null,
  });

  const checkNetwork = useCallback(async (provider: BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      return Number(network.chainId) === BASE_L2_CHAIN_ID;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }, []);

  const switchToBaseL2 = useCallback(async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_L2_NETWORK.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // Chain not added to wallet
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_L2_NETWORK],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Base L2 network:', addError);
          return false;
        }
      }
      console.error('Error switching to Base L2:', switchError);
      return false;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or Base Wallet to use this dApp');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const isCorrectNetwork = await checkNetwork(provider);

      setWalletState({
        address,
        isConnected: true,
        isCorrectNetwork,
        provider,
      });

      if (!isCorrectNetwork) {
        const switched = await switchToBaseL2();
        if (switched) {
          setWalletState(prev => ({ ...prev, isCorrectNetwork: true }));
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }, [checkNetwork, switchToBaseL2]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      isConnected: false,
      isCorrectNetwork: false,
      provider: null,
    });
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const isCorrectNetwork = await checkNetwork(provider);

          setWalletState({
            address,
            isConnected: true,
            isCorrectNetwork,
            provider,
          });
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkExistingConnection();
  }, [checkNetwork]);

  // Listen for account and network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [connectWallet, disconnectWallet]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchToBaseL2,
  };
};