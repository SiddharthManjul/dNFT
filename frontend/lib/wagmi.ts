import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia } from 'wagmi/chains'

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
}

export const config = getDefaultConfig({
  appName: 'Vials - AI NFT Derivatives',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [arbitrumSepolia],
  ssr: true,
})

export const SUPPORTED_CHAINS = [arbitrumSepolia]
