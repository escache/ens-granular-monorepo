import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function reverseResolve(address: `0x${string}`): Promise<string | null> {
  try {
    const name = await publicClient.getEnsName({ address });
    return name || null;
  } catch (error) {
    console.error('Failed to reverse resolve address:', error);
    return null;
  }
}

export async function resolveName(name: string): Promise<`0x${string}` | null> {
  try {
    const address = await publicClient.getEnsAddress({ name: name as `${string}.eth` });
    return address || null;
  } catch (error) {
    console.error('Failed to resolve ENS name:', error);
    return null;
  }
}

