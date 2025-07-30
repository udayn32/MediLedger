module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "5777" ,
      gas: 6721975,        // You can try increasing this value if needed
      gasPrice: 20000000000  
    }
  },

  // The 'compilers' section should be outside of 'networks'
  compilers: {
    solc: {
      version: "0.8.0",  // Specify the exact version or "^0.8.0"
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
