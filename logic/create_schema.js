const { ethers } = require("ethers");
const { SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");
const { createWallet } = require('../logic/create_wallet.js');

const schemaRegistryContractAddress = "0x720c2bA66D19A725143FBf5fDC5b4ADA2742682E"; // Base Goerli v0.27
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

signer = createWallet();

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

schemaId = create_schema(); 
console.log(schemaId); 