# Vials - AI NFT Derivatives Makefile

.PHONY: help install build test deploy clean dev setup

# Default target
help: ## Show this help message
	@echo "Vials - AI NFT Derivative Generator & Marketplace"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup and Installation
install: ## Install all dependencies
	@echo "🔧 Installing Foundry dependencies..."
	forge install OpenZeppelin/openzeppelin-contracts
	forge install foundry-rs/forge-std
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Installation complete!"

setup: install ## Full project setup including database
	@echo "🏗️  Setting up project..."
	make compile
	make setup-db
	@echo "✅ Setup complete! Run 'make dev' to start development."

# Development
dev: ## Start development server
	@echo "🚀 Starting development server..."
	cd frontend && npm run dev

compile: ## Compile smart contracts
	@echo "🔨 Compiling smart contracts..."
	forge build

test: ## Run smart contract tests
	@echo "🧪 Running tests..."
	forge test -vvv

test-gas: ## Run tests with gas reporting
	@echo "⛽ Running gas tests..."
	forge test --gas-report

# Database
setup-db: ## Setup database and run migrations
	@echo "🗄️  Setting up database..."
	cd frontend && npx prisma generate
	cd frontend && npx prisma db push
	@echo "✅ Database setup complete!"

db-studio: ## Open Prisma Studio
	@echo "🎨 Opening Prisma Studio..."
	cd frontend && npx prisma studio

db-reset: ## Reset database
	@echo "🔄 Resetting database..."
	cd frontend && npx prisma migrate reset --force

# Deployment
deploy-local: ## Deploy contracts to local network
	@echo "🏠 Deploying to local network..."
	forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

deploy-sepolia: ## Deploy contracts to Arbitrum Sepolia
	@echo "🌐 Deploying to Arbitrum Sepolia..."
	@if [ -z "$$PRIVATE_KEY" ]; then echo "❌ PRIVATE_KEY not set"; exit 1; fi
	forge script script/Deploy.s.sol --rpc-url arbitrum_sepolia --broadcast --verify

verify: ## Verify contracts on Arbiscan
	@echo "✅ Verifying contracts..."
	@if [ -z "$$CONTRACT_ADDRESS" ]; then echo "❌ CONTRACT_ADDRESS not set"; exit 1; fi
	forge verify-contract --chain arbitrum-sepolia $$CONTRACT_ADDRESS contracts/DerivativeNFT.sol:DerivativeNFT

# Build and Deploy Frontend
build: ## Build frontend for production
	@echo "🏗️  Building frontend..."
	cd frontend && npm run build

deploy-frontend: build ## Deploy frontend to Vercel
	@echo "🚀 Deploying frontend to Vercel..."
	cd frontend && npx vercel --prod

# Maintenance
clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	forge clean
	cd frontend && rm -rf .next out node_modules/.cache

clean-all: clean ## Clean everything including node_modules
	@echo "🧹 Deep cleaning..."
	cd frontend && rm -rf node_modules
	cd frontend && rm -rf .next out

lint: ## Run linting on frontend
	@echo "🔍 Linting frontend code..."
	cd frontend && npm run lint

format: ## Format code
	@echo "✨ Formatting code..."
	forge fmt
	cd frontend && npx prettier --write .

# Security
security-check: ## Run security checks on contracts
	@echo "🔒 Running security checks..."
	@command -v slither >/dev/null 2>&1 || { echo "❌ Slither not installed. Run: pip install slither-analyzer"; exit 1; }
	slither contracts/

audit: ## Run comprehensive audit
	@echo "🔍 Running comprehensive audit..."
	make security-check
	make test

# Utilities
gas-snapshot: ## Generate gas snapshot
	@echo "⛽ Generating gas snapshot..."
	forge snapshot

coverage: ## Generate test coverage report
	@echo "📊 Generating coverage report..."
	forge coverage

check-env: ## Check environment variables
	@echo "🔍 Checking environment variables..."
	@cd frontend && node -e "console.log('Environment check:'); const required = ['NEXT_PUBLIC_ALCHEMY_API_KEY', 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID']; required.forEach(key => console.log(key + ':', process.env[key] ? '✅' : '❌'));"

# Development helpers
logs: ## Show recent logs (when running locally)
	@echo "📝 Showing logs..."
	cd frontend && npm run logs 2>/dev/null || echo "No logs available"

serve: build ## Serve production build locally
	@echo "🍽️  Serving production build..."
	cd frontend && npm run start

# Docker (optional)
docker-build: ## Build Docker image
	@echo "🐳 Building Docker image..."
	docker build -t vials-frontend ./frontend

docker-run: docker-build ## Run Docker container
	@echo "🐳 Running Docker container..."
	docker run -p 3000:3000 vials-frontend

# Quick commands for development workflow
quick-deploy: compile deploy-sepolia ## Quick deploy to testnet
	@echo "⚡ Quick deployment complete!"

full-setup: clean-all install setup test ## Full clean setup and test
	@echo "🎉 Full setup complete!"

dev-reset: db-reset setup-db ## Reset development environment
	@echo "🔄 Development environment reset!"

# Show project status
status: ## Show project status
	@echo "📊 Project Status:"
	@echo "  Smart Contracts: $(shell forge --version > /dev/null 2>&1 && echo '✅' || echo '❌')"
	@echo "  Frontend Deps:   $(shell cd frontend && npm list > /dev/null 2>&1 && echo '✅' || echo '❌')"
	@echo "  Database:        $(shell cd frontend && npx prisma validate > /dev/null 2>&1 && echo '✅' || echo '❌')"
	@echo "  Build:           $(shell forge build > /dev/null 2>&1 && echo '✅' || echo '❌')"

# Interactive setup
interactive-setup: ## Interactive project setup
	@echo "🎮 Welcome to Vials Interactive Setup!"
	@echo "This will guide you through setting up the project."
	@echo ""
	@read -p "Install dependencies? (y/n): " answer; \
	if [ "$$answer" = "y" ]; then make install; fi
	@read -p "Setup database? (y/n): " answer; \
	if [ "$$answer" = "y" ]; then make setup-db; fi
	@read -p "Run tests? (y/n): " answer; \
	if [ "$$answer" = "y" ]; then make test; fi
	@echo "✅ Interactive setup complete!"
