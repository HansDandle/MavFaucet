import requests
import csv
from datetime import datetime
from collections import defaultdict
import time

# --- CONFIG ---
ETHERSCAN_API_KEY = "YCYMDG1SZFY2IN6HCSFA5PPZMAQFCAD5PR"
MVX_CONTRACT = "0x7dDAA898D33D7aB252Ea5F89f96717c47B2fEE6e".lower()
PANDA_CONTRACT = "0xA09129080eD12CF1B1C7a6e723C63E0820E9D3ae".lower()

POOL_MAVERICKS = 200_000_000
POOL_PANDAS = 100_000_000
POOL_HOLDING = 200_000_000
REWARD_PER_DAY = 100  # MAV per day held

# --- UTILITY FUNCTIONS ---
def fetch_nft_transactions(contract):
    """Fetch all NFT transactions using Etherscan NFT API"""
    url = "https://api.etherscan.io/api"
    params = {
        "module": "account",
        "action": "tokennfttx",
        "contractaddress": contract,
        "startblock": 0,
        "endblock": 99999999,
        "sort": "asc",
        "apikey": ETHERSCAN_API_KEY
    }
    r = requests.get(url, params=params).json()
    result = r.get("result")
    if not isinstance(result, list):
        raise Exception(f"Etherscan error: {result}")
    return result

def identify_diamondpaws(txs):
    """Return set of wallets that minted but never transferred"""
    mint_dict = {}      # tokenId -> (wallet, timestamp)
    transferred = set() # tokenIds that moved after mint

    for tx in txs:
        token_id = int(tx["tokenID"])
        from_addr = tx["from"].lower()
        to_addr = tx["to"].lower()
        timestamp = int(tx["timeStamp"])

        if from_addr == "0x0000000000000000000000000000000000000000":
            mint_dict[token_id] = (to_addr, timestamp)
        else:
            transferred.add(token_id)

    # Keep only tokens that were minted but never transferred
    diamondpaws = {wallet for tid, (wallet, ts) in mint_dict.items() if tid not in transferred}
    # Also keep mint timestamps for holding calculations
    mint_times = {wallet: ts for tid, (wallet, ts) in mint_dict.items() if tid not in transferred}
    return diamondpaws, mint_times

# --- MAIN ---
print("Fetching MVX NFT transactions...")
mvx_txs = fetch_nft_transactions(MVX_CONTRACT)
print(f"Total MVX transactions fetched: {len(mvx_txs)}")
time.sleep(0.2)

print("Fetching Panda NFT transactions...")
panda_txs = fetch_nft_transactions(PANDA_CONTRACT)
print(f"Total Panda transactions fetched: {len(panda_txs)}")
time.sleep(0.2)

# Identify DiamondPaws
mvx_dps, mvx_mints = identify_diamondpaws(mvx_txs)
panda_dps, panda_mints = identify_diamondpaws(panda_txs)
print(f"MVX DiamondPaws: {len(mvx_dps)}")
print(f"Panda DiamondPaws: {len(panda_dps)}")

# Compute holding-based rewards
holdings = defaultdict(int)
current_ts = int(datetime.utcnow().timestamp())
for wallet, ts in {**mvx_mints, **panda_mints}.items():
    days_held = max(0, (current_ts - ts) // 86400)
    holdings[wallet] += days_held

# Calculate allocations
alloc = defaultdict(float)

# 1. DiamondPaw splits
if mvx_dps:
    share_mvx = POOL_MAVERICKS / len(mvx_dps)
    for addr in mvx_dps:
        alloc[addr] += share_mvx

if panda_dps:
    share_panda = POOL_PANDAS / len(panda_dps)
    for addr in panda_dps:
        alloc[addr] += share_panda

# 2. Holding-based splits
total_weight = sum(days * REWARD_PER_DAY for days in holdings.values())
for addr, days in holdings.items():
    raw_reward = days * REWARD_PER_DAY
    scaled_reward = raw_reward * POOL_HOLDING / total_weight if total_weight else 0
    alloc[addr] += scaled_reward

# 3. Output CSV
with open("mav_distribution.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["address", "mav_amount"])
    for addr, amount in alloc.items():
        writer.writerow([addr, int(amount)])

print("Distribution CSV generated: mav_distribution.csv")
