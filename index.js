// run for one time, 2nd time error
import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import fs from "fs";

export function loadWalletKey(keypairFile) {
    const loaded = web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
}

const INITIALIZE = true;
const METADATA_PROGRAM_ID = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function main() {
    console.log("Let's name some tokens!");
    const myKeypair = loadWalletKey("id.json");
    // Token Address-
    const mint = new web3.PublicKey("G4yKvV7iSf1PBqaoXnRxVQ8TyhSuxiNKXhfU967PG8mr");

    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(METADATA_PROGRAM_ID.toBuffer());
    const seed3 = Buffer.from(mint.toBytes());
    const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], METADATA_PROGRAM_ID);

    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: myKeypair.publicKey,
        payer: myKeypair.publicKey,
        updateAuthority: myKeypair.publicKey,
    };

    const dataV2 = {
        name: "My Unique Token",
        symbol: "MUT",
        uri: "https://raw.githubusercontent.com/last-developer/metadata/main/metadata.json",
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    };

    let ix;
    if (INITIALIZE) {
        const args = {
            createMetadataAccountArgsV3: {
                data: dataV2,
                isMutable: true,
                collectionDetails: null
            }
        };
        ix = mpl.createCreateMetadataAccountV3Instruction(accounts, args);
    } else {
        const args = {
            updateMetadataAccountArgsV2: {
                data: dataV2,
                updateAuthority: myKeypair.publicKey,
                primarySaleHappened: false
            }
        };
        ix = mpl.createUpdateMetadataAccountV2Instruction(accounts, args);
    }
    const tx = new web3.Transaction();
    tx.add(ix);
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
    const payerBalance = await connection.getBalance(myKeypair.publicKey);
    console.log(`Payer Balance: ${payerBalance / web3.LAMPORTS_PER_SOL} SOL`);
    console.log(myKeypair.publicKey);
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [myKeypair]);
    console.log("Transaction ID:", txid);
}

main().catch(console.error);
