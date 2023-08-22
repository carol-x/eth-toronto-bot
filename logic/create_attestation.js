const { EAS, SchemaEncoder } = require("@ethereum-attestation-service/eas-sdk");
const { createWallet } = require('../logic/create_wallet.js');
const { setupEAS } = require('../logic/setup_eas.js');

const EASContractAddress = "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"; // Base Goerli v0.27
eas = setupEAS();
signer = createWallet();
eas.connect(signer);

const schema = "bool metIRL, string referReason";
const schemaEncoder = new SchemaEncoder(schema);
const schemaUID = "0xfb52b73b02d4e1db5ce3ece8cdfbfe680b014e951fb68d8f8e8cf5584e2e6a4d";

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

// test
newAttestationUID = create_friend_attestation(true, "college friends", "0x6633338E73f4495f02B355D2705Be9FebD8b381D");
console.log(newAttestationUID);
