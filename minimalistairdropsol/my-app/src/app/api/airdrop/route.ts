import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

const devnetConnection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const testnetConnection = new Connection(clusterApiUrl('testnet'), 'confirmed');

// Generate keypairs for the faucet on both networks
const devnetFaucetKeypair = Keypair.generate();
const testnetFaucetKeypair = Keypair.generate();

// Airdrop SOL to the faucet keypair on Devnet
devnetConnection.requestAirdrop(devnetFaucetKeypair.publicKey, LAMPORTS_PER_SOL * 10)
  .then(airdropSignature => {
    devnetConnection.confirmTransaction(airdropSignature);
  });

// Airdrop SOL to the faucet keypair on Testnet
testnetConnection.requestAirdrop(testnetFaucetKeypair.publicKey, LAMPORTS_PER_SOL * 10)
  .then(airdropSignature => {
    testnetConnection.confirmTransaction(airdropSignature);
  });

export async function POST(request: NextRequest) {
  try {
    const { recipient, network } = await request.json();
    const recipientPubkey = new PublicKey(recipient);

    let connection: Connection;
    let faucetKeypair: Keypair;
    if (network === 'testnet') {
      connection = testnetConnection;
      faucetKeypair = testnetFaucetKeypair;
    } else {
      connection = devnetConnection;
      faucetKeypair = devnetFaucetKeypair;
    }

    // Airdrop 1 SOL to the recipient
    const airdropSignature = await connection.requestAirdrop(recipientPubkey, LAMPORTS_PER_SOL);
    const latestBlockhash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      signature: airdropSignature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });

    return NextResponse.json({ message: 'Airdrop successful!', txId: airdropSignature });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
