import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { namehash } from 'viem/ens';
import delegateABI from '../abis/DelegateABI.json';
import { CONTRACT_ADDRESSES } from '../config/contracts';

interface SubdomainCreationProps {
  delegateAddress?: string;
}

export function SubdomainCreation({ delegateAddress }: SubdomainCreationProps) {
  const [parentDomain, setParentDomain] = useState('');
  const [label, setLabel] = useState('');
  const [owner, setOwner] = useState('');
  const [resolver, setResolver] = useState('');
  const [ttl, setTtl] = useState('300');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const chainId = useChainId();
  const defaultResolver = CONTRACT_ADDRESSES[chainId]?.publicResolver || '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41';

  const handleCreateSubdomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateAddress || !parentDomain || !label || !owner) return;

    const parentNode = namehash(parentDomain);
    const resolverAddress = resolver || defaultResolver;
    const ttlValue = ttl ? BigInt(ttl) : 300n;

    try {
      await writeContract({
        address: delegateAddress as `0x${string}`,
        abi: delegateABI,
        functionName: 'createSubdomain',
        args: [parentNode, label, owner as `0x${string}`, resolverAddress as `0x${string}`, ttlValue],
      });
    } catch (error) {
      console.error('Failed to create subdomain:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Subdomain</h2>
        <p className="text-sm text-gray-600 mb-6">
          Create new subdomains under your ENS domains
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
        <form onSubmit={handleCreateSubdomain} className="space-y-4">
          <div>
            <label htmlFor="parentDomain" className="block text-sm font-medium text-gray-700 mb-2">
              Parent Domain
            </label>
            <input
              id="parentDomain"
              type="text"
              value={parentDomain}
              onChange={(e) => setParentDomain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="example.eth"
              required
            />
          </div>

          <div>
            <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">
              Subdomain Label
            </label>
            <input
              id="label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="app"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              The subdomain will be: {label ? `${label}.${parentDomain}` : '...'}
            </p>
          </div>

          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-2">
              Owner Address
            </label>
            <input
              id="owner"
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label htmlFor="resolver" className="block text-sm font-medium text-gray-700 mb-2">
              Resolver Address (optional)
            </label>
            <input
              id="resolver"
              type="text"
              value={resolver}
              onChange={(e) => setResolver(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder={defaultResolver}
            />
          </div>

          <div>
            <label htmlFor="ttl" className="block text-sm font-medium text-gray-700 mb-2">
              TTL (optional, default: 300)
            </label>
            <input
              id="ttl"
              type="number"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="300"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isConfirming || !delegateAddress || !parentDomain || !label || !owner}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPending || isConfirming ? 'Processing...' : 'Create Subdomain'}
          </button>

          {isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Subdomain created successfully! {label}.{parentDomain}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

