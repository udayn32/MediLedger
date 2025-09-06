## ABHA 2.0 – Decentralized Health Records & AI X‑Ray Analysis

ABHA 2.0 combines: 
- Ethereum smart contracts for record ownership & doctor access control
- IPFS for decentralized storage of patient X‑ray images
- A Next.js dApp (App Router) for patient interaction
- A Python (FastAPI + TensorFlow) service for pneumonia detection

### High-Level Flow
1. Patient uploads an X‑ray -> file stored on local IPFS node -> CID returned
2. CID + metadata stored on-chain via `HealthRecord` contract
3. Doctor (or patient) retrieves record IDs and authorized CIDs from blockchain
4. Image fetched from IPFS gateway and sent to AI inference API
5. Model returns prediction (PNEUMONIA / NORMAL + confidence)

### Repos / Folders
```
abha/                 # Next.js frontend + contract artifacts
contracts/            # Solidity contract (HealthRecord.sol)
server/               # ML training + inference (FastAPI)
```

### Prerequisites
- Node.js 18+
- Python 3.10+
- Local IPFS daemon (port 5001 API, gateway 8080)
- MetaMask (connected to same network as deployed contract)
- Deployed `HealthRecord` contract; set `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`

### Install & Run (Frontend)
```bash
cd abha
npm install
npm run dev
```
App: http://localhost:3000 (landing) and http://localhost:3000/dashboard (patient dashboard)

### Smart Contract
Located at `contracts/HealthRecord.sol` with functions:
- addRecord(ipfsCid, fileName)
- getMyRecordIds()
- getRecordById(id)
- grantAccess(recordId, doctorAddress)
- revokeAccess(recordId, doctorAddress)

### Python Inference Service
Train (optional if model already provided):
```bash
cd server
python train_model.py
```
Run inference API:
```bash
cd server
pip install -r requirements.txt
uvicorn inference_service:app --reload --port 8001
```
Health check: http://localhost:8001/health

### Frontend -> Backend Integration
- Upload: dashboard calls IPFS HTTP API directly (POST /api/v0/add)
- Analysis: dashboard -> Next.js route `/api/analyze` -> Python `/predict`

### Environment Variables
In `abha/.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourAddress
INFERENCE_API_URL=http://127.0.0.1:8001
```

### Security & Next Steps
- Add role UI for doctor management (owner only)
- Implement doctor view for requesting patient record access
- Add JWT / signature based auth for inference API (optional)
- Add pinning (e.g., web3.storage) for IPFS persistence
- Add model versioning & performance metrics dashboard

### License
MIT
