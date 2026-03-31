import { useState, useEffect } from 'react';
import { useEstimateGas, useChainId } from 'wagmi';
import { formatUnits } from 'viem';

interface GasEstimationProps {
  address?: `0x${string}`;
  abi: any[];
  functionName: string;
  args?: any[];
  enabled?: boolean;
}

export function GasEstimation({ address, abi, functionName, args, enabled = true }: GasEstimationProps) {
  const chainId = useChainId();
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);

  const { data: gasEstimate, isLoading, error } = useEstimateGas({
    address,
    abi,
    functionName,
    args,
    query: {
      enabled: enabled && !!address && !!args,
    },
  });

  useEffect(() => {
    if (address && enabled) {
      fetch(`https://api.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=YourApiKeyToken`)
        .then(res => res.json())
        .then(data => {
          if (data.result) {
            setGasPrice(BigInt(data.result));
          }
        })
        .catch(() => {
        });
    }
  }, [address, enabled, chainId]);

  if (!enabled || !address) return null;

  if (isLoading) {
    return (
      <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
        Estimating gas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
        Could not estimate gas
      </div>
    );
  }

  if (!gasEstimate) return null;

  const gasCost = gasPrice ? (gasEstimate * gasPrice) : null;
  const gasCostEth = gasCost ? formatUnits(gasCost, 18) : null;

  return (
    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
      <div className="text-blue-800">
        <div>Estimated Gas: {gasEstimate.toString()}</div>
        {gasCostEth && (
          <div className="mt-1">
            Estimated Cost: ~{parseFloat(gasCostEth).toFixed(6)} ETH
          </div>
        )}
      </div>
    </div>
  );
}

