import { AIStyle, AI_STYLES } from './utils'

export interface GeneratedImage {
  imageUrl: string
  prompt: string
  style: AIStyle
  name: string
  description: string
}

export interface GenerationRequest {
  baseImageUrl: string
  style: AIStyle
  baseNFTName?: string
  baseNFTDescription?: string
}

export class AIGenerationService {
  async generateImage(request: GenerationRequest): Promise<GeneratedImage> {
    // This is a placeholder implementation
    // In production, you would integrate with actual AI services like:
    // - OpenAI DALL-E
    // - Replicate
    // - Stability AI
    // - Midjourney API
    
    const selectedStyle = AI_STYLES.find(s => s.value === request.style)
    if (!selectedStyle) {
      throw new Error(`Unknown AI style: ${request.style}`)
    }

    // Simulate AI generation delay
    await this.sleep(2000 + Math.random() * 3000)

    // Generate mock image URL (in production, this would be the actual generated image)
    const mockImageUrl = this.generateMockImage(request.style)
    
    const derivativeName = this.generateName(request.baseNFTName, selectedStyle.label)
    const derivativeDescription = this.generateDescription(
      request.baseNFTDescription,
      selectedStyle.label,
      selectedStyle.prompt
    )

    return {
      imageUrl: mockImageUrl,
      prompt: selectedStyle.prompt,
      style: request.style,
      name: derivativeName,
      description: derivativeDescription,
    }
  }

  private generateMockImage(style: AIStyle): string {
    // Generate different mock images for different styles
    const colors = {
      ghibli: '90EE90/228B22',
      pixel: 'FF00FF/800080',
      '3d': '87CEEB/4682B4',
      cartoon: 'FFD700/FF8C00',
      cyberpunk: '00FFFF/FF00FF',
      watercolor: 'DDA0DD/9370DB',
      sketch: 'D3D3D3/696969',
      oil: 'F5DEB3/CD853F',
    }
    
    const colorPair = colors[style] || 'FFFFFF/000000'
    const timestamp = Date.now()
    
    return `https://via.placeholder.com/512x512/${colorPair}?text=${style.toUpperCase()}+Style&t=${timestamp}`
  }

  private generateName(baseName?: string, styleName?: string): string {
    const base = baseName || 'Untitled NFT'
    const style = styleName || 'Transformed'
    
    const templates = [
      `${base} - ${style} Edition`,
      `${style} ${base}`,
      `${base} in ${style} Style`,
      `${style} Variant of ${base}`,
      `${base}: ${style} Remix`,
    ]
    
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private generateDescription(
    baseDescription?: string,
    styleName?: string,
    stylePrompt?: string
  ): string {
    const base = baseDescription || 'An NFT'
    const style = styleName || 'AI-transformed'
    
    return `${base} reimagined through AI transformation in ${style} style. ${stylePrompt}. This derivative maintains the essence of the original while exploring new artistic possibilities through artificial intelligence.`
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Method to get style information
  getAvailableStyles() {
    return AI_STYLES
  }

  getStyleByValue(value: AIStyle) {
    return AI_STYLES.find(style => style.value === value)
  }
}

export const aiGenerationService = new AIGenerationService()

// Types for the AI generation process
export interface GenerationProgress {
  stage: 'preparing' | 'generating' | 'processing' | 'complete' | 'error'
  progress: number
  message: string
}

// Mock streaming for generation progress
export async function* generateImageWithProgress(
  request: GenerationRequest
): AsyncGenerator<GenerationProgress, GeneratedImage> {
  yield { stage: 'preparing', progress: 10, message: 'Preparing AI model...' }
  await new Promise(resolve => setTimeout(resolve, 1000))

  yield { stage: 'generating', progress: 30, message: 'Generating image...' }
  await new Promise(resolve => setTimeout(resolve, 2000))

  yield { stage: 'processing', progress: 80, message: 'Processing result...' }
  await new Promise(resolve => setTimeout(resolve, 1000))

  yield { stage: 'complete', progress: 100, message: 'Generation complete!' }
  
  const result = await aiGenerationService.generateImage(request)
  return result
}
