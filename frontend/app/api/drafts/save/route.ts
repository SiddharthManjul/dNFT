import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SaveDraftSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  baseNFT: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address'),
  baseTokenId: z.string(),
  imageURL: z.string().url('Invalid image URL'),
  prompt: z.string().min(1, 'Prompt is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  metadata: z.record(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = SaveDraftSchema.parse(body)

    const draft = await prisma.derivativeDraft.create({
      data: {
        wallet: validatedData.wallet.toLowerCase(),
        baseNFT: validatedData.baseNFT.toLowerCase(),
        baseTokenId: validatedData.baseTokenId,
        imageURL: validatedData.imageURL,
        prompt: validatedData.prompt,
        name: validatedData.name,
        description: validatedData.description,
        metadata: validatedData.metadata || {},
      },
    })

    return NextResponse.json({ success: true, draft })
  } catch (error) {
    console.error('Error saving draft:', error)
    
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
