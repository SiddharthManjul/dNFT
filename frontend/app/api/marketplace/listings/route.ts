import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateListingSchema = z.object({
  listingId: z.string(),
  nftContract: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address'),
  tokenId: z.string(),
  seller: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid seller address'),
  price: z.string(),
  baseNFTAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid base NFT address').optional(),
  baseTokenId: z.string().optional(),
  transactionHash: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seller = searchParams.get('seller')
    const active = searchParams.get('active')

    let whereClause: any = {}
    
    if (seller) {
      whereClause.seller = seller.toLowerCase()
    }
    
    if (active === 'true') {
      whereClause.active = true
    } else if (active === 'false') {
      whereClause.active = false
    }

    const listings = await prisma.marketplaceListing.findMany({
      where: whereClause,
      orderBy: {
        listedAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, listings })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateListingSchema.parse(body)

    // Check if listing already exists
    const existingListing = await prisma.marketplaceListing.findUnique({
      where: {
        listingId: validatedData.listingId,
      },
    })

    if (existingListing) {
      return NextResponse.json(
        { success: false, error: 'Listing already exists' },
        { status: 409 }
      )
    }

    const listing = await prisma.marketplaceListing.create({
      data: {
        listingId: validatedData.listingId,
        nftContract: validatedData.nftContract.toLowerCase(),
        tokenId: validatedData.tokenId,
        seller: validatedData.seller.toLowerCase(),
        price: validatedData.price,
        active: true,
        baseNFTAddress: validatedData.baseNFTAddress?.toLowerCase(),
        baseTokenId: validatedData.baseTokenId,
        transactionHash: validatedData.transactionHash,
      },
    })

    return NextResponse.json({ success: true, listing })
  } catch (error) {
    console.error('Error creating listing:', error)
    
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
