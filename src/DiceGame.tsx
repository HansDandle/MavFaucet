import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import DiceGameABI from "./abis/DiceGameBlockhash.json";
import { CONFIG, MAV_TOKEN_DECIMALS } from "./config/constants";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const DiceGame: React.FC = () => {
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");
  const [diceContract, setDiceContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [bankroll, setBankroll] = useState<string>("0");
  const [choice, setChoice] = useState<number>(1);
  const [amount, setAmount] = useState<string>("1");
  const [status, setStatus] = useState<string>("");

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const s = await provider.getSigner();
    const addr = await s.getAddress();

    const network = await provider.getNetwork();
    if (network.chainId !== parseInt(CONFIG.EXPECTED_CHAIN_ID)) {
      alert("Wrong network! Switch to Base Mainnet.");
    }

    setSigner(s);
    setAccount(addr);

    const dice = new ethers.Contract(CONFIG.DICE_ADDRESS, DiceGameABI, s);
    const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)"
    ], s);

    setDiceContract(dice);
    setTokenContract(token);
  };

  // Fetch user balance
  const fetchBalance = async () => {
    if (!tokenContract || !account) return;
    const bal: bigint = await tokenContract.balanceOf(account);
    setBalance(ethers.formatUnits(bal, MAV_TOKEN_DECIMALS));
  };

  // Fetch contract bankroll
  const fetchBankroll = async () => {
    if (!tokenContract || !diceContract) return;
    const bal: bigint = await tokenContract.balanceOf(CONFIG.DICE_ADDRESS);
    setBankroll(ethers.formatUnits(bal, MAV_TOKEN_DECIMALS));
  };

  useEffect(() => {
    if (tokenContract && account) fetchBalance();
  }, [tokenContract, account]);

  useEffect(() => {
    if (tokenContract && diceContract) fetchBankroll();
  }, [tokenContract, diceContract]);

  // Place bet
  const placeBet = async () => {
    if (!diceContract || !tokenContract || !signer) return;
    try {
      const amt: bigint = ethers.parseUnits(amount, MAV_TOKEN_DECIMALS);
      const bankrollAmt: bigint = await tokenContract.balanceOf(CONFIG.DICE_ADDRESS);

      if (amt > bankrollAmt) {
        setStatus("Bet exceeds the contract bankroll!");
        return;
      }

      setStatus("Approving tokens...");
      const approveTx = await tokenContract.approve(CONFIG.DICE_ADDRESS, amt);
      await approveTx.wait();

      setStatus("Placing bet...");
      const tx = await diceContract.placeBet(choice, amt);
      await tx.wait();

      setStatus("Bet placed! Waiting for outcome...");
      fetchBalance();
      fetchBankroll();
    } catch (err: any) {
      setStatus(`Error: ${err.message || err}`);
    }
  };

  // Listen for BetPlaced events
  useEffect(() => {
    if (!diceContract || !account) return;

    const filter = diceContract.filters.BetPlaced(account);
    const handler = (_player: string, _betAmt: bigint, _ch: number, roll: number, win: boolean, payout: bigint) => {
      setStatus(`Rolled ${roll}. You ${win ? "won" : "lost"}! Payout: ${ethers.formatUnits(payout, MAV_TOKEN_DECIMALS)}`);
      fetchBalance();
      fetchBankroll();
    };

    diceContract.on(filter, handler);
    return () => {
      diceContract.off(filter, handler);
    };
  }, [diceContract, account]);

  return (
    <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10 }}>
      <h2>Dice Game</h2>
      {account ? (
        <>
          <p>Connected: {account}</p>
          <p>Your Balance: {balance} MAV</p>
          <p>Dice Game Bankroll: {bankroll} MAV</p>

          <label>
            Pick a number (1–6):
            <input
              type="number"
              min={1}
              max={6}
              value={choice}
              onChange={(e) => setChoice(Number(e.target.value))}
            />
          </label>

          <br /><br />

          <label>
            Bet amount:
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <br /><br />

          <button onClick={placeBet}>Approve & Bet</button>
          <p>{status}</p>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default DiceGame;
