import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { namehash } from 'viem/ens';
import { PERMISSIONS, PERMISSION_NAMES } from '../config/contracts';
import granularABI from '../abis/GranularABI.json';

interface DelegateListViewProps {
  delegateAddress?: string;
}

interface DelegateInfo {
  address: string;
  allowedOperations: bigint;
  expiresAt: bigint;
  enabled: boolean;
  locked: boolean;
  createdAt: bigint;
  createdBy: string;
}

export function DelegateListView({ delegateAddress }: DelegateListViewProps) {
  const [domain, setDomain] = useState('');
  const [searchAddress, setSearchAddress] = useState('');

  const node = domain ? namehash(domain) : undefined;

  const getPermissionNames = (mask: bigint): string[] => {
    const names: string[] = [];
    Object.entries(PERMISSIONS).forEach(([key, value]) => {
      if ((mask & value) === value) {
        names.push(PERMISSION_NAMES[value.toString()] || key);
      }
    });
    return names;
  };

  const formatPermissions = (mask: bigint): string => {
    return getPermissionNames(mask).join(', ') || 'None';
  };

  const isExpired = (expiresAt: bigint): boolean => {
    return expiresAt > 0n && Number(expiresAt) * 1000 < Date.now();
  };

  const getStatusColor = (info: DelegateInfo): string => {
    if (!info.enabled) return 'bg-gray-100 text-gray-800';
    if (isExpired(info.expiresAt)) return 'bg-red-100 text-red-800';
    if (info.locked) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (info: DelegateInfo): string => {
    if (!info.enabled) return 'Disabled';
    if (isExpired(info.expiresAt)) return 'Expired';
    if (info.locked) return 'Locked';
    return 'Active';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Delegate List</h2>
        <p className="text-sm text-gray-600 mb-6">
          View all delegates and their permissions for a domain
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
            <div>
              <label htmlFor="searchAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Search Delegate Address (optional)
              </label>
              <input
                id="searchAddress"
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="0x... (leave empty to view all)"
              />
            </div>
          )}
        </div>
      </div>

      {node && delegateAddress && (
        <DelegateInfoDisplay
          delegateAddress={delegateAddress}
          node={node}
          searchAddress={searchAddress}
          getPermissionNames={getPermissionNames}
          formatPermissions={formatPermissions}
          isExpired={isExpired}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      )}
    </div>
  );
}

function DelegateInfoDisplay({
  delegateAddress,
  node,
  searchAddress,
  getPermissionNames,
  formatPermissions,
  isExpired,
  getStatusColor,
  getStatusText,
}: {
  delegateAddress: string;
  node: `0x${string}`;
  searchAddress: string;
  getPermissionNames: (mask: bigint) => string[];
  formatPermissions: (mask: bigint) => string;
  isExpired: (expiresAt: bigint) => boolean;
  getStatusColor: (info: DelegateInfo) => string;
  getStatusText: (info: DelegateInfo) => string;
}) {
  const { data: info } = useReadContract({
    address: delegateAddress as `0x${string}`,
    abi: granularABI,
    functionName: 'getDelegateInfo',
    args: searchAddress ? [node, searchAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!searchAddress,
    },
  });

  if (searchAddress && info) {
    const [allowedOperations, expiresAt, enabled, locked, createdAt, createdBy] = info as [bigint, bigint, boolean, boolean, bigint, string];
    const delegateInfo: DelegateInfo = {
      address: searchAddress,
      allowedOperations,
      expiresAt,
      enabled,
      locked,
      createdAt,
      createdBy,
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delegate Information</h3>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Address: </span>
            <span className="font-mono text-sm text-gray-900">{delegateInfo.address}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Status: </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(delegateInfo)}`}>
              {getStatusText(delegateInfo)}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Permissions: </span>
            <div className="mt-1 flex flex-wrap gap-2">
              {getPermissionNames(delegateInfo.allowedOperations).map((name, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {name}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Expires: </span>
            <span className="text-sm text-gray-600">
              {delegateInfo.expiresAt > 0n
                ? new Date(Number(delegateInfo.expiresAt) * 1000).toLocaleString()
                : 'Never'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Created: </span>
            <span className="text-sm text-gray-600">
              {new Date(Number(delegateInfo.createdAt) * 1000).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Created By: </span>
            <span className="font-mono text-xs text-gray-600">{delegateInfo.createdBy.slice(0, 10)}...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-sm text-gray-600">
        Enter a delegate address above to view their information, or leave empty to view all delegates (requires additional contract support).
      </p>
    </div>
  );
}

