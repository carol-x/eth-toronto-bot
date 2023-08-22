const { ethers } = require("ethers");
const { SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");
const { createWallet } = require('../logic/create_wallet.js');
const prompt = require('prompt-sync')();

const isNewSchema = prompt('Are you launching a new schema?');

const schemaRegistryContractAddress = "0x720c2bA66D19A725143FBf5fDC5b4ADA2742682E"; // Base Goerli v0.27
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

signer = createWallet();
// schemaRegistry.connect(signer);

async function create_schema() {
    schemaRegistry.connect(signer);

    const schema = "bool metIRL, string referReason";
    const resolverAddress = "0x536e7E5f9d3b06C2ca726a02613e56Cce5c032ad"; 
    const revocable = true;

    const transaction = await schemaRegistry.register({
        schema,
        resolverAddress,
        revocable,
    });
    schemaId = await transaction.wait();

    return schemaId; 
}

// current schema is launched at 
// https://base-goerli.easscan.org/schema/view/0xfb52b73b02d4e1db5ce3ece8cdfbfe680b014e951fb68d8f8e8cf5584e2e6a4d
schemaId = "0xfb52b73b02d4e1db5ce3ece8cdfbfe680b014e951fb68d8f8e8cf5584e2e6a4d"; 

if (isNewSchema == 'yes') {
    schemaId = create_schema(); 
}

console.log("Your current schema UID is %s", schemaId); 
const schemaRecord = (async() => { await schemaRegistry.getSchema({ uid: schemaId }) })().then(token => { console.log(token) } ); 
console.log(schemaRecord);
