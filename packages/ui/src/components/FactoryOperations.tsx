import { useState, useEffect } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import factoryABI from '../abis/FactoryABI.json';
import { TransactionStatus } from './TransactionStatus';
import { ErrorDisplay } from './ErrorDisplay';
import { getErrorMessage } from '../utils/validation';

interface FactoryOperationsProps {
  onDelegateSelect?: (address: string) => void;
  onGranularDelegateSelect?: (address: string) => void;
}

export function FactoryOperations({ onDelegateSelect, onGranularDelegateSelect }: FactoryOperationsProps) {
  const chainId = useChainId();
  const { address } = useAccount();
  const [projectName, setProjectName] = useState('');
  const [ownerAddress, setOwnerAddress] = useState(address || '');
  const [loading, setLoading] = useState(false);
  const [factoryType, setFactoryType] = useState<'standard' | 'indexed'>('standard');

  const factoryAddress = CONTRACT_ADDRESSES[chainId]?.factory;

  const { writeContract, data: hash, isPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });
  
  const error = writeError || confirmError;

  const { data: allProjectsData } = useReadContract({
    address: factoryAddress,
    abi: factoryABI,
    functionName: 'getAllProjects',
    query: {
      enabled: !!factoryAddress,
    },
  });

  const allProjects = Array.isArray(allProjectsData) ? allProjectsData as string[] : [];

  useEffect(() => {
    if (address && !ownerAddress) {
      setOwnerAddress(address);
    }
  }, [address, ownerAddress]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryAddress || !projectName) return;
    if (factoryType === 'standard' && !ownerAddress) return;

    setLoading(true);
    try {
      if (factoryType === 'indexed') {
        await writeContract({
          address: factoryAddress,
          abi: factoryABI,
          functionName: 'createProject',
          args: [projectName],
        });
      } else {
        await writeContract({
          address: factoryAddress,
          abi: factoryABI,
          functionName: 'createProject',
          args: [projectName, ownerAddress as `0x${string}`],
        });
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Factory Operations</h2>
        <p className="text-sm text-gray-600 mb-6">
          Create and manage delegate contracts for your projects
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Factory Type
          </label>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setFactoryType('standard')}
              className={`px-4 py-2 rounded-lg ${factoryType === 'standard' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Standard Factory
            </button>
            <button
              type="button"
              onClick={() => setFactoryType('indexed')}
              className={`px-4 py-2 rounded-lg ${factoryType === 'indexed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Indexed Factory
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {factoryType === 'indexed' 
              ? 'Indexed factory creates gas-efficient IndexedENSManager and IndexedGranularResolver contracts'
              : 'Standard factory creates basic and granular delegate contracts'}
          </p>
        </div>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="my-project"
              required
            />
          </div>

          {factoryType === 'standard' && (
            <div>
              <label htmlFor="ownerAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Owner Address
              </label>
              <input
                id="ownerAddress"
                type="text"
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder={address || "0x..."}
                required
              />
              {address && (
                <button
                  type="button"
                  onClick={() => setOwnerAddress(address)}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  Use connected wallet address
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || isConfirming || !projectName || (factoryType === 'standard' && !ownerAddress)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPending || isConfirming ? 'Processing...' : 'Create Project'}
          </button>

          <TransactionStatus
            hash={hash}
            isPending={isPending || loading}
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

      {allProjects && allProjects.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">All Projects</h3>
          <div className="space-y-2">
            {allProjects.map((project: string, index: number) => (
              <div
                key={index}
                className="p-3 bg-white rounded-md border border-gray-200 flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">{project}</span>
                <ProjectDetails
                  projectName={project}
                  onDelegateSelect={onDelegateSelect}
                  onGranularDelegateSelect={onGranularDelegateSelect}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!factoryAddress && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Factory contract not configured for this network. Please update CONTRACT_ADDRESSES.
          </p>
        </div>
      )}
    </div>
  );
}

function ProjectDetails({
  projectName,
  onDelegateSelect,
  onGranularDelegateSelect,
}: {
  projectName: string;
  onDelegateSelect?: (address: string) => void;
  onGranularDelegateSelect?: (address: string) => void;
}) {
  const chainId = useChainId();
  const factoryAddress = CONTRACT_ADDRESSES[chainId]?.factory;

  const { data: project } = useReadContract({
    address: factoryAddress,
    abi: factoryABI,
    functionName: 'getProject',
    args: [projectName],
    query: {
      enabled: !!factoryAddress && !!projectName,
    },
  });

  if (!project) return null;

  const projectData = project as any;
  const basicAddr = projectData.basicDelegate;
  const granularAddr = projectData.granularDelegate;
  const managerAddr = projectData.manager;
  const resolverAddr = projectData.resolver;

  const isIndexed = !!(managerAddr || resolverAddr);

  return (
    <div className="flex flex-col items-end space-y-2 text-sm">
      {isIndexed ? (
        <>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Manager:</span>
            <button
              onClick={() => onGranularDelegateSelect?.(managerAddr)}
              className="font-mono text-blue-600 hover:text-blue-700 underline"
              title="Select this manager"
            >
              {managerAddr?.slice(0, 10)}...
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Resolver:</span>
            <button
              onClick={() => onGranularDelegateSelect?.(resolverAddr)}
              className="font-mono text-blue-600 hover:text-blue-700 underline"
              title="Select this resolver"
            >
              {resolverAddr?.slice(0, 10)}...
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Basic:</span>
            <button
              onClick={() => onDelegateSelect?.(basicAddr)}
              className="font-mono text-blue-600 hover:text-blue-700 underline"
              title="Select this delegate"
            >
              {basicAddr?.slice(0, 10)}...
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Granular:</span>
            <button
              onClick={() => onGranularDelegateSelect?.(granularAddr)}
              className="font-mono text-blue-600 hover:text-blue-700 underline"
              title="Select this delegate"
            >
              {granularAddr?.slice(0, 10)}...
            </button>
          </div>
        </>
      )}
    </div>
  );
}

