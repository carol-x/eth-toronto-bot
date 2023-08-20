const { ethers } = require("ethers");

module.exports.createWallet = function createWallet() {
    const account = ethers.Wallet.createRandom(); 
    console.log("Your account is created! Address is %s. \nYour seed phrase is %s", account.address, account.mnemonic.phrase);

    return account;
}
