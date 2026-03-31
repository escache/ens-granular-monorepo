import { useAccount, useChainId } from 'wagmi';
import { useAppContext } from '../contexts/AppContext';
import { LoadingSkeleton, CardSkeleton } from './LoadingSkeleton';
import { formatAddress } from '../utils/validation';

export function Dashboard() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { recentDomains, favoriteProjects } = useAppContext();

  const stats = [
    { label: 'Wallet', value: address ? formatAddress(address) : 'Not Connected' },
    { label: 'Network', value: chainId === 1 ? 'Mainnet' : chainId === 11155111 ? 'Sepolia' : `Chain ${chainId}` },
    { label: 'Domains', value: recentDomains.length.toString() },
    { label: 'Projects', value: favoriteProjects.length.toString() },
  ];

  return (
    <div>
      <div className="mb-lg">
        <h2 className="text-lg font-semibold m-0">ENS Management Overview</h2>
      </div>

      <div className="grid grid-cols-4 gap-md mb-lg">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="text-xs text-gray-600 uppercase font-semibold">{stat.label}</div>
            <div className="text-base font-semibold mt-xs">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-md">
        <div className="card">
          <div className="card-header">Recent Domains</div>
          {recentDomains.length > 0 ? (
            <div className="space-y-xs">
              {recentDomains.slice(0, 5).map((domain, index) => (
                <div key={index} className="px-sm py-xs border-b border-gray-100 text-xs">
                  {domain}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No recent domains</p>
          )}
        </div>

        <div className="card">
          <div className="card-header">Favorite Projects</div>
          {favoriteProjects.length > 0 ? (
            <div className="space-y-xs">
              {favoriteProjects.slice(0, 5).map((project, index) => (
                <div key={index} className="px-sm py-xs border-b border-gray-100 text-xs">
                  {project}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No favorite projects</p>
          )}
        </div>
      </div>
    </div>
  );
}
