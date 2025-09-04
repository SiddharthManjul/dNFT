import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateMintedNFTSchema = z.object({
  tokenId: z.string(),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address'),
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  baseNFT: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid base NFT address'),
  baseTokenId: z.string(),
  name: z.string(),
  description: z.string(),
  imageURL: z.string().url('Invalid image URL'),
  metadataURL: z.string().url('Invalid metadata URL'),
  transactionHash: z.string(),
  blockNumber: z.number().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateMintedNFTSchema.parse(body)

    // Check if NFT already exists
    const existingNFT = await prisma.mintedNFT.findFirst({
      where: {
        tokenId: validatedData.tokenId,
        contractAddress: validatedData.contractAddress.toLowerCase(),
      },
    })

    if (existingNFT) {
      return NextResponse.json(
        { success: false, error: 'NFT already recorded' },
        { status: 409 }
      )
    }

    const mintedNFT = await prisma.mintedNFT.create({
      data: {
        tokenId: validatedData.tokenId,
        contractAddress: validatedData.contractAddress.toLowerCase(),
        wallet: validatedData.wallet.toLowerCase(),
        baseNFT: validatedData.baseNFT.toLowerCase(),
        baseTokenId: validatedData.baseTokenId,
        name: validatedData.name,
        description: validatedData.description,
        imageURL: validatedData.imageURL,
        metadataURL: validatedData.metadataURL,
        transactionHash: validatedData.transactionHash,
        blockNumber: validatedData.blockNumber,
      },
    })

    return NextResponse.json({ success: true, mintedNFT })
  } catch (error) {
    console.error('Error recording minted NFT:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    const contractAddress = searchParams.get('contract')

    let whereClause: any = {}
    
    if (wallet) {
      whereClause.wallet = wallet.toLowerCase()
    }
    
    if (contractAddress) {
      whereClause.contractAddress = contractAddress.toLowerCase()
    }

    const mintedNFTs = await prisma.mintedNFT.findMany({
      where: whereClause,
      orderBy: {
        mintedAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, mintedNFTs })
  } catch (error) {
    console.error('Error fetching minted NFTs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
