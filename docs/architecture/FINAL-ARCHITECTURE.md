# Final Architecture: Factory-Based ENS Naming Delegation

Complete factory-based architecture for ENS naming delegation with project isolation, security, and scalability.

## Table of Contents

1. [Overview](#overview)
2. [System Components](#system-components)
3. [Architecture Flow](#architecture-flow)
4. [User Journey](#user-journey)
5. [Security Model](#security-model)
6. [Factory Benefits](#factory-benefits)
7. [Gas Costs](#gas-costs)
8. [Use Cases](#use-cases)
9. [Files Created](#files-created)
10. [Deployment Steps](#deployment-steps)
11. [Summary](#summary)

## Overview

This document describes the complete factory-based architecture for ENS naming delegation, designed to provide project isolation, security, and scalability while maintaining ease of use.

## System Components

### 1. ENSNamingDelegate (Implementation)

The core delegate contract that manages naming permissions for individual projects.

**Key Features:**
- Core delegate contract logic
- Manages naming permissions
- Compatible with NameWrapper
- Requires one-time approval
- Isolated per project

**Responsibilities:**
- Handle subdomain creation requests
- Manage delegation permissions
- Enforce security constraints
- Track operation history

### 2. ENSNamingDelegateFactory (Factory)

The factory contract that deploys and manages individual delegate contracts.

**Key Features:**
- Deploys delegate contracts per project
- Tracks all deployments
- Isolates projects from each other
- Provides project management interface

**Responsibilities:**
- Create new delegate contracts
- Track project deployments
- Manage factory-level permissions
- Provide deployment history

### 3. TypeScript Clients

Client libraries for interacting with the contracts programmatically.

**ENSNamingDelegateClient:**
- Interact with delegate contracts
- Manage delegations
- Create subdomains
- Check permissions

**ENSDelegateFactoryClient:**
- Create and manage delegates
- Deploy new projects
- Track factory operations
- Manage project lifecycle

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Factory Contract                          │
│              (Deployed Once - Global)                        │
└────────────────────────┬──────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                 │                │
        ▼                 ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Project A  │  │   Project B  │  │   Project C  │
│   Delegate   │  │   Delegate   │  │   Delegate   │
│   0xABC...   │  │   0xDEF...   │  │   0xGHI...   │
└──────────────┘  └──────────────┘  └──────────────┘
```

## User Journey

### Step 1: Deploy Factory (One-Time, Global)
```bash
forge script DeployFactory.s.sol --rpc-url $RPC_URL --broadcast
# Deploys: ENSNamingDelegateFactory at 0xFactoryAddress
```

### Step 2: Project Creates Delegate
```typescript
const factory = createDelegateFactoryClient('0xFactoryAddress');

// Deploy project-specific delegate
const delegateAddress = await factory.createDelegate(
  walletClient,
  publicClient,
  'myproject.eth'
);
// Returns: 0xDelegateAddress (unique)
```

### Step 3: Owner Approves Delegate Contract
```typescript
// User must approve their delegate contract ONCE
await walletClient.writeContract({
  address: NAME_WRAPPER_ADDRESS,
  abi: [...], // setApprovalForAll
  functionName: 'setApprovalForAll',
  args: [delegateAddress, true],
});
```

### Step 4: Set Delegation
```typescript
const delegate = createNamingDelegateClient(delegateAddress);

await delegate.setDelegation(walletClient, publicClient, {
  parentName: 'example.eth',
  primaryDelegate: '0x123...',
  secondaryDelegate: '0x456...',
});
```

### Step 5: Delegate Creates Subdomains
```typescript
// Delegate account calls this
await delegate.createSubdomainViaDelegate(delegateWallet, publicClient, {
  parentName: 'example.eth',
  label: 'app',
  owner: '0x789...',
});
```

## Security Model

### Isolation
- Each project has its own delegate contract
- Issues in one project don't affect others
- Separate ownership and pause mechanisms

### Permission Checks
1. Owner check: Must be parent domain owner
2. Approval check: Must have approved delegate contract
3. Delegation check: Must be registered delegate
4. Expiration check: Delegation must not be expired

### What Delegates Can Do
- Create subdomains
- Set subdomain owner/resolver/TTL
- Configure fuses

### What Delegates Cannot Do
- Modify resolver records
- Change parent resolver
- Transfer parent ownership
- Modify parent fuses

## Factory Benefits

### Before (Single Global Contract)
```
ONE contract handles ALL projects
├─ Complex state management
├─ No isolation
├─ Single point of failure
└─ Hard to audit
```

### After (Factory Pattern)
```
FACTORY deploys individual contracts
├─ Project A → Isolated contract
├─ Project B → Isolated contract
├─ Project C → Isolated contract
└─ Clear boundaries
```

## Gas Costs

### One-Time Setup (Per Project)
- createDelegate: ~500k gas
- setApprovalForAll: ~45k gas
- setDelegation: ~50k gas
- **Total**: ~595k gas

### Per Subdomain Creation
- createSubdomain: ~100k gas

## Use Cases

### DAO Delegation
```
DAO owns: dao.eth
Creates: Delegate contract for dao.eth
Delegates to: Governance module (0x...)
Governance creates: member.dao.eth, vote.dao.eth, etc.
```

### Startup Delegation
```
Startup owns: startup.eth
Creates: Delegate contract for startup.eth
Delegates to: Operations multisig (0x...)
Multisig creates: app.startup.eth, api.startup.eth, etc.
```

### Service Provider
```
Provider manages: Multiple client domains
Creates: Delegate for each client
Delegates to: Provider's automation (0x...)
Automation creates: Subdomains as needed
```

## Files Created

### Solidity
- `contracts/ENSNamingDelegate.sol` - Core delegate logic
- `contracts/ENSNamingDelegateFactory.sol` - Factory pattern
- `contracts/ENSNamingDelegate.test.sol` - Delegate tests
- `contracts/ENSNamingDelegateFactory.test.sol` - Factory tests
- `contracts/deploy/DeployNamingDelegate.s.sol` - Delegate deployment
- `contracts/deploy/DeployFactory.s.sol` - Factory deployment

### TypeScript
- `src/lib/ens/ens-naming-delegate.ts` - Delegate client
- `src/lib/ens/ens-delegate-factory.ts` - Factory client

### Documentation
- `contracts/README.md` - Contract docs
- `docs/NAMING-DELEGATION-GUIDE.md` - Usage guide
- `FACTORY-DESIGN.md` - Factory architecture
- `FINAL-ARCHITECTURE.md` - This file

## Deployment Steps

### 1. Deploy Factory
```bash
export PRIVATE_KEY=your_key
export RPC_URL=https://mainnet.infura.io/...
forge script DeployFactory.s.sol --rpc-url $RPC_URL --broadcast --verify
```

### 2. Projects Create Delegates
```typescript
const factory = createDelegateFactoryClient(factoryAddress);
const delegate = await factory.createDelegate(projectName);
```

### 3. Users Approve Delegates
```typescript
await setApprovalForAll(walletClient, publicClient, delegateAddress, true);
```

### 4. Start Delegating
```typescript
await delegate.setDelegation(...);
```

## Summary

**Factory Pattern**: One factory, many isolated delegates
**Project Isolation**: Each project gets own contract
**Security**: Clear permission boundaries
**Scalability**: Unlimited projects
**Usability**: Simple TypeScript integration

This architecture solves the global separation problem while maintaining security and usability.


