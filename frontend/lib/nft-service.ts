// Unified NFT service that routes to appropriate indexer based on network
import { alchemyService, AlchemyResponse } from './alchemy'
import { envioService } from './envio'

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

    // Route to appropriate service based on chain ID
    switch (chainId) {
      case 10143: // Monad Testnet
        console.log('Fetching NFTs from Monad Testnet via Envio HyperSync...')
        return await envioService.getNFTsForOwner(ownerAddress)
      
      case 421614: // Arbitrum Sepolia
        console.log('Fetching NFTs from Arbitrum Sepolia via Alchemy...')
        return await alchemyService.getNFTsForOwner(ownerAddress)
      
      case 1: // Ethereum Mainnet
      case 137: // Polygon
      case 42161: // Arbitrum One
      case 10: // Optimism
        console.log('Fetching NFTs via Alchemy...')
        return await alchemyService.getNFTsForOwner(ownerAddress)
      
      default:
        // If no specific chain ID, try to fetch from multiple networks
        console.log('Fetching NFTs from multiple networks...')
        return await this.getMultiChainNFTs(ownerAddress)
    }
  }

  private async getMultiChainNFTs(ownerAddress: string): Promise<AlchemyResponse> {
    try {
      // Fetch from both Monad and Arbitrum Sepolia
      const [monadNFTs, arbitrumNFTs] = await Promise.allSettled([
        envioService.getNFTsForOwner(ownerAddress),
        alchemyService.getNFTsForOwner(ownerAddress)
      ])

      const allNFTs: any[] = []
      let totalCount = 0

      // Combine results from successful fetches
      if (monadNFTs.status === 'fulfilled') {
        allNFTs.push(...monadNFTs.value.ownedNfts)
        totalCount += monadNFTs.value.totalCount
      }

      if (arbitrumNFTs.status === 'fulfilled') {
        allNFTs.push(...arbitrumNFTs.value.ownedNfts)
        totalCount += arbitrumNFTs.value.totalCount
      }

      return {
        ownedNfts: allNFTs,
        totalCount
      }
    } catch (error) {
      console.error('Error fetching multi-chain NFTs:', error)
      
      // Fallback to mock data
      return {
        ownedNfts: [],
        totalCount: 0
      }
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
      { chainId: 1, name: 'Ethereum', service: 'Alchemy' },
      { chainId: 137, name: 'Polygon', service: 'Alchemy' },
      { chainId: 42161, name: 'Arbitrum One', service: 'Alchemy' },
      { chainId: 421614, name: 'Arbitrum Sepolia', service: 'Alchemy' },
      { chainId: 10, name: 'Optimism', service: 'Alchemy' },
      { chainId: 10143, name: 'Monad Testnet', service: 'Envio HyperSync' },
    ]
  }
}

export const nftService = new NFTService()
