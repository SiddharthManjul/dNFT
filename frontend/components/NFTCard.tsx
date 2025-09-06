'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { shortenAddress, formatPrice } from '@/lib/utils'
import { AlchemyNFT } from '@/lib/alchemy'
import { ExternalLink, Zap } from 'lucide-react'

interface NFTCardProps {
  nft: AlchemyNFT
  showActions?: boolean
  onGenerate?: (nft: AlchemyNFT) => void
  onView?: (nft: AlchemyNFT) => void
  className?: string
}

export function NFTCard({ nft, showActions = true, onGenerate, onView, className }: NFTCardProps) {
  // Safely access media array and fallback to metadata image or placeholder
  const imageUrl = nft.media?.[0]?.gateway || nft.media?.[0]?.raw || nft.metadata?.image || 
    'data:image/svg+xml;base64,' + btoa(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#1a1a1a"/>
        <text x="200" y="200" font-family="Arial" font-size="24" fill="#00ff41" text-anchor="middle" dominant-baseline="middle">NFT #${nft.tokenId}</text>
      </svg>
    `)
  const name = nft.title || nft.metadata?.name || `NFT #${nft.tokenId}`
  const description = nft.description || nft.metadata?.description || 'No description available'

  return (
    <Card className={`nft-card ${className}`}>
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="outline" className="bg-retro-dark/80 text-neon-green border-neon-green/50">
              #{nft.tokenId}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-pixel text-sm text-neon-cyan text-glow truncate">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Contract:</span>
            <span className="text-neon-green font-mono">
              {shortenAddress(nft.contract.address)}
            </span>
          </div>
          
          {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {nft.metadata.attributes.slice(0, 3).map((attr, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-retro-gray/30 text-neon-pink border-neon-pink/30"
                >
                  {attr.trait_type}: {attr.value}
                </Badge>
              ))}
              {nft.metadata.attributes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{nft.metadata.attributes.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          {onGenerate && (
            <Button 
              onClick={() => onGenerate(nft)}
              className="btn-neon flex-1"
              size="sm"
            >
              <Zap className="mr-2 h-3 w-3" />
              Generate
            </Button>
          )}
          {onView && (
            <Button 
              onClick={() => onView(nft)}
              variant="outline"
              size="sm"
              className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
