const { ethers } = require("ethers");
const createCsvWriter = require("csv-writer").createArrayCsvWriter;

// Replace with your Alchemy or Infura API key
const provider = new ethers.JsonRpcProvider(
  "https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_OR_INFURA_API_KEY"
);

const contractAddress = "0x7ddaa898d33d7ab252ea5f89f96717c47b2fee6e";
const erc721Abi = [
  "function totalSupply() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

async function main() {
  const contract = new ethers.Contract(contractAddress, erc721Abi, provider);

  // Get total supply (if available)
  let totalSupply;
  try {
    totalSupply = await contract.totalSupply();
  } catch (e) {
    console.error("totalSupply() not available. Please specify token ID range manually.");
    return;
  }

  const owners = new Set();

  for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
    try {
      const owner = await contract.ownerOf(tokenId);
      owners.add(owner.toLowerCase());
      console.log(`Token ${tokenId}: ${owner}`);
    } catch (err) {
      console.warn(`Token ${tokenId} not found or burned.`);
    }
  }

  // Write to CSV
  const csvWriter = createCsvWriter({
    header: ["wallet_address"],
    path: "unique_wallet_addresses.csv"
  });

  await csvWriter.writeRecords([...owners].map(addr => [addr]));
  console.log("CSV file created: unique_wallet_addresses.csv");
}

main();