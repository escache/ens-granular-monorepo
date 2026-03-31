import { useState } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { namehash } from 'viem/ens';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import granularABI from '../abis/GranularABI.json';

interface ResolverManagementProps {
  resolverAddress?: string;
}

export function ResolverManagement({ resolverAddress }: ResolverManagementProps) {
  const chainId = useChainId();
  const [domain, setDomain] = useState('');
  const [ownerOverrideDisabled, setOwnerOverrideDisabled] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const node = domain ? namehash(domain) : undefined;
  const ensRegistry = CONTRACT_ADDRESSES[chainId]?.ensRegistry;

  const { data: currentResolver } = useReadContract({
    address: ensRegistry as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'node', type: 'bytes32' }],
        name: 'resolver',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'resolver',
    args: node ? [node] : undefined,
    query: {
      enabled: !!ensRegistry && !!node,
    },
  });

  const handleToggleOwnerOverride = async () => {
    if (!resolverAddress || !domain || !node) return;

    try {
      await writeContract({
        address: resolverAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'toggleOwnerOverride',
        args: [node, !ownerOverrideDisabled],
      });
      setOwnerOverrideDisabled(!ownerOverrideDisabled);
    } catch (error) {
      console.error('Failed to toggle owner override:', error);
    }
  };

  const handleSetResolver = async () => {
    if (!ensRegistry || !domain || !node || !resolverAddress) return;

    if (!confirm('This will set the resolver for this domain. Make sure you have the correct resolver address.')) {
      return;
    }

    try {
      await writeContract({
        address: ensRegistry as `0x${string}`,
        abi: [
          {
            inputs: [
              { name: 'node', type: 'bytes32' },
              { name: 'resolver', type: 'address' },
            ],
            name: 'setResolver',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        functionName: 'setResolver',
        args: [node, resolverAddress as `0x${string}`],
      });
    } catch (error) {
      console.error('Failed to set resolver:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resolver Management</h2>
        <p className="text-sm text-gray-600 mb-6">
          Manage GranularResolver settings and owner override controls
        </p>
      </div>

      {!resolverAddress && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Please configure a resolver address. This should be the GranularResolver contract address.
          </p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Domain Configuration</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
              Domain Name
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="example.eth"
            />
          </div>

          {node && currentResolver && (
            <div className="p-4 bg-white rounded-md border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Current Resolver:</span>
                <span className="font-mono text-xs text-gray-900">{currentResolver as string}</span>
              </div>
              {currentResolver === resolverAddress && (
                <span className="text-xs text-green-600">✓ Using GranularResolver</span>
              )}
            </div>
          )}
        </div>
      </div>

      {node && resolverAddress && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Owner Override Control</h3>
          <p className="text-sm text-gray-600 mb-4">
            When owner override is disabled, even the domain owner must use GNA delegations to modify records.
            This provides additional security by forcing all operations through the delegation audit trail.
          </p>
          <div className="p-4 bg-white rounded-md border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Owner Override:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${ownerOverrideDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {ownerOverrideDisabled ? 'Disabled' : 'Enabled'}
              </span>
            </div>
            <button
              onClick={handleToggleOwnerOverride}
              disabled={isPending || isConfirming}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {ownerOverrideDisabled ? 'Enable Owner Override' : 'Disable Owner Override'}
            </button>
          </div>
        </div>
      )}

      {node && ensRegistry && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Set Resolver</h3>
          <p className="text-sm text-gray-600 mb-4">
            Set the GranularResolver as the resolver for this domain in the ENS Registry.
          </p>
          {resolverAddress && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-md border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Resolver Address: </span>
                <span className="font-mono text-xs text-gray-900">{resolverAddress}</span>
              </div>
              <button
                onClick={handleSetResolver}
                disabled={isPending || isConfirming || !resolverAddress}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? 'Processing...' : 'Set Resolver'}
              </button>
            </div>
          )}
        </div>
      )}

      {isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Operation completed successfully!
          </p>
        </div>
      )}
    </div>
  );
}

