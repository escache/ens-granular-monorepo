import { useChainId } from 'wagmi';
import { formatAddress } from '../utils/validation';

interface TransactionStatusProps {
  hash?: `0x${string}`;
  isPending?: boolean;
  isConfirming?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  error?: Error | null;
}

export function TransactionStatus({ 
  hash, 
  isPending, 
  isConfirming, 
  isSuccess, 
  isError, 
  error 
}: TransactionStatusProps) {
  const chainId = useChainId();
  
  const getExplorerUrl = (txHash: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      11155111: 'https://sepolia.etherscan.io/tx/',
      31337: '#',
    };
    return `${explorers[chainId] || 'https://etherscan.io/tx/'}${txHash}`;
  };

  if (isPending || isConfirming) {
    return (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          {isPending ? 'Waiting for transaction...' : 'Confirming transaction...'}
        </p>
      </div>
    );
  }

  if (isError && error) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm font-medium text-red-800">Transaction Failed</p>
        <p className="text-sm text-red-700 mt-1">{error.message}</p>
      </div>
    );
  }

  if (isSuccess && hash) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm font-medium text-green-800">Transaction Confirmed</p>
        <a
          href={getExplorerUrl(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-green-700 hover:text-green-900 underline mt-1 inline-block font-mono"
        >
          View on Explorer: {formatAddress(hash, 10, 8)}
        </a>
      </div>
    );
  }

  return null;
}

