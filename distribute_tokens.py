# script to generate x numbers of addresses and then send y number of token to each account.
import subprocess

# Constants
TOKEN_ADDRESS = "G4yKvV7iSf1PBqaoXnRxVQ8TyhSuxiNKXhfU967PG8mr"
SOLANA_RPC_URL = "https://api.devnet.solana.com"

# Function to generate a new Solana keypair
def generate_keypair():
    result = subprocess.run(["solana-keygen", "new", "--no-bip39-passphrase", "--no-outfile"],
                            capture_output=True, text=True)
    for line in result.stdout.splitlines():
        if line.startswith("pubkey: "):
            return line.split()[1]
    return None

# Generate 2 Random Addresses
random_addresses = [generate_keypair() for _ in range(2)]
print(f"Generated 2 random addresses: {random_addresses}")

# id.json in same folder
keypair_path = "id.json"

# Set Solana config to use our keypair as the fee payer
subprocess.run(["solana", "config", "set", "--keypair", keypair_path])

# Step 1: Create Associated Token Accounts for Each Address
for address in random_addresses:
    command = [
        "spl-token", "create-account", TOKEN_ADDRESS, "--owner", address,
        "--url", SOLANA_RPC_URL, "--fee-payer", keypair_path
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0 and "Account already exists" not in result.stderr:
        print(f"Failed to create token account for {address}: {result.stderr}")
    else:
        print(f"Created token account for {address}")

# Step 2: Distribute 50 Tokens to Each Address
for address in random_addresses:
    command = [
        "spl-token", "transfer", TOKEN_ADDRESS, "50", address,
        "--url", SOLANA_RPC_URL, "--fee-payer", keypair_path, "--allow-unfunded-recipient"
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Failed to transfer tokens to {address}: {result.stderr}")
    else:
        print(f"Transferred 50 tokens to {address}")

