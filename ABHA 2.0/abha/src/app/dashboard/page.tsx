"use client";
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { connectContract, formatRecord, HealthRecordStruct } from '../../lib/contract';

interface AnalysisResult { prediction: string; confidence: number; }

interface PatientProfile {
  pId: string;
  name: string;
  labName: string;
  labLocation: string;
  recordCount: string;
}

export default function Dashboard() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [records, setRecords] = useState<HealthRecordStruct[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [ipfsReady, setIpfsReady] = useState(false);
  const [ipfsMode, setIpfsMode] = useState<'api'|'gateway'|'none'>('none');
  const [uploading, setUploading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecordStruct | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [ipfsInput, setIpfsInput] = useState('');
  const [ipfsLoadStatus, setIpfsLoadStatus] = useState('');
  const [ipfsPreviewUrl, setIpfsPreviewUrl] = useState<string | null>(null);
  const [ipfsPreviewType, setIpfsPreviewType] = useState<string | null>(null);
  const [doctorAddress, setDoctorAddress] = useState('');
  const [consentStatus, setConsentStatus] = useState('');
  const [diagnosis, setDiagnosis] = useState('Diagnostic record');
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string; role?: string; avatarCid?: string; phone?: string; address?: string; gender?: string; bloodGroup?: string; dob?: string } | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Accept both NEXT_PUBLIC_IPFS_GATEWAY_URL and legacy NEXT_PUBLIC_IPFS_GATEWAY
  const IPFS_API_URL = (process.env.NEXT_PUBLIC_IPFS_API_URL as string) || 'http://127.0.0.1:5001/api/v0';
  const IPFS_GATEWAY_URL = (process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL as string) || (process.env.NEXT_PUBLIC_IPFS_GATEWAY as string) || 'http://127.0.0.1:8080';

  useEffect(() => {
    (async () => {
      // Enhanced IPFS detection for IPFS Desktop
      const timeout = (ms: number) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
      const apiBase = IPFS_API_URL.replace(/\/$/, '');
      
      // Try multiple detection methods for IPFS Desktop
      let ipfsReady = false;
      
      // Method 1: Try version endpoint
      try {
        const controller = new AbortController();
        const probePromise = fetch(`${apiBase}/version`, { 
          method: 'POST', 
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        });
        const res = await Promise.race([probePromise, timeout(3000)]) as Response;
        if (res && res.status < 500) {
          ipfsReady = true;
        }
      } catch (e) {
        console.log('IPFS version check failed:', e);
      }
      
      // Method 2: Try id endpoint if version failed
      if (!ipfsReady) {
        try {
          const controller = new AbortController();
          const probePromise = fetch(`${apiBase}/id`, { 
            method: 'POST', 
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' }
          });
          const res = await Promise.race([probePromise, timeout(3000)]) as Response;
          if (res && res.status < 500) {
            ipfsReady = true;
          }
        } catch (e) {
          console.log('IPFS id check failed:', e);
        }
      }
      
      if (ipfsReady) {
        setIpfsReady(true);
        setIpfsMode('api');
        setError('');
        return;
      }
      
      // Fallback: Try gateway
      try {
        const controllerG = new AbortController();
        const gPromise = fetch(IPFS_GATEWAY_URL, { method: 'GET', signal: controllerG.signal });
        const g = await Promise.race([gPromise, timeout(2000)]) as Response;
        if (g && g.status < 500) {
          setIpfsReady(false);
          setIpfsMode('gateway');
          setError('IPFS API not available; gateway reachable (uploads disabled).');
          return;
        }
      } catch (_) { /* ignore */ }

      // No IPFS available
      setIpfsReady(false);
      setIpfsMode('none');
      setError('IPFS not available. Please start IPFS Desktop and restart this page.');
    })();
  }, []);

  useEffect(() => {
    // Load logged-in user profile (from cookie JWT -> DB)
    (async () => {
      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (!res.ok) return;
        const j = await res.json();
        if (j?.authenticated && j?.profile) {
          const p = j.profile;
          setUserProfile({
            name: p.name,
            email: p.email,
            role: p.role,
            avatarCid: p.avatarCid,
            phone: p.phone,
            address: p.address,
            gender: p.gender,
            bloodGroup: p.bloodGroup,
            dob: p.dob,
          });
        }
      } catch { /* ignore */ }
    })();
  }, []);

  const saveProfile = async () => {
    if (!userProfile) return;
    setProfileSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userProfile.name,
          avatarCid: userProfile.avatarCid,
          phone: userProfile.phone,
          address: userProfile.address,
          gender: userProfile.gender,
          bloodGroup: userProfile.bloodGroup,
          dob: userProfile.dob,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');
      setEditingProfile(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const connect = async () => {
    try {
      const { account, contract } = await connectContract();
      setAccount(account);
      setContract(contract);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchPatientProfile = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const p = await contract.getPatient(account);
      // returns (pId, name, labName, labLocation, patientID, dobHash, recordCount)
      if (p && p[0] && p[0].toString() !== '0') {
        setPatientProfile({
          pId: p[0].toString(),
          name: p[1] as string,
          labName: p[2] as string,
          labLocation: p[3] as string,
          recordCount: p[6].toString(),
        });
      } else {
        setPatientProfile(null);
      }
    } catch (e) {
      // Not registered yet
      setPatientProfile(null);
    }
  }, [contract, account]);

  const fetchRecords = useCallback(async () => {
    if (!contract) return;
    try {
      setStatus('Loading records...');
      const ids = await contract.getMyRecordIds();
      const data = await Promise.all(ids.map((id: any) => contract.getRecordById(id)));
      setRecords(data.map(formatRecord));
      setStatus('');
    } catch (e: any) {
      setError(e.message);
      setStatus('');
    }
  }, [contract]);

  useEffect(() => {
    if (contract) fetchRecords();
  }, [contract, fetchRecords]);

  useEffect(() => {
    if (contract && account) fetchPatientProfile();
  }, [contract, account, fetchPatientProfile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => { 
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview URL for images
      if (selectedFile.type.startsWith('image/')) {
        // Clean up previous preview URL to prevent memory leaks
        if (filePreviewUrl) {
          URL.revokeObjectURL(filePreviewUrl);
        }
        const previewUrl = URL.createObjectURL(selectedFile);
        setFilePreviewUrl(previewUrl);
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const uploadToIpfs = async (file: File): Promise<string> => {
    // Try upload - sometimes works despite detection issues
    const fd = new FormData(); 
    fd.append('file', file);
    
    try {
      const res = await fetch(`${IPFS_API_URL}/add`, { 
        method: 'POST', 
        body: fd
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(`IPFS Desktop is blocking file uploads for security. Try:
1. Close IPFS Desktop completely
2. Restart IPFS Desktop  
3. In IPFS Desktop settings, ensure "API Access" is enabled
4. Retry upload`);
        }
        const text = await res.text().catch(() => 'no-body');
        throw new Error(`IPFS upload failed: ${res.status} ${res.statusText} - ${text}`);
      }
      
      const json = await res.json(); 
      if (!json.Hash) {
        throw new Error('IPFS response missing hash');
      }
      return json.Hash;
    } catch (error: any) {
      if (error.message.includes('fetch') && !error.message.includes('403')) {
        throw new Error('IPFS connection failed. Please ensure IPFS Desktop is running.');
      }
      throw error;
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Capture form reference early (event may be nulled or currentTarget lost in async chains)
    const formEl = e.currentTarget as HTMLFormElement | null;
    if (!file || !contract) { setError('Missing file or contract connection'); return; }
    setUploading(true); setStatus('Uploading to IPFS...'); setError('');
    try {
      const cid = await uploadToIpfs(file);
      setStatus('Submitting to blockchain...');
      
      // Use addRecordExtended to include diagnosis
      const recordInput = {
        fileName: file.name,
        diagnosis: diagnosis || 'Diagnostic record', // Default diagnosis if empty
        treatmentPlanHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        followUpDate: 0,
        reportHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        aiConfidence: 0,
        aiModelVersion: '',
        aiRemarks: '',
        reviewStatus: 0, // Pending
        consentStatus: 0, // Pending  
        emergencyAccess: false,
        txHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
      };
      
      const tx = await contract.addRecordExtended(account, cid, recordInput);
      await tx.wait();
      setFile(null);
      setDiagnosis('Diagnostic record'); // Reset to default
      
      // Clear file preview
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
      }
      
      // Guard in case formEl is null
      formEl?.reset();
      setStatus('Record added');
      fetchRecords();
    } catch (e: any) {
      setError(e.message);
      setStatus('');
    } finally {
      setUploading(false);
    }
  };

  const handleConsent = async (action: 'grant' | 'revoke') => {
    if (!contract || !doctorAddress) { setError('Enter doctor address'); return; }
    setConsentStatus(`${action === 'grant' ? 'Granting' : 'Revoking'} consent...`);
    setError('');
    try {
      const tx = action === 'grant'
        ? await contract.grantDoctorConsent(doctorAddress)
        : await contract.revokeDoctorConsent(doctorAddress);
      await tx.wait();
      setConsentStatus(`Consent ${action === 'grant' ? 'granted' : 'revoked'} for ${doctorAddress}`);
      setDoctorAddress('');
    } catch (e: any) {
      setError(e.message);
      setConsentStatus('');
    }
  };

  const handleAnalyze = async (record: HealthRecordStruct) => {
    setSelectedRecord(record); setAnalysisResult(null); setAnalyzing(true); setStatus('Analyzing...'); setError('');
    try {
  const gatewayUrl = `http://127.0.0.1:8080/ipfs/${record.imageCid}`;
      const imgResp = await fetch(gatewayUrl); if (!imgResp.ok) throw new Error('Fetch from IPFS failed');
      const blob = await imgResp.blob();
      const fd = new FormData(); fd.append('file', new File([blob], record.fileName, { type: blob.type || 'image/png' }));
      const resp = await fetch('/api/analyze', { method: 'POST', body: fd });
      if (!resp.ok) throw new Error('Analysis API error');
      const data = await resp.json(); setAnalysisResult(data); setStatus('');
    } catch (e: any) { setError(e.message); setStatus(''); }
    finally { setAnalyzing(false); }
  };

  const normalizeToCid = (input: string) => {
    if (!input) return '';
    // If user pasted a full URL containing /ipfs/<cid>, try to extract the cid
    try {
      const u = new URL(input);
      const parts = u.pathname.split('/').filter(Boolean);
      const ipfsIndex = parts.indexOf('ipfs');
      if (ipfsIndex >= 0 && parts[ipfsIndex + 1]) return parts[ipfsIndex + 1];
    } catch (e) {
      // not a full URL, fall through
    }
    // remove leading slashes and optional ipfs/ prefix
    const cid = input.replace(/^\/+/, '').replace(/^ipfs\/?/, '');
    return cid;
  };

  const loadFromIpfs = async () => {
    if (!ipfsInput) return setIpfsLoadStatus('Please paste a CID or an IPFS URL');
    setIpfsLoadStatus('Trying gateways...');
    setIpfsPreviewUrl(null); setIpfsPreviewType(null);
    const cid = normalizeToCid(ipfsInput.trim());
    if (!cid) return setIpfsLoadStatus('Could not parse CID from input');

    const fallbackGateways = [
      (IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs').replace(/\/+$/, ''),
      'https://dweb.link/ipfs',
      'https://cloudflare-ipfs.com/ipfs',
      'https://ipfs.io/ipfs'
    ];

    let lastErr: any = null;
    for (const g of fallbackGateways) {
      const url = `${g}/` + cid;
      setIpfsLoadStatus(`Trying ${g} ...`);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!resp.ok) {
          lastErr = new Error(`HTTP ${resp.status} from ${g}`);
          continue;
        }
        const ct = resp.headers.get('content-type') || '';
        const blob = await resp.blob();
        const objectUrl = URL.createObjectURL(blob);
        setIpfsPreviewUrl(objectUrl);
        setIpfsPreviewType(ct);
        setIpfsLoadStatus(`Loaded via ${g}`);
        return;
      } catch (err: any) {
        lastErr = err;
        // continue to next gateway
      }
    }

    setIpfsLoadStatus(`All gateways failed: ${lastErr?.message || 'unknown error'}`);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-12 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Patient <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Manage your health records securely with blockchain technology and AI-powered diagnostics
            </p>
            
            {/* Role-based notification */}
            {userProfile?.role === 'doctor' && (
              <div className="mt-6 mx-auto max-w-2xl medical-card p-6 rounded-2xl">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🩺</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Doctor View</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  You're viewing the patient dashboard as a doctor. This interface is designed for patient record management.
                  Access the <a href="/doctor" className="text-cyan-400 hover:text-cyan-300 underline">Doctor Portal</a> for medical professional tools.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile */}
          <aside className="lg:col-span-1">
            <div className="medical-card rounded-2xl p-6 sticky top-24">
              <div className="text-center mb-6">
                {userProfile?.avatarCid ? (
                  <img
                    src={`${IPFS_GATEWAY_URL}/ipfs/${userProfile.avatarCid}`}
                    alt="Profile"
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-cyan-400 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {userProfile?.name ? userProfile.name[0].toUpperCase() : '👤'}
                    </span>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-white mb-1">
                  {userProfile?.name || 'Patient Profile'}
                </h3>
                <p className="text-sm text-gray-400 mb-2">{userProfile?.email}</p>
                
                {userProfile?.role && (
                  <div className="inline-flex items-center space-x-1 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 px-3 py-1 rounded-full">
                    <span className="text-xs text-cyan-400 font-medium capitalize">{userProfile.role}</span>
                  </div>
                )}
              </div>

              {/* Profile Details */}
              {userProfile && (
                <div className="space-y-3 text-sm">
                  {userProfile.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="text-white">{userProfile.phone}</span>
                    </div>
                  )}
                  {userProfile.bloodGroup && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blood:</span>
                      <span className="text-red-400 font-medium">{userProfile.bloodGroup}</span>
                    </div>
                  )}
                  {userProfile.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gender:</span>
                      <span className="text-white capitalize">{userProfile.gender}</span>
                    </div>
                  )}
                  {userProfile.dob && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">DOB:</span>
                      <span className="text-white">{userProfile.dob}</span>
                    </div>
                  )}
                  {userProfile.address && (
                    <div>
                      <span className="text-gray-400 block">Address:</span>
                      <span className="text-white text-xs">{userProfile.address}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setEditingProfile(true)}
                className="w-full mt-6 glass px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all"
              >
                Edit Profile
              </button>

              {/* Connection Status */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-3">Connection Status</h4>
                
                {!account ? (
                  <button 
                    onClick={connect} 
                    className="w-full btn-gradient px-4 py-3 rounded-lg font-semibold shadow-lg"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="glass p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Wallet Address:</p>
                      <p className="font-mono text-[10px] text-white break-all">{account}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">IPFS Status:</span>
                      {ipfsMode === 'api' ? (
                        <span className="text-green-400 text-xs flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                          API Ready
                        </span>
                      ) : ipfsMode === 'gateway' ? (
                        <span className="text-yellow-400 text-xs flex items-center">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
                          Gateway Only
                        </span>
                      ) : (
                        <span className="text-red-400 text-xs flex items-center">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                          Disconnected
                        </span>
                      )}
                    </div>
                    
                    {ipfsMode === 'gateway' && (
                      <p className="text-[10px] text-gray-500">
                        Uploads disabled. Start IPFS API to enable.
                      </p>
                    )}
                    
                    {patientProfile && (
                      <div className="glass p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Records:</p>
                        <p className="text-white font-semibold">{patientProfile.recordCount}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-8">
            {/* Action Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload Section */}
              <div className="medical-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📤</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Upload X-Ray</h2>
                    <p className="text-gray-400 text-sm">Add new medical imaging to your records</p>
                  </div>
                </div>

                {ipfsMode === 'none' && (
                  <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-400">⚠️</span>
                      <h3 className="font-medium text-yellow-400">IPFS Not Available</h3>
                    </div>
                    <p className="text-yellow-200 text-sm mb-3">Cannot upload files. To fix CORS issues:</p>
                    <ol className="text-yellow-200 text-sm space-y-1 list-decimal list-inside ml-2 mb-3">
                      <li><strong>Close IPFS Desktop completely</strong></li>
                      <li><strong>Restart IPFS Desktop</strong></li>
                      <li>Check IPFS Desktop settings for "API Access"</li>
                      <li>Wait 10 seconds, then click "Retry Connection"</li>
                    </ol>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="btn-gradient px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Retry Connection
                    </button>
                  </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Medical Image
                    </label>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      required 
                      className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-white file:bg-gradient-to-r file:from-cyan-500 file:to-blue-500 hover:file:from-cyan-400 hover:file:to-blue-400 file:cursor-pointer"
                    />
                  </div>
                  
                  {/* Image Preview */}
                  {filePreviewUrl && (
                    <div className="p-4 border border-white/10 rounded-xl bg-black/20">
                      <p className="text-sm text-gray-400 mb-3">Preview:</p>
                      <img
                        src={filePreviewUrl}
                        alt="Selected file preview"
                        className="max-w-full max-h-64 rounded-lg object-contain mx-auto block border border-white/10"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Diagnosis Notes (optional)
                    </label>
                    <input 
                      type="text" 
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Enter diagnosis or leave default"
                      className="w-full glass px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default: "Diagnostic record"</p>
                  </div>
                  
                  <button 
                    disabled={uploading || !file || !account || !contract} 
                    type="submit" 
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all ${
                      uploading || !file || !account || !contract
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'btn-gradient shadow-lg hover:shadow-cyan-500/25'
                    }`}
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {status}
                      </span>
                    ) : ipfsMode === 'none' ? 'Try Upload (IPFS Issues)' : 'Upload to Blockchain'}
                  </button>
                </form>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Doctor Access Control */}
              <div className="medical-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🔐</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Doctor Access Control</h2>
                    <p className="text-gray-400 text-sm">Manage who can view your records</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-300">
                    {userProfile?.role === 'patient' 
                      ? 'Grant or revoke doctor access to your medical records.' 
                      : 'Patients use this section to grant you access to their records.'}
                  </p>
                  
                  {userProfile?.role === 'patient' ? (
                    <div className="space-y-3">
                      <input 
                        value={doctorAddress} 
                        onChange={(e)=>setDoctorAddress(e.target.value)} 
                        placeholder="Doctor wallet address" 
                        className="w-full glass px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={()=>handleConsent('grant')} 
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-lg text-white font-medium hover:from-green-400 hover:to-green-500 transition-all"
                        >
                          Grant Access
                        </button>
                        <button 
                          type="button" 
                          onClick={()=>handleConsent('revoke')} 
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-lg text-white font-medium hover:from-red-400 hover:to-red-500 transition-all"
                        >
                          Revoke Access
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-400">🩺</span>
                        <h3 className="font-medium text-blue-400">For Doctors:</h3>
                      </div>
                      <p className="text-blue-200 text-sm">
                        To access patient records, the patient must grant you consent using your wallet address.
                        Check consent status in the Doctor Portal.
                      </p>
                    </div>
                  )}
                  
                  {consentStatus && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-sm">{consentStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && userProfile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="col-span-2">Name<input className="mt-1 w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded" value={userProfile.name || ''} onChange={(e)=>setUserProfile({...userProfile, name: e.target.value})} /></label>
              <label>Phone<input className="mt-1 w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded" value={userProfile.phone || ''} onChange={(e)=>setUserProfile({...userProfile, phone: e.target.value})} /></label>
              <label>DOB<input className="mt-1 w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded" value={userProfile.dob || ''} onChange={(e)=>setUserProfile({...userProfile, dob: e.target.value})} placeholder="YYYY-MM-DD" /></label>
              <label>Gender<input className="mt-1 w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded" value={userProfile.gender || ''} onChange={(e)=>setUserProfile({...userProfile, gender: e.target.value})} /></label>
              <label>Blood Group<input className="mt-1 w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded" value={userProfile.bloodGroup || ''} onChange={(e)=>setUserProfile({...userProfile, bloodGroup: e.target.value})} placeholder="A+, O- ..." /></label>
              <label className="col-span-2">Address<textarea className="mt-1 w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded" rows={2} value={userProfile.address || ''} onChange={(e)=>setUserProfile({...userProfile, address: e.target.value})} /></label>
              <label className="col-span-2">Avatar CID (IPFS)<input className="mt-1 w-full bg-gray-950 border border-gray-800 px-3 py-2 rounded font-mono text-xs" value={userProfile.avatarCid || ''} onChange={(e)=>setUserProfile({...userProfile, avatarCid: e.target.value})} placeholder="bafy..." /></label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm" onClick={()=>setEditingProfile(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-sm disabled:bg-gray-700" disabled={profileSaving} onClick={saveProfile}>{profileSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}