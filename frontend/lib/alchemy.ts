export interface AlchemyNFT {
  contract: {
    address: string
  }
  tokenId: string
  tokenType: string
  title: string
  description?: string
  media: Array<{
    gateway: string
    thumbnail?: string
    raw: string
    format: string
  }>
  metadata: {
    name?: string
    description?: string
    image?: string
    attributes?: Array<{
      trait_type: string
      value: string
    }>
  }
  timeLastUpdated: string
}

export interface AlchemyResponse {
  ownedNfts: AlchemyNFT[]
  totalCount: number
  pageKey?: string
}

const ALCHEMY_BASE_URL = 'https://arb-sepolia.g.alchemy.com/nft/v3'

export class AlchemyService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Alchemy API key not found. NFT fetching will be limited.')
    }
  }

  async getNFTsForOwner(
    ownerAddress: string,
    pageKey?: string
  ): Promise<AlchemyResponse> {
    if (!this.apiKey) {
      // Return mock data for development
      return this.getMockNFTs()
    }

    try {
      const url = new URL(`${ALCHEMY_BASE_URL}/${this.apiKey}/getNFTsForOwner`)
      url.searchParams.set('owner', ownerAddress)
      url.searchParams.set('withMetadata', 'true')
      url.searchParams.set('pageSize', '20')
      
      if (pageKey) {
        url.searchParams.set('pageKey', pageKey)
      }

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching NFTs from Alchemy:', error)
      // Fallback to mock data
      return this.getMockNFTs()
    }
  }

  async getNFTMetadata(contractAddress: string, tokenId: string): Promise<AlchemyNFT | null> {
    if (!this.apiKey) {
      return null
    }

    try {
      const url = `${ALCHEMY_BASE_URL}/${this.apiKey}/getNFTMetadata`
      const params = new URLSearchParams({
        contractAddress,
        tokenId,
        refreshCache: 'false',
      })

      const response = await fetch(`${url}?${params}`)
      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching NFT metadata:', error)
      return null
    }
  }

  private getMockNFTs(): AlchemyResponse {
    // Mock NFT data for development/testing
    return {
      ownedNfts: [
        {
          contract: {
            address: '0x1234567890123456789012345678901234567890'
          },
          tokenId: '1',
          tokenType: 'ERC721',
          title: 'Mock NFT #1',
          description: 'A mock NFT for testing purposes',
          media: [{
            gateway: 'https://via.placeholder.com/400x400/00ff41/000000?text=Mock+NFT+1',
            raw: 'https://via.placeholder.com/400x400/00ff41/000000?text=Mock+NFT+1',
            format: 'png'
          }],
          metadata: {
            name: 'Mock NFT #1',
            description: 'A mock NFT for testing purposes',
            image: 'https://via.placeholder.com/400x400/00ff41/000000?text=Mock+NFT+1',
            attributes: [
              { trait_type: 'Type', value: 'Mock' },
              { trait_type: 'Rarity', value: 'Common' }
            ]
          },
          timeLastUpdated: new Date().toISOString()
        },
        {
          contract: {
            address: '0x1234567890123456789012345678901234567890'
          },
          tokenId: '2',
          tokenType: 'ERC721',
          title: 'Mock NFT #2',
          description: 'Another mock NFT for testing',
          media: [{
            gateway: 'https://via.placeholder.com/400x400/ff007f/000000?text=Mock+NFT+2',
            raw: 'https://via.placeholder.com/400x400/ff007f/000000?text=Mock+NFT+2',
            format: 'png'
          }],
          metadata: {
            name: 'Mock NFT #2',
            description: 'Another mock NFT for testing',
            image: 'https://via.placeholder.com/400x400/ff007f/000000?text=Mock+NFT+2',
            attributes: [
              { trait_type: 'Type', value: 'Mock' },
              { trait_type: 'Rarity', value: 'Rare' }
            ]
          },
          timeLastUpdated: new Date().toISOString()
        },
        {
          contract: {
            address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
          },
          tokenId: '3',
          tokenType: 'ERC721',
          title: 'Mock NFT #3',
          description: 'A third mock NFT',
          media: [{
            gateway: 'https://via.placeholder.com/400x400/00ffff/000000?text=Mock+NFT+3',
            raw: 'https://via.placeholder.com/400x400/00ffff/000000?text=Mock+NFT+3',
            format: 'png'
          }],
          metadata: {
            name: 'Mock NFT #3',
            description: 'A third mock NFT',
            image: 'https://via.placeholder.com/400x400/00ffff/000000?text=Mock+NFT+3',
            attributes: [
              { trait_type: 'Type', value: 'Mock' },
              { trait_type: 'Rarity', value: 'Epic' }
            ]
          },
          timeLastUpdated: new Date().toISOString()
        }
      ],
      totalCount: 3
    }
  }
}

export const alchemyService = new AlchemyService()
