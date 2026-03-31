# Introduction

Welcome to ENS Granular, a comprehensive toolkit for managing ENS domains with fine-grained delegation capabilities. This system extends the Ethereum Name Service (ENS) with powerful permission management features that enable secure, scalable domain operations.

## What is ENS Granular?

ENS Granular is a factory-based delegation system that allows domain owners to grant specific permissions to other addresses without transferring full ownership. Unlike traditional ENS operations that require the domain owner for every action, ENS Granular enables:

- **Granular Permissions**: Grant specific operation rights (create subdomains, set records, etc.)
- **Multiple Delegates**: Assign different permissions to different addresses
- **Time-Limited Access**: Set expiration dates for delegations
- **Project Isolation**: Each project gets its own isolated delegate contract
- **Enterprise Features**: Whitelist/blacklist, lock/unlock, and audit logging

## Key Benefits

### Security Through Separation
Instead of giving full control to a single address, you can distribute specific permissions:

```typescript
// Example: DAO delegation
await delegate.setDelegation({
  parentName: 'dao.eth',
  primaryDelegate: '0xGovernanceModule',    // Can create subdomains
  secondaryDelegate: '0xBackupMultisig',    // Backup for emergencies
});

// Grant specific permissions
await granularDelegate.addDelegate({
  parentName: 'dao.eth',
  delegate: '0xMarketingTeam',
  operations: OP_SET_TEXT_RECORD,          // Can only update social links
  expires: 1735689600                      // Expires in 1 year
});
```

### Enterprise-Ready Operations
Large organizations can define internal roles and responsibilities:

- **Treasury Team**: Manages ETH address records
- **Marketing Team**: Updates social media links
- **Infrastructure Team**: Manages content hashes and subdomains
- **Security Team**: Has emergency override capabilities

### Scalable Project Management
The factory pattern enables unlimited project creation with isolated permissions:

```bash
# Create delegate contract for new project
ens-delegate factory create newproject.eth

# Delegate operations to project team
ens-delegate delegate set newproject.eth --primary 0xProjectTeam
```

## How It Works

### Architecture Overview

ENS Granular uses a factory-based architecture with three main components:

1. **Factory Contract**: Deploys isolated delegate contracts for each project
2. **Delegate Contracts**: Handle specific delegation logic and permissions
3. **CLI & SDK**: Provide easy-to-use interfaces for all operations

### Permission Model

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

### Operation Types

The system supports four main operation types:

- **OP_CREATE_SUBDOMAIN (1)**: Create and manage subdomains
- **OP_SET_RECORDS (2)**: Set resolver records (address, text, contenthash)
- **OP_TRANSFER (4)**: Transfer subdomain ownership
- **OP_SET_FUSES (8)**: Configure NameWrapper fuses

## Use Cases

### DAO Management
Large DAOs can delegate naming operations to governance modules while maintaining security:

```bash
# Delegate to governance module
ens-delegate delegate set dao.eth --primary 0xGovernanceModule

# Governance can create member subdomains
ens-delegate delegate create-subdomain dao.eth member1 --owner 0xMember1
```

### Startup Operations
Startups can separate naming operations from record management:

```bash
# Delegate subdomain creation to dev team
ens-delegate granular add startup.eth 0xDevTeam --operations 1

# Delegate record management to marketing team
ens-delegate granular add startup.eth 0xMarketingTeam --operations 2
```

### Service Provider Setup
Hosting providers can manage multiple client domains with isolated permissions:

```bash
# Client delegates naming to provider
ens-delegate delegate set client.eth --primary 0xProvider

# Provider creates subdomains as needed
ens-delegate delegate create-subdomain client.eth www --owner 0xClient
```

## Getting Started

Ready to start using ENS Granular? Here's what you need to do:

1. **[Installation](installation)** - Set up your development environment
2. **[Quick Start](quickstart)** - Get up and running in minutes
3. **[Architecture Overview](architecture/overview)** - Understand the system design
4. **[CLI Commands](api/cli-commands)** - Learn the command-line interface

## Security Considerations

ENS Granular is designed with security as a top priority:

- **Isolation**: Each project gets its own isolated delegate contract
- **Least Privilege**: Grant only the minimum required permissions
- **Audit Logging**: Complete operation tracking and security monitoring
- **Reentrancy Protection**: Guard against common attack vectors
- **Expiration Support**: Automatic revocation of time-limited delegations

## Community and Support

- **Documentation**: Comprehensive guides and API reference
- **GitHub**: Source code and issue tracking
- **Discussions**: Community support and feature requests
- **Discord**: Real-time support (coming soon)

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/ens-granular/ens-granular-monorepo/blob/main/LICENSE) file for details.

---

*Ready to revolutionize your ENS domain management? Let's get started!*