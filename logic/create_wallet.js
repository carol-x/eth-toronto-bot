const { ethers } = require("ethers");
require('dotenv').config();

const baseGoerliRpc = "https://1rpc.io/base-goerli"; 

module.exports.createWallet = function createWallet() {
    // const account = ethers.Wallet.createRandom(); 
    // console.log("Your account is created! Address is %s. \nYour seed phrase is %s", account.address, account.mnemonic.phrase);

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY); 
    console.log("Your account is created! Address is %s. \n", wallet.address);
    provider = ethers.getDefaultProvider(baseGoerliRpc); 
    signer = wallet.connect(provider);
    return signer;
}