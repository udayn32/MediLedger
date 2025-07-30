const HealthRecord = artifacts.require("HealthRecord");

module.exports = async function(deployer) {
  // Deploy the contract without constructor arguments as none are required
  await deployer.deploy(HealthRecord);
};