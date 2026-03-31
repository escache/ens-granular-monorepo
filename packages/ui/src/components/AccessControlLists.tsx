import { useState } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { namehash } from 'viem/ens';
import granularABI from '../abis/GranularABI.json';
import { TransactionStatus } from './TransactionStatus';
import { ErrorDisplay } from './ErrorDisplay';
import { DomainInput } from './DomainInput';
import { AddressInput } from './AddressInput';
import { getErrorMessage } from '../utils/validation';

interface AccessControlListsProps {
  delegateAddress?: string;
}

export function AccessControlLists({ delegateAddress }: AccessControlListsProps) {
  const [domain, setDomain] = useState('');
  const [address, setAddress] = useState('');
  const [listType, setListType] = useState<'whitelist' | 'blacklist'>('whitelist');

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });
  
  const error = writeError || confirmError;

  const node = domain ? namehash(domain) : undefined;

  const { data: delegationConfig } = useReadContract({
    address: delegateAddress as `0x${string}`,
    abi: granularABI,
    functionName: 'delegations',
    args: node ? [node] : undefined,
    query: {
      enabled: !!delegateAddress && !!node,
    },
  });

  const whitelistEnabled = delegationConfig ? (delegationConfig as any)[0] : false;
  const blacklistEnabled = delegationConfig ? (delegationConfig as any)[1] : false;

  const handleToggleWhitelist = async (enabled: boolean) => {
    if (!delegateAddress || !domain || !node) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'toggleWhitelist',
        args: [node, enabled],
      });
    } catch (error) {
      console.error('Failed to toggle whitelist:', error);
    }
  };

  const handleToggleBlacklist = async (enabled: boolean) => {
    if (!delegateAddress || !domain || !node) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'toggleBlacklist',
        args: [node, enabled],
      });
    } catch (error) {
      console.error('Failed to toggle blacklist:', error);
    }
  };

  const handleUpdateList = async (added: boolean) => {
    if (!delegateAddress || !domain || !address || !node) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: listType === 'whitelist' ? 'updateWhitelist' : 'updateBlacklist',
        args: [node, address as `0x${string}`, added],
      });
      setAddress('');
    } catch (error) {
      console.error(`Failed to update ${listType}:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Control Lists</h2>
        <p className="text-sm text-gray-600 mb-6">
          Manage whitelist and blacklist for domain delegates
        </p>
      </div>

      {!delegateAddress && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Please select a granular delegate contract from the Factory tab first.
          </p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Domain Configuration</h3>
        <div className="space-y-4">
          <DomainInput
            value={domain}
            onChange={setDomain}
          />

          {node && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Whitelist</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${whitelistEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {whitelistEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleWhitelist(!whitelistEnabled)}
                  disabled={isPending || isConfirming}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {whitelistEnabled ? 'Disable' : 'Enable'} Whitelist
                </button>
              </div>

              <div className="p-4 bg-white rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Blacklist</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${blacklistEnabled ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {blacklistEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleBlacklist(!blacklistEnabled)}
                  disabled={isPending || isConfirming}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {blacklistEnabled ? 'Disable' : 'Enable'} Blacklist
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {node && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manage {listType === 'whitelist' ? 'Whitelist' : 'Blacklist'}</h3>
          <div className="space-y-4">
            <div className="flex space-x-3 mb-4">
              <button
                type="button"
                onClick={() => setListType('whitelist')}
                className={`px-4 py-2 rounded-lg ${listType === 'whitelist' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Whitelist
              </button>
              <button
                type="button"
                onClick={() => setListType('blacklist')}
                className={`px-4 py-2 rounded-lg ${listType === 'blacklist' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Blacklist
              </button>
            </div>

            <div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <AddressInput
                    value={address}
                    onChange={setAddress}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateList(true)}
                  disabled={isPending || isConfirming || !address}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateList(false)}
                  disabled={isPending || isConfirming || !address}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            </div>

            <TransactionStatus
              hash={hash}
              isPending={isPending}
              isConfirming={isConfirming}
              isSuccess={isSuccess}
              isError={isConfirmError}
              error={error}
            />
            
            {error && (
              <ErrorDisplay 
                error={getErrorMessage(error)} 
                onDismiss={() => {
                  resetWrite();
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

