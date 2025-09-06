'use client'

import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Network, AlertTriangle } from 'lucide-react'

const SUPPORTED_NETWORKS = [
  {
    chain: arbitrumSepolia,
    name: 'Arbitrum Sepolia',
    shortName: 'ARB',
    color: 'bg-blue-500',
  },
]

export function NetworkSelector() {
  const { chain } = useAccount()
  const { switchChain, isPending } = useSwitchChain()
  const [selectedNetwork, setSelectedNetwork] = useState<string>(
    chain?.id.toString() || arbitrumSepolia.id.toString()
  )

  const currentNetwork = SUPPORTED_NETWORKS.find(
    (network) => network.chain.id === chain?.id
  )

  const handleNetworkChange = (chainId: string) => {
    const networkId = parseInt(chainId)
    setSelectedNetwork(chainId)
    switchChain({ chainId: networkId })
  }

  const isUnsupportedNetwork = chain && !SUPPORTED_NETWORKS.some(
    (network) => network.chain.id === chain.id
  )

  return (
    <div className="flex items-center gap-3">
      {/* Current Network Badge */}
      {currentNetwork ? (
        <Badge 
          className={`${currentNetwork.color} text-white border-0 font-pixel text-xs`}
        >
          <Network className="w-3 h-3 mr-1" />
          {currentNetwork.shortName}
        </Badge>
      ) : isUnsupportedNetwork ? (
        <Badge className="bg-destructive text-destructive-foreground border-0 font-pixel text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Unsupported
        </Badge>
      ) : null}

      {/* Network Selector */}
      <Select
        value={selectedNetwork}
        onValueChange={handleNetworkChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px] input-neon border-neon-green/50">
          <SelectValue placeholder="Select Network" />
        </SelectTrigger>
        <SelectContent className="bg-retro-gray border-neon-green/30">
          {SUPPORTED_NETWORKS.map((network) => (
            <SelectItem 
              key={network.chain.id} 
              value={network.chain.id.toString()}
              className="text-neon-green hover:bg-neon-green/10"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${network.color}`} />
                {network.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Switch Network Button for Unsupported Networks */}
      {isUnsupportedNetwork && (
        <Button
          onClick={() => handleNetworkChange(arbitrumSepolia.id.toString())}
          disabled={isPending}
          className="btn-neon"
          size="sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Switching...
            </>
          ) : (
            'Switch Network'
          )}
        </Button>
      )}
    </div>
  )
}
