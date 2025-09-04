import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidEthereumAddress } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const wallet = params.wallet

    if (!isValidEthereumAddress(wallet)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    const drafts = await prisma.derivativeDraft.findMany({
      where: {
        wallet: wallet.toLowerCase(),
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, drafts })
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const wallet = params.wallet
    const { searchParams } = new URL(request.url)
    const draftId = searchParams.get('id')

    if (!isValidEthereumAddress(wallet)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    if (!draftId) {
      return NextResponse.json(
        { success: false, error: 'Draft ID is required' },
        { status: 400 }
      )
    }

    // Verify the draft belongs to the wallet
    const draft = await prisma.derivativeDraft.findFirst({
      where: {
        id: draftId,
        wallet: wallet.toLowerCase(),
      },
    })

    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Draft not found or unauthorized' },
        { status: 404 }
      )
    }

    await prisma.derivativeDraft.delete({
      where: {
        id: draftId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting draft:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
