from web3 import Web3
import json

# Connect to Ethereum node
w3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/YOUR_INFURA_KEY'))

# EVMavericks contract
contract_address = '0x7ddaa898d33d7ab252ea5f89f96717c47b2fee6e'
abi = json.load(open('EVMavericksABI.json'))  # You need the ERC-721 ABI + events
contract = w3.eth.contract(address=contract_address, abi=abi)

# Constants
TOTAL_SUPPLY = 13_240_000
DIAMOND_BONUS = 10_000
CURRENT_BLOCK = w3.eth.block_number

# 1. Fetch Transfer events
transfer_filter = contract.events.Transfer.createFilter(fromBlock=0, toBlock='latest')
events = transfer_filter.get_all_entries()

# 2. Track ownership & transfers
token_data = {}  # tokenId -> {owner, transfers: [blockNumbers]}

for e in events:
    tokenId = e['args']['tokenId']
    from_addr = e['args']['from']
    to_addr = e['args']['to']
    blk = e['blockNumber']

    if tokenId not in token_data:
        token_data[tokenId] = {'owner': None, 'transfers': []}

    token_data[tokenId]['owner'] = to_addr
    if from_addr != '0x0000000000000000000000000000000000000000':
        token_data[tokenId]['transfers'].append(blk)

# 3. Determine diamond paws & reward tiers
rewards = {}
diamond_count = 0
for tokenId, data in token_data.items():
    if len(data['transfers']) == 0:
        rewards[tokenId] = DIAMOND_BONUS
        diamond_count += 1
    else:
        # Calculate holding duration
        mint_block = data['transfers'][0] if data['transfers'] else 0
        holding_blocks = CURRENT_BLOCK - mint_block
        # Approx blocks per year = 2,300,000
        years = holding_blocks / 2_300_000
        if years >= 3:
            rewards[tokenId] = 5_000
        elif years >= 2:
            rewards[tokenId] = 3_000
        elif years >= 1:
            rewards[tokenId] = 1_500
        elif years >= 0.5:
            rewards[tokenId] = 500
        else:
            rewards[tokenId] = 0

# 4. Adjust for remaining supply
total_diamond = diamond_count * DIAMOND_BONUS
remaining_supply = TOTAL_SUPPLY - total_diamond
total_non_diamond = sum([r for t, r in rewards.items() if r != DIAMOND_BONUS])

scaling_factor = min(1, remaining_supply / total_non_diamond)
for tokenId in rewards:
    if rewards[tokenId] != DIAMOND_BONUS:
        rewards[tokenId] = int(rewards[tokenId] * scaling_factor)

# 5. Save to JSON
with open('mav_rewards.json', 'w') as f:
    json.dump(rewards, f, indent=2)

print(f"Diamond-paws: {diamond_count}, Rewards saved to mav_rewards.json")
