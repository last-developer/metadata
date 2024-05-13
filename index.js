import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { Connection, Keypair } from '@solana/web3.js';

const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const connection = new Connection(RPC_ENDPOINT);

const umi = createUmi(RPC_ENDPOINT).use(mplTokenMetadata());




const walletKeypair = Keypair.fromSecretKey(new Uint8Array([99,120,25,145,105,76,121,215,60,232,217,229,79,212,106,158,183,59,203,196,187,13,101,204,120,145,215,57,220,82,49,184,89,10,219,90,60,34,249,51,28,187,195,111,211,176,58,116,17,87,197,148,18,188,179,251,109,14,47,40,87,42,89,215]
));




import { PublicKey } from '@solana/web3.js';
import { createNft } from '@metaplex-foundation/mpl-token-metadata';

const tokenMintAddress = new PublicKey('mGuZw1y3mnDDgj7zD7vUXyah2uan1C26GP2bEdrLFTx');

await createNft(umi, {
  mint: tokenMintAddress,
  name: 'Minimalist',
  uri: 'https://example.com/my-nft.json',
  sellerFeeBasisPoints: 500, // 5%
  creators: [{
    address: walletKeypair.publicKey.toString(),
    share: 100
  }]
}).sendAndConfirm(walletKeypair);




import { fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';

const asset = await fetchDigitalAsset(umi, tokenMintAddress);
console.log(asset);
