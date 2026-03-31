import { useState, useEffect } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { namehash } from 'viem/ens';
import { PERMISSIONS, PERMISSION_NAMES } from '../config/contracts';
import granularABI from '../abis/GranularABI.json';
import { TransactionStatus } from './TransactionStatus';
import { ErrorDisplay } from './ErrorDisplay';
import { DomainInput } from './DomainInput';
import { AddressInput } from './AddressInput';
import { getErrorMessage } from '../utils/validation';

interface GranularPermissionsProps {
  delegateAddress?: string;
}

interface DelegateInfo {
  allowedOperations: bigint;
  expiresAt: bigint;
  enabled: boolean;
  locked: boolean;
  createdAt: bigint;
  createdBy: string;
}

export function GranularPermissions({ delegateAddress }: GranularPermissionsProps) {
  const [domain, setDomain] = useState('');
  const [delegate, setDelegate] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<bigint[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [action, setAction] = useState<'add' | 'update'>('add');
  const [delegateInfo, setDelegateInfo] = useState<DelegateInfo | null>(null);

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });
  
  const error = writeError || confirmError;

  const node = domain ? namehash(domain) : undefined;

  const { data: info, refetch: refetchInfo } = useReadContract({
    address: delegateAddress as `0x${string}`,
    abi: granularABI,
    functionName: 'getDelegateInfo',
    args: node && delegate ? [node, delegate as `0x${string}`] : undefined,
    query: {
      enabled: !!delegateAddress && !!node && !!delegate,
    },
  });

  useEffect(() => {
    if (info) {
      const [allowedOperations, expiresAt, enabled, locked, createdAt, createdBy] = info as [bigint, bigint, boolean, boolean, bigint, string];
      setDelegateInfo({
        allowedOperations,
        expiresAt,
        enabled,
        locked,
        createdAt,
        createdBy,
      });
      if (action === 'update') {
        const perms: bigint[] = [];
        Object.values(PERMISSIONS).forEach(perm => {
          if ((allowedOperations & perm) === perm) {
            perms.push(perm);
          }
        });
        setSelectedPermissions(perms);
        if (expiresAt > 0n) {
          setExpiresAt(new Date(Number(expiresAt) * 1000).toISOString().slice(0, 16));
        }
      }
    } else {
      setDelegateInfo(null);
    }
  }, [info, action]);

  const togglePermission = (permission: bigint) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const calculateMask = () => {
    return selectedPermissions.reduce((acc, perm) => acc | perm, 0n);
  };

  const handleAddDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateAddress || !domain || !delegate || selectedPermissions.length === 0) return;

    const mask = calculateMask();
    const expires = expiresAt ? BigInt(Math.floor(new Date(expiresAt).getTime() / 1000)) : 0n;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'addDelegate',
        args: [node!, delegate as `0x${string}`, mask, expires],
      });
      setTimeout(() => refetchInfo(), 2000);
    } catch (error) {
      console.error('Failed to add delegate:', error);
    }
  };

  const handleUpdateDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateAddress || !domain || !delegate || selectedPermissions.length === 0) return;

    const mask = calculateMask();
    const expires = expiresAt ? BigInt(Math.floor(new Date(expiresAt).getTime() / 1000)) : 0n;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'updateDelegate',
        args: [node!, delegate as `0x${string}`, mask, expires],
      });
      setTimeout(() => refetchInfo(), 2000);
    } catch (error) {
      console.error('Failed to update delegate:', error);
    }
  };

  const handleRemoveDelegate = async () => {
    if (!delegateAddress || !domain || !delegate) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'removeDelegate',
        args: [node!, delegate as `0x${string}`],
      });
      setTimeout(() => refetchInfo(), 2000);
    } catch (error) {
      console.error('Failed to remove delegate:', error);
    }
  };

  const handleLockDelegate = async () => {
    if (!delegateAddress || !domain || !delegate) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'lockDelegate',
        args: [node!, delegate as `0x${string}`],
      });
      setTimeout(() => refetchInfo(), 2000);
    } catch (error) {
      console.error('Failed to lock delegate:', error);
    }
  };

  const handleUnlockDelegate = async () => {
    if (!delegateAddress || !domain || !delegate) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'unlockDelegate',
        args: [node!, delegate as `0x${string}`],
      });
      setTimeout(() => refetchInfo(), 2000);
    } catch (error) {
      console.error('Failed to unlock delegate:', error);
    }
  };

  const handleEnableDelegate = async () => {
    if (!delegateAddress || !domain || !delegate) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'enableDelegate',
        args: [node!, delegate as `0x${string}`],
      });
      setTimeout(() => refetchInfo(), 2000);
    } catch (error) {
      console.error('Failed to enable delegate:', error);
    }
  };

  const handleDisableDelegate = async () => {
    if (!delegateAddress || !domain || !delegate) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'disableDelegate',
        args: [node!, delegate as `0x${string}`],
      });
      setTimeout(() => refetchInfo(), 2000);
    } catch (error) {
      console.error('Failed to disable delegate:', error);
    }
  };

  const handleLoadDelegate = () => {
    if (domain && delegate) {
      refetchInfo();
      setAction('update');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Granular Permissions</h2>
        <p className="text-sm text-gray-600 mb-6">
          Manage fine-grained permissions for ENS domain delegates
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Permissions</h3>
        <form onSubmit={action === 'add' ? handleAddDelegate : handleUpdateDelegate} className="space-y-4">
          <div className="flex space-x-3 mb-4">
            <button
              type="button"
              onClick={() => { setAction('add'); setDelegateInfo(null); setSelectedPermissions([]); setExpiresAt(''); }}
              className={`px-4 py-2 rounded-lg ${action === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Add New Delegate
            </button>
            <button
              type="button"
              onClick={() => setAction('update')}
              className={`px-4 py-2 rounded-lg ${action === 'update' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Update Existing
            </button>
          </div>

          <DomainInput
            value={domain}
            onChange={setDomain}
            required
          />

          <div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <AddressInput
                  value={delegate}
                  onChange={setDelegate}
                  required
                />
              </div>
              {action === 'update' && (
                <button
                  type="button"
                  onClick={handleLoadDelegate}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 self-end"
                >
                  Load
                </button>
              )}
            </div>
          </div>

          {delegateInfo && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-2">
              <h4 className="font-medium text-blue-900">Delegate Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">Status: </span>
                  <span className={delegateInfo.enabled ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {delegateInfo.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  {delegateInfo.locked && <span className="ml-2 text-orange-600 font-medium">(Locked)</span>}
                </div>
                <div>
                  <span className="text-blue-700">Expires: </span>
                  <span className={delegateInfo.expiresAt > 0n ? (Number(delegateInfo.expiresAt) * 1000 > Date.now() ? 'text-green-600' : 'text-red-600') : 'text-gray-600'}>
                    {delegateInfo.expiresAt > 0n 
                      ? (Number(delegateInfo.expiresAt) * 1000 > Date.now() 
                          ? new Date(Number(delegateInfo.expiresAt) * 1000).toLocaleString()
                          : `Expired: ${new Date(Number(delegateInfo.expiresAt) * 1000).toLocaleString()}`)
                      : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Created: </span>
                  <span className="text-gray-600">{new Date(Number(delegateInfo.createdAt) * 1000).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-blue-700">Created By: </span>
                  <span className="font-mono text-xs text-gray-600">{delegateInfo.createdBy.slice(0, 10)}...</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Permissions
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PERMISSIONS).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center space-x-2 p-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(value)}
                    onChange={() => togglePermission(value)}
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
            <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date (optional, 0 for no expiration)
            </label>
            <input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isPending || isConfirming || !delegateAddress || selectedPermissions.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isPending || isConfirming ? 'Processing...' : action === 'add' ? 'Add Delegate' : 'Update Delegate'}
            </button>
            {action === 'update' && (
              <button
                type="button"
                onClick={handleRemoveDelegate}
                disabled={isPending || isConfirming || !delegateAddress || !delegate || delegateInfo?.locked}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                title={delegateInfo?.locked ? 'Cannot remove locked delegate' : ''}
              >
                Remove
              </button>
            )}
          </div>

          {action === 'update' && delegateInfo && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={delegateInfo.locked ? handleUnlockDelegate : handleLockDelegate}
                disabled={isPending || isConfirming}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {delegateInfo.locked ? 'Unlock' : 'Lock'}
              </button>
              <button
                type="button"
                onClick={delegateInfo.enabled ? handleDisableDelegate : handleEnableDelegate}
                disabled={isPending || isConfirming}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {delegateInfo.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          )}

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
        </form>
      </div>
    </div>
  );
}
