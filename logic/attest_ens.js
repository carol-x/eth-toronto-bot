const { ethers } = require("ethers");
const ENS = require('ethereum-ens');

var Web3 = require('web3');

const mainnetRpc = "https://eth.llamarpc.com";
const provider = ethers.getDefaultProvider(mainnetRpc); 

var ens = new ENS(provider, '0x314159265dd8dbb310642f98f50c066173c1259b');

// const baseGoerliRpc = "https://1rpc.io/base-goerli"; 
const address = (async() => { await provider.lookupAddress('0x0259a8B637a3257f2bAfEaD270EB5ED3fFec1183') })().then(token => { console.log(token) } ); 

ens.reverse('0x0259a8B637a3257f2bAfEaD270EB5ED3fFec1183').name().then(function(ensName){console.log("name from ens", ensName)})
.catch(function(err){console.log("errored",err)}); 