const { ethers } = require("ethers");
require('dotenv').config();

const baseGoerliRpc = "https://1rpc.io/base-goerli"; 

module.exports.createWallet = function createWallet() {
    const account = ethers.Wallet.createRandom(); 
    console.log("Your account is created! Address is %s. \nYour seed phrase is %s and private key is %s", account.address, account.mnemonic.phrase, account.privateKey);
    return account;
}

// internal utility function 
module.exports.retrieveWallet = function retrieveWallet(privateKey) {
    privateKey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey);
    
    console.log("Your account is created! Address is %s. \n", wallet.address);
    provider = ethers.getDefaultProvider(baseGoerliRpc); 
    signer = wallet.connect(provider);
    return signer;
}
