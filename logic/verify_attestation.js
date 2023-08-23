const { ethers } = require("ethers");
const { EAS } = require("@ethereum-attestation-service/eas-sdk");
const { setupEAS } = require('../logic/setup_eas.js');
const { retrieveWallet } = require('../logic/create_wallet.js');
const prompt = require('prompt-sync')();

// const uid = prompt('What is the UID to verify?');

module.exports.verifyAttestation = async function verifyAttestation(uid, pvtKey=null) {
    // FIXME: We actaully input a private key for this verification.
    const eas = setupEAS();
    const signer = retrieveWallet();
    eas.connect(signer);
    const attestation = await eas.getAttestation(uid);
    console.log("Your attester is %s, recipient is %s, and data is %s", attestation.attester, attestation.recipient, attestation.data); 
    return attestation; 
}

// test uid 
// uid = "0xff7ee5683636e3b9a10284f3b1ea9dfcc64bca759989018a06b52b314cdd8f97";
// attestation = verifyAttestation(uid);
