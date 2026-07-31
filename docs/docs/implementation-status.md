---
sidebar_position: 3
---

# Implementation Status

This page tracks what is implemented in the codebase versus what is planned.

## Implemented

| Area | Status | Notes |
|------|--------|-------|
| Granular delegate permissions | ✅ | Bitmask permissions, whitelist/blacklist, lock/enable |
| Basic delegation | ✅ | Primary/secondary delegates with expiry |
| Factory (ENSNamingDelegateFactory) | ✅ | Project isolation with ownership transfer |
| UI wallet connect | ✅ | MetaMask + WalletConnect via wagmi v2 |
| CLI `approve` | ✅ | NameWrapper `setApprovalForAll` |
| CLI `factory`, `delegate`, `granular` | ✅ | Real contract calls (requires env addresses) |
| Assembly gate | ✅ | `npm run assembly:gate` |

## Partial / requires configuration

| Area | Status | Notes |
|------|--------|-------|
| Mainnet/Sepolia deployments | ⚠️ | Set `VITE_FACTORY_ADDRESS_*` and deploy contracts |
| Subdomain ENS ops | ⚠️ | Requires NameWrapper `setApprovalForAll` on delegate |
| Indexed ENS stack | ⚠️ | Factory uses external deployer; deploy `IndexedENSDeployer` first |
| Export/Import | ⚠️ | UI scaffold; use CLI `granular list` for on-chain data |

## Not yet production-ready

| Area | Status | Notes |
|------|--------|-------|
| Third-party audit | ❌ | Not scheduled |
| ENSIP ratification | ❌ | Draft only |
| Mainnet reference deployment | ❌ | Addresses not published |

## Local development

```bash
npm install
npm run dev:ui          # http://localhost:3000
npm run assembly:gate   # build + test + lint
```

See [Quickstart](./quickstart.md) and [Installation](./installation.md) for details.
