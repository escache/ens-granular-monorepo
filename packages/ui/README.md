# ENS Granular Delegation UI

Web user interface for managing ENS domains with granular delegation capabilities.

## Features

- Factory Operations: Create and manage delegate contracts for projects
- Delegation Management: Set, view, and revoke domain delegations
- Granular Permissions: Manage fine-grained permissions for delegates
- Subdomain Creation: Create subdomains with delegation support
- Approval Management: Set NameWrapper approvals for delegate contracts

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
cd packages/ui
npm install
```

## Configuration

Before using the UI, you need to:

1. Update contract addresses in `src/config/contracts.ts`
2. (Optional) Set `VITE_WALLET_CONNECT_PROJECT_ID` in `.env` for WalletConnect support

## Development

```bash
npm run dev
```

The UI will be available at `http://localhost:3000`

## Build

```bash
npm run build
```

## Project Structure

```
packages/ui/
├── src/
│   ├── components/          # React components
│   │   ├── App.tsx          # Main app component
│   │   ├── ConnectButton.tsx
│   │   ├── FactoryOperations.tsx
│   │   ├── DelegationManagement.tsx
│   │   ├── GranularPermissions.tsx
│   │   ├── SubdomainCreation.tsx
│   │   └── ApprovalManagement.tsx
│   ├── config/              # Configuration files
│   │   ├── wagmi.ts         # Web3 configuration
│   │   └── contracts.ts     # Contract addresses and constants
│   ├── abis/                # Contract ABIs
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json
└── vite.config.ts
```

## Usage

1. Connect your wallet using MetaMask or WalletConnect
2. Navigate through the tabs:
   - **Factory**: Create new project delegates
   - **Delegation**: Set basic delegations for domains
   - **Granular Permissions**: Manage fine-grained permissions
   - **Subdomains**: Create subdomains
   - **Approvals**: Set NameWrapper approvals

## Contract Integration

The UI integrates with:
- ENSNamingDelegateFactory: Factory contract for creating delegates
- ENSNamingDelegate: Basic delegation contract
- ENSNamingDelegateGranular: Granular permissions contract
- NameWrapper: ENS NameWrapper for approvals

## Notes

- The factory contract address needs to be configured for your deployment network
- Make sure you have proper approvals set before delegating domains
- All transactions require wallet confirmation



