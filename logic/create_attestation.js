const { EAS, SchemaEncoder } = require("@ethereum-attestation-service/eas-sdk");
const { retrieveWallet } = require('../logic/create_wallet.js');
const { setupEAS } = require('../logic/setup_eas.js');

const EASContractAddress = "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"; // Base Goerli v0.27
eas = setupEAS();
signer = retrieveWallet();
eas.connect(signer);

const schema = "bool metIRL, string referReason";
const schemaEncoder = new SchemaEncoder(schema);
const schemaUID = "0xd9ad50b5f13b095698fafb9b84e64c83bb4dd3076fafbcaceaa68c90edcfc7e0";

const schemas = {
    "skills": "uint8 PythonLevel, uint8 JSLevel, uint8 RustLevel, uint8 DesignLevel, uint8 AlgoLevel", 
    "referral": "uint8 ReferLevel, string ReferReason", 
    "fans": "bool Swift, bool Sheeran, bool Coldplay, bool EDM"
}

async function createFriendAttestation(metIRL, perferReason, target_addr) {

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
newAttestationUID = createFriendAttestation(true, "college friends", "0x6633338E73f4495f02B355D2705Be9FebD8b381D");

