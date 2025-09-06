const http = require('http');
const rpc = '127.0.0.1';
const port = 7545;

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
    const accounts = await rpcCall('eth_accounts');
    console.log('RPC unlocked/accounts:', accounts);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
