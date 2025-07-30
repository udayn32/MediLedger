// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Farmer {
    struct Crop {
        string cropName;
        uint256 quantity;
        uint256 price;
        string placeOfOrigin;
    }

    struct FarmerDetails {
        string name;
        string location;
        string phone;
        string email;
        bytes32 passwordHash; // Storing password securely as a hash
    }

    // Event declaration
    event CropAdded(string cropName, uint256 quantity, uint256 price, string placeOfOrigin, address indexed farmer);
    event FarmerRegistered(address indexed farmer, string name, string location, string phone, string email);

    mapping(address => Crop[]) public crops;
    mapping(address => FarmerDetails) public farmerDetails;

    // Function to register farmer details
    function registerFarmer(string memory _name, string memory _location, string memory _phone, string memory _email, string memory _password) public {
        // Hash the password before storing it
        bytes32 passwordHash = keccak256(abi.encodePacked(_password));
        FarmerDetails memory newFarmer = FarmerDetails(_name, _location, _phone, _email, passwordHash);
        farmerDetails[msg.sender] = newFarmer;
        
        // Emit event
        emit FarmerRegistered(msg.sender, _name, _location, _phone, _email);
    }

    // Function to add crop and emit an event
    function addAndGetCrop(string memory _cropName, uint256 _quantity, uint256 _price, string memory _placeOfOrigin) public {
        Crop memory newCrop = Crop(_cropName, _quantity, _price, _placeOfOrigin);
        crops[msg.sender].push(newCrop);
        
        // Emit event
        emit CropAdded(_cropName, _quantity, _price, _placeOfOrigin, msg.sender);
    }

    // Function to fetch crops of the specific farmer
    function getCrops() public view returns (Crop[] memory) {
        return crops[msg.sender];
    }

    // Function to fetch farmer details
    function getFarmerDetails() public view returns (FarmerDetails memory) {
        return farmerDetails[msg.sender];
    }
}
