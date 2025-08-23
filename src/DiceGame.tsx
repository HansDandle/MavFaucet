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
  // Add token to MetaMask
  const importToken = async () => {
    if (!window.ethereum) return alert("MetaMask not found");
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: CONFIG.TOKEN_ADDRESS,
            symbol: "MAV",
            decimals: MAV_TOKEN_DECIMALS,
            image: "https://i.imgur.com/E50synK.jpeg" // Optional: token logo
          }
        }
      });
    } catch (err) {
      alert("Could not add token: " + (err.message || err));
    }
  };
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
    <div style={{
      border: "1px solid #444",
      padding: 32,
      borderRadius: 16,
      background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
      color: "#eee",
      boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      maxWidth: 480,
      margin: "40px auto"
    }}>
      <h2 style={{ color: "#4ade80", fontSize: 28, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>Dice Game</h2>
      {account ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 500 }}>Connected:</span>
            <span style={{ fontFamily: "monospace" }}>{account}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span>Your Balance:</span>
            <span style={{ color: "#4ade80" }}>{balance} MAV</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <span>Dice Game Bankroll:</span>
            <span style={{ color: "#60a5fa" }}>{bankroll} MAV</span>
          </div>

          <label style={{ color: "#ccc", fontWeight: 500 }}>
            Pick a number (1–6):
            <input
              type="number"
              min={1}
              max={6}
              value={choice}
              onChange={(e) => setChoice(Number(e.target.value))}
              style={{ background: "#333", color: "#fff", border: "1px solid #666", borderRadius: 6, padding: "4px 8px", marginLeft: 8, fontSize: 16, width: 80 }}
            />
          </label>

          <br /><br />

          <label style={{ color: "#ccc", fontWeight: 500 }}>
            Bet amount:
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ background: "#333", color: "#fff", border: "1px solid #666", borderRadius: 6, padding: "4px 8px", marginLeft: 8, fontSize: 16, width: 120 }}
            />
          </label>

          <br /><br />

          <button style={{ background: "linear-gradient(90deg,#4ade80,#60a5fa)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 18, cursor: "pointer", boxShadow: "0 2px 8px rgba(76,222,128,0.15)" }} onClick={placeBet}>Approve & Bet</button>
          <p style={{ color: status.includes("won") ? "#4ade80" : status.includes("lost") ? "#f87171" : "#fff", fontWeight: 500, fontSize: 18, marginTop: 16 }}>{status}</p>
        </>
      ) : (
        <button style={{ background: "linear-gradient(90deg,#4ade80,#60a5fa)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 18, cursor: "pointer", boxShadow: "0 2px 8px rgba(76,222,128,0.15)" }} onClick={connectWallet}>Connect Wallet</button>
      )}
          <p>Connected: {account}</p>
          <p>Your Balance: {balance} MAV</p>
          <p>Dice Game Bankroll: {bankroll} MAV</p>

          <label style={{ color: "#ccc" }}>
            Pick a number (1–6):
            <input
              type="number"
              min={1}
              max={6}
              value={choice}
              onChange={(e) => setChoice(Number(e.target.value))}
              style={{ background: "#333", color: "#fff", border: "1px solid #666", borderRadius: 6, padding: "4px 8px", marginLeft: 8 }}
            />
          </label>

          <br /><br />

          <label style={{ color: "#ccc" }}>
            Bet amount:
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ background: "#333", color: "#fff", border: "1px solid #666", borderRadius: 6, padding: "4px 8px", marginLeft: 8 }}
            />
          </label>

          <br /><br />

          <button style={{ background: "#444", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }} onClick={placeBet}>Approve & Bet</button>
          <p style={{ color: status.includes("won") ? "#4ade80" : status.includes("lost") ? "#f87171" : "#fff" }}>{status}</p>
        </>
      ) : (
        <button style={{ background: "#444", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }} onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default DiceGame;
