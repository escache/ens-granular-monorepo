import { useState } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { useChainId } from 'wagmi';

export function ApprovalManagement() {
  const chainId = useChainId();
  const { address } = useAccount();
  const [delegateAddress, setDelegateAddress] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<boolean | null>(null);

  const nameWrapperAddress = CONTRACT_ADDRESSES[chainId]?.nameWrapper;

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: isApproved, refetch } = useReadContract({
    address: nameWrapperAddress,
    abi: [
      {
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'operator', type: 'address' },
        ],
        name: 'isApprovedForAll',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'isApprovedForAll',
    args: address && delegateAddress ? [address, delegateAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!delegateAddress && !!nameWrapperAddress,
    },
  });

  const handleCheckApproval = async () => {
    if (!address || !delegateAddress) return;
    await refetch();
    setApprovalStatus(isApproved as boolean);
  };

  const handleSetApproval = async () => {
    if (!nameWrapperAddress || !delegateAddress || !address) return;

    try {
      await writeContract({
        address: nameWrapperAddress,
        abi: [
          {
            inputs: [
              { name: 'operator', type: 'address' },
              { name: 'approved', type: 'bool' },
            ],
            name: 'setApprovalForAll',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        functionName: 'setApprovalForAll',
        args: [delegateAddress as `0x${string}`, true],
      });
    } catch (error) {
      console.error('Failed to set approval:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval Management</h2>
        <p className="text-sm text-gray-600 mb-6">
          Approve delegate contracts to manage your ENS domains. This is required before delegations can be set.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Set Approval</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="delegateAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Delegate Contract Address
            </label>
            <input
              id="delegateAddress"
              type="text"
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="0x..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCheckApproval}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Check Approval Status
            </button>
            <button
              onClick={handleSetApproval}
              disabled={isPending || isConfirming || !delegateAddress}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isPending || isConfirming ? 'Processing...' : 'Set Approval'}
            </button>
          </div>

          {approvalStatus !== null && (
            <div className={`p-3 rounded-md border ${
              approvalStatus
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm ${
                approvalStatus ? 'text-green-800' : 'text-red-800'
              }`}>
                Approval Status: {approvalStatus ? 'Approved' : 'Not Approved'}
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Approval set successfully!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Important</h4>
        <p className="text-sm text-blue-800">
          Setting approval allows the delegate contract to manage your ENS domains on your behalf.
          Make sure you trust the delegate contract before approving. You can revoke approval at any time.
        </p>
      </div>
    </div>
  );
}

