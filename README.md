# 🧪 Vials - AI NFT Derivative Generator & Marketplace

A cutting-edge dApp that enables users to create AI-powered derivatives of their NFTs and trade them on a retro-futuristic marketplace, deployed on Arbitrum Sepolia testnet.

![Vials Banner](https://via.placeholder.com/1200x400/0a0a0a/00ff41?text=VIALS+-+AI+NFT+DERIVATIVES)

## 🌟 Features

### 🎨 AI-Powered NFT Generation
- **8 Unique Art Styles**: Ghibli, Pixel Art, 3D Render, Cartoon, Cyberpunk, Watercolor, Sketch, Oil Painting
- **Real-time Generation**: Mock AI service with realistic generation timing
- **Provenance Tracking**: Every derivative links back to its original NFT

### 💾 Draft System
- **Save & Resume**: Generate derivatives and save them as drafts
- **Persistent Storage**: Prisma database stores all unminted derivatives
- **Download Option**: Export generated images locally

### 🛒 Integrated Marketplace
- **Gas-Efficient Trading**: Built on Arbitrum Sepolia for low fees
- **Provenance Display**: Each listing shows the original NFT source
- **Real-time Updates**: Live marketplace data with search and filtering

### 🎮 Retro Gaming Theme
- **Pixel Perfect UI**: Custom fonts (Press Start 2P, VT323)
- **Neon Aesthetics**: Green, cyan, pink color scheme with glow effects
- **CRT Animations**: Scanlines and retro visual effects

## 🏗️ Architecture

```
vials/
├── contracts/              # Solidity smart contracts
│   ├── DerivativeNFT.sol  # ERC721 for derivative NFTs
│   └── NFTMarketplace.sol # Marketplace contract
├── script/                # Foundry deployment scripts
├── test/                  # Contract tests
├── frontend/              # Next.js 14 frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and services
│   └── styles/          # TailwindCSS + custom styles
└── prisma/              # Database schema
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Foundry** for smart contracts
- **Git** for cloning

### 1. Clone & Install

```bash
git clone <repository-url>
cd vials

# Install Foundry dependencies
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std

# Install frontend dependencies
cd frontend
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp env.example .env.local
```

Configure your `.env.local`:

```env
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
ARBISCAN_API_KEY=your_arbiscan_api_key_here

# Frontend Environment Variables
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Database
DATABASE_URL="file:./dev.db"

# IPFS/Pinata (Optional)
PINATA_JWT=your_pinata_jwt_here

# AI Integration (Future)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Deploy Contracts

```bash
# Compile contracts
forge build

# Run tests
forge test

# Deploy to Arbitrum Sepolia
forge script script/Deploy.s.sol --rpc-url arbitrum_sepolia --broadcast --verify
```

### 4. Setup Database

```bash
cd frontend
npx prisma generate
npx prisma db push
```

### 5. Launch Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see your dApp in action! 🎉

## 📋 API Documentation

### Draft Management

#### Save Draft
```bash
POST /api/drafts/save
{
  "wallet": "0x...",
  "baseNFT": "0x...",
  "baseTokenId": "123",
  "imageURL": "https://...",
  "prompt": "Ghibli style",
  "name": "My Derivative",
  "description": "..."
}
```

#### Get User Drafts
```bash
GET /api/drafts/[wallet]
```

#### Delete Draft
```bash
DELETE /api/drafts/[wallet]?id=draft_id
```

### Marketplace

#### Get Listings
```bash
GET /api/marketplace/listings?active=true&seller=0x...
```

#### Create Listing
```bash
POST /api/marketplace/listings
{
  "listingId": "0",
  "nftContract": "0x...",
  "tokenId": "1",
  "seller": "0x...",
  "price": "100000000000000000"
}
```

### NFT Tracking

#### Record Minted NFT
```bash
POST /api/nfts/minted
{
  "tokenId": "1",
  "contractAddress": "0x...",
  "wallet": "0x...",
  "transactionHash": "0x..."
}
```

## 🎨 Design System

### Colors
- **Primary**: `#00ff41` (Neon Green)
- **Secondary**: `#00ffff` (Neon Cyan)  
- **Accent**: `#ff007f` (Neon Pink)
- **Background**: `#0a0a0a` (Retro Dark)

### Typography
- **Headers**: Press Start 2P (Pixel font)
- **Body**: VT323 (Retro monospace)

### Components
- **Buttons**: `.btn-neon` with glow effects
- **Cards**: `.card-neon` with pixel borders
- **Inputs**: `.input-neon` with focused glow

## 🧪 Testing

### Smart Contract Tests

```bash
forge test -vvv
```

### Frontend Testing

```bash
cd frontend
npm run test  # When implemented
npm run lint
npm run type-check
```

## 📦 Deployment

### Production Deployment

1. **Deploy Contracts**:
   ```bash
   forge script script/Deploy.s.sol --rpc-url arbitrum_sepolia --broadcast --verify
   ```

2. **Update Frontend Config**:
   - Contract addresses are auto-generated in `frontend/lib/contracts.ts`

3. **Deploy Frontend**:
   ```bash
   cd frontend
   npm run build
   npm start
   ```

### Vercel Deployment

```bash
cd frontend
npx vercel --prod
```

### Environment Variables for Production

Set these in your deployment platform:

- `NEXT_PUBLIC_ALCHEMY_API_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_DERIVATIVE_NFT_ADDRESS`
- `NEXT_PUBLIC_MARKETPLACE_ADDRESS`
- `DATABASE_URL` (PostgreSQL for production)
- `PINATA_JWT`

## 🛠️ Development

### Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Home page
│   ├── generate/          # AI generation
│   ├── marketplace/       # NFT marketplace
│   ├── api/              # API routes
│   └── providers.tsx      # Web3 providers
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── WalletConnectButton.tsx
│   ├── NFTCard.tsx
│   └── ...
├── lib/
│   ├── utils.ts          # Helper functions
│   ├── wagmi.ts         # Web3 configuration
│   ├── alchemy.ts       # NFT fetching
│   ├── ai-generation.ts # AI service
│   ├── ipfs.ts         # IPFS integration
│   └── contracts.ts     # Contract ABIs
└── styles/
    └── globals.css       # Global styles
```

### Adding New AI Styles

1. Update `AI_STYLES` in `lib/utils.ts`:
   ```typescript
   { 
     value: 'newstyle', 
     label: 'New Style', 
     prompt: 'Transform using new artistic style...' 
   }
   ```

2. Add corresponding mock image generation in `ai-generation.ts`

### Custom Hooks

Create hooks for common functionality:

```typescript
// hooks/useNFTs.ts
export function useUserNFTs() {
  // NFT fetching logic
}

// hooks/useDrafts.ts  
export function useDrafts() {
  // Draft management logic
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Issues**:
   - Ensure you're on Arbitrum Sepolia testnet
   - Check WalletConnect project ID

2. **Contract Deployment Fails**:
   - Verify you have testnet ETH
   - Check private key format
   - Ensure Arbiscan API key is correct

3. **NFTs Not Loading**:
   - Verify Alchemy API key
   - Check network configuration
   - Try with mock data first

4. **Database Issues**:
   - Run `npx prisma db push`
   - Check DATABASE_URL format
   - Ensure SQLite permissions (dev)

### Debug Mode

Enable debug logging:

```typescript
// Add to next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Add tests for new features
- Update documentation

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Arbitrum Sepolia Explorer**: https://sepolia.arbiscan.io/
- **Documentation**: https://docs.arbitrum.io/
- **Discord**: [Community Link]

## 🙏 Acknowledgments

- **Arbitrum** for the L2 infrastructure
- **OpenZeppelin** for secure smart contracts
- **Rainbow Kit** for wallet integration
- **shadcn/ui** for beautiful components
- **Foundry** for development framework

---

<div align="center">

**Built with 💚 for the future of NFTs**

Made with ⚡ by the Vials team

</div>
