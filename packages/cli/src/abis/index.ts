import type { Address } from 'viem';
import FactoryABI from './FactoryABI.json';
import DelegateABI from './DelegateABI.json';
import GranularABI from './GranularABI.json';

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
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const ENS_REGISTRY_ABI = [
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const FACTORY_ABI = FactoryABI as readonly unknown[];
export const DELEGATE_ABI = DelegateABI as readonly unknown[];
export const GRANULAR_ABI = GranularABI as readonly unknown[];

export const PERMISSIONS = {
  MANAGE_SUBDOMAINS: 1n,
  SET_ADDR_RECORD: 2n,
  SET_TEXT_RECORD: 4n,
  SET_CONTENT_HASH: 8n,
  SET_PUBKEY: 16n,
  SET_ABI: 32n,
  SET_ZONEHASH: 64n,
  SET_TTL: 128n,
  SET_RESOLVER: 256n,
  SET_OWNER: 512n,
  SET_FUSES: 1024n,
} as const;
