import { NextRequest, NextResponse } from 'next/server'
import { AlchemyResponse, AlchemyNFT } from '../../../lib/alchemy'

// GET /api/nfts?wallet=0x...&chainId=10143
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

    const chainId = chainIdParam ? parseInt(chainIdParam) : undefined
    
    console.log(`📊 NFT API called for wallet: ${walletAddress}, chainId: ${chainId}`)
    
    // Indexer removed - return empty response
    const response: AlchemyResponse = {
      ownedNfts: [],
      totalCount: 0
    }

    console.log(`📊 Returning 0 NFTs (indexer removed)`);
    
    return NextResponse.json({ success: true, data: response })
    
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NFTs' },
      { status: 500 }
    )
  }
}
