import { useState, useEffect } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/contracts';

interface SettingsProps {
  onResolverAddressChange?: (address: string) => void;
}

export function Settings({ onResolverAddressChange }: SettingsProps) {
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  const [resolverAddress, setResolverAddress] = useState('');
  const [factoryAddress, setFactoryAddress] = useState('');

  const currentConfig = CONTRACT_ADDRESSES[chainId];

  useEffect(() => {
    const saved = localStorage.getItem('resolverAddress');
    if (saved) {
      setResolverAddress(saved);
      onResolverAddressChange?.(saved);
    }
  }, [onResolverAddressChange]);

  const handleResolverAddressChange = (address: string) => {
    setResolverAddress(address);
    localStorage.setItem('resolverAddress', address);
    onResolverAddressChange?.(address);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
        <p className="text-sm text-gray-600 mb-6">
          Configure network and contract addresses
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Network Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Network
            </label>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                {chains.find(c => c.id === chainId)?.name || `Chain ID: ${chainId}`}
              </span>
              <select
                onChange={(e) => {
                  const newChainId = Number(e.target.value) as typeof chainId;
                  if (newChainId !== chainId) {
                    switchChain({ chainId: newChainId });
                  }
                }}
                value={chainId}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Addresses</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ENS Registry
            </label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded-md font-mono text-sm">
              {currentConfig?.ensRegistry || 'Not configured'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name Wrapper
            </label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded-md font-mono text-sm">
              {currentConfig?.nameWrapper || 'Not configured'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Factory Contract
            </label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded-md font-mono text-sm">
              {currentConfig?.factory || 'Not configured'}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Update CONTRACT_ADDRESSES in config/contracts.ts to change
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolver Address (for Resolver Management)
            </label>
            <input
              type="text"
              value={resolverAddress}
              onChange={(e) => handleResolverAddressChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="0x... (GranularResolver address)"
            />
            <p className="mt-1 text-xs text-gray-500">
              This address will be used in the Resolver Management component
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Configuration Note</h3>
        <p className="text-sm text-blue-800">
          Contract addresses are configured in <code className="bg-blue-100 px-1 rounded">src/config/contracts.ts</code>.
          To update addresses, edit that file and restart the development server.
        </p>
      </div>
    </div>
  );
}

