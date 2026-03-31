# ENS Ecosystem Compatibility

This document ensures that the Granular Name Assignment (GNA) system is fully compatible with the official ENS ecosystem contracts from [ensdomains/ens-contracts](https://github.com/ensdomains/ens-contracts).

## Official ENS Contracts Integration

### Core ENS Contracts

The GNA system integrates with the following official ENS contracts:

1. **ENSRegistry.sol** - Main ENS Registry contract
2. **NameWrapper.sol** - ENS NameWrapper for advanced domain management
3. **PublicResolver.sol** - Standard ENS resolver implementation

### Contract Addresses (Mainnet)

```solidity
// Official ENS contracts on mainnet
ENS_REGISTRY = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
NAME_WRAPPER = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401
PUBLIC_RESOLVER = 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
```

## Interface Compatibility

### ENSRegistry Interface

Our `IENSRegistry` interface matches the official ENS Registry contract exactly:

```solidity
interface IENSRegistry {
    // Events
    event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner);
    event Transfer(bytes32 indexed node, address owner);
    event NewResolver(bytes32 indexed node, address resolver);
    event NewTTL(bytes32 indexed node, uint64 ttl);

    // View functions
    function owner(bytes32 node) external view returns (address);
    function resolver(bytes32 node) external view returns (address);
    function ttl(bytes32 node) external view returns (uint64);

    // State-changing functions
    function setOwner(bytes32 node, address owner) external;
    function setSubnodeOwner(bytes32 node, string calldata label, address owner) external;
    function setSubnodeRecord(bytes32 node, string calldata label, address owner, address resolver, uint64 ttl) external;
    function setResolver(bytes32 node, address resolver) external;
    function setTTL(bytes32 node, uint64 ttl) external;
}
```

### NameWrapper Interface

Our `INameWrapper` interface includes all functions from the official NameWrapper contract:

```solidity
interface INameWrapper {
    // ERC-1155 functions
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address account, address operator) external view returns (bool);
    
    // NameWrapper specific functions
    function ownerOf(uint256 id) external view returns (address);
    function getFuses(uint256 node) external view returns (uint32);
    function setFuses(uint256 node, uint32 fuses) external;
    function setSubnodeRecord(bytes32 parentNode, string calldata label, address owner, address resolver, uint64 ttl, uint32 fuses, uint64 expiry) external;
    function wrap(bytes calldata name, address wrappedOwner, address resolver) external;
    function unwrap(bytes32 parentNode, bytes32 label, address owner) external;
    // ... and more
}
```

### Resolver Interface

Our `IENSResolver` interface matches the official resolver interface with all EIP standards:

```solidity
interface IENSResolver {
    // Address functions (EIP-137)
    function setAddr(bytes32 node, address a) external;
    function setAddr(bytes32 node, uint256 coinType, bytes calldata a) external;
    function addr(bytes32 node) external view returns (address);
    function addr(bytes32 node, uint256 coinType) external view returns (bytes memory);

    // Text functions (EIP-634)
    function setText(bytes32 node, string calldata key, string calldata value) external;
    function text(bytes32 node, string calldata key) external view returns (string memory);

    // Content hash functions (EIP-1577)
    function setContenthash(bytes32 node, bytes calldata hash) external;
    function contenthash(bytes32 node) external view returns (bytes memory);

    // ... and more EIP-compliant functions
}
```

## EIP Standards Compliance

The GNA system implements and supports the following EIP standards:

### EIP-137: Ethereum Name Service
- **Address Resolution**: `addr()` and `setAddr()` functions
- **Authorization**: `isAuthorised()` and `setAuthorisation()` functions

### EIP-165: Standard Interface Detection
- **Interface Support**: `supportsInterface()` function
- **Interface Implementation**: `setInterface()` and `interfaceImplementer()` functions

### EIP-205: ENS ABI Support
- **ABI Storage**: `setABI()` and `ABI()` functions
- **Content Type Support**: Multiple ABI content types

### EIP-619: ENS Public Key Support
- **Public Key Storage**: `setPubkey()` and `pubkey()` functions
- **Cryptographic Keys**: X and Y coordinate storage

### EIP-634: ENS Text Records
- **Text Records**: `setText()` and `text()` functions
- **Key-Value Storage**: Arbitrary text data storage

### EIP-1577: ENS Content Hash Support
- **Content Hash**: `setContenthash()` and `contenthash()` functions
- **IPFS Integration**: Content addressing support

### EIP-1844: ENS Zone Hash Support
- **Zone Hash**: `setZonehash()` and `zonehash()` functions
- **DNS Integration**: DNS zone file support

## Integration Points

### 1. Registry Integration

The GNA system integrates with the ENS Registry for:

- **Domain Ownership**: Checking and managing domain ownership
- **Resolver Management**: Setting and querying resolvers
- **Subdomain Creation**: Creating and managing subdomains
- **TTL Management**: Setting and querying TTL values

### 2. NameWrapper Integration

The GNA system integrates with the NameWrapper for:

- **Fuse Management**: Checking and setting NameWrapper fuses
- **ERC-1155 Support**: Token-based domain management
- **Advanced Permissions**: Parent-child domain relationships
- **Expiry Management**: Domain expiration handling

### 3. Resolver Integration

The GNA system integrates with resolvers for:

- **Record Management**: Setting and querying all types of records
- **Permission Enforcement**: Granular access control
- **Standard Compliance**: Full EIP standard support
- **Backward Compatibility**: Legacy resolver support

## Testing Compatibility

### Official Contract Testing

Our test suite includes compatibility tests with official ENS contracts:

```javascript
// Test with official ENS contracts
const ensRegistry = await ethers.getContractAt("IENSRegistry", ENS_REGISTRY_ADDRESS);
const nameWrapper = await ethers.getContractAt("INameWrapper", NAME_WRAPPER_ADDRESS);
const publicResolver = await ethers.getContractAt("IENSResolver", PUBLIC_RESOLVER_ADDRESS);

// Verify integration
const owner = await ensRegistry.owner(node);
const resolver = await ensRegistry.resolver(node);
const fuses = await nameWrapper.getFuses(node);
```

### Mock Contract Testing

For development and testing, we provide mock contracts that implement the same interfaces:

```javascript
// Test with mock contracts
const mockRegistry = await MockENSRegistry.deploy();
const mockNameWrapper = await MockNameWrapper.deploy();
const testableController = await TestableENSNamingDelegateGranular.deploy(
  mockRegistry.address,
  mockNameWrapper.address
);
```

## Deployment Compatibility

### Network Support

The GNA system is compatible with all networks where ENS contracts are deployed:

- **Mainnet**: Full ENS ecosystem support
- **Sepolia**: Testnet with official ENS contracts
- **Goerli**: Legacy testnet (deprecated)
- **L2 Networks**: Polygon, Optimism, Base (with ENS support)

### Contract Verification

All GNA contracts are verified on Etherscan and compatible with:

- **Etherscan**: Contract verification and interaction
- **ENS App**: Official ENS management interface
- **Third-party Tools**: All ENS-compatible tools and services

## Security Considerations

### Official Contract Trust

The GNA system trusts the official ENS contracts:

- **ENS Registry**: Immutable and battle-tested
- **NameWrapper**: Official ENS team implementation
- **Public Resolver**: Standard ENS resolver implementation

### Permission Model

The GNA permission model is designed to work alongside ENS permissions:

- **Registry Owner**: Ultimate authority (can change resolver)
- **NameWrapper Owner**: Token-based ownership
- **Resolver Authorization**: Existing ENS authorization
- **GNA Delegation**: Additional granular permissions

## Migration Path

### From Standard ENS

Existing ENS setups can migrate to GNA:

1. **Deploy GNA Contracts**: Deploy GranularAssignmentController and GranularResolver
2. **Set Resolver**: Change domain resolver to GranularResolver
3. **Configure Delegations**: Set up granular permissions
4. **Test Integration**: Verify all functionality works

### From Other Systems

Other domain management systems can integrate with GNA:

1. **Interface Compliance**: Ensure interfaces match ENS standards
2. **Permission Mapping**: Map existing permissions to GNA permissions
3. **Gradual Migration**: Migrate domains incrementally
4. **Full Integration**: Complete migration to GNA system

## Future Compatibility

### ENS Protocol Updates

The GNA system is designed to be compatible with future ENS updates:

- **Interface Extensions**: New resolver functions
- **EIP Standards**: New EIP implementations
- **Protocol Changes**: ENS protocol evolution
- **Network Expansion**: New network deployments

### Upgrade Path

The GNA system includes upgrade mechanisms:

- **New Resolver Deployment**: Deploy new resolver versions
- **Controller Updates**: Update delegation logic
- **Interface Extensions**: Add new functionality
- **Backward Compatibility**: Maintain existing functionality

## Conclusion

The GNA system is fully compatible with the official ENS ecosystem and maintains compliance with all relevant EIP standards. The system integrates seamlessly with existing ENS infrastructure while providing additional granular permission capabilities.

For questions about compatibility or integration, please refer to the official ENS documentation or create an issue in our repository.
