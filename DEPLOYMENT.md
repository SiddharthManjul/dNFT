# 🚀 Deployment Guide

This guide walks you through deploying the Vials dApp from development to production.

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] Foundry installed and configured
- [ ] Node.js 18+ installed
- [ ] Arbitrum Sepolia testnet ETH
- [ ] Required API keys (see Environment Variables)
- [ ] Git repository access

## 🔧 Environment Variables

### Required for Deployment

Create a `.env` file in the root directory:

```env
# Blockchain Configuration
PRIVATE_KEY=0x1234...                    # Your deployment wallet private key
ARBISCAN_API_KEY=ABC123...               # From https://arbiscan.io/apis

# Frontend Environment Variables  
NEXT_PUBLIC_ALCHEMY_API_KEY=alch_xyz...  # From https://alchemy.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=... # From https://cloud.walletconnect.com

# Database
DATABASE_URL="postgresql://user:pass@host:5432/vials"  # Production PostgreSQL

# IPFS (Optional but recommended)
PINATA_JWT=eyJ...                        # From https://pinata.cloud

# AI Integration (Future use)
OPENAI_API_KEY=sk-...                    # From https://openai.com
```

### Get API Keys

1. **Alchemy API Key**:
   - Visit https://alchemy.com
   - Create account and new app
   - Select "Arbitrum Sepolia" network
   - Copy API key

2. **WalletConnect Project ID**:
   - Visit https://cloud.walletconnect.com
   - Create new project
   - Copy Project ID

3. **Arbiscan API Key**:
   - Visit https://arbiscan.io/apis
   - Create account and generate API key

4. **Pinata JWT** (Optional):
   - Visit https://pinata.cloud
   - Create account and API key
   - Use for production IPFS uploads

## 📦 Step 1: Smart Contract Deployment

### 1.1 Compile Contracts

```bash
# Install dependencies
forge install

# Compile contracts
forge build

# Run tests to ensure everything works
forge test
```

### 1.2 Deploy to Arbitrum Sepolia

```bash
# Deploy contracts
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc \
  --broadcast \
  --verify

# If verification fails, verify manually:
forge verify-contract \
  --chain arbitrum-sepolia \
  --compiler-version v0.8.19 \
  <CONTRACT_ADDRESS> \
  contracts/DerivativeNFT.sol:DerivativeNFT \
  --constructor-args $(cast abi-encode "constructor(string,string)" "Vials Derivative NFT" "VDERIV")
```

### 1.3 Verify Deployment

After deployment, you should see output like:

```
=== Deployment Successful ===
DerivativeNFT deployed to: 0x1234567890123456789012345678901234567890
NFTMarketplace deployed to: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

The script automatically creates `frontend/lib/contracts.ts` with the deployed addresses.

## 🗄️ Step 2: Database Setup

### 2.1 Local Development (SQLite)

```bash
cd frontend
npm install
npx prisma generate
npx prisma db push
```

### 2.2 Production (PostgreSQL)

For production, use a managed PostgreSQL database:

#### Option A: Vercel Postgres

```bash
# Install Vercel CLI
npm i -g vercel

# Create database
vercel postgres create vials-db

# Get connection string
vercel env pull .env.local
```

#### Option B: Railway

```bash
# Visit https://railway.app
# Create new project
# Add PostgreSQL service
# Copy DATABASE_URL
```

#### Option C: Supabase

```bash
# Visit https://supabase.com
# Create new project
# Go to Settings > Database
# Copy connection string
```

Update your `.env`:

```env
DATABASE_URL="postgresql://username:password@host:5432/database"
```

Deploy schema:

```bash
cd frontend
npx prisma db push
```

## 🌐 Step 3: Frontend Deployment

### 3.1 Vercel Deployment (Recommended)

1. **Connect Repository**:
   ```bash
   cd frontend
   npx vercel
   ```

2. **Configure Environment Variables**:
   - Go to Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all variables from your `.env`

3. **Set Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**:
   ```bash
   npx vercel --prod
   ```

### 3.2 Netlify Deployment

1. **Build for Static Export** (if needed):
   ```bash
   # Update next.config.js
   module.exports = {
     output: 'export',
     images: { unoptimized: true }
   }
   
   npm run build
   ```

2. **Deploy**:
   - Drag `out` folder to Netlify
   - Or connect Git repository

### 3.3 Railway Deployment

1. **Create railway.json**:
   ```json
   {
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "cd frontend && npm install && npm run build"
     },
     "deploy": {
       "startCommand": "cd frontend && npm start",
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

2. **Deploy**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway link
   railway up
   ```

## 🔍 Step 4: Verification & Testing

### 4.1 Contract Verification

Check deployed contracts on Arbitrum Sepolia:

- DerivativeNFT: `https://sepolia.arbiscan.io/address/YOUR_DERIVATIVE_ADDRESS`
- Marketplace: `https://sepolia.arbiscan.io/address/YOUR_MARKETPLACE_ADDRESS`

### 4.2 Frontend Testing

1. **Wallet Connection**:
   - Connect MetaMask to Arbitrum Sepolia
   - Ensure testnet ETH available

2. **NFT Fetching**:
   - Check if user NFTs load
   - Verify Alchemy integration

3. **AI Generation**:
   - Test derivative generation
   - Verify draft saving

4. **Marketplace**:
   - Check listing display
   - Test buy/sell flow

### 4.3 Database Testing

```bash
# Check database connection
cd frontend
npx prisma studio

# Run sample queries
npx prisma db seed  # If you have a seed file
```

## 🔒 Step 5: Security & Monitoring

### 5.1 Environment Security

- [ ] Never commit `.env` files
- [ ] Use strong, unique API keys
- [ ] Rotate keys regularly
- [ ] Use read-only keys where possible

### 5.2 Smart Contract Security

- [ ] Verify contracts on Arbiscan
- [ ] Test all functions in testnet
- [ ] Monitor contract events
- [ ] Set up alerts for large transactions

### 5.3 Monitoring Setup

Add monitoring to your frontend:

```typescript
// lib/monitoring.ts
export function trackEvent(event: string, properties?: object) {
  // Add analytics service (PostHog, Mixpanel, etc.)
  if (typeof window !== 'undefined') {
    console.log('Event:', event, properties)
  }
}
```

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Contract Deployment Fails**:
   ```bash
   # Check gas price
   cast gas-price --rpc-url https://sepolia-rollup.arbitrum.io/rpc
   
   # Check balance
   cast balance YOUR_ADDRESS --rpc-url https://sepolia-rollup.arbitrum.io/rpc
   ```

2. **Verification Fails**:
   ```bash
   # Check contract code
   cast code CONTRACT_ADDRESS --rpc-url https://sepolia-rollup.arbitrum.io/rpc
   
   # Manual verification
   forge verify-contract --help
   ```

3. **Frontend Build Fails**:
   ```bash
   # Clear cache
   rm -rf .next node_modules
   npm install
   npm run build
   ```

4. **Database Connection Issues**:
   ```bash
   # Test connection
   npx prisma db pull
   
   # Reset if needed
   npx prisma migrate reset
   ```

### Environment-Specific Issues

#### Vercel
- Ensure all environment variables are set
- Check function timeouts (max 10s on hobby plan)
- Verify Node.js version compatibility

#### Railway
- Monitor build logs for errors
- Check memory limits
- Ensure PORT environment variable is set

#### Netlify
- Use `npm run export` for static builds
- Check redirects for client-side routing
- Verify environment variables in Netlify dashboard

## 📊 Post-Deployment Checklist

- [ ] Smart contracts deployed and verified
- [ ] Frontend accessible at production URL
- [ ] Database connected and working
- [ ] Wallet connection functional
- [ ] NFT fetching working
- [ ] AI generation working
- [ ] Draft system working
- [ ] Marketplace functional
- [ ] All environment variables set
- [ ] Monitoring/analytics set up
- [ ] Error tracking configured
- [ ] Documentation updated

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1
      - name: Deploy contracts
        run: |
          forge script script/Deploy.s.sol --rpc-url ${{ secrets.RPC_URL }} --broadcast
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-contracts
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review logs for specific error messages
3. Verify all environment variables are correct
4. Test each component individually
5. Join our Discord for community support

## 🎉 Success!

Once deployed, your Vials dApp should be live and functional. Users can:

- ✅ Connect wallets to Arbitrum Sepolia
- ✅ View their NFT collections
- ✅ Generate AI derivatives
- ✅ Save drafts for later
- ✅ Mint derivatives as NFTs
- ✅ List and buy NFTs on the marketplace

Congratulations on deploying your AI-powered NFT derivative marketplace! 🚀
