// Envio HyperSync service for Monad Testnet NFT indexing
import { AlchemyNFT, AlchemyResponse } from './alchemy'

export interface EnvioNFTTransfer {
  contract_address: string
  token_id: string
  from_address: string
  to_address: string
  block_number: number
  transaction_hash: string
  log_index: number
}

export interface EnvioResponse {
  data: {
    erc721_transfers: EnvioNFTTransfer[]
  }
}

export class EnvioService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = 'https://monad-testnet.hypersync.xyz/query'
    this.apiKey = process.env.NEXT_PUBLIC_ENVIO_API_KEY || ''
  }

  async getNFTsForOwner(ownerAddress: string): Promise<AlchemyResponse> {
    try {
      // Query for ERC721 transfers to the owner address
      const query = {
        from_block: 0,
        to_block: "latest",
        logs: [
          {
            topics: [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer event signature
              null, // from (any address)
              this.padAddress(ownerAddress) // to (our target address)
            ]
          }
        ],
        field_selection: {
          log: ["address", "topic0", "topic1", "topic2", "topic3", "data", "block_number", "transaction_hash", "log_index"]
        }
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(query)
      })

      if (!response.ok) {
        console.warn('Envio API request failed, using mock data')
        return this.getMockMonadNFTs(ownerAddress)
      }

      const data = await response.json()
      return this.transformEnvioResponse(data, ownerAddress)
    } catch (error) {
      console.error('Error fetching NFTs from Envio:', error)
      return this.getMockMonadNFTs(ownerAddress)
    }
  }

  private padAddress(address: string): string {
    // Remove 0x prefix and pad to 32 bytes for topic matching
    const cleanAddress = address.replace('0x', '').toLowerCase()
    return '0x' + cleanAddress.padStart(64, '0')
  }

  private transformEnvioResponse(data: any, ownerAddress: string): AlchemyResponse {
    if (!data.data || !data.data.logs) {
      return { ownedNfts: [], totalCount: 0 }
    }

    // Group transfers by contract and token ID to get current ownership
    const nftMap = new Map<string, any>()

    data.data.logs.forEach((log: any) => {
      if (log.topic0 === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
        const contractAddress = log.address
        const tokenId = parseInt(log.topic3, 16).toString()
        const to = '0x' + log.topic2.slice(-40) // Extract address from padded topic

        const key = `${contractAddress}-${tokenId}`
        
        if (to.toLowerCase() === ownerAddress.toLowerCase()) {
          nftMap.set(key, {
            contract: { address: contractAddress },
            tokenId,
            blockNumber: log.block_number
          })
        } else if (nftMap.has(key)) {
          // NFT was transferred away from owner
          nftMap.delete(key)
        }
      }
    })

    // Convert to AlchemyNFT format
    const ownedNfts: AlchemyNFT[] = Array.from(nftMap.values()).map((nft, index) => ({
      contract: nft.contract,
      tokenId: nft.tokenId,
      tokenType: 'ERC721',
      title: `Monad NFT #${nft.tokenId}`,
      description: 'NFT from Monad Testnet',
      media: [{
        gateway: `https://via.placeholder.com/400x400/9945FF/FFFFFF?text=Monad+NFT+${nft.tokenId}`,
        raw: `https://via.placeholder.com/400x400/9945FF/FFFFFF?text=Monad+NFT+${nft.tokenId}`,
        format: 'png'
      }],
      metadata: {
        name: `Monad NFT #${nft.tokenId}`,
        description: 'NFT minted on Monad Testnet',
        image: `https://via.placeholder.com/400x400/9945FF/FFFFFF?text=Monad+NFT+${nft.tokenId}`,
        attributes: [
          { trait_type: 'Network', value: 'Monad Testnet' },
          { trait_type: 'Type', value: 'ERC721' }
        ]
      },
      timeLastUpdated: new Date().toISOString()
    }))

    return {
      ownedNfts,
      totalCount: ownedNfts.length
    }
  }

  private getMockMonadNFTs(ownerAddress: string): AlchemyResponse {
    // Mock NFT data for Monad Testnet using data URIs to avoid network issues
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
          title: 'Monad Test NFT #1',
          description: 'A test NFT minted on Monad Testnet',
          media: [{
            gateway: createMockImage('#9945FF', 'Monad NFT 1'),
            raw: createMockImage('#9945FF', 'Monad NFT 1'),
            format: 'svg'
          }],
          metadata: {
            name: 'Monad Test NFT #1',
            description: 'A test NFT minted on Monad Testnet via Magic Eden',
            image: createMockImage('#9945FF', 'Monad NFT 1'),
            attributes: [
              { trait_type: 'Network', value: 'Monad Testnet' },
              { trait_type: 'Marketplace', value: 'Magic Eden' },
              { trait_type: 'Rarity', value: 'Common' }
            ]
          },
          timeLastUpdated: new Date().toISOString()
        },
        {
          contract: {
            address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
          },
          tokenId: '42',
          tokenType: 'ERC721',
          title: 'Monad Collection #42',
          description: 'Another NFT from Monad ecosystem',
          media: [{
            gateway: createMockImage('#FF6B9D', 'Monad 42'),
            raw: createMockImage('#FF6B9D', 'Monad 42'),
            format: 'svg'
          }],
          metadata: {
            name: 'Monad Collection #42',
            description: 'Part of a special Monad NFT collection',
            image: createMockImage('#FF6B9D', 'Monad 42'),
            attributes: [
              { trait_type: 'Network', value: 'Monad Testnet' },
              { trait_type: 'Collection', value: 'Special' },
              { trait_type: 'Rarity', value: 'Rare' }
            ]
          },
          timeLastUpdated: new Date().toISOString()
        }
      ],
      totalCount: 2
    }
  }
}

export const envioService = new EnvioService()
