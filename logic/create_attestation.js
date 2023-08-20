const { EAS, SchemaEncoder } = require("@ethereum-attestation-service/eas-sdk");
const { createWallet } = require('../logic/create_wallet.js');
const { setupEAS } = require('../logic/setup_eas.js');

const EASContractAddress = "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"; // Base Goerli v0.27
eas = setupEAS();
signer = createWallet();
eas.connect(signer);

const schema = "bool metIRL, string referReason";
const schemaEncoder = new SchemaEncoder(schema);
const schemaUID = "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995";

async function create_friend_attestation(metIRL, perferReason, target_addr) {

    const schema = "bool metIRL, string referReason";
    const schemaEncoder = new SchemaEncoder(schema);
    const encodedData = schemaEncoder.encodeData([
    { name: "metIRL", value: metIRL, type: "bool" },
    { name: "referReason", value: perferReason, type: "string" },
    ]);

    const tx = await eas.attest({
    schema: schemaUID,
    data: {
        recipient: target_addr,
        expirationTime: 0,
        revocable: true, 
        data: encodedData,
    },
    });
    const newAttestationUID = await tx.wait();

    console.log("New attestation UID:", newAttestationUID);
    return newAttestationUID; 
}
