'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { aiGenerationService, GeneratedImage } from '@/lib/ai-generation'
import { AI_STYLES, AIStyle } from '@/lib/utils'
import { ipfsService } from '@/lib/ipfs'
import { Loader2, Download, Coins, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function GeneratePage() {
  const { address, isConnected } = useAccount()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [baseNFT, setBaseNFT] = useState<any>(null)
  const [selectedStyle, setSelectedStyle] = useState<AIStyle>('ghibli')
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [saving, setSaving] = useState(false)
  const [minting, setMinting] = useState(false)

  useEffect(() => {
    // Load base NFT data from URL params
    const contract = searchParams.get('contract')
    const tokenId = searchParams.get('tokenId')
    const name = searchParams.get('name')
    const image = searchParams.get('image')
    
    if (contract && tokenId && name && image) {
      setBaseNFT({ contract, tokenId, name, image })
    }
  }, [searchParams])

  const handleGenerate = async () => {
    if (!baseNFT || !isConnected) return

    setGenerating(true)
    try {
      const result = await aiGenerationService.generateImage({
        baseImageUrl: baseNFT.image,
        style: selectedStyle,
        baseNFTName: baseNFT.name,
      })
      
      setGeneratedImage(result)
      toast.success('AI derivative generated successfully!')
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate derivative')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!generatedImage || !baseNFT || !address) return

    setSaving(true)
    try {
      const response = await fetch('/api/drafts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          baseNFT: baseNFT.contract,
          baseTokenId: baseNFT.tokenId,
          imageURL: generatedImage.imageUrl,
          prompt: generatedImage.prompt,
          name: generatedImage.name,
          description: generatedImage.description,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Draft saved successfully!')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return
    
    const link = document.createElement('a')
    link.href = generatedImage.imageUrl
    link.download = `${generatedImage.name.replace(/[^a-z0-9]/gi, '_')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Download started!')
  }

  const handleMint = async () => {
    if (!generatedImage || !baseNFT || !address) return
    
    setMinting(true)
    try {
      // Upload to IPFS first
      const { imageResult, metadataResult } = await ipfsService.uploadDerivativeNFT(
        generatedImage.imageUrl,
        {
          name: generatedImage.name,
          description: generatedImage.description,
          base_nft_address: baseNFT.contract,
          base_token_id: baseNFT.tokenId,
          generation_style: generatedImage.style,
          generation_prompt: generatedImage.prompt,
        }
      )

      // TODO: Integrate with smart contract minting
      // This would call the DerivativeNFT.mintDerivative function
      toast.success('Ready to mint! (Contract integration pending)')
      
    } catch (error) {
      console.error('Mint error:', error)
      toast.error('Failed to prepare for minting')
    } finally {
      setMinting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="card-neon max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-xl font-pixel text-neon-cyan">
              Connect Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to generate AI derivatives.
            </p>
            <WalletConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neon-green/20 bg-retro-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-neon-green hover:text-neon-cyan transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-pixel text-glow gradient-text">
              AI Generator
            </h1>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Base NFT & Controls */}
            <div className="space-y-6">
              {baseNFT && (
                <Card className="card-neon">
                  <CardHeader>
                    <CardTitle className="text-lg font-pixel text-neon-cyan">
                      Base NFT
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                      <Image
                        src={baseNFT.image}
                        alt={baseNFT.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-neon-green">{baseNFT.name}</h3>
                    <p className="text-sm text-muted-foreground">#{baseNFT.tokenId}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="card-neon">
                <CardHeader>
                  <CardTitle className="text-lg font-pixel text-neon-cyan">
                    AI Style Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-neon-green mb-2 block">
                      Choose Art Style
                    </label>
                    <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as AIStyle)}>
                      <SelectTrigger className="input-neon">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-retro-gray border-neon-green/30">
                        {AI_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 rounded border border-neon-green/20 bg-neon-green/5">
                    <p className="text-xs text-muted-foreground">
                      {AI_STYLES.find(s => s.value === selectedStyle)?.prompt}
                    </p>
                  </div>

                  <Button 
                    onClick={handleGenerate}
                    disabled={generating || !baseNFT}
                    className="btn-neon w-full"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate AI Derivative
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Generated Result */}
            <div className="space-y-6">
              {generatedImage ? (
                <Card className="card-neon">
                  <CardHeader>
                    <CardTitle className="text-lg font-pixel text-neon-cyan">
                      Generated Derivative
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={generatedImage.imageUrl}
                        alt={generatedImage.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-neon-green">{generatedImage.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {generatedImage.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={handleDownload}
                        variant="outline"
                        className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      
                      <Button 
                        onClick={handleSaveDraft}
                        disabled={saving}
                        variant="outline"
                        className="border-neon-yellow/50 text-neon-yellow hover:bg-neon-yellow/10"
                      >
                        {saving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          'Save Draft'
                        )}
                      </Button>
                    </div>

                    <Button 
                      onClick={handleMint}
                      disabled={minting}
                      className="btn-neon w-full"
                    >
                      {minting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Coins className="mr-2 h-4 w-4" />
                          Mint NFT
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="card-neon">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-green/10 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-neon-green" />
                    </div>
                    <p className="text-muted-foreground">
                      Select an AI style and generate your derivative
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
