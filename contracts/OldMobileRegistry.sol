// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OldMobileRegistry
 * @dev Tracks mobile phone registration, unboxing/first activation, ownership history, and technical specifications.
 */
contract OldMobileRegistry {

    struct MobileSpecs {
        string brand;
        string model;
        string chipset;
        uint256 ramSizeGB;
        uint256 storageGB;
        uint256 manufacturingYear;
    }

    struct Mobile {
        uint256 imei;              
        MobileSpecs specs;         
        address currentOwner;      
        address[] ownershipHistory;
        uint256 registrationDate;  
        uint256 firstUsedDate;     // Exact timestamp when the device was first unboxed/activated
        bool isActivated;          // True if the device has been unboxed & activated, false if sealed
        bool isRegistered;         
    }

    mapping(uint256 => Mobile) public mobiles;
    mapping(address => uint256[]) private ownerMobiles;

    event MobileRegistered(uint256 indexed imei, address indexed owner, string brand, string model, bool isActivated);
    event MobileActivated(uint256 indexed imei, address indexed owner, uint256 activationDate);
    event OwnershipTransferred(uint256 indexed imei, address indexed previousOwner, address indexed newOwner);

    modifier onlyCurrentOwner(uint256 _imei) {
        require(mobiles[_imei].isRegistered, "Mobile is not registered");
        require(mobiles[_imei].currentOwner == msg.sender, "Caller is not the current owner");
        _;
    }

    function registerMobile(
        uint256 _imei,
        string memory _brand,
        string memory _model,
        string memory _chipset,
        uint256 _ramSizeGB,
        uint256 _storageGB,
        uint256 _manufacturingYear,
        bool _activateNow
    ) public {
        require(!mobiles[_imei].isRegistered, "Mobile with this IMEI is already registered");
        require(_imei > 0, "Invalid IMEI");

        MobileSpecs memory newSpecs = MobileSpecs({
            brand: _brand,
            model: _model,
            chipset: _chipset,
            ramSizeGB: _ramSizeGB,
            storageGB: _storageGB,
            manufacturingYear: _manufacturingYear
        });

        address[] memory history = new address[](1);
        history[0] = msg.sender;

        uint256 activationTimestamp = _activateNow ? block.timestamp : 0;

        mobiles[_imei] = Mobile({
            imei: _imei,
            specs: newSpecs,
            currentOwner: msg.sender,
            ownershipHistory: history,
            registrationDate: block.timestamp,
            firstUsedDate: activationTimestamp,
            isActivated: _activateNow,
            isRegistered: true
        });

        ownerMobiles[msg.sender].push(_imei);

        emit MobileRegistered(_imei, msg.sender, _brand, _model, _activateNow);
        if (_activateNow) {
            emit MobileActivated(_imei, msg.sender, activationTimestamp);
        }
    }

    /**
     * @dev Called when the box is first opened / device is first powered on.
     * Stamped permanently with block.timestamp on-chain.
     */
    function activateMobile(uint256 _imei) public onlyCurrentOwner(_imei) {
        require(!mobiles[_imei].isActivated, "Mobile is already activated");

        mobiles[_imei].isActivated = true;
        mobiles[_imei].firstUsedDate = block.timestamp;

        emit MobileActivated(_imei, msg.sender, block.timestamp);
    }

    function transferOwnership(uint256 _imei, address _newOwner) public onlyCurrentOwner(_imei) {
        require(_newOwner != address(0), "Invalid new owner address");
        require(_newOwner != msg.sender, "Cannot transfer to yourself");

        address previousOwner = msg.sender;

        mobiles[_imei].currentOwner = _newOwner;
        mobiles[_imei].ownershipHistory.push(_newOwner);

        _removeMobileFromOwner(previousOwner, _imei);
        ownerMobiles[_newOwner].push(_imei);

        emit OwnershipTransferred(_imei, previousOwner, _newOwner);
    }

    function getOwnershipHistory(uint256 _imei) public view returns (address[] memory) {
        require(mobiles[_imei].isRegistered, "Mobile is not registered");
        return mobiles[_imei].ownershipHistory;
    }

    function getMobileSpecs(uint256 _imei) public view returns (MobileSpecs memory) {
        require(mobiles[_imei].isRegistered, "Mobile is not registered");
        return mobiles[_imei].specs;
    }

    function getActivationStatus(uint256 _imei) public view returns (bool isActivated, uint256 firstUsedDate) {
        require(mobiles[_imei].isRegistered, "Mobile is not registered");
        return (mobiles[_imei].isActivated, mobiles[_imei].firstUsedDate);
    }

    function getMobilesByOwner(address _owner) public view returns (uint256[] memory) {
        return ownerMobiles[_owner];
    }

    function _removeMobileFromOwner(address _owner, uint256 _imei) internal {
        uint256[] storage list = ownerMobiles[_owner];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == _imei) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
    }
}