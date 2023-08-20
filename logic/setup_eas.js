const { ethers } = require("ethers");
const { EAS } = require("@ethereum-attestation-service/eas-sdk");

const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26
// const EASContractAddress = "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A"; // Base Goerli v0.27

module.exports.setupEAS = function setup_eas(signer) {
    const eas = new EAS(EASContractAddress);
    const provider = ethers.getDefaultProvider(baseGoerliRpc);
    res = eas.connect(signer); 
    console.log("Connection completed"); 
    return eas; 
}