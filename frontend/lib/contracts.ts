// Multi-network contract addresses
export const CONTRACT_ADDRESSES = {
  arbitrum_sepolia: {
    derivativeNFT: process.env.NEXT_PUBLIC_ARBITRUM_DERIVATIVE_NFT_ADDRESS || '',
    marketplace: process.env.NEXT_PUBLIC_ARBITRUM_MARKETPLACE_ADDRESS || '',
  },
  monad_testnet: {
    derivativeNFT: process.env.NEXT_PUBLIC_MONAD_DERIVATIVE_NFT_ADDRESS || '',
    marketplace: process.env.NEXT_PUBLIC_MONAD_MARKETPLACE_ADDRESS || '',
  }
} as const

// Legacy exports for backward compatibility
export const DERIVATIVE_NFT_ADDRESS = process.env.NEXT_PUBLIC_DERIVATIVE_NFT_ADDRESS || ''
export const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || ''
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'arbitrum-sepolia'

// Helper function to get contracts for current chain
export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case 421614: // Arbitrum Sepolia
      return CONTRACT_ADDRESSES.arbitrum_sepolia
    case 10143: // Monad Testnet
      return CONTRACT_ADDRESSES.monad_testnet
    default:
      return CONTRACT_ADDRESSES.arbitrum_sepolia
  }
}

// Contract ABIs
export const DERIVATIVE_NFT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_symbol", "type": "string" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "baseNFTAddress", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "baseTokenId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "DerivativeMinted",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "name_", "type": "string" },
      { "internalType": "string", "name": "description_", "type": "string" },
      { "internalType": "address", "name": "baseNFTAddress", "type": "address" },
      { "internalType": "uint256", "name": "baseTokenId", "type": "uint256" },
      { "internalType": "string", "name": "imageURL", "type": "string" },
      { "internalType": "string", "name": "tokenURI_", "type": "string" }
    ],
    "name": "mintDerivative",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "baseNFTAddress", "type": "address" },
      { "internalType": "uint256", "name": "baseTokenId", "type": "uint256" }
    ],
    "name": "getDerivativesByBase",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getDerivativeMetadata",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "baseNFTAddress", "type": "address" },
          { "internalType": "uint256", "name": "baseTokenId", "type": "uint256" },
          { "internalType": "string", "name": "imageURL", "type": "string" },
          { "internalType": "address", "name": "creator", "type": "address" }
        ],
        "internalType": "struct DerivativeNFT.DerivativeMetadata",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const MARKETPLACE_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "listingId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "nftContract", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "seller", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "baseNFTAddress", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "baseTokenId", "type": "uint256" }
    ],
    "name": "NFTListed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "listingId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "nftContract", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "seller", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "NFTSold",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "nftContract", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "address", "name": "baseNFTAddress", "type": "address" },
      { "internalType": "uint256", "name": "baseTokenId", "type": "uint256" }
    ],
    "name": "listNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "listingId", "type": "uint256" }],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "listingId", "type": "uint256" }],
    "name": "cancelListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveListings",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "listingId", "type": "uint256" },
          { "internalType": "address", "name": "nftContract", "type": "address" },
          { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
          { "internalType": "address", "name": "seller", "type": "address" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "bool", "name": "active", "type": "bool" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "baseNFTAddress", "type": "address" },
          { "internalType": "uint256", "name": "baseTokenId", "type": "uint256" }
        ],
        "internalType": "struct NFTMarketplace.Listing[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "seller", "type": "address" }],
    "name": "getListingsBySeller",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "listingId", "type": "uint256" },
          { "internalType": "address", "name": "nftContract", "type": "address" },
          { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
          { "internalType": "address", "name": "seller", "type": "address" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "bool", "name": "active", "type": "bool" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "address", "name": "baseNFTAddress", "type": "address" },
          { "internalType": "uint256", "name": "baseTokenId", "type": "uint256" }
        ],
        "internalType": "struct NFTMarketplace.Listing[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Standard ERC721 ABI for interacting with base NFTs
export const ERC721_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "operator", "type": "address" },
      { "internalType": "bool", "name": "approved", "type": "bool" }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const
