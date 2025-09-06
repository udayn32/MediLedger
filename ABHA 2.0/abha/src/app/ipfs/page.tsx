"use client"
import { useState } from "react"

const ROOT_CID = "bafybeifut3pqwry3eaoxa66ytthvfjoghyak27cknbnbffu37jwn3ioxwy"

export default function IpfsPage() {
  const [useLocal, setUseLocal] = useState(true)
  const gatewayLocal = `http://127.0.0.1:8080/ipfs/${ROOT_CID}`
  const gatewayPublic = `https://ipfs.io/ipfs/${ROOT_CID}`

  // Example file (will exist in the dataset). If it fails, the public gateway link can be used.
  const samplePath = "test/NORMAL/IM-0001-0001.jpeg"
  const localUrl = `${gatewayLocal}/${samplePath}`
  const publicUrl = `${gatewayPublic}/${samplePath}`

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">IPFS demo — stored dataset</h1>

      <section className="mb-6">
        <p className="mb-2">Root CID:</p>
        <code className="block p-2 bg-gray-100 rounded">{ROOT_CID}</code>
        <div className="mt-3 space-x-3">
          <a href={`${gatewayLocal}`} target="_blank" rel="noreferrer" className="underline">Open local gateway</a>
          <a href={`${gatewayPublic}`} target="_blank" rel="noreferrer" className="underline">Open public gateway</a>
        </div>
      </section>

      <section className="mb-6">
        <p className="mb-2">Sample image (local gateway preferred):</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setUseLocal(true)}
            className={`px-3 py-1 rounded ${useLocal ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            Use Local Gateway
          </button>
          <button
            onClick={() => setUseLocal(false)}
            className={`px-3 py-1 rounded ${!useLocal ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            Use Public Gateway
          </button>
        </div>
        <div className="mt-4">
          <img
            src={useLocal ? localUrl : publicUrl}
            alt="Sample X-ray"
            style={{ maxWidth: 600, width: '100%', borderRadius: 8 }}
            onError={(e) => {
              // if local fails, fall back to public gateway automatically
              if (useLocal) {
                setUseLocal(false)
              }
            }}
          />
          <p className="text-sm text-gray-600 mt-2">If the image doesn't load, ensure the IPFS daemon and local gateway are running, or switch to the public gateway.</p>
        </div>
      </section>

      <section>
        <p className="mb-2">Quick commands (PowerShell) to verify on your machine:</p>
        <pre className="bg-gray-100 p-3 rounded text-sm">&amp; "$env:LOCALAPPDATA\go-ipfs\ipfs.exe" ls {ROOT_CID}</pre>
        <pre className="bg-gray-100 p-3 rounded text-sm mt-2">Invoke-WebRequest "http://127.0.0.1:8080/ipfs/{ROOT_CID}"</pre>
      </section>
    </main>
  )
}
