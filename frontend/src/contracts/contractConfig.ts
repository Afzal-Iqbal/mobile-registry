// Auto-generated ABI from compiled artifacts
export const OLD_MOBILE_REGISTRY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "imei",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "activationDate",
        "type": "uint256"
      }
    ],
    "name": "MobileActivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "imei",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "brand",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "model",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isActivated",
        "type": "bool"
      }
    ],
    "name": "MobileRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "imei",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_imei",
        "type": "uint256"
      }
    ],
    "name": "activateMobile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_imei",
        "type": "uint256"
      }
    ],
    "name": "getActivationStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isActivated",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "firstUsedDate",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_imei",
        "type": "uint256"
      }
    ],
    "name": "getMobileSpecs",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "brand",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "model",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "chipset",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "ramSizeGB",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "storageGB",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "manufacturingYear",
            "type": "uint256"
          }
        ],
        "internalType": "struct OldMobileRegistry.MobileSpecs",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "getMobilesByOwner",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_imei",
        "type": "uint256"
      }
    ],
    "name": "getOwnershipHistory",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "mobiles",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "imei",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "brand",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "model",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "chipset",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "ramSizeGB",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "storageGB",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "manufacturingYear",
            "type": "uint256"
          }
        ],
        "internalType": "struct OldMobileRegistry.MobileSpecs",
        "name": "specs",
        "type": "tuple"
      },
      {
        "internalType": "address",
        "name": "currentOwner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "registrationDate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "firstUsedDate",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActivated",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isRegistered",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_imei",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_brand",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_model",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_chipset",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_ramSizeGB",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_storageGB",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_manufacturingYear",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_activateNow",
        "type": "bool"
      }
    ],
    "name": "registerMobile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_imei",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const DEFAULT_CONTRACT_ADDRESS = "0x1010d972950ff38849277b9c072151dfef37aabe" as `0x${string}`;
