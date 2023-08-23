const { ethers } = require("ethers");
require('dotenv').config();

const baseGoerliRpc = "https://1rpc.io/base-goerli"; 

module.exports.createWallet = function createWallet() {
    const account = ethers.Wallet.createRandom(); 
    console.log("Your account is created! Address is %s. \nYour seed phrase is %s and private key is %s", account.address, account.mnemonic.phrase, account.privateKey);
    return account;
}

const global_private_key = process.env.PRIVATE_KEY;

// internal utility function 
module.exports.retrieveWallet = function retrieveWallet(privateKey) {
    console.log("00000");
    const wallet = new ethers.Wallet(global_private_key);
    console.log("0000011111111");

    
    console.log("Your account is created! Address is %s. \n", wallet.address);
    provider = ethers.getDefaultProvider(baseGoerliRpc); 
    console.log("00000222222");
    signer = wallet.connect(provider);
    console.log("00000333333");
    return signer;
}
