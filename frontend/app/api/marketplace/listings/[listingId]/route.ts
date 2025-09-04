import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateListingSchema = z.object({
  active: z.boolean().optional(),
  buyer: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid buyer address').optional(),
  soldAt: z.string().datetime().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const listingId = params.listingId
    const body = await request.json()
    const validatedData = UpdateListingSchema.parse(body)

    const listing = await prisma.marketplaceListing.findUnique({
      where: {
        listingId: listingId,
      },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (validatedData.active !== undefined) {
      updateData.active = validatedData.active
    }
    
    if (validatedData.buyer) {
      updateData.buyer = validatedData.buyer.toLowerCase()
    }
    
    if (validatedData.soldAt) {
      updateData.soldAt = new Date(validatedData.soldAt)
    }

    const updatedListing = await prisma.marketplaceListing.update({
      where: {
        listingId: listingId,
      },
      data: updateData,
    })

    return NextResponse.json({ success: true, listing: updatedListing })
  } catch (error) {
    console.error('Error updating listing:', error)
    
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

export async function GET(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const listingId = params.listingId

    const listing = await prisma.marketplaceListing.findUnique({
      where: {
        listingId: listingId,
      },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, listing })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
