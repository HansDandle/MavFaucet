const { ethers } = require("ethers");

// Replace with your Base L2 RPC URL
const RPC_URL = "https://mainnet.base.org";

// Replace with your contract addresses
const FAUCET_ADDRESS = "0x013855a5596cdEACB0E2b9FaE0C1c4e4962AF03F";
const MAVTOKEN_ADDRESS = "0x2aBE027F498F7A6b276D5230E604c2f26De573e5";
const WALLET = "0x8D7ef68d3d17fE776254F4d023B905369c897230";

// Minimal ABI for claimable and balanceOf
const faucetAbi = [
  "function claimable(address) view returns (uint256)"
];
const erc20Abi = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Check claimable amount
  const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, provider);
  const claimable = await faucet.claimable(WALLET);
  console.log("Claimable amount (raw):", claimable.toString());

  // Check faucet's MAVToken balance
  const token = new ethers.Contract(MAVTOKEN_ADDRESS, erc20Abi, provider);
  const balance = await token.balanceOf(FAUCET_ADDRESS);
  const decimals = await token.decimals();
  console.log("Faucet MAVToken balance:", ethers.formatUnits(balance, decimals));
}

main();