// NFT service using Alchemy for Arbitrum Sepolia testnet
import { alchemyService, AlchemyResponse } from './alchemy'

export interface NFTServiceOptions {
  chainId?: number
  includeTestnets?: boolean
}

export class NFTService {
  async getNFTsForOwner(
    ownerAddress: string,
    options: NFTServiceOptions = {}
  ): Promise<AlchemyResponse> {
    const { chainId } = options

    // Use Alchemy for Arbitrum Sepolia and other supported networks
    switch (chainId) {
      case 421614: // Arbitrum Sepolia
        console.log('Fetching NFTs from Arbitrum Sepolia via Alchemy...')
        return await alchemyService.getNFTsForOwner(ownerAddress, undefined, 'arbitrumSepolia')
      
      case 1: // Ethereum Mainnet
        console.log('Fetching NFTs from Ethereum via Alchemy...')
        return await alchemyService.getNFTsForOwner(ownerAddress, undefined, 'ethereum')
      
      case 137: // Polygon
        console.log('Fetching NFTs from Polygon via Alchemy...')
        return await alchemyService.getNFTsForOwner(ownerAddress, undefined, 'polygon')
      
      case 42161: // Arbitrum One
        console.log('Fetching NFTs from Arbitrum One via Alchemy...')
        return await alchemyService.getNFTsForOwner(ownerAddress, undefined, 'arbitrum')
      
      case 10: // Optimism
        console.log('Fetching NFTs from Optimism via Alchemy...')
        return await alchemyService.getNFTsForOwner(ownerAddress, undefined, 'optimism')
      
      default:
        // Default to Arbitrum Sepolia for testnet
        console.log('Defaulting to Arbitrum Sepolia for NFT fetching...')
        return await alchemyService.getNFTsForOwner(ownerAddress, undefined, 'arbitrumSepolia')
    }
  }

  // Get NFTs for specific network
  async getNFTsForNetwork(
    ownerAddress: string,
    chainId: number
  ): Promise<AlchemyResponse> {
    return this.getNFTsForOwner(ownerAddress, { chainId })
  }

  // Get supported networks
  getSupportedNetworks() {
    return [
      { chainId: 421614, name: 'Arbitrum Sepolia', service: 'Alchemy' },
      { chainId: 1, name: 'Ethereum', service: 'Alchemy' },
      { chainId: 137, name: 'Polygon', service: 'Alchemy' },
      { chainId: 42161, name: 'Arbitrum One', service: 'Alchemy' },
      { chainId: 10, name: 'Optimism', service: 'Alchemy' },
    ]
  }
}

export const nftService = new NFTService()