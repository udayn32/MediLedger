const http = require('http');

const rpc = '127.0.0.1';
const port = 7545;
const address = process.argv[2] || '0x5E7b45C3e28d2847935DFd93dD304d3DBFbae17c';

function rpcCall(method, params=[]) {
  const data = JSON.stringify({jsonrpc: '2.0', id: 1, method, params});
  const options = { hostname: rpc, port, path: '/', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }};
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { const json = JSON.parse(body); if (json.error) return reject(json.error); resolve(json.result); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const chainId = await rpcCall('eth_chainId');
    console.log('chainId (hex):', chainId);
    const code = await rpcCall('eth_getCode', [address, 'latest']);
    console.log('code length:', code ? code.length : 0);
    if (!code || code === '0x' || code === '0x0') console.log('No contract code at address on this RPC.');
    else console.log('Contract code present on RPC.');
  } catch (err) {
    console.error('RPC error:', err);
    process.exit(1);
  }
})();
