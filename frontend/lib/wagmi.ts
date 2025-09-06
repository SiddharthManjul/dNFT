import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia } from 'wagmi/chains'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'fallback-project-id'

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set, using fallback')
}

export const config = getDefaultConfig({
  appName: 'Vials - AI NFT Derivatives',
  projectId,
  chains: [arbitrumSepolia],
  ssr: true,
})

export const SUPPORTED_CHAINS = [arbitrumSepolia]
