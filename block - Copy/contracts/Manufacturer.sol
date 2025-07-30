// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface for Farmer contract
interface IFarmer {
    struct Crop {
        string cropName;
        uint256 quantity;
        uint256 price;
        string placeOfOrigin;
    }

    struct Farmer {
        string name;
        string location;
        string phone;
        string email;
    }

    function getCrops() external view returns (Crop[] memory);
    function getFarmerDetails() external view returns (Farmer memory);
}

contract Manufacturer {
    address public owner;
    IFarmer private farmerContract;

    // Event to log crop selection or rejection
    event CropAction(address indexed manufacturer, string cropName, bool isSelected);

    // Mapping to store the status of crops (selected or rejected) based on crop name
    mapping(bytes32 => bool) private cropStatus; // Use a hashed crop name for mapping

    // Constructor to set the farmer contract address
    constructor(address _farmerContractAddress) {
        owner = msg.sender; // Set the contract creator as the owner
        farmerContract = IFarmer(_farmerContractAddress); // Initialize the farmer contract
    }

    // Modifier to restrict access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action.");
        _;
    }

    // Function to view crop details from the Farmer contract
    function viewCropDetails() public view returns (IFarmer.Crop[] memory) {
        return farmerContract.getCrops(); // Retrieve crops from the farmer contract
    }

    // Function to view farmer registration details
    function viewFarmerDetails() public view returns (IFarmer.Farmer memory) {
        return farmerContract.getFarmerDetails(); // Retrieve farmer details from the farmer contract
    }

    // Internal function to hash crop names
    function _getCropHash(string memory _cropName) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_cropName));
    }

    // Function to select a crop
    function selectCrop(string memory _cropName) public onlyOwner {
        bytes32 cropHash = _getCropHash(_cropName);
        cropStatus[cropHash] = true; // Set crop status to selected
        emit CropAction(msg.sender, _cropName, true); // Emit event for crop selection
    }

    // Function to reject a crop
    function rejectCrop(string memory _cropName) public onlyOwner {
        bytes32 cropHash = _getCropHash(_cropName);
        cropStatus[cropHash] = false; // Set crop status to rejected
        emit CropAction(msg.sender, _cropName, false); // Emit event for crop rejection
    }

    // Function to get the selection status of a crop
    function getCropStatus(string memory _cropName) public view returns (bool) {
        bytes32 cropHash = _getCropHash(_cropName);
        return cropStatus[cropHash]; // Return the selection status of the crop
    }
}
