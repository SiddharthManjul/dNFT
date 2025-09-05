// Unified NFT service that routes to appropriate indexer based on network
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

    // Route to appropriate service based on chain ID
    switch (chainId) {
      case 10143: // Monad Testnet
        console.log('Indexer removed - no NFTs available for Monad Testnet')
        return { ownedNfts: [], totalCount: 0 }
      
      case 421614: // Arbitrum Sepolia
        console.log('Indexer removed - no NFTs available for Arbitrum Sepolia')
        return { ownedNfts: [], totalCount: 0 }
      
      case 1: // Ethereum Mainnet
      case 137: // Polygon
      case 42161: // Arbitrum One
      case 10: // Optimism
        console.log('Fetching NFTs via Alchemy...')
        return await alchemyService.getNFTsForOwner(ownerAddress)
      
      default:
        // If no specific chain ID, try to fetch from multiple networks
        console.log('Fetching NFTs from Alchemy networks only...')
        return await this.getMultiChainNFTs(ownerAddress)
    }
  }

  private async getMultiChainNFTs(ownerAddress: string): Promise<AlchemyResponse> {
    try {
      // Only fetch from Alchemy networks (indexer removed)
      console.log('Fetching NFTs from Alchemy networks...')
      return await alchemyService.getNFTsForOwner(ownerAddress)
    } catch (error) {
      console.error('Error fetching multi-chain NFTs:', error)
      
      // Return empty response
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
      { chainId: 421614, name: 'Arbitrum Sepolia', service: 'None (Indexer Removed)' },
      { chainId: 10, name: 'Optimism', service: 'Alchemy' },
      { chainId: 10143, name: 'Monad Testnet', service: 'None (Indexer Removed)' },
    ]
  }

  // Indexer management methods (removed)
  async getIndexerStatus() {
    return { running: false, message: 'Indexer removed' }
  }

  async startIndexer() {
    return { success: false, message: 'Indexer removed' }
  }

  async stopIndexer() {
    return { success: false, message: 'Indexer removed' }
  }

  async forceIndexing() {
    return { success: false, message: 'Indexer removed' }
  }
}

export const nftService = new NFTService()