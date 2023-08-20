const { ethers } = require("ethers");
const { EAS, Offchain, SchemaEncoder, SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");
const { createWallet } = require('../logic/create_wallet.js');

const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26
// const EASContractAddress = "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"; // Base Goerli v0.27
const schemaRegistryContractAddress = "0x720c2bA66D19A725143FBf5fDC5b4ADA2742682E"; // Base Goerli v0.27
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);
const baseGoerliRpc = "https://1rpc.io/base-goerli"; 

function setup_eas(signer) {
    const eas = new EAS(EASContractAddress);
    const provider = ethers.getDefaultProvider(baseGoerliRpc);
    res = eas.connect(signer); 
    console.log("Connection completed"); 
    return eas; 
}

function get_attest(uid) {
    const attestation = (async() => { await eas.getAttestation(uid) })().then(token => { console.log(token) } );
    console.log(attestation);
    return attestation;
}

signer = createWallet();
eas = setup_eas(signer); 

async function create_schema() {
    schemaRegistry.connect(signer);

    const schema = "bool personalFriend, string referReason";
    const resolverAddress = "0x536e7E5f9d3b06C2ca726a02613e56Cce5c032ad"; 
    const revocable = true;

    const transaction = await schemaRegistry.register({
    schema,
    resolverAddress,
    revocable,
    });

    return transaction; 
}

transaction = create_schema(); 
console.log(transaction); 

// const uid = "0xff08bbf3d3e6e0992fc70ab9b9370416be59e87897c3d42b20549901d2cccc3e";


// eas.connect(account);

async function testAttestation(eas) {
    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder("uint256 eventId, uint8 voteIndex");
    const encodedData = schemaEncoder.encodeData([
    { name: "eventId", value: 1, type: "uint256" },
    { name: "voteIndex", value: 1, type: "uint8" },
    ]);

    const schemaUID = "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995";

    const tx = await eas.attest({
    schema: schemaUID,
    data: {
        recipient: "0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165",
        expirationTime: 0,
        revocable: true, 
        data: encodedData,
    },
    });

    const newAttestationUID = await tx.wait();
    return newAttestationUID; 
}

// const newAttestationUID = testAttestation(eas); 
// console.log("New attestation UID:", newAttestationUID);
