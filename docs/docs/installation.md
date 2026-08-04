# Installation

This guide will walk you through installing and setting up the ENS Granular monorepo for development and production use.

## Prerequisites

Before installing ENS Granular, ensure you have the following:

### Required Software

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **npm 9+** or **yarn 1.22+** - Package manager
- **Git** - Version control system
- **Ethereum Wallet** - For blockchain interactions

### Development Tools (Optional)

- **VS Code** - Recommended editor
- **Hardhat** - For smart contract development
- **Foundry** - Alternative smart contract framework

## Installation Methods

### Method 1: Clone from GitHub (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/ens-granular-monorepo.git
cd ens-granular-monorepo

# Install dependencies
npm install

# Build the project
npm run build
```

### Method 2: npm/yarn (Coming Soon)

```bash
# Install globally
npm install -g @ens-granular/cli

# Or install locally
npm install @ens-granular/sdk
```

## Environment Setup

### 1. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Ethereum RPC Configuration
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
RPC_URL_GOERLI=https://goerli.infura.io/v3/YOUR_PROJECT_ID
RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Wallet Configuration
PRIVATE_KEY=your_private_key_here
# OR use a mnemonic
MNEMONIC="your twelve word mnemonic phrase here"

# Contract Addresses
ENS_REGISTRY=0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
NAME_WRAPPER=0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401

# Factory Contract (deploy or use existing)
FACTORY_ADDRESS=0x...

# Gas Configuration
GAS_LIMIT=500000
GAS_PRICE=20000000000

# IPFS Configuration (optional)
IPFS_GATEWAY=https://ipfs.io/ipfs/
IPFS_API_URL=https://ipfs.infura.io:5001

# Analytics (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 3. Network Configuration

The system supports multiple networks:

```env
# Mainnet (Production)
NETWORK=mainnet
CHAIN_ID=1

# Test Networks
NETWORK=goerli
CHAIN_ID=5

NETWORK=sepolia
CHAIN_ID=11155111

# Local Development
NETWORK=localhost
CHAIN_ID=31337
```

## Development Setup

### 1. Install Development Dependencies

```bash
# Install all dependencies
npm install

# Install development tools
npm install -D hardhat foundry
```

### 2. Set Up Smart Contracts

```bash
# Navigate to contracts directory
cd packages/contracts

# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test
```

### 3. Set Up CLI Development

```bash
# Navigate to CLI directory
cd packages/cli

# Install dependencies
npm install

# Build CLI
npm run build

# Test CLI
npm run dev -- --help
```

## Production Setup

### 1. Environment Configuration

For production deployment:

```env
# Use production RPC endpoints
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Use secure key management
# Never use private keys in production
# Use hardware wallets or key management services

# Enable production features
NODE_ENV=production
ENABLE_ANALYTICS=true
ENABLE_MONITORING=true
```

### 2. Security Considerations

- **Never commit private keys** to version control
- **Use environment variables** for sensitive data
- **Enable 2FA** on all accounts
- **Use hardware wallets** for production
- **Regular security audits** of smart contracts

### 3. Monitoring Setup

```env
# Enable monitoring
ENABLE_MONITORING=true
MONITORING_ENDPOINT=https://your-monitoring-service.com

# Error tracking
SENTRY_DSN=your_sentry_dsn_here

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## Verification

### 1. Test Installation

```bash
# Test CLI installation
npm run cli -- --version

# Test SDK installation
node -e "console.log(require('@ens-granular/sdk').version)"

# Test contract compilation
cd packages/contracts && forge build
```

### 2. Run Test Suite

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### 3. Verify Network Connection

```bash
# Test network connection
npm run cli -- config test-connection

# Check contract addresses
npm run cli -- config verify-addresses
```

## Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**"Insufficient funds" errors:**
- Ensure your wallet has enough ETH for gas fees
- Check current gas prices on [ETH Gas Station](https://ethgasstation.info/)

**"Contract not found" errors:**
- Verify contract addresses in `.env` file
- Ensure you're connected to the correct network
- Check if contracts are deployed

**"Permission denied" errors:**
- Verify you own the domain
- Check delegation settings
- Ensure correct wallet is connected

### Getting Help

- **Documentation**: Check our comprehensive guides
- **GitHub Issues**: Report bugs or request features
- **Discussions**: Join community discussions
- **Discord**: Real-time support (coming soon)

## Next Steps

Now that you have ENS Granular installed:

1. **[Quick Start Guide](quickstart)** - Get up and running quickly
2. **[Architecture Overview](architecture/overview)** - Understand the system
3. **[CLI Commands](api/cli-summary)** - Learn the command-line interface
4. **TypeScript SDK** - Programmatic access (documentation coming soon)

---

*Ready to start building with ENS Granular? Let's go!*