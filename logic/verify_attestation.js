const { ethers } = require("ethers");
const { EAS } = require("@ethereum-attestation-service/eas-sdk");
const { setupEAS } = require('../logic/setup_eas.js');
const { createWallet } = require('../logic/create_wallet.js');
const prompt = require('prompt-sync')();

const uid = prompt('What is the UID to verify?');

eas = setupEAS();
signer = createWallet();
eas.connect(signer);

async function verify_attestation(uid) {
    const attestation = await eas.getAttestation(uid);
    console.log(attestation);
}

// test 
// uid = "0xff7ee5683636e3b9a10284f3b1ea9dfcc64bca759989018a06b52b314cdd8f97";
verify_attestation(uid);
