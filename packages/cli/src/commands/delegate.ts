import { Command } from 'commander';
import { Address } from 'viem';
import { getPublicClient, getWalletClient } from '../config';
import { displaySuccess, displayError, displayInfo, waitForTransaction, validateDomain, validateAddress } from '../utils/helpers';
import { domainToNode, resolveDelegateAddress } from '../utils/contracts';
import { DELEGATE_ABI } from '../abis';

const program = new Command();

program
  .name('delegate')
  .description('Basic delegation operations for ENS domains');

program
  .command('set')
  .description('Set delegation for a domain')
  .argument('<domain>', 'Domain name to delegate')
  .option('-p, --primary <address>', 'Primary delegate address')
  .option('-s, --secondary <address>', 'Secondary delegate address')
  .option('-e, --expires <timestamp>', 'Expiration timestamp (0 for no expiration)')
  .option('-d, --delegate <address>', 'Basic delegate contract address')
  .action(async (domain: string, options: { primary?: string; secondary?: string; expires?: string; delegate?: string }) => {
    try {
      const normalizedDomain = validateDomain(domain);
      if (!options.primary) throw new Error('Primary delegate address is required');

      const primaryAddress = validateAddress(options.primary);
      const secondaryAddress = options.secondary ? validateAddress(options.secondary) : '0x0000000000000000000000000000000000000000' as Address;
      const expires = options.expires ? BigInt(options.expires) : 0n;
      const delegateContract = resolveDelegateAddress(options.delegate);
      const walletClient = getWalletClient();
      const node = domainToNode(normalizedDomain);

      displayInfo(`Setting delegation for ${normalizedDomain}...`);
      const hash = await walletClient.writeContract({
        address: delegateContract,
        abi: DELEGATE_ABI,
        functionName: 'setDelegation',
        args: [node, primaryAddress, secondaryAddress, expires],
      });
      await waitForTransaction(hash);
      displaySuccess(`Delegation set for ${normalizedDomain}`);
    } catch (error) {
      displayError(`Failed to set delegation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('get')
  .description('Get delegation information for a domain')
  .argument('<domain>', 'Domain name to check')
  .option('-d, --delegate <address>', 'Basic delegate contract address')
  .action(async (domain: string, options: { delegate?: string }) => {
    try {
      const normalizedDomain = validateDomain(domain);
      const publicClient = getPublicClient();
      const delegateContract = resolveDelegateAddress(options.delegate);
      const node = domainToNode(normalizedDomain);

      const delegation = await publicClient.readContract({
        address: delegateContract,
        abi: DELEGATE_ABI,
        functionName: 'getDelegation',
        args: [node],
      }) as { primaryDelegate: Address; secondaryDelegate: Address; expiresAt: bigint; isActive: boolean };

      displayInfo(`Delegation for ${normalizedDomain}:`);
      displayInfo(`  Primary:   ${delegation.primaryDelegate}`);
      displayInfo(`  Secondary: ${delegation.secondaryDelegate}`);
      displayInfo(`  Expires:   ${delegation.expiresAt.toString()}`);
      displayInfo(`  Active:    ${delegation.isActive}`);
    } catch (error) {
      displayError(`Failed to get delegation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('revoke')
  .description('Revoke delegation for a domain')
  .argument('<domain>', 'Domain name to revoke delegation for')
  .option('-d, --delegate <address>', 'Basic delegate contract address')
  .action(async (domain: string, options: { delegate?: string }) => {
    try {
      const normalizedDomain = validateDomain(domain);
      const walletClient = getWalletClient();
      const delegateContract = resolveDelegateAddress(options.delegate);
      const node = domainToNode(normalizedDomain);

      const hash = await walletClient.writeContract({
        address: delegateContract,
        abi: DELEGATE_ABI,
        functionName: 'revokeDelegation',
        args: [node],
      });
      await waitForTransaction(hash);
      displaySuccess(`Delegation revoked for ${normalizedDomain}`);
    } catch (error) {
      displayError(`Failed to revoke delegation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('check')
  .description('Check if an address is authorized on a domain')
  .argument('<domain>', 'Domain name to check')
  .argument('<address>', 'Address to check permissions for')
  .option('-d, --delegate <address>', 'Basic delegate contract address')
  .action(async (domain: string, address: string, options: { delegate?: string }) => {
    try {
      const normalizedDomain = validateDomain(domain);
      const checkAddress = validateAddress(address);
      const publicClient = getPublicClient();
      const delegateContract = resolveDelegateAddress(options.delegate);
      const node = domainToNode(normalizedDomain);

      const authorized = await publicClient.readContract({
        address: delegateContract,
        abi: DELEGATE_ABI,
        functionName: 'isAuthorizedDelegate',
        args: [node, checkAddress],
      });

      displayInfo(`Authorization for ${checkAddress} on ${normalizedDomain}: ${authorized ? 'yes' : 'no'}`);
    } catch (error) {
      displayError(`Failed to check permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('create-subdomain')
  .description('Create a subdomain via delegation')
  .argument('<domain>', 'Parent domain name')
  .argument('<subdomain>', 'Subdomain label to create')
  .option('-o, --owner <address>', 'Owner address for the subdomain')
  .option('-r, --resolver <address>', 'Resolver address for the subdomain')
  .option('-t, --ttl <seconds>', 'TTL for the subdomain')
  .option('-d, --delegate <address>', 'Basic delegate contract address')
  .action(async (domain: string, subdomain: string, options: { owner?: string; resolver?: string; ttl?: string; delegate?: string }) => {
    try {
      const normalizedDomain = validateDomain(domain);
      if (!options.owner) throw new Error('Owner address is required');

      const ownerAddress = validateAddress(options.owner);
      const resolverAddress = options.resolver ? validateAddress(options.resolver) : '0x0000000000000000000000000000000000000000' as Address;
      const ttl = options.ttl ? BigInt(options.ttl) : 0n;
      const walletClient = getWalletClient();
      const delegateContract = resolveDelegateAddress(options.delegate);
      const node = domainToNode(normalizedDomain);

      const hash = await walletClient.writeContract({
        address: delegateContract,
        abi: DELEGATE_ABI,
        functionName: 'createSubdomain',
        args: [node, subdomain.toLowerCase(), ownerAddress, resolverAddress, ttl],
      });
      await waitForTransaction(hash);
      displaySuccess(`Subdomain ${subdomain}.${normalizedDomain} created`);
    } catch (error) {
      displayError(`Failed to create subdomain: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

export default program;
