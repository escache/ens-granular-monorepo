# Quick Start

Get up and running with ENS Granular in minutes! This guide will walk you through the essential setup and basic usage.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Package manager
- **Git** - Version control
- **Ethereum wallet** - For blockchain interactions

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ens-granular-monorepo.git
cd ens-granular-monorepo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Ethereum RPC URL
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Private key for transactions (keep secure!)
PRIVATE_KEY=your_private_key_here

# ENS Registry address
ENS_REGISTRY=0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e

# NameWrapper address
NAME_WRAPPER=0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401
```

## Basic Usage

### 1. Start Development Server

```bash
npm run dev
```

### 2. CLI Commands

The CLI provides powerful domain management capabilities:

```bash
# Set delegation for a domain
npm run cli -- delegate set example.eth --primary 0x123... --secondary 0x456...

# Create a subdomain via delegate
npm run cli -- delegate create-subdomain example.eth subdomain --owner 0x789...

# Check delegation status
npm run cli -- delegate status example.eth

# Revoke delegation
npm run cli -- delegate revoke example.eth
```

### 3. TypeScript SDK

Use the SDK programmatically:

```typescript
import { createNamingDelegateClient } from '@ens-granular/sdk';

const delegate = createNamingDelegateClient('0x...');

// Set delegation
await delegate.setDelegation({
  parentName: 'example.eth',
  primaryDelegate: '0x123...',
  secondaryDelegate: '0x456...',
});

// Create subdomain
await delegate.createSubdomain({
  parentName: 'example.eth',
  label: 'subdomain',
  owner: '0x789...',
});
```

## Common Use Cases

### Project Ecosystem Management

A project registers `project.eth` and needs to create many subdomains:

```bash
# Delegate naming to a designated multisig
npm run cli -- delegate set project.eth --primary 0x123... --secondary 0x456...

# Multisig can now create subdomains
npm run cli -- delegate create-subdomain project.eth app --owner 0x789...
npm run cli -- delegate create-subdomain project.eth api --owner 0x789...
```

### DAO Operations

A DAO owns `dao.eth` and wants to delegate naming to a governance module:

```bash
# Delegate to governance module
npm run cli -- delegate set dao.eth --primary 0xgovernance... --expires 1735689600

# Governance can create member subdomains
npm run cli -- delegate create-subdomain dao.eth member1 --owner 0xmember1...
```

### Service Provider Setup

A hosting provider manages multiple client domains:

```bash
# Client delegates naming to provider
npm run cli -- delegate set client.eth --primary 0xprovider... --secondary 0xbackup...

# Provider creates subdomains as needed
npm run cli -- delegate create-subdomain client.eth www --owner 0xclient...
```

## Granular Permissions

For advanced use cases, use granular permissions:

```bash
# Add delegate with specific permissions
npm run cli -- granular add example.eth 0x123... --operations 1 --expires 1735689600

# Lock critical delegate
npm run cli -- granular lock example.eth 0x123...

# List all delegates
npm run cli -- granular list example.eth
```

### Permission Operations

The system supports these operation types:

- **OP_CREATE_SUBDOMAIN (1)**: Create and manage subdomains
- **OP_SET_RECORDS (2)**: Set resolver records
- **OP_TRANSFER (4)**: Transfer subdomain ownership
- **OP_SET_FUSES (8)**: Configure NameWrapper fuses

## Next Steps

Now that you're up and running, explore these areas:

1. **[Architecture Overview](architecture/overview)** - Understand the system design
2. **[Delegation System Guide](guides/delegation-system)** - Deep dive into delegation
3. **[API Reference](api/cli-commands)** - Complete API documentation
4. **[Examples](examples/complete-delegation-tree)** - Practical examples

## Troubleshooting

### Common Issues

**"Insufficient funds" error:**
- Ensure your wallet has enough ETH for gas fees
- Check the current gas prices

**"Contract not found" error:**
- Verify the contract addresses in your `.env` file
- Ensure you're connected to the correct network

**"Permission denied" error:**
- Check that you're the owner of the domain
- Verify the delegation is set correctly

### Getting Help

- **Documentation**: Browse our comprehensive guides
- **GitHub Issues**: Report bugs or request features
- **Discussions**: Join community discussions

---

*Ready to build with ENS Granular? Let's go!*