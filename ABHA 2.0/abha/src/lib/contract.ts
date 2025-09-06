import { ethers, Contract } from 'ethers';
import HealthRecord from '../../build/contracts/HealthRecord.json';

export interface HealthRecordStruct {
  id: string;
  imageCid: string;
  fileName: string;
  patient: string;
  doctor: string;
  createdAt: number;
  timestamp: string; // human readable
  // Optional enriched fields (may be empty depending on how record was added)
  diagnosis?: string;
  aiConfidence?: number;
  reviewStatus?: number;
  consentStatus?: number;
}

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

export async function connectContract(): Promise<{account: string; contract: Contract; provider: ethers.BrowserProvider; signer: ethers.Signer; chainId: number}> {
  if (!(window as any).ethereum) throw new Error('MetaMask not detected');
  if (!contractAddress) throw new Error('Contract address missing');

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  // Check network of the injected provider (MetaMask)
  const network = await provider.getNetwork();
  const injectedChainId = Number(network.chainId);

  // Try reading contract code via the injected provider first. Some MetaMask providers
  // have a circuit-breaker that will block repeated failing calls and throw an opaque
  // error; if that happens we fall back to a direct HTTP RPC (configured via
  // NEXT_PUBLIC_RPC_URL) to avoid the circuit-breaker crash and to discover the
  // chainId where the contract actually lives.
  let code: string | null = null;
  let rpcChainId: number | null = null;
  const rpcUrl = (process.env.NEXT_PUBLIC_RPC_URL as string) || 'http://127.0.0.1:7545';

  try {
    code = await provider.getCode(contractAddress);
  } catch (err: any) {
    // Some injected providers (MetaMask) may return a complex error object when
    // a circuit-breaker blocks low-level RPCs. Coalesce to a short, helpful
    // message for logs so we don't spam huge extension stacks.
    const injectedErrMsg = err?.data?.cause?.message || err?.message || String(err);
    console.warn('Injected provider.getCode failed, falling back to HTTP RPC check:', injectedErrMsg);
    try {
      // Ask the HTTP RPC for its chainId first so we can compare networks
      const chainRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] })
      });
      const chainJson = await chainRes.json();
      if (chainJson.error) throw new Error(chainJson.error.message || JSON.stringify(chainJson.error));
      // eth_chainId returns a hex string like '0x539' — parse it as base-16.
      try {
        rpcChainId = parseInt(chainJson.result as string, 16);
      } catch (e) {
        rpcChainId = NaN as any;
      }

      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getCode', params: [contractAddress, 'latest'] })
      });
      const j = await res.json();
      if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
      code = j.result;
    } catch (err2: any) {
      throw new Error(`Failed to read contract code via injected provider and RPC fallback (${rpcUrl}): ${err2?.message || err2}`);
    }
  }

  if (!code || code === '0x' || code === '0x0') {
    throw new Error(`No contract code found at ${contractAddress}. If you're using MetaMask, make sure it's connected to the same local network where the contract was deployed (expected RPC: ${rpcUrl}).`);
  }

  // If we were able to query the HTTP RPC and it reports a different chainId than
  // the injected provider, surface a clear error so the user can switch MetaMask.
  if (!Number.isNaN(rpcChainId) && rpcChainId !== null && rpcChainId !== injectedChainId) {
    throw new Error(`Network mismatch: MetaMask is connected to chainId=${injectedChainId} but the RPC with the deployed contract reports chainId=${rpcChainId}. Switch MetaMask to the RPC/network where the contract was deployed (RPC: ${rpcUrl}).`);
  }

  const contract = new ethers.Contract(contractAddress, (HealthRecord as any).abi, signer);
  return { account: accounts[0], contract, provider, signer, chainId: injectedChainId };
}

export function formatRecord(r: any): HealthRecordStruct {
  return {
    id: r.id.toString(),
  imageCid: r.imageCID,
  fileName: r.fileName,
  patient: r.patient,
  doctor: r.doctor,
  createdAt: Number(r.createdAt || r.timestamp || 0),
  timestamp: new Date(Number(r.createdAt || r.timestamp || 0) * 1000).toLocaleString(),
  diagnosis: (r.diagnosis || '').toString(),
  aiConfidence: typeof r.aiConfidence === 'number' ? r.aiConfidence : Number(r.aiConfidence || 0),
  reviewStatus: typeof r.reviewStatus === 'number' ? r.reviewStatus : Number(r.reviewStatus || 0),
  consentStatus: typeof r.consentStatus === 'number' ? r.consentStatus : Number(r.consentStatus || 0),
  };
}