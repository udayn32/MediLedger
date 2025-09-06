const { ethers } = require('ethers');

(async () => {
  try {
    const rpc = 'http://127.0.0.1:7545';
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const address = process.argv[2] || '0x5E7b45C3e28d2847935DFd93dD304d3DBFbae17c';
    console.log('RPC:', rpc);
    const chainId = await provider.send('eth_chainId', []);
    console.log('chainId (hex):', chainId);
    const code = await provider.getCode(address);
    console.log('contract code length:', code.length);
    if (code === '0x' || code === '0x0') {
      console.log('No code at address on this RPC.');
    } else {
      console.log('Contract appears deployed here.');
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
