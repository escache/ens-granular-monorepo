import { useState } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { useChainId } from 'wagmi';
import { namehash } from 'viem/ens';
import delegateABI from '../abis/DelegateABI.json';

interface DelegationManagementProps {
  delegateAddress?: string;
}

export function DelegationManagement({ delegateAddress }: DelegationManagementProps) {
  const chainId = useChainId();
  const [domain, setDomain] = useState('');
  const [primaryDelegate, setPrimaryDelegate] = useState('');
  const [secondaryDelegate, setSecondaryDelegate] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const node = domain ? namehash(domain) : undefined;

  const { data: delegation } = useReadContract({
    address: delegateAddress as `0x${string}`,
    abi: delegateABI,
    functionName: 'delegations',
    args: node ? [node] : undefined,
    query: {
      enabled: !!delegateAddress && !!node,
    },
  });

  const handleSetDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateAddress || !domain || !primaryDelegate || !node) return;

    const expires = expiresAt ? BigInt(Math.floor(new Date(expiresAt).getTime() / 1000)) : 0n;
    const secondary = secondaryDelegate || '0x0000000000000000000000000000000000000000';

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: delegateABI,
        functionName: 'setDelegation',
        args: [
          node,
          primaryDelegate as `0x${string}`,
          secondary as `0x${string}`,
          expires,
        ],
      });
    } catch (error) {
      console.error('Failed to set delegation:', error);
    }
  };

  const handleRevokeDelegation = async () => {
    if (!delegateAddress || !domain || !node) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: delegateABI,
        functionName: 'revokeDelegation',
        args: [node],
      });
    } catch (error) {
      console.error('Failed to revoke delegation:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Delegation Management</h2>
        <p className="text-sm text-gray-600 mb-6">
          Set and manage delegations for ENS domains
        </p>
      </div>

      {!delegateAddress && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Please select a delegate contract from the Factory tab first.
          </p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Set Delegation</h3>
        <form onSubmit={handleSetDelegation} className="space-y-4">
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
              required
            />
          </div>

          <div>
            <label htmlFor="primaryDelegate" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Delegate Address
            </label>
            <input
              id="primaryDelegate"
              type="text"
              value={primaryDelegate}
              onChange={(e) => setPrimaryDelegate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label htmlFor="secondaryDelegate" className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Delegate Address (optional)
            </label>
            <input
              id="secondaryDelegate"
              type="text"
              value={secondaryDelegate}
              onChange={(e) => setSecondaryDelegate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="0x..."
            />
          </div>

          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date (optional)
            </label>
            <input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isConfirming || !delegateAddress || !domain || !primaryDelegate}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPending || isConfirming ? 'Processing...' : 'Set Delegation'}
          </button>

          {isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Delegation set successfully!
              </p>
            </div>
          )}
        </form>
      </div>

      {delegation && (delegation as any).isActive && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Delegation</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Primary Delegate:</span>
              <span className="text-sm font-mono text-gray-900">
                {(delegation as any).primaryDelegate}
              </span>
            </div>
            {(delegation as any).secondaryDelegate !== '0x0000000000000000000000000000000000000000' && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Secondary Delegate:</span>
                <span className="text-sm font-mono text-gray-900">
                  {(delegation as any).secondaryDelegate}
                </span>
              </div>
            )}
            {(delegation as any).expiresAt > 0n && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expires At:</span>
                <span className="text-sm text-gray-900">
                  {new Date(Number((delegation as any).expiresAt) * 1000).toLocaleString()}
                </span>
              </div>
            )}
            <button
              onClick={handleRevokeDelegation}
              disabled={isPending || isConfirming}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Revoke Delegation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



