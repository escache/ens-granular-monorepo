# Architecture Overview

The ENS Granular system follows a factory-based architecture pattern that enables isolated project management while maintaining security and scalability.

## System Architecture

The core architecture consists of several key components:

```
┌─────────────────────────────────────────────────────────────┐
│                    ENS Granular System                      │
├─────────────────────────────────────────────────────────────┤
│  Factory Contract (Global)                                 │
│  ├── Project A Delegate Contract                           │
│  ├── Project B Delegate Contract                          │
│  └── Project C Delegate Contract                          │
├─────────────────────────────────────────────────────────────┤
│  CLI Tools & SDK                                           │
│  ├── Command Line Interface                                │
│  ├── TypeScript SDK                                        │
│  └── Permission Service                                    │
├─────────────────────────────────────────────────────────────┤
│  Marketplace Integration                                   │
│  ├── OpenSea Seaport Protocol                             │
│  └── Domain Trading                                        │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Factory Contract

The factory contract serves as the global registry and deployment mechanism:

- **Project Isolation**: Each project gets its own delegate contract
- **Security**: Issues in one project don't affect others
- **Scalability**: Unlimited project creation
- **Maintainability**: Independent contract management

### 2. Delegate Contracts

Individual delegate contracts handle specific project permissions:

- **Granular Permissions**: Fine-grained control over operations
- **Primary/Secondary Delegates**: Redundancy and key recovery
- **Expiration Support**: Time-limited delegations
- **ENSIP-19 Compliance**: Standardized metadata handling

### 3. CLI Tools & SDK

Developer tools for interaction:

- **Command Line Interface**: Direct domain management
- **TypeScript SDK**: Programmatic access
- **Permission Service**: Permission management
- **Delegation Planner**: Planning and optimization

## Design Principles

### Security First

- **Isolation**: Each project is completely isolated
- **Least Privilege**: Minimal required permissions
- **Audit Logging**: Complete operation tracking
- **Reentrancy Protection**: Guard against attacks

### Scalability

- **Factory Pattern**: Unlimited project creation
- **Gas Optimization**: Efficient contract design
- **Batch Operations**: Multi-domain management
- **Cross-Chain Support**: Multi-network resolution

### Maintainability

- **Modular Design**: Clear separation of concerns
- **Standard Interfaces**: Consistent API design
- **Comprehensive Testing**: Full test coverage
- **Documentation**: Complete system documentation

## Permission Model

The system implements a hierarchical permission model:

```
Domain Owner
├── Full Control
│   ├── Transfer Ownership
│   ├── Set Resolver
│   ├── Modify Records
│   └── Delegate Permissions
└── Delegated Operations
    ├── Create Subdomains
    ├── Set Subdomain Owner
    ├── Configure Subdomain Resolver
    └── Set Subdomain TTL
```

### Permission Levels

1. **Owner**: Full control over the domain
2. **Primary Delegate**: Naming operations only
3. **Secondary Delegate**: Backup for redundancy
4. **Account Delegate**: All domains for an account

## Security Considerations

### What Delegates CAN Do

- Create subdomains under the parent name
- Set subdomain owner, resolver, TTL
- Configure fuses for wrapped subdomains

### What Delegates CANNOT Do

- Modify resolver records (address, text, contenthash)
- Change parent domain resolver
- Transfer parent domain ownership
- Modify parent domain fuses
- Unwrap wrapped names
- Set approvals

### Additional Protections

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency stops
- **Expiration Timestamps**: Automatic revocation
- **Owner Override**: Always revocable by owner

## Integration Points

### ENS Registry

- **Standard ENS**: Full compatibility
- **NameWrapper**: Wrapped name support
- **Resolver**: Record management

### Marketplace

- **OpenSea Seaport**: Trading protocol
- **Metadata**: ENSIP-19 compliance
- **Verification**: Domain verification

### External Services

- **RPC Providers**: Blockchain interaction
- **IPFS**: Metadata storage
- **Analytics**: Usage tracking

## Deployment Strategy

### Development

- **Local Testing**: Hardhat/Foundry
- **Test Networks**: Goerli, Sepolia
- **Integration Tests**: Full system testing

### Production

- **Mainnet Deployment**: Live system
- **Verification**: Contract verification
- **Monitoring**: System monitoring
- **Updates**: Upgrade mechanisms

## Future Enhancements

### Planned Features

- **Multi-Signature Support**: Enhanced security
- **Time-Locked Operations**: Delayed execution
- **Cross-Chain Bridges**: Multi-network support
- **Advanced Analytics**: Usage insights

### Research Areas

- **Zero-Knowledge Proofs**: Privacy enhancements
- **Layer 2 Integration**: Scaling solutions
- **AI-Powered Management**: Automated operations
- **Decentralized Governance**: Community control

## Getting Started

Ready to explore the architecture in detail?

1. **[Factory Design](./factory-design)** - Deep dive into the factory pattern
2. **[Granular Permissions](../guides/ens-permissions-guide)** - Permission system details
3. **[Delegation Hierarchy](../guides/ens-permissions-guide)** - Delegation structure
4. **[Security Model](./final-architecture)** - Security considerations

---

*This architecture provides a robust foundation for ENS domain management with granular permissions and delegation controls.*
