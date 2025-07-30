// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface I1Farmer {
    struct FarmerDetail {
        string name;
        string location;
        string phone;
        string email;
    }

    struct Crop {
        string cropName;
        uint quantity;
        uint price;
        string placeOfOrigin;
    }

    function getFarmerDetails(address farmerAddress) external view returns (
        string memory name,
        string memory location,
        string memory phone,
        string memory email
    );

    function getCropsForFarmer(address farmerAddress) external view returns (Crop[] memory);
}

contract Inspector {
    I1Farmer farmerContract;

    constructor(address _farmerContractAddress) {
        farmerContract = I1Farmer(_farmerContractAddress);
    }

    // Fetch details of a specific farmer by iterating or directly referencing a known farmer address
    function fetchFarmerDetails(address farmerAddress) public view returns (
        string memory name, 
        string memory location, 
        string memory phone, 
        string memory email
    ) {
        return farmerContract.getFarmerDetails(farmerAddress);
    }

    // Fetch crops for a specific farmer
    function fetchCropsForFarmer(address farmerAddress) public view returns (I1Farmer.Crop[] memory) {
        return farmerContract.getCropsForFarmer(farmerAddress);
    }
}
