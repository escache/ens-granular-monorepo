
# ENS Granular Monorepo

A comprehensive toolkit for ENS domain management with granular delegation capabilities, factory-based architecture, and marketplace integration.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Documentation](#documentation)
6. [Project Structure](#project-structure)
7. [Development](#development)
8. [Contributing](#contributing)
9. [License](#license)

## Overview

The ENS Granular Monorepo provides a complete solution for managing ENS domains with fine-grained permissions, delegation controls, and marketplace integration. Built with a factory pattern architecture, it enables isolated project management while maintaining security and scalability.

**Key Capabilities:**
- Granular permission delegation for ENS domains
- Factory-based contract deployment for project isolation
- ENSIP-19 compliance for standardized metadata
- OpenSea Seaport integration for marketplace functionality
- Command-line tools for domain management
- TypeScript SDK for programmatic access

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ens-granular-monorepo.git
cd ens-granular-monorepo

# Install dependencies
npm install

# Build the project
npm run build
```

### Basic Usage

```bash
# Start development server
npm run dev

# Run CLI commands
npm run cli -- delegate set example.eth --primary 0x123...
```

## Features

### Core Features

- **Granular Permissions** - Fine-grained delegation control with individual operation permissions
- **Factory Pattern** - Isolated project contracts for security and scalability
- **ENSIP-19 Compliance** - Full ENSIP-19 specification support for standardized metadata
- **Marketplace Integration** - OpenSea Seaport protocol support for domain trading
- **CLI Tools** - Command-line interface for domain management operations
- **TypeScript SDK** - Programmatic access with full type safety

### Advanced Features

- **Audit Logging** - Complete operation tracking and security monitoring
- **Batch Operations** - Efficient multi-domain management
- **Cross-Chain Support** - Multi-network domain resolution
- **Metadata Management** - Structured domain metadata with validation
- **Permission Hierarchies** - Complex delegation structures with inheritance

## Architecture

The system follows a factory-based architecture pattern:

```
Factory Contract (Global)
├── Project A Delegate Contract
├── Project B Delegate Contract
└── Project C Delegate Contract
```

Each project gets its own isolated delegate contract, ensuring:
- **Security**: Issues in one project don't affect others
- **Scalability**: Unlimited project creation
- **Isolation**: Clear permission boundaries
- **Maintainability**: Independent contract management

## Documentation

Comprehensive documentation is organized by category:

### Architecture
- [Final Architecture](docs/architecture/FINAL-ARCHITECTURE.md) - Complete factory-based ENS naming delegation architecture
- [Granular Permissions](docs/architecture/GRANULAR-PERMISSIONS.md) - Fine-grained individual permissions system
- [Factory Design](docs/architecture/FACTORY-DESIGN.md) - Factory pattern implementation

### Implementation
- [ENSIP-19 Implementation](docs/implementation/ENSIP19-IMPLEMENTATION.md) - ENSIP-19 compliance implementation
- [Implementation Summary](docs/implementation/IMPLEMENTATION-SUMMARY.md) - Audit log & user configuration system
- [Integration Complete](docs/implementation/INTEGRATION-COMPLETE.md) - System integration status

### Guides
- [Delegation System Documentation](docs/guides/DELEGATION-SYSTEM-DOCUMENTATION.md) - Complete delegation system guide
- [ENS Permissions Guide](docs/guides/ENS-PERMISSIONS-GUIDE.md) - ENS permissions management
- [ENSIP-19 Quickstart](docs/guides/ENSIP19-QUICKSTART.md) - Quick start guide for ENSIP-19

### API Documentation
- [CLI Summary](docs/api/CLI-SUMMARY.md) - Command-line interface documentation
- [ENS Marketplace Documentation](docs/api/ENS-MARKETPLACE-DOCUMENTATION.md) - Marketplace API

### Deployment
- [Production Setup](docs/deployment/PRODUCTION-SETUP.md) - Production environment setup
- [Production Seaport Implementation](docs/deployment/PRODUCTION-SEAPORT-IMPLEMENTATION.md) - Seaport integration

See the [Documentation Index](docs/README.md) for a complete overview.

## Project Structure

```
├── docs/                           # Organized documentation
│   ├── architecture/              # System design documents
│   ├── implementation/            # Technical implementation details
│   ├── guides/                    # User guides and tutorials
│   ├── api/                       # API and integration docs
│   ├── deployment/                # Production setup guides
│   ├── comparisons/               # Feature comparisons
│   └── examples/                  # Code examples
├── packages/                      # Monorepo packages
│   ├── cli/                       # Command-line interface
│   │   ├── src/                   # CLI source code
│   │   ├── commands/              # CLI commands
│   │   └── utils/                 # CLI utilities
│   └── contracts/                 # Smart contracts
│       ├── ENSNamingDelegate.sol # Core delegate contract
│       ├── ENSNamingDelegateFactory.sol # Factory contract
│       └── deploy/                # Deployment scripts
└── src/                          # Shared source code
    ├── lib/                       # Library functions
    └── services/                  # Service implementations
```

## Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run tests
npm test

# Start development server
npm run dev
```

### Available Scripts

- `npm run build` - Build all packages
- `npm run test` - Run test suite
- `npm run lint` - Run linter
- `npm run dev` - Start development server
- `npm run cli` - Run CLI commands

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Write tests for new features
- Update documentation for changes
- Follow the established code style

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/ens-granular-monorepo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/ens-granular-monorepo/discussions)

## Acknowledgments

- ENS Domains team for the original ENS protocol
- OpenSea for Seaport protocol integration
- The Ethereum community for continued support
  