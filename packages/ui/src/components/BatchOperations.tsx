import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { namehash } from 'viem/ens';
import { PERMISSIONS, PERMISSION_NAMES } from '../config/contracts';
import granularABI from '../abis/GranularABI.json';
import { DomainInput } from './DomainInput';
import { AddressInput } from './AddressInput';
import { TransactionStatus } from './TransactionStatus';
import { ErrorDisplay } from './ErrorDisplay';
import { getErrorMessage } from '../utils/validation';
import { LoadingSkeleton } from './LoadingSkeleton';

interface BatchDelegate {
  address: string;
  permissions: bigint[];
  expiresAt: string;
}

interface BatchOperationsProps {
  delegateAddress?: string;
}

export function BatchOperations({ delegateAddress }: BatchOperationsProps) {
  const [domain, setDomain] = useState('');
  const [delegates, setDelegates] = useState<BatchDelegate[]>([{ address: '', permissions: [], expiresAt: '' }]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });

  const node = domain ? namehash(domain) : undefined;
  const error = writeError || confirmError;

  const addDelegate = () => {
    setDelegates([...delegates, { address: '', permissions: [], expiresAt: '' }]);
  };

  const removeDelegate = (index: number) => {
    setDelegates(delegates.filter((_, i) => i !== index));
  };

  const updateDelegate = (index: number, field: keyof BatchDelegate, value: any) => {
    const updated = [...delegates];
    updated[index] = { ...updated[index], [field]: value };
    setDelegates(updated);
  };

  const togglePermission = (index: number, permission: bigint) => {
    const updated = [...delegates];
    const perms = updated[index].permissions;
    if (perms.includes(permission)) {
      updated[index].permissions = perms.filter(p => p !== permission);
    } else {
      updated[index].permissions = [...perms, permission];
    }
    setDelegates(updated);
  };

  const calculateMask = (permissions: bigint[]) => {
    return permissions.reduce((acc, perm) => acc | perm, 0n);
  };

  const handleBatchAdd = async () => {
    if (!delegateAddress || !domain || !node || delegates.length === 0) return;

    setIsProcessing(true);
    try {
      for (const delegate of delegates) {
        if (!delegate.address || delegate.permissions.length === 0) continue;

        const mask = calculateMask(delegate.permissions);
        const expires = delegate.expiresAt 
          ? BigInt(Math.floor(new Date(delegate.expiresAt).getTime() / 1000)) 
          : 0n;

        await writeContract({
          address: delegateAddress as `0x${string}`,
          abi: granularABI,
          functionName: 'addDelegate',
          args: [node, delegate.address as `0x${string}`, mask, expires],
        });
      }
    } catch (error) {
      console.error('Failed to batch add delegates:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Operations</h2>
        <p className="text-sm text-gray-600 mb-6">
          Add multiple delegates at once for a domain
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
        <DomainInput
          value={domain}
          onChange={setDomain}
          required
        />

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Delegates</h3>
            <button
              onClick={addDelegate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Delegate
            </button>
          </div>

          <div className="space-y-6">
            {delegates.map((delegate, index) => (
              <div key={index} className="p-4 bg-white rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Delegate #{index + 1}</h4>
                  {delegates.length > 1 && (
                    <button
                      onClick={() => removeDelegate(index)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <AddressInput
                    value={delegate.address}
                    onChange={(value) => updateDelegate(index, 'address', value)}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(PERMISSIONS).map(([key, value]) => (
                        <label
                          key={key}
                          className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={delegate.permissions.includes(value)}
                            onChange={() => togglePermission(index, value)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {PERMISSION_NAMES[value.toString()] || key}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={delegate.expiresAt}
                      onChange={(e) => updateDelegate(index, 'expiresAt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleBatchAdd}
            disabled={isPending || isConfirming || isProcessing || !delegateAddress || !domain || delegates.length === 0}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming || isProcessing ? 'Processing...' : 'Batch Add Delegates'}
          </button>
        </div>
      </div>

      <TransactionStatus
        hash={hash}
        isPending={isPending || isProcessing}
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
  );
}

