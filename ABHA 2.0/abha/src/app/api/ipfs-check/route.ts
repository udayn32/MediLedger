import { NextResponse } from 'next/server';

const DEFAULT_API = (process.env.NEXT_PUBLIC_IPFS_API_URL as string) || 'http://127.0.0.1:5001/api/v0';
const DEFAULT_GATEWAY = (process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL as string) || 'http://127.0.0.1:8080';

async function probe(url: string, opts: RequestInit = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status, url, text: await res.text().catch(() => '') };
  } catch (err: any) {
    clearTimeout(timer);
    return { ok: false, status: null, url, error: String(err) };
  }
}

export async function GET() {
  const apiUrl = DEFAULT_API.replace(/\/+$/, '');
  const gatewayUrl = DEFAULT_GATEWAY.replace(/\/+$/, '');

  // Probe API /version (POST is accepted by go-ipfs)
  const apiProbe = await probe(`${apiUrl}/version`, { method: 'POST' }, 3000);

  // Probe add endpoint to ensure uploads are accepted (we expect an error or JSON)
  const addProbe = await probe(`${apiUrl}/add`, { method: 'POST', body: null }, 3000);

  // Probe gateway root
  const gatewayProbe = await probe(gatewayUrl + '/', { method: 'GET' }, 2000);

  const body = {
    api: {
      url: apiUrl,
      version: apiProbe.ok ? apiProbe.text : null,
      add: { ok: addProbe.ok, status: addProbe.status, text: addProbe.text || null, error: addProbe.error || null },
      raw: apiProbe.error ? { error: apiProbe.error } : null
    },
    gateway: { url: gatewayUrl, ok: gatewayProbe.ok, status: gatewayProbe.status, error: gatewayProbe.error || null },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(body);
}
