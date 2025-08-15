import { useState, useEffect, useCallback } from 'react';
import { Contract, formatUnits, parseUnits, getAddress } from 'ethers';
import { MAV_FAUCET_CONTRACT_ADDRESS, MAV_TOKEN_DECIMALS } from '../config/constants';
import { FaucetState, ClaimEvent } from '../types/contract';
import mavFaucetAbi from '../contracts/MAVFaucet_abi.json';

export const useFaucet = (provider: any, address: string | null) => {
  const [faucetState, setFaucetState] = useState<FaucetState>({
    claimableAmount: '0',
    isClaiming: false,
    lastClaimHash: null,
    recentTransactions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaimableAmount = useCallback(async () => {
    if (!provider || !address) {
      setFaucetState(prev => ({ ...prev, claimableAmount: '0' }));
      return;
    }

    // Check if contract address is properly configured
    if (MAV_FAUCET_CONTRACT_ADDRESS === '0x1234567890123456789012345678901234567890') {
      setError('Contract address not configured. Please set VITE_REACT_APP_FAUCET_ADDRESS environment variable.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      
      const contract = new Contract(MAV_FAUCET_CONTRACT_ADDRESS, mavFaucetAbi, provider);
      // Use checksum address to avoid potential issues
      const checksumAddress = getAddress(address);
      const claimableWei = await contract.claimable(checksumAddress);
      const claimableFormatted = formatUnits(claimableWei, MAV_TOKEN_DECIMALS);
      console.log('claimableWei:', claimableWei.toString());
      console.log('claimableFormatted:', claimableFormatted);
      setFaucetState(prev => ({ 
        ...prev, 
        claimableAmount: claimableFormatted 
      }));
    } catch (err: any) {
      console.error('Error fetching claimable amount:', err);
      
      // Provide more specific error messages
      if (err.code === 'CALL_EXCEPTION') {
        setError('Contract call failed. Please check if the contract address is correct and the network is Base L2.');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Failed to fetch claimable amount: ${err.message || 'Unknown error'}`);
      }
      setFaucetState(prev => ({ ...prev, claimableAmount: '0' }));
    } finally {
      setIsLoading(false);
    }
  }, [provider, address]);

  const claimTokens = useCallback(async () => {
    if (!provider || !address || parseFloat(faucetState.claimableAmount) <= 0) {
      return;
    }

    // Check if contract address is properly configured
    if (MAV_FAUCET_CONTRACT_ADDRESS === '0x1234567890123456789012345678901234567890') {
      setError('Contract address not configured. Please set VITE_REACT_APP_FAUCET_ADDRESS environment variable.');
      return;
    }
    try {
      setFaucetState(prev => ({ ...prev, isClaiming: true }));
      setError(null);

      const signer = await provider.getSigner();
      const contract = new Contract(MAV_FAUCET_CONTRACT_ADDRESS, mavFaucetAbi, signer);
      
      const tx = await contract.claim();
      
      // Add pending transaction to history
      const newTransaction: ClaimEvent = {
        hash: tx.hash,
        status: 'pending',
        timestamp: Date.now(),
      };
      
      setFaucetState(prev => ({
        ...prev,
        lastClaimHash: tx.hash,
        recentTransactions: [newTransaction, ...prev.recentTransactions.slice(0, 9)],
      }));

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Update transaction status to success
        setFaucetState(prev => ({
          ...prev,
          recentTransactions: prev.recentTransactions.map(txn =>
            txn.hash === tx.hash
              ? { ...txn, status: 'success' as const, amount: faucetState.claimableAmount }
              : txn
          ),
        }));
        
        // Refresh claimable amount
        await fetchClaimableAmount();
      } else {
        // Update transaction status to failed
        setFaucetState(prev => ({
          ...prev,
          recentTransactions: prev.recentTransactions.map(txn =>
            txn.hash === tx.hash ? { ...txn, status: 'failed' as const } : txn
          ),
        }));
        setError('Transaction failed');
      }
    } catch (err: any) {
      console.error('Error claiming tokens:', err);
      
      // Provide more specific error messages
      if (err.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient funds for gas fees.');
      } else if (err.code === 'CALL_EXCEPTION') {
        setError('Contract call failed. You may not be eligible to claim tokens.');
      } else {
        setError(err.message || 'Failed to claim tokens');
      }
      
      // Update transaction status to failed if we have a hash
      if (faucetState.lastClaimHash) {
        setFaucetState(prev => ({
          ...prev,
          recentTransactions: prev.recentTransactions.map(txn =>
            txn.hash === faucetState.lastClaimHash ? { ...txn, status: 'failed' as const } : txn
          ),
        }));
      }
    } finally {
      setFaucetState(prev => ({ ...prev, isClaiming: false }));
    }
  }, [provider, address, faucetState.claimableAmount, faucetState.lastClaimHash, fetchClaimableAmount]);

  // Fetch claimable amount when wallet connects or changes
  useEffect(() => {
    fetchClaimableAmount();
  }, [fetchClaimableAmount]);

  // Auto-refresh claimable amount every 30 seconds
  useEffect(() => {
    if (!address || !provider) return;

    const interval = setInterval(fetchClaimableAmount, 30000);
    return () => clearInterval(interval);
  }, [address, provider, fetchClaimableAmount]);

  return {
    ...faucetState,
    isLoading,
    error,
    claimTokens,
    fetchClaimableAmount,
  };
};