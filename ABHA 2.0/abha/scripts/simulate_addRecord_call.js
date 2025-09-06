const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const rpc = process.env.RPC_URL || 'http://127.0.0.1:7545';
    const provider = new ethers.JsonRpcProvider(rpc);

    // Load Truffle build artifact to ensure ABI matches deployed contract
    const artifactPath = path.resolve(__dirname, '..', 'build', 'contracts', 'HealthRecord.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const abi = artifact.abi;
    const iface = new ethers.Interface(abi);

    const net = await provider.getNetwork();
    const chainId = Number(net.chainId);
    const networks = artifact.networks || {};
    const deployed = networks[String(chainId)] || networks['1337'] || networks['5777'];
    const to = (process.argv[2] && ethers.isAddress(process.argv[2]) ? process.argv[2] : (deployed && deployed.address)) || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!to) throw new Error('Contract address not found. Pass it as argv[2] or set NEXT_PUBLIC_CONTRACT_ADDRESS.');

    // Prepare calldata for addRecord(imageCID, fileName)
    const cid = process.argv[3] || 'test-cid-123';
    const fileName = process.argv[4] || 'file.jpg';
    const data = iface.encodeFunctionData('addRecord', [cid, fileName]);

    // Prefer a real account as "from" to simulate permissions correctly
    let from;
    try {
      const accounts = await provider.send('eth_accounts', []);
      from = accounts?.[0];
    } catch (_) {}

    console.log('RPC:', rpc);
    console.log('ChainId:', chainId);
    console.log('Contract address:', to);
    if (from) console.log('From:', from);
    console.log('Function:', 'addRecord(string,string)');
    console.log('Args:', { cid, fileName });

    // eth_call simulation
    const callObj = from ? { to, data, from } : { to, data };
    const res = await provider.call(callObj, 'latest');
    if (res === '0x' || res === '0x0') {
      console.log('eth_call OK (no return data, as expected for non-view function).');
    } else {
      console.log('eth_call returned data:', res);
    }
  } catch (err) {
    console.error('Error:', err?.error?.message || err?.message || err);
    process.exit(1);
  }
})();
