# Mainnet Fork Testing Guide

This guide explains how to test the controller with real ENS contracts using Hardhat's mainnet forking feature.

## Overview

When forking mainnet, Hardhat creates a local network that mirrors the state of Ethereum mainnet at a specific block. This allows us to:
- Test with real ENS contracts at their actual mainnet addresses
- Test subdomain operations that require the real ENS Registry
- Validate integration with the actual ENS ecosystem
- Test without spending real ETH or modifying mainnet state

## Prerequisites

1. An RPC endpoint that supports archival queries (Infura, Alchemy, etc.)
2. Environment variables configured

## Setup

### 1. Configure Environment Variables

Create or update your `.env` file:

```bash
# Enable mainnet forking
FORK_MAINNET=true

# RPC URL (required when forking)
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
# OR
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Optional: Fork at specific block number (for reproducibility)
FORK_BLOCK_NUMBER=18500000
```

### 2. Available Test Commands

```bash
# Run all tests with mainnet fork
npm run test:fork

# Run only the full automated test suite with fork
npm run test:fork:full

# Run specific test file with fork
FORK_MAINNET=true hardhat test test/FullControllerAutomated.test.js
```

## How It Works

### Automatic Detection

The test suite automatically detects when you're forking mainnet by checking if the ENS Registry contract exists at the mainnet address. When detected:

1. **Real Contracts**: Uses actual ENS contracts at:
   - ENS Registry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
   - NameWrapper: `0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401`

2. **Subdomain Tests**: Automatically enables the 3 previously skipped subdomain tests

3. **Test Domain**: Uses `test-controller-fork.eth` for testing (you'll need to own this or use a test domain)

### Fork vs Mock Mode

| Feature | Mock Mode (Default) | Fork Mode |
|---------|---------------------|-----------|
| ENS Registry | MockENSRegistry | Real mainnet contract |
| NameWrapper | MockNameWrapper | Real mainnet contract |
| Subdomain Tests | Skipped (3 tests) | Enabled (3 tests) |
| Network State | Empty | Mirrors mainnet |
| Setup Required | None | RPC endpoint |

## Important Notes

### Domain Ownership

For subdomain operations to work in fork mode, you need a domain you can control. Options:

1. **Use a domain you own**: If you own a domain on mainnet, you can use it for testing
2. **Use a test domain**: Modify the test to use a domain you control
3. **Impersonate owner**: Use Hardhat's `impersonateAccount` feature to impersonate a domain owner

### Example: Impersonating Domain Owner

```javascript
const { impersonateAccount } = require("@nomicfoundation/hardhat-network-helpers");

// Impersonate the owner of a real domain
const domainOwner = "0x..."; // Address that owns a domain
await impersonateAccount(domainOwner);
const ownerSigner = await ethers.getSigner(domainOwner);

// Now you can use this signer to control the domain
await ensRegistry.connect(ownerSigner).setSubnodeRecord(...);
```

### Block Number

Forking at a specific block number:
- **Pros**: Reproducible, consistent test results
- **Cons**: May not reflect latest mainnet state

Leaving it undefined:
- **Pros**: Always uses latest mainnet state
- **Cons**: Tests may vary between runs

### RPC Limitations

Some free RPC providers have rate limits. Consider:
- Using paid plans for frequent testing
- Caching fork state locally
- Using block number pinning to reduce RPC calls

## Testing Workflow

### 1. Local Testing (Fast, No RPC Required)
```bash
npm test
```
- Uses mocks
- All tests except subdomain operations
- No external dependencies

### 2. Fork Testing (Real Contracts)
```bash
npm run test:fork:full
```
- Uses real ENS contracts
- All tests including subdomain operations
- Requires RPC endpoint
- Slower due to network calls

### 3. CI/CD Integration

For CI/CD pipelines, you can conditionally enable forking:

```yaml
# GitHub Actions example
- name: Run tests
  env:
    FORK_MAINNET: ${{ github.event_name == 'pull_request' && 'false' || 'true' }}
    RPC_URL: ${{ secrets.RPC_URL }}
  run: npm test
```

## Troubleshooting

### Error: "Network request failed"
- Check your RPC_URL is correct and accessible
- Verify your API key has sufficient quota
- Try a different RPC provider

### Error: "Nonce too high"
- This happens when the forked state gets out of sync
- Restart Hardhat node
- Use a specific block number for consistency

### Tests timing out
- Increase test timeout in hardhat.config.js
- Use a faster RPC endpoint
- Consider using a local archive node for faster access

### Subdomain tests still failing
- Verify you're using a domain you can control
- Check the domain actually exists on mainnet at the forked block
- Ensure the controller has proper permissions

## Best Practices

1. **Use specific block numbers** for reproducible CI/CD tests
2. **Cache fork state** when possible to speed up repeated test runs
3. **Use mock mode** for most development (faster, no external deps)
4. **Use fork mode** for integration testing before deployment
5. **Monitor RPC usage** to avoid hitting rate limits

## Advanced: Custom Fork Configuration

You can also fork other networks:

```javascript
// In hardhat.config.js
hardhat: {
  forking: {
    url: process.env.SEPOLIA_RPC_URL,
    blockNumber: 5000000, // Sepolia block number
  }
}
```

Then update the test to detect Sepolia ENS addresses if needed.

