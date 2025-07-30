// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FarmerRegistry {
    struct Farmer {
        uint256 id;
        string name;
        uint256 age;
        string gender;
        string[] crops; // List of crops associated with the farmer
        bytes32 passwordHash; // Store the hashed password
    }

    mapping(uint256 => Farmer) public farmers; // Mapping from farmer ID to Farmer struct

    uint256 public farmerCount; // To keep track of the number of farmers

    event FarmerRegistered(uint256 farmerId, string name, uint256 age, string gender);
    event CropAdded(uint256 farmerId, string cropName);

    // Register a new farmer
    function registerFarmer(string memory _name, uint256 _age, string memory _gender, string memory _password) public {
        require(bytes(_password).length > 0, "Password cannot be empty");

        farmerCount++; // Increment farmer count
        bytes32 passwordHash = keccak256(abi.encodePacked(_password)); // Hash the password
        
        // Initialize the Farmer struct and store it in the mapping
        farmers[farmerCount] = Farmer({
            id: farmerCount,
            name: _name,
            age: _age,
            gender: _gender,
            crops: new string //Initialize crops array as an empty array
            passwordHash: //passwordHash
        });

        emit FarmerRegistered(farmerCount, _name, _age, _gender);
    }

    // Add a crop for a farmer
    function addCrop(uint256 _farmerId, string memory _cropName) public {
        require(_farmerId > 0 && _farmerId <= farmerCount, "Invalid farmer ID");
        farmers[_farmerId].crops.push(_cropName); // Add the crop to the farmer's crop list
        emit CropAdded(_farmerId, _cropName);
    }

    // Get a farmer's details by ID
    function getFarmer(uint256 _farmerId) public view returns (Farmer memory) {
        require(_farmerId > 0 && _farmerId <= farmerCount, "Invalid farmer ID");
        return farmers[_farmerId]; // Return the farmer's details
    }

    // Get all crops for a specific farmer by farmer ID
    function getCropsByFarmerId(uint256 _farmerId) public view returns (string[] memory) {
        require(_farmerId > 0 && _farmerId <= farmerCount, "Invalid farmer ID");
        return farmers[_farmerId].crops; // Return the list of crops for the farmer
    }

    // Login function to verify farmer's credentials
    function login(uint256 _farmerId, string memory _password) public view returns (bool) {
        require(_farmerId > 0 && _farmerId <= farmerCount, "Invalid farmer ID");
        
        // Hash the provided password and compare it to the stored hash
        bytes32 passwordHash = keccak256(abi.encodePacked(_password));
        return (passwordHash == farmers[_farmerId].passwordHash); // Return true if passwords match
    }
}
