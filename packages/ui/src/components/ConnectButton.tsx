import { Connector } from 'wagmi';

interface ConnectButtonProps {
  isConnected: boolean;
  address?: string;
  connectors: readonly Connector[];
  connect: (args: { connector: Connector }) => void;
  disconnect: () => void;
}

export function ConnectButton({
  isConnected,
  address,
  connectors,
  connect,
  disconnect,
}: ConnectButtonProps) {
  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
}



