const { EAS, SchemaEncoder } = require("@ethereum-attestation-service/eas-sdk");
const { ethers } = require("ethers");
const { retrieveWallet } = require('../logic/create_wallet.js');
require('dotenv').config();

const EASContractAddress = "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"; // Base Goerli v0.27
const baseGoerliRpc = "https://1rpc.io/base-goerli"; 

const eas = new EAS(EASContractAddress);
const provider = ethers.getDefaultProvider(baseGoerliRpc);

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

const global_private_key = process.env.PRIVATE_KEY;

module.exports.createAttestation = async function createAttestation(schemaType) {
    console.log(schemaType);

    signer = retrieveWallet(global_private_key);
    console.log("1111111");
    eas.connect(signer);
    console.log("222222222");


    const defaultParams = {
        "skills": [4, 3, 5, 1, 2], 
        "referral": [3, 'Met at ETH Toronto'], 
        "fans": [true, true, false, false]
    }

    const schema = schemas[schemaType];
    console.log(schema);
    const schemaEncoder = new SchemaEncoder(schema);
    if (schemaType == 'skills') {
        encodedData = schemaEncoder.encodeData([
            { name: "PythonLevel", value: defaultParams['skills'][0], type: "uint8" },
            { name: "JSLevel", value: defaultParams['skills'][1], type: "uint8" },
            { name: "RustLevel", value: defaultParams['skills'][2], type: "uint8" },
            { name: "DesignLevel", value: defaultParams['skills'][3], type: "uint8" },
            { name: "AlgoLevel", value: defaultParams['skills'][4], type: "uint8" },
        ]);
    } else if (schemaType == 'referral') {
        encodedData = schemaEncoder.encodeData([
            { name: "ReferLevel", value: defaultParams['referral'][0], type: "bool" },
            { name: "ReferReason", value: defaultParams['referral'][1], type: "string" },
        ]);
    } else {
        encodedData = schemaEncoder.encodeData([
            { name: "Swift", value: defaultParams['fans'][0], type: "bool" },
            { name: "Sheeran", value: defaultParams['fans'][1], type: "bool" },
            { name: "Coldplay", value: defaultParams['fans'][2], type: "bool" },
            { name: "EDM", value: defaultParams['fans'][3], type: "bool" },
        ]);
    }
    
    const tx = await eas.attest({
    schema: schemasUID[schemaType],
    data: {
        recipient: "0x6633338E73f4495f02B355D2705Be9FebD8b381D",
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
// newAttestationUID = createAttestation("skills", "0x6633338E73f4495f02B355D2705Be9FebD8b381D", process.env.PRIVATE_KEY);

