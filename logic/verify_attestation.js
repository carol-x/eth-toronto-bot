const { ethers } = require("ethers");
const { EAS } = require("@ethereum-attestation-service/eas-sdk");
const { setupEAS } = require('../logic/setup_eas.js');
const { retrieveWallet } = require('../logic/create_wallet.js');
const prompt = require('prompt-sync')();

const EASContractAddress = "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"; // Base Goerli v0.27
const baseGoerliRpc = "https://1rpc.io/base-goerli"; 

const eas = new EAS(EASContractAddress);
// const uid = prompt('What is the UID to verify?');

module.exports.verifyAttestation = async function verifyAttestation(uid) {
    // FIXME: We actaully input a private key for this verification.
    const signer = retrieveWallet(null);
    eas.connect(signer);
    const attestation = await eas.getAttestation(uid);
    console.log("Your attester is %s, recipient is %s, and data is %s", attestation.attester, attestation.recipient, attestation.data); 
    return attestation; 
}

// test uid 
// uid = "0xff7ee5683636e3b9a10284f3b1ea9dfcc64bca759989018a06b52b314cdd8f97";
// attestation = verifyAttestation(uid);
