import { Address } from 'viem';
import { namehash, normalize } from 'viem/ens';
import { config } from '../config';
import { displayError } from './helpers';

export function domainToNode(domain: string): `0x${string}` {
  return namehash(normalize(domain));
}

export function resolveFactoryAddress(override?: string): Address {
  const address = override || config.factoryAddress;
  if (!address) {
    displayError('Factory address required. Set FACTORY_ADDRESS or pass --factory');
    throw new Error('Factory address not configured');
  }
  return address;
}

export function resolveDelegateAddress(override?: string): Address {
  const address = override || config.delegateAddress;
  if (!address) {
    displayError('Delegate address required. Set DELEGATE_ADDRESS or pass --delegate');
    throw new Error('Delegate address not configured');
  }
  return address;
}

export function resolveGranularAddress(override?: string): Address {
  const address = override || config.granularDelegateAddress;
  if (!address) {
    displayError('Granular delegate address required. Set GRANULAR_DELEGATE_ADDRESS or pass --granular');
    throw new Error('Granular delegate address not configured');
  }
  return address;
}

export function parseOperationsBitmask(value?: string): bigint {
  if (!value) return 1n;
  if (value.includes(',')) {
    return value.split(',').reduce((mask, part) => {
      const trimmed = part.trim();
      if (trimmed.startsWith('0x')) {
        return mask | BigInt(trimmed);
      }
      const named = trimmed.toUpperCase().replace(/-/g, '_');
      const map: Record<string, bigint> = {
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
      };
      if (map[named] !== undefined) {
        return mask | map[named];
      }
      return mask | BigInt(trimmed);
    }, 0n);
  }
  return BigInt(value);
}
