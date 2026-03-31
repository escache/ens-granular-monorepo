import { useState } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { namehash } from 'viem/ens';
import granularABI from '../abis/GranularABI.json';

interface SecurityDashboardProps {
  delegateAddress?: string;
}

export function SecurityDashboard({ delegateAddress }: SecurityDashboardProps) {
  const [domain, setDomain] = useState('');
  const [delegate, setDelegate] = useState('');
  const [alertReason, setAlertReason] = useState('');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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

  const handleTriggerAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateAddress || !domain || !delegate || !alertReason) return;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: granularABI,
        functionName: 'triggerSecurityAlert',
        args: [node!, delegate as `0x${string}`, alertReason],
      });
      setAlertReason('');
    } catch (error) {
      console.error('Failed to trigger security alert:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Dashboard</h2>
        <p className="text-sm text-gray-600 mb-6">
          Monitor and manage security alerts and emergency status
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Domain Status</h3>
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

          {node && (
            <div className="p-4 bg-white rounded-md border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Emergency Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${isPaused ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {isPaused ? 'Paused' : 'Active'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {node && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Alerts</h3>
          <form onSubmit={handleTriggerAlert} className="space-y-4">
            <div>
              <label htmlFor="delegate" className="block text-sm font-medium text-gray-700 mb-2">
                Delegate Address
              </label>
              <input
                id="delegate"
                type="text"
                value={delegate}
                onChange={(e) => setDelegate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="0x..."
                required
              />
            </div>

            <div>
              <label htmlFor="alertReason" className="block text-sm font-medium text-gray-700 mb-2">
                Alert Reason
              </label>
              <textarea
                id="alertReason"
                value={alertReason}
                onChange={(e) => setAlertReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the security concern..."
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending || isConfirming || !delegateAddress}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? 'Processing...' : 'Trigger Security Alert'}
            </button>

            {isSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  Security alert triggered successfully!
                </p>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

