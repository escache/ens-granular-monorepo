# ENS Permissions and Authorization Guide

A comprehensive guide to all permissions and authorization mechanisms in ENS for root-level names and subdomains, including security best practices and troubleshooting.

## Overview

This guide provides a complete reference for understanding and managing permissions in the Ethereum Name Service (ENS). It covers all authorization mechanisms, security considerations, and best practices for both root-level names and subdomains.

## 1. NameWrapper Fuses

**Contract**: NameWrapper (`0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401`)

### Owner-Controlled Fuses
- **CANNOT_UNWRAP** (1) - Name cannot be unwrapped back to Registry
- **CANNOT_BURN_FUSES** (2) - Fuses cannot be burned (made permanent)
- **CANNOT_TRANSFER** (4) - Name cannot be transferred
- **CANNOT_SET_RESOLVER** (8) - Resolver cannot be changed
- **CANNOT_SET_TTL** (16) - TTL cannot be modified
- **CANNOT_CREATE_SUBDOMAIN** (32) - Subdomains cannot be created
- **CANNOT_APPROVE** (64) - Approvals cannot be set

### Parent-Controlled Fuses
- **PARENT_CANNOT_CONTROL** (65536) - Parent loses control (emancipation)
- **CAN_EXTEND_EXPIRY** (131072) - Parent can extend expiry

**Method**: `getFuses(node)` returns uint32

## 2. Resolver Authorization

**Contract**: Resolver (varies by name)

**Method**: `isAuthorised(node)` returns bool

Allows an address to write resolver records without being the owner:
- `setAddr()` - Set address records
- `setText()` - Set text records  
- `setContenthash()` - Set content hash
- `setPubkey()` - Set public key records
- `setABI()` - Set ABI records

**Permission Check**: Must check if address is authorized on resolver before allowing record modifications.

## 3. NameWrapper ERC-1155 Approvals

**Contract**: NameWrapper

**Methods**:
- `setApprovalForAll(operator, approved)` - Approve/reject operator
- `isApprovedForAll(owner, operator)` - Check approval status

Allows an approved operator to:
- Transfer wrapped names (`safeTransferFrom`)
- Set records
- Set fuses
- Create subdomains
- Unwrap names (if allowed by fuses)

**Critical**: Check if `CANNOT_APPROVE` fuse is set before allowing approvals.

## 4. Registry Owner

**Contract**: ENS Registry (`0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`)

**Method**: `owner(node)` returns address

For unwrapped names:
- Controls `setOwner()`
- Controls `setResolver()`
- Controls `setSubnodeRecord()` (subdomain creation)
- Controls `setTTL()`

## 5. NameWrapper Owner

**Contract**: NameWrapper

**Method**: `ownerOf(id)` returns address (where id is the namehash)

For wrapped names:
- Controls all wrapped name operations
- Subject to fuses restrictions
- Can delegate via ERC-1155 approvals

## 6. TTL (Time To Live)

**Contract**: ENS Registry

**Method**: `ttl(node)` returns uint64

Caching parameter for resolvers:
- Lower TTL = more frequent updates
- Higher TTL = reduced query costs
- Cannot be modified if `CANNOT_SET_TTL` fuse is set

**Typical Values**:
- High security: 0-60 seconds
- Standard: 300-3600 seconds
- Maximum: 86400 seconds (24 hours)

## 7. Registration Expiry

**Contract**: ETH Registrar Controller (`0x253553366Da8546fC250F225fe3d25d0C782303b`)

**For .eth names**:
- Controlled by registrar controller
- Can extend via `renew()` method
- Expired names can be reclaimed by anyone
- Grace period before reclaiming

**Check**: `expiryDate` on NameWrapper or Registrar

## 8. Parent Domain Control

**For subdomains**:

A parent domain owner can:
- Transfer subdomain ownership (unless emancipated)
- Set subdomain resolver
- Set subdomain TTL
- Delete subdomain (if not wrapped)

**Protection**: `PARENT_CANNOT_CONTROL` fuse emancipates subdomain from parent control.

## 9. Controller Permissions

**Contract**: ETH Registrar Controller

**Methods**:
- `available(name)` - Check if name can be registered
- `rentPrice(name, duration)` - Get registration cost
- `register()` - Register new .eth name

Controls registration of new .eth names. Addresses need to pay ETH and wait commitment period.

## 10. Reverse Registrar Authorization

**Contract**: Reverse Registrar (`0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb`)

**Methods**:
- `setName(name)` - Set reverse record
- `claim(addr, owner, resolver)` - Claim reverse node

Controls reverse resolution (address → name) for an address.

## Permission Hierarchy

```
For Unwrapped Names:
Registry Owner
  ├─ setOwner()
  ├─ setResolver()
  ├─ setSubnodeRecord()
  └─ setTTL()

For Wrapped Names:
NameWrapper Owner
  ├─ ERC-1155 Approvals (if allowed)
  ├─ Fuses (may restrict operations)
  ├─ Parent Control (if not emancipated)
  └─ Expiry (subject to registration)

Resolver Authorization:
Resolver Contract
  └─ isAuthorised() → Can write records
```

## Contract Authorization Requirements

### For Contracts to Manage ENS Names:

1. **Own the name** (Registry owner or NameWrapper owner)
2. **OR have NameWrapper approval** (`isApprovedForAll` = true)
3. **OR have resolver authorization** (`isAuthorised` = true)
4. **AND not restricted by fuses**

### For Contracts to Create Subdomains:

1. **Be parent owner** (Registry or NameWrapper)
2. **AND** parent does NOT have `CANNOT_CREATE_SUBDOMAIN` fuse
3. **AND** parent not expired (if wrapped)

### For Contracts to Modify Records:

1. **Be owner** (Registry or NameWrapper)
2. **OR** have resolver authorization
3. **AND** resolver NOT restricted (`CANNOT_SET_RESOLVER`)

## Security Best Practices

1. **Always check fuses** before operations
2. **Verify resolver authorization** for record modifications
3. **Check ERC-1155 approvals** for delegation scenarios
4. **Monitor expiry dates** for wrapped names
5. **Use emancipated subdomains** (`PARENT_CANNOT_CONTROL`) for critical contracts
6. **Set low TTL** for important records (600 seconds recommended)
7. **Burn critical fuses** for immutable contracts

## Example Permission Check Flow

```typescript
// 1. Check if name exists
const owner = await registry.owner(node);
if (owner === ZERO_ADDRESS) return NO_NAME;

// 2. Check if wrapped
const isWrapped = await nameWrapper.balanceOf(owner, node) > 0;

// 3. Get actual controller
const controller = isWrapped 
  ? await nameWrapper.ownerOf(node)
  : owner;

// 4. Check fuses (if wrapped)
const fuses = isWrapped ? await nameWrapper.getFuses(node) : 0;

// 5. Check ERC-1155 approval
const hasApproval = isWrapped 
  ? await nameWrapper.isApprovedForAll(controller, manager)
  : false;

// 6. Check resolver authorization
const resolver = await registry.resolver(node);
const hasResolverAuth = await resolver.isAuthorised(node);

// 7. Determine permissions
const canManage = 
  controller === manager || 
  hasApproval || 
  hasResolverAuth;
```

## 11. Multisig and DAO Considerations

### Gnosis Safe Integration

When using Gnosis Safe for ENS management:

**Detection Pattern**:
```typescript
const isSafe = async (address: Address, publicClient: PublicClient): Promise<boolean> => {
  try {
    const owners = await publicClient.readContract({
      address,
      abi: [
        {
          name: 'getOwners',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'address[]' }],
        },
      ],
      functionName: 'getOwners',
    });
    return owners.length > 0;
  } catch {
    return false;
  }
};
```

**Delegation for Safe**:
- Use `setApprovalForAll` to delegate to manager
- Set threshold metadata: `security.multisig.threshold`
- Store owners list: `security.multisig.owners`
- Manager can execute operations without Safe approval

**Best Practices**:
1. Delegate management to a hot wallet, keep Safe as owner
2. Set backup manager from Safe owners
3. Monitor delegation expiry
4. Use time-locked approvals for critical operations

### DAO Governance

**AccessControl Pattern**:
```typescript
const hasRole = async (
  contract: Address,
  role: Hex,
  account: Address,
  publicClient: PublicClient
): Promise<boolean> => {
  return await publicClient.readContract({
    address: contract,
    abi: [
      {
        name: 'hasRole',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'role', type: 'bytes32' },
          { name: 'account', type: 'address' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ],
    functionName: 'hasRole',
    args: [role, account],
  });
};
```

**Roles to Check**:
- `DEFAULT_ADMIN_ROLE` (0x00) - Full control
- `RESOLVER_ROLE` - Can modify records
- `SUBDOMAIN_ROLE` - Can create subdomains

## 12. Edge Cases and Common Pitfalls

### Edge Case 1: Missing Resolver

**Problem**: Name exists but has no resolver set
```typescript
const resolver = await registry.resolver(node);
if (resolver === ZERO_ADDRESS) {
  // Cannot set records - need to set resolver first
  throw new Error('No resolver set. Call setResolver() first.');
}
```

**Solution**: Always check resolver before operations:
```typescript
async function ensureResolver(
  registry: Address,
  node: Hex,
  publicClient: PublicClient
): Promise<Address> {
  let resolver = await publicClient.readContract({
    address: registry,
    abi: ENS_REGISTRY_ABI,
    functionName: 'resolver',
    args: [node],
  });
  
  if (resolver === ZERO_ADDRESS) {
    // Set public resolver
    resolver = ENS_PUBLIC_RESOLVER;
  }
  
  return resolver;
}
```

### Edge Case 2: Wrapped vs Unwrapped Confusion

**Problem**: Owner is NameWrapper but name not actually wrapped
```typescript
const owner = await registry.owner(node);
const isWrapped = owner.toLowerCase() === NAME_WRAPPER_ADDRESS.toLowerCase();

if (isWrapped) {
  // Check actual wrapped owner
  const wrappedOwner = await nameWrapper.ownerOf(node);
  // Use wrappedOwner, not owner
}
```

**Solution**: Always check balance:
```typescript
const balance = await nameWrapper.balanceOf(wrappedOwner, node);
const isActuallyWrapped = balance > 0n;
```

### Edge Case 3: Expired Name Operations

**Problem**: Trying to operate on expired name
```typescript
async function checkExpiry(
  name: string,
  publicClient: PublicClient
): Promise<{ expired: boolean; expiryDate: Date | null }> {
  const normalizedName = normalize(name);
  const node = namehash(normalizedName);
  
  // Check NameWrapper expiry
  try {
    const expiry = await publicClient.readContract({
      address: NAME_WRAPPER_ADDRESS,
      abi: NAME_WRAPPER_ABI,
      functionName: 'names',
      args: [node],
    });
    
    // names() returns [owner, expiry, fuses]
    const expiryTimestamp = Number(expiry[1]);
    const now = Math.floor(Date.now() / 1000);
    
    return {
      expired: expiryTimestamp < now,
      expiryDate: new Date(expiryTimestamp * 1000),
    };
  } catch {
    return { expired: false, expiryDate: null };
  }
}
```

### Edge Case 4: Parent Control After Emancipation

**Problem**: Parent tries to control emancipated subdomain
```typescript
async function canParentControl(
  parentNode: Hex,
  childNode: Hex,
  publicClient: PublicClient
): Promise<boolean> {
  const fuses = await nameWrapper.getFuses(childNode);
  const isEmancipated = (fuses & PARENT_CANNOT_CONTROL) === PARENT_CANNOT_CONTROL;
  
  return !isEmancipated;
}
```

### Edge Case 5: Fuse Combinations

**Dangerous Combination**: `CANNOT_TRANSFER` + `CANNOT_UNWRAP` + `CANNOT_BURN_FUSES`
- Name is permanently locked
- Cannot be transferred
- Cannot be unwrapped
- Cannot modify fuses
- **PERMANENT STATE** - Use with extreme caution

**Safe Combinations**:
```typescript
// Conservative: Allow modifications, prevent transfer
const SAFE_FUSES = combineFuses([
  'CANNOT_UNWRAP',
  'CANNOT_TRANSFER',
  'PARENT_CANNOT_CONTROL'
]);

// DAO: Allow governance changes
const DAO_FUSES = combineFuses([
  'CANNOT_UNWRAP',
  'PARENT_CANNOT_CONTROL'
]);

// Immutable: Maximum security
const IMMUTABLE_FUSES = combineFuses([
  'CANNOT_UNWRAP',
  'CANNOT_BURN_FUSES',
  'CANNOT_TRANSFER',
  'CANNOT_SET_RESOLVER',
  'CANNOT_SET_TTL',
  'CANNOT_CREATE_SUBDOMAIN',
  'CANNOT_APPROVE',
  'PARENT_CANNOT_CONTROL'
]);
```

## 13. Gas Optimization

### Batch Operations

**Multi-send Pattern**:
```typescript
import { Multicall3 } from 'viem';

const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

async function batchSetRecords(
  walletClient: WalletClient,
  publicClient: PublicClient,
  records: Array<{ node: Hex; key: string; value: string }>
): Promise<Hex> {
  const calls = records.map(record => ({
    target: ENS_PUBLIC_RESOLVER,
    callData: encodeFunctionData({
      abi: PUBLIC_RESOLVER_ABI,
      functionName: 'setText',
      args: [record.node, record.key, record.value],
    }),
  }));
  
  return await walletClient.writeContract({
    address: MULTICALL3_ADDRESS,
    abi: MULTICALL3_ABI,
    functionName: 'aggregate',
    args: [calls],
  });
}
```

### Gas Costs (Approximate)

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| `setResolver` | ~45,000 | Registry operation |
| `setText` | ~45,000 | Per text record |
| `setAddr` | ~60,000 | Address record |
| `setContenthash` | ~65,000 | IPFS/Swarm hash |
| `wrap` | ~150,000 | Wrap with fuses |
| `unwrap` | ~80,000 | Back to Registry |
| `setFuses` | ~35,000 | Modify fuses |
| `setSubnodeRecord` | ~180,000 | Create subdomain |
| `setApprovalForAll` | ~46,000 | Approve operator |

**Optimization Tips**:
1. Batch resolver operations (save ~10,000 gas each)
2. Reuse resolver address (avoid multiple lookups)
3. Cache namehash() calculations
4. Use multicall for multiple records
5. Optimize TTL (fewer renewals)

## 14. Testing Strategies

### Unit Tests

```typescript
describe('ENS Permissions', () => {
  let registry: Address;
  let nameWrapper: Address;
  let publicResolver: Address;
  
  beforeEach(async () => {
    // Deploy test contracts
  });
  
  it('should check fuses correctly', async () => {
    const fuses = await nameWrapper.getFuses(node);
    expect(fuses & CANNOT_TRANSFER).toBe(CANNOT_TRANSFER);
  });
  
  it('should respect resolver authorization', async () => {
    const isAuth = await publicResolver.isAuthorised(node);
    expect(isAuth).toBe(true);
  });
  
  it('should handle wrapped names', async () => {
    const owner = await nameWrapper.ownerOf(node);
    const balance = await nameWrapper.balanceOf(owner, node);
    expect(balance).toBeGreaterThan(0n);
  });
});
```

### Integration Tests

```typescript
describe('ENS Operations', () => {
  it('should create subdomain with proper fuses', async () => {
    const fuses = combineFuses(['PARENT_CANNOT_CONTROL', 'CANNOT_UNWRAP']);
    
    await nameWrapper.setSubnodeRecord(
      parentNode,
      label,
      newOwner,
      resolver,
      ttl,
      fuses,
      expiry
    );
    
    const createdNode = namehash(`${label}.${parentName}`);
    const createdFuses = await nameWrapper.getFuses(createdNode);
    
    expect(createdFuses & PARENT_CANNOT_CONTROL).toBe(PARENT_CANNOT_CONTROL);
  });
});
```

### E2E Tests

```typescript
describe('Complete ENS Workflow', () => {
  it('should register contract with metadata', async () => {
    // 1. Check contract ownership
    const ownership = await checkContractOwnership(contract);
    
    // 2. Create subdomain
    await createSubdomain(...);
    
    // 3. Set resolver
    await setResolver(...);
    
    // 4. Set records
    await setTextRecord(...);
    
    // 5. Verify
    const address = await publicClient.getEnsAddress({ name });
    expect(address).toBe(contractAddress);
  });
});
```

## 15. Security Vulnerabilities

### Vulnerability 1: Unauthorized Resolver

**Risk**: Malicious resolver can modify records
```typescript
// WRONG: Using any resolver
await registry.setResolver(node, userProvidedResolver);

// CORRECT: Use known safe resolver
await registry.setResolver(node, ENS_PUBLIC_RESOLVER);
```

### Vulnerability 2: Missing Authorization Check

**Risk**: Assuming ownership grants resolver permissions
```typescript
// WRONG
await resolver.setText(node, key, value);

// CORRECT
const isAuthorized = await resolver.isAuthorised(node);
if (!isAuthorized) {
  throw new Error('Not authorized on resolver');
}
await resolver.setText(node, key, value);
```

### Vulnerability 3: Unwrapped Parent Control

**Risk**: Parent can transfer emancipated subdomain
```typescript
// WRONG: Not checking fuses
await registry.setOwner(childNode, newOwner);

// CORRECT: Check emancipation
const fuses = await nameWrapper.getFuses(childNode);
if ((fuses & PARENT_CANNOT_CONTROL) === PARENT_CANNOT_CONTROL) {
  throw new Error('Child is emancipated');
}
```

### Vulnerability 4: Expired Name Hijacking

**Risk**: Expired names can be reclaimed
```typescript
// WRONG: Not checking expiry
await modifyName(name);

// CORRECT: Check expiry first
const { expired } = await checkExpiry(name);
if (expired) {
  throw new Error('Name expired - cannot modify');
}
```

### Vulnerability 5: Front-Running Attacks

**Risk**: Attacker sees transaction and front-runs
```typescript
// MITIGATION: Use commit-reveal for registrations
// 1. Commit hash
await controller.commit(commitment);

// 2. Wait for minCommitmentAge
await sleep(minCommitmentAge);

// 3. Reveal with secret
await controller.register(name, owner, duration, secret, ...);
```

## 16. Cross-Chain Considerations

### Resolver Deployment

ENS contracts deploy on multiple chains:
- **Ethereum Mainnet**: Authoritative
- **L2s**: Use CCIP-Read for cross-chain resolution

**CCIP-Read Pattern**:
```typescript
async function resolveCrossChain(
  name: string,
  chainId: number,
  publicClient: PublicClient
): Promise<string | null> {
  const resolver = await publicClient.getEnsResolver({ name });
  
  // Check if resolver supports CCIP-Read
  const supportsCCIP = await publicClient.readContract({
    address: resolver,
    abi: [{ name: 'supportsInterface', inputs: [], outputs: [{ name: '', type: 'bool' }] }],
    functionName: 'supportsInterface',
    args: ['0x9061b923'], // ccipRead function selector
  });
  
  if (supportsCCIP) {
    // Resolver will fetch from Ethereum via CCIP-Read
    return await publicClient.getEnsAddress({ name });
  }
  
  return null;
}
```

### L2 Address Differences

Different chains may have different addresses:
```typescript
const ENS_ADDRESSES = {
  1: { registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', ... },
  10: { registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', ... }, // Optimism
  8453: { registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', ... }, // Base
};
```

## 17. Troubleshooting

### Problem: "Caller is not authorized"

**Cause**: Address doesn't have permission
**Check**:
1. Registry owner: `await registry.owner(node)`
2. NameWrapper owner: `await nameWrapper.ownerOf(node)`
3. ERC-1155 approval: `await nameWrapper.isApprovedForAll(owner, caller)`
4. Resolver auth: `await resolver.isAuthorised(node)`

### Problem: "Cannot set fuses"

**Cause**: Fuses already burned or CANNOT_BURN_FUSES set
**Check**:
```typescript
const fuses = await nameWrapper.getFuses(node);
if ((fuses & CANNOT_BURN_FUSES) === CANNOT_BURN_FUSES) {
  console.error('Fuses are permanently burned');
}
```

### Problem: "Subdomain creation failed"

**Cause**: CANNOT_CREATE_SUBDOMAIN fuse or expired parent
**Check**:
```typescript
const parentFuses = await nameWrapper.getFuses(parentNode);
if ((parentFuses & CANNOT_CREATE_SUBDOMAIN) === CANNOT_CREATE_SUBDOMAIN) {
  console.error('Parent has CANNOT_CREATE_SUBDOMAIN fuse');
}

const { expired } = await checkExpiry(parentName);
if (expired) {
  console.error('Parent name expired');
}
```

### Problem: "Name not found"

**Cause**: Name doesn't exist or wrong network
**Check**:
```typescript
const owner = await registry.owner(node);
if (owner === ZERO_ADDRESS) {
  console.error('Name does not exist');
}

const chainId = await publicClient.getChainId();
if (chainId !== 1) {
  console.warn('On non-mainnet - some names may not resolve');
}
```

### Debug Helper Function

```typescript
async function debugPermissions(
  name: string,
  caller: Address,
  publicClient: PublicClient
): Promise<void> {
  const node = namehash(normalize(name));
  
  const owner = await publicClient.readContract({
    address: ENS_REGISTRY_ADDRESS,
    abi: ENS_REGISTRY_ABI,
    functionName: 'owner',
    args: [node],
  });
  
  const resolver = await publicClient.readContract({
    address: ENS_REGISTRY_ADDRESS,
    abi: ENS_REGISTRY_ABI,
    functionName: 'resolver',
    args: [node],
  });
  
  const isWrapped = await publicClient.readContract({
    address: NAME_WRAPPER_ADDRESS,
    abi: [{ name: 'balanceOf', inputs: [], outputs: [{ name: '', type: 'uint256' }] }],
    functionName: 'balanceOf',
    args: [owner, node],
  }) > 0n;
  
  let wrappedOwner = owner;
  let fuses = 0;
  
  if (isWrapped) {
    wrappedOwner = await publicClient.readContract({
      address: NAME_WRAPPER_ADDRESS,
      abi: NAME_WRAPPER_ABI,
      functionName: 'ownerOf',
      args: [node],
    });
    
    fuses = await publicClient.readContract({
      address: NAME_WRAPPER_ADDRESS,
      abi: NAME_WRAPPER_ABI,
      functionName: 'getFuses',
      args: [node],
    });
  }
  
  const hasApproval = await publicClient.readContract({
    address: NAME_WRAPPER_ADDRESS,
    abi: [{ name: 'isApprovedForAll', inputs: [], outputs: [{ name: '', type: 'bool' }] }],
    functionName: 'isApprovedForAll',
    args: [wrappedOwner, caller],
  });
  
  let hasResolverAuth = false;
  if (resolver !== ZERO_ADDRESS) {
    hasResolverAuth = await publicClient.readContract({
      address: resolver,
      abi: [{ name: 'isAuthorised', inputs: [], outputs: [{ name: '', type: 'bool' }] }],
      functionName: 'isAuthorised',
      args: [node],
    });
  }
  
  console.log('Permissions Debug:', {
    name,
    caller,
    owner,
    resolver,
    isWrapped,
    wrappedOwner,
    fuses: getActiveFuses(fuses),
    hasApproval,
    hasResolverAuth,
    canManage: caller.toLowerCase() === wrappedOwner.toLowerCase() || hasApproval || hasResolverAuth,
  });
}
```

## Real-World Scenarios

### Scenario 1: DAO Deploying Contract with ENS

```typescript
// 1. DAO approves manager for ENS operations
await nameWrapper.setApprovalForAll(managerAddress, true);

// 2. Manager creates subdomain for contract
await nameWrapper.setSubnodeRecord(
  daoNode,
  'app',
  managerAddress,
  ENS_PUBLIC_RESOLVER,
  0,
  combineFuses(['PARENT_CANNOT_CONTROL', 'CANNOT_UNWRAP']),
  BigInt(Date.now() / 1000 + 365 * 24 * 60 * 60)
);

// 3. Manager sets contract address
await resolver.setAddr(namehash('app.dao.eth'), 60, contractAddress);

// 4. Manager sets metadata
await resolver.setText(namehash('app.dao.eth'), 'description', 'DAO Application');
```

### Scenario 2: Upgrading Contract ENS Name

```typescript
// 1. Deploy new implementation
const newImpl = await deployContract(...);

// 2. Update implementation address record
await resolver.setText(
  namehash('vault.dao.eth'),
  'eth.implementation',
  newImpl
);

// 3. Set version text record
await resolver.setText(
  namehash('vault.dao.eth'),
  'version',
  '2.0.0'
);
```

### Scenario 3: Emergency Access Control

```typescript
// Set up backup manager for emergencies
await resolver.setText(
  namehash('critical.dao.eth'),
  'ens.manager.backup',
  emergencyWallet
);

// Backup manager can use resolver authorization
await resolver.setAuthorised(namehash('critical.dao.eth'), emergencyWallet, true);
```

## 18. Wildcard Resolution (ENSIP-10)

**Protocol**: ENSIP-10 - Wildcard resolution allows `*.example.eth` to match any subdomain

### How It Works

Wildcard domains can resolve any subdomain without creating individual records:

```typescript
// Parent domain: example.eth
// Wildcard: *.example.eth resolves to example.eth's records

async function resolveWildcard(
  name: string,
  publicClient: PublicClient
): Promise<string | null> {
  const parts = name.split('.');
  
  // Check if subdomain exists first
  let address = await publicClient.getEnsAddress({ name });
  
  if (!address) {
    // Fall back to wildcard resolution
    const parentName = parts.slice(1).join('.');
    address = await publicClient.getEnsAddress({ name: parentName });
  }
  
  return address;
}
```

### Wildcard Permissions

**Important**: Wildcard resolution requires special resolver setup:

```typescript
// Check if resolver supports wildcard resolution
const supportsWildcard = await publicClient.readContract({
  address: resolver,
  abi: [{ 
    name: 'supportsInterface', 
    inputs: [{ name: 'interfaceId', type: 'bytes4' }],
    outputs: [{ name: '', type: 'bool' }] 
  }],
  functionName: 'supportsInterface',
  args: ['0x9061b923'], // Wildcard selector
});
```

### CCIP-Read Wildcard

Cross-chain wildcard resolution via CCIP-Read:

```typescript
async function resolveWildcardCrossChain(
  name: string,
  chainId: number,
  publicClient: PublicClient
): Promise<string | null> {
  const resolver = await publicClient.getEnsResolver({ name });
  
  if (!resolver) return null;
  
  // Resolver handles CCIP-Read internally
  return await publicClient.getEnsAddress({ name });
}
```

## 19. DNSSEC Integration (ENSIP-7, ENSIP-11)

**Protocol**: DNS Security Extensions integration for DNS domains

### DNS to ENS Claiming

DNS domain owners can claim ENS names via DNSSEC:

```typescript
async function checkDNSSECStatus(
  name: string,
  publicClient: PublicClient
): Promise<boolean> {
  const normalizedName = normalize(name);
  
  // Only DNS domains (not .eth)
  if (normalizedName.endsWith('.eth')) {
    return false;
  }
  
  const node = namehash(normalizedName);
  const resolver = await publicClient.getEnsResolver({ name: normalizedName });
  
  if (!resolver) return false;
  
  try {
    const dnsTxt = await publicClient.readContract({
      address: resolver,
      abi: PUBLIC_RESOLVER_ABI,
      functionName: 'text',
      args: [node, 'dnssec'],
    });
    
    return !!dnsTxt;
  } catch {
    return false;
  }
}
```

### DNS Permission Model

DNS domains have off-chain control:
- DNS owner controls ENS name
- Changes made via DNS propagate to ENS
- Requires DNSSEC verification

**Critical**: DNS domains cannot use NameWrapper or fuses!

## 20. Multicoin Address Records

**Standard**: EIP-2304 - Multiple cryptocurrency addresses per name

### Supported Coin Types

```typescript
export const COIN_TYPES = {
  ETH: 60,           // Ethereum
  BTC: 0,            // Bitcoin
  LTC: 2,            // Litecoin
  DOGE: 3,           // Dogecoin
  XRP: 144,          // Ripple
  TRX: 195,          // Tron
  BCH: 145,          // Bitcoin Cash
  EOS: 194,          // EOS
  SOL: 501,          // Solana
  MATIC: 966,        // Polygon
  AVAX: 9000,        // Avalanche
  BNB: 9004,         // BNB Chain
};
```

### Setting Multicoin Addresses

```typescript
async function setMulticoinAddress(
  walletClient: WalletClient,
  publicClient: PublicClient,
  name: string,
  coinType: number,
  address: string
): Promise<Hex> {
  const normalizedName = normalize(name);
  const node = namehash(normalizedName);
  const resolver = await publicClient.getEnsResolver({ name: normalizedName });
  
  if (!resolver) {
    throw new Error('No resolver set');
  }
  
  // Encode address based on coin type
  const encodedAddress = encodeCoinAddress(address, coinType);
  
  return await walletClient.writeContract({
    address: resolver,
    abi: PUBLIC_RESOLVER_ABI,
    functionName: 'setAddr',
    args: [node, BigInt(coinType), encodedAddress],
  });
}
```

### Reading Multicoin Addresses

```typescript
async function getMulticoinAddress(
  publicClient: PublicClient,
  name: string,
  coinType: number
): Promise<string | null> {
  const normalizedName = normalize(name);
  const node = namehash(normalizedName);
  const resolver = await publicClient.getEnsResolver({ name: normalizedName });
  
  if (!resolver) return null;
  
  try {
    const addressBytes = await publicClient.readContract({
      address: resolver,
      abi: PUBLIC_RESOLVER_ABI,
      functionName: 'addr',
      args: [node, BigInt(coinType)],
    });
    
    return decodeCoinAddress(addressBytes, coinType);
  } catch {
    return null;
  }
}
```

### Validation

```typescript
function validateCoinAddress(address: string, coinType: number): boolean {
  if (coinType === COIN_TYPES.ETH) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  if (coinType === COIN_TYPES.BTC) {
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
           /^bc1[a-z0-9]{39,59}$/.test(address);
  }
  if (coinType === COIN_TYPES.SOL) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
  // Add more validators as needed
  return true;
}
```

## 21. Commitment Period System

**For .eth registrations only** - Prevents front-running attacks

### Registration Flow

```typescript
async function registerDotEth(
  walletClient: WalletClient,
  publicClient: PublicClient,
  name: string,
  duration: number,
  secret: Hex
): Promise<Hex> {
  const minCommitmentAge = await publicClient.readContract({
    address: ETH_REGISTRAR_CONTROLLER,
    abi: ETH_REGISTRAR_CONTROLLER_ABI,
    functionName: 'minCommitmentAge',
  });
  
  // Step 1: Commit hash
  const commitment = keccak256(
    encodePacked(['string', 'address', 'bytes32'], [name, address, secret])
  );
  
  await walletClient.writeContract({
    address: ETH_REGISTRAR_CONTROLLER,
    abi: ETH_REGISTRAR_CONTROLLER_ABI,
    functionName: 'commit',
    args: [commitment],
  });
  
  // Step 2: Wait for commitment period
  await new Promise(resolve => setTimeout(resolve, Number(minCommitmentAge) * 1000));
  
  // Step 3: Register with secret
  return await walletClient.writeContract({
    address: ETH_REGISTRAR_CONTROLLER,
    abi: ETH_REGISTRAR_CONTROLLER_ABI,
    functionName: 'register',
    args: [
      name,
      owner,
      BigInt(duration),
      secret,
      resolver,
      [],
      false, // reverseRecord
      0, // fuses
    ],
    value: price,
  });
}
```

### Premium Pricing

Short names or recently expired names have premium pricing:

```typescript
async function getRegistrationPrice(
  publicClient: PublicClient,
  name: string,
  duration: number
): Promise<{ base: bigint; premium: bigint; total: bigint }> {
  const [base, premium] = await publicClient.readContract({
    address: ETH_REGISTRAR_CONTROLLER,
    abi: ETH_REGISTRAR_CONTROLLER_ABI,
    functionName: 'rentPrice',
    args: [name, BigInt(duration)],
  });
  
  return {
    base,
    premium,
    total: base + premium,
  };
}
```

**Typical Values**:
- Base price: ~0.003 ETH/year
- Premium: 0-10+ ETH (based on name length and recent expiry)
- Premium decays over time after expiry

## 22. Grace Periods

### Registration Grace Period

After .eth names expire:
1. **Grace Period**: 90 days
   - Name still resolves to original owner
   - Owner can renew at regular price
   - No one else can register
   
2. **Premium Period**: Days 91-360
   - Name can be reclaimed by anyone
   - Premium pricing applies
   - Original owner pays premium to reclaim
   
3. **Open Registration**: After 360 days
   - Name can be registered by anyone
   - Regular pricing applies

```typescript
async function checkExpiryStatus(
  name: string,
  publicClient: PublicClient
): Promise<'active' | 'grace' | 'premium' | 'available'> {
  const expiry = await publicClient.readContract({
    address: ETH_REGISTRAR_CONTROLLER,
    abi: ETH_REGISTRAR_CONTROLLER_ABI,
    functionName: 'nameExpires',
    args: [name],
  });
  
  const now = BigInt(Math.floor(Date.now() / 1000));
  const age = now - expiry;
  
  if (age < 0n) return 'active';
  if (age < 90n * 86400n) return 'grace';
  if (age < 360n * 86400n) return 'premium';
  return 'available';
}
```

## 23. Additional Resolver Records

### Content Hash (IPFS/Swarm)

```typescript
async function setContenthash(
  walletClient: WalletClient,
  publicClient: PublicClient,
  name: string,
  contentHash: Hex
): Promise<Hex> {
  const normalizedName = normalize(name);
  const node = namehash(normalizedName);
  const resolver = await publicClient.getEnsResolver({ name: normalizedName });
  
  return await walletClient.writeContract({
    address: resolver,
    abi: PUBLIC_RESOLVER_ABI,
    functionName: 'setContenthash',
    args: [node, contentHash],
  });
}
```

### Public Key

```typescript
async function setPubkey(
  walletClient: WalletClient,
  publicClient: PublicClient,
  name: string,
  x: Hex,
  y: Hex
): Promise<Hex> {
  const normalizedName = normalize(name);
  const node = namehash(normalizedName);
  const resolver = await publicClient.getEnsResolver({ name: normalizedName });
  
  return await walletClient.writeContract({
    address: resolver,
    abi: PUBLIC_RESOLVER_ABI,
    functionName: 'setPubkey',
    args: [node, x, y],
  });
}
```

### ABI Records

```typescript
async function setABI(
  walletClient: WalletClient,
  publicClient: PublicClient,
  name: string,
  contentType: number,
  data: Hex
): Promise<Hex> {
  const normalizedName = normalize(name);
  const node = namehash(normalizedName);
  const resolver = await publicClient.getEnsResolver({ name: normalizedName });
  
  return await walletClient.writeContract({
    address: resolver,
    abi: PUBLIC_RESOLVER_ABI,
    functionName: 'setABI',
    args: [node, contentType, data],
  });
}
```

**Content Types**:
- 1: JSON
- 2: zlib-compressed JSON
- 4: CBOR

## 24. Reverse Resolution Details

### Setting Reverse Records

```typescript
async function setReverseName(
  walletClient: WalletClient,
  publicClient: PublicClient,
  name: string
): Promise<Hex> {
  const reverseRegistrar = REVERSE_REGISTRAR_ADDRESS;
  
  return await walletClient.writeContract({
    address: reverseRegistrar,
    abi: REVERSE_REGISTRAR_ABI,
    functionName: 'setName',
    args: [name],
  });
}
```

### Claiming Reverse Node

```typescript
async function claimReverseNode(
  walletClient: WalletClient,
  publicClient: PublicClient,
  addr: Address,
  owner: Address,
  resolver: Address
): Promise<Hex> {
  const reverseRegistrar = REVERSE_REGISTRAR_ADDRESS;
  
  return await walletClient.writeContract({
    address: reverseRegistrar,
    abi: REVERSE_REGISTRAR_ABI,
    functionName: 'claim',
    args: [addr, owner, resolver],
  });
}
```

### Reading Reverse Records

```typescript
async function getReverseName(
  publicClient: PublicClient,
  address: Address
): Promise<string | null> {
  return await publicClient.getEnsName({ address });
}
```

**Node Hash**: `0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2`

## References

- ENS Registry: https://docs.ens.domains/contract-api-reference/ens
- NameWrapper: https://docs.ens.domains/contract-api-reference/name-wrapper
- Fuses: https://docs.ens.domains/contract-api-reference/name-wrapper#fuses
- ERC-1155: https://eips.ethereum.org/EIPS/eip-1155
- ENSIP-10: https://docs.ens.domains/ens-improvement-proposals/ensip-10-wildcard-resolution
- ENSIP-15: https://docs.ens.domains/ens-improvement-proposals/ensip-15-name-wrapper
- ENSIP-7: https://docs.ens.domains/ens-improvement-proposals/ensip-7-dns-inverse-claiming
- ENSIP-11: https://docs.ens.domains/ens-improvement-proposals/ensip-11-escape-hatch-for-circumventing-pattern-fallback
- EIP-2304: https://eips.ethereum.org/EIPS/eip-2304 (Multicoin address format)
- EIP-181: https://eips.ethereum.org/EIPS/eip-181 (Reverse resolution)
- EIP-3668: https://eips.ethereum.org/EIPS/eip-3668 (CCIP-Read)

