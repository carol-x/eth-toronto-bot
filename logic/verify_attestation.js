const { ethers } = require("ethers");
const { EAS } = require("@ethereum-attestation-service/eas-sdk");
const { setupEAS } = require('../logic/setup_eas.js');

eas = setupEAS();
signer = createWallet();
eas.connect(signer);

function verify_attestation(uid) {
    const attestation = await eas.getAttestation(uid);
    console.log(attestation);
}

