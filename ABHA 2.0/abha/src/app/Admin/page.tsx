"use client"
import { useEffect, useState } from 'react'
import { connectContract } from '@/lib/contract'

export default function AdminPage() {
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string; role?: string } | null>(null)
  const [contract, setContract] = useState<any>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [permRecordId, setPermRecordId] = useState('')
  const [permGrantee, setPermGrantee] = useState('')
  const [permLevel, setPermLevel] = useState<'None'|'Read'|'Write'>('Read')
  const [doctorAddress, setDoctorAddress] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user/me', { credentials: 'include' })
        const j = await res.json()
        if (j?.authenticated && j?.profile) setUserProfile({ name: j.profile.name, email: j.profile.email, role: j.profile.role })
      } catch {}
    })()
  }, [])

  const connect = async () => {
    try {
      const { account, contract } = await connectContract()
      setAccount(account); setContract(contract)
    } catch (e: any) { setError(e.message) }
  }

  const setPermission = async () => {
    if (!contract || !permRecordId || !permGrantee) { setError('Missing fields'); return }
    setStatus('Setting permission...'); setError('')
    try {
      const level = permLevel === 'Read' ? 1 : permLevel === 'Write' ? 2 : 0
      const tx = await contract.setRecordPermission(permRecordId, permGrantee, level)
      await tx.wait()
      setStatus('Permission updated')
    } catch (e: any) { setError(e.message); setStatus('') }
  }

  const addDoctor = async () => {
    if (!contract || !doctorAddress || !specialization) { setError('Missing doctor address or specialization'); return }
    setStatus('Adding doctor...'); setError('')
    try {
      const tx = await contract.addDoctor(doctorAddress, specialization)
      await tx.wait()
      setStatus(`Doctor ${doctorAddress} added successfully`)
      setDoctorAddress('')
      setSpecialization('')
    } catch (e: any) { 
      setError(e.message); 
      setStatus('') 
    }
  }

  const removeDoctor = async () => {
    if (!contract || !doctorAddress) { setError('Missing doctor address'); return }
    setStatus('Removing doctor...'); setError('')
    try {
      const tx = await contract.removeDoctor(doctorAddress)
      await tx.wait()
      setStatus(`Doctor ${doctorAddress} removed successfully`)
      setDoctorAddress('')
    } catch (e: any) { 
      setError(e.message); 
      setStatus('') 
    }
  }

  const isAdmin = userProfile?.role === 'admin'

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-amber-300">Admin Console</h1>
          {userProfile && (
            <p className="text-sm text-gray-400 mt-1">Logged in as <span className="font-semibold text-white">{userProfile.name || '—'}</span> · {userProfile.email} · role: <span className="uppercase">{userProfile.role}</span></p>
          )}
          {!isAdmin && (
            <div className="mt-4 max-w-2xl mx-auto bg-red-900/30 border border-red-500/50 rounded-xl p-4">
              <div className="text-red-400 text-3xl mb-2">🔐</div>
              <h2 className="text-lg font-semibold text-red-300 mb-2">Access Restricted</h2>
              <p className="text-red-200 text-sm mb-3">Admin role required to access this console.</p>
              
              <div className="text-left text-xs text-red-200 space-y-1">
                <p><strong>To gain admin access:</strong></p>
                <ol className="list-decimal list-inside ml-2 space-y-1">
                  <li>Create a new account with "Admin" role during signup</li>
                  <li>Or ask an existing admin to update your role</li>
                </ol>
              </div>
              
              <div className="flex gap-2 justify-center mt-4">
                <a href="/signup" className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs">
                  Create Admin Account
                </a>
                <a href="/login" className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-xs">
                  Login
                </a>
              </div>
            </div>
          )}
        </header>

        {isAdmin && (
          <div className="bg-gray-800/50 p-6 rounded border border-gray-700 space-y-4">
            {!account && (
              <button onClick={connect} className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded">Connect Wallet</button>
            )}
            {account && (
              <p className="text-sm text-gray-400">Connected: <span className="font-mono text-xs break-all">{account}</span></p>
            )}

            <div>
              <h2 className="text-xl font-semibold text-amber-300 mb-2">Set Record Permission</h2>
              <div className="grid md:grid-cols-2 gap-2">
                <input value={permRecordId} onChange={(e)=>setPermRecordId(e.target.value)} placeholder="Record ID" className="p-2 bg-gray-900 border border-gray-700 rounded" />
                <input value={permGrantee} onChange={(e)=>setPermGrantee(e.target.value)} placeholder="Grantee address" className="p-2 bg-gray-900 border border-gray-700 rounded" />
                <select value={permLevel} onChange={(e)=>setPermLevel(e.target.value as any)} className="p-2 bg-gray-900 border border-gray-700 rounded">
                  <option value="None">None</option>
                  <option value="Read">Read</option>
                  <option value="Write">Write</option>
                </select>
                <button onClick={setPermission} className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded">Update</button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-green-300 mb-2">Doctor Management</h2>
              <div className="grid md:grid-cols-3 gap-2">
                <input 
                  value={doctorAddress} 
                  onChange={(e)=>setDoctorAddress(e.target.value)} 
                  placeholder="Doctor wallet address (0x...)" 
                  className="p-2 bg-gray-900 border border-gray-700 rounded md:col-span-2" 
                />
                <input 
                  value={specialization} 
                  onChange={(e)=>setSpecialization(e.target.value)} 
                  placeholder="Specialization (e.g. Radiology)" 
                  className="p-2 bg-gray-900 border border-gray-700 rounded" 
                />
                <button onClick={addDoctor} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Add Doctor</button>
                <button onClick={removeDoctor} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Remove Doctor</button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                💡 Add your wallet address (0x83b68f72445c1d219db7415e3bb70b7d5a6a9dd1) as a doctor to remove the "Not Registered" message.
              </p>
            </div>

            {status && <p className="text-sm text-gray-300">{status}</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
