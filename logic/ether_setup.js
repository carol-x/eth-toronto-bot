const { ethers } = require("ethers");
const { EAS, Offchain, SchemaEncoder, SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");

account = ethers.Wallet.createRandom(); 

console.log(account); 
console.log("Your address is %s. \nYour seed phrase is %s", account.address, account.mnemonic.phrase);
const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26
// const EASContractAddress = "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"; // Base Goerli v0.27
const eas = new EAS(EASContractAddress);
const provider = ethers.getDefaultProvider("sepolia");
eas.connect(provider);

const uid = "0xff08bbf3d3e6e0992fc70ab9b9370416be59e87897c3d42b20549901d2cccc3e";
const attestation = (async() => { await eas.getAttestation(uid) })().then(token => { console.log(token) } );
console.log(attestation);

eas.connect(account);

async function testAttestation() {
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
        revocable: true, // Be aware that if your schema is not revocable, this MUST be false
        data: encodedData,
    },
    });

    const newAttestationUID = await tx.wait();
    return newAttestationUID; 
}

const newAttestationUID = testAttestation(); 
console.log("New attestation UID:", newAttestationUID);
