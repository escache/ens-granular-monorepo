import { isAddress } from 'viem';

export function validateAddress(address: string): { valid: boolean; error?: string } {
  if (!address || address.trim() === '') {
    return { valid: false, error: 'Address is required' };
  }
  
  if (!isAddress(address)) {
    return { valid: false, error: 'Invalid Ethereum address format' };
  }
  
  return { valid: true };
}

export function validateDomain(domain: string): { valid: boolean; error?: string } {
  if (!domain || domain.trim() === '') {
    return { valid: false, error: 'Domain is required' };
  }
  
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.eth$/i;
  
  if (!domainRegex.test(domain)) {
    return { valid: false, error: 'Invalid ENS domain format (must end with .eth)' };
  }
  
  return { valid: true };
}

export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    
    if (message.includes('user rejected')) {
      return 'Transaction was rejected by user';
    }
    
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    
    if (message.includes('nonce')) {
      return 'Transaction nonce error. Please try again.';
    }
    
    if (message.includes('revert')) {
      const revertReason = message.match(/revert\s+(.+)/i)?.[1];
      if (revertReason) {
        return `Transaction failed: ${revertReason}`;
      }
      return 'Transaction was reverted by the contract';
    }
    
    return message;
  }
  
  return 'An unknown error occurred';
}

