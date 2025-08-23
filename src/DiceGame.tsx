          import React, { useState } from "react";
          import { ethers } from "ethers";
          import DiceGameABI from "./abis/DiceGameBlockhash.json";
          import { CONFIG, MAV_TOKEN_DECIMALS } from "./config/constants";

          declare global {
            interface Window {
              ethereum?: any;
            }
          }

          const DiceGame: React.FC = () => {
  // Fetch MAV token balance for connected account
  const fetchBalance = async (account: string, provider: any) => {
    if (!account || !provider) return;
    try {
      const token = new ethers.Contract(
        "0x2aBE027F498F7A6b276D5230E604c2f26De573e5",
        ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"],
        provider
      );
      const rawBalance = await token.balanceOf(account);
      const decimals = await token.decimals();
      setBalance(ethers.formatUnits(rawBalance, decimals));
    } catch (err) {
      setBalance("0");
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

            const connectWallet = async () => {
              if (!window.ethereum) return alert("Install MetaMask");
              const provider = new ethers.BrowserProvider(window.ethereum);
              await provider.send("eth_requestAccounts", []);
              const s = await provider.getSigner();
              const addr = await s.getAddress();
              const network = await provider.getNetwork();
              if (Number(network.chainId) !== Number(CONFIG.EXPECTED_CHAIN_ID)) {
                alert("Wrong network! Switch to Base Mainnet.");
              }
            setSigner(s);
            setAccount(addr);
            const dice = new ethers.Contract(CONFIG.DICE_ADDRESS, DiceGameABI, s);
            setDiceContract(dice);
            // Fetch MAV token balance after wallet connection
            fetchBalance(addr, s);
            };

            const placeBet = () => {
              setStatus("Bet placed (stub)");
            };

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
                  <div>
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
                        inputMode="numeric"
                        pattern="[1-6]"
                        onChange={(e) => {
                          // Remove leading zeros
                          const val = e.target.value.replace(/^0+/, "");
                          setChoice(Number(val));
                        }}
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
                  </div>
                ) : (
                  <button style={{ background: "linear-gradient(90deg,#4ade80,#60a5fa)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 18, cursor: "pointer", boxShadow: "0 2px 8px rgba(76,222,128,0.15)" }} onClick={connectWallet}>Connect Wallet</button>
                )}
              </div>
            );
          };

          export default DiceGame;
