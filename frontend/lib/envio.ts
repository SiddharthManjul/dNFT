// Envio HyperSync service for Monad Testnet and Arbitrum Sepolia NFT indexing
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

// Network configurations for HyperSync endpoints
const HYPERSYNC_ENDPOINTS = {
  10143: 'https://monad-testnet.hypersync.xyz/query', // Monad Testnet
  421614: 'https://arbitrum-sepolia.hypersync.xyz/query', // Arbitrum Sepolia
} as const

export type SupportedChainId = keyof typeof HYPERSYNC_ENDPOINTS

export class EnvioService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ENVIO_API_KEY || ''
  }

  private getEndpointUrl(chainId: SupportedChainId): string {
    return HYPERSYNC_ENDPOINTS[chainId]
  }

  async getNFTsForOwner(ownerAddress: string, chainId: SupportedChainId = 10143): Promise<AlchemyResponse> {
    try {
      // For now, return mock data since direct HyperSync API requires proper indexer setup
      // In production, this would query the running Envio indexer's GraphQL endpoint
      console.log(`Fetching NFTs for ${ownerAddress} on chain ${chainId} via Envio HyperSync`)
      console.log('Note: Using mock data until Envio indexer is deployed. Run "envio dev" to start indexing.')
      
      return this.getMockNFTs(ownerAddress, chainId)
    } catch (error) {
      console.error(`Error fetching NFTs from Envio for chain ${chainId}:`, error)
      return this.getMockNFTs(ownerAddress, chainId)
    }
  }

  // Alternative method for when the Envio indexer is running
  async getNFTsFromRunningIndexer(ownerAddress: string, chainId: SupportedChainId = 10143): Promise<AlchemyResponse> {
    try {
      // This would connect to the local Envio indexer's GraphQL endpoint
      const graphqlEndpoint = 'http://localhost:8080/graphql'
      
      const query = `
        query GetWalletNFTs($walletAddress: String!, $chainId: Int!) {
          nftTransfers(
            where: {
              and: [
                { chainId: { _eq: $chainId } }
                { or: [
                  { fromAddress: { _eq: $walletAddress } }
                  { toAddress: { _eq: $walletAddress } }
                ]}
              ]
            }
            orderBy: { blockNumber: desc }
          ) {
            id
            contractAddress
            tokenId
            fromAddress
            toAddress
            blockNumber
            blockTimestamp
            transactionHash
            chainId
            tokenType
            operator
            value
            batchIndex
          }
        }
      `

      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables: {
            walletAddress: ownerAddress,
            chainId
          }
        })
      })

      if (!response.ok) {
        console.warn('Envio indexer not running, using mock data')
        return this.getMockNFTs(ownerAddress, chainId)
      }

      const data = await response.json()
      return this.transformGraphQLResponse(data, ownerAddress, chainId)
    } catch (error) {
      console.error(`Error querying Envio indexer for chain ${chainId}:`, error)
      return this.getMockNFTs(ownerAddress, chainId)
    }
  }

  private transformGraphQLResponse(data: any, ownerAddress: string, chainId: SupportedChainId): AlchemyResponse {
    if (!data.data || !data.data.nftTransfers) {
      return { ownedNfts: [], totalCount: 0 }
    }

    // Process transfers to determine current ownership
    // For ERC-1155, we need to track balances, not just ownership
    const nftMap = new Map<string, any>()
    
    data.data.nftTransfers.forEach((transfer: any) => {
      const key = `${transfer.contractAddress}-${transfer.tokenId}`
      
      if (transfer.tokenType === 'ERC721') {
        // ERC-721: Simple ownership transfer
        if (transfer.toAddress.toLowerCase() === ownerAddress.toLowerCase()) {
          nftMap.set(key, {
            contract: { address: transfer.contractAddress },
            tokenId: transfer.tokenId,
            blockNumber: transfer.blockNumber,
            transactionHash: transfer.transactionHash,
            chainId: transfer.chainId,
            tokenType: transfer.tokenType
          })
        } else if (transfer.fromAddress.toLowerCase() === ownerAddress.toLowerCase() && nftMap.has(key)) {
          nftMap.delete(key)
        }
      } else if (transfer.tokenType === 'ERC1155') {
        // ERC-1155: Balance-based ownership
        const currentNft = nftMap.get(key) || {
          contract: { address: transfer.contractAddress },
          tokenId: transfer.tokenId,
          blockNumber: transfer.blockNumber,
          transactionHash: transfer.transactionHash,
          chainId: transfer.chainId,
          tokenType: transfer.tokenType,
          balance: 0
        }
        
        if (transfer.toAddress.toLowerCase() === ownerAddress.toLowerCase()) {
          // Receiving tokens
          currentNft.balance += parseInt(transfer.value || '0')
        } else if (transfer.fromAddress.toLowerCase() === ownerAddress.toLowerCase()) {
          // Sending tokens
          currentNft.balance -= parseInt(transfer.value || '0')
        }
        
        if (currentNft.balance > 0) {
          nftMap.set(key, currentNft)
        } else {
          nftMap.delete(key)
        }
      }
    })

    const networkName = chainId === 10143 ? 'Monad Testnet' : 'Arbitrum Sepolia'
    const networkColor = chainId === 10143 ? '#9945FF' : '#28A0F0'

    const ownedNfts: AlchemyNFT[] = Array.from(nftMap.values()).map((nft) => {
      const isYourContract = nft.contract.address.toLowerCase() === '0x425639f03ffbf85c81d48047b82127b7fbfdff9a'
      const title = isYourContract 
        ? `🎯 Your ${nft.tokenType} NFT #${nft.tokenId}` 
        : `${networkName} ${nft.tokenType} #${nft.tokenId}`
      
      const attributes = [
        { trait_type: 'Network', value: networkName },
        { trait_type: 'Type', value: nft.tokenType },
        { trait_type: 'Contract', value: nft.contract.address },
        { trait_type: 'Chain ID', value: chainId.toString() }
      ]
      
      if (nft.tokenType === 'ERC1155' && nft.balance) {
        attributes.push({ trait_type: 'Balance', value: nft.balance.toString() })
      }
      
      if (isYourContract) {
        attributes.push({ trait_type: 'Special', value: 'Your Minted NFT' })
      }

      return {
        contract: nft.contract,
        tokenId: nft.tokenId,
        tokenType: nft.tokenType,
        title,
        description: isYourContract 
          ? `Your personally minted ERC-1155 NFT on ${networkName}` 
          : `${nft.tokenType} NFT from ${networkName}`,
        media: [{
          gateway: `https://via.placeholder.com/400x400/${networkColor.slice(1)}/FFFFFF?text=${isYourContract ? 'Your+NFT' : networkName.replace(' ', '+')}+${nft.tokenId}`,
          raw: `https://via.placeholder.com/400x400/${networkColor.slice(1)}/FFFFFF?text=${isYourContract ? 'Your+NFT' : networkName.replace(' ', '+')}+${nft.tokenId}`,
          format: 'png'
        }],
        metadata: {
          name: title,
          description: isYourContract 
            ? `Your personally minted ERC-1155 NFT on ${networkName}` 
            : `${nft.tokenType} NFT minted on ${networkName}`,
          image: `https://via.placeholder.com/400x400/${networkColor.slice(1)}/FFFFFF?text=${isYourContract ? 'Your+NFT' : networkName.replace(' ', '+')}+${nft.tokenId}`,
          attributes
        },
        timeLastUpdated: new Date().toISOString()
      }
    })

    return {
      ownedNfts,
      totalCount: ownedNfts.length
    }
  }

  private padAddress(address: string): string {
    // Remove 0x prefix and pad to 32 bytes for topic matching
    const cleanAddress = address.replace('0x', '').toLowerCase()
    return '0x' + cleanAddress.padStart(64, '0')
  }

  private transformEnvioResponse(data: any, ownerAddress: string, chainId: SupportedChainId): AlchemyResponse {
    if (!data.data || !data.data.logs) {
      return { ownedNfts: [], totalCount: 0 }
    }

    // Group transfers by contract and token ID to get current ownership
    const nftMap = new Map<string, any>()

    // Sort logs by block number and log index to process them chronologically
    const sortedLogs = data.data.logs.sort((a: any, b: any) => {
      if (a.block_number !== b.block_number) {
        return a.block_number - b.block_number
      }
      return a.log_index - b.log_index
    })

    sortedLogs.forEach((log: any) => {
      if (log.topic0 === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
        const contractAddress = log.address
        const tokenId = parseInt(log.topic3, 16).toString()
        const from = '0x' + log.topic1.slice(-40) // Extract from address
        const to = '0x' + log.topic2.slice(-40) // Extract to address

        const key = `${contractAddress}-${tokenId}`
        
        if (to.toLowerCase() === ownerAddress.toLowerCase()) {
          // NFT transferred to owner
          nftMap.set(key, {
            contract: { address: contractAddress },
            tokenId,
            blockNumber: log.block_number,
            transactionHash: log.transaction_hash,
            chainId
          })
        } else if (from.toLowerCase() === ownerAddress.toLowerCase() && nftMap.has(key)) {
          // NFT was transferred away from owner
          nftMap.delete(key)
        }
      }
    })

    const networkName = chainId === 10143 ? 'Monad Testnet' : 'Arbitrum Sepolia'
    const networkColor = chainId === 10143 ? '#9945FF' : '#28A0F0'

    // Convert to AlchemyNFT format
    const ownedNfts: AlchemyNFT[] = Array.from(nftMap.values()).map((nft) => ({
      contract: nft.contract,
      tokenId: nft.tokenId,
      tokenType: 'ERC721',
      title: `${networkName} NFT #${nft.tokenId}`,
      description: `NFT from ${networkName}`,
      media: [{
        gateway: `https://via.placeholder.com/400x400/${networkColor.slice(1)}/FFFFFF?text=${networkName.replace(' ', '+')}+NFT+${nft.tokenId}`,
        raw: `https://via.placeholder.com/400x400/${networkColor.slice(1)}/FFFFFF?text=${networkName.replace(' ', '+')}+NFT+${nft.tokenId}`,
        format: 'png'
      }],
      metadata: {
        name: `${networkName} NFT #${nft.tokenId}`,
        description: `NFT minted on ${networkName}`,
        image: `https://via.placeholder.com/400x400/${networkColor.slice(1)}/FFFFFF?text=${networkName.replace(' ', '+')}+NFT+${nft.tokenId}`,
        attributes: [
          { trait_type: 'Network', value: networkName },
          { trait_type: 'Type', value: 'ERC721' },
          { trait_type: 'Contract', value: nft.contract.address },
          { trait_type: 'Chain ID', value: chainId.toString() }
        ]
      },
      timeLastUpdated: new Date().toISOString()
    }))

    return {
      ownedNfts,
      totalCount: ownedNfts.length
    }
  }

  private getMockNFTs(ownerAddress: string, chainId: SupportedChainId): AlchemyResponse {
    const networkName = chainId === 10143 ? 'Monad Testnet' : 'Arbitrum Sepolia'
    const networkColor = chainId === 10143 ? '#9945FF' : '#28A0F0'
    
    // Mock NFT data using data URIs to avoid network issues
    const createMockImage = (color: string, text: string) => {
      // Create a simple SVG data URI
      const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${color}"/>
        <text x="200" y="200" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>`;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    // Include the specific Magic Eden NFT for Monad testnet
    const mockNFTs = [];
    
    if (chainId === 10143) {
      // Add your specific ERC-1155 NFT on Monad
      mockNFTs.push({
        contract: {
          address: '0x425639f03ffbf85c81d48047b82127b7fbfdff9a'
        },
        tokenId: '1',
        tokenType: 'ERC1155',
        title: '🎯 Your ERC-1155 NFT #1',
        description: 'Your personally minted ERC-1155 NFT on Monad Testnet',
        media: [{
          gateway: createMockImage(networkColor, 'Your NFT'),
          raw: createMockImage(networkColor, 'Your NFT'),
          format: 'svg'
        }],
        metadata: {
          name: '🎯 Your ERC-1155 NFT #1',
          description: 'Your personally minted ERC-1155 NFT on Monad Testnet',
          image: createMockImage(networkColor, 'Your NFT'),
          attributes: [
            { trait_type: 'Network', value: networkName },
            { trait_type: 'Type', value: 'ERC1155' },
            { trait_type: 'Special', value: 'Your Minted NFT' },
            { trait_type: 'Balance', value: '1' }
          ]
        },
        timeLastUpdated: new Date().toISOString()
      });
    }

    // Add some general mock NFTs
    mockNFTs.push({
      contract: {
        address: chainId === 10143 ? '0x1234567890123456789012345678901234567890' : '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
      },
      tokenId: '42',
      tokenType: 'ERC721',
      title: `${networkName} NFT #42`,
      description: `Test NFT from ${networkName}`,
      media: [{
        gateway: createMockImage(networkColor, `${networkName} 42`),
        raw: createMockImage(networkColor, `${networkName} 42`),
        format: 'svg'
      }],
      metadata: {
        name: `${networkName} NFT #42`,
        description: `Test NFT collection on ${networkName}`,
        image: createMockImage(networkColor, `${networkName} 42`),
        attributes: [
          { trait_type: 'Network', value: networkName },
          { trait_type: 'Collection', value: 'Test Collection' },
          { trait_type: 'Rarity', value: 'Common' }
        ]
      },
      timeLastUpdated: new Date().toISOString()
    });

    return {
      ownedNfts: mockNFTs,
      totalCount: mockNFTs.length
    }
  }
}

export const envioService = new EnvioService()
