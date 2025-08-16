import os
from web3 import Web3
import csv
import json
from eth_account import Account

# --- Configuration ---
RPC_URL = "https://mainnet.base.org/"  # Base L2 RPC
FAUCET_ADDRESS = "0x013855a5596cdEACB0E2b9FaE0C1c4e4962AF03F"  # Deployed MAVFaucet
CSV_FILE = "mav_distribution.csv"       # CSV with two columns: wallet,amount
BATCH_SIZE = 100                         # initial batch size
GAS_BUFFER = 10000                       # extra gas for safety

# --- Private key from environment ---
PRIVATE_KEY = os.environ.get("DEPLOYER_PRIVATE_KEY")
if not PRIVATE_KEY:
    raise ValueError("Please set DEPLOYER_PRIVATE_KEY environment variable")

# --- Derive deployer address from private key ---
deployer_account = Account.from_key(PRIVATE_KEY)
DEPLOYER_ADDRESS = deployer_account.address
print("Deployer address:", DEPLOYER_ADDRESS)

# --- Connect to Base L2 ---
w3 = Web3(Web3.HTTPProvider(RPC_URL))
assert w3.is_connected(), "Failed to connect to Base L2 RPC"

# --- Load faucet ABI ---
with open("MAVFaucet_abi.json") as f:
    faucet_abi = json.load(f)

faucet = w3.eth.contract(address=FAUCET_ADDRESS, abi=faucet_abi)

# --- Read CSV ---
wallets = []
amounts = []
with open(CSV_FILE) as f:
    reader = csv.reader(f)
    next(reader)  # skip header if any
    for row in reader:
        wallets.append(row[0])
        # Multiply whole MAV by 18-decimal scaling
        raw_amount = int(row[1])
        amounts.append(raw_amount)

# --- Convert all wallet addresses to checksum format ---
wallets = [Web3.to_checksum_address(addr) for addr in wallets]

# --- Batch sending with gas estimation ---
nonce = w3.eth.get_transaction_count(DEPLOYER_ADDRESS)
i = 0
total_wallets = len(wallets)

while i < total_wallets:
    current_batch_size = min(BATCH_SIZE, total_wallets - i)
    batch_wallets = wallets[i:i+current_batch_size]
    batch_amounts = amounts[i:i+current_batch_size]

    # Estimate gas
    try:
        gas_estimate = faucet.functions.setClaimable(batch_wallets, batch_amounts).estimate_gas({
            "from": DEPLOYER_ADDRESS
        })
    except Exception as e:
        print(f"Gas estimation failed for batch starting at index {i}: {e}")
        # Reduce batch size and retry
        if current_batch_size == 1:
            raise Exception("Single wallet batch failed to estimate gas, cannot proceed.")
        BATCH_SIZE = max(1, current_batch_size // 2)
        print(f"Reducing batch size to {BATCH_SIZE} and retrying...")
        continue

    gas_limit = gas_estimate + GAS_BUFFER
    print(f"Batch {i//BATCH_SIZE + 1}: {current_batch_size} wallets, estimated gas {gas_estimate}, sending with gas limit {gas_limit}")

    # Build and send transaction
    tx = faucet.functions.setClaimable(batch_wallets, batch_amounts).build_transaction({
        "from": DEPLOYER_ADDRESS,
        "gas": gas_limit,
        "nonce": nonce,
        "gasPrice": w3.eth.gas_price
    })

    signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    print(f"Batch sent: {tx_hash.hex()}")

    # Wait for receipt (optional)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Batch mined, gas used: {receipt.gasUsed}")

    nonce += 1
    i += current_batch_size
