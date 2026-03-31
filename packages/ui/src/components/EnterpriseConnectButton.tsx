import { useState } from 'react';
import { formatAddress } from '../utils/validation';
import type { Connector } from 'wagmi';

interface EnterpriseConnectButtonProps {
  isConnected: boolean;
  address?: string;
  connectors: readonly Connector[];
  connect: ({ connector }: { connector: Connector }) => void;
  disconnect: () => void;
}

export function EnterpriseConnectButton({
  isConnected,
  address,
  connectors,
  connect,
  disconnect,
}: EnterpriseConnectButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showConnectorOptions, setShowConnectorOptions] = useState(false);

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="enterprise-btn-secondary px-2 py-1 text-xs flex items-center gap-1"
        >
          <span className="w-1 h-1 bg-green-600 rounded-full"></span>
          <span>{formatAddress(address, 6)}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 shadow-sm z-50">
            <div className="p-2 border-b border-gray-200">
              <p className="text-xs text-gray-600">Connected</p>
              <p className="text-xs font-mono mt-1">{address}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(address);
                setShowMenu(false);
              }}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 transition-colors"
            >
              Copy Address
            </button>
            <button
              onClick={() => {
                disconnect();
                setShowMenu(false);
              }}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 text-red-600 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConnectorOptions(!showConnectorOptions)}
        className="enterprise-btn-primary px-3 py-1 text-xs"
      >
        Connect Wallet
      </button>
      
      {showConnectorOptions && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 shadow-sm z-50">
          <div className="p-2 border-b border-gray-200">
            <p className="text-xs text-gray-600">Select Wallet</p>
          </div>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => {
                connect({ connector });
                setShowConnectorOptions(false);
              }}
              disabled={!connector.ready}
              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connector.name}
              {!connector.ready && ' (unavailable)'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
