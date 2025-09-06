import { NextRequest, NextResponse } from 'next/server'
import { nftService } from '../../../lib/nft-service'

// GET /api/nfts?wallet=0x...&chainId=421614
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const chainIdParam = searchParams.get('chainId')
    
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const chainId = chainIdParam ? parseInt(chainIdParam) : 421614 // Default to Arbitrum Sepolia
    
    console.log(`📊 NFT API called for wallet: ${walletAddress}, chainId: ${chainId}`)
    
    // Use NFT service to fetch NFTs via Alchemy
    const response = await nftService.getNFTsForOwner(walletAddress, { chainId })

    console.log(`📊 Returning ${response.totalCount} NFTs from Alchemy`);
    
    return NextResponse.json({ success: true, data: response })
    
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NFTs' },
      { status: 500 }
    )
  }
}
