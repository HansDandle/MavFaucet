import React from 'react';
import { Coins, Loader2, AlertCircle } from 'lucide-react';

interface TokenClaimProps {
  claimableAmount: string;
  isClaiming: boolean;
  isLoading: boolean;
  error: string | null;
  onClaim: () => void;
  onRefresh: () => void;
}

export const TokenClaim: React.FC<TokenClaimProps> = ({
  claimableAmount,
  isClaiming,
  isLoading,
  error,
  onClaim,
  onRefresh,
}) => {
  const canClaim = parseFloat(claimableAmount) > 0;
  // Display raw value as integer with commas, assuming contract returns tokens, not wei
  function formatAmount(amount: string) {
    // If the value is huge, convert from wei to tokens by dividing by 1e18 and rounding down
    const num = Number(amount);
    if (!isFinite(num)) return amount;
    // If the number is greater than 1e9, assume it's wei and convert
    const displayNum = num > 1e9 ? Math.floor(num / 1e18) : Math.floor(num);
    return displayNum.toLocaleString();
  }
  const formattedAmount = formatAmount(claimableAmount);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">MAV Faucet</h2>
          <p className="text-gray-600">Claim your free MAV tokens on Base L2</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Claimable Amount:</span>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 text-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Refresh'}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin text-blue-600" />
                <span className="text-gray-600">Loading...</span>
              </div>
            ) : (
              <div>
                <span className="text-3xl font-bold text-gray-800">
                  {formattedAmount}
                </span>
                <span className="text-gray-600 ml-2">MAV</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <div className="text-red-700 text-sm">
              <p>{error}</p>
              {error.includes('Contract address not configured') && (
                <p className="mt-1 text-xs">
                  Set VITE_REACT_APP_FAUCET_ADDRESS in your .env file with your deployed contract address.
                </p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onClaim}
          disabled={!canClaim || isClaiming || isLoading}
          className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform flex items-center justify-center gap-3 ${
            canClaim && !isClaiming && !isLoading
              ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white hover:scale-105 shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isClaiming ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Claiming Tokens...
            </>
          ) : !canClaim ? (
            'No Tokens Available'
          ) : (
            <>
              <Coins size={20} />
              Claim MAV Tokens
            </>
          )}
        </button>

        {!canClaim && !isLoading && (
          <p className="text-gray-500 text-sm text-center mt-3">
            You have no claimable MAV tokens at this time. Check back later!
          </p>
        )}
      </div>
    </div>
  );
};