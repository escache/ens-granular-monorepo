import { useState, useEffect } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { namehash } from 'viem/ens';
import granularABI from '../abis/GranularABI.json';
import { TransactionStatus } from './TransactionStatus';
import { ErrorDisplay } from './ErrorDisplay';
import { DomainInput } from './DomainInput';
import { ConfirmationDialog } from './ConfirmationDialog';
import { getErrorMessage } from '../utils/validation';

interface EmergencyControlsProps {
  delegateAddress?: string;
}

export function EmergencyControls({ delegateAddress }: EmergencyControlsProps) {
  const [domain, setDomain] = useState('');
  const [paused, setPaused] = useState(false);

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });
  
  const error = writeError || confirmError;
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const node = domain ? namehash(domain) : undefined;

  const { data: isPaused } = useReadContract({
    address: delegateAddress as `0x${string}`,
    abi: granularABI,
    functionName: 'isEmergencyPaused',
    args: node ? [node] : undefined,
    query: {
      enabled: !!delegateAddress && !!node,
    },
  });

  useEffect(() => {
    if (isPaused !== undefined) {
      setPaused(isPaused as boolean);
    }
  }, [isPaused]);

  const handleEmergencyPause = async (pause: boolean) => {
    if (!delegateAddress || !domain || !node) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'emergencyPause',
        args: [node, pause],
      });
    } catch (error) {
      console.error('Failed to toggle emergency pause:', error);
    }
  };

  const handleEmergencyRevokeAll = async () => {
    if (!delegateAddress || !domain || !node) return;
    setShowRevokeConfirm(true);
  };

  const confirmRevokeAll = async () => {
    if (!delegateAddress || !domain || !node) return;
    setShowRevokeConfirm(false);

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'emergencyRevokeAll',
        args: [node],
      });
    } catch (error) {
      console.error('Failed to revoke all delegations:', error);
    }
  };

  const handleSetMaxDuration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateAddress || !domain || !node) return;

    const form = e.target as HTMLFormElement;
    const durationInput = form.querySelector('[name="maxDuration"]') as HTMLInputElement;
    if (!durationInput || !durationInput.value) return;
    
    const duration = BigInt(durationInput.value);

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'setMaxDelegationDuration',
        args: [node, duration],
      });
    } catch (error) {
      console.error('Failed to set max delegation duration:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Controls</h2>
        <p className="text-sm text-gray-600 mb-6">
          Emergency controls for domain delegation management
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
            <div className="p-4 bg-white rounded-md border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Emergency Pause Status</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${paused ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {paused ? 'Paused' : 'Active'}
                </span>
              </div>
              <button
                onClick={() => handleEmergencyPause(!paused)}
                disabled={isPending || isConfirming}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {paused ? 'Resume Operations' : 'Pause All Operations'}
              </button>
            </div>
          )}
        </div>
      </div>

      {node && (
        <>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">
              These actions are irreversible and will immediately affect all delegations for this domain.
            </p>
            <button
              onClick={handleEmergencyRevokeAll}
              disabled={isPending || isConfirming}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isPending || isConfirming ? 'Processing...' : 'Revoke All Delegations'}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delegation Configuration</h3>
            <form onSubmit={handleSetMaxDuration} className="space-y-4">
              <div>
                <label htmlFor="maxDuration" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Delegation Duration (seconds, 0 = no limit)
                </label>
                <div className="flex space-x-2">
                  <input
                    name="maxDuration"
                    type="number"
                    min="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                  <button
                    type="submit"
                    disabled={isPending || isConfirming}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Set Limit
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Common values: 86400 (1 day), 604800 (1 week), 2592000 (1 month), 31536000 (1 year)
                </p>
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
            </form>
          </div>
        </>
      )}

      <ConfirmationDialog
        isOpen={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        onConfirm={confirmRevokeAll}
        title="Revoke All Delegations"
        message="Are you sure you want to revoke ALL delegations for this domain? This action cannot be undone."
        confirmText="Revoke All"
        confirmColor="red"
      />
    </div>
  );
}

