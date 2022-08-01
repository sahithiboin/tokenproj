var MyToken = artifacts.require("./MyToken.sol");
var MyTokenSales = artifacts.require("./MyTokenSale.sol");
var kycContract = artifacts.require("./KycContract.sol");
require('dotenv').config({path: '/Users/satheeshkumarb/tokenproj/.env'});

module.exports = async function(deployer) {
    let addr = await web3.eth.getAccounts();
    await deployer.deploy(MyToken, process.env.INITIAL_TOKENS);
    await deployer.deploy(kycContract);
    await deployer.deploy(MyTokenSales, 1, addr[0], MyToken.address, kycContract.address);
    let tokenInstance = await MyToken.deployed();
    await tokenInstance.transfer(MyTokenSales.address, process.env.INITIAL_TOKENS);
};