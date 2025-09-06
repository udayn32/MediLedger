const { ethers } = require('ethers');
const fs = require('fs');

(async () => {
  try {
    const rpc = 'http://127.0.0.1:7545';
    const provider = new ethers.JsonRpcProvider(rpc);

    const artifact = JSON.parse(fs.readFileSync('./src/app/HealthRecord.json','utf8'));
    const abi = artifact.abi || artifact.contracts?.['project:/contracts/HealthRecord.sol']?.HealthRecord?.abi || artifact.abi;
    const to = artifact.address || artifact.networks?.['5777']?.address || process.argv[2] || '0x5E7b45C3e28d2847935DFd93dD304d3DBFbae17c';

    console.log('Using contract address:', to);

    const accounts = await provider.send('eth_accounts', []);
    if (!accounts || accounts.length === 0) throw new Error('No unlocked accounts available on RPC');
    const from = accounts[0];
    console.log('Using unlocked account:', from);

    // Build transaction data
    const iface = new ethers.Interface(abi);
    const data = iface.encodeFunctionData('addRecord', ['test-cid-from-script', 'file-from-script.jpg']);

    const tx = {
      from,
      to,
      data,
      gas: 3000000
    };

    console.log('Sending transaction...');
    const txHash = await provider.send('eth_sendTransaction', [tx]);
    console.log('txHash:', txHash);

    // Wait for receipt
    const receipt = await provider.waitForTransaction(txHash, 1, 60000);
    console.log('Receipt:', receipt);

    if (receipt && receipt.status === 0) {
      console.error('Transaction failed (status 0).');
      // Try to get revert reason via eth_call
      try {
        const callRes = await provider.send('eth_call', [{ to, data }, receipt.blockNumber ? `0x${receipt.blockNumber.toString(16)}` : 'latest']);
        console.log('eth_call (post-fail) result:', callRes);
      } catch (e) {
        console.error('eth_call for revert reason failed:', e);
      }
    } else {
      console.log('Transaction succeeded.');
    }

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
