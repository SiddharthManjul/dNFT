export interface AlchemyNFT {
  contract: {
    address: string
  }
  tokenId: string
  tokenType: string
  title: string
  description?: string
  media?: Array<{
    gateway?: string
    thumbnail?: string
    raw?: string
    format?: string
  }>
  metadata?: {
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

// Network configurations for Alchemy
const ALCHEMY_NETWORKS = {
  ethereum: 'https://eth-mainnet.g.alchemy.com/nft/v3',
  polygon: 'https://polygon-mainnet.g.alchemy.com/nft/v3',
  arbitrum: 'https://arb-mainnet.g.alchemy.com/nft/v3',
  arbitrumSepolia: 'https://arb-sepolia.g.alchemy.com/nft/v3',
  optimism: 'https://opt-mainnet.g.alchemy.com/nft/v3',
} as const

export type SupportedNetwork = keyof typeof ALCHEMY_NETWORKS

export class AlchemyService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Alchemy API key not found. NFT fetching will be limited.')
      console.warn('Please set NEXT_PUBLIC_ALCHEMY_API_KEY in your .env.local file')
    } else {
      console.log('✅ Alchemy API key configured successfully')
    }
  }

  // Convert IPFS URLs to HTTP gateway URLs
  private convertIpfsUrl(url: string): string {
    if (!url) return url
    
    // Handle different IPFS URL formats
    if (url.startsWith('ipfs://')) {
      // ipfs://QmHash -> https://gateway.pinata.cloud/ipfs/QmHash
      const hash = url.replace('ipfs://', '')
      // Use multiple gateway options for better reliability
      return `https://gateway.pinata.cloud/ipfs/${hash}`
    }
    
    if (url.includes('/ipfs/')) {
      // If it's already a gateway URL but might be slow/unreliable, use Pinata
      const hashMatch = url.match(/\/ipfs\/([^/?]+)/)
      if (hashMatch && hashMatch[1]) {
        return `https://gateway.pinata.cloud/ipfs/${hashMatch[1]}`
      }
    }
    
    // Handle CrossMint and other IPFS formats
    if (url.includes('ipfs.io') || url.includes('cloudflare-ipfs.com')) {
      const hashMatch = url.match(/\/ipfs\/([^/?]+)/)
      if (hashMatch && hashMatch[1]) {
        return `https://gateway.pinata.cloud/ipfs/${hashMatch[1]}`
      }
    }
    
    return url
  }

  async getNFTsForOwner(
    ownerAddress: string,
    pageKey?: string,
    network: SupportedNetwork = 'arbitrumSepolia'
  ): Promise<AlchemyResponse> {
    if (!this.apiKey) {
      // Return mock data for development
      return this.getMockNFTs()
    }

    try {
      const baseUrl = ALCHEMY_NETWORKS[network]
      const url = new URL(`${baseUrl}/${this.apiKey}/getNFTsForOwner`)
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
      console.log('🔍 Alchemy API Response:', data)
      
      // Ensure the response has the expected structure and convert IPFS URLs
      if (data.ownedNfts) {
        data.ownedNfts = data.ownedNfts.map((nft: any) => ({
          ...nft,
          media: (nft.media || []).map((mediaItem: any) => ({
            ...mediaItem,
            gateway: this.convertIpfsUrl(mediaItem.gateway || mediaItem.raw || ''),
            raw: this.convertIpfsUrl(mediaItem.raw || ''),
          })),
          metadata: {
            ...nft.metadata,
            image: this.convertIpfsUrl(nft.metadata?.image || ''),
          },
        }))
      }
      
      return data
    } catch (error) {
      console.error('Error fetching NFTs from Alchemy:', error)
      // Fallback to mock data
      return this.getMockNFTs()
    }
  }

  async getNFTMetadata(
    contractAddress: string, 
    tokenId: string, 
    network: SupportedNetwork = 'arbitrumSepolia'
  ): Promise<AlchemyNFT | null> {
    if (!this.apiKey) {
      return null
    }

    try {
      const baseUrl = ALCHEMY_NETWORKS[network]
      const url = `${baseUrl}/${this.apiKey}/getNFTMetadata`
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
    // Mock NFT data for development/testing using data URIs to avoid network issues
    const createMockImage = (color: string, text: string) => {
      // Create a simple SVG data URI
      const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${color}"/>
        <text x="200" y="200" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>`;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

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
            gateway: createMockImage('#00ff41', 'Mock NFT 1'),
            raw: createMockImage('#00ff41', 'Mock NFT 1'),
            format: 'svg'
          }],
          metadata: {
            name: 'Mock NFT #1',
            description: 'A mock NFT for testing purposes',
            image: createMockImage('#00ff41', 'Mock NFT 1'),
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
            gateway: createMockImage('#ff007f', 'Mock NFT 2'),
            raw: createMockImage('#ff007f', 'Mock NFT 2'),
            format: 'svg'
          }],
          metadata: {
            name: 'Mock NFT #2',
            description: 'Another mock NFT for testing',
            image: createMockImage('#ff007f', 'Mock NFT 2'),
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
            gateway: createMockImage('#00ffff', 'Mock NFT 3'),
            raw: createMockImage('#00ffff', 'Mock NFT 3'),
            format: 'svg'
          }],
          metadata: {
            name: 'Mock NFT #3',
            description: 'A third mock NFT',
            image: createMockImage('#00ffff', 'Mock NFT 3'),
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
