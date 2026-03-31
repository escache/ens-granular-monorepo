# Granular Name Assignment (GNA) Implementation

## Overview

This document describes the implementation of the Granular Name Assignment (GNA) system as specified in the ENSIP draft. The GNA system enables fine-grained, revocable delegation of operational control over ENS name records and subdomains to non-owner addresses, including smart contracts.

## Architecture

The GNA system consists of two primary components:

1. **GranularAssignmentController** (`ENSNamingDelegateGranular.sol`) - Policy engine for delegation management
2. **GranularResolver** (`GranularResolver.sol`) - Access enforcement for resolver operations

## Permission Model

### Permission Constants

The system uses a bitmask-based permission model with the following constants:

| Constant | Bit | Value | Function Controlled |
|----------|-----|-------|-------------------|
| `MANAGE_SUBDOMAINS` | 0 | 1 | `setSubnodeOwner`, `setSubnodeRecord` |
| `SET_ADDR_RECORD` | 1 | 2 | `setAddr` (any coin type) |
| `SET_TEXT_RECORD` | 2 | 4 | `setText` (any key) |
| `SET_CONTENT_HASH` | 3 | 8 | `setContenthash` |
| `SET_PUBKEY` | 4 | 16 | `setPubkey` |
| `SET_ABI` | 5 | 32 | `setABI` |
| `SET_ZONEHASH` | 6 | 64 | `setZonehash` |
| `SET_TTL` | 7 | 128 | `setTTL` |
| `SET_RESOLVER` | 8 | 256 | `setResolver` |
| `SET_OWNER` | 9 | 512 | `setOwner` (Registry operations) |
| `SET_FUSES` | 10 | 1024 | `setFuses` (NameWrapper operations) |

### Legacy Compatibility

The implementation maintains backward compatibility with existing operation constants:

- `OP_CREATE_SUBDOMAIN` = `MANAGE_SUBDOMAINS`
- `OP_SET_RECORDS` = Combined record-setting permissions
- `OP_TRANSFER` = `SET_OWNER`
- `OP_SET_FUSES` = `SET_FUSES`

## Core Features

### 1. Delegation Management

#### Adding Delegates
```solidity
function addDelegate(
    bytes32 node,
    address delegate,
    uint256 operations,
    uint256 expiresAt
) external onlyOwner
```

- Creates a new delegation with specific permissions
- Supports time-bound delegations with expiration
- Includes audit trail with creation timestamp and creator

#### Updating Delegates
```solidity
function updateDelegate(
    bytes32 node,
    address delegate,
    uint256 operations,
    uint256 expiresAt
) external onlyOwner
```

- Modifies existing delegation permissions
- Updates expiration timestamp
- Maintains delegation history

#### Removing Delegates
```solidity
function removeDelegate(bytes32 node, address delegate) external onlyOwner
```

- Revokes all permissions for a delegate
- Respects locking mechanism
- Emits removal event

### 2. Security Controls

#### Emergency Controls
- **Emergency Pause**: Instantly disable all delegations for a node
- **Emergency Revoke**: Revoke all delegations in case of security breach
- **Security Alerts**: Trigger monitoring alerts for suspicious activity

#### Access Control Lists
- **Whitelist**: Restrict delegations to pre-approved addresses
- **Blacklist**: Block specific addresses from receiving delegations
- **Locking**: Prevent removal of critical delegations

#### Time-Bound Delegations
- **Mandatory Expiration**: All delegations should have expiration timestamps
- **Maximum Duration**: Configurable maximum delegation duration per node
- **Automatic Revocation**: Expired delegations are automatically invalid

### 3. Permission Enforcement

#### Authorization Check
```solidity
function isAuthorizedDelegate(
    bytes32 node,
    address delegate,
    uint256 requiredOperation
) public view returns (bool)
```

The authorization check follows this hierarchy:

1. **Emergency Pause**: If node is emergency paused, deny all access
2. **Delegate Existence**: Check if delegate exists for the node
3. **Enabled Status**: Verify delegation is enabled
4. **Expiration**: Check if delegation has expired
5. **Permission Mask**: Verify delegate has required permission
6. **Whitelist**: If enabled, check if delegate is whitelisted
7. **Blacklist**: If enabled, check if delegate is blacklisted

## GranularResolver Integration

### Access Control Logic

The GranularResolver enforces access control for all setter functions:

```solidity
function isAuthorized(bytes32 node, address caller, uint256 requiredPermission) public view returns (bool)
```

A setter function is permitted if the caller satisfies **one** of the following conditions:

1. **ENS Registry Owner**: The caller is the ENS Registry owner of the node (unless owner override is disabled)
2. **GNA Delegate**: The caller is an authorized delegate with the required permission

### Owner Override Control

```solidity
function toggleOwnerOverride(bytes32 node, bool disabled) external
```

- Allows ENS owners to voluntarily relinquish operational rights
- Forces all record changes through GNA delegation matrix
- Enhances policy enforcement and security isolation

### Resolver Functions

The GranularResolver implements all standard ENS resolver functions with permission enforcement:

- `setAddr()` - Requires `SET_ADDR_RECORD` permission
- `setText()` - Requires `SET_TEXT_RECORD` permission
- `setContenthash()` - Requires `SET_CONTENT_HASH` permission
- `setPubkey()` - Requires `SET_PUBKEY` permission
- `setABI()` - Requires `SET_ABI` permission
- `setZonehash()` - Requires `SET_ZONEHASH` permission
- `setTTL()` - Requires `SET_TTL` permission
- `setInterface()` - Requires `SET_ABI` permission

## Security Considerations

### 1. Resolver Dependency Risk

**Critical**: The entire security policy depends on using the GranularResolver. The ENS Registry owner can bypass all GNA permissions by calling `setResolver()` to switch to a different resolver.

**Mitigation**: 
- Use NameWrapper fuses to restrict resolver changes
- Implement monitoring for resolver changes
- Consider multi-signature requirements for resolver changes

### 2. Scope Creep Risk

**Risk**: Delegation of `MANAGE_SUBDOMAINS` grants the ability to create and assign ownership of sub-sub-domains.

**Mitigation**:
- Carefully vet delegates granted this permission
- Implement subdomain creation policies
- Monitor subdomain creation activities

### 3. Permission Mask Collisions

**Risk**: Future ENS features may conflict with existing permission bits.

**Mitigation**:
- Reserve additional bits for future use
- Implement versioning for permission masks
- Document permission bit allocation

## Usage Examples

### Basic Delegation Setup

```solidity
// 1. Deploy contracts
GranularAssignmentController controller = new GranularAssignmentController();
GranularResolver resolver = new GranularResolver(controller.address);

// 2. Set resolver in ENS Registry
registry.setResolver(node, resolver.address);

// 3. Add delegate with specific permissions
uint256 expiresAt = block.timestamp + 30 days;
controller.addDelegate(
    node,
    delegateAddress,
    SET_ADDR_RECORD | SET_TEXT_RECORD,
    expiresAt
);

// 4. Delegate can now set records
resolver.setAddr(node, newAddress);
resolver.setText(node, "description", "Updated by delegate");
```

### Enterprise Segregation of Duties

```solidity
// Treasury team - can only set address records
controller.addDelegate(
    node,
    treasuryAddress,
    SET_ADDR_RECORD,
    block.timestamp + 90 days
);

// Marketing team - can only set text records
controller.addDelegate(
    node,
    marketingAddress,
    SET_TEXT_RECORD,
    block.timestamp + 30 days
);

// DevOps team - can manage subdomains
controller.addDelegate(
    node,
    devopsAddress,
    MANAGE_SUBDOMAINS,
    block.timestamp + 7 days
);
```

### Emergency Response

```solidity
// Emergency pause all delegations
controller.emergencyPause(node, true);

// Revoke all delegations
controller.emergencyRevokeAll(node);

// Trigger security alert
controller.triggerSecurityAlert(node, suspiciousDelegate, "Multiple failed attempts");
```

## Testing

The implementation includes comprehensive test coverage:

- Permission constant validation
- Delegation management operations
- Permission enforcement logic
- Emergency control functions
- GranularResolver integration
- Whitelist/blacklist functionality
- Locking mechanisms
- Gas optimization

Run tests with:
```bash
npx hardhat test test/GranularNameAssignment.test.js
```

## Deployment

### Prerequisites

1. Deploy GranularAssignmentController
2. Deploy GranularResolver with controller address
3. Set resolver in ENS Registry for target domains

### Configuration

1. Set maximum delegation durations
2. Configure whitelist/blacklist policies
3. Set up monitoring and alerting
4. Document delegation policies

## Future Enhancements

### Planned Features

1. **Multi-Signature Delegations**: Require multiple signatures for critical operations
2. **Time-Locked Operations**: Delayed execution for sensitive changes
3. **Cross-Chain Support**: Extend GNA to L2 networks
4. **Governance Integration**: DAO-controlled delegation policies
5. **Analytics Dashboard**: Real-time delegation monitoring

### Security Improvements

1. **Hardware Wallet Integration**: Support for hardware wallet delegation
2. **Biometric Authentication**: Additional security layers
3. **Risk Scoring**: Automated risk assessment for delegations
4. **Compliance Reporting**: Automated compliance and audit reports

## Conclusion

The GNA implementation provides a robust foundation for enterprise ENS management with fine-grained permission control. The system addresses critical needs for segregation of duties, policy-based automation, and security isolation while maintaining compatibility with existing ENS infrastructure.

The modular design allows for future enhancements and the comprehensive security controls provide multiple layers of protection against various attack vectors. The implementation is production-ready and includes extensive testing and documentation.
