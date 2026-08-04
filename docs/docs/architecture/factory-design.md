# Factory Pattern Design for ENS Naming Delegation

## Problem Solved

Without a factory, if we had ONE global delegate contract:
- All projects share the same contract
- No isolation between projects
- Single point of failure
- Complex permission management

## Solution: Factory Pattern

### Architecture

```
Factory Contract (deployed once)
  ├─ Project A → Delegate Contract A
  ├─ Project B → Delegate Contract B
  └─ Project C → Delegate Contract C

Each delegate contract is isolated and owned by the project
```

### Benefits

**Isolation**: Each project has its own delegate contract
**Security**: Issues in one contract don't affect others
**Ownership**: Project owners control their own contracts
**Scalability**: Unlimited projects can be created
**Upgradeability**: Each project can manage its own contract

## How It Works

### 1. Deploy Factory (One-Time)
```solidity
Factory deployed at: 0xFactoryAddress
```

### 2. Project Creates Delegate
```typescript
const factory = createDelegateFactoryClient('0xFactoryAddress');

// Project "myproject" creates their delegate
const delegateAddress = await factory.createDelegate(
  walletClient,
  publicClient,
  'myproject.eth'
);

// Returns: 0xDelegateAddress (unique to this project)
```

### 3. Use Project's Delegate
```typescript
const delegate = createNamingDelegateClient(delegateAddress);

// All delegation operations use THIS project's contract
await delegate.setDelegation(...);
```

## User Flow

### For a Project Owner:

1. **Deploy**: Create delegate contract via factory
   ```
   Factory.createDelegate("project-name") → Deploy new contract
   ```

2. **Take Ownership**: Automatically transferred to creator
   ```
   NewDelegate.owner() → msg.sender
   ```

3. **Approve**: Grant permission to delegate
   ```
   NameWrapper.setApprovalForAll(delegateAddress, true)
   ```

4. **Set Delegation**: Configure naming permissions
   ```
   Delegate.setDelegation(parentNode, primaryDelegate, ...)
   ```

### For Delegates:

1. **Check Authorization**: Verify they can act
   ```
   Delegate.canPerformNamingOperation(parentNode, delegateAddress)
   ```

2. **Create Subdomains**: Use the delegated authority
   ```
   Delegate.createSubdomain(parentNode, label, ...)
   ```

## Example Use Cases

### Use Case 1: DAO Project
```
Project: "dao-project"
Delegate Contract: 0xABC... (isolated)
Owner: DAO multisig
Delegate: Governance module
```

### Use Case 2: Startup Project
```
Project: "startup-inc"
Delegate Contract: 0xDEF... (isolated)
Owner: Founder wallet
Delegate: Operations multisig
```

### Use Case 3: Service Provider
```
Project: "hosting-co"
Delegate Contract: 0xGHI... (isolated)
Owner: Company wallet
Delegate: Automation contract
```

## Security Benefits

### Isolation
- Project A's issues don't affect Project B
- Each contract is independently owned
- Separate pause/upgrade mechanisms

### Access Control
- Only project owner controls their delegate
- Factory owner can't control individual delegates
- Delegates only work within their contract

### Audit Trail
- Each project's actions are separate
- Easier to audit specific projects
- Clear ownership boundaries

## Implementation

### Factory Contract
- `createDelegate(bytes32 projectIdentifier)` - Deploy new delegate
- `getDelegate(bytes32 projectIdentifier)` - Get delegate address
- `getProject(address delegate)` - Get project identifier
- `getDelegateCount()` - Total deployments

### Factory Client (TypeScript)
```typescript
class ENSDelegateFactoryClient {
  createDelegate(projectName) → deploy new contract
  getDelegate(projectName) → get existing contract
  getProject(delegateAddress) → identify project
  getDelegateCount() → count all deployments
}
```

## Deployment Strategy

### One-Time Deployments
1. Deploy ENSNamingDelegate (implementation)
2. Deploy ENSNamingDelegateFactory (factory)

### Per-Project
Each project creates their own delegate via factory

## Gas Costs

### Factory Deployment
- Factory: ~500k gas (one-time)
- Delegate: ~500k gas per project

### Per-Project Costs
- createDelegate: ~500k gas (first time only)
- setDelegation: ~50k gas
- createSubdomain: ~100k gas per operation

## Migration Path

### Existing Delegate Users
1. Deploy factory
2. Migration script creates delegates for existing users
3. Users migrate to their isolated contracts

### New Users
1. Use factory directly
2. Get isolated delegate automatically

## Conclusion

The factory pattern solves the isolation problem elegantly:

- One factory contract for all projects
- Isolated delegate contract per project
- Clear ownership and permissions
- Secure and scalable

This is the right architecture for production use.


