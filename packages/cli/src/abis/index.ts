import type { Address } from 'viem';

export const CONTRACTS = {
  NAME_WRAPPER: (process.env.NAME_WRAPPER || '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401') as Address,
} as const;

export const NAME_WRAPPER_ABI = [
  {
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
