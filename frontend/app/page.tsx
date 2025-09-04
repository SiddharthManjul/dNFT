'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { NFTCard } from '@/components/NFTCard'
import { alchemyService, AlchemyNFT } from '@/lib/alchemy'
import { Loader2, Sparkles, Palette, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [nfts, setNfts] = useState<AlchemyNFT[]>([])
  const [loading, setLoading] = useState(false)
  const [drafts, setDrafts] = useState<any[]>([])

  useEffect(() => {
    if (isConnected && address) {
      fetchUserNFTs()
      fetchDrafts()
    }
  }, [isConnected, address])

  const fetchUserNFTs = async () => {
    if (!address) return
    
    setLoading(true)
    try {
      const response = await alchemyService.getNFTsForOwner(address)
      setNfts(response.ownedNfts)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrafts = async () => {
    if (!address) return
    
    try {
      const response = await fetch(`/api/drafts/${address}`)
      const data = await response.json()
      if (data.success) {
        setDrafts(data.drafts)
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
    }
  }

  const handleGenerateDerivative = (nft: AlchemyNFT) => {
    const params = new URLSearchParams({
      contract: nft.contract.address,
      tokenId: nft.tokenId,
      name: nft.title || nft.metadata?.name || `NFT #${nft.tokenId}`,
      image: nft.media[0]?.gateway || nft.metadata?.image || '',
    })
    router.push(`/generate?${params.toString()}`)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-neon-green/20 bg-retro-dark/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-cyan rounded-full animate-pulse" />
              <h1 className="text-2xl font-pixel text-glow gradient-text">
                VIALS
              </h1>
            </div>
            <WalletConnectButton />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="card-neon max-w-md w-full text-center">
            <CardHeader>
              <CardTitle className="text-xl font-pixel text-neon-cyan">
                Welcome to Vials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Transform your NFTs with AI-powered derivatives. Create unique variations 
                of your digital assets and trade them on our retro-futuristic marketplace.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded border border-neon-green/20 bg-neon-green/5">
                  <Sparkles className="h-5 w-5 text-neon-green" />
                  <div className="text-left">
                    <div className="font-medium text-sm text-neon-green">AI Generation</div>
                    <div className="text-xs text-muted-foreground">8 unique art styles</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded border border-neon-cyan/20 bg-neon-cyan/5">
                  <Palette className="h-5 w-5 text-neon-cyan" />
                  <div className="text-left">
                    <div className="font-medium text-sm text-neon-cyan">Draft System</div>
                    <div className="text-xs text-muted-foreground">Save & mint later</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded border border-neon-pink/20 bg-neon-pink/5">
                  <ShoppingCart className="h-5 w-5 text-neon-pink" />
                  <div className="text-left">
                    <div className="font-medium text-sm text-neon-pink">Marketplace</div>
                    <div className="text-xs text-muted-foreground">Buy & sell derivatives</div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <WalletConnectButton />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neon-green/20 bg-retro-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-cyan rounded-full animate-pulse" />
            <h1 className="text-2xl font-pixel text-glow gradient-text">
              VIALS
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-neon-green hover:text-neon-cyan transition-colors">
              Home
            </Link>
            <Link href="/generate" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              Generate
            </Link>
            <Link href="/marketplace" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              Marketplace
            </Link>
          </nav>
          
          <WalletConnectButton />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-pixel gradient-text">
              Your NFT Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select any NFT from your collection to create AI-powered derivatives. 
              Your drafts are automatically saved until you're ready to mint.
            </p>
          </div>

          <Tabs defaultValue="collection" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-retro-gray/30 border border-neon-green/20">
              <TabsTrigger 
                value="collection" 
                className="text-neon-green data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green"
              >
                Collection ({nfts.length})
              </TabsTrigger>
              <TabsTrigger 
                value="drafts" 
                className="text-neon-cyan data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
              >
                Drafts ({drafts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="collection" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
                  <span className="ml-2 text-muted-foreground">Loading your NFTs...</span>
                </div>
              ) : nfts.length === 0 ? (
                <Card className="card-neon text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground">
                      No NFTs found in your wallet on Arbitrum Sepolia.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Make sure you have NFTs on the Arbitrum Sepolia testnet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {nfts.map((nft, index) => (
                    <NFTCard
                      key={`${nft.contract.address}-${nft.tokenId}`}
                      nft={nft}
                      onGenerate={handleGenerateDerivative}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="drafts" className="space-y-6">
              {drafts.length === 0 ? (
                <Card className="card-neon text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground">
                      No derivative drafts yet.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Generate your first AI derivative from the Collection tab.
                    </p>
                    <Button 
                      className="btn-neon mt-4"
                      onClick={() => {
                        const tabTrigger = document.querySelector('[value="collection"]') as HTMLElement
                        tabTrigger?.click()
                      }}
                    >
                      View Collection
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {drafts.map((draft) => (
                    <Card key={draft.id} className="nft-card">
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden rounded-t-lg">
                          <img
                            src={draft.imageURL}
                            alt={draft.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50">
                              DRAFT
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-pixel text-sm text-neon-cyan text-glow truncate">
                              {draft.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {draft.description}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => router.push(`/generate?draft=${draft.id}`)}
                              className="btn-neon flex-1"
                              size="sm"
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
