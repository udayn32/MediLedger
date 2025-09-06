// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title HealthRecord
 * @dev On-chain registry for Patients, Doctors, and enriched Medical Records.
 * Adds consent, ACL, AI metadata, imaging, and audit fields.
 */
contract HealthRecord {
    // --- Admin ---
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Owner only");
        _;
    }

    modifier onlyDoctor() {
        require(isDoctor[msg.sender], "Doctor only");
        _;
    }

    // --- Enums ---
    enum ReviewStatus { Pending, Verified, Finalized }
    enum ConsentStatus { Pending, Granted, Revoked }
    enum Permission { None, Read, Write }

    // --- Patients ---
    struct Patient {
        uint256 pId;                 // auto-increment patient id
        address wallet;              // patientAddress
        string name;                 // optional off-chain label
        string labName;              // lab_name
        string labLocation;          // lab location
        bytes32 patientID;           // optional hashed ID
        bytes32 dobHash;             // optional hashed DOB
        uint256[] records;           // record ids
    }

    uint256 public patientCounter;
    mapping(address => bool) public isPatient;
    mapping(address => Patient) private patients; // wallet => patient
    mapping(uint256 => address) public pIdToAddress; // reverse lookup

    // --- Doctors ---
    struct Doctor {
        address wallet;
        string specialization;
        mapping(address => bool) approvedPatients; // patient wallet => consent
    }

    mapping(address => bool) public isDoctor; // role flag (admin managed)
    mapping(address => Doctor) private doctors;

    // --- Records ---
    struct Record {
        uint256 id;                 // recordID
        address patient;            // patient wallet
        address doctor;             // doctor creating/verifying (optional)
        // Imaging
    string imageCID;            // IPFS CID (X-ray). Off-chain asset; CID stored for reference
        string fileName;            // optional label
        bytes32 reportHash;         // hash of report/notes
        // Medical
        string diagnosis;           // e.g., "Pneumonia"
        bytes32 treatmentPlanHash;  // hashed prescription/plan
        uint256 followUpDate;       // optional
        // AI metadata
        uint8 aiConfidence;         // 0..100 (%)
        string aiModelVersion;      // model version
        string aiRemarks;           // optional
        // Consent & review state
        ReviewStatus reviewStatus;  // Pending/Verified/Finalized
        ConsentStatus consentStatus;// Granted/Revoked/Pending
        bool emergencyAccessFlag;   // emergency override
        // Audit
        uint256 createdAt;          // created timestamp
        uint256 updatedAt;          // updated timestamp
        uint8 verifiedByMask;       // bit 1: doctor, bit 2: AI
        bytes32 transactionHash;    // tx ref (optional, provided off-chain)
    }

    uint256 public recordCounter;
    mapping(uint256 => Record) public records;                 // id => record
    mapping(address => uint256[]) public patientRecords;       // patient => record ids
    mapping(uint256 => mapping(address => Permission)) public accessControlList; // per-record ACL

    // --- Events ---
    event PatientRegistered(uint256 indexed pId, address indexed wallet, string name, string labName, string labLocation);
    event DoctorAdded(address indexed doctorAddress, string specialization);
    event DoctorRemoved(address indexed doctorAddress);
    event ConsentGranted(address indexed patient, address indexed doctor);
    event ConsentRevoked(address indexed patient, address indexed doctor);
    event RecordAdded(uint256 indexed id, address indexed patient, address indexed doctor, string imageCID, string diagnosis);
    event RecordUpdated(uint256 indexed id, address indexed updater);
    event PermissionSet(uint256 indexed recordId, address indexed grantee, Permission permission);

    constructor() {
        owner = msg.sender;
    }

    // Helper structs to avoid stack-too-deep
    struct RecordInput {
        string fileName;
        string diagnosis;
        bytes32 treatmentPlanHash;
        uint256 followUpDate;
        bytes32 reportHash;
        uint8 aiConfidence;
        string aiModelVersion;
        string aiRemarks;
        ReviewStatus reviewStatus;
        ConsentStatus consentStatus;
        bool emergencyAccess;
        bytes32 txHash;
    }

    struct UpdateInput {
        string diagnosis;
        bytes32 treatmentPlanHash;
        uint256 followUpDate;
        bytes32 reportHash;
        uint8 aiConfidence;
        string aiModelVersion;
        string aiRemarks;
        ReviewStatus reviewStatus;
        ConsentStatus consentStatus;
        uint8 verifiedByMask;
        bool emergencyAccess;
    }

    // --- Admin: manage doctor role ---
    function addDoctor(address _doctorAddress, string calldata _specialization) external onlyOwner {
        require(!isDoctor[_doctorAddress], "Already doctor");
        isDoctor[_doctorAddress] = true;
        doctors[_doctorAddress].wallet = _doctorAddress;
        doctors[_doctorAddress].specialization = _specialization;
        emit DoctorAdded(_doctorAddress, _specialization);
    }

    function removeDoctor(address _doctorAddress) external onlyOwner {
        require(isDoctor[_doctorAddress], "Not doctor");
        isDoctor[_doctorAddress] = false;
        emit DoctorRemoved(_doctorAddress);
    }

    function updateDoctorSpecialization(string calldata _specialization) external onlyDoctor {
        doctors[msg.sender].specialization = _specialization;
    }

    function getDoctor(address _doctor) external view returns (string memory specialization, bool registered) {
        return (doctors[_doctor].specialization, isDoctor[_doctor]);
    }

    // --- Patient registry ---
    function registerPatient(
        string calldata _name,
        string calldata _labName,
        string calldata _labLocation,
        bytes32 _patientID,
        bytes32 _dobHash
    ) external {
        require(!isPatient[msg.sender], "Already patient");
        patientCounter++;
        patients[msg.sender].pId = patientCounter;
        patients[msg.sender].wallet = msg.sender;
        patients[msg.sender].name = _name;
        patients[msg.sender].labName = _labName;
        patients[msg.sender].labLocation = _labLocation;
        patients[msg.sender].patientID = _patientID;
        patients[msg.sender].dobHash = _dobHash;
        pIdToAddress[patientCounter] = msg.sender;
        isPatient[msg.sender] = true;
        emit PatientRegistered(patientCounter, msg.sender, _name, _labName, _labLocation);
    }

    function getPatient(address _wallet)
        external
        view
        returns (
            uint256 pId,
            string memory name,
            string memory labName,
            string memory labLocation,
            bytes32 patientID,
            bytes32 dobHash,
            uint256 recordCount
        )
    {
        Patient storage p = patients[_wallet];
        return (p.pId, p.name, p.labName, p.labLocation, p.patientID, p.dobHash, p.records.length);
    }

    // --- Consent (patient -> doctor) ---
    function grantDoctorConsent(address _doctor) external {
        require(isDoctor[_doctor], "Not doctor");
        doctors[_doctor].approvedPatients[msg.sender] = true;
        emit ConsentGranted(msg.sender, _doctor);
    }

    function revokeDoctorConsent(address _doctor) external {
        require(isDoctor[_doctor], "Not doctor");
        doctors[_doctor].approvedPatients[msg.sender] = false;
        emit ConsentRevoked(msg.sender, _doctor);
    }

    function isDoctorApprovedForPatient(address _doctor, address _patient) public view returns (bool) {
        return doctors[_doctor].approvedPatients[_patient];
    }

    // --- Records ---
    // Backward-compatible simple addRecord (patient self-add)
    function addRecord(string calldata _imageCID, string calldata _fileName) external {
        RecordInput memory input = RecordInput({
            fileName: _fileName,
            diagnosis: "",
            treatmentPlanHash: bytes32(0),
            followUpDate: 0,
            reportHash: bytes32(0),
            aiConfidence: 0,
            aiModelVersion: "",
            aiRemarks: "",
            reviewStatus: ReviewStatus.Pending,
            consentStatus: ConsentStatus.Pending,
            emergencyAccess: false,
            txHash: bytes32(0)
        });
        _addRecordExtended(
            msg.sender,
            isDoctor[msg.sender] ? msg.sender : address(0),
            _imageCID,
            input
        );
    }

    // Extended addRecord allowing doctor or patient to create for a patient
    function addRecordExtended(
        address _patient,
        string calldata _imageCID,
        RecordInput calldata input
    ) external {
        // Access: patient themselves OR approved doctor
        bool allowed = (msg.sender == _patient) || (isDoctor[msg.sender] && isDoctorApprovedForPatient(msg.sender, _patient));
        require(allowed, "No consent");
        address doctorAddr = isDoctor[msg.sender] ? msg.sender : address(0);
        _addRecordExtended(
            _patient,
            doctorAddr,
            _imageCID,
            input
        );
    }

    function _addRecordExtended(
        address _patient,
        address _doctor,
        string memory _imageCID,
        RecordInput memory input
    ) internal {
        recordCounter++;
        uint256 newId = recordCounter;
        Record storage r = records[newId];
        r.id = newId;
        r.patient = _patient;
        r.doctor = _doctor;
    r.imageCID = _imageCID;
        r.fileName = input.fileName;
        r.diagnosis = input.diagnosis;
        r.treatmentPlanHash = input.treatmentPlanHash;
        r.followUpDate = input.followUpDate;
        r.reportHash = input.reportHash;
        r.aiConfidence = input.aiConfidence;
        r.aiModelVersion = input.aiModelVersion;
        r.aiRemarks = input.aiRemarks;
        r.reviewStatus = input.reviewStatus;
        r.consentStatus = input.consentStatus;
        r.emergencyAccessFlag = input.emergencyAccess;
        r.createdAt = block.timestamp;
        r.updatedAt = block.timestamp;
        r.verifiedByMask = 0; // none initially
        r.transactionHash = input.txHash; // optional; off-chain can update later

        patientRecords[_patient].push(newId);
        if (isPatient[_patient]) {
            patients[_patient].records.push(newId);
        }
        emit RecordAdded(newId, _patient, _doctor, _imageCID, input.diagnosis);
    }

    // Update selective fields, callable by the patient, the assigned doctor, or owner
    function updateRecord(uint256 _recordId, UpdateInput calldata u) external {
        require(_recordId > 0 && _recordId <= recordCounter, "Bad id");
        Record storage r = records[_recordId];
        require(
            msg.sender == r.patient || msg.sender == r.doctor || msg.sender == owner,
            "Not authorized"
        );
        r.diagnosis = u.diagnosis;
        r.treatmentPlanHash = u.treatmentPlanHash;
        r.followUpDate = u.followUpDate;
        r.reportHash = u.reportHash;
        r.aiConfidence = u.aiConfidence;
        r.aiModelVersion = u.aiModelVersion;
        r.aiRemarks = u.aiRemarks;
        r.reviewStatus = u.reviewStatus;
        r.consentStatus = u.consentStatus;
        r.emergencyAccessFlag = u.emergencyAccess;
        r.verifiedByMask = u.verifiedByMask; // 1 doctor, 2 AI, 3 both
        r.updatedAt = block.timestamp;
        emit RecordUpdated(_recordId, msg.sender);
    }

    // --- Legacy-style ACL wrappers for backwards compatibility ---
    event AccessGranted(uint indexed recordId, address indexed doctorAddress);
    event AccessRevoked(uint indexed recordId, address indexed doctorAddress);

    function grantAccess(uint _recordId, address _doctorAddress) external {
        Record storage r = records[_recordId];
        require(_recordId > 0 && _recordId <= recordCounter, "Bad id");
        require(msg.sender == r.patient || msg.sender == owner, "Patient/owner only");
        require(isDoctor[_doctorAddress], "Not doctor");
        accessControlList[_recordId][_doctorAddress] = Permission.Read;
        emit AccessGranted(_recordId, _doctorAddress);
    }

    function revokeAccess(uint _recordId, address _doctorAddress) external {
        Record storage r = records[_recordId];
        require(_recordId > 0 && _recordId <= recordCounter, "Bad id");
        require(msg.sender == r.patient || msg.sender == owner, "Patient/owner only");
        accessControlList[_recordId][_doctorAddress] = Permission.None;
        emit AccessRevoked(_recordId, _doctorAddress);
    }

    // Optional: set/patch transaction hash ref from client after tx mined
    function setRecordTransactionHash(uint256 _recordId, bytes32 _txHash) external {
        Record storage r = records[_recordId];
        require(msg.sender == r.patient || msg.sender == owner, "Not allowed");
        r.transactionHash = _txHash;
        r.updatedAt = block.timestamp;
        emit RecordUpdated(_recordId, msg.sender);
    }

    // --- ACL ---
    function setRecordPermission(uint256 _recordId, address _grantee, Permission _perm) external {
        Record storage r = records[_recordId];
        require(msg.sender == r.patient || msg.sender == owner, "Owner/patient only");
        accessControlList[_recordId][_grantee] = _perm;
        emit PermissionSet(_recordId, _grantee, _perm);
    }

    // --- Views ---
    function getMyRecordIds() external view returns (uint256[] memory) {
        return patients[msg.sender].records;
    }

    function _hasRecordAccess(uint256 _recordId, address _who) internal view returns (bool) {
        Record storage r = records[_recordId];
        if (_who == r.patient) return true;
        if (accessControlList[_recordId][_who] != Permission.None) return true;
        if (r.emergencyAccessFlag && isDoctor[_who]) return true;
        if (isDoctor[_who] && isDoctorApprovedForPatient(_who, r.patient)) return true;
        return false;
    }

    function getRecordById(uint256 _recordId) external view returns (Record memory) {
        require(_recordId > 0 && _recordId <= recordCounter, "Record ID invalid");
        require(_hasRecordAccess(_recordId, msg.sender), "No permission");
        return records[_recordId];
    }

    // Summary of on-chain fields aligning with your table (timestamp = createdAt)
    function getRecordSummary(uint256 _recordId)
        external
        view
        returns (
            uint256 recordID,
            address patientAddress,
            address doctorAddress,
            string memory diagnosis,
            uint8 aiConfidence,
            bytes32 reportHash,
            uint256 timestamp,
            ConsentStatus consentStatus
        )
    {
        require(_recordId > 0 && _recordId <= recordCounter, "Record ID invalid");
        require(_hasRecordAccess(_recordId, msg.sender), "No permission");
        Record storage r = records[_recordId];
        return (
            r.id,
            r.patient,
            r.doctor,
            r.diagnosis,
            r.aiConfidence,
            r.reportHash,
            r.createdAt,
            r.consentStatus
        );
    }
}
