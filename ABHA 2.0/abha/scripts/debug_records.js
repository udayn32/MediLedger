const { ethers } = require('ethers');
const HealthRecord = require('../build/contracts/HealthRecord.json');

async function debugRecords() {
    try {
        console.log('Connecting to contract...');
        
        // Connect to local provider
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
        const contractAddress = '0xacE1Abb4c78D49160Fd2a6AD1159fffcaB612695';
        
        // Get accounts
        const accounts = await provider.listAccounts();
        console.log('Available accounts:', accounts.map(acc => acc.address));
        
        if (accounts.length === 0) {
            console.log('No accounts found');
            return;
        }
        
        const signer = accounts[0];
        console.log('Using account:', signer.address);
        
        // Create contract instance
        const contract = new ethers.Contract(contractAddress, HealthRecord.abi, signer);
        
        console.log('\n=== Testing getMyRecordIds ===');
        try {
            const recordIds = await contract.getMyRecordIds();
            console.log('Record IDs:', recordIds);
            console.log('Record IDs length:', recordIds.length);
            console.log('Record IDs type:', typeof recordIds);
            
            if (recordIds.length > 0) {
                console.log('\n=== Testing getRecordById for first record ===');
                const firstId = recordIds[0];
                console.log('First record ID:', firstId.toString());
                
                try {
                    const record = await contract.getRecordById(firstId);
                    console.log('Record data:', record);
                } catch (e) {
                    console.error('Error getting record by ID:', e.message);
                }
            } else {
                console.log('No records found for this account');
            }
            
        } catch (e) {
            console.error('Error getting record IDs:', e.message);
            console.error('Full error:', e);
        }
        
        console.log('\n=== Testing recordCounter ===');
        try {
            const counter = await contract.recordCounter();
            console.log('Total records in contract:', counter.toString());
        } catch (e) {
            console.error('Error getting record counter:', e.message);
        }
        
    } catch (error) {
        console.error('Connection error:', error.message);
        console.error('Full error:', error);
    }
}

debugRecords().catch(console.error);
