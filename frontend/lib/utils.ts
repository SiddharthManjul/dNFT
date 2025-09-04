import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatEther(wei: string | bigint, decimals = 4): string {
  const value = typeof wei === 'string' ? BigInt(wei) : wei
  const formatted = (Number(value) / 1e18).toFixed(decimals)
  return parseFloat(formatted).toString()
}

export function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (num >= 1) return num.toFixed(2)
  if (num >= 0.01) return num.toFixed(4)
  return num.toFixed(6)
}

export function getIpfsUrl(hash: string): string {
  if (hash.startsWith('http')) return hash
  if (hash.startsWith('ipfs://')) {
    return `https://gateway.pinata.cloud/ipfs/${hash.slice(7)}`
  }
  return `https://gateway.pinata.cloud/ipfs/${hash}`
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export const AI_STYLES = [
  { value: 'ghibli', label: 'Studio Ghibli', prompt: 'Transform into Studio Ghibli anime art style with soft colors and magical atmosphere' },
  { value: 'pixel', label: 'Pixel Art', prompt: 'Convert to 8-bit pixel art style with retro gaming aesthetics' },
  { value: '3d', label: '3D Render', prompt: 'Create a modern 3D rendered version with realistic lighting and materials' },
  { value: 'cartoon', label: 'Cartoon', prompt: 'Transform into vibrant cartoon style with bold outlines and bright colors' },
  { value: 'cyberpunk', label: 'Cyberpunk', prompt: 'Reimagine in cyberpunk style with neon lights and futuristic elements' },
  { value: 'watercolor', label: 'Watercolor', prompt: 'Convert to watercolor painting style with flowing colors and artistic brushstrokes' },
  { value: 'sketch', label: 'Pencil Sketch', prompt: 'Transform into detailed pencil sketch with artistic shading' },
  { value: 'oil', label: 'Oil Painting', prompt: 'Recreate as classical oil painting with rich textures and deep colors' },
] as const

export type AIStyle = typeof AI_STYLES[number]['value']
