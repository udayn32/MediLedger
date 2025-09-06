const puppeteer = require('puppeteer');
const fs = require('fs');
const { ethers } = require('ethers');

(async () => {
  const NEXT_URL = process.env.NEXT_URL || 'http://localhost:3001';
  const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:7545';
  try {
    const artifact = JSON.parse(fs.readFileSync('./src/app/HealthRecord.json','utf8'));
    const abi = artifact.abi || artifact.contracts?.['project:/contracts/HealthRecord.sol']?.HealthRecord?.abi;
    const contractAddress = artifact.address || artifact.networks?.['5777']?.address || process.argv[2] || '0x5E7b45C3e28d2847935DFd93dD304d3DBFbae17c';

    // Get first unlocked account from RPC
    const tmpProvider = new ethers.JsonRpcProvider(RPC_URL);
    const accounts = await tmpProvider.send('eth_accounts', []);
    if (!accounts || accounts.length === 0) {
      console.error('No unlocked accounts on RPC. Start Ganache with unlocked accounts.');
      process.exit(1);
    }
    const unlocked = accounts[0];
    console.log('Using unlocked RPC account for fake MetaMask:', unlocked);

    const iface = new ethers.Interface(abi);
    const data = iface.encodeFunctionData('addRecord', ['e2e-fake-cid', 'e2e-file.jpg']);

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Inject a lightweight EIP-1193 provider that proxies to the local RPC
    await page.evaluateOnNewDocument((rpcUrl, unlockedAddr) => {
      // Minimal provider implementing request()
      window.ethereum = {
        isMetaMask: true,
        request: async ({ method, params }) => {
          // For eth_requestAccounts / eth_accounts
          if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
            return [unlockedAddr];
          }
          if (method === 'eth_chainId') {
            // Hardcode chain id for local Ganache 1337
            return '0x539';
          }
          // Proxy other methods to the RPC
          const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params: params || [] });
          const res = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
          const j = await res.json();
          if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
          return j.result;
        },
        on: () => {},
        removeListener: () => {},
        addListener: () => {}
      };
    }, RPC_URL, unlocked);

    console.log('Navigating to dashboard...');
    await page.goto(`${NEXT_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 30000 });

    // Give page time to load any client code
    await page.waitForTimeout(1000);

    // Simulate connect
    console.log('Requesting accounts via injected provider...');
    const accountsFromPage = await page.evaluate(async () => {
      return await window.ethereum.request({ method: 'eth_requestAccounts' });
    });
    console.log('Accounts from page.provider:', accountsFromPage);

    // Send tx via window.ethereum.request eth_sendTransaction
    console.log('Sending eth_sendTransaction from page (via fake provider)');
    const txHash = await page.evaluate(async (to, data, from) => {
      return await window.ethereum.request({ method: 'eth_sendTransaction', params: [{ from, to, data }] });
    }, contractAddress, data, unlocked);

    console.log('txHash from page:', txHash);

    // Wait for confirmation via Node provider
    const receipt = await tmpProvider.waitForTransaction(txHash, 1, 60000);
    console.log('Receipt:', receipt);

    if (receipt && receipt.status === 1) console.log('E2E headless browser flow succeeded.');
    else console.error('E2E tx failed or returned status 0.');

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E test error:', err);
    process.exit(1);
  }
})();
