const { ethers } = require("ethers");
const { SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");
const { retrieveWallet } = require('../logic/create_wallet.js');
const prompt = require('prompt-sync')();

const isNewSchema = prompt('Are you launching a new schema?');

const schemaRegistryContractAddress = "0x720c2bA66D19A725143FBf5fDC5b4ADA2742682E"; // Base Goerli v0.27
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

signer = retrieveWallet();
// schemaRegistry.connect(signer);

async function create_schema() {
    schemaRegistry.connect(signer);

    const schema = "bool metIRL, string referReason";
    const resolverAddress = "0x0000000000000000000000000000000000000000"; 
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
// https://base-goerli.easscan.org/schema/view/0xd9ad50b5f13b095698fafb9b84e64c83bb4dd3076fafbcaceaa68c90edcfc7e0
schemaId = "0xd9ad50b5f13b095698fafb9b84e64c83bb4dd3076fafbcaceaa68c90edcfc7e0"; 

if (isNewSchema == 'yes') {
    schemaId = create_schema(); 
}

console.log("Your current schema UID is %s", schemaId); 
const schemaRecord = (async() => { await schemaRegistry.getSchema({ uid: schemaId }) })().then(token => { console.log(token) } ); 
console.log(schemaRecord);
