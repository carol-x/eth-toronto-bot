const { EAS, SchemaEncoder } = require("@ethereum-attestation-service/eas-sdk");
const { createWallet } = require('../logic/create_wallet.js');
const { setupEAS } = require('../logic/setup_eas.js');

const EASContractAddress = "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"; // Base Goerli v0.27
eas = setupEAS();
signer = createWallet();
eas.connect(signer);

const schema = "bool metIRL, string referReason";
const schemaEncoder = new SchemaEncoder(schema);
const schemaUID = "0xd9ad50b5f13b095698fafb9b84e64c83bb4dd3076fafbcaceaa68c90edcfc7e0";

const schemas = {
    "skills": "uint8 PythonLevel, uint8 JSLevel, uint8 RustLevel, uint8 DesignLevel, uint8 AlgoLevel", 
    "referral": "uint8 ReferLevel, string ReferReason", 
    "fans": "bool Swift, bool Sheeran, bool Coldplay, bool EDM"
}

const schemasUID = {
    "skills": "0x1412c2e5a81110b9873daf1681de462199d92b8da1d7c4dd187775e0f1892943", 
    "referral": "0x2c0c0e26502d5551b274184bd0296653e7d87daf4dbe46a40be372127e713744", 
    "fans": "0x6916bde9b639ba59e0aae0d39af6e25e751cebf3442e3c31fd11c82c128dba3f"
}

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

