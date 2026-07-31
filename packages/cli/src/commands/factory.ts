import { Command } from 'commander';
import { Address } from 'viem';
import { getPublicClient, getWalletClient, config } from '../config';
import { displaySuccess, displayError, displayInfo, waitForTransaction, validateAddress } from '../utils/helpers';
import { resolveFactoryAddress } from '../utils/contracts';
import { FACTORY_ABI } from '../abis';

const program = new Command();

program
  .name('factory')
  .description('Factory contract operations for creating and managing delegate contracts');

program
  .command('create')
  .description('Create a new delegate contract pair for a project')
  .argument('<project>', 'Project name (e.g., my-project)')
  .option('-o, --owner <address>', 'Owner address for the delegate contracts')
  .option('-f, --factory <address>', 'Factory contract address')
  .action(async (project: string, options: { owner?: string; factory?: string }) => {
    try {
      const factoryAddress = resolveFactoryAddress(options.factory);
      const walletClient = getWalletClient();
      if (!walletClient.account) {
        throw new Error('No wallet account available');
      }

      const owner = options.owner ? validateAddress(options.owner) : walletClient.account.address;
      displayInfo(`Creating project "${project}" with owner ${owner}...`);

      const hash = await walletClient.writeContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: 'createProject',
        args: [project, owner],
      });

      const receipt = await waitForTransaction(hash);
      displaySuccess(`Project "${project}" created`);
      displayInfo(`Transaction: ${receipt.transactionHash}`);
      displayInfo('Use "factory get <project>" to read deployed delegate addresses');
    } catch (error) {
      displayError(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('get')
  .description('Get delegate contract addresses for a project')
  .argument('<project>', 'Project name')
  .option('-f, --factory <address>', 'Factory contract address')
  .action(async (project: string, options: { factory?: string }) => {
    try {
      const factoryAddress = resolveFactoryAddress(options.factory);
      const publicClient = getPublicClient();

      const projectInfo = await publicClient.readContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: 'getProject',
        args: [project],
      }) as {
        basicDelegate: Address;
        granularDelegate: Address;
        owner: Address;
        isActive: boolean;
      };

      displayInfo(`Project: ${project}`);
      displayInfo(`  Basic delegate:    ${projectInfo.basicDelegate}`);
      displayInfo(`  Granular delegate: ${projectInfo.granularDelegate}`);
      displayInfo(`  Owner:             ${projectInfo.owner}`);
      displayInfo(`  Active:            ${projectInfo.isActive}`);
    } catch (error) {
      displayError(`Failed to get project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all deployed projects')
  .option('-f, --factory <address>', 'Factory contract address')
  .action(async (options: { factory?: string }) => {
    try {
      const factoryAddress = resolveFactoryAddress(options.factory);
      const publicClient = getPublicClient();

      const names = await publicClient.readContract({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: 'getAllProjects',
      }) as string[];

      if (names.length === 0) {
        displayInfo('No projects deployed');
        return;
      }

      for (const name of names) {
        const projectInfo = await publicClient.readContract({
          address: factoryAddress,
          abi: FACTORY_ABI,
          functionName: 'getProject',
          args: [name],
        }) as {
          basicDelegate: Address;
          granularDelegate: Address;
          owner: Address;
          isActive: boolean;
        };

        displayInfo(`${name} (${projectInfo.isActive ? 'active' : 'inactive'})`);
        displayInfo(`  basic=${projectInfo.basicDelegate}`);
        displayInfo(`  granular=${projectInfo.granularDelegate}`);
      }
    } catch (error) {
      displayError(`Failed to list projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

export default program;
