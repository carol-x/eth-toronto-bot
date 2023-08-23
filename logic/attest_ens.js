const { ethers } = require("ethers");
const ENS = require('ethereum-ens');

const mainnetRpc = "https://eth.llamarpc.com";
const provider = ethers.getDefaultProvider(mainnetRpc); 
const prompt = require('prompt-sync')();

const ens = prompt('What is your ENS?');

// const baseGoerliRpc = "https://1rpc.io/base-goerli"; 
const address = (async() => { await provider.resolveName(ens) })().then(token => { console.log(token) } ); 


