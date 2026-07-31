import { Command } from 'commander';
import { Address } from 'viem';
import { getPublicClient, getWalletClient } from '../config';
import { displaySuccess, displayError, displayInfo, waitForTransaction, validateDomain, validateAddress } from '../utils/helpers';
import { domainToNode, resolveGranularAddress, parseOperationsBitmask } from '../utils/contracts';
import { GRANULAR_ABI } from '../abis';

const program = new Command();

program
  .name('granular')
  .description('Granular delegation operations with fine-grained permissions');

function getGranularContract(option?: string) {
  return resolveGranularAddress(option);
}

program
  .command('add')
  .description('Add a delegate with specific permissions')
  .argument('<domain>', 'Domain name to add delegate for')
  .argument('<address>', 'Delegate address to add')
  .option('-o, --operations <bitmask>', 'Permission bitmask or comma-separated names (e.g., SET_TEXT_RECORD,4)')
  .option('-e, --expires <timestamp>', 'Expiration timestamp (0 for no expiration)')
  .option('-g, --granular <address>', 'Granular delegate contract address')
  .action(async (domain: string, address: string, options: { operations?: string; expires?: string; granular?: string }) => {
    try {
      const normalizedDomain = validateDomain(domain);
      const delegateAddress = validateAddress(address);
      const operations = parseOperationsBitmask(options.operations);
      const expires = options.expires ? BigInt(options.expires) : 0n;
      const walletClient = getWalletClient();
      const granularContract = getGranularContract(options.granular);
      const node = domainToNode(normalizedDomain);

      const hash = await walletClient.writeContract({
        address: granularContract,
        abi: GRANULAR_ABI,
        functionName: 'addDelegate',
        args: [node, delegateAddress, operations, expires],
      });
      await waitForTransaction(hash);
      displaySuccess(`Granular delegate added for ${normalizedDomain}`);
    } catch (error) {
      displayError(`Failed to add granular delegate: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('remove')
  .description('Remove a granular delegate')
  .argument('<domain>', 'Domain name')
  .argument('<address>', 'Delegate address to remove')
  .option('-g, --granular <address>', 'Granular delegate contract address')
  .action(async (domain: string, address: string, options: { granular?: string }) => {
    try {
      const walletClient = getWalletClient();
      const granularContract = getGranularContract(options.granular);
      const node = domainToNode(validateDomain(domain));
      const delegateAddress = validateAddress(address);

      const hash = await walletClient.writeContract({
        address: granularContract,
        abi: GRANULAR_ABI,
        functionName: 'removeDelegate',
        args: [node, delegateAddress],
      });
      await waitForTransaction(hash);
      displaySuccess(`Granular delegate removed`);
    } catch (error) {
      displayError(`Failed to remove granular delegate: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

['lock', 'unlock', 'enable', 'disable'].forEach((action) => {
  program
    .command(action)
    .description(`${action.charAt(0).toUpperCase()}${action.slice(1)} a granular delegate`)
    .argument('<domain>', 'Domain name')
    .argument('<address>', 'Delegate address')
    .option('-g, --granular <address>', 'Granular delegate contract address')
    .action(async (domain: string, address: string, options: { granular?: string }) => {
      try {
        const walletClient = getWalletClient();
        const granularContract = getGranularContract(options.granular);
        const node = domainToNode(validateDomain(domain));
        const delegateAddress = validateAddress(address);
        const fn = `${action}Delegate` as 'lockDelegate' | 'unlockDelegate' | 'enableDelegate' | 'disableDelegate';

        const hash = await walletClient.writeContract({
          address: granularContract,
          abi: GRANULAR_ABI,
          functionName: fn,
          args: [node, delegateAddress],
        });
        await waitForTransaction(hash);
        displaySuccess(`Delegate ${action}d`);
      } catch (error) {
        displayError(`Failed to ${action} delegate: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });
});

program
  .command('list')
  .description('List all granular delegates for a domain')
  .argument('<domain>', 'Domain name')
  .option('-g, --granular <address>', 'Granular delegate contract address')
  .action(async (domain: string, options: { granular?: string }) => {
    try {
      const publicClient = getPublicClient();
      const granularContract = getGranularContract(options.granular);
      const node = domainToNode(validateDomain(domain));

      const delegates = await publicClient.readContract({
        address: granularContract,
        abi: GRANULAR_ABI,
        functionName: 'getAllDelegates',
        args: [node],
      }) as Address[];

      if (delegates.length === 0) {
        displayInfo('No delegates configured');
        return;
      }

      for (const delegate of delegates) {
        const info = await publicClient.readContract({
          address: granularContract,
          abi: GRANULAR_ABI,
          functionName: 'getDelegateInfo',
          args: [node, delegate],
        }) as { allowedOperations: bigint; expiresAt: bigint; enabled: boolean; locked: boolean };

        displayInfo(`${delegate}`);
        displayInfo(`  operations=${info.allowedOperations.toString()} enabled=${info.enabled} locked=${info.locked}`);
      }
    } catch (error) {
      displayError(`Failed to list delegates: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

function listCommand(kind: 'whitelist' | 'blacklist') {
  program
    .command(kind)
    .description(`Manage ${kind} for granular delegates`)
    .argument('<domain>', 'Domain name')
    .argument('<action>', 'Action: add, remove, toggle')
    .argument('[address]', 'Address to add/remove')
    .option('-g, --granular <address>', 'Granular delegate contract address')
    .action(async (domain: string, action: string, address: string | undefined, options: { granular?: string }) => {
      try {
        const walletClient = getWalletClient();
        const granularContract = getGranularContract(options.granular);
        const node = domainToNode(validateDomain(domain));

        if (action === 'toggle') {
          const hash = await walletClient.writeContract({
            address: granularContract,
            abi: GRANULAR_ABI,
            functionName: kind === 'whitelist' ? 'toggleWhitelist' : 'toggleBlacklist',
            args: [node, true],
          });
          await waitForTransaction(hash);
          displaySuccess(`${kind} toggled`);
          return;
        }

        if (!address) throw new Error('Address is required for add/remove actions');
        const delegateAddress = validateAddress(address);
        const added = action === 'add';

        const hash = await walletClient.writeContract({
          address: granularContract,
          abi: GRANULAR_ABI,
          functionName: kind === 'whitelist' ? 'updateWhitelist' : 'updateBlacklist',
          args: [node, delegateAddress, added],
        });
        await waitForTransaction(hash);
        displaySuccess(`${kind} ${action} completed`);
      } catch (error) {
        displayError(`Failed to manage ${kind}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });
}

listCommand('whitelist');
listCommand('blacklist');

export default program;
