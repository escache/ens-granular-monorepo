import { Address } from 'viem';

export const CONTRACT_ADDRESSES: Record<number, {
  factory: Address;
  nameWrapper: Address;
  ensRegistry: Address;
  publicResolver: Address;
  granularController?: Address;
  granularResolver?: Address;
}> = {
  1: {
    factory: '0x0000000000000000000000000000000000000000', // Update with deployed address
    nameWrapper: '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401',
    ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    publicResolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
  },
  11155111: {
    factory: '0x0000000000000000000000000000000000000000', // Update with deployed address
    nameWrapper: '0x0635513f179D50A207757E05759CbD106d7dFcE8',
    ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    publicResolver: '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD',
  },
  31337: {
    factory: '0xe2A04F5d91D1AD137f854C5820C76e5b711158c5',
    nameWrapper: '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401',
    ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    publicResolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    granularController: '0xe1fC830Bf20308cBBa2B248C543E305b979A64Ec',
    granularResolver: '0x866bF431d7043c9A0AD8E9259ca291EeB2305a8a',
  },
};

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

export const PERMISSION_NAMES: Record<string, string> = {
  '1': 'Manage Subdomains',
  '2': 'Set Address Record',
  '4': 'Set Text Record',
  '8': 'Set Content Hash',
  '16': 'Set Public Key',
  '32': 'Set ABI',
  '64': 'Set Zonehash',
  '128': 'Set TTL',
  '256': 'Set Resolver',
  '512': 'Set Owner',
  '1024': 'Set Fuses',
};

