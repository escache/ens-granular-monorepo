# CLI Toolkit Documentation

Command-line interface for ENS domain management with granular delegation capabilities, factory operations, and comprehensive domain administration.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Commands](#commands)
5. [Examples](#examples)
6. [Troubleshooting](#troubleshooting)
7. [Development](#development)

## Overview

The CLI toolkit provides a comprehensive command-line interface for managing ENS domains with granular permissions, delegation controls, and factory-based project management.

**Key Features:**
- Factory-based project management
- Granular permission delegation
- Batch operations support
- Interactive confirmation dialogs
- Comprehensive error handling
- TypeScript-based implementation

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

```bash
# Navigate to CLI directory
cd packages/cli

# Install dependencies
npm install

# Build the project
npm run build

# Set up environment
cp .env.example .env
# Edit .env with your configuration
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Network Configuration
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
CHAIN_ID=1

# Wallet Configuration
PRIVATE_KEY=your_private_key_here

# Contract Addresses
FACTORY_ADDRESS=0x...
DELEGATE_ADDRESS=0x...

# Optional Settings
GAS_LIMIT=500000
GAS_PRICE=20000000000
```

### Configuration Files

The CLI uses the following configuration files:

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.env` - Environment variables
- `.gitignore` - Git ignore rules
- `README.md` - Documentation

## Commands

### Factory Commands

Manage factory contracts and project deployments.

```bash
# Create a new delegate for a project
ens-delegate factory create <project>

# Get delegate address for a project
ens-delegate factory get <project>

# List all deployed delegates
ens-delegate factory list
```

### Delegation Commands

Manage domain delegations and permissions.

```bash
# Set delegation for a domain
ens-delegate delegate set <domain> --primary <addr> --secondary <addr>

# Get current delegation
ens-delegate delegate get <domain>

# Revoke delegation
ens-delegate delegate revoke <domain>

# Check delegation permissions
ens-delegate delegate check <domain> <address>

# Create subdomain
ens-delegate delegate create-subdomain <parent> <label> --owner <addr>
```

### Granular Commands

Manage fine-grained permissions and access controls.

```bash
# Add granular permissions
ens-delegate granular add <domain> <delegate> --operations <mask>

# Remove granular permissions
ens-delegate granular remove <domain> <delegate>

# Lock permissions
ens-delegate granular lock <domain> <delegate>

# Unlock permissions
ens-delegate granular unlock <domain> <delegate>

# Enable permissions
ens-delegate granular enable <domain> <delegate>

# Disable permissions
ens-delegate granular disable <domain> <delegate>

# List permissions
ens-delegate granular list <domain>

# Manage whitelist
ens-delegate granular whitelist <domain> <action> [address]

# Manage blacklist
ens-delegate granular blacklist <domain> <action> [address]
```

### Approval Commands

Manage contract approvals and permissions.

```bash
# Set approval for delegate
ens-delegate approve set-approval <delegate>

# Check approval status
ens-delegate approve check <delegate>
```

### Utility Commands

Helper functions and utilities.

```bash
# Calculate namehash
ens-delegate utils namehash <domain>

# Normalize domain name
ens-delegate utils normalize <domain>

# List available operations
ens-delegate utils operations
```

## Examples

### Basic Workflow

```bash
# 1. Create a new project delegate
ens-delegate factory create myproject

# 2. Set approval for the delegate
ens-delegate approve set-approval 0x123...

# 3. Set delegation for a domain
ens-delegate delegate set example.eth --primary 0x456... --secondary 0x789...

# 4. Create a subdomain
ens-delegate delegate create-subdomain example.eth app --owner 0x456...
```

### Granular Permissions

```bash
# Add specific permissions
ens-delegate granular add example.eth 0x456... --operations 0x0F

# Check permissions
ens-delegate delegate check example.eth 0x456...

# List all permissions
ens-delegate granular list example.eth
```

### Batch Operations

```bash
# Create multiple subdomains
ens-delegate delegate create-subdomain example.eth api --owner 0x456...
ens-delegate delegate create-subdomain example.eth app --owner 0x456...
ens-delegate delegate create-subdomain example.eth docs --owner 0x456...
```

## Troubleshooting

### Common Issues

**Error: "Caller is not authorized"**
- Check if you have proper approvals set
- Verify delegate permissions
- Ensure contract addresses are correct

**Error: "Insufficient gas"**
- Increase gas limit in configuration
- Check network congestion
- Verify gas price settings

**Error: "Contract not found"**
- Verify contract addresses in configuration
- Check network connectivity
- Ensure contracts are deployed

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
export DEBUG=true

# Run command with debug output
ens-delegate delegate set example.eth --primary 0x123...
```

### Getting Help

```bash
# Show help for specific command
ens-delegate delegate --help

# Show help for specific subcommand
ens-delegate delegate set --help

# Show version information
ens-delegate --version
```

## Development

### Project Structure

```
cli/
├── src/
│   ├── index.ts              # Main entry point
│   ├── config.ts             # Configuration management
│   ├── abis.ts               # Contract ABIs
│   ├── commands/             # Command implementations
│   │   ├── factory.ts        # Factory operations
│   │   ├── delegate.ts        # Delegation management
│   │   ├── granular.ts       # Granular permissions
│   │   ├── approve.ts         # Approval workflow
│   │   └── utils.ts           # Utility functions
│   └── utils/                # Helper utilities
│       └── helpers.ts         # Common utilities
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── .env.example              # Environment template
└── README.md                 # Documentation
```

### Adding New Commands

1. Create command file in `src/commands/`
2. Implement command logic
3. Add to main CLI in `src/index.ts`
4. Update documentation
5. Add tests

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Building

```bash
# Build for production
npm run build

# Build for development
npm run build:dev

# Watch mode for development
npm run build:watch
```

## Status

**Completed Features:**
- CLI structure and scaffolding
- Command definitions
- Approval workflow
- Utility functions
- Validation functions
- Output formatting
- Error handling patterns

**In Progress:**
- Full factory operations
- Complete delegation management
- Granular permission handling
- Interactive confirmation dialogs

**Pending:**
- Batch operations
- Configuration profiles
- Advanced error recovery
- Performance optimizations

## Commands Available

### Factory Commands
```bash
ens-delegate factory create <project>
ens-delegate factory get <project>
ens-delegate factory list
```

### Delegation Commands
```bash
ens-delegate delegate set <domain> --primary <addr> --secondary <addr>
ens-delegate delegate get <domain>
ens-delegate delegate revoke <domain>
ens-delegate delegate check <domain> <address>
ens-delegate delegate create-subdomain <parent> <label> --owner <addr>
```

### Granular Commands
```bash
ens-delegate granular add <domain> <delegate> --operations <mask>
ens-delegate granular remove <domain> <delegate>
ens-delegate granular lock <domain> <delegate>
ens-delegate granular unlock <domain> <delegate>
ens-delegate granular enable <domain> <delegate>
ens-delegate granular disable <domain> <delegate>
ens-delegate granular list <domain>
ens-delegate granular whitelist <domain> <action> [address]
ens-delegate granular blacklist <domain> <action> [address]
```

### Approval Commands (CRITICAL)
```bash
ens-delegate approve set-approval <delegate>
ens-delegate approve check <delegate>
```

### Utility Commands
```bash
ens-delegate utils namehash <domain>
ens-delegate utils normalize <domain>
ens-delegate utils operations
```

## Key Features Implemented

### Foundation Complete
- Command structure
- Configuration management
- Contract ABIs
- Helper utilities
- Output formatting
- Error handling structure

### Approval Workflow (Critical!)
- Set approval for delegate contracts
- Check approval status
- Validation and prompts

### Utilities
- Transaction waiting
- Address validation
- Domain validation
- Display helpers
- Format helpers

### Needs Implementation
- Full factory operations
- Full delegation operations
- Full granular operations
- Interactive prompts
- Batch operations
- Configuration profiles

## What's Working

- CLI structure and scaffolding
- Command definitions
- Approval workflow
- Utility functions
- Validation functions
- Output formatting
- Error handling patterns

## What Needs Completion

- Actual contract interaction implementations
- Event parsing for factory creation
- Full delegation management
- Granular permission handling
- Interactive confirmation dialogs
- Configuration file management

## How to Use

```bash
# 1. Install dependencies
cd cli
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Build
npm run build

# 4. Use CLI
npm start -- delegate set example.eth --primary 0x...
```

## Dependencies

- **commander** - CLI framework
- **viem** - Ethereum client
- **chalk** - Colored output
- **ora** - Spinners
- **inquirer** - Interactive prompts
- **dotenv** - Environment variables

## Status

**Structure**: Complete
**Core Features**: Partial (patterns ready)
**Advanced Features**: Not started

The CLI toolkit is structured and ready for implementation. The critical approval workflow is complete, and all command patterns are established.


