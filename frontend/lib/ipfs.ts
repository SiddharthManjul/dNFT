import { PinataSDK } from 'pinata'

export interface IPFSUploadResult {
  hash: string
  url: string
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  external_url?: string
  background_color?: string
  animation_url?: string
  // Custom fields for derivative tracking
  base_nft_address?: string
  base_token_id?: string
  generation_style?: string
  generation_prompt?: string
  created_at?: string
}

class IPFSService {
  private pinata: PinataSDK | null = null

  constructor() {
    const jwt = process.env.PINATA_JWT
    if (jwt) {
      this.pinata = new PinataSDK({
        pinataJwt: jwt,
      })
    } else {
      console.warn('Pinata JWT not found. IPFS uploads will use mock implementation.')
    }
  }

  async uploadImage(imageBlob: Blob, filename: string): Promise<IPFSUploadResult> {
    if (!this.pinata) {
      // Mock implementation for development
      return this.mockUpload(filename)
    }

    try {
      const file = new File([imageBlob], filename, { type: imageBlob.type })
      const result = await this.pinata.upload.file(file)
      
      return {
        hash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      }
    } catch (error) {
      console.error('Error uploading image to IPFS:', error)
      // Fallback to mock
      return this.mockUpload(filename)
    }
  }

  async uploadImageFromUrl(imageUrl: string, filename: string): Promise<IPFSUploadResult> {
    try {
      // Fetch the image
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      
      const imageBlob = await response.blob()
      return this.uploadImage(imageBlob, filename)
    } catch (error) {
      console.error('Error uploading image from URL to IPFS:', error)
      // Return the original URL as fallback
      return {
        hash: 'mock_hash',
        url: imageUrl
      }
    }
  }

  async uploadMetadata(metadata: NFTMetadata): Promise<IPFSUploadResult> {
    if (!this.pinata) {
      // Mock implementation for development
      return {
        hash: 'mock_metadata_hash',
        url: `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`
      }
    }

    try {
      const result = await this.pinata.upload.json(metadata)
      
      return {
        hash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      }
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error)
      // Fallback to data URL
      return {
        hash: 'mock_metadata_hash',
        url: `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`
      }
    }
  }

  async uploadDerivativeNFT(
    imageUrl: string,
    metadata: Omit<NFTMetadata, 'image'>
  ): Promise<{ imageResult: IPFSUploadResult; metadataResult: IPFSUploadResult }> {
    // Upload image first
    const imageResult = await this.uploadImageFromUrl(
      imageUrl,
      `${metadata.name || 'derivative'}.png`
    )

    // Create complete metadata with IPFS image URL
    const completeMetadata: NFTMetadata = {
      ...metadata,
      image: imageResult.url,
      created_at: new Date().toISOString()
    }

    // Upload metadata
    const metadataResult = await this.uploadMetadata(completeMetadata)

    return { imageResult, metadataResult }
  }

  private mockUpload(filename: string): IPFSUploadResult {
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}`
    return {
      hash: mockHash,
      url: `https://gateway.pinata.cloud/ipfs/${mockHash}`
    }
  }

  // Utility to fetch metadata from IPFS
  async fetchMetadata(ipfsUrl: string): Promise<NFTMetadata | null> {
    try {
      const response = await fetch(ipfsUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching metadata from IPFS:', error)
      return null
    }
  }

  // Utility to convert IPFS hash to URL
  getIPFSUrl(hash: string): string {
    if (hash.startsWith('http')) return hash
    if (hash.startsWith('ipfs://')) {
      return `https://gateway.pinata.cloud/ipfs/${hash.slice(7)}`
    }
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  }
}

export const ipfsService = new IPFSService()

// Utility function to download image from URL as blob
export async function downloadImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`)
  }
  return await response.blob()
}

// Utility function to trigger download of a file
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
