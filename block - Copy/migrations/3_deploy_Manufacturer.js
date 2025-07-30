const Manufacturer = artifacts.require("Manufacturer");

module.exports = async function (deployer) {
    const farmerContractAddress = "0x9006F29b8f16e0598fD60d0380FB8bF90D87c0A1"; // Replace with your Farmer contract address
    await deployer.deploy(Manufacturer, farmerContractAddress);
};
