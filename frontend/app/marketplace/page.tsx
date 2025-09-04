'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { shortenAddress, formatPrice } from '@/lib/utils'
import { Loader2, ShoppingCart, Search, Filter, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface MarketplaceListing {
  id: string
  listingId: string
  nftContract: string
  tokenId: string
  seller: string
  price: string
  active: boolean
  baseNFTAddress?: string
  baseTokenId?: string
  listedAt: string
  // Mock metadata
  name?: string
  image?: string
  description?: string
}

export default function MarketplacePage() {
  const { address, isConnected } = useAccount()
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceSort, setPriceSort] = useState<'low' | 'high' | null>(null)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/marketplace/listings?active=true')
      const data = await response.json()
      if (data.success) {
        // Add mock metadata for demo
        const listingsWithMeta = data.listings.map((listing: any, index: number) => ({
          ...listing,
          name: `AI Derivative #${listing.tokenId}`,
          image: `https://via.placeholder.com/400x400/${index % 2 === 0 ? '00ff41' : 'ff007f'}/000000?text=NFT+${listing.tokenId}`,
          description: `An AI-generated derivative NFT with unique artistic transformation.`,
        }))
        setListings(listingsWithMeta)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      // Mock data for demo
      setListings([
        {
          id: '1',
          listingId: '0',
          nftContract: '0x1234567890123456789012345678901234567890',
          tokenId: '1',
          seller: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          price: '100000000000000000', // 0.1 ETH
          active: true,
          listedAt: new Date().toISOString(),
          name: 'Ghibli Style Cat #1',
          image: 'https://via.placeholder.com/400x400/00ff41/000000?text=Ghibli+Cat',
          description: 'A beautiful Studio Ghibli style transformation of a pixel cat NFT.',
        },
        {
          id: '2',
          listingId: '1',
          nftContract: '0x1234567890123456789012345678901234567890',
          tokenId: '2',
          seller: '0xfedcbafedcbafedcbafedcbafedcbafedcbafedcba',
          price: '250000000000000000', // 0.25 ETH
          active: true,
          listedAt: new Date().toISOString(),
          name: 'Cyberpunk Robot #5',
          image: 'https://via.placeholder.com/400x400/ff007f/000000?text=Cyber+Robot',
          description: 'A futuristic cyberpunk interpretation of a classic robot NFT.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async (listing: MarketplaceListing) => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      // TODO: Integrate with smart contract
      toast.success(`Purchase initiated for ${listing.name}`)
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Failed to purchase NFT')
    }
  }

  const filteredListings = listings
    .filter(listing => 
      listing.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (priceSort === 'low') {
        return parseInt(a.price) - parseInt(b.price)
      } else if (priceSort === 'high') {
        return parseInt(b.price) - parseInt(a.price)
      }
      return 0
    })

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neon-green/20 bg-retro-dark/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-cyan rounded-full animate-pulse" />
            <h1 className="text-2xl font-pixel text-glow gradient-text">
              MARKETPLACE
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              Home
            </Link>
            <Link href="/generate" className="text-muted-foreground hover:text-neon-cyan transition-colors">
              Generate
            </Link>
            <Link href="/marketplace" className="text-neon-green hover:text-neon-cyan transition-colors">
              Marketplace
            </Link>
          </nav>
          
          <WalletConnectButton />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-pixel gradient-text">
              AI Derivative Marketplace
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover and collect unique AI-generated derivatives. Each NFT represents 
              a creative transformation of original digital assets.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-neon text-center">
              <CardContent className="py-6">
                <div className="text-2xl font-pixel text-neon-green mb-2">
                  {listings.length}
                </div>
                <div className="text-sm text-muted-foreground">Listed NFTs</div>
              </CardContent>
            </Card>
            
            <Card className="card-neon text-center">
              <CardContent className="py-6">
                <div className="text-2xl font-pixel text-neon-cyan mb-2">
                  {formatPrice(listings.reduce((sum, l) => sum + parseInt(l.price), 0) / 1e18)} ETH
                </div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </CardContent>
            </Card>
            
            <Card className="card-neon text-center">
              <CardContent className="py-6">
                <div className="text-2xl font-pixel text-neon-pink mb-2">
                  {formatPrice((listings.reduce((sum, l) => sum + parseInt(l.price), 0) / listings.length) / 1e18)} ETH
                </div>
                <div className="text-sm text-muted-foreground">Avg Price</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="card-neon">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search derivatives..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-neon pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={priceSort === 'low' ? 'default' : 'outline'}
                    onClick={() => setPriceSort(priceSort === 'low' ? null : 'low')}
                    className={priceSort === 'low' ? 'btn-neon' : 'border-neon-green/50 text-neon-green hover:bg-neon-green/10'}
                  >
                    Price: Low
                  </Button>
                  <Button
                    variant={priceSort === 'high' ? 'default' : 'outline'}
                    onClick={() => setPriceSort(priceSort === 'high' ? null : 'high')}
                    className={priceSort === 'high' ? 'btn-neon' : 'border-neon-green/50 text-neon-green hover:bg-neon-green/10'}
                  >
                    Price: High
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listings Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
              <span className="ml-2 text-muted-foreground">Loading marketplace...</span>
            </div>
          ) : filteredListings.length === 0 ? (
            <Card className="card-neon text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No NFTs match your search.' : 'No NFTs listed yet.'}
                </p>
                <Link href="/generate">
                  <Button className="btn-neon mt-4">
                    Create First Derivative
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="nft-card">
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <Image
                        src={listing.image || '/placeholder-nft.png'}
                        alt={listing.name || 'NFT'}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-neon-green/20 text-neon-green border-neon-green/50">
                          FOR SALE
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-pixel text-sm text-neon-cyan text-glow truncate">
                          {listing.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {listing.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Seller:</span>
                        <span className="text-neon-green font-mono">
                          {shortenAddress(listing.seller)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-pixel text-neon-yellow">
                            {formatPrice(parseInt(listing.price) / 1e18)} ETH
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ≈ ${(parseFloat(formatPrice(parseInt(listing.price) / 1e18)) * 2000).toFixed(2)}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => handleBuy(listing)}
                          disabled={!isConnected || listing.seller.toLowerCase() === address?.toLowerCase()}
                          className="btn-neon"
                          size="sm"
                        >
                          {!isConnected ? (
                            'Connect Wallet'
                          ) : listing.seller.toLowerCase() === address?.toLowerCase() ? (
                            'Your NFT'
                          ) : (
                            <>
                              <ShoppingCart className="mr-1 h-3 w-3" />
                              Buy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
