// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title HealthRecord
 * @dev This contract manages health records with role-based access control
 * for Patients and Doctors. It links a user to their health data stored on IPFS.
 */
contract HealthRecord {

    // --- State Variables ---

    address public owner; // The address of the contract deployer (admin)

    // A structure to hold the metadata for each health record.
    struct Record {
        uint id;
        string ipfsCid;
        string fileName;
        address patient; // Renamed from owner for clarity
        uint timestamp;
    }

    // Role management
    mapping(address => bool) public isDoctor;

    // Data storage
    uint public recordCounter;
    mapping(uint => Record) public records;
    mapping(address => uint[]) public patientRecords; // Maps a patient's address to their record IDs

    // Access control: Maps a record ID to a mapping of doctor addresses who have access
    mapping(uint => mapping(address => bool)) public accessList;

    // --- Events ---

    event RecordAdded(
        uint indexed id,
        address indexed patient,
        string ipfsCid
    );
    
    event DoctorAdded(address indexed doctorAddress);
    event DoctorRemoved(address indexed doctorAddress);
    event AccessGranted(uint indexed recordId, address indexed doctorAddress);
    event AccessRevoked(uint indexed recordId, address indexed doctorAddress);

    // --- Modifiers ---

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action.");
        _;
    }

    modifier onlyDoctor() {
        require(isDoctor[msg.sender], "Only a registered doctor can perform this action.");
        _;
    }

    // --- Constructor ---

    constructor() {
        owner = msg.sender; // The person who deploys the contract is the owner
    }

    // --- Role Management Functions (Admin only) ---

    /**
     * @dev Adds a new doctor to the system. Can only be called by the owner.
     * @param _doctorAddress The wallet address of the doctor to add.
     */
    function addDoctor(address _doctorAddress) public onlyOwner {
        require(!isDoctor[_doctorAddress], "This address is already registered as a doctor.");
        isDoctor[_doctorAddress] = true;
        emit DoctorAdded(_doctorAddress);
    }

    /**
     * @dev Removes a doctor from the system. Can only be called by the owner.
     * @param _doctorAddress The wallet address of the doctor to remove.
     */
    function removeDoctor(address _doctorAddress) public onlyOwner {
        require(isDoctor[_doctorAddress], "This address is not a registered doctor.");
        isDoctor[_doctorAddress] = false;
        emit DoctorRemoved(_doctorAddress);
    }


    // --- Patient Functions ---

    /**
     * @dev Adds a new health record. Can only be called by a patient.
     * @param _ipfsCid The IPFS Content ID for the data file.
     * @param _fileName The name of the file for easy identification.
     */
    function addRecord(string memory _ipfsCid, string memory _fileName) public {
        recordCounter++;
        uint newRecordId = recordCounter;

        records[newRecordId] = Record({
            id: newRecordId,
            ipfsCid: _ipfsCid,
            fileName: _fileName,
            patient: msg.sender,
            timestamp: block.timestamp
        });

        patientRecords[msg.sender].push(newRecordId);
        emit RecordAdded(newRecordId, msg.sender, _ipfsCid);
    }

    /**
     * @dev Grants a doctor access to one of the patient's records.
     * @param _recordId The ID of the record to grant access to.
     * @param _doctorAddress The address of the doctor being granted access.
     */
    function grantAccess(uint _recordId, address _doctorAddress) public {
        require(records[_recordId].patient == msg.sender, "You are not the owner of this record.");
        require(isDoctor[_doctorAddress], "This address is not a registered doctor.");
        
        accessList[_recordId][_doctorAddress] = true;
        emit AccessGranted(_recordId, _doctorAddress);
    }

    /**
     * @dev Revokes a doctor's access to one of the patient's records.
     * @param _recordId The ID of the record to revoke access from.
     * @param _doctorAddress The address of the doctor whose access is being revoked.
     */
    function revokeAccess(uint _recordId, address _doctorAddress) public {
        require(records[_recordId].patient == msg.sender, "You are not the owner of this record.");
        
        accessList[_recordId][_doctorAddress] = false;
        emit AccessRevoked(_recordId, _doctorAddress);
    }


    // --- View Functions (for Patients and Doctors) ---

    /**
     * @dev Retrieves all record IDs associated with the calling patient.
     * @return A dynamic array of uints representing the record IDs.
     */
    function getMyRecordIds() public view returns (uint[] memory) {
        return patientRecords[msg.sender];
    }
    
    /**
     * @dev Retrieves the details of a specific record.
     * Access is restricted to the patient owner or an authorized doctor.
     * @param _recordId The ID of the record to retrieve.
     * @return The full Record struct.
     */
    function getRecordById(uint _recordId) public view returns (Record memory) {
        require(_recordId > 0 && _recordId <= recordCounter, "Record ID is invalid.");
        
        Record storage recordToReturn = records[_recordId];
        
        bool hasAccess = (msg.sender == recordToReturn.patient) || (accessList[_recordId][msg.sender]);
        require(hasAccess, "You do not have permission to view this record.");
        
        return recordToReturn;
    }
}
