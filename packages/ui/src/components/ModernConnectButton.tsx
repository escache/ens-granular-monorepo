import { useState } from 'react';
import { formatAddress } from '../utils/validation';
import type { Connector } from 'wagmi';

interface ModernConnectButtonProps {
  isConnected: boolean;
  address?: string;
  connectors: readonly Connector[];
  connect: ({ connector }: { connector: Connector }) => void;
  disconnect: () => void;
}

export function ModernConnectButton({
  isConnected,
  address,
  connectors,
  connect,
  disconnect,
}: ModernConnectButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showConnectorOptions, setShowConnectorOptions] = useState(false);

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="font-medium text-sm">{formatAddress(address, 8)}</span>
          <svg className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-teal-50">
              <p className="text-xs text-gray-500 mb-1">Connected Wallet</p>
              <p className="font-mono text-sm text-gray-900">{address}</p>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Address</span>
              </button>
              <button
                onClick={() => {
                  window.open(`https://etherscan.io/address/${address}`, '_blank');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View on Explorer</span>
              </button>
              <hr className="my-2 border-gray-100" />
              <button
                onClick={() => {
                  disconnect();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConnectorOptions(!showConnectorOptions)}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-medium hover:from-indigo-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        Connect Wallet
      </button>
      
      {showConnectorOptions && connectors.length > 0 && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-teal-50">
            <h3 className="font-semibold text-gray-900">Choose Wallet</h3>
            <p className="text-xs text-gray-600 mt-1">Select your preferred wallet provider</p>
          </div>
          <div className="p-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setShowConnectorOptions(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-teal-100 rounded-lg flex items-center justify-center group-hover:from-indigo-200 group-hover:to-teal-200 transition-colors">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{connector.name}</p>
                  <p className="text-xs text-gray-500">Click to connect</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
