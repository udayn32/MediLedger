const inspector = artifacts.require("inspector");

module.exports = async function (deployer) {
    const farmerContractAddress = "0x297fAa5Eca9cFEBE9112588A513e5eCB668ACc17"; // Replace with your Farmer contract address
    await deployer.deploy(inspector, farmerContractAddress);
};