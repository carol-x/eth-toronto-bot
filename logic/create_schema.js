const { ethers } = require("ethers");
const { SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");
const { retrieveWallet } = require('../logic/create_wallet.js');
const prompt = require('prompt-sync')();

const newSchemaName = prompt('Are you launching a new schema?');

const schemaRegistryContractAddress = "0x720c2bA66D19A725143FBf5fDC5b4ADA2742682E"; // Base Goerli v0.27
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

signer = retrieveWallet();
// schemaRegistry.connect(signer);

const schemas = {
    "skills": "uint8 PythonLevel, uint8 JSLevel, uint8 RustLevel, uint8 DesignLevel, uint8 AlgoLevel", 
    "referral": "uint8 ReferLevel, string ReferReason", 
    "fans": "bool Swift, bool Sheeran, bool Coldplay, bool EDM"
}

async function create_schema(schema) {
    schemaRegistry.connect(signer);

    const resolverAddress = "0x0000000000000000000000000000000000000000"; 
    const revocable = true;

    const transaction = await schemaRegistry.register({
        schema,
        resolverAddress,
        revocable,
    });
    schemaId = await transaction.wait();
    console.log("Your current schema UID is %s", schemaId); 

    return schemaId; 
}

// current schema is launched at 
// https://base-goerli.easscan.org/schema/view/0xd9ad50b5f13b095698fafb9b84e64c83bb4dd3076fafbcaceaa68c90edcfc7e0
schemaId = "0xd9ad50b5f13b095698fafb9b84e64c83bb4dd3076fafbcaceaa68c90edcfc7e0"; 

if (newSchemaName != "no") {
    schemaId = create_schema(schemas[newSchemaName]); 
}

const schemaRecord = (async() => { await schemaRegistry.getSchema({ uid: schemaId }) })().then(token => { console.log(token) } ); 
console.log(schemaRecord);
